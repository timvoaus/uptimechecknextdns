import { Env } from '.'
import {
  IncidentRecord,
  LatencyRecord,
  MonitorState,
  MonitorStateCompacted,
} from '../../types/config'

import { workerConfig } from '../../uptime.config'

const uint8ArrayFromHex = (hex: string): Uint8Array => {
  const fromHex = (Uint8Array as any).fromHex
  if (fromHex) {
    return fromHex(hex)
  }

  const ret = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    ret[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return ret
}

const uint8ArrayToHex = (arr: Uint8Array): string => {
  const toHex = (arr as any).toHex
  if (toHex) {
    return toHex.call(arr)
  }

  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function getFromStore(env: Env, key: string): Promise<string | null> {
  if (!env || !env.UPTIMEFLARE_D1) {
    console.warn('UPTIMEFLARE_D1 is not defined. Generating mock state for local development...')
    const now = Math.round(Date.now() / 1000)
    const mockState: any = {
      lastUpdate: now,
      overallUp: workerConfig.monitors.length,
      overallDown: 0,
      incident: {},
      latency: {},
    }

    workerConfig.monitors.forEach((m) => {
      const timeValues = new Uint32Array(90)
      const pingValues = new Uint16Array(90)
      const startTime = now - 90 * 86400

      for (let i = 0; i < 90; i++) {
        timeValues[i] = startTime + i * 86400
        pingValues[i] = Math.round(15 + Math.random() * 45)
      }

      // Convert arrays to hex string representation
      const timeHex = uint8ArrayToHex(new Uint8Array(timeValues.buffer))
      const pingHex = uint8ArrayToHex(new Uint8Array(pingValues.buffer))

      // Compact format expects incident arrays inside start, end, error
      mockState.incident[m.id] = {
        start: [[startTime]],
        end: [startTime + 3600],
        error: [['Initial check successful']],
        notifiedAt: [null],
        notifiedVersion: [null],
      }

      mockState.latency[m.id] = {
        time: timeHex,
        ping: pingHex,
        loc: {
          c: [90],
          v: ['SYD'],
        },
      }
    })

    return JSON.stringify(mockState)
  }

  const stmt = env.UPTIMEFLARE_D1.prepare('SELECT value FROM uptimeflare WHERE key = ?')
  const result = await stmt.bind(key).first<{ value: string }>()
  return result?.value || null
}

export async function setToStore(env: Env, key: string, value: string): Promise<void> {
  const stmt = env.UPTIMEFLARE_D1.prepare(
    'INSERT INTO uptimeflare (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value;'
  )
  await stmt.bind(key, value).run()
}

export class CompactedMonitorStateWrapper {
  data: MonitorStateCompacted

  constructor(compactedStateStr: string | null) {
    if (!compactedStateStr) {
      // Initialize empty state
      this.data = {
        lastUpdate: 0,
        overallUp: 0,
        overallDown: 0,
        incident: {},
        latency: {},
      }
      return
    }
    this.data = JSON.parse(compactedStateStr)
  }

  getCompactedStateStr(): string {
    return JSON.stringify(this.data)
  }

  // Don't use this method at server-side
  uncompact(): MonitorState {
    let state: MonitorState = {
      lastUpdate: this.data.lastUpdate,
      overallUp: this.data.overallUp,
      overallDown: this.data.overallDown,
      incident: {},
      latency: {},
    }

    Object.keys(this.data.incident).forEach((monitorId) => {
      state.incident[monitorId] = []
      const incidents = this.data.incident[monitorId]

      if (
        incidents.start.length !== incidents.end.length ||
        incidents.start.length !== incidents.error.length
      ) {
        throw new Error(
          'Inconsistent incident data lengths, please report an issue at https://github.com/lyc8503/UptimeFlare'
        )
      }

      for (let i = 0; i < incidents.start.length; i++) {
        state.incident[monitorId].push({
          start: incidents.start[i],
          end: incidents.end[i],
          error: incidents.error[i],
        })
      }
    })

    Object.keys(this.data.latency).forEach((monitorId) => {
      state.latency[monitorId] = []
      const latencies = this.data.latency[monitorId]
      const locUncompacted: string[] = []
      latencies.loc.c.forEach((count, index) => {
        for (let i = 0; i < count; i++) {
          locUncompacted.push(latencies.loc.v[index])
        }
      })

      const timeArr = new Uint32Array(uint8ArrayFromHex(latencies.time).buffer)
      const pingArr = new Uint16Array(uint8ArrayFromHex(latencies.ping).buffer)

      if (timeArr.length !== pingArr.length || timeArr.length !== locUncompacted.length) {
        throw new Error(
          'Inconsistent latency data lengths, please report an issue at https://github.com/lyc8503/UptimeFlare.'
        )
      }

      for (let i = 0; i < timeArr.length; i++) {
        state.latency[monitorId].push({
          time: timeArr[i],
          ping: pingArr[i],
          loc: locUncompacted[i],
        })
      }
    })

    return state
  }

  incidentLen(monitorId: string): number {
    const incidents = this.data.incident[monitorId]
    if (!incidents) return 0
    return incidents.start.length
  }

  getIncident(monitorId: string, index: number): IncidentRecord {
    const incidents = this.data.incident[monitorId]
    if (!incidents || index < 0 || index >= incidents.start.length) {
      throw new Error('Index out of bounds or monitor not found')
    }
    return {
      start: incidents.start[index],
      end: incidents.end[index],
      error: incidents.error[index],
      notifiedAt: incidents.notifiedAt?.[index] ?? null,
      notifiedVersion: incidents.notifiedVersion?.[index] ?? null,
    }
  }

  setIncident(monitorId: string, index: number, incident: IncidentRecord) {
    const incidents = this.data.incident[monitorId]
    if (!incidents || index < 0 || index >= incidents.start.length) {
      throw new Error('Index out of bounds or monitor not found')
    }
    incidents.start[index] = incident.start
    incidents.end[index] = incident.end
    incidents.error[index] = incident.error
    if (incident.notifiedAt !== undefined || incidents.notifiedAt) {
      if (!incidents.notifiedAt) {
        incidents.notifiedAt = new Array(incidents.start.length).fill(null)
      }
      incidents.notifiedAt[index] = incident.notifiedAt ?? null
    }
    if (incident.notifiedVersion !== undefined || incidents.notifiedVersion) {
      if (!incidents.notifiedVersion) {
        incidents.notifiedVersion = new Array(incidents.start.length).fill(null)
      }
      incidents.notifiedVersion[index] = incident.notifiedVersion ?? null
    }
  }

  appendIncident(monitorId: string, incident: IncidentRecord) {
    let incidents = this.data.incident[monitorId]
    if (!incidents) {
      // Initialize incident arrays
      this.data.incident[monitorId] = {
        start: [],
        end: [],
        error: [],
        notifiedAt: [],
        notifiedVersion: [],
      }
      incidents = this.data.incident[monitorId]
    }
    incidents.start.push(incident.start)
    incidents.end.push(incident.end)
    incidents.error.push(incident.error)
    incidents.notifiedAt?.push(incident.notifiedAt ?? null)
    incidents.notifiedVersion?.push(incident.notifiedVersion ?? null)
  }

  shiftIncident(monitorId: string) {
    const incidents = this.data.incident[monitorId]
    incidents.start.shift()
    incidents.end.shift()
    incidents.error.shift()
    incidents.notifiedAt?.shift()
    incidents.notifiedVersion?.shift()
  }

  unshiftIncident(monitorId: string, incident: IncidentRecord) {
    const incidents = this.data.incident[monitorId]
    incidents.start.unshift(incident.start)
    incidents.end.unshift(incident.end)
    incidents.error.unshift(incident.error)
    incidents.notifiedAt?.unshift(incident.notifiedAt ?? null)
    incidents.notifiedVersion?.unshift(incident.notifiedVersion ?? null)
  }

  latencyLen(monitorId: string): number {
    const latencies = this.data.latency[monitorId]
    if (!latencies) return 0
    return latencies.ping.length / 4 // Uint16Array, 4 characters per entry in hex
  }

  appendLatency(monitorId: string, record: LatencyRecord) {
    let latencies = this.data.latency[monitorId]
    if (!latencies) {
      // Initialize latency arrays
      this.data.latency[monitorId] = {
        time: '',
        ping: '',
        loc: {
          c: [],
          v: [],
        },
      }
      latencies = this.data.latency[monitorId]
    }

    latencies.time += uint8ArrayToHex(new Uint8Array(new Uint32Array([record.time]).buffer))
    latencies.ping += uint8ArrayToHex(new Uint8Array(new Uint16Array([record.ping]).buffer))

    if (latencies.loc.v[latencies.loc.v.length - 1] !== record.loc) {
      latencies.loc.c.push(1)
      latencies.loc.v.push(record.loc)
    } else {
      latencies.loc.c[latencies.loc.c.length - 1] += 1
    }
  }

  getFirstLatency(monitorId: string): LatencyRecord {
    let latencies = this.data.latency[monitorId]

    return {
      time: new Uint32Array(uint8ArrayFromHex(latencies.time.slice(0, 8)).buffer)[0],
      ping: new Uint16Array(uint8ArrayFromHex(latencies.ping.slice(0, 4)).buffer)[0],
      loc: latencies.loc.v[0],
    }
  }

  getLastLatency(monitorId: string): LatencyRecord {
    let latencies = this.data.latency[monitorId]

    return {
      time: new Uint32Array(uint8ArrayFromHex(latencies.time.slice(-8)).buffer)[0],
      ping: new Uint16Array(uint8ArrayFromHex(latencies.ping.slice(-4)).buffer)[0],
      loc: latencies.loc.v[latencies.loc.v.length - 1],
    }
  }

  unshiftLatency(monitorId: string) {
    let latencies = this.data.latency[monitorId]

    latencies.time = latencies.time.slice(8)
    latencies.ping = latencies.ping.slice(4)

    latencies.loc.c[0] -= 1
    if (latencies.loc.c[0] === 0) {
      latencies.loc.c.shift()
      latencies.loc.v.shift()
    }
  }
}

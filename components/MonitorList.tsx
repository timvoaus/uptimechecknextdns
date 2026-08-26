import { MonitorState, MonitorTarget } from '@/types/config'
import { Accordion, Card, Center, Text } from '@mantine/core'
import MonitorDetail from './MonitorDetail'
import { pageConfig } from '@/uptime.config'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

function countDownCount(state: MonitorState, ids: string[]) {
  let downCount = 0
  for (let id of ids) {
    if (state.incident[id] === undefined || state.incident[id].length === 0) {
      continue
    }

    if (state.incident[id].slice(-1)[0].end === null) {
      downCount++
    }
  }
  return downCount
}

function getStatusTextColor(state: MonitorState, ids: string[]) {
  let downCount = countDownCount(state, ids)
  if (downCount === 0) {
    return 'var(--status-green)'
  } else if (downCount === ids.length) {
    return 'var(--status-red)'
  } else {
    return 'var(--status-orange)'
  }
}

export default function MonitorList({
  monitors,
  state,
}: {
  monitors: MonitorTarget[]
  state: MonitorState
}) {
  const { t } = useTranslation('common')
  const group = pageConfig.group
  const groupedMonitor = group && Object.keys(group).length > 0
  let content

  const [expandedGroups, setExpandedGroups] = useState<string[]>(Object.keys(group || {}))

  if (groupedMonitor) {
    // Grouped monitors
    content = (
      <Accordion
        multiple
        defaultValue={Object.keys(group)}
        variant="contained"
        transitionDuration={240}
        value={expandedGroups}
        onChange={(values) => setExpandedGroups(values)}
      >
        {Object.keys(group).map((groupName) => (
          <Accordion.Item key={groupName} value={groupName}>
            <Accordion.Control>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 16 }}>{groupName}</div>
                <Text
                  fw={600}
                  style={{
                    display: 'inline',
                    paddingRight: '5px',
                    color: getStatusTextColor(state, group[groupName]),
                  }}
                >
                  {group[groupName].length - countDownCount(state, group[groupName])}/
                  {group[groupName].length} {t('Operational')}
                </Text>
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="monitor-group-content">
                {monitors
                  .filter((monitor) => group[groupName].includes(monitor.id))
                  .sort((a, b) => group[groupName].indexOf(a.id) - group[groupName].indexOf(b.id))
                  .map((monitor) => (
                    <Card
                      key={monitor.id}
                      padding="md"
                      withBorder
                      style={{
                        width: '100%',
                        background: 'light-dark(rgba(255, 255, 255, 0.25), rgba(28, 28, 30, 0.25))',
                      }}
                    >
                      <MonitorDetail monitor={monitor} state={state} />
                    </Card>
                  ))}
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    )
  } else {
    // Ungrouped monitors
    content = monitors.map((monitor) => (
      <Card
        key={monitor.id}
        padding="lg"
        withBorder
        style={{ width: '100%' }}
      >
        <MonitorDetail monitor={monitor} state={state} />
      </Card>
    ))
  }

  return (
    <Center>
      {groupedMonitor ? (
        <div style={{ width: 'min(897px, calc(100vw - 32px))', marginLeft: '16px', marginRight: '16px', marginTop: '24px' }}>
          {content}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: 'min(865px, calc(100vw - 32px))', marginLeft: '16px', marginRight: '16px', marginTop: '24px' }}>
          {content}
        </div>
      )}
    </Center>
  )
}

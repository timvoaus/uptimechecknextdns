import Head from 'next/head'

import { Inter } from 'next/font/google'
import { MaintenanceConfig, MonitorTarget } from '@/types/config'
import { maintenances, pageConfig } from '@/uptime.config'
import Header from '@/components/Header'
import { Box, Center, Container, Group, Select } from '@mantine/core'
import Footer from '@/components/Footer'
import { useEffect, useState } from 'react'
import MaintenanceAlert from '@/components/MaintenanceAlert'
import NoIncidentsAlert from '@/components/NoIncidents'
import { useTranslation } from 'react-i18next'

export const runtime = 'experimental-edge'
const inter = Inter({ subsets: ['latin'] })

function getSelectedMonth() {
  if (typeof window === 'undefined') {
    const now = new Date()
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
  }
  const hash = window.location.hash.replace('#', '')
  if (!hash) {
    const now = new Date()
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
  }
  return hash.split('-').splice(0, 2).join('-')
}

function filterIncidentsByMonth(
  incidents: MaintenanceConfig[],
  monthStr: string,
  monitors: MonitorTarget[]
): (Omit<MaintenanceConfig, 'monitors'> & { monitors: MonitorTarget[] })[] {
  return incidents
    .filter((incident) => {
      const d = new Date(incident.start)
      const incidentMonth = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
      return incidentMonth === monthStr
    })
    .map((e) => ({
      ...e,
      monitors: (e.monitors || []).map((e) => monitors.find((mon) => mon.id === e)!),
    }))
    .sort((a, b) => (new Date(a.start) > new Date(b.start) ? -1 : 1))
}

function getPrevNextMonth(monthStr: string) {
  const [year, month] = monthStr.split('-').map(Number)
  const date = new Date(year, month - 1)
  const prev = new Date(date)
  prev.setMonth(prev.getMonth() - 1)
  const next = new Date(date)
  next.setMonth(next.getMonth() + 1)
  return {
    prev: prev.getFullYear() + '-' + String(prev.getMonth() + 1).padStart(2, '0'),
    next: next.getFullYear() + '-' + String(next.getMonth() + 1).padStart(2, '0'),
  }
}

/** iOS-style liquid glass pill button */
function GlassButton({
  onClick,
  href,
  children,
}: {
  onClick?: () => void
  href?: string
  children: React.ReactNode
}) {
  if (href) {
    return (
      <a
        href={href}
        className="incidents-glass-btn"
      >
        {children}
      </a>
    )
  }

  return (
    <button
      onClick={onClick}
      className="incidents-glass-btn"
    >
      {children}
    </button>
  )
}

export default function IncidentsPage({ monitors }: { monitors: MonitorTarget[] }) {
  const { t } = useTranslation('common')
  const [selectedMonitor, setSelectedMonitor] = useState<string | null>('')
  const [selectedMonth, setSelectedMonth] = useState(getSelectedMonth())

  useEffect(() => {
    const onHashChange = () => setSelectedMonth(getSelectedMonth())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const filteredIncidents = filterIncidentsByMonth(maintenances, selectedMonth, monitors)
  const monitorFilteredIncidents = selectedMonitor
    ? filteredIncidents.filter((i) => i.monitors.find((e) => e.id === selectedMonitor))
    : filteredIncidents

  const { prev, next } = getPrevNextMonth(selectedMonth)

  const monitorOptions = [
    { value: '', label: t('All') },
    ...monitors.map((monitor) => ({
      value: monitor.id,
      label: monitor.name,
    })),
  ]

  return (
    <>
      <Head>
        <title>{pageConfig.title}</title>
        <link rel="icon" href={pageConfig.favicon ?? '/favicon.png'} />
      </Head>

      <main className={inter.className} style={{ position: 'relative', zIndex: 1, minHeight: '100vh', paddingBottom: '40px' }}>
        <Header
          style={{
            marginBottom: '40px',
          }}
        />
        <Center>
          <Container size="md" style={{ width: '100%' }}>
            {/* Top row: Back button + Monitor filter */}
            <Group className="incidents-filter-row" justify="space-between" mb="md">
              <GlassButton href="/">
                {/* Back chevron */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                {t('Back to Dashboard')}
              </GlassButton>
              <Select
                placeholder={t('Select monitor')}
                data={monitorOptions}
                value={selectedMonitor}
                onChange={setSelectedMonitor}
                clearable
                style={{ maxWidth: 300 }}
              />
            </Group>
            <Box>
              {monitorFilteredIncidents.length === 0 ? (
                <NoIncidentsAlert />
              ) : (
                monitorFilteredIncidents.map((incident, i) => (
                  <MaintenanceAlert key={i} maintenance={incident} />
                ))
              )}
            </Box>

            {/* Bottom row: month navigation */}
            <Group className="incidents-month-nav" justify="space-between" mt="md" align="center">
              <GlassButton onClick={() => (window.location.hash = prev)}>
                {/* Left arrow */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                {t('Backwards')}
              </GlassButton>

              {/* Month badge */}
              <div className="incidents-month-badge">
                {selectedMonth}
              </div>

              <GlassButton onClick={() => (window.location.hash = next)}>
                {t('Forward')}
                {/* Right arrow */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </GlassButton>
            </Group>
          </Container>
        </Center>
        <Footer />
      </main>
    </>
  )
}

export async function getServerSideProps(context: any) {
  if (context?.res?.setHeader) {
    context.res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  }
  const { workerConfig } = await import('@/uptime.config')
  // Only present these values to client
  const monitors: MonitorTarget[] = workerConfig.monitors.map((monitor) => ({
    id: monitor.id,
    name: monitor.name,
  })) as MonitorTarget[]
  return { props: { monitors } }
}

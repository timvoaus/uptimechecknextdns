import { Alert, List, Text, useMantineTheme } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconAlertTriangle } from '@tabler/icons-react'
import { MaintenanceConfig, MonitorTarget } from '@/types/config'
import { pageConfig } from '@/uptime.config'
import { useTranslation } from 'react-i18next'

export default function MaintenanceAlert({
  maintenance,
  style,
  upcoming = false,
}: {
  maintenance: Omit<MaintenanceConfig, 'monitors'> & { monitors?: (MonitorTarget | undefined)[] }
  style?: React.CSSProperties
  upcoming?: boolean
}) {
  const { t } = useTranslation('common')
  const theme = useMantineTheme()
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`)

  const colorVal = upcoming ? pageConfig.maintenances?.upcomingColor ?? 'gray' : maintenance.color || 'yellow'
  let borderLeftColor = 'var(--status-gray)'
  if (colorVal === 'yellow' || colorVal === 'orange') {
    borderLeftColor = 'var(--status-orange)'
  } else if (colorVal === 'red') {
    borderLeftColor = 'var(--status-red)'
  }

  return (
    <Alert
      icon={<IconAlertTriangle style={{ color: borderLeftColor }} />}
      title={
        <span
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          {(upcoming ? t('Upcoming') : '') + (maintenance.title || t('Scheduled Maintenance'))}
        </span>
      }
      color={colorVal}
      withCloseButton={false}
      style={{
        margin: '16px auto 0 auto',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px) saturate(190%)',
        WebkitBackdropFilter: 'blur(24px) saturate(190%)',
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        borderLeft: `5px solid ${borderLeftColor}`,
        boxShadow: 'var(--glass-shadow)',
        borderRadius: '16px',
        color: 'var(--text-primary)',
        ...style,
      }}
    >
      {/* Date range in top right (desktop) or inline (mobile) */}
      <div
        style={{
          ...{
            top: 10,
            fontSize: '0.85rem',
            borderRadius: 6,
          },
          ...(isDesktop
            ? {
                position: 'absolute',
                right: 10,
                padding: '2px 8px',
                textAlign: 'right',
              }
            : { marginBottom: 4 }),
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gridColumnGap: '3px',
          }}
        >
          <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
            {upcoming ? t('Scheduled for') : t('From')}
          </div>
          <div>{new Date(maintenance.start).toLocaleString()}</div>
          <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
            {upcoming ? t('Expected end') : t('To')}
          </div>
          <div>
            {maintenance.end
              ? new Date(maintenance.end).toLocaleString()
              : t('Until further notice')}
          </div>
        </div>
      </div>

      <Text style={{ paddingTop: '3px', whiteSpace: 'pre-line' }}>{maintenance.body}</Text>
      {maintenance.monitors && maintenance.monitors.length > 0 && (
        <>
          <Text mt="xs">
            <b>{t('Affected components')}</b>
          </Text>
          <List size="sm" withPadding>
            {maintenance.monitors.map((comp, compIdx) => (
              <List.Item key={compIdx}>{comp?.name ?? t('MONITOR ID NOT FOUND')}</List.Item>
            ))}
          </List>
        </>
      )}
    </Alert>
  )
}

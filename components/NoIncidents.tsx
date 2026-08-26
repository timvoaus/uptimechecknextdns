import { Alert, Text } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'

export default function NoIncidentsAlert({ style }: { style?: React.CSSProperties }) {
  const { t } = useTranslation('common')
  return (
    <Alert
      className="incident-empty-card"
      icon={<IconInfoCircle style={{ color: 'var(--text-secondary)' }} />}
      title={
        <span
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          {t('No incidents in this month')}
        </span>
      }
      color="gray"
      withCloseButton={false}
      style={{
        position: 'relative',
        margin: '16px auto 0 auto',
        color: 'var(--text-primary)',
        ...style,
      }}
    >
      <Text style={{ color: 'var(--text-secondary)' }}>{t('There are no incidents for this month')}</Text>
    </Alert>
  )
}

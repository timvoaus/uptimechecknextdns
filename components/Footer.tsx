import { pageConfig } from '@/uptime.config'
import { ActionIcon, useMantineColorScheme, useComputedColorScheme, Center } from '@mantine/core'
import { IconSun, IconMoon } from '@tabler/icons-react'

export default function Footer() {
  const { setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')
  }

  const defaultFooter =
    '<p style="text-align: center; font-size: 12px; margin-top: 16px; color: var(--text-secondary); opacity: 0.8;"> Open-source monitoring and status page powered by <a href="https://github.com/lyc8503/UptimeFlare" target="_blank" style="color: inherit; text-decoration: underline;">Uptimeflare</a>, made with ❤ by <a href="https://github.com/lyc8503" target="_blank" style="color: inherit; text-decoration: underline;">lyc8503</a>. </p>'

  let footerHtml = pageConfig.customFooter ?? defaultFooter
  if (footerHtml.includes('lyc8503</a>.')) {
    footerHtml = footerHtml.replace('lyc8503</a>.', 'lyc8503</a>, modified by Tim.')
  } else if (footerHtml.includes('lyc8503</a>')) {
    footerHtml = footerHtml.replace('lyc8503</a>', 'lyc8503</a>, modified by Tim')
  } else if (footerHtml.endsWith('</p>')) {
    footerHtml = footerHtml.replace('</p>', ', modified by Tim</p>')
  } else {
    footerHtml = footerHtml + ', modified by Tim'
  }

  return (
    <footer style={{ marginTop: '48px', paddingBottom: '24px' }}>
      <Center>
        <ActionIcon
          onClick={toggleColorScheme}
          variant="default"
          size="lg"
          aria-label="Toggle color scheme"
          style={{
            borderRadius: '999px',
            background: 'light-dark(rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.08))',
            border: '1px solid light-dark(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.08))',
            color: 'var(--text-primary)',
            boxShadow: 'inset 0 1px 0px light-dark(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.08))',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
        >
          {computedColorScheme === 'dark' ? (
            <IconSun style={{ width: '18px', height: '18px' }} stroke={1.5} />
          ) : (
            <IconMoon style={{ width: '18px', height: '18px' }} stroke={1.5} />
          )}
        </ActionIcon>
      </Center>
      <div dangerouslySetInnerHTML={{ __html: footerHtml }} />
    </footer>
  )
}

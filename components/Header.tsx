import { Container, Group, Image, useComputedColorScheme } from '@mantine/core'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { ThinkingOrb } from 'thinking-orbs'
import classes from '@/styles/Header.module.css'
import { pageConfig } from '@/uptime.config'
import { PageConfigLink } from '@/types/config'
import { useTranslation } from 'react-i18next'

export default function Header({ style }: { style?: React.CSSProperties }) {
  const { t } = useTranslation('common')
  const router = useRouter()
  const computedColorScheme = useComputedColorScheme('light')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isRefreshing) return
    setIsRefreshing(true)

    const startTime = Date.now()
    try {
      const nextQuery = { ...router.query, _t: Date.now().toString() }
      await router.replace(
        { pathname: router.pathname, query: nextQuery },
        router.pathname,
        { scroll: false }
      )
    } catch (err) {
      console.error('Refresh error:', err)
    } finally {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 750 - elapsed)
      setTimeout(() => {
        setIsRefreshing(false)
      }, remaining)
    }
  }

  const linkToElement = (link: PageConfigLink, i: number) => {
    const isActive =
      (link.link === '/' && router.pathname === '/') ||
      (link.link !== '/' && router.pathname.startsWith(link.link))

    return (
      <a
        key={i}
        href={link.link}
        target={link.link.startsWith('/') ? undefined : '_blank'}
        className={classes.link}
        data-active={isActive ? 'true' : undefined}
      >
        {link.label}
      </a>
    )
  }

  const links = [{ label: t('Incidents'), link: '/incidents' }, ...(pageConfig.links || [])]

  return (
    <header className={classes.header} style={style}>
      <Container size="md" className={classes.inner}>
        <div className={classes.logoWrapper}>
          <button
            type="button"
            className={classes.logoButton}
            onClick={handleRefresh}
            title={t('Refresh')}
            aria-label={t('Refresh')}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <div className={classes.logoOrbContainer}>
                <ThinkingOrb
                  state="composing"
                  size={64}
                  speed={3.00}
                  theme={computedColorScheme === 'dark' ? 'dark' : 'light'}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingLeft: 18 }}>
                <Image
                  src={pageConfig.logo ?? '/logo.svg'}
                  h={48}
                  w={{ base: 118, sm: 180 }}
                  fit="contain"
                  alt="logo"
                />
              </div>
            )}
          </button>
        </div>

        <Group gap={5} visibleFrom="sm">
          {links?.map(linkToElement)}
        </Group>

        <Group gap={5} hiddenFrom="sm">
          {links?.filter((link) => link.highlight || link.link.startsWith('/')).map(linkToElement)}
        </Group>
      </Container>
    </header>
  )
}


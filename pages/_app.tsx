import '@mantine/core/styles.css'
import '@/styles/global.css'
import { useEffect } from 'react'
import type { AppProps } from 'next/app'
import { MantineProvider, createTheme } from '@mantine/core'
import NoSsr from '@/components/NoSsr'
import '@/util/i18n'

const theme = createTheme({
  fontFamily: 'var(--font-family)',
})

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.warn('Service worker registration failed', error)
      })
    }
  }, [])

  return (
    <NoSsr>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <Component {...pageProps} />
      </MantineProvider>
    </NoSsr>
  )
}

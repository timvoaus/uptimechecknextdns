import { ThinkingOrb } from 'thinking-orbs'
import classes from '@/styles/Header.module.css'

export default function RefreshOverlay({
  label = 'Refreshing page',
  theme,
}: {
  label?: string
  theme?: 'light' | 'dark'
}) {
  return (
    <div
      className={classes.refreshOverlay}
      data-theme={theme}
      role="status"
      aria-live="polite"
    >
      <div className={classes.refreshPanel}>
        <ThinkingOrb
          state="composing"
          size={64}
          speed={3}
          theme={theme ?? 'auto'}
          aria-hidden="true"
        />
        <span>{label}</span>
      </div>
    </div>
  )
}

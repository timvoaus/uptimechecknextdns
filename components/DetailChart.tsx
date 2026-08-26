import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  TimeScale,
  Filler,
} from 'chart.js'
import 'chartjs-adapter-moment'
import { MonitorState, MonitorTarget } from '@/types/config'
import { codeToCountry } from '@/util/iata'
import { useTranslation } from 'react-i18next'
import { useComputedColorScheme } from '@mantine/core'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  TimeScale,
  Filler
)

const externalTooltipHandler = (context: any) => {
  const { chart, tooltip } = context
  let tooltipEl = document.getElementById('chartjs-global-tooltip')

  if (!tooltipEl) {
    tooltipEl = document.createElement('div')
    tooltipEl.id = 'chartjs-global-tooltip'
    tooltipEl.className = 'chartjs-tooltip'
    document.body.appendChild(tooltipEl)
  }

  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = '0'
    tooltipEl.style.transform = 'translate(0, calc(-100% - 14px)) scale(0.92)'
    tooltipEl.classList.remove('visible')
    return
  }

  if (tooltip.body) {
    const titleLines = tooltip.title || []
    const bodyLines = tooltip.body.map((b: any) => b.lines).flat()

    let innerHtml = ''

    titleLines.forEach((title: string) => {
      innerHtml += `<div class="chartjs-tooltip-title">${title}</div>`
    })

    bodyLines.forEach((body: string) => {
      innerHtml += `<div class="chartjs-tooltip-body">${body}</div>`
    })

    tooltipEl.innerHTML = innerHtml
  }

  // Get absolute viewport coordinates of the canvas
  const rect = chart.canvas.getBoundingClientRect()
  const positionX = rect.left + window.scrollX
  const positionY = rect.top + window.scrollY

  tooltipEl.style.opacity = '1'

  // Calculate dynamic left position keeping tooltip inside chart bounds
  const chartWidth = rect.width
  const tooltipWidth = tooltipEl.offsetWidth || 280
  const targetCenter = positionX + tooltip.caretX

  let leftEdge = targetCenter - tooltipWidth / 2

  const minLeft = positionX + 8
  const maxLeft = positionX + chartWidth - tooltipWidth - 8

  if (chartWidth > tooltipWidth + 16) {
    leftEdge = Math.max(minLeft, Math.min(maxLeft, leftEdge))
  } else {
    leftEdge = positionX + (chartWidth - tooltipWidth) / 2
  }

  tooltipEl.style.left = leftEdge + 'px'
  tooltipEl.style.top = positionY + tooltip.caretY + 'px'
  tooltipEl.classList.add('visible')
}

export default function DetailChart({
  monitor,
  state,
}: {
  monitor: MonitorTarget
  state: MonitorState
}) {
  const { t } = useTranslation('common')
  const computedColorScheme = useComputedColorScheme('light')
  const isDark = computedColorScheme === 'dark'

  const latencyData = state.latency[monitor.id].map((point) => ({
    x: point.time * 1000,
    y: point.ping,
    loc: point.loc,
  }))

  let data = {
    datasets: [
      {
        data: latencyData,
        borderColor: 'rgba(59, 130, 246, 0.85)',
        borderWidth: 1.25,
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        radius: 0,
        cubicInterpolationMode: 'monotone' as const,
        tension: 0.4,
      },
    ],
  }

  let options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 0,
        right: 4,
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    animation: {
      duration: 300,
    },
    plugins: {
      tooltip: {
        enabled: false,
        external: externalTooltipHandler,
        callbacks: {
          label: (item: any) => {
            if (item.parsed.y) {
              return `${item.parsed.y}ms (${codeToCountry(item.raw.loc)})`
            }
          },
        },
      },
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: t('Response times'),
        align: 'start' as const,
        color: isDark ? '#cbd5e1' : 'var(--text-secondary)',
        font: {
          family: 'var(--font-family)',
          size: 13,
          weight: '600',
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        ticks: {
          source: 'auto' as const,
          maxRotation: 0,
          autoSkip: true,
          color: isDark ? 'rgba(226, 232, 240, 0.96)' : 'var(--text-secondary)',
          padding: 8,
          font: { family: 'var(--font-family)', size: 11, weight: isDark ? '600' : '500' },
        },
        grid: {
          display: true,
          drawOnChartArea: true,
          drawTicks: true,
          tickLength: 6,
          tickWidth: 1,
          tickColor: isDark ? 'rgba(226, 232, 240, 0.52)' : 'rgba(100, 116, 139, 0.32)',
          color: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(128, 128, 128, 0.07)',
        },
        border: {
          display: true,
          color: isDark ? 'rgba(226, 232, 240, 0.34)' : 'rgba(100, 116, 139, 0.22)',
        },
      },
      y: {
        ticks: {
          color: isDark ? 'rgba(226, 232, 240, 0.96)' : 'var(--text-secondary)',
          padding: 8,
          font: { family: 'var(--font-family)', size: 11, weight: isDark ? '600' : '500' },
        },
        grid: {
          display: true,
          drawOnChartArea: true,
          drawTicks: true,
          tickLength: 6,
          tickWidth: 1,
          tickColor: isDark ? 'rgba(226, 232, 240, 0.52)' : 'rgba(100, 116, 139, 0.32)',
          color: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(128, 128, 128, 0.1)',
        },
        border: {
          display: true,
          color: isDark ? 'rgba(226, 232, 240, 0.34)' : 'rgba(100, 116, 139, 0.22)',
        },
      },
    },
  }

  return (
    <div style={{ height: '150px', position: 'relative' }}>
      <Line options={options} data={data} />
    </div>
  )
}

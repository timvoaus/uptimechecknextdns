function getColor(percent: number | string, darker: boolean): string {
  percent = Number(percent)
  if (percent >= 99.9) {
    return 'var(--status-green)'
  } else if (percent >= 99) {
    return 'var(--status-green)'
  } else if (percent >= 95) {
    return 'var(--status-orange)'
  } else if (Number.isNaN(percent)) {
    return 'var(--status-gray)'
  } else {
    return 'var(--status-red)'
  }
}

export default getColor
export { getColor }

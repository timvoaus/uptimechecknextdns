export function ServerRackGraphic({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <g className="server-rack" transform={`translate(${x} ${y})`}>
      <rect className="server-frame" width="154" height="248" rx="22" />
      {[22, 74, 126, 178].map((unitY, index) => (
        <g className="server-unit" transform={`translate(15 ${unitY})`} key={unitY}>
          <rect width="124" height="38" rx="9" />
          <circle cx="18" cy="19" r="4" />
          <circle cx="33" cy="19" r="4" />
          <path d="M55 14 H109 M55 24 H96" />
          <circle className="server-led" cx="112" cy="19" r="3">
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur={`${1.8 + index * 0.35}s`}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}
      <path className="server-base" d="M34 248 V264 M120 248 V264 M20 264 H134" />
    </g>
  )
}

export default function ServerRackIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 154 264"
      preserveAspectRatio="xMidYMid meet"
      role="presentation"
    >
      <ServerRackGraphic />
    </svg>
  )
}

import type { ActivityDay } from '../features/progress/analytics.ts'

const BAR = 20
const GAP = 8
const HEIGHT = 96
const TOP = 16

/** Attempts per day. The same numbers are available as a table for assistive technology. */
export function ActivityChart({ days }: { days: ActivityDay[] }) {
  const max = Math.max(1, ...days.map((d) => d.attempts))
  const total = days.reduce((sum, d) => sum + d.attempts, 0)
  const width = days.length * (BAR + GAP) - GAP

  return (
    <figure className="chart">
      <svg
        viewBox={`0 0 ${width} ${TOP + HEIGHT + 22}`}
        role="img"
        aria-label={`Attempts per day over the last ${days.length} days: ${total} in total.`}
        className="chart-svg"
      >
        <line x1="0" x2={width} y1={TOP + HEIGHT} y2={TOP + HEIGHT} className="chart-axis" />
        {days.map((day, i) => {
          const barHeight = (day.attempts / max) * HEIGHT
          const x = i * (BAR + GAP)
          return (
            <g key={day.day}>
              {day.attempts > 0 && (
                <>
                  <rect
                    x={x}
                    y={TOP + HEIGHT - barHeight}
                    width={BAR}
                    height={barHeight}
                    rx="3"
                    className="chart-bar"
                  />
                  <text x={x + BAR / 2} y={TOP + HEIGHT - barHeight - 4} className="chart-value">
                    {day.attempts}
                  </text>
                </>
              )}
              {(i === 0 || i === days.length - 1 || i === Math.floor(days.length / 2)) && (
                <text x={x + BAR / 2} y={TOP + HEIGHT + 15} className="chart-label">
                  {day.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <details className="chart-table">
        <summary>View the numbers as a table</summary>
        <table>
          <caption className="visually-hidden">Attempts per day</caption>
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">Attempts</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day.day}>
                <th scope="row">{day.label}</th>
                <td>{day.attempts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}

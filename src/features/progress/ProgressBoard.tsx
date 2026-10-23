import { ActivityChart } from '../../components/ActivityChart.tsx'
import { EmptyState } from '../../components/EmptyState.tsx'
import { StatusChip, type ChipStatus } from '../../components/StatusChip.tsx'
import type { Summary } from './analytics.ts'
import { plural } from './format.ts'
import type { EvidenceStatus } from './evidence.ts'

const EVIDENCE_CHIP: Record<EvidenceStatus, { status: ChipStatus; label: string }> = {
  secure: { status: 'available', label: 'Secure' },
  developing: { status: 'in-development', label: 'Developing' },
  'needs-attention': { status: 'attention', label: 'Needs attention' },
  'not-assessed': { status: 'planned', label: 'Not assessed' },
}

const percent = (value: number | null) => (value === null ? '–' : `${Math.round(value * 100)}%`)

/** The student's analytics. Every figure comes from recorded attempts; nothing is estimated. */
export function ProgressBoard({
  summary,
  sessionsPerWeek,
}: {
  summary: Summary
  sessionsPerWeek: number
}) {
  const goalMet = summary.activeDaysThisWeek >= sessionsPerWeek

  return (
    <div className="board">
      <ul className="index-cards">
        <li className="index-card">
          <p className="index-label">Attempts</p>
          <p className="index-value">{summary.totalAttempts}</p>
          <p className="index-foot">{plural(summary.scenariosAttempted, 'different scenario')}</p>
        </li>
        <li className="index-card">
          <p className="index-label">Accuracy</p>
          <p className="index-value">{percent(summary.accuracy)}</p>
          <p className="index-foot">
            {summary.totalAttempts
              ? `${summary.correct} of ${summary.totalAttempts} correct`
              : 'No attempts yet'}
          </p>
        </li>
        <li className="index-card">
          <p className="index-label">Study streak</p>
          <p className="index-value">
            {summary.currentStreak}
            <span className="index-unit"> {summary.currentStreak === 1 ? 'day' : 'days'}</span>
          </p>
          <p className="index-foot">{plural(summary.studyDays, 'study day')} in total</p>
        </li>
        <li className="index-card">
          <p className="index-label">Hints per attempt</p>
          <p className="index-value">
            {summary.averageHints === null ? '–' : summary.averageHints.toFixed(1)}
          </p>
          <p className="index-foot">Lower means more independent</p>
        </li>
      </ul>

      <section aria-labelledby="week-heading" className="board-block">
        <h3 id="week-heading">This week</h3>
        <progress
          className="meter"
          max={sessionsPerWeek}
          value={Math.min(summary.activeDaysThisWeek, sessionsPerWeek)}
          aria-labelledby="week-heading"
          aria-valuetext={`${summary.activeDaysThisWeek} of ${sessionsPerWeek} study days`}
        />
        <p className="hint">
          {summary.activeDaysThisWeek} of {sessionsPerWeek} study days
          {goalMet ? ': goal reached.' : '.'}
        </p>
      </section>

      <section aria-labelledby="activity-heading" className="board-block">
        <h3 id="activity-heading">Last 14 days</h3>
        <ActivityChart days={summary.activity} />
      </section>

      <section aria-labelledby="evidence-heading" className="board-block">
        <h3 id="evidence-heading">Objective evidence</h3>
        <p className="hint">
          This shows what you have practised in CloudQuest. It is not a prediction of an exam
          result.
        </p>
        <ul className="row-list evidence-list">
          {summary.objectives.map((objective) => {
            const chip = EVIDENCE_CHIP[objective.status]
            return (
              <li key={objective.objectiveId}>
                <div className="evidence-main">
                  <p className="row-title">{objective.title}</p>
                  {objective.availableScenarios > 0 ? (
                    <>
                      <progress
                        className="meter"
                        max={objective.availableScenarios}
                        value={objective.independentScenarios}
                        aria-label={`${objective.title}: scenarios answered correctly without hints`}
                        aria-valuetext={`${objective.independentScenarios} of ${objective.availableScenarios} scenarios`}
                      />
                      <p className="row-sub">
                        {objective.independentScenarios} of {objective.availableScenarios}{' '}
                        {objective.availableScenarios === 1 ? 'scenario' : 'scenarios'} answered
                        correctly without hints
                        {objective.attempts > 0 && ` · ${plural(objective.attempts, 'attempt')}`}
                      </p>
                    </>
                  ) : (
                    <p className="row-sub">No scenarios cover this objective yet.</p>
                  )}
                  {objective.limitedContent && objective.availableScenarios > 0 && (
                    <p className="row-sub">
                      Only {objective.availableScenarios}{' '}
                      {objective.availableScenarios === 1 ? 'scenario covers' : 'scenarios cover'}{' '}
                      this so far, so it cannot be marked secure yet.
                    </p>
                  )}
                </div>
                <StatusChip status={chip.status} label={chip.label} />
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="misconceptions-heading" className="board-block">
        <h3 id="misconceptions-heading">Misconceptions to watch</h3>
        {summary.misconceptions.length === 0 ? (
          <EmptyState title="No mistakes recorded">
            When an answer is wrong, the idea behind it will be listed here.
          </EmptyState>
        ) : (
          <ul className="row-list">
            {summary.misconceptions.map((misconception) => (
              <li key={misconception.tag}>
                <p className="row-title">{misconception.label}</p>
                <span className="count-badge">
                  {misconception.count}×<span className="visually-hidden"> chosen</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

import { useEffect, useReducer, useRef } from 'react'
import { ButtonLink } from '../../components/ButtonLink.tsx'
import { Icon } from '../../components/Icon.tsx'
import { PageHeading } from '../../components/PageHeading.tsx'
import { TornPage } from '../../components/TornPage.tsx'
import type { ContentPack, Scenario, ScenarioOption } from '../../domain/content.ts'
import { evaluateScenario, type Evaluation } from './evaluate.ts'
import { initialRunnerState, runnerReducer, type RunnerAction, type RunnerState } from './runner.ts'

const DIFFICULTY = {
  intro: 'Introductory',
  intermediate: 'Intermediate',
  stretch: 'Stretch',
} as const

interface ScenarioRunnerProps {
  pack: ContentPack
  scenario: Scenario
  labHref: string
  /** Link to the fresh-context variant, when the scenario has one. */
  transferHref?: string
  /** Called once, when the learner submits a decision. */
  onAttempt?: (result: { evaluation: Evaluation; hintsUsed: number }) => void
  /** Lets the learner keep this concept for spaced review. */
  revision?: { added: boolean; onAdd: (evaluation: Evaluation) => void; studioHref: string }
}

/** One attempt at one scenario. Mount it with `key={scenario.id}` so each scenario starts fresh. */
export function ScenarioRunner({
  pack,
  scenario,
  labHref,
  transferHref,
  onAttempt,
  revision,
}: ScenarioRunnerProps) {
  const [state, dispatch] = useReducer(
    (current: RunnerState, action: RunnerAction) => runnerReducer(scenario, current, action),
    initialRunnerState,
  )
  const feedbackHeading = useRef<HTMLHeadingElement>(null)
  const evaluation = state.phase === 'reviewed' ? state.evaluation : null

  // Moving focus to the feedback announces the outcome to screen readers and keeps keyboard
  // users at the result instead of on a control that has just disappeared.
  useEffect(() => {
    if (evaluation) feedbackHeading.current?.focus()
  }, [evaluation])

  const optionById = (id: string) => scenario.options.find((option) => option.id === id)
  const rationale = (id: string) => scenario.optionRationales?.[id]
  const revealedHints = scenario.hints.slice(0, state.hintsRevealed)
  const allHintsShown = state.hintsRevealed >= scenario.hints.length
  const objectives = pack.objectives.filter((objective) =>
    scenario.objectiveIds.includes(objective.id),
  )

  const chosen = evaluation ? optionById(evaluation.selectedOptionId) : undefined
  const best = evaluation ? optionById(evaluation.correctOptionId) : undefined
  const otherOptions = evaluation
    ? scenario.options.filter(
        (option) =>
          option.id !== evaluation.selectedOptionId && option.id !== evaluation.correctOptionId,
      )
    : []

  const optionClass = (option: ScenarioOption): string => {
    if (!evaluation) return 'option'
    if (option.id === evaluation.correctOptionId) return 'option option-best'
    if (option.id === evaluation.selectedOptionId) return 'option option-wrong'
    return 'option'
  }

  return (
    <article className="runner">
      <p className="back-link">
        <a href={labHref}>← Back to Scenario Lab</a>
      </p>

      {scenario.status !== 'reviewed' && (
        <p className="notice" role="note">
          <strong>Draft preview.</strong> This scenario was written for CloudQuest but has not been
          reviewed against official documentation. Treat it as unverified and check the sources
          before relying on it.
        </p>
      )}

      <PageHeading kicker="Scenario Lab" title={scenario.title}>
        {DIFFICULTY[scenario.difficulty]} · about {scenario.estimatedMinutes} min
      </PageHeading>

      <div className="quiz-card">
        <p className="quiz-meta">
          <span>{objectives.map((objective) => objective.title).join(' · ')}</span>
        </p>

        <section aria-labelledby="situation-heading">
          <h2 id="situation-heading">Situation</h2>
          <p>{scenario.context}</p>
        </section>

        {scenario.constraints.length > 0 && (
          <section aria-labelledby="constraints-heading">
            <h2 id="constraints-heading">Constraints</h2>
            <ul className="bullet-list">
              {scenario.constraints.map((constraint) => (
                <li key={constraint}>{constraint}</li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="task-heading">
          <h2 id="task-heading">Your task</h2>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              if (state.phase !== 'answering' || state.selectedOptionId === null) return
              const result = evaluateScenario(scenario, state.selectedOptionId)
              if (!result) return
              // Recording happens here, in the event handler, so it runs exactly once per submit.
              onAttempt?.({ evaluation: result, hintsUsed: state.hintsRevealed })
              dispatch({ type: 'submit' })
            }}
          >
            <fieldset disabled={evaluation !== null}>
              <legend>{scenario.task}</legend>
              {scenario.options.map((option, index) => (
                <label key={option.id} className={optionClass(option)}>
                  <input
                    type="radio"
                    name={`${scenario.id}-option`}
                    value={option.id}
                    checked={state.selectedOptionId === option.id}
                    onChange={() => dispatch({ type: 'select', optionId: option.id })}
                  />
                  <span className="option-letter" aria-hidden="true">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="option-text">
                    {option.label}
                    {evaluation && option.id === evaluation.correctOptionId && (
                      <span className="option-tag option-tag-best">✓ Best fit</span>
                    )}
                    {evaluation &&
                      option.id === evaluation.selectedOptionId &&
                      evaluation.outcome === 'incorrect' && (
                        <span className="option-tag">Your choice</span>
                      )}
                  </span>
                </label>
              ))}
            </fieldset>

            {scenario.hints.length > 0 && (!evaluation || revealedHints.length > 0) && (
              <div className="hints">
                <h3>Hints</h3>
                <ol className="hint-list" aria-live="polite">
                  {revealedHints.map((hint) => (
                    <li key={hint.order}>{hint.text}</li>
                  ))}
                </ol>
                {!evaluation && (
                  <>
                    <button
                      type="button"
                      className="button button-secondary"
                      disabled={allHintsShown}
                      onClick={() => dispatch({ type: 'reveal-hint' })}
                    >
                      {state.hintsRevealed === 0
                        ? 'Show a hint'
                        : allHintsShown
                          ? 'No more hints'
                          : 'Show another hint'}
                    </button>
                    <p className="hint">
                      {state.hintsRevealed} of {scenario.hints.length} hints shown
                    </p>
                  </>
                )}
              </div>
            )}

            {!evaluation && (
              <div className="runner-actions">
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={state.selectedOptionId === null}
                >
                  Submit decision
                </button>
                {state.selectedOptionId === null && (
                  <p className="hint">Choose an option to continue.</p>
                )}
              </div>
            )}
          </form>
        </section>
      </div>

      {evaluation && chosen && best && (
        <section
          className={`feedback feedback-${evaluation.outcome}`}
          aria-labelledby="feedback-heading"
        >
          <h2 id="feedback-heading" tabIndex={-1} ref={feedbackHeading}>
            <span aria-hidden="true">{evaluation.outcome === 'correct' ? '✓' : '✗'}</span>{' '}
            {evaluation.outcome === 'correct' ? 'Correct' : 'Not quite'}
          </h2>

          <p>
            <strong>Your choice:</strong> {chosen.label}
          </p>
          {evaluation.rationale && <p>{evaluation.rationale}</p>}

          {evaluation.outcome === 'incorrect' && (
            <>
              <p>
                <strong>Best fit:</strong> {best.label}
              </p>
              {rationale(best.id) && <p>{rationale(best.id)}</p>}
            </>
          )}

          <TornPage labelledBy="why-heading" className="torn-note">
            <h3 id="why-heading">Why</h3>
            <p>{scenario.explanation}</p>
          </TornPage>

          {otherOptions.length > 0 && (
            <>
              <h3>Other options</h3>
              <ul className="bullet-list">
                {otherOptions.map((option) => (
                  <li key={option.id}>
                    <strong>{option.label}.</strong> {rationale(option.id)}
                  </li>
                ))}
              </ul>
            </>
          )}

          <h3>Objectives and sources</h3>
          <p>Objectives practised: {objectives.map((objective) => objective.title).join(' · ')}</p>
          <ul className="bullet-list">
            {scenario.sourceRefs.map((ref) => (
              <li key={ref.url}>
                <a href={ref.url} target="_blank" rel="noreferrer">
                  {ref.title}
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="runner-actions">
            {transferHref ? (
              <>
                <ButtonLink href={transferHref}>
                  {evaluation.outcome === 'incorrect'
                    ? 'Try a fresh variant'
                    : 'Try a related challenge'}
                </ButtonLink>
                <ButtonLink href={labHref} variant="secondary">
                  Back to Scenario Lab
                </ButtonLink>
              </>
            ) : (
              <ButtonLink href={labHref}>Back to Scenario Lab</ButtonLink>
            )}
          </div>
          {revision && (
            <div className="revision-add">
              <button
                type="button"
                className="button button-secondary"
                disabled={revision.added}
                onClick={() => revision.onAdd(evaluation)}
              >
                <Icon name="revision" size={16} />{' '}
                {revision.added ? 'Added to revision' : 'Add to revision'}
              </button>
              {revision.added && <a href={revision.studioHref}>Open the Revision Studio</a>}
              <p className="hint" role="status">
                {revision.added ? 'This concept will come back for review.' : ''}
              </p>
            </div>
          )}
          {evaluation.outcome === 'incorrect' && transferHref && (
            <p className="hint">
              A fresh variant tests the same idea in a different situation, so you are applying it
              rather than recognising the answer.
            </p>
          )}
        </section>
      )}
    </article>
  )
}

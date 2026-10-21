# Domain Model and Content Schema

The following TypeScript shapes are conceptual contracts. Align names with the implementation while retaining the boundaries.

```ts
type ID = string;
type Provider = "azure" | "aws" | "gcp" | "neutral";
type ContentStatus = "draft" | "reviewed" | "archived";

interface SourceReference {
  title: string;
  url: string;
  accessedAt?: string;
}

interface Objective {
  id: ID;
  title: string;
  description: string;
  sourceRefs: SourceReference[];
}

interface LearningTrack {
  id: ID;
  provider: Provider;
  title: string;
  description: string;
  goalLabel: string; // clearly marked unofficial preparation
  objectiveSetVersion: string;
  status: ContentStatus;
  objectiveIds: ID[];
}

type InteractionType =
  | "single-choice"
  | "multi-select"
  | "sequence"
  | "architecture-canvas";

interface ScenarioOption {
  id: ID;
  label: string;
  feedbackTag?: string;
}

interface Hint {
  order: number;
  text: string;
}

interface Scenario {
  id: ID;
  packId: ID;
  version: string;
  title: string;
  summary: string;
  difficulty: "intro" | "intermediate" | "stretch";
  estimatedMinutes: number;
  objectiveIds: ID[];
  context: string;
  task: string;
  constraints: string[];
  interactionType: InteractionType;
  options?: ScenarioOption[];
  hints: Hint[];
  evaluatorId: string; // maps to safe, reviewed evaluator
  explanation: string;
  optionRationales?: Record<ID, string>;
  misconceptionTags: string[];
  sourceRefs: SourceReference[];
  status: ContentStatus;
  reviewedAt?: string;
}

interface Attempt {
  id: ID;
  learnerId: ID | "guest";
  scenarioId: ID;
  scenarioVersion: string;
  submittedAnswer: unknown; // validate against interaction contract
  outcome: "correct" | "partially-correct" | "incorrect";
  confidence?: "guessing" | "somewhat-sure" | "confident";
  objectiveIds: ID[];
  completedAt: string;
  durationSeconds?: number;
}

interface RevisionItem {
  id: ID;
  learnerId: ID | "guest";
  objectiveId: ID;
  sourceScenarioId?: ID;
  prompt: string;
  answer: string;
  dueAt: string;
  intervalDays: number;
  repetitions: number;
  status: "active" | "suspended";
  updatedAt: string;
}

interface ReviewEvent {
  id: ID;
  revisionItemId: ID;
  rating: "again" | "hard" | "recalled";
  reviewedAt: string;
  nextDueAt: string;
}

type ComponentType =
  | "user" | "web-client" | "compute" | "load-balancer"
  | "database" | "object-storage" | "identity" | "network"
  | "monitoring";

interface DiagramNode {
  id: ID;
  componentType: ComponentType;
  label: string;
  position: { x: number; y: number };
  config: Record<string, string | number | boolean>;
}

interface DiagramEdge {
  id: ID;
  sourceNodeId: ID;
  targetNodeId: ID;
  relationshipType: "request" | "data" | "identity" | "dependency";
  label?: string;
}

interface ArchitectureDiagram {
  id: ID;
  title: string;
  schemaVersion: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  updatedAt: string;
}

interface SimulationEvent {
  id: ID;
  title: string;
  description: string;
  eventType: string; // allow-listed, not arbitrary code
}

interface SimulationFinding {
  code: string;
  severity: "info" | "warning" | "critical";
  title: string;
  explanation: string;
  affectedNodeIds: ID[];
  assumptions: string[];
}

interface SimulationResult {
  diagramId: ID;
  eventId: ID;
  ruleSetVersion: string;
  findings: SimulationFinding[];
  educationalDisclaimer: string;
}
```

## Integrity rules
- Scenario objective IDs and source references must resolve.
- Every edge must reference existing nodes.
- Component and simulation event types are allow-listed.
- Keep stable IDs; increment content version when evaluation/learning meaning changes.
- Attempts record the scenario version actually completed.
- Derive dashboard summaries from raw evidence.
- Guest data is not merged into an account without explicit consent.
- Remote user-owned records require server-side authorization.
- Simulation output includes rule version and assumptions.

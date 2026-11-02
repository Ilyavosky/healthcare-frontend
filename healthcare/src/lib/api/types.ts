export type AlgorithmName = "ucs" | "astar_simple" | "astar";

export type GoalIn =
  | { type: "all" }
  | { type: "critical" }
  | { type: "k"; value: number }
  | { type: "horizon"; value: number }
  | { type: "subset"; value: string[] };

export type PatientIn = {
  id: string;
  level: number;
  wait: number;
  duration: number;
};

export type StartIn = {
  t0: number;
  attended: string[];
  doctorsFreeAt?: number[];
};

export type SolveRequest = {
  patients: PatientIn[];
  start: StartIn;
  doctors: number;
  goal: GoalIn;
  algorithms?: AlgorithmName[];
  criticalFirst?: boolean;
  includeTrace?: boolean;
  traceLimit?: number;
  timeLimitMs?: number;
  allowApproximate?: boolean;
};

export type StepOut = {
  patient: string;
  level: number;
  doctor: number;
  start: number;
  end: number;
  delay: number;
  penalty: number;
  afterGoal: boolean;
};

export type TraceChildOut = {
  id: number;
  patient: string | null;
  g: number;
  h: number;
  f: number;
  replaces?: number | null;
};

export type TraceRowOut = {
  id: number;
  parent: number;
  patient: string | null;
  attended: string[] | null;
  freeAt: number[] | null;
  isGoal: boolean;
  g: number;
  h: number;
  f: number;
  children: TraceChildOut[];
};

export type AttemptOut = {
  weight: number;
  expanded: number;
  maxFrontier: number;
  ms: number;
};

export type AlgorithmStatus = "optimal" | "approximate" | "limit_reached";

export type AnytimeOut = {
  nodeId: number;
  searchSteps: number;
  cost: number;
  lowerBound: number;
  steps: StepOut[];
  leftOut: StepOut[];
};

export type AlgorithmResultOut = {
  status: AlgorithmStatus;
  weight: number;
  cost: number | null;
  closingCost: number | null;
  expanded: number | null;
  maxFrontier: number | null;
  ms: number | null;
  reopened: number | null;
  steps: StepOut[];
  leftOut: StepOut[];
  trace: TraceRowOut[];
  limitAttempts: AttemptOut[];
  anytime: AnytimeOut | null;
};

export type BaselineOut = {
  cost: number;
  order: string[];
  steps: StepOut[];
  leftOut: StepOut[];
};

export type AlertCode = "ALREADY_LATE" | "EXCEEDS_LIMIT" | "NEAR_LIMIT" | "LEFT_OUT" | "LEFT_OUT_CRITICAL";

export type AlertOut = {
  patient: string;
  code: AlertCode;
  minutes: number;
};

export type ReferenceKind = "optimal" | "approximate" | "anytime" | "baseline";

export type SolveResponse = {
  reference: AlgorithmName | "baseline";
  referenceKind: ReferenceKind;
  cost: number;
  doctors: number;
  results: Partial<Record<AlgorithmName, AlgorithmResultOut>>;
  baseline: BaselineOut;
  sameCost: boolean | null;
  reductionPct: Partial<Record<AlgorithmName, number>>;
  baselineGapPct: number | null;
  alerts: AlertOut[];
};

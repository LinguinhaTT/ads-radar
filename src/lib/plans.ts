export const PLAN_LIMITS = {
  FREE:       { searchesPerDay: 10,  monitors: 2 },
  PRO:        { searchesPerDay: 100, monitors: 10 },
  ENTERPRISE: { searchesPerDay: Infinity, monitors: Infinity },
} as const;

export type PlanKey = keyof typeof PLAN_LIMITS;

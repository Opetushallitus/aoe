export interface RestoreJobDetail {
  restoreJobId: string
  status: string
  resourceType: string
  createdResourceArn?: string
  restoreTestingPlanArn?: string
}

export interface ValidationOutcome {
  passed: boolean
  message: string
  counts: Record<string, number>
}

export type TaskStatus = 'ready' | 'waiting' | 'complete'
export interface OnboardingTask { id: string; title: string; description: string; type: 'questionnaire' | 'document' | 'review'; status: TaskStatus; estimate?: string; dueLabel?: string }
export interface ClientWorkspace { clientName: string; taxYear: number; returnName: string; deadline: string; tasks: OnboardingTask[] }

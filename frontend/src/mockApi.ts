import type { ClientWorkspace } from './types'

const workspace: ClientWorkspace = {
  clientName: 'Maya', taxYear: 2025, returnName: 'Maya & Daniel Flores', deadline: 'October 15, 2026',
  tasks: [
    { id: 'profile', title: 'Tell us what changed this year', description: 'A short guided questionnaire helps us prepare the right forms.', type: 'questionnaire', status: 'ready', estimate: 'About 4 min', dueLabel: 'Start here' },
    { id: 'w2', title: 'Upload W-2', description: 'From Northstar Design Group', type: 'document', status: 'waiting', estimate: '1 document', dueLabel: 'After questionnaire' },
    { id: 'interest', title: 'Upload interest statements', description: 'Forms 1099-INT from your bank accounts', type: 'document', status: 'waiting', dueLabel: 'After W-2 upload' },
  ],
}

const wait = (ms = 280) => new Promise(resolve => setTimeout(resolve, ms))
export async function getWorkspace() { await wait(); return structuredClone(workspace) }
export async function completeTask(id: string) {
  await wait(380)
  const task = workspace.tasks.find(item => item.id === id)
  if (task) task.status = 'complete'
  const completedIndex = workspace.tasks.findIndex(item => item.id === id)
  const next = workspace.tasks[completedIndex + 1]
  if (next && next.status === 'waiting') next.status = 'ready'
  return structuredClone(workspace)
}

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Bell, Check, CheckCircle2, ChevronRight, CircleHelp, FileText, FolderOpen, Home, LockKeyhole, MessageSquare, Upload, X } from 'lucide-react'
import { completeTask, getWorkspace } from './mockApi'
import type { ClientWorkspace, OnboardingTask } from './types'

const taskIcon = { questionnaire: CircleHelp, document: Upload, review: FileText }

export function App() {
  const [workspace, setWorkspace] = useState<ClientWorkspace | null>(null)
  const [activeTask, setActiveTask] = useState<OnboardingTask | null>(null)
  const [saving, setSaving] = useState(false)
  const [showAll, setShowAll] = useState(false)
  useEffect(() => { getWorkspace().then(setWorkspace) }, [])
  const completed = workspace?.tasks.filter(task => task.status === 'complete').length ?? 0
  const progress = workspace ? Math.round((completed / workspace.tasks.length) * 100) : 0
  const nextTask = workspace?.tasks.find(task => task.status === 'ready')
  const visibleTasks = useMemo(() => showAll ? workspace?.tasks : workspace?.tasks.filter(task => task.status !== 'complete'), [showAll, workspace])

  async function finishTask() {
    if (!activeTask) return
    setSaving(true)
    setWorkspace(await completeTask(activeTask.id))
    setSaving(false)
    setActiveTask(null)
  }

  if (!workspace) return <div className="loading"><div className="brand-mark">M</div><p>Preparing your tax workspace…</p></div>

  return <div className="app-shell">
    <header>
      <a className="brand" href="#"><span className="brand-mark">M</span><span>MiraFlores <b>Tax</b></span></a>
      <div className="header-actions"><button className="icon-button" aria-label="Notifications"><Bell size={19}/><span className="notification-dot"/></button><button className="avatar" aria-label="Account menu">MF</button></div>
    </header>
    <aside>
      <nav aria-label="Main navigation"><a className="active" href="#"><Home size={19}/>Home</a><a href="#documents"><FolderOpen size={19}/>Documents<span className="nav-count">2</span></a><a href="#messages"><MessageSquare size={19}/>Messages</a></nav>
      <div className="secure-note"><LockKeyhole size={17}/><div><strong>Your data is protected</strong><span>Bank-level encryption</span></div></div>
      <div className="help-card"><CircleHelp size={20}/><div><strong>Need some help?</strong><span>Your tax team is here.</span><button>Ask a question</button></div></div>
    </aside>
    <main>
      <div className="eyebrow">2025 INDIVIDUAL RETURN</div>
      <section className="welcome-row"><div><h1>Good morning, {workspace.clientName}.</h1><p>Let’s keep your return moving. We’ll guide you one step at a time.</p></div><div className="deadline"><span>FILING DEADLINE</span><strong>{workspace.deadline}</strong></div></section>
      {progress < 100 ? <section className="next-action">
        <div className="next-copy"><span className="step-pill">YOUR NEXT STEP</span><h2>{nextTask?.title}</h2><p>{nextTask?.description}</p><button className="primary" onClick={() => nextTask && setActiveTask(nextTask)}>Start now <ChevronRight size={18}/></button><span className="estimate">{nextTask?.estimate} · Your answers save automatically</span></div>
        <div className="progress-orbit" style={{'--progress': `${progress * 3.6}deg`} as CSSProperties}><div><strong>{progress}%</strong><span>setup complete</span></div></div>
      </section> : <section className="completion-card"><CheckCircle2 size={34}/><div><span className="step-pill">YOU’RE ALL SET</span><h2>Your tax team has everything they need.</h2><p>We’ll notify you if a question comes up during preparation.</p></div></section>}
      <section className="checklist-section">
        <div className="section-heading"><div><h2>Your setup checklist</h2><p>{completed} of {workspace.tasks.length} steps complete</p></div><button className="text-button" onClick={() => setShowAll(!showAll)}>{showAll ? 'Hide completed' : 'View all steps'}</button></div>
        <div className="progress-track"><span style={{width: `${progress}%`}}/></div>
        <div className="task-list">{visibleTasks?.map(task => <TaskRow key={task.id} task={task} onOpen={() => task.status === 'ready' && setActiveTask(task)}/>)}</div>
      </section>
      <footer><span>Return for {workspace.returnName}</span><span>Questions? <button>Contact your tax team</button></span></footer>
    </main>
    {activeTask && <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setActiveTask(null)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="task-title">
      <button className="close" onClick={() => setActiveTask(null)} aria-label="Close"><X/></button><span className="modal-icon">{activeTask.type === 'document' ? <Upload/> : <CircleHelp/>}</span><div className="eyebrow">STEP {workspace.tasks.indexOf(activeTask) + 1} OF {workspace.tasks.length}</div><h2 id="task-title">{activeTask.title}</h2>
      {activeTask.type === 'document' ? <div className="drop-zone"><Upload size={26}/><strong>Drop your file here</strong><span>or click to choose a PDF, JPG, or PNG</span></div> : <div className="question"><label>Which of these changed in 2025?</label>{['Employment or income','Home or address','Family or dependents','Nothing changed'].map(item => <label className="choice" key={item}><input type="checkbox"/>{item}</label>)}</div>}
      <button className="primary wide" disabled={saving} onClick={finishTask}>{saving ? 'Saving…' : activeTask.type === 'document' ? 'Upload document' : 'Save and continue'} <ChevronRight size={18}/></button><p className="privacy"><LockKeyhole size={14}/>Only you and your tax team can see this information.</p>
    </section></div>}
  </div>
}

function TaskRow({task, onOpen}: {task: OnboardingTask; onOpen: () => void}) {
  const Icon = taskIcon[task.type]
  return <button className={`task-row ${task.status}`} onClick={onOpen} disabled={task.status !== 'ready'}><span className="task-status">{task.status === 'complete' ? <Check size={17}/> : task.status === 'waiting' ? <LockKeyhole size={15}/> : <Icon size={18}/>}</span><span className="task-copy"><strong>{task.title}</strong><span>{task.status === 'waiting' ? 'Unlocks after your first step' : task.description}</span></span>{task.dueLabel && task.status !== 'complete' && <span className={`task-label ${task.status}`}>{task.dueLabel}</span>}{task.status === 'ready' && <ChevronRight className="chevron" size={19}/>}</button>
}

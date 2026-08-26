import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { ArrowLeft, Bell, BriefcaseBusiness, Check, CheckCircle2, ChevronRight, CircleHelp, FileText, FolderOpen, Home, Link2, LockKeyhole, LogOut, MessageSquare, Send, Upload, X } from 'lucide-react'
import { completeTask, getWorkspace } from './mockApi'
import type { ClientWorkspace, OnboardingTask } from './types'
import { ChallengeEight } from './ChallengeEight'
import { Collaboration, getMessageAttentionCount } from './Collaboration'
import { CpaDashboard, LoginScreen, type UserRole } from './RoleScreens'
import { ReturnStatus } from './ReturnStatus'

const taskIcon = { questionnaire: CircleHelp, document: Upload, review: FileText }

export function App() {
  const [workspace, setWorkspace] = useState<ClientWorkspace | null>(null)
  const [activeTask, setActiveTask] = useState<OnboardingTask | null>(null)
  const [saving, setSaving] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [route, setRoute] = useState(location.hash || '#home')
  const routePath=route.split('?')[0]
  const routeParams=new URLSearchParams(route.split('?')[1]||'')
  const contextCaseId=routeParams.get('case')
  const [role, setRole] = useState<UserRole | null>(() => sessionStorage.getItem('mock-role') as UserRole | null)
  const [tenantId, setTenantId] = useState<string | null>(() => sessionStorage.getItem('mock-tenant'))
  const [selectedClient, setSelectedClient] = useState<{id:string;name:string} | null>(()=>{try{return JSON.parse(sessionStorage.getItem('mock-selected-client')||'null')}catch{return null}})
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [,setCountsVersion]=useState(0)
  useEffect(() => { getWorkspace().then(setWorkspace) }, [])
  useEffect(() => { const update = () => setRoute(location.hash || '#home'); addEventListener('hashchange', update); return () => removeEventListener('hashchange', update) }, [])
  useEffect(()=>{if(role==='client'&&workspace&&routePath==='#home'&&routeParams.get('object')==='questionnaire'){const questionnaire=workspace.tasks.find(task=>task.type==='questionnaire');if(questionnaire)setActiveTask(questionnaire)}},[route,workspace,role])
  useEffect(()=>{const update=()=>setCountsVersion(value=>value+1);addEventListener('workspace-counts-changed',update);return()=>removeEventListener('workspace-counts-changed',update)},[])
  const completed = workspace?.tasks.filter(task => task.status === 'complete').length ?? 0
  const progress = workspace ? Math.round((completed / workspace.tasks.length) * 100) : 0
  const nextTask = workspace?.tasks.find((task,index) => task.status !== 'complete' && workspace.tasks.slice(0,index).every(previous=>previous.status==='complete'))
  const visibleTasks = useMemo(() => showAll ? workspace?.tasks : workspace?.tasks.filter(task => task.status !== 'complete'), [showAll, workspace])
  const activeClientId=selectedClient?.id||'flores-2025'
  const messageCount=role?getMessageAttentionCount(role,activeClientId):0

  async function finishTask() {
    if (!activeTask) return
    setSaving(true)
    setWorkspace(await completeTask(activeTask.id))
    setSaving(false)
    setActiveTask(null)
  }

  function openTask(task: OnboardingTask) {
    if (task.type === 'document') { location.hash = '#documents'; return }
    setActiveTask(task)
  }

  function selectClient(client:{id:string;name:string}){setSelectedClient(client);sessionStorage.setItem('mock-selected-client',JSON.stringify(client))}

  function login(nextRole: UserRole, nextTenantId: string) {
    sessionStorage.setItem('mock-role', nextRole)
    sessionStorage.setItem('mock-tenant', nextTenantId)
    setRole(nextRole)
    setTenantId(nextTenantId)
    location.hash = nextRole === 'cpa' ? '#cpa-home' : '#home'
  }

  function logout() {
    sessionStorage.removeItem('mock-role')
    sessionStorage.removeItem('mock-tenant')
    setRole(null)
    setTenantId(null)
    setSelectedClient(null)
    sessionStorage.removeItem('mock-selected-client')
    setAccountMenuOpen(false)
    location.hash = '#login'
  }

  if (!role || !tenantId) return <LoginScreen onLogin={login}/>
  if (!workspace) return <div className="loading"><div className="brand-mark">M</div><p>Preparing your tax workspace…</p></div>

  return <div className="app-shell">
    <header>
      <a className="brand" href="#"><span className="brand-mark">M</span><span>MiraFlores <b>Tax</b></span></a>
      <div className="header-actions">{!(role==='cpa'&&selectedClient)&&<span className="active-role">{role==='cpa'?'CPA workspace · Select a client':'Client workspace'}</span>}<button className="icon-button" aria-label="Notifications"><Bell size={19}/><span className="notification-dot"/></button><div className="account-menu-wrap"><button className="avatar" aria-label="Open account menu" aria-expanded={accountMenuOpen} onClick={()=>setAccountMenuOpen(!accountMenuOpen)}>{role === 'cpa' ? 'JL' : 'MF'}</button>{accountMenuOpen&&<div className="account-menu"><div className="account-menu-user"><span className="avatar large">{role==='cpa'?'JL':'MF'}</span><div><strong>{role==='cpa'?'Jordan Lee, CPA':'Maya Flores'}</strong><span>{role==='cpa'?'jordan.lee@miraflorestax.com':'maya.flores@example.com'}</span><small>{role==='cpa'?'MiraFlores Tax · Tax preparer':'Client · 2025 individual return'}</small></div></div><button className="account-menu-logout" onClick={logout}><LogOut size={16}/>Sign out</button></div>}</div></div>
    </header>
    <aside>
      {role === 'cpa' ? <nav aria-label="CPA navigation"><a className={routePath === '#cpa-home' || routePath === '#cpa-clients' ? 'active' : ''} href="#cpa-home"><Home size={19}/>Dashboard</a><a className={`${routePath === '#cpa-status' ? 'active' : ''} ${!selectedClient?'disabled':''}`} href={selectedClient?'#cpa-status':'#cpa-home'} aria-disabled={!selectedClient}><CheckCircle2 size={19}/>Return status</a><a className={`${routePath === '#cpa-review' ? 'active' : ''} ${!selectedClient?'disabled':''}`} href={selectedClient?'#cpa-review':'#cpa-home'} aria-disabled={!selectedClient}><FileText size={19}/>Review queue</a><a className={`${routePath === '#cpa-messages' ? 'active' : ''} ${!selectedClient?'disabled':''}`} href={selectedClient?'#cpa-messages':'#cpa-home'} aria-disabled={!selectedClient}><MessageSquare size={19}/>Messages{messageCount>0&&<span className="nav-count">{messageCount}</span>}</a></nav> : <nav aria-label="Client navigation"><a className={routePath === '#home' || routePath === '' ? 'active' : ''} href="#home"><Home size={19}/>Home</a><a className={routePath === '#status' ? 'active' : ''} href="#status"><CheckCircle2 size={19}/>Return status</a><a className={routePath === '#documents' ? 'active' : ''} href="#documents"><FolderOpen size={19}/>Documents<span className="nav-count">2</span></a><a className={routePath === '#messages' ? 'active' : ''} href="#messages"><MessageSquare size={19}/>Messages{messageCount>0&&<span className="nav-count">{messageCount}</span>}</a></nav>}
      {role==='client'&&<div className="sidebar-deadline"><span>FILING DEADLINE</span><strong>{workspace.deadline}</strong></div>}
      <div className="secure-note"><LockKeyhole size={17}/><div><strong>Your data is protected</strong><span>Bank-level encryption</span></div></div>
      <div className="help-card">{role === 'cpa' ? <BriefcaseBusiness size={20}/> : <CircleHelp size={20}/>}<div><strong>{role === 'cpa' ? 'MiraFlores Tax' : 'Need some help?'}</strong><span>{role === 'cpa' ? 'Jordan Lee · Preparer' : 'Your tax support team is here.'}</span><button onClick={()=>role==='client'&&setSupportOpen(true)}>{role === 'cpa' ? 'Firm resources' : 'Ask a question'}</button></div></div>
    </aside>
    <main>{contextCaseId&&<WorkflowContextBar role={role} caseId={contextCaseId} clientName={selectedClient?.name||workspace.clientName} current={routePath}/>} {role === 'cpa' ? (routePath === '#cpa-messages' && selectedClient ? <Collaboration role="cpa" clientId={selectedClient.id} clientName={selectedClient.name}/> : routePath === '#cpa-review' && selectedClient ? <ChallengeEight role="cpa" clientId={selectedClient.id} clientName={selectedClient.name}/> : routePath === '#cpa-status' && selectedClient ? <ReturnStatus role="cpa" clientName={selectedClient.name} onReview={()=>{location.hash=`#cpa-review?case=${contextCaseId||''}`}}/> : <CpaDashboard onReview={client => { selectClient(client); location.hash = '#cpa-status' }}/>) : routePath === '#status' ? <ReturnStatus role="client"/> : routePath === '#documents' ? <ChallengeEight role="client" onUploadComplete={async()=>{const task=workspace.tasks.find(item=>item.status==='ready'&&item.type==='document');if(task)setWorkspace(await completeTask(task.id));location.hash='#home'}}/> : routePath === '#messages' ? <Collaboration role="client" clientId="flores-2025" clientName="Maya & Daniel Flores"/> : <>
      <div className="eyebrow">2025 INDIVIDUAL RETURN</div>
      <section className="welcome-row"><p>Let’s keep your return moving. We’ll guide you one step at a time.</p></section>
      {progress < 100 ? <section className="next-action">
        <div className="next-copy"><span className="step-pill">YOUR NEXT STEP</span><h2>{nextTask?.title}</h2><p>{nextTask?.description}</p><button className="primary" onClick={() => nextTask && openTask(nextTask)}>Start now <ChevronRight size={18}/></button><span className="estimate">{nextTask?.estimate} · Your answers save automatically</span></div>
        <div className="progress-orbit" style={{'--progress': `${progress * 3.6}deg`} as CSSProperties}><div><strong>{progress}%</strong><span>setup complete</span></div></div>
      </section> : <section className="completion-card"><CheckCircle2 size={34}/><div><span className="step-pill">YOU’RE ALL SET</span><h2>Your tax team has everything they need.</h2><p>We’ll notify you if a question comes up during preparation.</p></div></section>}
      <section className="checklist-section">
        <div className="section-heading"><div><h2>Your setup checklist</h2><p>{completed} of {workspace.tasks.length} steps complete</p></div><button className="text-button" onClick={() => setShowAll(!showAll)}>{showAll ? 'Hide completed' : 'View all steps'}</button></div>
        <div className="progress-track"><span style={{width: `${progress}%`}}/></div>
        <div className="task-list">{visibleTasks?.map(task => {const index=workspace.tasks.findIndex(item=>item.id===task.id);const available=task.status!=='complete'&&workspace.tasks.slice(0,index).every(previous=>previous.status==='complete');return <TaskRow key={task.id} task={task} available={available} onOpen={() => available && openTask(task)}/>})}</div>
      </section>
      <footer><span>Return for {workspace.returnName}</span><span>Questions? <button>Contact your tax team</button></span></footer></>}
    </main>
    {activeTask && <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setActiveTask(null)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="task-title">
      <button className="close" onClick={() => setActiveTask(null)} aria-label="Close"><X/></button><button className="modal-back-home" onClick={()=>{setActiveTask(null);location.hash='#home'}}><ArrowLeft size={14}/>Back to Home</button><span className="modal-icon"><CircleHelp/></span><div className="eyebrow">STEP {workspace.tasks.indexOf(activeTask) + 1} OF {workspace.tasks.length}</div><h2 id="task-title">{activeTask.title}</h2>
      <div className="question"><label>Which of these changed in 2025?</label>{['Employment or income','Home or address','Family or dependents','Nothing changed'].map(item => <label className="choice" key={item}><input type="checkbox"/>{item}</label>)}</div>
      <button className="primary wide" disabled={saving} onClick={finishTask}>{saving ? 'Saving…' : 'Save and continue'} <ChevronRight size={18}/></button><p className="privacy"><LockKeyhole size={14}/>Only you and your tax team can see this information.</p>
    </section></div>}
    {role==='client'&&supportOpen&&<SupportChat onClose={()=>setSupportOpen(false)}/>} 
  </div>
}

type SupportMessage={id:number;from:'support'|'client';text:string;link?:{label:string;href:string}}

function SupportChat({onClose}:{onClose:()=>void}){
  const [draft,setDraft]=useState('')
  const [messages,setMessages]=useState<SupportMessage[]>([{id:1,from:'support',text:'Hi Maya — how can we help you navigate your tax workspace?'}])
  const [replying,setReplying]=useState(false)
  const quickQuestions=['How do I upload my W-2?','Where is my return status?','How do I reply to my CPA?']
  function mockReply(question:string):SupportMessage{
    const value=question.toLowerCase()
    if(value.includes('upload')||value.includes('w-2')||value.includes('w2'))return{id:Date.now()+1,from:'support',text:'Open Documents and use the drop area to upload your W-2. You can return there later to view uploaded files.',link:{label:'Go to Documents',href:'#documents'}}
    if(value.includes('status')||value.includes('progress'))return{id:Date.now()+1,from:'support',text:'Your Return Status shows the current preparation stage, outstanding items, and what happens next.',link:{label:'View Return Status',href:'#status'}}
    if(value.includes('cpa')||value.includes('message')||value.includes('reply')||value.includes('case'))return{id:Date.now()+1,from:'support',text:'Questions from your CPA are organized as cases in Messages. Open a case to see its document and reply in context.',link:{label:'Open Messages',href:'#messages'}}
    return{id:Date.now()+1,from:'support',text:'Thanks for your question. This demo uses a simulated support response. You can use Home to continue your next step, or contact the tax support team for tax-specific guidance.',link:{label:'Go to Home',href:'#home'}}
  }
  function send(question=draft){
    const clean=question.trim();if(!clean||replying)return
    setMessages(items=>[...items,{id:Date.now(),from:'client',text:clean}]);setDraft('');setReplying(true)
    window.setTimeout(()=>{setMessages(items=>[...items,mockReply(clean)]);setReplying(false)},550)
  }
  return <section className="support-chat" role="dialog" aria-modal="false" aria-labelledby="support-chat-title">
    <header><div><span className="support-presence"/><div><strong id="support-chat-title">Tax support</strong><small>Platform navigation help</small></div></div><button onClick={onClose} aria-label="Close support chat"><X size={17}/></button></header>
    <div className="support-chat-messages" aria-live="polite">{messages.map(message=><div key={message.id} className={`support-message ${message.from}`}><span>{message.text}</span>{message.link&&<a href={message.link.href} onClick={onClose}>{message.link.label}<ChevronRight size={13}/></a>}</div>)}{replying&&<div className="support-message support typing">Tax support is replying…</div>}</div>
    {messages.length===1&&<div className="support-quick">{quickQuestions.map(question=><button key={question} onClick={()=>send(question)}>{question}</button>)}</div>}
    <form onSubmit={event=>{event.preventDefault();send()}}><input value={draft} onChange={event=>setDraft(event.target.value)} placeholder="Ask how to use the platform…" aria-label="Question for tax support"/><button type="submit" disabled={!draft.trim()||replying} aria-label="Send question"><Send size={16}/></button></form>
    <p>Navigation guidance only · Tax advice is handled by your tax team.</p>
  </section>
}

function WorkflowContextBar({role,caseId,clientName,current}:{role:UserRole;caseId:string;clientName:string;current:string}){
  let caseTitle='Connected tax issue';try{const cases=JSON.parse(sessionStorage.getItem('mock-collaboration-threads')||'[]');caseTitle=cases.find((item:{id:string;title:string})=>item.id===caseId)?.title||caseTitle}catch{/* use fallback */}
  const cpa=role==='cpa',query=`case=${encodeURIComponent(caseId)}`
  const links=[{label:'Case',href:`${cpa?'#cpa-messages':'#messages'}?${query}`,route:cpa?'#cpa-messages':'#messages',icon:MessageSquare},{label:'Document',href:`${cpa?'#cpa-review':'#documents'}?${query}&object=document`,route:cpa?'#cpa-review':'#documents',icon:FileText},{label:'Questionnaire',href:`${cpa?'#cpa-status':'#home'}?${query}&object=questionnaire`,route:cpa?'#cpa-status':'#home',icon:CircleHelp},{label:'Task',href:`${cpa?'#cpa-status':'#home'}?${query}&object=task`,route:cpa?'#cpa-status':'#home',icon:CheckCircle2}]
  return <section className="workflow-context"><div className="workflow-breadcrumb"><Link2 size={14}/><span>{cpa?'CPA workspace':'Your return'}</span><ChevronRight size={12}/><span>{clientName}</span><ChevronRight size={12}/><strong>{caseTitle}</strong></div><div className="workflow-related"><span>CONNECTED WORKFLOW</span>{links.map(item=>{const Icon=item.icon;return <a key={item.label} className={current===item.route?'active':''} href={item.href}><Icon size={13}/>{item.label}</a>})}<a className="return-to-case" href={`${cpa?'#cpa-messages':'#messages'}?${query}`}><ArrowLeft size={13}/>Return to case</a></div></section>
}

function TaskRow({task, available, onOpen}: {task: OnboardingTask; available:boolean; onOpen: () => void}) {
  const Icon = taskIcon[task.type]
  const locked=task.status!=='complete'&&!available
  return <button className={`task-row ${task.status} ${locked?'waiting':''}`} onClick={onOpen} disabled={!available}><span className="task-status">{task.status === 'complete' ? <Check size={17}/> : locked ? <LockKeyhole size={15}/> : <Icon size={18}/>}</span><span className="task-copy"><strong>{task.title}</strong><span>{locked?'Complete the previous step to unlock this.':task.description}</span></span>{task.dueLabel && task.status !== 'complete' && <span className={`task-label ${locked?'waiting':task.status}`}>{locked?'Locked':task.dueLabel}</span>}{available && <ChevronRight className="chevron" size={19}/>}</button>
}

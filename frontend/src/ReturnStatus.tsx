import { AlertCircle, ArrowLeft, Check, CheckCircle2, ChevronRight, Circle, Clock3, FileSearch, UserRound } from 'lucide-react'

const stages = [
  {title:'Documents collected',date:'Completed Aug 18',state:'complete'},
  {title:'Tax team review',date:'In progress',state:'current'},
  {title:'Return preparation',date:'Up next',state:'future'},
  {title:'Final review & signature',date:'Not started',state:'future'},
  {title:'Filed with tax agencies',date:'Not started',state:'future'},
]

export function ReturnStatus({role,clientName='Maya & Daniel Flores',onReview}:{role:'client'|'cpa';clientName?:string;onReview?:()=>void}) {
  const cpa=role==='cpa'
  return <div className="status-page">{!cpa&&<button className="status-back-home" onClick={()=>{location.hash='#home'}}><ArrowLeft size={15}/>Back to Home</button>}<div className="eyebrow">2025 INDIVIDUAL RETURN</div><div className="status-title"><div><h1>{cpa?clientName:'Your return status'}</h1><p>{cpa?'Shared lifecycle with internal preparation details.':'Follow your return from document collection through filing.'}</p></div><span className="status-stage"><Clock3 size={15}/>Tax team review</span></div>
    <section className="status-hero"><div><span className="step-pill">CURRENT STAGE · 2 OF 5</span><h2>{cpa?'Review source documents':'Your tax team is reviewing your documents'}</h2><p>{cpa?'Verify extracted values and resolve the open withholding discrepancy before preparation can begin.':'You don’t need to do anything right now. We’ll contact you if your tax team needs more information.'}</p>{cpa&&onReview&&<button className="primary" onClick={onReview}>Open CPA review <ChevronRight size={17}/></button>}</div><div className="ownership"><span>NEXT ACTION OWNER</span><strong>{cpa?'Jordan Lee, CPA':'Your tax team'}</strong><small>{cpa?'Due today':'We’ll notify you when this changes'}</small></div></section>
    <div className="status-layout"><section className="timeline-card"><div className="status-section-title"><h2>Return timeline</h2><span>40% complete</span></div><div className="status-progress"><span/></div><div className="timeline">{stages.map(stage=><div className={`timeline-step ${stage.state}`} key={stage.title}><span className="timeline-icon">{stage.state==='complete'?<Check/>:stage.state==='current'?<FileSearch/>:<Circle/>}</span><div><strong>{stage.title}</strong><small>{stage.date}</small>{stage.state==='current'&&<p>{cpa?'1 item requires professional review':'Your documents are being checked for completeness and accuracy.'}</p>}</div></div>)}</div></section>
      <aside className="status-side"><section className={`blocker-card ${cpa?'internal':''}`}>{cpa?<AlertCircle/>:<CheckCircle2/>}<div><span>{cpa?'INTERNAL BLOCKER':'NO ACTION NEEDED'}</span><h3>{cpa?'Federal withholding needs verification':'Your tasks are complete'}</h3><p>{cpa?'W-2 Box 2 differs from the expected payroll pattern. Review the source before proceeding.':'Your tax team owns the next step. We’ll alert you if that changes.'}</p>{cpa&&<button onClick={onReview}>Resolve in CPA review</button>}</div></section><section className="owner-card"><UserRound/><div><span>RETURN OWNER</span><strong>Jordan Lee, CPA</strong><small>MiraFlores Tax · Preparer</small></div></section><section className="deadline-card"><span>FILING DEADLINE</span><strong>October 15, 2026</strong><small>53 days remaining</small></section></aside>
    </div>
  </div>
}

import { useRef, useState, type DragEvent } from 'react'
import { Bot, Check, CheckCircle2, ChevronRight, FileCheck2, FileText, Info, LockKeyhole, MessageCircle, Pencil, ScanText, ShieldCheck, Upload } from 'lucide-react'

type Status = 'ai' | 'verified' | 'approval' | 'locked' | 'editable'
type Field = { label: string; value: string; status: Status; detail: string; source?: string }

const fields: Field[] = [
  { label: 'Employer name', value: 'Northstar Design Group', status: 'verified', detail: 'Verified by Jordan Lee, CPA on Aug 19', source: 'W-2 · Box c' },
  { label: 'Wages, tips, other compensation', value: '$86,420.00', status: 'ai', detail: 'Extracted with 98% confidence', source: 'W-2 · Box 1' },
  { label: 'Federal income tax withheld', value: '$12,636.00', status: 'approval', detail: 'Different from prior-year pattern', source: 'W-2 · Box 2' },
  { label: 'Social Security wages', value: '$86,420.00', status: 'locked', detail: 'Calculated from verified payroll data', source: 'W-2 · Box 3' },
  { label: 'Occupation', value: 'Product designer', status: 'editable', detail: 'Client-provided answer · Editable by CPA' },
]

const statusMeta: Record<Status, { label: string; icon: typeof Bot }> = {
  ai: { label: 'AI extracted', icon: Bot }, verified: { label: 'CPA verified', icon: ShieldCheck },
  approval: { label: 'Needs CPA review', icon: Info }, locked: { label: 'Calculated · locked', icon: LockKeyhole }, editable: { label: 'CPA editable', icon: Pencil },
}

export function ChallengeEight({role = 'cpa', clientName = 'Maya & Daniel Flores', onUploadComplete}: {role?: 'client' | 'cpa'; clientName?: string; onUploadComplete?:()=>void}) {
  const [screen, setScreen] = useState<'documents' | 'return'>('documents')
  const [selected, setSelected] = useState<Field | null>(null)
  const [values, setValues] = useState<Record<string,string>>(() => Object.fromEntries(fields.map(f => [f.label, f.value])))
  const [approved, setApproved] = useState(false)
  if (role === 'client') return <ClientDocuments onContinue={onUploadComplete}/>
  return <div className="review-page">
    <div className="assignment-context"><span>ASSIGNED CLIENT</span><strong>{clientName}</strong><small>2025 individual return · Assigned to Jordan Lee, CPA</small></div>
    <div className="review-title"><div><div className="eyebrow">CPA REVIEW WORKSPACE</div><h1>Review extracted tax details</h1><p>Compare AI-extracted values with this client’s source documents, correct them, and verify them for the return.</p></div><div className="review-progress"><CheckCircle2 size={18}/><span><strong>3 of 4 documents reviewed</strong><small>Client access is restricted</small></span></div></div>
    <div className="screen-tabs" role="tablist"><button className={screen === 'documents' ? 'selected' : ''} onClick={() => setScreen('documents')}><FileText size={17}/>Source documents</button><button className={screen === 'return' ? 'selected' : ''} onClick={() => setScreen('return')}><FileCheck2 size={17}/>CPA review <span className="review-count">1</span></button></div>
    <div className="affordance-key"><strong>How to read this screen</strong>{(['editable','ai','verified','approval','locked'] as Status[]).map(status => <StatusBadge key={status} status={status}/>)}</div>
    {screen === 'documents' ? <Documents onReview={() => setScreen('return')}/> : <section className="return-card">
      <div className="return-header"><div><span className="section-number">W-2</span><div><h2>Wages and withholding</h2><p>Northstar Design Group · Daniel Flores</p></div></div><button className="source-link" onClick={() => setScreen('documents')}>View source document <ChevronRight size={16}/></button></div>
      <div className="field-table">{fields.map(field => <FieldRow key={field.label} field={field} value={values[field.label]} approved={approved && field.status === 'approval'} onChange={value => setValues({...values,[field.label]:value})} onSelect={() => setSelected(field)} onApprove={() => setApproved(true)}/>)}</div>
      <div className="return-footer"><span><Check size={16}/>CPA changes save automatically</span><button className="dark-button">Continue review <ChevronRight size={17}/></button></div>
    </section>}
    {selected && <div className="explain-panel"><button className="panel-close" onClick={() => setSelected(null)}>×</button><StatusBadge status={selected.status}/><h3>{selected.label}</h3><p>{selected.detail}</p>{selected.source && <div className="evidence"><ScanText size={19}/><div><strong>Source evidence</strong><span>{selected.source} · 2025 W-2.pdf</span></div></div>}<div className="why-box"><strong>Why is this {selected.status === 'locked' ? 'read only' : 'shown this way'}?</strong><p>{explanation(selected.status)}</p></div></div>}
  </div>
}

function ClientDocuments({onContinue}:{onContinue?:()=>void}) {
  const inputRef=useRef<HTMLInputElement>(null)
  const [uploaded,setUploaded]=useState<string[]>(()=>JSON.parse(sessionStorage.getItem('client-uploaded-files')||'[]'))
  const [clientTab,setClientTab]=useState<'upload'|'files'>('upload')
  const [dragging,setDragging]=useState(false)
  function accept(files:FileList|null){if(!files?.length)return;setUploaded(previous=>{const next=[...Array.from(files).map(file=>file.name),...previous];sessionStorage.setItem('client-uploaded-files',JSON.stringify(next));return next})}
  function drop(event:DragEvent<HTMLButtonElement>){event.preventDefault();setDragging(false);accept(event.dataTransfer.files)}
  return <div className="review-page client-documents">
    <div className="review-title"><div><div className="eyebrow">2025 INDIVIDUAL RETURN</div><h1>Your documents</h1><p>Upload documents in one place and track when your tax team receives them.</p></div></div>
    <div className="screen-tabs client-document-tabs" role="tablist"><button className={clientTab==='upload'?'selected':''} onClick={()=>setClientTab('upload')}><Upload size={17}/>Upload documents</button><button className={clientTab==='files'?'selected':''} onClick={()=>setClientTab('files')}><FileText size={17}/>Uploaded files <span className="review-count">{3+uploaded.length}</span></button></div>
    {clientTab==='upload'?<>
      <input ref={inputRef} className="visually-hidden" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={event=>accept(event.target.files)}/>
      <button className={`single-upload-zone ${dragging?'dragging':''}`} onClick={()=>inputRef.current?.click()} onDragOver={event=>{event.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={drop}><Upload size={25}/><span><strong>Drop your files here</strong><small>or click anywhere to choose PDF, JPG, or PNG files</small></span></button>
      {uploaded.length>0&&<div className="upload-success"><CheckCircle2 size={18}/><div><strong>Latest upload received</strong><span>{uploaded[0]} · Available to your CPA</span></div><button className="outline-button" onClick={()=>setClientTab('files')}>View uploaded files</button>{onContinue&&<button className="dark-button" onClick={onContinue}>Continue to next step <ChevronRight size={16}/></button>}</div>}
      <div className="client-boundary"><LockKeyhole size={18}/><div><strong>Your tax team handles verification</strong><span>You only need to upload clear, complete documents. Extracted tax values are reviewed privately by your CPA.</span></div></div>
      <section className="message-guidance"><MessageCircle/><div><strong>Does your CPA need something else?</strong><span>Additional questions and clarification requests will appear in Messages.</span></div><a href="#messages">Open messages <ChevronRight size={16}/></a></section>
    </>:<>
      <div className="uploaded-files-heading"><div><h2>Uploaded files</h2><p>Files you have submitted to MiraFlores Tax.</p></div><button className="outline-button" onClick={()=>setClientTab('upload')}><Upload size={16}/>Upload more</button></div>
      {uploaded.length>0&&<section className="recent-uploads">{uploaded.map((name,index)=><div className="uploaded-file-row" key={`${name}-${index}`}><span className="file-type">{name.split('.').pop()?.toUpperCase()||'FILE'}</span><div><strong>{name}</strong><small>Uploaded this session · Received</small></div><span className="client-status received"><Check size={12}/>Received</span></div>)}</section>}
      <section className="document-grid"><ClientDocument title="2025 W-2" subtitle="Northstar Design Group · Daniel Flores" status="Under CPA review" meta="Uploaded Aug 18"/><ClientDocument title="2025 W-2" subtitle="Beacon Health · Maya Flores" status="Received" meta="Uploaded Aug 12" complete/><ClientDocument title="Engagement letter" subtitle="MiraFlores Tax · Signed copy" status="Complete" meta="Signed Aug 10" complete/></section>
    </>}
  </div>
}

function ClientDocument({title,subtitle,status,meta,complete=false}:{title:string;subtitle:string;status:string;meta:string;complete?:boolean}) {
  return <article className="document-card"><div className={`document-preview ${complete ? 'done' : ''}`}>{complete ? <Check size={24}/> : <><span>W-2</span><div className="paper-lines"/></>}</div><div className="document-copy"><div><h3>{title}</h3><p>{subtitle}</p></div><span className={`client-status ${complete ? 'received' : 'reviewing'}`}>{complete && <Check size={12}/>} {status}</span><div className="document-meta"><span>{meta}</span><span>Available to your CPA</span></div><button className="outline-button">View uploaded file <ChevronRight size={17}/></button></div></article>
}

function Documents({onReview}: {onReview: () => void}) {
  return <section className="document-grid">
    <article className="document-card"><div className="document-preview"><span>W-2</span><div className="paper-lines"/></div><div className="document-copy"><div><h3>2025 W-2</h3><p>Northstar Design Group · Daniel Flores</p></div><StatusBadge status="approval"/><div className="document-meta"><span>Uploaded Aug 18</span><span>5 values extracted</span></div><button className="dark-button" onClick={onReview}>Review extracted values <ChevronRight size={17}/></button></div></article>
    <article className="document-card"><div className="document-preview done"><Check size={24}/></div><div className="document-copy"><div><h3>2025 W-2</h3><p>Beacon Health · Maya Flores</p></div><StatusBadge status="verified"/><div className="document-meta"><span>Uploaded Aug 12</span><span>Reviewed Aug 14</span></div><button className="outline-button" onClick={onReview}>View details <ChevronRight size={17}/></button></div></article>
    <article className="document-card muted-card"><div className="document-preview locked"><LockKeyhole size={22}/></div><div className="document-copy"><div><h3>Engagement letter</h3><p>MiraFlores Tax · Signed copy</p></div><StatusBadge status="locked"/><div className="document-meta"><span>Signed Aug 10</span><span>Final document</span></div><button className="outline-button">View document <ChevronRight size={17}/></button></div></article>
  </section>
}

function FieldRow({field,value,approved,onChange,onSelect,onApprove}:{field:Field;value:string;approved:boolean;onChange:(v:string)=>void;onSelect:()=>void;onApprove:()=>void}) {
  const effective: Status = approved ? 'verified' : field.status
  return <div className={`field-row field-${effective}`}><div className="field-label"><span>{field.label}</span>{field.source && <small>{field.source}</small>}</div><div className="field-value">{field.status === 'editable' ? <div className="editable-wrap"><input aria-label={field.label} value={value} onChange={e => onChange(e.target.value)}/><Pencil size={15}/></div> : <button className="value-button" onClick={onSelect}>{value}<ChevronRight size={16}/></button>}<StatusBadge status={effective}/><small>{approved ? 'Verified by Jordan Lee, CPA just now' : field.detail}</small></div>{field.status === 'approval' && !approved && <button className="approve-button" onClick={onApprove}><Check size={15}/>Verify value</button>}{field.status === 'locked' && <button className="why-link" onClick={onSelect}>Why?</button>}</div>
}

function StatusBadge({status}:{status:Status}) { const item=statusMeta[status], Icon=item.icon; return <span className={`status-badge status-${status}`}><Icon size={13}/>{item.label}</span> }
function explanation(status:Status) { return status === 'locked' ? 'This value is calculated from CPA-verified payroll fields. A CPA must change its source values to update it.' : status === 'ai' ? 'The value was extracted by AI and remains unverified until a CPA checks it against the source document.' : status === 'approval' ? 'The value looks unusual compared with related information and requires CPA review.' : 'Its status shows whether it can be edited and whether a CPA has reviewed it.' }

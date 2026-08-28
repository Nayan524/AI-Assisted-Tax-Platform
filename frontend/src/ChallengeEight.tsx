import { useEffect, useRef, useState, type DragEvent } from 'react'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { AlertTriangle, ArrowLeft, Bot, Check, CheckCircle2, ChevronRight, Download, FileCheck2, FileText, History, Info, LockKeyhole, MessageCircle, Pencil, ScanText, ShieldCheck, Trash2, Upload, X } from 'lucide-react'
import { getMockAiReview } from './mockAi'

type Status = 'ai' | 'verified' | 'approval' | 'locked' | 'editable'
GlobalWorkerOptions.workerSrc = pdfWorker

type Field = { label: string; value: string; status: Status; detail: string; source?: string; sourceValue?: string; page?: number; transformation?: string; bbox?: [number,number,number,number] }

const fields: Field[] = [
  { label: 'Employer name', value: 'Northstar Design Group', status: 'verified', detail: 'Verified by Jordan Lee, CPA on Aug 19', source: 'W-2 · Box c', sourceValue: 'NORTHSTAR DESIGN GROUP', page: 1, transformation: 'Capitalization normalized for display', bbox:[.038,.199,.461,.114] },
  { label: 'Wages, tips, other compensation', value: '$86,420.00', status: 'ai', detail: 'Extracted with 98% confidence', source: 'W-2 · Box 1', sourceValue: '86420.00', page: 1, transformation: 'Formatted as currency; numeric value unchanged', bbox:[.726,.114,.274,.085] },
  { label: 'Federal income tax withheld', value: '$12,636.00', status: 'approval', detail: 'Different from prior-year pattern', source: 'W-2 · Box 2', sourceValue: '12636.00', page: 1, transformation: 'Formatted as currency; numeric value unchanged', bbox:[.499,.199,.227,.057] },
  { label: 'Social Security wages', value: '$86,420.00', status: 'locked', detail: 'Calculated from verified payroll data', source: 'W-2 · Box 3', sourceValue: '86420.00', page: 1, transformation: 'Formatted as currency and locked after CPA verification', bbox:[.726,.199,.274,.057] },
  { label: 'Occupation', value: 'Product designer', status: 'editable', detail: 'Client-provided answer · Editable by CPA', source: 'Client questionnaire · Employment', sourceValue: 'Product designer', page: 1, transformation: 'No transformation' },
]

const statusMeta: Record<Status, { label: string; icon: typeof Bot }> = {
  ai: { label: 'AI extracted', icon: Bot }, verified: { label: 'CPA verified', icon: ShieldCheck },
  approval: { label: 'Needs CPA review', icon: Info }, locked: { label: 'Calculated · locked', icon: LockKeyhole }, editable: { label: 'CPA editable', icon: Pencil },
}

const reviewableLabels=fields.filter(field=>field.status==='ai'||field.status==='approval').map(field=>field.label)
export function getReviewQueueCount(clientId:string){let reviewed:string[]=[];try{reviewed=JSON.parse(sessionStorage.getItem(`reviewed-fields-${clientId}`)||'[]')}catch{/* none reviewed */}return reviewableLabels.filter(label=>!reviewed.includes(label)).length}
function recordReviewedField(clientId:string,label:string){let reviewed:string[]=[];try{reviewed=JSON.parse(sessionStorage.getItem(`reviewed-fields-${clientId}`)||'[]')}catch{/* start fresh */}if(!reviewed.includes(label))sessionStorage.setItem(`reviewed-fields-${clientId}`,JSON.stringify([...reviewed,label]));dispatchEvent(new Event('workspace-counts-changed'))}

export function ChallengeEight({role = 'cpa', clientId='flores-2025', clientName = 'Maya & Daniel Flores', onUploadComplete}: {role?: 'client' | 'cpa'; clientId?:string; clientName?: string; onUploadComplete?:()=>void}) {
  const [screen, setScreen] = useState<'documents' | 'return'>('documents')
  const [selected, setSelected] = useState<Field | null>(null)
  const [values, setValues] = useState<Record<string,string>>(() => Object.fromEntries(fields.map(f => [f.label, f.value])))
  const [approved, setApproved] = useState(false)
  if (role === 'client') return <ClientDocuments onContinue={onUploadComplete}/>
  return <div className="review-page">
    <div className="assignment-context"><span>ASSIGNED CLIENT</span><strong>{clientName}</strong><small>2025 individual return</small></div>
    <div className="review-title"><div><div className="eyebrow">CPA REVIEW WORKSPACE</div><h1>Review Details</h1></div><div className="review-progress"><CheckCircle2 size={18}/><span><strong>3 of 4 documents reviewed</strong><small>Client access is restricted</small></span></div></div>
    <div className="screen-tabs" role="tablist"><button className={screen === 'documents' ? 'selected' : ''} onClick={() => setScreen('documents')}><FileText size={17}/>Source documents</button><button className={screen === 'return' ? 'selected' : ''} onClick={() => setScreen('return')}><FileCheck2 size={17}/>CPA review</button></div>
    <div className="affordance-key"><strong>How to read this screen</strong>{(['editable','ai','verified','approval','locked'] as Status[]).map(status => <StatusBadge key={status} status={status}/>)}</div>
    {screen === 'documents' ? <Documents onReview={() => setScreen('return')}/> : <section className="return-card">
      <div className="return-header"><div><span className="section-number">W-2</span><div><h2>Wages and withholding</h2><p>Northstar Design Group · Daniel Flores</p></div></div><button className="source-link" onClick={() => setScreen('documents')}>View source document <ChevronRight size={16}/></button></div>
      <div className="field-table">{fields.map(field => <FieldRow key={field.label} field={field} value={values[field.label]} approved={approved && field.status === 'approval'} onChange={value => setValues({...values,[field.label]:value})} onSelect={() => setSelected(field)} onApprove={() => {setApproved(true);recordReviewedField(clientId,field.label)}}/>)}</div>
      <div className="return-footer"><span><Check size={16}/>CPA changes save automatically</span></div>
    </section>}
    {selected && <div className="explain-panel trace-panel"><button className="panel-close" onClick={() => setSelected(null)}>×</button><StatusBadge status={selected.status}/><h3>{selected.label}</h3><p>{selected.detail}</p><AiTrustPanel field={{...selected,value:values[selected.label]}} onApply={value=>{setValues(current=>({...current,[selected.label]:value}));recordReviewedField(clientId,selected.label);if(selected.status==='approval')setApproved(true)}}/><SourceTrace field={{...selected,value:values[selected.label]}}/><div className="why-box"><strong>Why is this {selected.status === 'locked' ? 'read only' : 'shown this way'}?</strong><p>{explanation(selected.status)}</p></div></div>}
  </div>
}

function ClientDocuments({onContinue}:{onContinue?:()=>void}) {
  const inputRef=useRef<HTMLInputElement>(null)
  const [uploaded,setUploaded]=useState<string[]>(()=>JSON.parse(sessionStorage.getItem('client-uploaded-files')||'[]'))
  const [uploadedUrls,setUploadedUrls]=useState<Record<string,string>>({})
  const [preview,setPreview]=useState<{name:string;url:string;type:'pdf'|'image'}|null>(null)
  const [clientTab,setClientTab]=useState<'upload'|'files'>('upload')
  const [dragging,setDragging]=useState(false)
  const [removalTarget,setRemovalTarget]=useState<{name:string;reviewed:boolean}|null>(null)
  const [removalReason,setRemovalReason]=useState('')
  const [removed,setRemoved]=useState<{name:string;time:string;reason:string}[]>(()=>JSON.parse(sessionStorage.getItem('client-removed-documents')||'[]'))
  function accept(files:FileList|null){if(!files?.length)return;const chosen=Array.from(files);setUploadedUrls(previous=>({...previous,...Object.fromEntries(chosen.map(file=>[file.name,URL.createObjectURL(file)]))}));setUploaded(previous=>{const next=[...chosen.map(file=>file.name),...previous];sessionStorage.setItem('client-uploaded-files',JSON.stringify(next));return next})}
  function drop(event:DragEvent<HTMLButtonElement>){event.preventDefault();setDragging(false);accept(event.dataTransfer.files)}
  function confirmRemoval(){if(!removalTarget)return;const entry={name:removalTarget.name,time:'Just now',reason:removalReason.trim()||'Client is replacing this document'};const nextRemoved=[entry,...removed];setRemoved(nextRemoved);sessionStorage.setItem('client-removed-documents',JSON.stringify(nextRemoved));setUploaded(previous=>{const next=previous.filter(name=>name!==removalTarget.name);sessionStorage.setItem('client-uploaded-files',JSON.stringify(next));return next});const stored=sessionStorage.getItem('mock-collaboration-threads');const cases=stored?JSON.parse(stored):[];const existing=cases.find((item:{id:string})=>item.id==='replacement-w2');const replacement={id:'replacement-w2',title:`Replacement needed: ${removalTarget.name}`,kind:'Document removal',status:'Waiting on client',owner:'Maya Flores',document:`Removed · ${removalTarget.name}`,context:'Removed client document',field:'Linked extracted values',value:'Invalidated pending replacement',reason:'The client removed this document. Jordan Lee was notified and any linked extracted values must be reviewed again.',action:`Upload a replacement for ${removalTarget.name}`,messages:[{id:Date.now(),author:'Maya Flores',role:'client',body:`I removed ${removalTarget.name}. Reason: ${entry.reason}`,time:'Just now'}]};sessionStorage.setItem('mock-collaboration-threads',JSON.stringify(existing?cases.map((item:{id:string})=>item.id===existing.id?replacement:item):[replacement,...cases]));setRemovalTarget(null);setRemovalReason('')}
  return <div className="review-page client-documents"><button className="status-back-home" onClick={()=>{location.hash='#home'}}><ArrowLeft size={15}/>Back to Home</button>
    <div className="review-title"><div><div className="eyebrow">2025 INDIVIDUAL RETURN</div><h1>Your documents</h1><p>Upload documents in one place and track when your tax team receives them.</p></div></div>
    <div className="screen-tabs client-document-tabs" role="tablist"><button className={clientTab==='upload'?'selected':''} onClick={()=>setClientTab('upload')}><Upload size={17}/>Upload documents</button><button className={clientTab==='files'?'selected':''} onClick={()=>setClientTab('files')}><FileText size={17}/>Uploaded files <span className="review-count">{6+uploaded.length-(removed.some(item=>item.name==='2025 W-2 · Northstar Design Group')?1:0)}</span></button></div>
    {clientTab==='upload'?<>
      <input ref={inputRef} className="visually-hidden" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={event=>accept(event.target.files)}/>
      <button className={`single-upload-zone ${dragging?'dragging':''}`} onClick={()=>inputRef.current?.click()} onDragOver={event=>{event.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={drop}><Upload size={25}/><span><strong>Drop your files here</strong><small>or click anywhere to choose PDF, JPG, or PNG files</small></span></button>
      {uploaded.length>0&&<div className="upload-success"><CheckCircle2 size={18}/><div><strong>Latest upload received</strong><span>{uploaded[0]} · Available to your CPA</span></div><button className="outline-button" onClick={()=>setClientTab('files')}>View uploaded files</button>{onContinue&&<button className="dark-button" onClick={onContinue}>Continue to next step <ChevronRight size={16}/></button>}</div>}
      <div className="client-boundary"><LockKeyhole size={18}/><div><strong>Your tax team handles verification</strong><span>You only need to upload clear, complete documents. Extracted tax values are reviewed privately by your CPA.</span></div></div>
      <section className="message-guidance"><MessageCircle/><div><strong>Does your CPA need something else?</strong><span>Additional questions and clarification requests will appear in Messages.</span></div><a href="#messages">Open messages <ChevronRight size={16}/></a></section>
    </>:<>
      <div className="uploaded-files-heading"><div><h2>Uploaded files</h2><p>Files you have submitted to MiraFlores Tax.</p></div><button className="outline-button" onClick={()=>setClientTab('upload')}><Upload size={16}/>Upload more</button></div>
      {uploaded.length>0&&<section className="recent-uploads">{uploaded.map((name,index)=><div className="uploaded-file-row" key={`${name}-${index}`}><span className="file-type">{name.split('.').pop()?.toUpperCase()||'FILE'}</span><div><strong>{name}</strong><small>Uploaded this session · Received</small></div><span className="client-status received"><Check size={12}/>Received</span>{uploadedUrls[name]&&<button className="outline-button" onClick={()=>setPreview({name,url:uploadedUrls[name],type:/\.(jpg|jpeg|png)$/i.test(name)?'image':'pdf'})}>View file</button>}<button className="remove-file-button" onClick={()=>setRemovalTarget({name,reviewed:false})} aria-label={`Remove ${name}`}><Trash2 size={14}/>Remove</button></div>)}</section>}
      <section className="document-grid">{!removed.some(item=>item.name==='2025 W-2 · Northstar Design Group')&&<ClientDocument title="2025 W-2" subtitle="Northstar Design Group · Daniel Flores" status="Under CPA review" meta="Uploaded Aug 18" onView={()=>setPreview({name:'2025 W-2 · Northstar Design Group.pdf',url:'/sample-w2-2025.pdf',type:'pdf'})} onRemove={()=>setRemovalTarget({name:'2025 W-2 · Northstar Design Group',reviewed:true})}/>}<ClientDocument title="2025 W-2" subtitle="Beacon Health · Maya Flores" status="Received" meta="Uploaded Aug 12" onView={()=>setPreview({name:'2025 W-2 · Beacon Health.pdf',url:'/sample-w2-beacon-2025.pdf',type:'pdf'})}/><ClientDocument title="2025 1099-INT" subtitle="First Community Bank · Maya Flores" status="Received" meta="Uploaded Aug 14" onView={()=>setPreview({name:'2025 1099-INT · First Community Bank.pdf',url:'/sample-1099-int-2025.pdf',type:'pdf'})}/><ClientDocument title="2025 1099-NEC" subtitle="Cedar Street Creative · Daniel Flores" status="Received" meta="Uploaded Aug 15" onView={()=>setPreview({name:'2025 1099-NEC · Cedar Street Creative.pdf',url:'/sample-1099-nec-2025.pdf',type:'pdf'})}/><ClientDocument title="2025 Form 1098" subtitle="Harbor Home Lending · Mortgage interest" status="Received" meta="Uploaded Aug 16" onView={()=>setPreview({name:'2025 Form 1098 · Harbor Home Lending.pdf',url:'/sample-1098-2025.pdf',type:'pdf'})}/><ClientDocument title="Engagement letter" subtitle="MiraFlores Tax · Signed copy" status="Complete" meta="Signed Aug 10" complete onView={()=>setPreview({name:'2025 Engagement letter · Signed.pdf',url:'/sample-engagement-letter-2025.pdf',type:'pdf'})}/></section>
      {removed.length>0&&<section className="removal-audit"><div className="removal-audit-heading"><History size={17}/><div><strong>Document removal history</strong><span>Removed files remain in the audit record and are no longer used for tax values.</span></div></div>{removed.map((item,index)=><div className="removed-document-row" key={`${item.name}-${index}`}><FileText size={17}/><span><strong>{item.name}</strong><small>Removed by Maya Flores · {item.time} · {item.reason}</small></span><em>CPA notified</em></div>)}</section>}
    </>}
    {preview&&<DocumentPreview document={preview} onClose={()=>setPreview(null)}/>} 
    {removalTarget&&<div className="removal-modal-backdrop" onMouseDown={event=>event.target===event.currentTarget&&setRemovalTarget(null)}><section className="removal-modal" role="dialog" aria-modal="true" aria-labelledby="remove-document-title"><button className="removal-close" onClick={()=>setRemovalTarget(null)} aria-label="Close"><X size={18}/></button><span className="removal-warning-icon"><AlertTriangle size={22}/></span><div className="eyebrow">DOCUMENT IMPACT REVIEW</div><h2 id="remove-document-title">{removalTarget.reviewed?'Request removal of this document?':'Remove this uploaded document?'}</h2><p><strong>{removalTarget.name}</strong> will no longer be available as an active source document.</p>{removalTarget.reviewed?<div className="removal-impact"><strong>This document is already in CPA review</strong><ul><li>Five extracted tax values will be marked invalid.</li><li>The linked W-2 case will reopen.</li><li>Jordan Lee, CPA will be notified.</li><li>You will be asked to upload a replacement.</li></ul></div>:<div className="removal-impact simple"><strong>Your CPA will be notified</strong><span>A replacement-document case will be created so the return does not proceed with missing information.</span></div>}<label>Reason for removal <span>Optional</span><textarea value={removalReason} onChange={event=>setRemovalReason(event.target.value)} placeholder="Example: I uploaded the wrong version"/></label><div className="removal-actions"><button className="outline-button" onClick={()=>setRemovalTarget(null)}>Keep document</button><button className="danger-button" onClick={confirmRemoval}><Trash2 size={15}/>{removalTarget.reviewed?'Request removal & replace':'Remove & replace'}</button></div><small className="audit-note"><LockKeyhole size={12}/>This action is recorded in the return audit history.</small></section></div>}
  </div>
}

function ClientDocument({title,subtitle,status,meta,complete=false,onView,onRemove}:{title:string;subtitle:string;status:string;meta:string;complete?:boolean;onView:()=>void;onRemove?:()=>void}) {
  return <article className="document-card"><div className={`document-preview ${complete ? 'done' : ''}`}>{complete ? <Check size={24}/> : <><span>{title.includes('1099')?'1099':title.includes('1098')?'1098':'W-2'}</span><div className="paper-lines"/></>}</div><div className="document-copy"><div><h3>{title}</h3><p>{subtitle}</p></div><span className={`client-status ${complete ? 'received' : 'reviewing'}`}>{complete && <Check size={12}/>} {status}</span><div className="document-meta"><span>{meta}</span><span>{complete?'Protected record':'Available to your CPA'}</span></div><div className="document-card-actions"><button className="outline-button" onClick={onView}>View uploaded file <ChevronRight size={17}/></button>{onRemove&&<button className="remove-document-button" onClick={onRemove}><Trash2 size={14}/>Request removal</button>}</div></div></article>
}

function DocumentPreview({document,onClose}:{document:{name:string;url:string;type:'pdf'|'image'};onClose:()=>void}){
  return <div className="document-viewer-backdrop" onMouseDown={event=>event.target===event.currentTarget&&onClose()}><section className="document-viewer" role="dialog" aria-modal="true" aria-labelledby="document-preview-title"><header><div><small>UPLOADED DOCUMENT</small><strong id="document-preview-title">{document.name}</strong></div><a href={document.url} download={document.name}><Download size={15}/>Download</a><button onClick={onClose} aria-label="Close uploaded document"><X size={18}/></button></header><div className="document-viewer-body">{document.type==='image'?<img src={document.url} alt={document.name}/>:<iframe src={`${document.url}#view=FitH`} title={document.name}/>}</div></section></div>
}

function Documents({onReview}: {onReview: () => void}) {
  const documents = [
    {name:'2025 W-2 — Northstar Design Group — Daniel Flores.pdf',url:'/sample-w2-2025.pdf'},
    {name:'2025 W-2 — Beacon Health — Maya Flores.pdf',url:'/sample-w2-beacon-2025.pdf'},
    {name:'2025 1099-INT — First Community Bank — Maya Flores.pdf',url:'/sample-1099-int-2025.pdf'},
    {name:'2025 1099-NEC — Cedar Street Creative — Daniel Flores.pdf',url:'/sample-1099-nec-2025.pdf'},
    {name:'2025 Form 1098 — Harbor Home Lending.pdf',url:'/sample-1098-2025.pdf'},
    {name:'Engagement letter — Signed copy.pdf',url:'/sample-engagement-letter-2025.pdf'},
  ]
  return <section className="source-document-list" aria-label="Source documents">
    {documents.map(document => <div className="source-document-row" key={document.name}>
      <span>{document.name}</span>
      <div className="source-document-actions">
        <a href={document.url} download={document.name} aria-label={`Download ${document.name}`} title="Download document"><Download size={17}/></a>
        <button onClick={onReview} aria-label={`View details for ${document.name}`} title="View details"><ChevronRight size={19}/></button>
      </div>
    </div>)}
  </section>
}

function FieldRow({field,value,approved,onChange,onSelect,onApprove}:{field:Field;value:string;approved:boolean;onChange:(v:string)=>void;onSelect:()=>void;onApprove:()=>void}) {
  const effective: Status = approved ? 'verified' : field.status
  const aiReview=getMockAiReview(field.label,value)
  const lowConfidence=!approved&&(field.status==='ai'||field.status==='approval')&&aiReview.confidence<90
  return <div className={`field-row field-${effective} ${lowConfidence?'confidence-review':''}`}><div className="field-label"><span>{field.label}</span>{field.source && <small>{field.source}</small>}{lowConfidence&&<strong className="confidence-flag"><AlertTriangle size={12}/>{aiReview.confidence}% confidence · CPA review required</strong>}</div><div className="field-value">{field.status === 'editable' ? <div className="editable-wrap"><input aria-label={field.label} value={value} onChange={e => onChange(e.target.value)}/><Pencil size={15}/></div> : <button className="value-button" onClick={onSelect}>{value}<ChevronRight size={16}/></button>}<StatusBadge status={effective}/><small>{approved ? 'Verified by Jordan Lee, CPA just now' : field.detail}</small></div>{field.status === 'approval' && !approved && <button className="approve-button" onClick={onApprove}><Check size={15}/>Verify value</button>}{field.status === 'locked' && <button className="why-link" onClick={onSelect}>Why?</button>}</div>
}

function StatusBadge({status}:{status:Status}) { const item=statusMeta[status], Icon=item.icon;const preview=status==='editable'?'You can change this value directly before confirming it.':status==='ai'?'AI read this value from the source document. It still needs CPA confirmation.':undefined;return <span className={`status-badge status-${status}`} data-preview={preview} tabIndex={preview?0:undefined}><Icon size={13}/>{item.label}</span> }
function AiTrustPanel({field,onApply}:{field:Field;onApply:(value:string)=>void}) {
  const review=getMockAiReview(field.label,field.value)
  const [correcting,setCorrecting]=useState(false)
  const [draft,setDraft]=useState(field.value)
  const [reason,setReason]=useState('Source document confirms this value')
  const [saved,setSaved]=useState(false)
  function apply(value:string){onApply(value);setSaved(true);setCorrecting(false)}
  return <section className="ai-trust-card"><div className="ai-trust-heading"><span><Bot size={15}/>AI ASSISTANCE</span><strong>{review.confidence}% confidence · {review.uncertainty} uncertainty</strong></div><h4>{review.summary}</h4><p>{review.rationale}</p><div className="ai-evidence"><strong>Evidence used</strong>{review.evidence.map(item=><span key={item}><Check size={12}/>{item}</span>)}</div><div className="ai-next-action"><small>RECOMMENDED NEXT ACTION</small><strong>{review.action}</strong></div>{saved?<div className="ai-saved"><CheckCircle2 size={15}/><span><strong>CPA correction saved</strong><small>Recorded with your reason. Continue reviewing without losing your place.</small></span></div>:correcting?<div className="ai-correction"><label>Corrected value<input value={draft} onChange={event=>setDraft(event.target.value)}/></label><label>Reason<select value={reason} onChange={event=>setReason(event.target.value)}><option>Source document confirms this value</option><option>AI selected the wrong field</option><option>Client provided corrected information</option><option>Professional judgment</option></select></label><div><button onClick={()=>setCorrecting(false)}>Cancel</button><button className="primary" onClick={()=>apply(draft)} disabled={!draft.trim()}>Save correction</button></div></div>:<div className="ai-actions"><button onClick={()=>apply(review.suggestedValue)}><Check size={14}/>Accept suggestion</button><button onClick={()=>{setDraft(field.value);setCorrecting(true)}}><Pencil size={14}/>Correct AI</button></div>}</section>
}
function SourceTrace({field}:{field:Field}) {
  const box=field.source?.split('·').pop()?.trim()||'Answer'
  const isW2=field.source?.startsWith('W-2')
  return <div className="source-trace"><div className="trace-heading"><div><span>SOURCE OF TRUTH</span><strong>{isW2?'sample-w2-2025.pdf':'Client questionnaire'}</strong></div><small>Page {field.page||1} · {box}</small></div>{isW2?<PdfSourceViewer field={field}/>:<div className="questionnaire-source"><small>Employment details · Occupation</small><strong className="source-highlight">{field.sourceValue}</strong></div>}<div className="trace-mapping"><div><span>Source value</span><strong>{field.sourceValue}</strong></div><ChevronRight/><div><span>Return value</span><strong>{field.value}</strong></div></div><div className="transformation"><strong>Transformation</strong><span>{field.transformation}</span></div></div>
}
function PdfSourceViewer({field}:{field:Field}) {
  const canvasRef=useRef<HTMLCanvasElement>(null)
  const [loading,setLoading]=useState(true)
  const [expanded,setExpanded]=useState(false)
  useEffect(()=>{let cancelled=false;async function render(){setLoading(true);const pdf=await getDocument({url:'/sample-w2-2025.pdf'}).promise;const page=await pdf.getPage(field.page||1);const base=page.getViewport({scale:1});const width=expanded?Math.min(window.innerWidth-120,1050):430;const viewport=page.getViewport({scale:width/base.width});const canvas=canvasRef.current;if(!canvas||cancelled)return;const ratio=devicePixelRatio||1;canvas.width=viewport.width*ratio;canvas.height=viewport.height*ratio;canvas.style.width=`${viewport.width}px`;canvas.style.height=`${viewport.height}px`;const context=canvas.getContext('2d');if(!context)return;await page.render({canvas,canvasContext:context,viewport,transform:ratio!==1?[ratio,0,0,ratio,0,0]:undefined}).promise;if(!cancelled)setLoading(false)}render();return()=>{cancelled=true}},[field,expanded])
  const [x,y,w,h]=field.bbox||[0,0,0,0]
  const viewer=<div className={`pdf-source-viewer ${expanded?'expanded':''}`}>{loading&&<div className="pdf-loading">Rendering original PDF…</div>}<canvas ref={canvasRef}/><div className="pdf-highlight" style={{left:`${x*100}%`,top:`${y*100}%`,width:`${w*100}%`,height:`${h*100}%`}}><span>{field.source} · {field.sourceValue}</span></div>{!expanded&&<button className="open-pdf-button" onClick={()=>setExpanded(true)}>Open full document</button>}</div>
  return expanded?<div className="full-pdf-backdrop"><div className="full-pdf-header"><button onClick={()=>setExpanded(false)}>← Back to CPA review</button><div><strong>sample-w2-2025.pdf</strong><span>Page {field.page||1} · Highlighting {field.source}</span></div></div>{viewer}</div>:viewer
}
function explanation(status:Status) { return status === 'locked' ? 'This value is calculated from CPA-verified payroll fields. A CPA must change its source values to update it.' : status === 'ai' ? 'The value was extracted by AI and remains unverified until a CPA checks it against the source document.' : status === 'approval' ? 'The value looks unusual compared with related information and requires CPA review.' : 'Its status shows whether it can be edited and whether a CPA has reviewed it.' }

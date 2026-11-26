import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {useRoleSession} from '../services/roleAuth.js';
import {subscribeToOwnRequests,subscribeToStudentRequests,submitCardPayment,reviewCardPayment,CARD_SERVICE} from '../services/requestService.js';

function date(value){return value?.toDate?value.toDate().toLocaleString():String(value||'—');}
function download(name,blob){
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download=name;a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function downloadProof(p){
 const bytes=Uint8Array.from(atob(p.proofData),c=>c.charCodeAt(0));
 download(p.proofName,new Blob([bytes],{type:p.proofType}));
}
function receipt(record){
 const p=record.payment;
 if(p?.status!=='Verified')return;
 const contents=['LIMKOKWING STUDENT SERVICES','PAYMENT RECEIPT','Receipt: '+p.receiptNumber,'Request: '+record.id,'Student: '+record.studentName,'Student number: '+record.studentId,'Service: '+record.serviceName,'Amount received: M450.00','Payment reference: '+p.reference,'Verified on: '+date(p.reviewedAt),'Status: PAYMENT VERIFIED','This receipt confirms administrator verification of the submitted payment.'].join('\n');
 download(p.receiptNumber+'.txt',new Blob([contents],{type:'text/plain;charset=utf-8'}));
}
function PaymentForm({record}){
 const [reference,setReference]=useState('');
 const [file,setFile]=useState(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 return <form style={{display:'grid',gap:10,maxWidth:620}} onSubmit={async e=>{e.preventDefault();if(busy)return;setBusy(true);setError('');try{await submitCardPayment(record.id,reference,file);}catch(err){setError(err.message);}finally{setBusy(false);}}}>
 <p>Pay M450.00 using the university's approved payment channel, then enter the payment reference and attach your proof. This portal does not debit your bank account.</p>
 <label>Payment reference<input style={{display:'block',width:'100%',padding:10}} value={reference} onChange={e=>setReference(e.target.value)} required minLength={3} maxLength={100}/></label>
 <label>Proof of payment (PDF or image, max 400 KB)<input style={{display:'block',width:'100%',padding:10}} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required onChange={e=>setFile(e.target.files[0]||null)}/></label>
 {error&&<p role="alert">{error}</p>}
 <button className="reference-primary-button" type="submit" disabled={busy||!file}>{busy?'Submitting…':'Submit payment for verification'}</button>
 </form>;
}
function Review({record}){
 const [reason,setReason]=useState('');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 async function action(approve){setBusy(true);setError('');try{await reviewCardPayment(record.id,approve,reason);}catch(err){setError(err.message);}finally{setBusy(false);}}
 return <div style={{display:'grid',gap:10,maxWidth:620}}>
 <p>Reference: {record.payment.reference}. Confirm that M450.00 was received before verifying.</p>
 <button type="button" className="reference-primary-button" onClick={()=>downloadProof(record.payment)}>Download submitted proof</button>
 <button type="button" className="reference-primary-button" disabled={busy} onClick={()=>action(true)}>Verify M450 and issue receipt</button>
 <label>Reason if rejecting<input style={{display:'block',width:'100%',padding:10}} value={reason} onChange={e=>setReason(e.target.value)} maxLength={300}/></label>
 <button type="button" className="reference-primary-button" disabled={busy||reason.trim().length<3} onClick={()=>action(false)}>Reject payment proof</button>
 {error&&<p role="alert">{error}</p>}
 </div>;
}
export default function ServicePaymentsPage({paymentsOnly=false}){
 const session=useRoleSession();
 const admin=session?.role==='admin';
 const [records,setRecords]=useState([]);
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(true);
 useEffect(()=>{
   setRecords([]);setError('');setLoading(true);
   if(!session?.id||!['student','admin'].includes(session.role)){setLoading(false);return;}
   const receive=rows=>{setRecords(rows);setLoading(false);};
   const fail=err=>{setError(err.message);setLoading(false);};
   try{return admin?subscribeToStudentRequests(receive,fail):subscribeToOwnRequests(session.id,receive,fail);}
   catch(err){fail(err);}
 },[session?.id,session?.role,admin]);
 const visible=records.filter(r=>!(admin||paymentsOnly)||r.serviceId===CARD_SERVICE&&r.fee===450);
 return <section className="reference-dashboard"><div className="reference-heading"><div><h1>{admin?'Payment Verification':paymentsOnly?'Service Payments':'My Requests'}</h1><p>{admin?'Review student card payments and issue receipts.':'No standing tuition balance is charged by this portal. Only student card replacement requests cost M450.'}</p></div></div>
 {!admin&&<Link className="reference-primary-button" to="/request?service=student-id-replacement">Request student card — M450</Link>}
 {loading&&<p role="status">Loading records…</p>}{error&&<p role="alert">{error}</p>}
 {!loading&&!error&&!visible.length&&<div className="reference-card" style={{padding:20}}>No {admin||paymentsOnly?'card payment':'request'} records yet.</div>}
 <div style={{display:'grid',gap:14,marginTop:16}}>
 {visible.map(record=><article key={record.id} className="reference-card" style={{padding:20,display:'grid',gap:10,minWidth:0,overflowWrap:'anywhere'}}>
 <h2>{record.serviceName}</h2><p>Request reference: {record.id} · Request status: {record.status}</p>{admin&&<p>{record.studentName} · {record.studentId}</p>}
 {record.serviceId===CARD_SERVICE&&record.fee===450&&<><strong>Service fee: M450.00</strong><p>Payment status: {record.payment?.status}</p>
 {record.payment?.rejectionReason&&<p>Rejection reason: {record.payment.rejectionReason}</p>}
 {!admin&&record.status!=='Rejected'&&['Awaiting payment','Payment rejected'].includes(record.payment?.status)&&<PaymentForm record={record}/>}
 {admin&&record.payment?.status==='Pending verification'&&record.status!=='Rejected'&&<Review record={record}/>}
 {!admin&&record.payment?.status==='Pending verification'&&<p>Your proof has been submitted. Awaiting administrator verification.</p>}
 {record.payment?.status==='Verified'&&<><p>Receipt: {record.payment.receiptNumber} · Verified {date(record.payment.reviewedAt)}</p><button className="reference-primary-button" type="button" onClick={()=>receipt(record)}>Download official portal payment receipt</button></>}
 </>}
 </article>)}
 </div></section>;
}

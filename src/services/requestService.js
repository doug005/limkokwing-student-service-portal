import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  runTransaction,
} from 'firebase/firestore';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, db, requireFirebase } from './firebase.js';

export const REQUEST_COLLECTION = 'studentRequests';
export const REQUEST_STATUSES = ['Pending', 'In Progress', 'Completed', 'Rejected'];

export async function createStudentRequest(request) {
  const { db: firestore } = requireFirebase();
  const owner = auth.currentUser;
  if (!owner) throw new Error('Sign in to submit a request.');
  const card = request.serviceId === 'student-id-replacement';
  const savedRequest = {
    ownerUid: owner.uid,
    fee: card ? 450 : 0,
    payment: { status: card ? 'Awaiting payment' : 'Not required' },
    studentName: request.studentName.trim(),
    studentId: request.studentId.trim(),
    email: request.email.trim().toLowerCase(),
    serviceId: request.serviceId,
    serviceName: request.serviceName,
    description: request.description.trim(),
    requestDate: request.requestDate,
    status: 'Pending',
    createdAt: serverTimestamp(),
  };
  const documentReference = await addDoc(collection(firestore, REQUEST_COLLECTION), savedRequest);

  return {
    ...savedRequest,
    id: documentReference.id,
    createdAt: new Date().toISOString(),
  };
}

export function subscribeToStudentRequests(onRequests, onError) {
  const { db: firestore } = requireFirebase();
  const requestsQuery = query(
    collection(firestore, REQUEST_COLLECTION),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(
    requestsQuery,
    (snapshot) => {
      onRequests(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    },
    (error) => onError(error),
  );
}

export async function updateStudentRequestStatus(requestId, status) {
  const { db: firestore } = requireFirebase();
  if (!REQUEST_STATUSES.includes(status)) {
    throw new Error('Choose a valid request status.');
  }
  await updateDoc(doc(firestore, REQUEST_COLLECTION, requestId), { status });
}

export async function deleteStudentRequest(requestId) {
  const { db: firestore } = requireFirebase();
  await deleteDoc(doc(firestore, REQUEST_COLLECTION, requestId));
}

export function observeAdminAuth(onUser, onError) {
  const { auth: firebaseAuth } = requireFirebase();
  return onAuthStateChanged(firebaseAuth, onUser, onError);
}

export async function signInRequestManager(email, password) {
  const { auth: firebaseAuth } = requireFirebase();
  const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
  return credential.user;
}

export async function signOutRequestManager() {
  const { auth: firebaseAuth } = requireFirebase();
  await signOut(firebaseAuth);
}

export async function hasRequestManagerAccess(userId) {
  const { db: firestore } = requireFirebase();
  const roleDocument = await getDoc(doc(firestore, 'admins', userId));
  if (roleDocument.exists()) return true;
  const profile = await getDoc(doc(firestore, 'portalDirectory', userId));
  return profile.exists() && profile.data().role === 'admin' && profile.data().status === 'Active';
}

export function currentFirebaseUser() {
  return auth?.currentUser ?? null;
}

export const CARD_FEE = 450;
export const CARD_SERVICE = 'student-id-replacement';
export function subscribeToOwnRequests(uid,onRequests,onError) {
  const {db:firestore}=requireFirebase();
  return onSnapshot(query(collection(firestore,REQUEST_COLLECTION),where('ownerUid','==',uid)),snap=>{
    const records=snap.docs.map(d=>({...d.data(),id:d.id}));
    records.sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    onRequests(records);
  },onError);
}
export async function readPaymentProof(file) {
  if (!file || !['application/pdf','image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Choose a PDF, JPG, PNG or WebP proof of payment.');
  if (!file.size || file.size>400*1024) throw new Error('Proof must be at most 400 KB. Compress the file before uploading.');
  const data=await new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(String(reader.result).split(',')[1]);
    reader.onerror=()=>reject(new Error('Unable to read payment proof.'));
    reader.readAsDataURL(file);
  });
  return {proofName:file.name.slice(0,120),proofType:file.type,proofData:data};
}
export async function submitCardPayment(requestId,reference,file){
  const {db:firestore,auth:firebaseAuth}=requireFirebase();
  if(!firebaseAuth.currentUser)throw new Error('Sign in to submit payment proof.');
  const clean=String(reference||'').trim();
  if(clean.length<3||clean.length>100)throw new Error('Enter a valid payment reference.');
  const proof=await readPaymentProof(file);
  await runTransaction(firestore,async tx=>{
    const ref=doc(firestore,REQUEST_COLLECTION,requestId);
    const snap=await tx.get(ref);
    const record=snap.data();
    if(!record||record.ownerUid!==firebaseAuth.currentUser.uid||record.serviceId!==CARD_SERVICE||record.fee!==CARD_FEE||record.status==='Rejected'||!['Awaiting payment','Payment rejected'].includes(record.payment?.status))throw new Error('This request is not eligible for payment submission.');
    tx.update(ref,{payment:{status:'Pending verification',reference:clean,...proof,submittedAt:serverTimestamp()}});
  });
}
export async function reviewCardPayment(requestId,approve,reason=''){
  const {db:firestore,auth:firebaseAuth}=requireFirebase();
  const user=firebaseAuth.currentUser;
  if(!user||!await hasRequestManagerAccess(user.uid))throw new Error('Administrator access is required.');
  const clean=String(reason).trim();
  if(!approve&&(clean.length<3||clean.length>300))throw new Error('Enter a reason for rejecting payment proof.');
  await runTransaction(firestore,async tx=>{
    const ref=doc(firestore,REQUEST_COLLECTION,requestId);
    const snap=await tx.get(ref),record=snap.data();
    if(!record||record.serviceId!==CARD_SERVICE||record.fee!==CARD_FEE||record.status==='Rejected'||record.payment?.status!=='Pending verification')throw new Error('This payment is no longer awaiting verification.');
    const payment={...record.payment,status:approve?'Verified':'Payment rejected',reviewedAt:serverTimestamp(),reviewedBy:user.uid};
    if(approve)payment.receiptNumber='LIM-'+requestId;
    else payment.rejectionReason=clean;
    tx.update(ref,{payment});
  });
}

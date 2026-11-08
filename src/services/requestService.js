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
  const savedRequest = {
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
  return roleDocument.exists();
}

export function currentFirebaseUser() {
  return auth?.currentUser ?? null;
}

import { useEffect, useState } from 'react';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, inMemoryPersistence, setPersistence, createUserWithEmailAndPassword, deleteUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, onSnapshot, query, where, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, requireFirebase } from './firebase.js';
import { FACULTIES } from '../data/students.js';

const VALID_ROLES = new Set(['student','lecturer','admin']);
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const STUDENT_NUMBER_PATTERN = /^90101\d{4}$/;
const COLLECTION = 'portalDirectory';
export const DIRECTORY_STORAGE_KEY = 'limkokwing-portal-directory-v1';

export async function readPortalProfile(user) {
  if (!user) return null;
  const bootstrap = await getDoc(doc(db,'admins',user.uid));
  let profile;
  try { profile = await getDoc(doc(db,COLLECTION,user.uid)); }
  catch (error) { if (!bootstrap.exists()) throw error; }
  if (bootstrap.exists()) return {id:user.uid,role:'admin',status:'Active',name:profile?.data()?.name || user.displayName || 'Portal Administrator',email:user.email,identifier:user.email,bootstrap:true};
  if (!profile?.exists()) return null;
  const record = profile.data();
  if (!VALID_ROLES.has(record.role) || record.status !== 'Active') return null;
  return {...record,id:user.uid};
}

let directoryCache = [];
export function getDirectory(){ return directoryCache; }
export function subscribeToDirectory(onChange,onError=()=>{}) {
  if(!auth){onError(new Error('Firebase is not configured.'));return ()=>{};}
  let stop=()=>{}, generation=0;
  const emit = records => {directoryCache=records;onChange(records);};
  const off=onAuthStateChanged(auth,async user=>{
    const token=++generation;stop();emit([]);
    if(!user)return;
    try{
      const profile=await readPortalProfile(user);
      if(token!==generation || !profile)return;
      if(profile.role==='student'){emit([profile]);return;}
      const ref=profile.role==='admin'?collection(db,COLLECTION):query(collection(db,COLLECTION),where('role','==','student'),where('faculty','==',profile.faculty));
      stop=onSnapshot(ref,snap=>{
        const records=snap.docs.map(d=>({...d.data(),id:d.id}));
        if(!records.some(r=>r.id===profile.id))records.push(profile);
        emit(records);
      },err=>{emit([profile]);onError(err);});
    }catch(err){if(token===generation)onError(err);}
  },onError);
  return ()=>{generation++;stop();off();};
}
export function useDirectory(){
  const [records,setRecords]=useState([]);
  const [error,setError]=useState('');
  useEffect(()=>subscribeToDirectory(records=>{setRecords(records);setError('');},err=>setError(err.message||'Could not load Firebase directory.')),[]);
  // Errors are exposed to the management workspace without persisting local records.
  return Object.assign(records.slice(),{error});
}
function normalizePerson(input, existing = null) {
  const role = String(input.role || existing?.role || '').trim().toLowerCase();
  if (!VALID_ROLES.has(role)) throw new Error('Choose Student, Lecturer, or Administrator.');

  const name = String(input.name ?? input.displayName ?? existing?.name ?? '').trim().replace(/\s+/g, ' ');
  const email = String(input.email ?? existing?.email ?? '').trim().toLowerCase();
  const status = String(input.status ?? existing?.status ?? 'Active').trim();
  if (name.length < 3 || name.length > 80) throw new Error('Enter a name between 3 and 80 characters.');
  if (!EMAIL_PATTERN.test(email) || email.length > 254) throw new Error('Enter a valid email address.');
  if (!['Active', 'Suspended'].includes(status)) throw new Error('Choose Active or Suspended status.');

  const record = {
    role,
    name,
    displayName: name,
    email,
    identifier: email,
    status,
  };

  if (role === 'student') {
    const studentNumber = String(input.studentNumber ?? existing?.studentNumber ?? '').trim();
    const faculty = String(input.faculty ?? existing?.faculty ?? '').trim().toUpperCase();
    const programme = String(input.programme ?? existing?.programme ?? '').trim();
    const year = String(input.year ?? existing?.year ?? '').trim();
    if (!STUDENT_NUMBER_PATTERN.test(studentNumber)) throw new Error('Student number must be 9 digits and begin with 90101.');
    if (!FACULTIES.some((item) => item.code === faculty)) throw new Error('Choose a valid faculty.');
    if (!programme || programme.length > 120) throw new Error('Enter a programme name (up to 120 characters).');
    if (!/^Year [1-8]$/.test(year)) throw new Error('Choose a valid study year.');
    record.studentNumber = studentNumber;
    record.identifier = studentNumber;
    record.faculty = faculty;
    record.programme = programme;
    record.year = year;
  } else {
    delete record.studentNumber;
    delete record.programme;
    delete record.year;
    delete record.index;
    if (role === 'lecturer') {
      const faculty = String(input.faculty ?? existing?.faculty ?? '').trim().toUpperCase();
      if (!FACULTIES.some((item) => item.code === faculty)) throw new Error('Choose a valid faculty.');
      record.faculty = faculty;
      record.index = Number.isInteger(existing?.index) ? existing.index : 0;
    } else {
      delete record.faculty;
    }
  }
  return record;
}


async function requireDirectoryAdmin(){
  requireFirebase();
  const profile=await readPortalProfile(auth.currentUser);
  if(profile?.role!=='admin')throw new Error('An authorized Firebase administrator is required.');
  return profile;
}
async function assertUnique(candidate,id){
  const snapshot=await getDocs(collection(db,COLLECTION));
  const records=snapshot.docs.filter(d=>d.id!==id).map(d=>d.data());
  if(records.some(p=>p.email===candidate.email))throw new Error('That email is already in use.');
  if(candidate.role==='student'&&records.some(p=>p.studentNumber===candidate.studentNumber))throw new Error('That student number is already in use.');
  if(candidate.role==='lecturer'&&records.some(p=>p.role==='lecturer'&&p.faculty===candidate.faculty))throw new Error('A lecturer is already assigned to this faculty.');
}
export async function createDirectoryPerson(input){
  await requireDirectoryAdmin();
  const candidate=normalizePerson(input);
  const password=String(input.password||'');
  if(password.length<8||password.length>128)throw new Error('Choose a password of at least 8 characters.');
  await assertUnique(candidate);
  // Separate in-memory Auth instance: provisioning never replaces the administrator session.
  const secondary=initializeApp(requireFirebase().app.options,'directory-provision-'+crypto.randomUUID());
  const secondaryAuth=getAuth(secondary);
  let user;
  try{
    await setPersistence(secondaryAuth,inMemoryPersistence);
    user=(await createUserWithEmailAndPassword(secondaryAuth,candidate.email,password)).user;
    await setDoc(doc(db,COLLECTION,user.uid),candidate);
    return {...candidate,id:user.uid};
  }catch(error){
    if(user)await deleteUser(user).catch(()=>{});
    throw error;
  }finally{
    await signOut(secondaryAuth).catch(()=>{});await deleteApp(secondary);
  }
}
export async function updateDirectoryPerson(id,input){
  const actor=await requireDirectoryAdmin();
  const ref=doc(db,COLLECTION,id);
  const snap=await getDoc(ref);
  if(!snap.exists())throw new Error('Bootstrap administrator profiles must be managed in Firebase Console.');
  const existing=snap.data();
  const candidate=normalizePerson(input,existing);
  if(candidate.email!==existing.email)throw new Error('Change account email in Firebase Authentication first.');
  if(input.password)throw new Error('Use Firebase Authentication password reset to change a password.');
  if(id===actor.id&&(candidate.role!=='admin'||candidate.status!=='Active'))throw new Error('You cannot revoke your own administrator access.');
  await assertUnique(candidate,id);
  await setDoc(ref,candidate);
  return {...candidate,id};
}
export async function deleteDirectoryPerson(id){
  const actor=await requireDirectoryAdmin();
  if(id===actor.id)throw new Error('You cannot delete your own administrator account.');
  if(!(await getDoc(doc(db,COLLECTION,id))).exists())throw new Error('This record does not exist or is a bootstrap administrator.');
  await deleteDoc(doc(db,COLLECTION,id));
}

import { useEffect, useState } from 'react';
import { DEMO_ACCOUNTS, LECTURERS } from '../data/accounts.js';
import { readPortalProfile } from './directoryStore.js';
import { auth, db, requireFirebase } from './firebase.js';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

export { DEMO_ACCOUNTS, LECTURERS };

export const ROLE_SESSION_KEY = 'limkokwing-portal-role-session';
export const ROLE_CHANGE_EVENT = 'limkokwing-role-change';

export const ROLE_DEFINITIONS = {
  student: {
    label: 'Student',
    shortLabel: 'Student access',
    description: 'View your student record, services, and support shortcuts.',
    icon: 'GraduationCap',
  },
  lecturer: {
    label: 'Lecturer',
    shortLabel: 'Lecturer access',
    description: 'Review the seeded student directory and faculty summaries.',
    icon: 'BookOpenCheck',
  },
  admin: {
    label: 'Administrator',
    shortLabel: 'Admin access',
    description: 'Oversee portal access, student coverage, and service requests.',
    icon: 'ShieldCheck',
  },
};

export function getDashboardPath(role) {
  return `/dashboard/${role}`;
}


let session=null;
const listeners=new Set();
let generation=0, stopProfile=()=>{};
function publish(value){session=value;for(const listener of listeners)listener(value);}
function toSession(profile){return profile?{id:profile.id,role:profile.role,name:profile.name||profile.displayName,email:profile.email,studentId:profile.studentNumber,faculty:profile.faculty,programme:profile.programme}:null;}
export function getSession(){return session;}
if(typeof window!=='undefined'){
  // Legacy browser credentials are not trusted or migrated.
  try{window.localStorage.removeItem(ROLE_SESSION_KEY);}catch{}
  if(auth)onAuthStateChanged(auth,async user=>{
    const token=++generation;stopProfile();publish(null);
    if(!user)return;
    try{
      const profile=await readPortalProfile(user);
      if(token!==generation)return;
      if(!profile){await signOut(auth);return;}
      publish(toSession(profile));
      if(!profile.bootstrap)stopProfile=onSnapshot(doc(db,'portalDirectory',user.uid),snap=>{
        if(token!==generation)return;
        if(!snap.exists()||snap.data().status!=='Active'){publish(null);signOut(auth).catch(()=>{});return;}
        publish(toSession({...snap.data(),id:user.uid}));
      },()=>{publish(null);signOut(auth).catch(()=>{});});
    }catch{if(token===generation){publish(null);await signOut(auth).catch(()=>{});}}
  });
}
export async function signInWithCredentials({identifier,password}){
  const {auth:firebaseAuth}=requireFirebase();
  const email=String(identifier||'').trim().toLowerCase();
  if(!email.includes('@'))throw new Error('Sign in with your assigned email address.');
  const credential=await signInWithEmailAndPassword(firebaseAuth,email,password);
  try{
    const profile=await readPortalProfile(credential.user);
    if(!profile)throw new Error('No active portal account is assigned to this email.');
    const next=toSession(profile);publish(next);return next;
  }catch(error){await signOut(firebaseAuth);throw error;}
}
export async function signInDemo(input){return signInWithCredentials(input);}
export function signOutDemo(){publish(null);if(auth)signOut(auth).catch(()=>{});}
export function useRoleSession(){
  const [value,setValue]=useState(getSession);
  useEffect(()=>{listeners.add(setValue);setValue(getSession());return()=>listeners.delete(setValue);},[]);
  return value;
}

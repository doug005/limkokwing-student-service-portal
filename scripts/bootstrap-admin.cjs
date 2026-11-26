// Run locally from an already authenticated Firebase CLI session.
const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const project = 'limkokwing-student-services';
const email = 'admin@limkokwing.ac.ls';
async function main() {
  const password = readFileSync(0,'utf8').replace(/\r?\n$/, '');
  if (password.length < 12 || password.length > 128 || password === 'admin123') throw new Error('Choose a new password of 12–128 characters.');
  const cli = path.join(execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim(),'firebase-tools','lib');
  const { getGlobalDefaultAccount, getAccessToken } = require(path.join(cli,'auth.js'));
  const account = getGlobalDefaultAccount();
  if (!account?.tokens?.refresh_token) throw new Error('Run firebase login on this computer first.');
  const token = await getAccessToken(account.tokens.refresh_token,['https://www.googleapis.com/auth/cloud-platform']);
  if (!token.access_token) throw new Error('Could not authorize the Firebase CLI session.');
  const headers = {Authorization:'Bearer '+token.access_token,'Content-Type':'application/json'};
  const authBase = 'https://identitytoolkit.googleapis.com/v1/projects/'+project;
  const dbBase = 'https://firestore.googleapis.com/v1/projects/'+project+'/databases/(default)/documents';
  async function request(url,method,body) {
    const res = await fetch(url,{method,headers,...(body?{body:JSON.stringify(body)}:{})});
    const data = await res.json();
    if(!res.ok) throw new Error('Firebase request failed: '+res.status+' '+(data.error?.status||'')+' '+(data.error?.message||''));
    return data;
  }
  const found = await request(authBase+'/accounts:lookup','POST',{email:[email]});
  const existing = found.users?.[0];
  if (existing?.disabled) throw new Error('The existing administrator is disabled. Review the account in Firebase Console before proceeding.');
  let uid;
  if (existing) {
    const updated = await request(authBase+'/accounts:update','POST',{localId:existing.localId,password});
    uid = updated.localId;
    console.log('Existing administrator password updated.');
  } else {
    const created = await request(authBase+'/accounts','POST',{email,password,displayName:'Portal Administrator'});
    uid = created.localId;
    console.log('Firebase Authentication administrator created.');
  }
  if(!uid) throw new Error('Firebase did not return a user UID.');
  const url = dbBase+'/admins/'+encodeURIComponent(uid)+'?updateMask.fieldPaths=role';
  await request(url,'PATCH',{fields:{role:{stringValue:'admin'}}});
  const verified = await request(dbBase+'/admins/'+encodeURIComponent(uid),'GET');
  if(verified.fields?.role?.stringValue!=='admin') throw new Error('Administrator record could not be verified.');
  console.log('SUCCESS: Firebase administrator access verified for '+email);
  console.log('Sign in with the password you just entered. No password was stored in Firestore.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});

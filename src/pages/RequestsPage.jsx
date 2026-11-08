import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, ClipboardList, Eye, FilePlus2, LogIn, LogOut, RefreshCw, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import FormField from '../components/FormField.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { isFirebaseConfigured } from '../services/firebase.js';
import {
  REQUEST_STATUSES,
  deleteStudentRequest,
  hasRequestManagerAccess,
  observeAdminAuth,
  signInRequestManager,
  signOutRequestManager,
  subscribeToStudentRequests,
  updateStudentRequestStatus,
} from '../services/requestService.js';
import { formatDate } from '../utils/date.js';

function formatAuthError(error) {
  if (error?.code === 'auth/invalid-credential' || error?.code === 'auth/wrong-password' || error?.code === 'auth/user-not-found') {
    return 'The email or password was not recognised. Check your details and try again.';
  }
  if (error?.code === 'auth/too-many-requests') return 'Sign-in is temporarily unavailable after several attempts. Please wait and try again.';
  if (error?.code === 'auth/operation-not-allowed') return 'Email and password sign-in is not enabled in Firebase Authentication yet.';
  return error?.message || 'Could not sign in to request management.';
}

function formatDatabaseError(error) {
  if (error?.code === 'permission-denied') return 'Firebase denied access. Confirm that this signed-in account has a matching admin document and that the Firestore rules are deployed.';
  if (error?.code === 'failed-precondition') return 'Firestore needs an index for this query. Follow the link in the Firebase console error, or remove the ordering from the request query.';
  return error?.message || 'Could not retrieve requests from Firestore.';
}

function ConfigNotice() {
  return (
    <div className="config-notice">
      <span className="config-notice__icon"><ShieldCheck size={20} /></span>
      <div><strong>Connect Firebase to manage requests</strong><p>Copy <code>.env.example</code> to <code>.env.local</code>, add your Firebase web-app settings, then restart the development server. A request list will appear here once Firestore is connected.</p><Link to="/request" className="text-link">Go to the request form <ArrowRight size={15} /></Link></div>
    </div>
  );
}

function AdminSignIn({ onSignedIn, authError, onClearError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    onClearError();
    setIsSubmitting(true);
    try {
      await signInRequestManager(email, password);
      onSignedIn('Signed in. Checking management access…');
    } catch (error) {
      onSignedIn(formatAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="admin-gate">
      <div className="admin-gate__intro">
        <span className="admin-gate__icon"><LogIn size={20} /></span>
        <p className="eyebrow">Request management</p>
        <h2>For authorised<br /><em>university staff.</em></h2>
        <p>Sign in with a Firebase staff account that has been granted access to this request list.</p>
      </div>
      <form className="admin-login-form" onSubmit={handleSubmit}>
        {authError && <div className="form-alert form-alert--error" role="alert"><AlertCircle size={17} />{authError}</div>}
        <FormField id="admin-email" label="Staff email" required>
          <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="staff@example.com" />
        </FormField>
        <FormField id="admin-password" label="Password" required>
          <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Your Firebase password" />
        </FormField>
        <Button type="submit" disabled={isSubmitting || !email || !password}>{isSubmitting ? 'Signing in…' : 'Sign in to manage requests'} <ArrowRight size={16} /></Button>
      </form>
    </div>
  );
}

function RequestDetailsDialog({ request, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="request-dialog" role="dialog" aria-modal="true" aria-labelledby="request-dialog-title">
        <div className="request-dialog__header">
          <div><p className="eyebrow">Request details</p><h2 id="request-dialog-title">{request.serviceName}</h2></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close request details"><X size={20} /></button>
        </div>
        <div className="request-dialog__reference"><span>Request ID</span><strong>{request.id}</strong><StatusBadge status={request.status} /></div>
        <dl className="request-dialog__details">
          <div><dt>Student name</dt><dd>{request.studentName}</dd></div>
          <div><dt>Student ID</dt><dd>{request.studentId}</dd></div>
          <div><dt>Email</dt><dd><a href={`mailto:${request.email}`}>{request.email}</a></dd></div>
          <div><dt>Request date</dt><dd>{formatDate(request.requestDate)}</dd></div>
          <div><dt>Submitted</dt><dd>{formatDate(request.createdAt, { hour: 'numeric', minute: '2-digit' })}</dd></div>
          <div className="request-dialog__wide"><dt>Reason for request</dt><dd className="request-dialog__reason">{request.description}</dd></div>
        </dl>
        <div className="request-dialog__footer"><Button variant="outline" onClick={onClose}>Close details</Button></div>
      </section>
    </div>
  );
}

export default function RequestsPage() {
  const [user, setUser] = useState(null);
  const [authResolved, setAuthResolved] = useState(!isFirebaseConfigured);
  const [authorized, setAuthorized] = useState(false);
  const [authError, setAuthError] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [busyRequestId, setBusyRequestId] = useState('');
  const [activeRequest, setActiveRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    setAuthResolved(false);
    try {
      return observeAdminAuth((nextUser) => {
        setUser(nextUser);
        setAuthError('');
        if (!nextUser) {
          setAuthorized(false);
          setAuthResolved(true);
          return;
        }
        setAuthResolved(false);
        hasRequestManagerAccess(nextUser.uid)
          .then((hasAccess) => {
            setAuthorized(hasAccess);
            if (!hasAccess) setAuthError('This Firebase account can sign in, but it is not approved to manage requests. Ask your Firebase project administrator to add the account UID to the admins collection.');
          })
          .catch((error) => {
            setAuthorized(false);
            setAuthError(formatDatabaseError(error));
          })
          .finally(() => setAuthResolved(true));
      }, (error) => {
        setAuthError(formatAuthError(error));
        setAuthResolved(true);
      });
    } catch (error) {
      setAuthError(error.message);
      setAuthResolved(true);
      return undefined;
    }
  }, []);

  useEffect(() => {
    if (!authorized) {
      setRequests([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    setLoadError('');
    try {
      return subscribeToStudentRequests(
        (nextRequests) => {
          setRequests(nextRequests);
          setLoading(false);
        },
        (error) => {
          setLoadError(formatDatabaseError(error));
          setLoading(false);
        },
      );
    } catch (error) {
      setLoadError(formatDatabaseError(error));
      setLoading(false);
      return undefined;
    }
  }, [authorized]);

  const filteredRequests = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return requests;
    return requests.filter((request) =>
      [request.studentName, request.studentId, request.email, request.serviceName, request.status, request.id]
        .some((value) => String(value ?? '').toLowerCase().includes(search)),
    );
  }, [requests, searchTerm]);

  const statusCounts = useMemo(() => REQUEST_STATUSES.reduce((counts, status) => {
    counts[status] = requests.filter((request) => request.status === status).length;
    return counts;
  }, {}), [requests]);

  async function handleStatusChange(requestId, status) {
    setBusyRequestId(requestId);
    setActionError('');
    setActionMessage('');
    try {
      await updateStudentRequestStatus(requestId, status);
      setActionMessage('Request status updated.');
    } catch (error) {
      setActionError(formatDatabaseError(error));
    } finally {
      setBusyRequestId('');
    }
  }

  async function handleDelete(request) {
    const confirmed = window.confirm(`Delete the request from ${request.studentName} for “${request.serviceName}”? This cannot be undone.`);
    if (!confirmed) return;
    setBusyRequestId(request.id);
    setActionError('');
    setActionMessage('');
    try {
      await deleteStudentRequest(request.id);
      setActionMessage('Request deleted.');
    } catch (error) {
      setActionError(formatDatabaseError(error));
    } finally {
      setBusyRequestId('');
    }
  }

  async function handleSignOut() {
    setAuthError('');
    try {
      await signOutRequestManager();
    } catch (error) {
      setAuthError(formatAuthError(error));
    }
  }

  return (
    <section className="shell page-section requests-page">
      <PageHeader
        eyebrow="Request management"
        title={null}
        description="Review student requests, follow their status, and keep each record up to date."
        action={user && authorized ? <button type="button" className="sign-out-button" onClick={handleSignOut}><LogOut size={15} /> Sign out</button> : null}
      />

      {!isFirebaseConfigured ? (
        <ConfigNotice />
      ) : !authResolved ? (
        <div className="loading-panel"><span className="spinner" /><p>Checking request-management access…</p></div>
      ) : !user ? (
        <AdminSignIn onSignedIn={setAuthError} authError={authError} onClearError={() => setAuthError('')} />
      ) : !authorized ? (
        <div className="access-denied-panel">
          <span className="access-denied-panel__icon"><ShieldCheck size={22} /></span>
          <div><h2>Request access hasn’t been granted.</h2><p>{authError || 'This account is not approved to manage student requests.'}</p><p className="access-denied-panel__help">An authorised project administrator can create an <code>admins</code> document with this signed-in user’s UID as its document ID. See <code>README.md</code> for setup details.</p></div>
          <Button variant="outline" onClick={handleSignOut}><LogOut size={15} /> Sign out</Button>
        </div>
      ) : (
        <>
          <div className="requests-welcome-row">
            <div className="requests-welcome"><span className="requests-welcome__icon"><ShieldCheck size={17} /></span><span>Signed in as <strong>{user.email}</strong></span></div>
            <span className="requests-welcome__secure">Authorised staff view</span>
          </div>
          <div className="request-stats">
            <div className="request-stat request-stat--total"><span>Total requests</span><strong>{requests.length.toString().padStart(2, '0')}</strong><small>All submitted records</small></div>
            {REQUEST_STATUSES.map((status) => <div className="request-stat" key={status}><span>{status}</span><strong>{(statusCounts[status] ?? 0).toString().padStart(2, '0')}</strong><small>{status === 'Pending' ? 'Awaiting review' : status === 'In Progress' ? 'Being reviewed' : status === 'Completed' ? 'Resolved requests' : 'Closed requests'}</small></div>)}
          </div>
          <div className="requests-table-heading">
            <div><p className="eyebrow">Live from Firestore</p><h2>Submitted requests <span>{requests.length}</span></h2></div>
            <label className="search-control search-control--table"><Search size={16} aria-hidden="true" /><span className="visually-hidden">Search requests</span><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search requests" /></label>
          </div>
          {actionError && <div className="form-alert form-alert--error" role="alert"><AlertCircle size={17} />{actionError}</div>}
          {actionMessage && <div className="form-alert form-alert--success" role="status"><ShieldCheck size={17} />{actionMessage}</div>}
          {loadError && <div className="form-alert form-alert--error" role="alert"><AlertCircle size={17} />{loadError}<button className="inline-button" type="button" onClick={() => window.location.reload()}>Reload page</button></div>}
          {loading ? (
            <div className="loading-panel"><span className="spinner" /><p>Loading requests from Firestore…</p></div>
          ) : !loadError && requests.length === 0 ? (
            <div className="empty-state empty-state--requests">
              <span className="empty-state__icon"><ClipboardList size={22} /></span>
              <p className="eyebrow">Your list is clear</p>
              <h2>No student requests yet</h2>
              <p>Requests saved through the student form will appear here as soon as they are submitted.</p>
              <Button to="/request" variant="outline">Open request form <ArrowRight size={15} /></Button>
            </div>
          ) : !loadError && filteredRequests.length === 0 ? (
            <div className="empty-state empty-state--requests"><span className="empty-state__icon"><Search size={21} /></span><h2>No matching requests</h2><p>Try searching with a different name, service, student ID, status, or reference.</p></div>
          ) : !loadError ? (
            <div className="requests-table-wrap">
              <table className="requests-table">
                <thead><tr><th>Student</th><th>Service</th><th>Submitted</th><th>Status</th><th>Manage</th></tr></thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id}>
                      <td><strong className="request-student-name">{request.studentName}</strong><span className="request-student-id">{request.studentId} <i aria-hidden="true">·</i> {request.email}</span></td>
                      <td><span className="request-service-name">{request.serviceName}</span><span className="request-reference">ID {request.id.slice(0, 10)}</span></td>
                      <td><span className="request-date">{formatDate(request.createdAt)}</span><span className="request-date--sub">Request date {formatDate(request.requestDate)}</span></td>
                      <td><StatusBadge status={request.status} /></td>
                      <td>
                        <div className="request-actions">
                          <button className="icon-button" type="button" onClick={() => setActiveRequest(request)} aria-label={`View request from ${request.studentName}`}><Eye size={17} /></button>
                          <label className="visually-hidden" htmlFor={`status-${request.id}`}>Status for request from {request.studentName}</label>
                          <select id={`status-${request.id}`} className="status-select" value={request.status ?? 'Pending'} disabled={busyRequestId === request.id} onChange={(event) => handleStatusChange(request.id, event.target.value)}>
                            {REQUEST_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                          </select>
                          <button className="icon-button icon-button--danger" type="button" disabled={busyRequestId === request.id} onClick={() => handleDelete(request)} aria-label={`Delete request from ${request.studentName}`}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          <div className="requests-footer-note"><ShieldCheck size={15} /><span>Student details are only visible to authorised request managers.</span><button type="button" onClick={() => window.location.reload()} title="Refresh request list"><RefreshCw size={14} /> Refresh</button></div>
        </>
      )}

      {activeRequest && <RequestDetailsDialog request={activeRequest} onClose={() => setActiveRequest(null)} />}
    </section>
  );
}

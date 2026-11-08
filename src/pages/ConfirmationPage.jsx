import { ArrowLeft, ArrowRight, Check, Clock3, FileText, Hash } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../components/Button.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDate } from '../utils/date.js';

export default function ConfirmationPage() {
  const location = useLocation();
  const request = location.state?.request;

  if (!request) {
    return (
      <section className="shell page-section confirmation-page">
        <div className="confirmation-card confirmation-card--missing">
          <span className="confirmation-icon confirmation-icon--muted"><FileText size={25} /></span>
          <p className="eyebrow">Submission details</p>
          <h1>No recent request<br /><em>was found.</em></h1>
          <p>This page needs the details from a successfully saved request. If you submitted recently, check the Requests page or start a new request.</p>
          <div className="confirmation-actions">
            <Button to="/services" variant="outline"><ArrowLeft size={16} /> Browse services</Button>
            <Link className="text-link" to="/requests">View requests <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="shell page-section confirmation-page">
      <div className="confirmation-card">
        <div className="confirmation-card__topline"><span className="confirmation-icon"><Check size={25} /></span><StatusBadge status={request.status} /></div>
        <p className="eyebrow">Request submitted</p>
        <h1>Thank you.<br /><em>Your request is on its way.</em></h1>
        <p className="confirmation-lead">Your details have been saved. Keep this reference for your records.</p>
        <div className="confirmation-reference"><span><Hash size={16} /> Request reference</span><strong>{request.id}</strong></div>
        <div className="confirmation-details">
          <div><span>Student</span><strong>{request.studentName}</strong></div>
          <div><span>Student ID</span><strong>{request.studentId}</strong></div>
          <div><span>Service requested</span><strong>{request.serviceName}</strong></div>
          <div><span>Request date</span><strong>{formatDate(request.requestDate)}</strong></div>
          <div><span>Submitted on</span><strong><Clock3 size={14} /> {formatDate(request.createdAt)}</strong></div>
          <div className="confirmation-details__wide"><span>Reason for request</span><p>{request.description}</p></div>
        </div>
        <div className="confirmation-actions">
          <Button to="/services" variant="outline"><ArrowLeft size={16} /> Back to services</Button>
          <Button to="/requests">View requests <ArrowRight size={16} /></Button>
        </div>
        <p className="confirmation-footnote">A request status of <strong>Pending</strong> means it has been recorded and is awaiting review.</p>
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import FormField from '../components/FormField.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { services, getServiceById } from '../data/services.js';
import { isFirebaseConfigured } from '../services/firebase.js';
import { createStudentRequest } from '../services/requestService.js';

function createBlankForm(serviceId = '') {
  return {
    studentName: '',
    studentId: '',
    email: '',
    serviceId: serviceId || '',
    description: '',
    requestDate: new Date().toISOString().slice(0, 10),
  };
}

function validateForm(form) {
  const errors = {};
  const studentName = form.studentName.trim();
  const studentId = form.studentId.trim();
  const email = form.email.trim();
  if (!studentName) errors.studentName = 'Enter your full name.';
  else if (studentName.length < 3) errors.studentName = 'Your name must be at least 3 characters.';
  else if (studentName.length > 35) errors.studentName = 'Your name cannot exceed 35 characters.';
  else if (/\p{N}/u.test(studentName)) errors.studentName = 'Your name cannot contain numbers.';
  if (!/^\d{5}$/.test(studentId)) errors.studentId = 'Enter the remaining numbers after 9010';
  if (!form.email.trim()) errors.email = 'Enter the your email address.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
  else if (email.length > 254) errors.email = 'Keep your email address to 254 characters or fewer.';
  if (!getServiceById(form.serviceId)) errors.serviceId = 'Choose the service you need.';
  if (!form.description.trim()) errors.description = 'Tell us a little about your request.';
  else if (form.description.trim().length < 10) errors.description = 'Add a little more detail (at least 10 characters).';
  if (!form.requestDate) errors.requestDate = 'Choose the date of your request.';
  return errors;
}

function describeSubmissionError(error) {
  if (error?.code === 'permission-denied') {
    return 'Firestore rejected this submission. Check the studentRequests create rule in your Firebase project, then try again.';
  }
  if (error?.code === 'unavailable' || error?.code === 'network-request-failed') {
    return 'The service could not reach Firebase. Check your connection and Firebase configuration, then try again.';
  }
  return error?.message || 'The request could not be saved. Please try again.';
}

export default function RequestPage() {
  const [searchParams] = useSearchParams();
  const selectedServiceId = searchParams.get('service') || '';
  const navigate = useNavigate();
  const [form, setForm] = useState(() => createBlankForm(selectedServiceId));
  const [errors, setErrors] = useState({});
  const [submissionError, setSubmissionError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedServiceId && getServiceById(selectedServiceId)) {
      setForm((current) => ({ ...current, serviceId: selectedServiceId }));
      setErrors((current) => ({ ...current, serviceId: undefined }));
    }
  }, [selectedServiceId]);

  function updateField(event) {
    const { name, value } = event.target;
    const containsNumbers = name === 'studentName' && /\p{N}/u.test(value);
    const nextValue = name === 'studentId'
      ? value.replace(/\D/g, '').slice(0, 5)
      : name === 'studentName'
        ? value.replace(/\p{N}/gu, '')
        : value;
    setForm((current) => ({ ...current, [name]: nextValue }));
    if (name === 'studentName') {
      setErrors((current) => ({
        ...current,
        studentName: containsNumbers ? 'Names cannot contain numbers.' : undefined,
      }));
    } else if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: undefined }));
    }
    if (submissionError) setSubmissionError('');
  }

  function validateFieldOnBlur(event) {
    const { name, value } = event.target;
    const normalizedValue = name === 'studentName'
      ? value.replace(/\p{N}/gu, '')
      : name === 'studentId'
        ? value.replace(/\D/g, '').slice(0, 5)
        : value;
    const fieldErrors = validateForm({ ...form, [name]: normalizedValue });
    setErrors((current) => ({ ...current, [name]: fieldErrors[name] }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    setSubmissionError('');
    if (Object.keys(nextErrors).length > 0) {
      document.getElementById(Object.keys(nextErrors)[0])?.focus();
      return;
    }

    const selectedService = getServiceById(form.serviceId);
    setSubmitting(true);
    try {
      const savedRequest = await createStudentRequest({
        ...form,
        studentName: form.studentName.trim(),
        studentId: `9010${form.studentId}`,
        email: form.email.trim(),
        description: form.description.trim(),
        serviceName: selectedService.name,
      });
      setForm(createBlankForm());
      setErrors({});
      navigate('/confirmation', { state: { request: savedRequest } });
    } catch (error) {
      setSubmissionError(describeSubmissionError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="shell page-section request-page">
      <Link className="back-link" to="/services"><ArrowLeft size={15} /> Browse services</Link>
      <PageHeader
        eyebrow="Student request"
        title={<>Let’s get this<br /><em>moving forward.</em></>}
        description="Share a few details so the right university team can understand what you need. Fields marked with an asterisk are required."
      />
      <div className="request-layout">
        <form className="request-form" onSubmit={handleSubmit} noValidate>
          {submissionError && <div className="form-alert form-alert--error" role="alert">{submissionError}</div>}
          {!isFirebaseConfigured && (
            <div className="form-alert form-alert--info" role="status">
              <LockKeyhole size={18} />
              <span><strong>Firebase setup is still needed.</strong> Connect your Firebase web-app values in <code>.env.local</code> to save requests.</span>
            </div>
          )}
          <div className="form-section-heading">
            <span>01</span><div><h2>Your details</h2><p>Use the information associated with your student record.</p></div>
          </div>
          <div className="form-grid">
            <FormField id="studentName" label="Full name" error={errors.studentName} required>
              {({ describedBy, invalid }) => <input id="studentName" name="studentName" type="text" minLength={3} maxLength={35} autoComplete="name" placeholder="e.g. Refiloe Mokoena" value={form.studentName} onChange={updateField} onBlur={validateFieldOnBlur} aria-invalid={invalid} aria-describedby={describedBy} />}
            </FormField>
            <FormField id="studentId" label="Student ID" error={errors.studentId} hint="9010 is fixed. Enter all 5 remaining digits to complete your 9-digit student number." required>
              {({ describedBy, invalid }) => (
                <div className="student-id-input">
                  <span className="student-id-input__prefix" aria-hidden="true">9010</span>
                  <input id="studentId" name="studentId" type="text" inputMode="numeric" pattern="[0-9]{5}" maxLength={20} autoComplete="off" placeholder="12345" value={form.studentId} onChange={updateField} onBlur={validateFieldOnBlur} aria-label="Last 5 digits of student ID" aria-invalid={invalid} aria-describedby={describedBy} />
                </div>
              )}
            </FormField>
            <FormField id="email" label="Student email address" error={errors.email} hint="We’ll use your email address if the team needs to follow up." required className="form-grid__wide">
              {({ describedBy, invalid }) => <input id="email" name="email" type="email" maxLength={254} autoComplete="email" placeholder="you@example.com" value={form.email} onChange={updateField} onBlur={validateFieldOnBlur} aria-invalid={invalid} aria-describedby={describedBy} />}
            </FormField>
          </div>
          <div className="form-section-heading form-section-heading--spaced">
            <span>02</span><div><h2>About your request</h2><p>Tell us what kind of support you’re looking for.</p></div>
          </div>
          <div className="form-grid">
            <FormField id="serviceId" label="Service required" error={errors.serviceId} required className="form-grid__wide">
              {({ describedBy, invalid }) => (
                <select id="serviceId" name="serviceId" value={form.serviceId} onChange={updateField} onBlur={validateFieldOnBlur} aria-invalid={invalid} aria-describedby={describedBy}>
                  <option value="">Choose a service</option>
                  {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
                </select>
              )}
            </FormField>
            <FormField id="description" label="How can we help?" error={errors.description} hint="Include useful context, but do not share passwords or authentication codes." required className="form-grid__wide">
              {({ describedBy, invalid }) => <textarea id="description" name="description" rows="5" maxLength="2000" placeholder="Describe what you need help with…" value={form.description} onChange={updateField} onBlur={validateFieldOnBlur} aria-invalid={invalid} aria-describedby={describedBy} />}
            </FormField>
            <FormField id="requestDate" label="Date of request" error={errors.requestDate} required>
              {({ describedBy, invalid }) => <div className="input-with-icon"><input id="requestDate" name="requestDate" type="date" value={form.requestDate} onChange={updateField} onBlur={validateFieldOnBlur} aria-invalid={invalid} aria-describedby={describedBy} /><CalendarDays size={16} aria-hidden="true" /></div>}
            </FormField>
          </div>
          <div className="form-submit-row">
            <p><ShieldCheck size={16} /> Your details are used to handle this request.</p>
            <Button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit request'} <ArrowRight size={16} /></Button>
          </div>
        </form>
        <aside className="request-aside">
          <div className="request-aside__top"><span className="request-aside__icon"><CheckCircle2 size={19} /></span><p className="eyebrow">What happens next</p><h2>Clear from<br /><em>start to finish.</em></h2></div>
          <ol className="request-timeline">
            <li><span>1</span><div><strong>Your request is recorded</strong><p>You’ll see a reference once it has been saved.</p></div></li>
            <li><span>2</span><div><strong>The right team reviews it</strong><p>Your selected service helps guide it to the right office.</p></div></li>
            <li><span>3</span><div><strong>Status is kept up to date</strong><p>Requests can be tracked by status in the management page.</p></div></li>
          </ol>
          <div className="request-aside__note"><span>Need help choosing?</span><Link to="/services">Compare the services <ArrowRight size={14} /></Link></div>
        </aside>
      </div>
    </section>
  );
}

import { CircleDot } from 'lucide-react';

const statusClass = {
  Pending: 'status-badge--pending',
  'In Progress': 'status-badge--progress',
  Completed: 'status-badge--complete',
  Rejected: 'status-badge--rejected',
};

export default function StatusBadge({ status = 'Pending' }) {
  return (
    <span className={`status-badge ${statusClass[status] ?? statusClass.Pending}`}>
      <CircleDot size={12} strokeWidth={2.2} aria-hidden="true" />
      {status}
    </span>
  );
}

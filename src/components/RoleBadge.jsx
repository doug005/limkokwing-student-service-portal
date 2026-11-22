import { ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import { ROLE_DEFINITIONS } from '../services/roleAuth.js';

const ROLE_ICONS = {
  student: UserRound,
  lecturer: UsersRound,
  admin: ShieldCheck,
};

export default function RoleBadge({ role, compact = false }) {
  const definition = ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS.student;
  const Icon = ROLE_ICONS[role] || UserRound;
  return (
    <span className={`role-badge role-badge--${role}${compact ? ' role-badge--compact' : ''}`}>
      <Icon size={compact ? 13 : 15} aria-hidden="true" />
      <span>{compact ? definition.label : definition.shortLabel}</span>
    </span>
  );
}

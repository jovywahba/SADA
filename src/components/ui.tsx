import { initials } from '../lib/format'

export function Avatar({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`avatar ${className}`}>{initials(name)}</span>
}

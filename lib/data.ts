import {
  AudioLines,
  Bot,
  Building2,
  ChartColumn,
  Code2,
  CreditCard,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  Mic,
  PenLine,
  ShieldCheck,
  Users,
  Settings2,
  type LucideIcon,
} from 'lucide-react';

/**
 * Every number here comes from the 2026-10-09 audit (see ../../FEATURE-CATALOG.md and the
 * backend/frontend docs). Nothing is a marketing estimate.
 */

export interface Domain {
  id: string;
  name: string;
  count: number;
  icon: LucideIcon;
}

// In the order a candidate meets them, then the B2B and operator sides.
export const DOMAINS: Domain[] = [
  { id: 'identity', name: 'Identity & access', count: 9, icon: ShieldCheck },
  { id: 'interview', name: 'AI mock interview', count: 13, icon: Mic },
  { id: 'reports', name: 'Reports & analytics', count: 15, icon: ChartColumn },
  { id: 'leo', name: 'AI mentor Leo', count: 7, icon: Bot },
  { id: 'resume', name: 'Resume suite', count: 10, icon: FileText },
  { id: 'tools', name: 'AI career tools', count: 5, icon: PenLine },
  { id: 'code', name: 'Coding challenges', count: 14, icon: Code2 },
  { id: 'english', name: 'Practice English', count: 16, icon: AudioLines },
  { id: 'home', name: 'Candidate home', count: 6, icon: LayoutDashboard },
  { id: 'billing', name: 'Billing & growth', count: 13, icon: CreditCard },
  { id: 'institute', name: 'Institute workspace', count: 20, icon: Building2 },
  { id: 'dept', name: 'Department admin', count: 4, icon: Users },
  { id: 'admin', name: 'Super-admin console', count: 9, icon: Settings2 },
  { id: 'platform', name: 'Help & platform', count: 12, icon: LifeBuoy },
];

export const TOTAL_FEATURES = DOMAINS.reduce((n, d) => n + d.count, 0); // 153

export const NUMBERS = [
  { value: 153, label: 'features across the platform' },
  { value: 14, label: 'product domains' },
  { value: 51, label: 'database models' },
  { value: 26, label: 'API route files' },
  { value: 51, label: 'automated test files' },
  { value: 9, label: 'coding languages' },
  { value: 6, label: 'resume templates' },
  { value: 11, label: 'challenge badges' },
] as const;

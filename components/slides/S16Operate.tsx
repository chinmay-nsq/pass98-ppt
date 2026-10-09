'use client';

import { Eye, LifeBuoy, LineChart, Lock, ScrollText, Ticket } from 'lucide-react';
import { SlideFrame } from '@/components/ui/SlideFrame';
import { Glass, Chip } from '@/components/ui/Glass';

const CONSOLE_TILES = ['Institutes', 'Candidates', 'Interviews today', 'Revenue'];
const CONSOLE_POWERS = ['Edit prices and limits live', 'Create and audit coupons', 'Grant a plan with no payment', 'Review held payments'];

const IMPERSONATION = ['Start a read-only session', 'A banner shows who you are viewing', 'Every request is logged', 'End it with one click'];

const TOPICS = ['Broken', 'Practice', 'Score', 'Payment', 'Account', 'Idea'];

export default function Operate() {
  return (
    <SlideFrame
      eyebrow="Run it like a business"
      title={
        <>
          Everything support needs, <span className="text-gradient">audited</span>.
        </>
      }
    >
      <div className="grid h-full content-center gap-4 lg:grid-cols-3">
        {/* Console */}
        <Glass data-in className="p-[clamp(1.1rem,2vw,1.6rem)]">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-brand/15 text-brand">
              <LineChart className="size-[1.1rem]" />
            </span>
            <h3 className="text-lg font-semibold tracking-tight">Admin console</h3>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-2">
            {CONSOLE_TILES.map((t) => (
              <div key={t} className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5">
                <p className="text-[0.68rem] text-faint">{t}</p>
                <span className="mt-1.5 block h-1.5 w-2/3 rounded-full bg-gradient-to-r from-brand/80 to-brand/10" />
              </div>
            ))}
          </div>
          <ul className="grid gap-2 text-sm text-dim">
            {CONSOLE_POWERS.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-brand" />
                {p}
              </li>
            ))}
          </ul>
        </Glass>

        {/* Impersonation */}
        <Glass hot data-in className="p-[clamp(1.1rem,2vw,1.6rem)]">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-brand/20 text-brand">
              <Eye className="size-[1.1rem]" />
            </span>
            <h3 className="text-lg font-semibold tracking-tight">View as a user</h3>
          </div>
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber/40 bg-amber/10 px-3 py-2 text-[0.78rem] text-amber">
            <Lock className="size-3.5" /> Viewing as a student · read-only
          </div>
          <ol className="grid gap-3">
            {IMPERSONATION.map((s, i) => (
              <li key={s} className="flex items-start gap-3 text-sm">
                <span className="mono grid size-5 shrink-0 place-items-center rounded-full border border-brand/50 text-[0.65rem] text-brand-soft">
                  {i + 1}
                </span>
                <span className="text-ink/90">{s}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-dim">
            <ScrollText className="size-3.5" /> No shared passwords. Full audit trail.
          </p>
        </Glass>

        {/* Help center */}
        <Glass data-in className="p-[clamp(1.1rem,2vw,1.6rem)]">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-brand/15 text-brand">
              <LifeBuoy className="size-[1.1rem]" />
            </span>
            <h3 className="text-lg font-semibold tracking-tight">Help Center</h3>
          </div>
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-dashed border-white/20 bg-white/[0.035] px-4 py-3">
            <Ticket className="size-5 text-brand" />
            <div>
              <p className="mono text-sm font-semibold">#P98-1042</p>
              <p className="text-[0.7rem] text-faint">Ticket number sent on submit</p>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {TOPICS.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
          <ul className="grid gap-2 text-sm text-dim">
            <li className="flex items-center gap-2">
              <span className="size-1 rounded-full bg-brand" /> Paste a screenshot to attach it
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1 rounded-full bg-brand" /> Optional WhatsApp or call-back
            </li>
          </ul>
        </Glass>
      </div>
    </SlideFrame>
  );
}

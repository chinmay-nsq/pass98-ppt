import type { SlideDef } from './types';
import Cover from './S01Cover';
import Problem from './S02Problem';
import Personas from './S03Personas';
import ProductMap from './S04Map';
import Voice from './S05Voice';
import Preflight from './S06Preflight';
import Report from './S07Report';
import Leo from './S08Leo';
import Resume from './S09Resume';
import Tools from './S10Tools';
import Challenges from './S11Challenges';
import English from './S12English';
import Plans from './S13Plans';
import Referral from './S14Referral';
import Institute from './S15Institute';
import Operate from './S16Operate';
import Architecture from './S17Architecture';
import Choices from './S18Choices';
import Numbers from './S19Numbers';
import Roadmap from './S20Roadmap';
import Close from './S21Close';

/**
 * The deck, in presentation order. Add, remove or reorder entries here and the navigation,
 * progress bar and overview grid all follow. Every claim on a slide is backed by the audit in
 * ../../../FEATURE-CATALOG.md.
 */
export const SLIDES: SlideDef[] = [
  {
    id: 'cover',
    steps: 1,
    title: 'Pass98',
    section: 'Opening',
    notes:
      'The cover rests on the original word, Passionate. Click the word (or press right) when you are ready: ionate fights and vibrates for a few seconds, then 98 smashes in and it becomes Pass98. Pause on that before you land the three ideas: practice live, get scored, level up. Pass98 is an AI interview-preparation platform, one codebase serving four kinds of user, on web, iOS and Android.',
    Component: Cover,
  },
  {
    id: 'problem',
    title: 'The problem',
    section: 'Opening',
    notes:
      'Candidates rehearse alone, with no pressure and vague feedback. Colleges cannot see who is ready. Pass98 replaces each of those with something concrete: a live voice interview, a scored report, a mentor that remembers, and readiness a college can see. Let the strike-throughs finish before you speak.',
    Component: Problem,
  },
  {
    id: 'personas',
    stage: { core: [7.0, 2.6] },
    title: 'Four personas',
    section: 'Product',
    notes:
      'One login, four workspaces: the candidate, the institute (a college), the department admin inside it, and the super admin who runs the platform. Each has its own layout and permissions, but all of them sit on the same interview engine.',
    Component: Personas,
  },
  {
    id: 'map',
    title: 'Product map',
    section: 'Product',
    notes:
      '153 features in 14 domains, each one checked against the code rather than the older docs. 147 are live and 6 are designed but not built. The biggest domains are the institute workspace, Practice English and the report analytics.',
    Component: ProductMap,
  },
  {
    id: 'voice',
    title: 'Meet Anna',
    section: 'Candidate experience',
    steps: 4,
    notes:
      'This is the hero feature. Anna is a real-time voice interviewer. Press right to walk the pipeline: voice-activity detection hears you stop, Deepgram transcribes, GPT-4o mini decides the next question, Cartesia speaks it. Key rules: one short question per turn, at most two follow-ups, and she never coaches, so the score is honest. The conversation is saved after every turn, so a dropped call resumes where it left off.',
    Component: Voice,
  },
  {
    id: 'preflight',
    stage: { mascot: { side: 'right', mood: 'think', say: 'Mic check first. I will wait.' } },
    title: 'Before the call',
    section: 'Candidate experience',
    steps: 4,
    notes:
      'Five steps from a job post to a live call. Questions are sized to the session length: about 70% from the role and about 30% from the candidate’s own resume. The device check and the network test exist to protect the candidate: a bad connection is caught before a session is spent.',
    Component: Preflight,
  },
  {
    id: 'report',
    title: 'The report',
    section: 'Candidate experience',
    steps: 1,
    notes:
      'Two AI passes run in parallel, scoring and coaching, and merge into one report. The numbers on screen are a sample. Press right for the focus plan: weakest skill first, one solo action to take, and a measurable target. The wording is written with no subject, so the same report reads correctly to the candidate and to a recruiter.',
    Component: Report,
  },
  {
    id: 'leo',
    title: 'Leo, the mentor',
    section: 'Candidate experience',
    notes:
      'Leo opens from any page or from a single report. He sees the candidate’s skills, experience and latest report in every message, and long conversations are summarised into lasting memory. Replies stream in as they are written. The conversation shown is scripted for the deck.',
    Component: Leo,
  },
  {
    id: 'resume',
    title: 'Resume suite',
    section: 'Candidate experience',
    notes:
      'Upload a PDF or Word file once. The AI extracts skills, experience and links, then the same data feeds interview questions, Leo, an ATS score and a job-description match. The builder has six templates and exports to PDF and Word. Hover a card to see its name.',
    Component: Resume,
  },
  {
    id: 'tools',
    title: 'Career tools',
    section: 'Candidate experience',
    notes:
      'Cover letters and recruiter outreach, generated from a resume and a role, or from a role alone. Every rewrite adds a version, so nothing is lost and the user can step back. The editor is paper-like: what you see is what you copy. The sample message cycles by itself.',
    Component: Tools,
  },
  {
    id: 'challenges',
    title: 'Coding missions',
    section: 'Candidate experience',
    notes:
      'Coding practice is framed as missions: topics are sectors, difficulty tiers are cut into stages of eleven that end in a trophy, there is a daily mission and a weekly boss, a streak, and eleven badges that are computed from solves rather than stored. Code runs in a sandbox in nine languages, with an AI review of each submission.',
    Component: Challenges,
  },
  {
    id: 'english',
    title: 'Practice English',
    section: 'Candidate experience',
    steps: 1,
    notes:
      'A spoken-English coach for candidates who know their content but struggle to say it. Grades from A to D are computed in code, not by the model, and the engine would rather miss a mistake than correct a correct sentence. The principle on screen: one focus, up to three fixes, one better answer, then try again. Recordings are kept for 24 hours only, after consent.',
    Component: English,
  },
  {
    id: 'plans',
    title: 'Plans',
    section: 'Business',
    notes:
      'Every student starts on a seven-day trial with no card. Usage is metered per feature across four limits. The numbers shown are the launch defaults; the real values are edited live in the admin console without a deploy. Checkout is Razorpay with the price always read on the server, and coupons can go up to 90%, or 99% when private.',
    Component: Plans,
  },
  {
    id: 'referral',
    title: 'Referral loop',
    section: 'Business',
    notes:
      'Give seven days, get seven days. A friend who joins gets a 14-day trial. The referrer is rewarded only when that friend completes a first interview, so fake accounts earn nothing, with a cap of ten rewards a month. Self-referral is impossible by construction.',
    Component: Referral,
  },
  {
    id: 'institute',
    title: 'For colleges',
    section: 'B2B',
    notes:
      'The key decision: the interview engine is reused unchanged. A college imports a roster, organises departments, assigns a test through a four-step wizard, and reads reports it can release when it chooses. Enterprise has 250 seats and 1,500 assigned interviews; the campus plan has no seat cap and 5,000 interviews. Students’ plans are derived from the institute’s, so one change updates everyone.',
    Component: Institute,
  },
  {
    id: 'operate',
    title: 'Operate and support',
    section: 'B2B',
    notes:
      'The operator side. An admin console with analytics, live pricing and coupons. Impersonation lets support see exactly what a customer sees, read-only, with a banner and a log of every request. The Help Center gives users a ticket number, lets them paste a screenshot, and can request a call-back.',
    Component: Operate,
  },
  {
    id: 'architecture',
    stage: { mascot: { side: 'right', mood: 'idle', say: 'Peel the layers.' } },
    title: 'Architecture',
    section: 'Engineering',
    steps: 2,
    notes:
      'Four layers. Press right to reveal them. The web and mobile apps talk to one Express API; the API calls the AI and commerce services; data lives in Postgres with Redis and S3. The voice agent is a separate Python service on LiveKit Cloud and shares the database.',
    Component: Architecture,
  },
  {
    id: 'choices',
    title: 'Engineering choices',
    section: 'Engineering',
    notes:
      'Four decisions that paid off. The report asks the model for turn numbers instead of transcript text, which removed about three quarters of its output. Sign-up writes everything in one transaction. English recordings are saved on the device before upload. And recordings expire after a day.',
    Component: Choices,
  },
  {
    id: 'numbers',
    stage: { core: [7.0, 2.6] },
    title: 'By the numbers',
    section: 'Engineering',
    notes:
      'These were counted from the repositories on 9 October 2026: 153 catalogued features, 14 domains, 51 database models, 26 API route files, 51 test files, nine coding languages, six resume templates and eleven badges.',
    Component: Numbers,
  },
  {
    id: 'roadmap',
    stage: { mascot: { side: 'left', mood: 'think', say: 'Which first?' } },
    title: 'Roadmap',
    section: 'Next',
    notes:
      'Six items already have written plans. The weakness practice loop is the highest-leverage: it turns a report into a dated plan that brings people back. Learning Roadmaps were built and then removed in October, so they are intentionally absent.',
    Component: Roadmap,
  },
  {
    id: 'close',
    stage: { mascot: { side: 'right', mood: 'cheer', size: 'lg', say: 'Thank you! Questions?' } },
    title: 'Level up',
    section: 'Close',
    notes: 'Close on the promise: practise live, know where you stand, walk in ready. Then open for questions.',
    Component: Close,
  },
];

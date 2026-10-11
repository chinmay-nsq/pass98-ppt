import type { SlideDef } from './types';
import Cover from './S01Cover';
import Problem from './S02Problem';
import Personas from './S03Personas';
import Voice from './S05Voice';
import Preflight from './S06Preflight';
import Report from './S07Report';
import Leo from './S08Leo';
import Resume from './S09Resume';
import Tools from './S10Tools';
import Challenges from './S11Challenges';
import English from './S12English';
import Referral from './S14Referral';
import Institute from './S15Institute';
import Architecture from './S17Architecture';
import Choices from './S18Choices';
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
      'Say "Being passionate gets you the interview..." and click the word on "interview". Say "...Pass98 is what gets you hired" as 98 smashes in. Then: a gym for interviews, practise out loud with an AI, get an honest score, so the big day is your rematch.',
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
      'One login, three workspaces: the candidate, the institute (a college, which can also add its own departments inside), and the super admin who runs the platform. All of them sit on the same interview engine.',
    Component: Personas,
  },
  {
    id: 'voice',
    title: 'Anna and Leo',
    section: 'Candidate experience',
    steps: 4,
    notes:
      'Meet Anna and Leo, your interview buddies. Anna interviews you, Leo coaches you after (more on him soon). Then Anna: she waits until you finish, listens to your whole justification... sorry, answer, will not scold you (she saves that for the report), 5 to 60 minutes, asks follow-ups. Four clicks walk the voice pipeline.',
    Component: Voice,
  },
  {
    id: 'preflight',
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
      'Remember Leo? He is your coach after the interview. He reads your reports. He remembers everything about you (quietly: so be careful what you tell him).',
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
      'You can write your cover letters here too, so the email you send impresses them. Every rewrite is saved as a version.',
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
    id: 'architecture',
    title: 'Architecture',
    section: 'Engineering',
    steps: 2,
    notes:
      'Follow one answer through the system. Top: the web and mobile apps; your answer goes to one API that checks who you are and what your plan allows. Click: the API hands the hard work to specialists (OpenAI thinks, Deepgram hears, Cartesia speaks, LiveKit carries the call, Razorpay takes payments). Click: everything lands in one database with files in S3, and the report travels back up the same way.',
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
    id: 'close',
    title: 'Level up',
    section: 'Close',
    notes:
      'Read with attitude: "The interview won’t go easy on you." Pause. "Neither will Anna." Then: "Pass98. Now go get hired." Then: thank you, any questions?',
    Component: Close,
  },
];

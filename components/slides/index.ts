import type { SlideDef } from './types';
import Cover from './S01Cover';
import Problem from './S02Problem';
import Voice from './S05Voice';
import Preflight from './S06Preflight';
import Report from './S07Report';
import Resume from './S09Resume';
import English from './S12English';
import Features from './S13Features';
import Institute from './S15Institute';
import Architecture from './S17Architecture';
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
      'Today you practise alone, you never say your answers out loud, you never find out what went wrong, and colleges cannot tell who is ready. Pass98 fixes each one: an AI interviews you out loud, you get a score and what to fix, an AI mentor coaches you, and your college sees who is ready. Let the strike-throughs finish. Then the bottom row: who uses it. Students, colleges, and our own team, all with one login, each in their own workspace. Colleges can add their own departments.',
    Component: Problem,
  },
  {
    id: 'preflight',
    title: 'Getting started',
    section: 'Candidate experience',
    steps: 3,
    notes:
      'How fast you can start: four steps. Describe the job role: paste it, dictate it or pick a template. Add your CV, or build one right here. We combine your CV with the job description and write your questions, about 70% from the job and 30% from your CV. Pick how long you want, and Anna says hello. Press right to walk through the steps.',
    Component: Preflight,
  },
  {
    id: 'voice',
    title: 'Anna and Leo',
    section: 'Candidate experience',
    steps: 4,
    notes:
      'Meet Anna and Leo, your interview buddies. Anna interviews you, Leo coaches you after (more on him in a minute). Then Anna: she waits until you finish, listens to your whole justification... sorry, answer, will not scold you (she saves that for the report), 5 to 60 minutes, asks follow-ups. Four clicks walk the voice pipeline.',
    Component: Voice,
  },
  {
    id: 'report',
    stage: { scout: { anchor: 'report-bars', x: 0.82, y: 0.387, size: 0.24, steps: [{ run: { from: 1.08, to: 0.82, dur: 1.1 } }, { face: -0.6 }, { loop: 'look', dur: 3 }, { face: -0.15 }, { loop: 'idle' }] } },
    title: 'The report',
    section: 'Candidate experience',
    steps: 1,
    notes:
      'Two AI passes run in parallel, scoring and coaching, and merge into one report. The numbers on screen are a sample. Press right for the focus plan: weakest skill first, one solo action to take, and a measurable target. The wording is written with no subject, so the same report reads correctly to the candidate and to a recruiter.',
    Component: Report,
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
    id: 'english',
    title: 'Practice English',
    section: 'Candidate experience',
    steps: 1,
    notes:
      'A spoken-English coach for candidates who know their content but struggle to say it. Grades from A to D are computed in code, not by the model, and the engine would rather miss a mistake than correct a correct sentence. The principle on screen: one focus, up to three fixes, one better answer, then try again. Recordings are kept for 24 hours only, after consent.',
    Component: English,
  },
  {
    id: 'institute',
    title: 'For colleges',
    section: 'B2B',
    notes:
      'How colleges use it, in five steps: upload one Excel sheet of students, group them into departments, give them an interview by picking a role and a date, students practise with Anna, and the placement team sees a report for every student. They decide when students see their reports. Every student practises, one dashboard for the team, nothing new for students to install.',
    Component: Institute,
  },
  {
    id: 'features',
    title: 'Everything else',
    section: 'Candidate experience',
    notes:
      'Everything else, in one breath. Leo is your mentor: he reads your reports and remembers you. Build your resume, check its ATS score, match it to a job post, write a cover letter. Practise spoken English and get graded. Solve coding problems as missions. All of it in one dashboard.',
    Component: Features,
  },
  {
    id: 'architecture',
    title: 'Architecture',
    section: 'Engineering',
    notes:
      'What we built it with. Web app in React and TypeScript, the same app on iOS and Android through Capacitor. The backend is Node and Express in TypeScript. The AI and voice: OpenAI thinks, Deepgram hears, Cartesia speaks, LiveKit carries the call. Data in PostgreSQL with Redis and files in S3. Bottom line: your answer goes from the app, to our API, to the AI, and the report is saved in the database.',
    Component: Architecture,
  },
  {
    id: 'close',
    stage: { scout: { x: 0.86, y: 0.8, size: 0.36, steps: [{ run: { from: 1.1, to: 0.86, dur: 1.2 } }, { face: 0 }, { act: 'spin' }, { act: 'wave' }, { loop: 'idle' }], repeat: { act: 'wave', every: 5 } } },
    title: 'Level up',
    section: 'Close',
    notes:
      'Read with attitude: "The interview won’t go easy on you." Pause. "Neither will Anna." Then: "Pass98. Now go get hired." Then: thank you, any questions?',
    Component: Close,
  },
];

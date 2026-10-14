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
    notes:
      'Meet Anna and Leo, your interview buddies. Anna interviews you, Leo coaches you after (more on him in a minute). Then Anna: she waits until you finish, listens to your whole justification... sorry, answer, will not scold you (she saves that for the report), 5 to 60 minutes, asks follow-ups. The pipeline at the bottom lights up on its own; one click moves on.',
    Component: Voice,
  },
  {
    id: 'report',
    stage: {
      scout: {
        spot: { anchor: 'report-bars', x: 0.5 },
        size: 0.22,
        startAtStep: 1,
        delay: 0.2,
        steps: [
          { run: { from: 1.08, to: { anchor: 'report-bars', x: 0.5 }, dur: 1.5 } },
          { face: 0 },
          { wait: 0.4 },
          { hop: { to: { anchor: 'score', x: 0.5, y: 0.12 }, dur: 1.1, height: 1.3, flip: 1 } },
          { emit: 'report-stomp' },
          { act: 'slam' },
          { hop: { dur: 0.5, height: 0.5 } },
          { emit: 'report-stomp' },
          { act: 'slam' },
          { hop: { dur: 0.85, height: 1.1, flip: 1 } },
          { emit: 'report-stomp' },
          { act: 'slam' },
          { wait: 0.5 },
          { hop: { to: { anchor: 'gauge-card', x: 0.1, y: 0.97 }, dur: 1, height: 0.9, flip: 1 } },
          { act: 'slam' },
          { loop: 'idle' },
        ],
      },
    },
    title: 'The report',
    section: 'Candidate experience',
    steps: 2,
    notes:
      'Two AI passes run in parallel, scoring and coaching, and merge into one report. The score lands at 64: almost there. Click: watch Scout jump on it and stomp it up to 82, interview ready. Click again for the focus plan: weakest skill first, one action to take, and a measurable target. The numbers are a sample.',
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
    stage: { scout: { spot: { x: 0.86, y: 0.8 }, size: 0.36, delay: 1.2, steps: [{ run: { from: 1.1, to: { x: 0.86, y: 0.8 }, dur: 1.2 } }, { face: 0 }, { wait: 0.3 }, { act: 'bow' }, { wait: 0.3 }, { act: 'highfive' }, { loop: 'idle' }] } },
    title: 'Level up',
    section: 'Close',
    notes:
      'Read with attitude: "The interview won’t go easy on you." Pause. "Neither will Anna." Then: "Pass98. Now go get hired." Then: thank you, any questions?',
    Component: Close,
  },
];

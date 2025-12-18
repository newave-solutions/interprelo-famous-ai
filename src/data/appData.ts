// Application data for VoiceCoach Pro

export const IMAGES = {
  hero: 'https://d64gsuwffb70l.cloudfront.net/693f595ab6456f1abbf371cc_1765759421080_69e0d9fa.jpg',
  scenarios: [
    'https://d64gsuwffb70l.cloudfront.net/693f595ab6456f1abbf371cc_1765759435013_53b1a123.jpg',
    'https://d64gsuwffb70l.cloudfront.net/693f595ab6456f1abbf371cc_1765759435573_d705da79.jpg',
    'https://d64gsuwffb70l.cloudfront.net/693f595ab6456f1abbf371cc_1765759435968_aa970f58.jpg',
    'https://d64gsuwffb70l.cloudfront.net/693f595ab6456f1abbf371cc_1765759439696_f7281910.png',
    'https://d64gsuwffb70l.cloudfront.net/693f595ab6456f1abbf371cc_1765759479679_6c030e63.png',
    'https://d64gsuwffb70l.cloudfront.net/693f595ab6456f1abbf371cc_1765759481176_ca2835c0.png',
    'https://d64gsuwffb70l.cloudfront.net/693f595ab6456f1abbf371cc_1765759478739_48d154bc.jpg',
    'https://d64gsuwffb70l.cloudfront.net/693f595ab6456f1abbf371cc_1765759479145_fb285a64.jpg',
  ],
  experts: [
    'https://d64gsuwffb70l.cloudfront.net/693f595ab6456f1abbf371cc_1765759454674_f96cf712.jpg',
    'https://d64gsuwffb70l.cloudfront.net/693f595ab6456f1abbf371cc_1765759458886_0eb53403.png',
    'https://d64gsuwffb70l.cloudfront.net/693f595ab6456f1abbf371cc_1765759455810_0166c1d8.jpg',
    'https://d64gsuwffb70l.cloudfront.net/693f595ab6456f1abbf371cc_1765759459962_4e36de3a.png',
  ],
};

export interface Scenario {
  id: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  description: string;
  image: string;
  script: ScriptLine[];
  unlocked: boolean;
}

export interface ScriptLine {
  role: 'doctor' | 'patient' | 'interpreter';
  text: string;
  targetTone?: 'empathetic' | 'neutral' | 'authoritative' | 'reassuring';
}

export interface Expert {
  id: string;
  name: string;
  title: string;
  specialization: string;
  yearsExperience: number;
  image: string;
  recordings: ExpertRecording[];
}

export interface ExpertRecording {
  id: string;
  title: string;
  scenario: string;
  duration: string;
  transcript: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

export interface UserProgress {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  averagePitchScore: number;
  averagePaceScore: number;
  averageVolumeScore: number;
  badges: Badge[];
  weeklyProgress: WeeklyData[];
}

export interface WeeklyData {
  day: string;
  sessions: number;
  minutes: number;
  score: number;
}

export interface ToneDrill {
  id: string;
  phrase: string;
  context: string;
  tones: ('empathetic' | 'authoritative' | 'neutral')[];
}

export const scenarios: Scenario[] = [
  {
    id: '1',
    title: 'Emergency Room Triage',
    category: 'Emergency',
    difficulty: 'Advanced',
    duration: '15 min',
    description: 'A patient arrives with chest pain. Interpret between the triage nurse and anxious patient while maintaining calm authority.',
    image: IMAGES.scenarios[0],
    unlocked: true,
    script: [
      { role: 'doctor', text: 'Can you tell me when the pain started and rate it from 1 to 10?', targetTone: 'neutral' },
      { role: 'patient', text: 'It started about an hour ago... it\'s really bad, maybe an 8. Am I having a heart attack?', targetTone: 'empathetic' },
      { role: 'doctor', text: 'We\'re going to run some tests right away. Try to stay calm and breathe slowly.', targetTone: 'reassuring' },
    ],
  },
  {
    id: '2',
    title: 'Pediatric Vaccination',
    category: 'Pediatrics',
    difficulty: 'Beginner',
    duration: '10 min',
    description: 'Help a nervous parent understand the vaccination schedule for their child while addressing their concerns.',
    image: IMAGES.scenarios[4],
    unlocked: true,
    script: [
      { role: 'doctor', text: 'Today we\'ll be giving your child the MMR vaccine. It\'s very safe and important for their health.', targetTone: 'reassuring' },
      { role: 'patient', text: 'I\'ve heard some things online... are there any side effects I should worry about?', targetTone: 'empathetic' },
      { role: 'doctor', text: 'Some children may have mild fever or soreness, but serious reactions are extremely rare.', targetTone: 'authoritative' },
    ],
  },
  {
    id: '3',
    title: 'Cancer Diagnosis Discussion',
    category: 'Oncology',
    difficulty: 'Advanced',
    duration: '20 min',
    description: 'A physician delivers a cancer diagnosis. Maintain composure while conveying both the gravity and hope of the situation.',
    image: IMAGES.scenarios[1],
    unlocked: true,
    script: [
      { role: 'doctor', text: 'I have your test results. I\'m sorry to tell you that the biopsy showed cancer cells.', targetTone: 'empathetic' },
      { role: 'patient', text: 'Cancer? How... how bad is it? Am I going to die?', targetTone: 'empathetic' },
      { role: 'doctor', text: 'We caught it early. With treatment, the survival rate is over 90%. Let me explain our options.', targetTone: 'reassuring' },
    ],
  },
  {
    id: '4',
    title: 'Informed Consent Surgery',
    category: 'Surgical',
    difficulty: 'Intermediate',
    duration: '15 min',
    description: 'Walk through surgical consent forms, explaining risks and benefits clearly and neutrally.',
    image: IMAGES.scenarios[2],
    unlocked: true,
    script: [
      { role: 'doctor', text: 'Before we proceed, I need to explain the procedure and its risks so you can make an informed decision.', targetTone: 'neutral' },
      { role: 'patient', text: 'What could go wrong? I\'m scared about being put under.', targetTone: 'empathetic' },
      { role: 'doctor', text: 'All surgeries carry some risk, but complications are rare. Our anesthesiologist will monitor you throughout.', targetTone: 'authoritative' },
    ],
  },
  {
    id: '5',
    title: 'Labor and Delivery',
    category: 'Obstetrics',
    difficulty: 'Advanced',
    duration: '25 min',
    description: 'Support communication during active labor, including urgent medical decisions and emotional support.',
    image: IMAGES.scenarios[5],
    unlocked: false,
    script: [
      { role: 'doctor', text: 'You\'re fully dilated. On the next contraction, I need you to push.', targetTone: 'authoritative' },
      { role: 'patient', text: 'I can\'t do this anymore! It hurts too much!', targetTone: 'empathetic' },
      { role: 'doctor', text: 'You\'re doing great. Your baby is almost here. One more big push.', targetTone: 'reassuring' },
    ],
  },
  {
    id: '6',
    title: 'End-of-Life Discussion',
    category: 'Palliative Care',
    difficulty: 'Advanced',
    duration: '20 min',
    description: 'Facilitate a sensitive conversation about hospice care and end-of-life wishes.',
    image: IMAGES.scenarios[3],
    unlocked: false,
    script: [
      { role: 'doctor', text: 'I think it\'s time we discuss what matters most to you in the time ahead.', targetTone: 'empathetic' },
      { role: 'patient', text: 'Are you saying there\'s nothing more you can do?', targetTone: 'empathetic' },
      { role: 'doctor', text: 'We can focus on keeping you comfortable and ensuring quality time with your family.', targetTone: 'reassuring' },
    ],
  },
  {
    id: '7',
    title: 'Psychiatric Evaluation',
    category: 'Mental Health',
    difficulty: 'Intermediate',
    duration: '18 min',
    description: 'Interpret during a mental health assessment, maintaining neutrality while showing empathy.',
    image: IMAGES.scenarios[6],
    unlocked: true,
    script: [
      { role: 'doctor', text: 'Can you tell me about the thoughts you\'ve been having lately?', targetTone: 'neutral' },
      { role: 'patient', text: 'Sometimes I feel like nothing matters... like I\'m just going through the motions.', targetTone: 'empathetic' },
      { role: 'doctor', text: 'Thank you for sharing that. Those feelings are more common than you might think, and we can help.', targetTone: 'reassuring' },
    ],
  },
  {
    id: '8',
    title: 'Diabetes Management',
    category: 'Chronic Care',
    difficulty: 'Beginner',
    duration: '12 min',
    description: 'Help explain diabetes management, including medication, diet, and lifestyle changes.',
    image: IMAGES.scenarios[7],
    unlocked: true,
    script: [
      { role: 'doctor', text: 'Your blood sugar levels indicate Type 2 diabetes. We need to discuss lifestyle changes.', targetTone: 'neutral' },
      { role: 'patient', text: 'Diabetes? But I feel fine! Do I really need medication?', targetTone: 'empathetic' },
      { role: 'doctor', text: 'Managing it now will prevent serious complications later. Let\'s create a plan together.', targetTone: 'authoritative' },
    ],
  },
];

export const experts: Expert[] = [
  {
    id: '1',
    name: 'Maria Santos',
    title: 'Certified Medical Interpreter',
    specialization: 'Emergency Medicine',
    yearsExperience: 15,
    image: IMAGES.experts[0],
    recordings: [
      { id: '1a', title: 'Calm Authority in Crisis', scenario: 'Emergency Room', duration: '3:24', transcript: 'Notice how I maintain a steady pace even when the patient becomes agitated...' },
      { id: '1b', title: 'Delivering Difficult News', scenario: 'Oncology', duration: '4:12', transcript: 'The key is to pause after significant information, allowing time to process...' },
    ],
  },
  {
    id: '2',
    name: 'Dr. James Chen',
    title: 'Interpreter Training Director',
    specialization: 'Pediatrics & Family Medicine',
    yearsExperience: 20,
    image: IMAGES.experts[1],
    recordings: [
      { id: '2a', title: 'Engaging Pediatric Patients', scenario: 'Pediatrics', duration: '2:58', transcript: 'With children, I soften my tone while maintaining clarity...' },
      { id: '2b', title: 'Parental Reassurance', scenario: 'Pediatric Emergency', duration: '3:45', transcript: 'Parents need to feel heard before they can hear you...' },
    ],
  },
  {
    id: '3',
    name: 'Fatima Al-Hassan',
    title: 'Senior Medical Interpreter',
    specialization: 'Oncology & Palliative Care',
    yearsExperience: 12,
    image: IMAGES.experts[2],
    recordings: [
      { id: '3a', title: 'End-of-Life Conversations', scenario: 'Palliative Care', duration: '5:30', transcript: 'In these moments, silence is as important as words...' },
      { id: '3b', title: 'Hope in Difficult Diagnoses', scenario: 'Oncology', duration: '4:00', transcript: 'Balance honesty with compassion, never false hope...' },
    ],
  },
  {
    id: '4',
    name: 'Robert Williams',
    title: 'Lead Interpreter',
    specialization: 'Mental Health & Psychiatry',
    yearsExperience: 18,
    image: IMAGES.experts[3],
    recordings: [
      { id: '4a', title: 'Neutral Tone in Assessments', scenario: 'Psychiatric Evaluation', duration: '4:15', transcript: 'Avoid any judgment in your voice, even subtle inflections...' },
      { id: '4b', title: 'De-escalation Techniques', scenario: 'Crisis Intervention', duration: '3:50', transcript: 'Lower your pitch and slow your pace to help calm the situation...' },
    ],
  },
];

export const toneDrills: ToneDrill[] = [
  {
    id: '1',
    phrase: 'The test results show some abnormalities that we need to discuss.',
    context: 'Delivering potentially concerning medical information',
    tones: ['empathetic', 'authoritative', 'neutral'],
  },
  {
    id: '2',
    phrase: 'You need to take this medication exactly as prescribed.',
    context: 'Emphasizing medication compliance',
    tones: ['authoritative', 'empathetic', 'neutral'],
  },
  {
    id: '3',
    phrase: 'I understand this is difficult to hear.',
    context: 'Acknowledging patient emotions',
    tones: ['empathetic', 'neutral', 'authoritative'],
  },
  {
    id: '4',
    phrase: 'The procedure went well and you should make a full recovery.',
    context: 'Delivering positive news post-surgery',
    tones: ['neutral', 'empathetic', 'authoritative'],
  },
  {
    id: '5',
    phrase: 'We have several treatment options available.',
    context: 'Presenting medical choices',
    tones: ['neutral', 'authoritative', 'empathetic'],
  },
];

export const badges: Badge[] = [
  { id: '1', name: 'First Steps', description: 'Complete your first practice session', icon: 'footprints', earned: true, earnedDate: '2024-12-01' },
  { id: '2', name: 'Week Warrior', description: 'Practice for 7 consecutive days', icon: 'calendar', earned: true, earnedDate: '2024-12-08' },
  { id: '3', name: 'Tone Master', description: 'Score 90%+ on 5 Tone Shift drills', icon: 'music', earned: false },
  { id: '4', name: 'Calm Under Pressure', description: 'Complete 3 Emergency scenarios', icon: 'heart', earned: false },
  { id: '5', name: 'Empathy Expert', description: 'Achieve perfect empathy scores 10 times', icon: 'users', earned: true, earnedDate: '2024-12-10' },
  { id: '6', name: 'Pace Perfectionist', description: 'Maintain optimal pace for entire session', icon: 'gauge', earned: false },
  { id: '7', name: 'Volume Virtuoso', description: 'Perfect volume control in 5 sessions', icon: 'volume', earned: false },
  { id: '8', name: 'Scenario Scholar', description: 'Complete all beginner scenarios', icon: 'book', earned: false },
];

export const userProgress: UserProgress = {
  totalSessions: 24,
  totalMinutes: 312,
  currentStreak: 5,
  longestStreak: 12,
  averagePitchScore: 82,
  averagePaceScore: 78,
  averageVolumeScore: 85,
  badges: badges,
  weeklyProgress: [
    { day: 'Mon', sessions: 2, minutes: 25, score: 78 },
    { day: 'Tue', sessions: 1, minutes: 15, score: 82 },
    { day: 'Wed', sessions: 3, minutes: 40, score: 85 },
    { day: 'Thu', sessions: 2, minutes: 30, score: 80 },
    { day: 'Fri', sessions: 1, minutes: 12, score: 88 },
    { day: 'Sat', sessions: 0, minutes: 0, score: 0 },
    { day: 'Sun', sessions: 2, minutes: 28, score: 84 },
  ],
};

export const baselinePrompts = [
  { id: '1', text: 'Please count from one to ten at your normal speaking pace.', type: 'neutral' },
  { id: '2', text: 'Read this sentence: The quick brown fox jumps over the lazy dog.', type: 'neutral' },
  { id: '3', text: 'Say: I understand this must be very difficult for you.', type: 'empathetic' },
  { id: '4', text: 'Say: You must take this medication every day without exception.', type: 'authoritative' },
  { id: '5', text: 'Say: The results of your test are now available.', type: 'neutral' },
];


export enum Screen {
  Landing = 'landing',
  SignIn = 'signin',
  SignUp = 'signup',
  ForgotPassword = 'forgot-password',
  Onboarding = 'onboarding',
  JDSetup = 'jd-setup',
  Dashboard = 'dashboard',
  Interview = 'interview',
  Analysis = 'analysis',
  Settings = 'settings',
  Subscription = 'subscription'
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro';
  avatar?: string;
  interviewsToday?: number;
  lastInterviewDate?: string;
}

export interface InterviewSession {
  id: string;
  role: string;
  type: string;
  date: string;
  duration: string;
  score: number;
  experienceLevel: string;
  transcript: TranscriptItem[];
}

export interface TranscriptItem {
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export interface InterviewConfig {
  role: string;
  experienceLevel: string;
  techStack: string[];
  focusAreas: string[];
  duration: number; // minutes
}

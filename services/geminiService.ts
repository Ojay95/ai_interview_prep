import { GoogleGenAI } from "@google/genai";

// ==========================================
// 1. CONFIGURATION & TYPES
// ==========================================

// Use gemini-3-flash-preview for text tasks as per guidelines
const TEXT_MODEL = 'gemini-3-flash-preview'; 

export interface JobAnalysisResult {
  roleName: string;
  keySkills: string[];
  recommendedFocusAreas: string[];
  experienceLevel: string;
}

export interface ResumeMatchResult {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  overallFeedback: string;
  verdict: string;
  shouldApply: string;
  practiceAreas: string[];
  recommendations: Array<{ 
    title: string; 
    impact: string; 
    description: string; 
    suggestion: string 
  }>;
}

// ==========================================
// 2. UTILITIES (Audio & Data)
// ==========================================

// Strictly use process.env.API_KEY as per guidelines
const getApiKey = () => {
  return process.env.API_KEY || "";
};

export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function floatTo16BitPCM(data: Float32Array): Uint8Array {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    const sample = data[i];
    const clamped = Math.max(-1, Math.min(1, sample));
    int16[i] = clamped < 0 ? clamped * 32768 : clamped * 32767;
  }
  return new Uint8Array(int16.buffer);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Improved JSON cleaner
export function cleanJsonString(str: string): string {
  if (!str) return "{}";
  // Remove markdown blocks (```json ... ```)
  let clean = str.replace(/```json/g, '').replace(/```/g, '').trim();
  // Attempt to find the first '{' and last '}' to strip pre/post-amble text
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }
  return clean;
}

// Generic Safe Parser to prevent app crashes
function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    const cleaned = cleanJsonString(jsonString);
    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error("JSON Parse Failed:", error);
    return fallback;
  }
}

// ==========================================
// 3. AI SERVICES
// ==========================================

export const analyzeJobDescription = async (jd: string): Promise<JobAnalysisResult | { error: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [{ role: 'user', parts: [{ text: `Analyze the following Job Description and return a JSON object with: roleName (string), keySkills (string array), recommendedFocusAreas (string array), experienceLevel (string). \n\nJD: "${jd}"` }] }],
      config: { 
        responseMimeType: 'application/json',
        temperature: 0.1 
      }
    });

    return safeJsonParse<JobAnalysisResult>(response.text || "{}", {
      roleName: "Analysis Failed",
      keySkills: [],
      recommendedFocusAreas: ["Retry Analysis"],
      experienceLevel: "Unknown"
    });

  } catch (error) {
    console.error("Error analyzing job description:", error);
    return { error: "Failed to analyze" }; 
  }
};

export const analyzeResumeMatch = async (resumeText: string, jdText: string): Promise<ResumeMatchResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const prompt = `Act as an expert technical recruiter. Analyze the following Resume against the Job Description. 
    Your goal is to provide a brutal, honest, and highly actionable alignment report.
    
    Return a strict JSON object with these EXACT keys:
    - matchScore: (number 0-100) representing how well the candidate fits the requirements.
    - matchedKeywords: (string array) specific technical and soft skills present in both.
    - missingKeywords: (string array) critical requirements from the JD that are totally missing or weak in the resume.
    - overallFeedback: (string) a concise summary of the alignment.
    - verdict: (string) A short summary tag (e.g., 'Highly Qualified', 'Strong Potential', 'Significant Gaps', 'Underqualified').
    - shouldApply: (string) A clear recommendation on whether to apply and why (e.g., 'Definitely apply! You are a top-tier candidate.', 'Go for it! You have 80% of what they need.', 'Apply with caution: focus on bridging technical gaps first.').
    - practiceAreas: (string array) 3-5 specific topics the candidate MUST practice for an interview based on the requirements of THIS job.
    - recommendations: (array of objects { title, impact, description, suggestion }) specific, high-impact edits to the resume to better align with this JD.
    
    RESUME:
    "${resumeText}"
    
    JOB DESCRIPTION:
    "${jdText}"`;

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { 
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    return safeJsonParse<ResumeMatchResult>(response.text || "{}", {
      matchScore: 0,
      matchedKeywords: [],
      missingKeywords: [],
      overallFeedback: "We couldn't generate a valid analysis. Please try again.",
      verdict: "Error in Analysis",
      shouldApply: "Retry the analysis with more content.",
      practiceAreas: ["General Technical Prep", "System Design", "Behavioral Alignment"],
      recommendations: []
    });

  } catch (error) {
    console.error("Error matching resume:", error);
    return {
      matchScore: 0,
      matchedKeywords: [],
      missingKeywords: [],
      overallFeedback: "An error occurred during analysis.",
      verdict: "Failed",
      shouldApply: "Analysis failed due to a connection error.",
      practiceAreas: [],
      recommendations: []
    };
  }
};
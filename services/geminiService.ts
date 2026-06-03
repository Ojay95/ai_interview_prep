
import { GoogleGenAI } from "@google/genai";
import { apiClient } from "./apiClient";

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
  resumeSummary: string;
  verdict: string;
  shouldApply: string;
  practiceAreas: string[];
  recommendations: Array<{ 
    title: string; 
    impact: string; 
    description: string; 
    suggestion: string;
    suggestedBullet: string;
  }>;
}

// ==========================================
// 2. UTILITIES (Audio & Data)
// ==========================================

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
    const response = await apiClient.post('/ai/analyze-jd', { jd });
    return response.data.analysis;
  } catch (error) {
    console.error("Error analyzing job description:", error);
    return { error: "Failed to analyze" }; 
  }
};

export const extractRoleFromResume = async (resumeText: string): Promise<string> => {
  try {
    const response = await apiClient.post('/ai/extract-role', { resumeText });
    return response.data.role || "Software Engineer";
  } catch (error) {
    console.error("Error extracting role from resume:", error);
    return "Software Engineer";
  }
};

export const analyzeResumeMatch = async (resumeText: string, jdText: string): Promise<ResumeMatchResult> => {
  try {
    const response = await apiClient.post('/cv/analyze-text', { resumeText, jobDescription: jdText });
    return response.data.analysis;
  } catch (error) {
    console.error("Error matching resume:", error);
    return {
      matchScore: 0,
      matchedKeywords: [],
      missingKeywords: [],
      overallFeedback: "An error occurred during analysis.",
      resumeSummary: "Analysis failed.",
      verdict: "Failed",
      shouldApply: "Analysis failed due to a connection error.",
      practiceAreas: [],
      recommendations: []
    };
  }
};

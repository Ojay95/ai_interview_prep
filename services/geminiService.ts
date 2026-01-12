
import { GoogleGenAI } from "@google/genai";

// ==========================================
// 1. CONFIGURATION & TYPES
// ==========================================

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
  missingKeywords: Array<{ name: string; type: string }>;
  overallFeedback: string;
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

const getApiKey = () => {
  const key = process.env.API_KEY;
  if (!key) console.warn("⚠️ API Key is missing.");
  return key || "";
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

export function cleanJsonString(str: string): string {
  if (!str) return "{}";
  let clean = str.replace(/```json/g, '').replace(/```/g, '').trim();
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }
  return clean;
}

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
    
    const prompt = `Compare this Resume against this Job Description and return a detailed JSON analysis.
    Return a strict JSON object with: matchScore, matchedKeywords, missingKeywords, overallFeedback, recommendations.`;

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt + `\n\nRESUME:\n${resumeText}\n\nJD:\n${jdText}` }] }],
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
      recommendations: []
    });

  } catch (error) {
    console.error("Error matching resume:", error);
    return {
      matchScore: 0,
      matchedKeywords: [],
      missingKeywords: [],
      overallFeedback: "An error occurred during analysis.",
      recommendations: []
    };
  }
};

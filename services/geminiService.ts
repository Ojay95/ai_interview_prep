
import { GoogleGenAI } from "@google/genai";

// Standardizing on a stable model for background analysis tasks to prevent ProxyUnaryCall errors
const STABLE_MODEL = 'gemini-flash-latest'; 

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
  // Remove markdown formatting and ensure we only have the JSON object
  const jsonMatch = str.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];
  return str.replace(/```json/g, '').replace(/```/g, '').trim();
}

export const analyzeJobDescription = async (jd: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: STABLE_MODEL,
      contents: [{ role: 'user', parts: [{ text: `Analyze the following Job Description and return a JSON object with: roleName (string), keySkills (string array), recommendedFocusAreas (string array), experienceLevel (string). \n\nJD: "${jd}"` }] }],
      config: { 
        responseMimeType: 'application/json',
        temperature: 0.1 
      }
    });
    return JSON.parse(cleanJsonString(response.text));
  } catch (error) {
    console.error("Error analyzing job description:", error);
    return { error: "Failed to analyze" }; 
  }
};

export const analyzeResumeMatch = async (resumeText: string, jdText: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: STABLE_MODEL,
      contents: [{ role: 'user', parts: [{ text: `Compare this Resume against this Job Description and return a detailed JSON analysis.
      
      RESUME: 
      ${resumeText}
      
      JD: 
      ${jdText}
      
      Return a JSON object with:
      - matchScore (number 0-100)
      - matchedKeywords (string array)
      - missingKeywords (object array with 'name' and 'type')
      - overallFeedback (string)
      - recommendations (object array with 'title', 'impact', 'description', 'suggestion')` }] }],
      config: { 
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });
    return JSON.parse(cleanJsonString(response.text));
  } catch (error) {
    console.error("Error matching resume:", error);
    throw error;
  }
};

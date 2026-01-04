
import { GoogleGenAI } from "@google/genai";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-flash-preview'; 

// ... (previous audio utilities remain same)

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
  return str.replace(/```json/g, '').replace(/```/g, '').trim();
}

export const analyzeJobDescription = async (jd: string) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Analyze JD: "${jd}". Return JSON: roleName, keySkills[], recommendedFocusAreas[], experienceLevel.`,
      config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(cleanJsonString(response.text));
  } catch (error) {
    console.error("Error analyzing job description:", error);
    return { error: "Failed to analyze" }; 
  }
};

/**
 * NEW: Compares a resume against a job description.
 */
export const analyzeResumeMatch = async (resumeText: string, jdText: string) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Compare this Resume against this Job Description. 
      RESUME: ${resumeText}
      JD: ${jdText}
      
      Return a JSON object with:
      - matchScore (number 0-100)
      - matchedKeywords (string[])
      - missingKeywords (object[] with 'name' and 'type')
      - overallFeedback (string)
      - recommendations (object[] with 'title', 'impact', 'description', 'suggestion')`,
      config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(cleanJsonString(response.text));
  } catch (error) {
    console.error("Error matching resume:", error);
    throw error;
  }
};

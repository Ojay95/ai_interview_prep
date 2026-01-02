
import { GoogleGenAI, Modality } from "@google/genai";

// Decode base64 to Uint8Array
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Encode Uint8Array to base64
export function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert float audio to PCM 16-bit
export function floatTo16BitPCM(data: Float32Array): Uint8Array {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = Math.max(-1, Math.min(1, data[i])) * 32768;
  }
  return new Uint8Array(int16.buffer);
}

// Decode Raw PCM data to AudioBuffer
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

/**
 * Cleans a string that might contain markdown JSON blocks
 */
export function cleanJsonString(str: string): string {
  return str.replace(/```json/g, '').replace(/```/g, '').trim();
}

export const analyzeJobDescription = async (jd: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this job description and provide a JSON response with the following fields: 
    - roleName (string)
    - keySkills (array of strings)
    - recommendedFocusAreas (array of strings)
    - experienceLevel (string: 'Junior', 'Mid-Level', 'Senior', or 'Lead')
    Job Description: ${jd}`,
    config: {
      responseMimeType: 'application/json'
    }
  });
  return JSON.parse(cleanJsonString(response.text));
};

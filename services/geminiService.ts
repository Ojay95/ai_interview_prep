
import { GoogleGenAI } from "@google/genai";

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------

// Initialize the client once (Singleton pattern) to improve performance.
// Use process.env.API_KEY directly as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Use gemini-3-flash-preview for basic text tasks.
// gemini-1.5-flash is prohibited.
const MODEL_NAME = 'gemini-3-flash-preview'; 

// ------------------------------------------------------------------
// AUDIO UTILITIES
// ------------------------------------------------------------------

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

/**
 * Convert float audio (Web Audio API standard) to PCM 16-bit.
 * FIX APPLIED: Prevents overflow crackle when value is exactly 1.0.
 */
export function floatTo16BitPCM(data: Float32Array): Uint8Array {
  const l = data.length;
  const int16 = new Int16Array(l);
  
  for (let i = 0; i < l; i++) {
    const sample = data[i];
    // Clamp values between -1 and 1
    const clamped = Math.max(-1, Math.min(1, sample));
    
    // Scale to 16-bit integer range.
    // If negative, multiply by 32768. If positive, multiply by 32767.
    // This prevents writing 32768 into a signed 16-bit integer (which wraps to -32768).
    int16[i] = clamped < 0 ? clamped * 32768 : clamped * 32767;
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
      // Normalize Int16 back to Float32 (-1.0 to 1.0)
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// ------------------------------------------------------------------
// AI / TEXT UTILITIES
// ------------------------------------------------------------------

/**
 * Cleans a string that might contain markdown JSON blocks.
 * Helps handle LLM responses that include ```json ... ``` fences.
 */
export function cleanJsonString(str: string): string {
  if (!str) return "{}";
  return str.replace(/```json/g, '').replace(/```/g, '').trim();
}

/**
 * Analyzes a job description using Google Gemini.
 * Returns a typed JSON object.
 */
export const analyzeJobDescription = async (jd: string) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `
        Analyze the following Job Description and provide a pure JSON response.
        Do not include markdown formatting.
        
        Fields required:
        - roleName (string)
        - keySkills (array of strings)
        - recommendedFocusAreas (array of strings)
        - experienceLevel (string: 'Junior', 'Mid-Level', 'Senior', or 'Lead')
        
        Job Description:
        "${jd}"
      `,
      config: {
        responseMimeType: 'application/json'
      }
    });

    // Fix: Access .text property directly as it is a getter, not a method.
    const textResponse = response.text;

    if (!textResponse) {
        throw new Error("Empty response from AI model");
    }

    return JSON.parse(cleanJsonString(textResponse));
    
  } catch (error) {
    console.error("Error analyzing job description:", error);
    // Return a safe fallback or rethrow depending on your app's error handling strategy
    return { error: "Failed to analyze job description" }; 
  }
};

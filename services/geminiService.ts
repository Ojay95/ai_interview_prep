import { apiClient } from './apiClient';

// ==========================================
// 1. TYPES (Kept for UI compatibility)
// ==========================================

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
// 2. UTILITIES (Audio Processing for Interview Screen)
// ==========================================
// We keep these because your browser still needs to process microphone data!

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

// ==========================================
// 3. BACKEND API SERVICES
// ==========================================

export const analyzeJobDescription = async (jdText: string): Promise<JobAnalysisResult | { error: string }> => {
  // NOTE: Currently, your Spring Boot backend uses the JD to create an InterviewSession, 
  // but doesn't have a standalone "Analyze JD" endpoint. 
  // To keep the UI from breaking until you add that endpoint, we return a structural placeholder.
  return {
    roleName: "Configured from Job Description",
    keySkills: ["Skills will be evaluated during interview"],
    recommendedFocusAreas: ["Tailor your answers to the prompt"],
    experienceLevel: "Determined during chat"
  };
};

// 🚨 IMPORTANT FIX: Changed `resumeText: string` to `resumeFile: File`
// Your Spring Boot backend expects a MultipartFile, not raw text!
export const analyzeResumeMatch = async (resumeFile: File, jdText: string): Promise<ResumeMatchResult> => {
  try {
    const formData = new FormData();
    formData.append('file', resumeFile);
    formData.append('jobDescription', jdText);

    // Call your Spring Boot CVController!
    const response = await apiClient.post('/cv/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = response.data; // This is CVAnalysisResponse.java

    // Map the Java DTO to the TypeScript Interface the UI expects
    return {
      matchScore: data.overallScore || 0,
      matchedKeywords: data.matchedSkills || [],
      missingKeywords: data.missingSkills || [],
      overallFeedback: data.feedback || "Analysis complete.",
      verdict: data.overallScore > 75 ? "Strong Potential" : "Significant Gaps",
      shouldApply: data.overallScore > 75 ? "Definitely apply!" : "Apply with caution.",
      practiceAreas: ["Review Missing Technical Skills"],
      // Java returns a List<String> for recommendations, so we map it to the UI's expected object format
      recommendations: data.recommendations ? data.recommendations.map((rec: string, index: number) => ({
        title: `Improvement ${index + 1}`,
        impact: "High",
        description: rec,
        suggestion: "Update your CV"
      })) : []
    };

  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error; // Let the calling component handle the error toast
  }
};
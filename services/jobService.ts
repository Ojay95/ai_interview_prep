import { GoogleGenAI } from '@google/genai';
import { Job } from '../types';
import { GEMINI_MODELS } from '../constants';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const jobService = {
  async getJobSuggestions(role: string, location: string = 'Remote', page: number = 1): Promise<{ jobs: Job[], totalCount: number }> {
    try {
      const prompt = `
        Act as a professional real-time job scraper and verification engine. 
        Your goal is to find 10 ACTIVE, HIGH-INTEGRITY job listings for: "${role}" in "${location}".
        This is page ${page} of the results.
        
        CRITICAL LINK INTEGRITY CONSTRAINTS:
        1. NO HALLUCINATION: You are FORBIDDEN from making up URLs. Every "externalUrl" MUST be a real, link that leads directly to the job post.
        2. SOURCE PRIORITY: Prioritize links from Greenhouse.io, Lever.co, Workday, LinkedIn, and official company career pages. 
        3. AVOID AGGREGATOR TRAPS: Avoid outdated links from general search results that lead to "Page Not Found". If you find a job on a search engine, try to find the official career site link for that specific job instead.
        4. VERIFICATION: Use the googleSearch tool to cross-reference the job and company to ensure the listing is still active. If a job was posted more than 7 days ago, DISCARD it unless it is a high-quality verifiable link.
        5. FRESHNESS: Jobs must be posted within the last 7 days.
        6. LATENCY: Be concise. Return results immediately once found.

        Return a valid JSON object:
        {
          "jobs": [
            {
              "id": "string",
              "title": "string",
              "company": "string",
              "location": "string",
              "salary": "string",
              "type": "string",
              "description": "string (brief summary, ~300 chars)",
              "requirements": ["string"],
              "postedDate": "string (e.g., '2 days ago' or 'Apr 18')",
              "source": "string (e.g. 'Company Career Page', 'LinkedIn', 'Greenhouse')",
              "externalUrl": "string (REAL DIRECT APPLY LINK)",
              "matchScore": number,
              "aiReasoning": "string (short)"
            }
          ],
          "totalCount": number (total number of jobs matching the query across the web, e.g., 85)
        }
      `;

      const response = await genAI.models.generateContent({
        model: GEMINI_MODELS.TEXT_ANALYSIS,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json'
        }
      });
      
      const text = response.text || '';
      
      try {
        const result = JSON.parse(text);
        return {
          jobs: result.jobs || [],
          totalCount: result.totalCount || 0
        };
      } catch {
        // Fallback for non-strict JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return {
            jobs: result.jobs || [],
            totalCount: result.totalCount || 0
          };
        }
        throw new Error('Failed to parse job suggestions');
      }
    } catch (error) {
      console.error('Error fetching job suggestions:', error);
      return { jobs: [], totalCount: 0 };
    }
  },

  async searchJobs(query: string, location: string = 'Remote', page: number = 1): Promise<{ jobs: Job[], totalCount: number }> {
    return this.getJobSuggestions(query, location, page);
  }
};

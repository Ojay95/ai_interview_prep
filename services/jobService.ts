import { GoogleGenAI } from '@google/genai';
import { Job } from '../types';
import { GEMINI_MODELS } from '../constants';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const jobService = {
  async getJobSuggestions(role: string, location: string = 'Remote', page: number = 1): Promise<{ jobs: Job[], totalCount: number }> {
    try {
      const prompt = `
        Act as a professional job scraper and recruiter. 
        Find and generate 5 highly realistic and diverse job listings for the role of "${role}" in "${location}".
        This is page ${page} of the results.
        These should look like they were scraped from Indeed, Glassdoor, or LinkedIn.
        Include a mix of seniority levels and company types.
        
        Return the data as a JSON object with the following structure:
        {
          "jobs": [
            {
              "id": "string (unique)",
              "title": "string",
              "company": "string",
              "location": "string",
              "salary": "string (e.g. $120k - $150k)",
              "type": "string (Full-time, Contract, etc.)",
              "description": "string (FULL detailed job description, including responsibilities, about the company, and benefits. Minimum 500 characters if possible)",
              "requirements": ["string", "string"],
              "postedDate": "string (e.g. 2 days ago)",
              "source": "string (Indeed, Glassdoor, LinkedIn, etc.)",
              "externalUrl": "string (MUST be a real, direct link to the job posting or a specific search result on that platform)",
              "matchScore": number (1-100 based on how well it fits the role),
              "aiReasoning": "string (1 sentence explaining why this is a good match)"
            }
          ],
          "totalCount": number (estimate the total number of relevant jobs available, e.g. 50)
        }
        
        Use the googleSearch tool to find ACTUAL current job openings. Do not hallucinate URLs.
        
        Ensure the JSON is valid and only return the JSON object.
      `;

      const response = await genAI.models.generateContent({
        model: GEMINI_MODELS.TEXT_ANALYSIS,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      
      const text = response.text || '';
      
      // Clean up the response text to ensure it's valid JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          jobs: result.jobs || [],
          totalCount: result.totalCount || 0
        };
      }
      
      throw new Error('Failed to parse job suggestions');
    } catch (error) {
      console.error('Error fetching job suggestions:', error);
      return { jobs: [], totalCount: 0 };
    }
  },

  async searchJobs(query: string, location: string = 'Remote', page: number = 1): Promise<{ jobs: Job[], totalCount: number }> {
    return this.getJobSuggestions(query, location, page);
  }
};

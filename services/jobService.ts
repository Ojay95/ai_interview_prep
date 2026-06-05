import { GoogleGenAI } from '@google/genai';
import { Job } from '../types';
import { GEMINI_MODELS } from '../constants';
import { apiClient } from './apiClient';

const env = (typeof window !== 'undefined' && (window as any).process?.env) || {};
const IS_DEMO_MODE = env.VITE_DEMO_MODE === 'true';

// Cache for dynamically loaded API key to avoid repeated fetch calls
let cachedApiKey: string | null = null;

async function getGenAIInstance(): Promise<GoogleGenAI> {
  if (cachedApiKey) {
    return new GoogleGenAI({ apiKey: cachedApiKey });
  }

  let apiKey = env.GEMINI_API_KEY || '';
  if (!apiKey) {
    try {
      const configRes = await apiClient.get('/ai/config');
      apiKey = configRes.data.apiKey || '';
      cachedApiKey = apiKey;
    } catch (e) {
      console.warn("Failed to fetch API key from backend:", e);
    }
  }

  return new GoogleGenAI({ apiKey });
}

function generateMockJobs(role: string, location: string, page: number): { jobs: Job[], totalCount: number } {
  const targetRole = role || 'Software Engineer';
  const targetLocation = location || 'Remote';
  
  // Choose companies based on role type to make it feel super tailored
  let roleType: 'frontend' | 'backend' | 'ai' | 'design' | 'general' = 'general';
  if (/front|react|ui|web/i.test(targetRole)) roleType = 'frontend';
  else if (/back|node|java|go|python|api|system/i.test(targetRole)) roleType = 'backend';
  else if (/ai|ml|data|learning|python|model/i.test(targetRole)) roleType = 'ai';
  else if (/design|ux|ui/i.test(targetRole)) roleType = 'design';

  const companiesList = {
    frontend: [
      { name: 'Vercel', source: 'Greenhouse', salary: '$140,000 - $190,000' },
      { name: 'Stripe', source: 'Lever', salary: '$160,000 - $210,000' },
      { name: 'Figma', source: 'Lever', salary: '$150,000 - $200,000' },
      { name: 'Linear', source: 'Company Careers', salary: '$135,000 - $175,000' }
    ],
    backend: [
      { name: 'Supabase', source: 'Greenhouse', salary: '$130,000 - $180,000' },
      { name: 'Netflix', source: 'LinkedIn', salary: '$220,000 - $310,000' },
      { name: 'Uber', source: 'Company Careers', salary: '$170,000 - $240,000' },
      { name: 'Cloudflare', source: 'Greenhouse', salary: '$145,000 - $195,000' }
    ],
    ai: [
      { name: 'OpenAI', source: 'LinkedIn', salary: '$250,000 - $380,000' },
      { name: 'Anthropic', source: 'Greenhouse', salary: '$280,000 - $420,000' },
      { name: 'Scale AI', source: 'Lever', salary: '$180,000 - $260,000' },
      { name: 'Hugging Face', source: 'Company Careers', salary: '$150,000 - $220,000' }
    ],
    design: [
      { name: 'Airbnb', source: 'Lever', salary: '$155,000 - $210,000' },
      { name: 'Figma', source: 'Lever', salary: '$150,000 - $205,000' },
      { name: 'Linear', source: 'Company Careers', salary: '$140,000 - $180,000' },
      { name: 'Stripe', source: 'LinkedIn', salary: '$160,000 - $220,000' }
    ],
    general: [
      { name: 'Google', source: 'Company Careers', salary: '$150,000 - $225,000' },
      { name: 'Apple', source: 'Company Careers', salary: '$160,000 - $240,000' },
      { name: 'Microsoft', source: 'LinkedIn', salary: '$140,000 - $210,000' },
      { name: 'Amazon', source: 'Greenhouse', salary: '$135,000 - $200,000' }
    ]
  }[roleType];

  const jobTemplates = [
    {
      titleSuffix: 'Staff Engineer',
      type: 'Full-time',
      posted: 'Just now',
      matchScore: 94,
      aiReasoning: 'Your resume shows deep expertise in technologies matching this high-impact role.'
    },
    {
      titleSuffix: 'Senior Engineer',
      type: 'Full-time',
      posted: '1 day ago',
      matchScore: 88,
      aiReasoning: 'Matches 85% of their core technical stack. Perfect experience level alignment.'
    },
    {
      titleSuffix: 'Engineer II',
      type: 'Full-time',
      posted: '2 days ago',
      matchScore: 78,
      aiReasoning: 'Solid foundation match, although they list TypeScript as required and your resume emphasizes JavaScript.'
    },
    {
      titleSuffix: 'Lead Developer',
      type: 'Contract',
      posted: '4 days ago',
      matchScore: 91,
      aiReasoning: 'Excellent leadership match. Mentions system design chops which your portfolio highlights heavily.'
    }
  ];

  const mockJobs: Job[] = [];
  const startId = (page - 1) * 4;

  for (let i = 0; i < 4; i++) {
    const compIdx = (startId + i) % companiesList.length;
    const tempIdx = (startId + i) % jobTemplates.length;
    const company = companiesList[compIdx];
    const template = jobTemplates[tempIdx];

    const cleanTitle = targetRole.replace(/(senior|junior|lead|staff|principal)/gi, '').trim();
    const formattedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
    const finalTitle = `${template.titleSuffix} - ${formattedTitle}`;

    mockJobs.push({
      id: `mock-job-${startId + i + 1}`,
      title: finalTitle,
      company: company.name,
      location: targetLocation,
      salary: company.salary,
      type: template.type,
      description: `Join the team at ${company.name} working on core product experiences. You will collaborate with cross-functional teams to design, build, and deploy high-quality solutions. This role offers high visibility and opportunities for strategic ownership.`,
      requirements: [
        '5+ years of professional software engineering experience.',
        'Strong fundamentals in computer science, system design, and software architecture.',
        'Proven track record of shipping scalable web applications.',
        'Excellent communication and collaborative problem-solving skills.'
      ],
      postedDate: template.posted,
      source: company.source,
      externalUrl: `https://${company.name.toLowerCase().replace(' ', '')}.com/careers`,
      matchScore: template.matchScore,
      aiReasoning: template.aiReasoning
    });
  }

  return {
    jobs: mockJobs,
    totalCount: 36
  };
}

export const jobService = {
  async getJobSuggestions(role: string, location: string = 'Remote', page: number = 1): Promise<{ jobs: Job[], totalCount: number }> {
    if (IS_DEMO_MODE) {
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 800));
      return generateMockJobs(role, location, page);
    }

    try {
      const genAI = await getGenAIInstance();
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

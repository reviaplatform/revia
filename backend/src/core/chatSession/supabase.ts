import { createClient } from '@supabase/supabase-js';
import Config from '@/config/env';

const rawSupabaseUrl = Config.SUPABASE_URL;
const supabaseUrl = rawSupabaseUrl ? rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '') : undefined;
const supabaseAnonKey = Config.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found in environment variables. Known issues feature will be disabled.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export interface KnownIssue {
  id: string;
  manufacturer: string;
  model: string;
  issue_title: string;
  description: string;
  symptoms: string[];
}

export async function fetchKnownIssues(manufacturer: string, model: string, searchQuery?: string): Promise<KnownIssue[]> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return [];
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let query = supabase
      .from('device_known_issues')
      .select('*')
      .ilike('manufacturer', `%${manufacturer}%`)
      .ilike('model', `%${model}%`);

    if (searchQuery) {
      // Split the search query into keywords and search locally after fetching, or try an OR filter.
      // Easiest is to fetch all for the model and filter in Javascript since we don't have full-text search index guaranteed.
    }

    const { data, error } = await query.abortSignal(controller.signal);

    clearTimeout(timeoutId);

    if (error) {
      console.error('Error fetching known issues:', error);
      throw new Error(error.message);
    }

    let results = data || [];

    if (searchQuery && results.length > 0) {
      const keywords = searchQuery.toLowerCase().split(' ').filter(word => word.length > 3);
      if (keywords.length > 0) {
        results = results.filter(issue => {
          const textToSearch = `${issue.issue_title} ${issue.description} ${issue.symptoms?.join(' ')}`.toLowerCase();
          return keywords.some(kw => textToSearch.includes(kw));
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error fetching known issues:', error);
    throw error;
  }
}

export interface RepairManual {
  id: string;
  manufacturer: string;
  model: string;
  title: string;
  content: string;
  similarity?: number;
}

/**
 * Searches the vector database for unstructured repair manuals related to a query.
 */
export async function searchRepairManuals(query: string, manufacturer: string, model: string, deviceType?: string): Promise<RepairManual[]> {
  if (!supabaseUrl || !supabaseAnonKey || !Config.GEMINI_API_KEY) {
    console.warn('Missing credentials for vector search.');
    return [];
  }

  try {
    const { GoogleGenAI } = await require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: Config.GEMINI_API_KEY || '' });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // Generate the embedding for the user's query
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: query,
      config: { outputDimensionality: 768 },
    });

    const embedding = response.embeddings?.[0]?.values;
    if (!embedding) {
      clearTimeout(timeoutId);
      return [];
    }

    // Call the matching RPC function
    const { data, error } = await supabase.rpc('match_manuals', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 3,
      p_manufacturer: manufacturer,
      p_model: model,
      p_device_type: deviceType || null,
    }).abortSignal(controller.signal);

    clearTimeout(timeoutId);

    if (error) {
      console.error('Error executing vector search:', error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (err) {
    console.error('Failed to perform semantic search on manuals', err);
    throw err;
  }
}

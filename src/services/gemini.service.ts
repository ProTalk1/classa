
import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    // The API key is injected via environment variables.
    if (process.env.API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } else {
      console.error('Gemini API key not found in environment variables.');
    }
  }

  async improveText(text: string): Promise<string> {
    if (!this.ai) {
      throw new Error('Gemini AI client not initialized. Check API key.');
    }

    try {
      const prompt = `Refine and improve the following text for a social media post on a student network. Make it more engaging and clear, but keep the original meaning. Return only the improved text. Text: "${text}"`;
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      // Return original text as a fallback
      return text;
    }
  }
}

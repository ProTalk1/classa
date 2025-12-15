
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
      console.error('Chave da API do Gemini não encontrada nas variáveis de ambiente.');
    }
  }

  async improveText(text: string): Promise<string> {
    if (!this.ai) {
      throw new Error('Cliente de IA do Gemini não inicializado. Verifique a chave da API.');
    }

    try {
      const prompt = `Refine e melhore o texto a seguir para uma postagem em uma rede social de estudantes. Torne-o mais envolvente e claro, mantendo o significado original. Retorne apenas o texto aprimorado. Texto: "${text}"`;
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Erro ao chamar a API do Gemini:', error);
      // Return original text as a fallback
      return text;
    }
  }
}

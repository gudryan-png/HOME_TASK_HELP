import { GoogleGenAI } from "@google/genai";
import { Tutorial, Difficulty, Category } from "../types";

// Initialize the AI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateTutorial(taskTitle: string, difficulty: Difficulty = 'Iniciante'): Promise<Tutorial> {
  const prompt = `
    Crie um tutorial detalhado para a tarefa doméstica: "${taskTitle}".
    Nível de dificuldade alvo: ${difficulty}.
    
    Retorne APENAS um objeto JSON seguindo exatamente esta estrutura:
    {
      "title": "string",
      "overview": "string (visão geral)",
      "materials": ["string"],
      "steps": ["string"],
      "explanation": "string (o porquê de fazer assim)",
      "precautions": ["string"],
      "tips": ["string"],
      "commonErrors": ["string"],
      "videoSuggestion": "string (termo de busca para youtube)",
      "difficulty": "${difficulty}",
      "estimatedTime": "string (ex: 20 min)"
    }
    
    O conteúdo deve ser em Português do Brasil, educativo, motivador e prático.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
    });

    const text = response.text || "";
    // Clean potential markdown code blocks
    const cleanedJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedJson) as Tutorial;
  } catch (error) {
    console.error("Erro ao gerar tutorial:", error);
    throw error;
  }
}

export async function suggestTasks(currentTasks: string[]): Promise<{ title: string; category: Category; difficulty: Difficulty }[]> {
  const prompt = `
    Com base nestas tarefas atuais: ${currentTasks.join(", ") || "Nenhuma"}.
    Sugira 3 novas tarefas domésticas úteis para manter a casa organizada.
    Retorne APENAS um array JSON:
    [
      { "title": "string", "category": "Limpeza|Cozinha|Organização|Reparos|Outros", "difficulty": "Iniciante|Intermediário|Avançado" }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
    });

    const text = response.text || "";
    const cleanedJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("Erro ao sugerir tarefas:", error);
    return [];
  }
}

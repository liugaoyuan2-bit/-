import { GoogleGenAI, Type } from "@google/genai";
import { Course } from '../types';

// Simulate a web crawler by asking Gemini to generate realistic university course data
export const generateCourses = async (topic: string, teacherName: string, teacherId: string): Promise<Omit<Course, 'id'>[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("No API Key provided for Gemini crawler");
    return [
      { name: "模拟课程1", credits: 2, teacherName, teacherId, description: "API Key未配置，使用模拟数据" },
      { name: "模拟课程2", credits: 3, teacherName, teacherId, description: "API Key未配置，使用模拟数据" }
    ];
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 3 realistic university courses related to "${topic}". They should be taught by ${teacherName}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Course name" },
              credits: { type: Type.NUMBER, description: "Credits (1-5)" },
              description: { type: Type.STRING, description: "Short description" },
            },
            required: ["name", "credits", "description"],
          },
        },
      },
    });

    const data = JSON.parse(response.text);
    return data.map((item: any) => ({
      name: item.name,
      credits: item.credits,
      description: item.description,
      teacherId,
      teacherName
    }));

  } catch (error) {
    console.error("Gemini crawl failed", error);
    return [];
  }
};

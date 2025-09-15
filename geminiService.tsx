import { GoogleGenAI, Type } from "@google/genai";
import type { Flashcard, QuizQuestion, FlashcardData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateFlashcards = async (topic: string, gradeLevel: string): Promise<FlashcardData> => {
    const prompt = `Generate a set of educational flashcards (between 4 and 10) on the topic "${topic}" for a ${gradeLevel} student. Each flashcard must have a "heading" and "information". Additionally, provide a comprehensive and exhaustive list of all relevant and important formulas or key takeaways related to the topic. For scientific or mathematical topics, be thorough and include all fundamental formulas. If there are no specific formulas (e.g., for a history topic), this should be a comprehensive list of key dates, figures, or principles. If none are applicable, return an empty array for formulas.`;
    
    try {
        const textResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        flashcards: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    heading: { 
                                        type: Type.STRING,
                                        description: "A key sub-topic or concept."
                                    },
                                    information: { 
                                        type: Type.STRING,
                                        description: "A concise summary of the information related to the heading."
                                    }
                                },
                                required: ["heading", "information"]
                            }
                        },
                        formulas: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING
                            },
                            description: "A list of important formulas or key takeaways. Empty if not applicable."
                        }
                    },
                    required: ["flashcards", "formulas"]
                }
            }
        });
        
        const jsonText = textResponse.text.trim();
        const data: { flashcards: Flashcard[], formulas: string[] } = JSON.parse(jsonText);
        if (!Array.isArray(data.flashcards) || data.flashcards.length === 0) {
            throw new Error("AI returned invalid flashcard data.");
        }

        const imageGenerationPromises = data.flashcards.map(async (flashcard) => {
            try {
                const imagePrompt = `A simple, clear, and visually appealing educational illustration for a flashcard about: '${flashcard.heading}'. Minimalist style, focusing on the core concept.`;
                const imageResponse = await ai.models.generateImages({
                    model: 'imagen-4.0-generate-001',
                    prompt: imagePrompt,
                    config: {
                      numberOfImages: 1,
                      outputMimeType: 'image/jpeg',
                      aspectRatio: '16:9',
                    },
                });

                if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
                    const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
                    return `data:image/jpeg;base64,${base64ImageBytes}`;
                }
                return undefined;
            } catch (imageError) {
                console.error(`Failed to generate image for flashcard: ${flashcard.heading}`, imageError);
                return undefined;
            }
        });

        const imageUrls = await Promise.all(imageGenerationPromises);

        const flashcardsWithImages: Flashcard[] = data.flashcards.map((flashcard, index) => ({
            ...flashcard,
            imageUrl: imageUrls[index]
        }));

        return { flashcards: flashcardsWithImages, formulas: data.formulas };

    } catch (error) {
        console.error("Error generating flashcards:", error);
        throw new Error("Failed to communicate with the AI for flashcard generation.");
    }
};

export const generateQuiz = async (topic: string, gradeLevel: string, difficulty: string): Promise<QuizQuestion[]> => {
    const prompt = `Create a multiple-choice quiz on the topic "${topic}" suitable for a ${gradeLevel} student. The quiz must be at a ${difficulty} difficulty level. Adjust the number of questions and their complexity based on the difficulty. For 'Easy', generate 4-5 simple, direct questions. For 'Medium', generate 6-8 questions requiring some interpretation. For 'Hard', generate 8-10 complex, multi-step, or nuanced questions. Each question must have 4 options, one correct answer, a brief explanation for the correct answer, and an optional, concise hint to help the user if they're stuck. The correctAnswer must be one of the strings from the options array.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { 
                                type: Type.STRING,
                                description: "The quiz question."
                            },
                            options: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                                description: "An array of 4 possible answers."
                            },
                            correctAnswer: { 
                                type: Type.STRING,
                                description: "The correct answer, which must exactly match one of the options."
                            },
                            explanation: {
                                type: Type.STRING,
                                description: "A brief explanation for why the correct answer is correct."
                            },
                            hint: {
                                type: Type.STRING,
                                description: "An optional, concise hint for the question."
                            }
                        },
                        required: ["question", "options", "correctAnswer", "explanation"]
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const quiz: QuizQuestion[] = JSON.parse(jsonText);
        if (!Array.isArray(quiz) || quiz.length === 0 || quiz.some(q => q.options.length !== 4 || !q.explanation)) {
             throw new Error("AI returned invalid quiz data.");
        }
        
        const quizWithImagesPromises = quiz.map(async (question) => {
            try {
                const imagePrompt = `A simple, clear, educational illustration explaining: "${question.explanation}". Minimalist style, focusing on the core concept for a quiz explanation.`;
                const imageResponse = await ai.models.generateImages({
                    model: 'imagen-4.0-generate-001',
                    prompt: imagePrompt,
                    config: {
                      numberOfImages: 1,
                      outputMimeType: 'image/jpeg',
                      aspectRatio: '16:9',
                    },
                });

                if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
                    const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
                    return {
                        ...question,
                        explanationImageUrl: `data:image/jpeg;base64,${base64ImageBytes}`
                    };
                }
                return question;
            } catch (imageError) {
                console.error(`Failed to generate image for explanation: ${question.explanation}`, imageError);
                return question;
            }
        });

        const quizWithImages = await Promise.all(quizWithImagesPromises);
        return quizWithImages;

    } catch (error) {
        console.error("Error generating quiz:", error);
        throw new Error("Failed to communicate with the AI for quiz generation.");
    }
};

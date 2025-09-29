const GEMINI_API_KEY = 'AIzaSyDgShKEEeX9viEQ90JHAUBfwQqlu0c9rBw';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

export class GeminiService {
  static createScriptPrompt(questions, examName) {
    // Create a short exam acronym for the call to action
    const examAcronym = examName
      .split(' ')
      .filter(word => word.length > 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();

    const intro = `Hello everyone! Today, we're going to solve some challenging questions for the upcoming ${examName} entrance exam. Let's dive in!`;
    
    const callToAction = `The answer and solution will appear in the last 5 seconds of this video. Till then, if you're looking for a complete guide for ${examName}, follow and comment '${examAcronym}' and it will be in your DMs!`;

    let questionSections = '';
    questions.forEach((q, index) => {
      let optionsText = '';
      if (q.options && typeof q.options === 'object') {
        const optionsList = Object.entries(q.options)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        optionsText = `Here are your options: ${optionsList}.`;
      }

      questionSections += `Question ${index + 1}: So, the question says: ${q.question_statement}. ${optionsText} You'll have a 5-second countdown to think about it. `;
    });

    return `You are an AI video script generator for educational content, specifically for Instagram Reels explaining mathematical problems. 

Your task is to create a concise, engaging, and clear script for a voice-over that will be converted to speech.

CRITICAL INSTRUCTIONS for mathematical symbols:
- Convert ALL mathematical symbols to spoken words
- $x^2$ becomes "x squared"
- $x^3$ becomes "x cubed"  
- $\\sqrt{x}$ becomes "square root of x"
- $\\int$ becomes "integral"
- $\\sum$ becomes "summation"
- $\\frac{a}{b}$ becomes "a over b" or "fraction a over b"
- $\\pi$ becomes "pi"
- $\\alpha, \\beta, \\gamma$ become "alpha, beta, gamma"
- $\\sin, \\cos, \\tan$ become "sine, cosine, tangent"
- $\\log$ becomes "logarithm"
- $\\ln$ becomes "natural log"
- $\\infty$ becomes "infinity"
- $\\pm$ becomes "plus or minus"
- $\\leq, \\geq$ become "less than or equal to, greater than or equal to"

The script should follow this exact structure:

1. Introduction: "${intro}"

2. Questions: ${questionSections}

3. Call to Action: "${callToAction}"

Make the tone encouraging and educational. Keep it concise for an Instagram Reel, ideally under 250 words. Ensure all mathematical expressions are converted to natural speech patterns.

Generate ONLY the final script text, no additional formatting or explanations.`;
  }

  static async generateScript(prompt) {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      }
      
      throw new Error('No content generated from Gemini API');
    } catch (error) {
      console.error('Error generating script:', error);
      throw error;
    }
  }
}
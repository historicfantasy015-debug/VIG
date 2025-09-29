import os
import json
import urllib.request

class GeminiService:
    # Read from os.environ, which is populated by start.js
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

    @staticmethod
    def create_script_prompt(questions, exam_name):
        # Derive a short exam name for the call to action
        exam_name_short = "".join(word[0] for word in exam_name.split() if word.isalnum()).upper()
        if not exam_name_short:
            exam_name_short = "EXAM" # Fallback

        intro = f"Hello everyone! Today, we're going to solve some challenging questions for the upcoming {exam_name} entrance exam. Let's dive in!"
        call_to_action = f"The answer and solution will appear in the last 5 seconds of this video. Till then, if you're looking for a complete guide for {exam_name}, follow and comment '{exam_name_short}' and it will be in your DMs!"

        question_sections = []
        for i, q in enumerate(questions):
            options_str = ""
            if q.get('options'):
                options_list = [f"{key}: {value}" for key, value in q['options'].items()]
                options_str = f"Here are your options: {', '.join(options_list)}."

            question_sections.append(
                f"Question {i+1}: So, the question says: {q['question_statement']}. {options_str} "
                f"You'll have a 5-second countdown to think about it."
                # Solution is not dictated here, only mentioned in the call to action
            )

        full_prompt = (
            f"You are an AI video script generator for educational content, specifically for Instagram Reels explaining mathematical problems. "
            f"Your task is to create a concise, engaging, and clear script for a voice-over. "
            f"Ensure mathematical symbols like '$x^2$', '$\int$', '$\sum$' are spoken clearly and naturally (e.g., 'x squared', 'integral', 'summation'). "
            f"The script should flow naturally for a voice-over and adhere to the following structure:\n\n"
            f"1. Introduction: Start with an engaging intro similar to: '{intro}'\n"
            f"2. For each question:\n"
            f"   - Announce the question number.\n"
            f"   - Read the question statement clearly, pronouncing mathematical symbols. For example, 'x squared' for '$x^2$'.\n"
            f"   - If options are present, read them out.\n"
            f"   - Include a phrase about a 5-second countdown for the viewer to think.\n"
            f"3. Conclusion/Call to Action: End with a call to action similar to: '{call_to_action}'\n\n"
            f"Here are the questions and their solutions (for your reference, do not dictate solutions directly in the main script body):\n\n"
            f"{' '.join(question_sections)}\n\n"
            f"Make sure the tone is encouraging and educational. Keep the overall script concise for an Instagram Reel, ideally under 300 words."
        )
        return full_prompt

    @staticmethod
    def generate_script(prompt):
        if not GeminiService.GEMINI_API_KEY:
            raise ValueError("Gemini API Key not set in environment variables.")

        headers = {
            'Content-Type': 'application/json',
        }
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ]
        }
        
        url_with_key = f"{GeminiService.GEMINI_API_URL}?key={GeminiService.GEMINI_API_KEY}"

        req = urllib.request.Request(url_with_key, headers=headers, data=json.dumps(payload).encode('utf-8'), method='POST')

        try:
            with urllib.request.urlopen(req) as response:
                response_data = json.loads(response.read().decode('utf-8'))
                if 'candidates' in response_data and len(response_data['candidates']) > 0:
                    for part in response_data['candidates'][0]['content']['parts']:
                        if 'text' in part:
                            return part['text']
                return "Failed to generate script: No text found in Gemini response."
        except urllib.error.HTTPError as e:
            error_message = e.read().decode('utf-8')
            print(f"Gemini API HTTP Error: {e.code} - {error_message}")
            raise Exception(f"Gemini API Error: {error_message}")
        except Exception as e:
            print(f"Gemini API Request Error: {e}")
            raise

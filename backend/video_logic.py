import re
import random

def generate_conceptual_video_data(script, questions, exam_name, tts_api_key):
    """
    Generates conceptual voice-over text and caption data from the script,
    incorporating Instagram Reel specific timings and structure.
    """
    # For simplicity, the full script is the voice-over text.
    # In a real scenario, Murf TTS would generate audio from this script using tts_api_key.
    voice_over_text = script 

    # Simulate caption generation and timing (aeneas would be used for real timing)
    sentences = re.split(r'(?<=[.!?])\s+', script)
    captions = []
    current_time = 0.0
    
    # Conceptual timing for intro, questions, countdowns, solutions, and outro
    for i, sentence in enumerate(sentences):
        word_count = len(sentence.split())
        # Estimate duration based on word count (e.g., 0.25 seconds per word, min 1.5s)
        duration = max(1.5, word_count * 0.25) 
        
        captions.append({
            "text": sentence.strip(),
            "start_time": current_time,
            "end_time": current_time + duration,
            "highlight_effect": "ASS_STYLE_BOLD_YELLOW" # Conceptual highlight style
        })
        current_time += duration

        # After each question statement (and options), conceptually add a 5-second countdown
        # This is a conceptual placeholder; actual video editing would insert a visual countdown.
        if f"Question {i+1}:" in sentence and "You'll have a 5-second countdown" in sentence:
            captions.append({
                "text": "5-second countdown...",
                "start_time": current_time,
                "end_time": current_time + 5.0,
                "highlight_effect": "ASS_STYLE_COUNTDOWN"
            })
            current_time += 5.0

    # At the very end, after the main script, conceptually add the solutions for 5 seconds
    # This would be a separate video segment in a real video.
    solution_text = "Solutions:\n"
    for i, q in enumerate(questions):
        solution_text += f"Q{i+1}: {q['solution']}\n"
    
    captions.append({
        "text": solution_text.strip(),
        "start_time": current_time,
        "end_time": current_time + 5.0, # Show solutions for 5 seconds
        "highlight_effect": "ASS_STYLE_SOLUTION_DISPLAY"
    })
    current_time += 5.0

    # Conceptual rotating templates
    templates = [
        "Dynamic Math Explainer - Clean & Modern",
        "Animated Chalkboard Style - Engaging & Educational",
        "Minimalist Whiteboard Reveal - Focus on Content",
        "Sci-Fi Data Overlay - Futuristic Learning",
        "Vibrant Gradient Flow - Energetic & Youthful"
    ]
    template_suggestion = random.choice(templates)

    return {
        "voice_over_text": voice_over_text,
        "captions": captions,
        "template_suggestion": template_suggestion,
        "total_conceptual_duration": current_time, # Total estimated video duration
        "murf_tts_api_key": tts_api_key, # Pass the Murf API key for external use
        "exam_name": exam_name # Pass the exam name for external use
    }

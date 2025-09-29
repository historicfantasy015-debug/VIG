# AI Automatic Video Maker

A comprehensive system for automatically generating educational videos with AI-powered scripts, voice-over, and captions.

## Features

- **AI Script Generation**: Uses Gemini 1.5 Pro to create engaging educational scripts
- **Mathematical Symbol Conversion**: Automatically converts LaTeX math symbols to spoken words
- **Voice-Over Integration**: Ready for Murf TTS API integration
- **Caption System**: Automatic timing and highlight effects
- **Template Rotation**: 5 different video templates that rotate automatically
- **Supabase Integration**: Direct connection to your question database

## Setup Instructions

### 1. Environment Variables

Create a `.env` file with the following variables:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=AIzaSyDgShKEEeX9viEQ90JHAUBfwQqlu0c9rBw
MURF_TTS_API_KEY=ap2_01771851-fe5d-4e13-a843-a49b28e72ef9
```

### 2. Database Schema

Your Supabase database should have these tables with the relationships:
- `exams` → `courses` → `subjects` → `units` → `topics` → `new_questions`

### 3. Required API Keys

1. **Gemini API Key**: Already provided (`AIzaSyDgShKEEeX9viEQ90JHAUBfwQqlu0c9rBw`)
2. **Murf TTS API Key**: For voice generation (`ap2_01771851-fe5d-4e13-a843-a49b28e72ef9`)
3. **Supabase Keys**: URL and Anon Key from your Supabase project

### 4. Installation & Running

```bash
npm install
npm run dev
```

## System Architecture

### Current Implementation (WebContainer Compatible)
- **Frontend**: React with Supabase client
- **AI Script Generation**: Gemini 1.5 Pro API
- **Database**: Supabase with RLS policies
- **Conceptual Components**: Caption timing, template selection, voice-over preparation

### Full Production Implementation
For a complete video generation system, you'll need:

1. **Voice-Over Generation**
   - Murf TTS API integration
   - Audio file processing

2. **Caption System**
   - `aeneas` for precise audio-text alignment
   - FFmpeg ASS for highlight effects and styling

3. **Video Editing**
   - `MoviePy` for video composition
   - FFmpeg for rendering and effects
   - Template system with dynamic backgrounds

4. **Automation**
   - Python worker process
   - Cron job scheduling
   - Docker containerization
   - Queue system for batch processing

5. **Optional Enhancements**
   - Whisper for backup caption alignment
   - Advanced template customization
   - Batch video generation

## Video Script Structure

The AI generates scripts following this pattern:

1. **Introduction**: "Hello everyone! Today, we're going to solve some challenging questions for the [EXAM NAME] entrance exam. Let's dive in!"

2. **Questions**: For each question:
   - Question announcement
   - Question statement (with math symbols converted to speech)
   - Options (if MCQ/MSQ)
   - 5-second thinking countdown

3. **Call to Action**: "The answer and solution will appear in the last 5 seconds of this video. Till then, if you're looking for a complete guide for [EXAM], follow and comment '[EXAM_ACRONYM]' and it will be in your DMs!"

4. **Solutions**: 5-second display of answers and solutions

## Mathematical Symbol Conversion

The system automatically converts LaTeX symbols to natural speech:
- `$x^2$` → "x squared"
- `$\int$` → "integral"
- `$\frac{a}{b}$` → "a over b"
- `$\sqrt{x}$` → "square root of x"
- And many more...

## Template System

5 rotating templates:
1. Dynamic Math Explainer - Clean & Modern
2. Animated Chalkboard Style - Engaging & Educational  
3. Minimalist Whiteboard - Focus on Content
4. Sci-Fi Data Overlay - Futuristic Learning
5. Vibrant Gradient Flow - Energetic & Youthful

## Next Steps

To move to full production:
1. Set up a dedicated server environment
2. Install Python dependencies (`moviepy`, `aeneas`, `ffmpeg-python`)
3. Integrate Murf TTS API for actual voice generation
4. Implement video rendering pipeline
5. Set up automated processing queue
6. Deploy with Docker and scheduling system
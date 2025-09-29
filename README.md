# AI Automatic Video Maker (Conceptual)

This project demonstrates the core logic for an AI-powered video maker, focusing on script generation and data preparation for video production. Due to the limitations of the WebContainer environment, actual video rendering, complex audio processing (like `aeneas`), and heavy video editing (`MoviePy`, `FFmpeg`) are **conceptualized** rather than fully implemented.

## Features

*   **Supabase Integration:** Connects to your Supabase database to fetch exam, course, subject, unit, topic, and question data.
*   **Gemini API Script Generation:** Dynamically generates engaging video scripts based on selected questions, handling mathematical symbols.
*   **Conceptual Voice-Over & Captions:** Prepares text for Text-to-Speech and generates conceptual caption data with simulated timings and highlight effects.
*   **Simple Frontend:** A one-page React application to manually trigger the script generation process and view the conceptual output.
*   **Rotating Templates:** Simulates template selection for video styling.

## WebContainer Limitations

Please note the following limitations within the WebContainer environment:

*   **No Actual Video Generation:** The system will not produce `.mp4` video files. Tools like `MoviePy` and `FFmpeg` require native binaries and extensive computational resources not available here.
*   **No `pip` for Python Libraries:** External Python libraries like `supabase-py`, `google-generativeai`, `aeneas`, `MoviePy`, `ffmpeg-python`, or `Whisper` cannot be installed. Supabase and Gemini interactions are handled via `urllib.request` for direct REST API calls.
*   **No Docker/Cron Jobs:** Automation components like Docker and Cron jobs are not supported. The Python backend runs as a simple HTTP server.

## Setup Instructions

### 1. Supabase Database Setup

You **MUST** set up your Supabase project with the following tables and populate them with some data.

```sql
-- Table: exams
CREATE TABLE public.exams (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE
);

-- Table: courses
CREATE TABLE public.courses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE,
    name text NOT NULL,
    UNIQUE (exam_id, name)
);

-- Table: subjects
CREATE TABLE public.subjects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
    name text NOT NULL,
    UNIQUE (course_id, name)
);

-- Table: units
CREATE TABLE public.units (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
    name text NOT NULL,
    UNIQUE (subject_id, name)
);

-- Table: topics (formerly 'chapters')
CREATE TABLE public.topics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id uuid REFERENCES public.units(id) ON DELETE CASCADE,
    name text NOT NULL, -- This is your 'chapter' name
    UNIQUE (unit_id, name)
);

-- Table: new_questions (replaces 'questions')
CREATE TABLE public.new_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id uuid REFERENCES public.topics(id) ON DELETE CASCADE,
    question_statement text NOT NULL,
    options jsonb, -- For MCQ/MSQ, e.g., {"A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D"}
    answer text,    -- e.g., "B" or "A,C"
    solution text NOT NULL
);

-- RLS Policies (Example - adjust as needed for your security model)
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users on exams" ON public.exams FOR SELECT USING (true);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users on courses" ON public.courses FOR SELECT USING (true);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users on subjects" ON public.subjects FOR SELECT USING (true);

ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users on units" ON public.units FOR SELECT USING (true);

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users on topics" ON public.topics FOR SELECT USING (true);

ALTER TABLE public.new_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users on new_questions" ON public.new_questions FOR SELECT USING (true);

-- Sample Data (Optional, for testing)
INSERT INTO public.exams (name) VALUES ('CMI MSDS 2026');

INSERT INTO public.courses (exam_id, name) VALUES (
    (SELECT id FROM public.exams WHERE name = 'CMI MSDS 2026'),
    'Mathematics'
);

INSERT INTO public.subjects (course_id, name) VALUES (
    (SELECT id FROM public.courses WHERE name = 'Mathematics' AND exam_id = (SELECT id FROM public.exams WHERE name = 'CMI MSDS 2026')),
    'Calculus'
);

INSERT INTO public.units (subject_id, name) VALUES (
    (SELECT id FROM public.subjects WHERE name = 'Calculus' AND course_id = (SELECT id FROM public.courses WHERE name = 'Mathematics' AND exam_id = (SELECT id FROM public.exams WHERE name = 'CMI MSDS 2026'))),
    'Differentiation'
);

INSERT INTO public.topics (unit_id, name) VALUES (
    (SELECT id FROM public.units WHERE name = 'Differentiation' AND subject_id = (SELECT id FROM public.subjects WHERE name = 'Calculus' AND course_id = (SELECT id FROM public.courses WHERE name = 'Mathematics' AND exam_id = (SELECT id FROM public.exams WHERE name = 'CMI MSDS 2026')))),
    'Basic Derivatives'
);

INSERT INTO public.new_questions (topic_id, question_statement, options, answer, solution) VALUES (
    (SELECT id FROM public.topics WHERE name = 'Basic Derivatives' AND unit_id = (SELECT id FROM public.units WHERE name = 'Differentiation' AND subject_id = (SELECT id FROM public.subjects WHERE name = 'Calculus' AND course_id = (SELECT id FROM public.courses WHERE name = 'Mathematics' AND exam_id = (SELECT id FROM public.exams WHERE name = 'CMI MSDS 2026'))))),
    'Let $f(x) = x^2$. What is the derivative of $f(x)$ with respect to $x$?',
    '{"A": "x", "B": "2x", "C": "x^2", "D": "2"}',
    'B',
    'The derivative of $x^n$ is $nx^{n-1}$. So, for $f(x) = x^2$, the derivative is $2x^{2-1} = 2x$.'
);

INSERT INTO public.topics (unit_id, name) VALUES (
    (SELECT id FROM public.units WHERE name = 'Differentiation' AND subject_id = (SELECT id FROM public.subjects WHERE name = 'Calculus' AND course_id = (SELECT id FROM public.courses WHERE name = 'Mathematics' AND exam_id = (SELECT id FROM public.exams WHERE name = 'CMI MSDS 2026')))),
    'Chain Rule'
);

INSERT INTO public.new_questions (topic_id, question_statement, options, answer, solution) VALUES (
    (SELECT id FROM public.topics WHERE name = 'Chain Rule' AND unit_id = (SELECT id FROM public.units WHERE name = 'Differentiation' AND subject_id = (SELECT id FROM public.subjects WHERE name = 'Calculus' AND course_id = (SELECT id FROM public.courses WHERE name = 'Mathematics' AND exam_id = (SELECT id FROM public.exams WHERE name = 'CMI MSDS 2026'))))),
    'If $g(x) = (3x+1)^2$, what is $g''(x)$?',
    '{"A": "6(3x+1)", "B": "18", "C": "9(3x+1)", "D": "36"}',
    'B',
    'First derivative $g''(x) = 2(3x+1) \cdot 3 = 6(3x+1)$. Second derivative $g''(x) = 6 \cdot 3 = 18$.'
);

INSERT INTO public.units (subject_id, name) VALUES (
    (SELECT id FROM public.subjects WHERE name = 'Calculus' AND course_id = (SELECT id FROM public.courses WHERE name = 'Mathematics' AND exam_id = (SELECT id FROM public.exams WHERE name = 'CMI MSDS 2026'))),
    'Integration'
);

INSERT INTO public.topics (unit_id, name) VALUES (
    (SELECT id FROM public.units WHERE name = 'Integration' AND subject_id = (SELECT id FROM public.subjects WHERE name = 'Calculus' AND course_id = (SELECT id FROM public.courses WHERE name = 'Mathematics' AND exam_id = (SELECT id FROM public.exams WHERE name = 'CMI MSDS 2026')))),
    'Definite Integrals'
);

INSERT INTO public.new_questions (topic_id, question_statement, options, answer, solution) VALUES (
    (SELECT id FROM public.topics WHERE name = 'Definite Integrals' AND unit_id = (SELECT id FROM public.units WHERE name = 'Integration' AND subject_id = (SELECT id FROM public.subjects WHERE name = 'Calculus' AND course_id = (SELECT id FROM public.courses WHERE name = 'Mathematics' AND exam_id = (SELECT id FROM public.exams WHERE name = 'CMI MSDS 2026'))))),
    'Evaluate the integral $\int_0^1 x^3 dx$.',
    '{"A": "1/2", "B": "1/3", "C": "1/4", "D": "1"}',
    'C',
    'The integral of $x^n$ is $\frac{x^{n+1}}{n+1}$. So, $\int x^3 dx = \frac{x^4}{4}$. Evaluating from 0 to 1 gives $\frac{1^4}{4} - \frac{0^4}{4} = \frac{1}{4}$.'
);
```

<br/>

### 2. Environment Variables

You need to set the following environment variables. The `GEMINI_API_KEY` has been pre-filled with the key you provided.

*   `SUPABASE_URL`: Your Supabase project URL (e.g., `https://your-project-id.supabase.co`).
*   `SUPABASE_ANON_KEY`: Your Supabase project's `anon` public key (found in Project Settings -> API).
*   `GEMINI_API_KEY`: `AIzaSyDgShKEEeX9viEQ90JHAUBfwQql0c9rBw`
*   `TTS_API_KEY`: (Optional, but required for actual voice-over) Your API key for a Text-to-Speech service (e.g., Google Cloud TTS).

You will be prompted to set these using the `loadenv` command.

## Running the Application

After setting up your Supabase database and environment variables, run the following command:

```bash
npm install && npm run start
```

This will start both the Python backend server (on port 8000) and the Vite development server (on port 5173). The frontend will proxy API requests to the Python backend.

## Next Steps for a Full Implementation

To move from this conceptual demonstration to a full-fledged video maker, you would need:

1.  **Dedicated Server Environment:** A cloud VM or local machine capable of running Python with `pip` and native binaries.
2.  **Install Python Libraries:**
    *   `supabase-py` for robust Supabase interaction.
    *   `google-generativeai` for official Gemini API client.
    *   `moviepy` for video editing.
    *   `ffmpeg-python` for FFmpeg integration.
    *   `aeneas` for precise audio-text alignment and caption timing.
    *   `whisper` (or a cloud speech-to-text service) for backup alignment.
3.  **Text-to-Speech (TTS) Integration:** Use a service like Google Cloud Text-to-Speech (with your `TTS_API_KEY`) to convert the `voice_over_text` into actual audio files.
4.  **FFmpeg Installation:** Ensure FFmpeg is installed and accessible on your system.
5.  **Video Template System:** Develop a more sophisticated system for defining and applying video templates within `MoviePy`.
6.  **Automation:** Implement a Python worker with a task queue (e.g., Celery) and a scheduler (e.g., Cron job) to process video generation requests asynchronously.
7.  **Dockerization:** Containerize the entire application for easier deployment and scaling.

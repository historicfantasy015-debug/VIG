import http.server
import socketserver
import json
import os
import urllib.parse
from backend.supabase_service import SupabaseService
from backend.gemini_service import GeminiService
from backend.video_logic import generate_conceptual_video_data

PORT = 8000

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path
        query_params = urllib.parse.parse_qs(parsed_path.query)

        if path == '/exams':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            exams = SupabaseService.get_exams()
            self.wfile.write(json.dumps(exams).encode('utf-8'))
        elif path == '/courses':
            exam_id = query_params.get('exam_id', [None])[0]
            if exam_id:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                courses = SupabaseService.get_courses(exam_id)
                self.wfile.write(json.dumps(courses).encode('utf-8'))
            else:
                self.send_error(400, "Missing exam_id parameter")
        else:
            self.send_error(404, "Not Found")

    def do_POST(self):
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path

        if path == '/generate-video':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))

            exam_id = request_data.get('exam_id')
            course_id = request_data.get('course_id')

            if not exam_id or not course_id:
                self.send_error(400, "Missing exam_id or course_id")
                return

            try:
                # Fetch exam name for dynamic script generation
                exam = SupabaseService.get_exam_by_id(exam_id)
                exam_name = exam[0]['name'] if exam else "Selected Exam"

                questions = SupabaseService.get_questions(course_id)
                if not questions:
                    self.send_error(404, "No questions found for this course.")
                    return

                # Generate script using Gemini
                gemini_prompt = GeminiService.create_script_prompt(questions, exam_name)
                generated_script = GeminiService.generate_script(gemini_prompt)

                # Generate conceptual video data (voice-over, captions, template)
                tts_api_key = os.environ.get('TTS_API_KEY') # Murf voice ID
                video_data = generate_conceptual_video_data(generated_script, questions, exam_name, tts_api_key)

                response_payload = {
                    "script": generated_script,
                    "voice_over_text": video_data["voice_over_text"],
                    "captions": video_data["captions"],
                    "template_suggestion": video_data["template_suggestion"],
                    "total_conceptual_duration": video_data["total_conceptual_duration"],
                    "murf_tts_api_key": video_data["murf_tts_api_key"], # Include for external use
                    "exam_name": video_data["exam_name"] # Include for external use
                }

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response_payload).encode('utf-8'))

            except Exception as e:
                print(f"Error generating video: {e}")
                self.send_error(500, f"Internal Server Error: {str(e)}")
        else:
            self.send_error(404, "Not Found")

if __name__ == '__main__':
    print(f"Starting Python backend on port {PORT}")
    with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
        print("Serving at port", PORT)
        httpd.serve_forever()

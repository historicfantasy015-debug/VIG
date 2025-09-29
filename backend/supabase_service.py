import os
import json
import urllib.request
import urllib.parse

class SupabaseService:
    # Read from os.environ, which is populated by start.js
    SUPABASE_URL = os.environ.get('SUPABASE_URL')
    SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')

    @staticmethod
    def _make_request(method, table, params=None, data=None):
        if not SupabaseService.SUPABASE_URL or not SupabaseService.SUPABASE_ANON_KEY:
            raise ValueError("Supabase URL and/or Anon Key not set in environment variables.")

        url = f"{SupabaseService.SUPABASE_URL}/rest/v1/{table}"
        headers = {
            'apikey': SupabaseService.SUPABASE_ANON_KEY,
            'Authorization': f'Bearer {SupabaseService.SUPABASE_ANON_KEY}',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }

        if params:
            url += '?' + urllib.parse.urlencode(params)

        req = urllib.request.Request(url, headers=headers, method=method)
        if data:
            req.add_header('Content-Type', 'application/json')
            data = json.dumps(data).encode('utf-8')

        try:
            with urllib.request.urlopen(req, data=data) as response:
                response_data = response.read().decode('utf-8')
                return json.loads(response_data)
        except urllib.error.HTTPError as e:
            print(f"Supabase HTTP Error: {e.code} - {e.read().decode('utf-8')}")
            raise
        except Exception as e:
            print(f"Supabase Request Error: {e}")
            raise

    @staticmethod
    def get_exams():
        return SupabaseService._make_request('GET', 'exams', params={'select': 'id,name'})

    @staticmethod
    def get_exam_by_id(exam_id):
        return SupabaseService._make_request('GET', 'exams', params={'select': 'name', 'id': f'eq.{exam_id}'})

    @staticmethod
    def get_courses(exam_id):
        return SupabaseService._make_request('GET', 'courses', params={'select': 'id,name', 'exam_id': f'eq.{exam_id}'})

    @staticmethod
    def get_questions(course_id):
        # 1. Get subjects for the given course_id
        subjects = SupabaseService._make_request('GET', 'subjects', params={'select': 'id', 'course_id': f'eq.{course_id}'})
        if not subjects:
            return []
        subject_ids = [s['id'] for s in subjects]
        
        # 2. Get units for the retrieved subject_ids
        units = SupabaseService._make_request('GET', 'units', params={'select': 'id', 'subject_id': f'in.({",".join(map(str, subject_ids))})'})
        if not units:
            return []
        unit_ids = [u['id'] for u in units]

        # 3. Get topics for the retrieved unit_ids
        topics = SupabaseService._make_request('GET', 'topics', params={'select': 'id', 'unit_id': f'in.({",".join(map(str, unit_ids))})'})
        if not topics:
            return []
        topic_ids = [t['id'] for t in topics]

        # 4. Get new_questions for the retrieved topic_ids
        questions = SupabaseService._make_request('GET', 'new_questions', params={'select': '*', 'topic_id': f'in.({",".join(map(str, topic_ids))})'})
        return questions

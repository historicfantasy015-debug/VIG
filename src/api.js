const API_BASE_URL = '/api'; // Proxy to http://localhost:8000

export const fetchExams = async () => {
  const response = await fetch(`${API_BASE_URL}/exams`);
  if (!response.ok) {
    throw new Error(`Failed to fetch exams: ${response.statusText}`);
  }
  return response.json();
};

export const fetchCourses = async (examId) => {
  const response = await fetch(`${API_BASE_URL}/courses?exam_id=${examId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch courses: ${response.statusText}`);
  }
  return response.json();
};

export const generateVideoScript = async (examId, courseId) => {
  const response = await fetch(`${API_BASE_URL}/generate-video`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ exam_id: examId, course_id: courseId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to generate video script: ${response.statusText}`);
  }
  return response.json();
};

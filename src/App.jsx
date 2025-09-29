import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8000'; // Python backend URL

function App() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [generatedVideoData, setGeneratedVideoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch exams on component mount
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/exams`);
        if (!response.ok) throw new Error('Failed to fetch exams');
        const data = await response.json();
        setExams(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  // Fetch courses when selectedExamId changes
  useEffect(() => {
    const fetchCourses = async () => {
      if (!selectedExamId) {
        setCourses([]);
        setSelectedCourseId('');
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/courses?exam_id=${selectedExamId}`);
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [selectedExamId]);

  const handleGenerateVideo = async () => {
    if (!selectedExamId || !selectedCourseId) {
      setError('Please select both an exam and a course.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setGeneratedVideoData(null);

      const response = await fetch(`${API_BASE_URL}/generate-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ exam_id: selectedExamId, course_id: selectedCourseId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate video script');
      }

      const data = await response.json();
      setGeneratedVideoData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const PALETTE = {
    primary: "#9E7FFF",
    secondary: "#38bdf8",
    accent: "#f472b6",
    background: "#171717",
    surface: "#262626",
    text: "#FFFFFF",
    textSecondary: "#A3A3A3",
    border: "#2F2F2F",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444"
  };

  const FONT_FAMILY = "sans-serif";
  const BORDER_RADIUS = "16px";

  return (
    <div style={{
      fontFamily: FONT_FAMILY,
      backgroundColor: PALETTE.background,
      color: PALETTE.text,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem',
      boxSizing: 'border-box',
    }}>
      <h1 style={{
        fontSize: '3rem',
        fontWeight: 'bold',
        color: PALETTE.primary,
        marginBottom: '2rem',
        textAlign: 'center',
        textShadow: `0 0 15px ${PALETTE.primary}50`,
      }}>
        AI Video Script Generator
      </h1>

      <div style={{
        backgroundColor: PALETTE.surface,
        padding: '2.5rem',
        borderRadius: BORDER_RADIUS,
        boxShadow: `0 10px 30px rgba(0,0,0,0.3)`,
        width: '100%',
        maxWidth: '800px',
        border: `1px solid ${PALETTE.border}`,
        marginBottom: '2rem',
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="exam-select" style={{ display: 'block', marginBottom: '0.75rem', fontSize: '1.1rem', color: PALETTE.textSecondary }}>
            Select Exam:
          </label>
          <select
            id="exam-select"
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem 1rem',
              borderRadius: '8px',
              border: `1px solid ${PALETTE.border}`,
              backgroundColor: PALETTE.background,
              color: PALETTE.text,
              fontSize: '1rem',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23A3A3A3'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1.5em 1.5em',
              cursor: 'pointer',
            }}
            disabled={loading}
          >
            <option value="">-- Choose an Exam --</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label htmlFor="course-select" style={{ display: 'block', marginBottom: '0.75rem', fontSize: '1.1rem', color: PALETTE.textSecondary }}>
            Select Course:
          </label>
          <select
            id="course-select"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem 1rem',
              borderRadius: '8px',
              border: `1px solid ${PALETTE.border}`,
              backgroundColor: PALETTE.background,
              color: PALETTE.text,
              fontSize: '1rem',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23A3A3A3'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1.5em 1.5em',
              cursor: 'pointer',
            }}
            disabled={loading || !selectedExamId}
          >
            <option value="">-- Choose a Course --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerateVideo}
          disabled={loading || !selectedExamId || !selectedCourseId}
          style={{
            width: '100%',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            backgroundColor: PALETTE.primary,
            color: PALETTE.background,
            fontSize: '1.2rem',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, transform 0.2s ease',
            boxShadow: `0 5px 15px ${PALETTE.primary}40`,
            opacity: (loading || !selectedExamId || !selectedCourseId) ? 0.7 : 1,
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PALETTE.secondary}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PALETTE.primary}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {loading ? 'Generating...' : 'Generate Video Script'}
        </button>

        {error && (
          <p style={{ color: PALETTE.error, marginTop: '1.5rem', textAlign: 'center', fontSize: '1rem' }}>
            Error: {error}
          </p>
        )}
      </div>

      {generatedVideoData && (
        <div style={{
          backgroundColor: PALETTE.surface,
          padding: '2.5rem',
          borderRadius: BORDER_RADIUS,
          boxShadow: `0 10px 30px rgba(0,0,0,0.3)`,
          width: '100%',
          maxWidth: '800px',
          border: `1px solid ${PALETTE.border}`,
          marginTop: '2rem',
        }}>
          <h2 style={{
            fontSize: '2rem',
            color: PALETTE.secondary,
            marginBottom: '1.5rem',
            textAlign: 'center',
            textShadow: `0 0 10px ${PALETTE.secondary}40`,
          }}>
            Generated Video Concept
          </h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.4rem', color: PALETTE.text, marginBottom: '0.75rem' }}>
              Script:
            </h3>
            <pre style={{
              backgroundColor: PALETTE.background,
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${PALETTE.border}`,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              color: PALETTE.textSecondary,
            }}>
              {generatedVideoData.script}
            </pre>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.4rem', color: PALETTE.text, marginBottom: '0.75rem' }}>
              Voice-Over Text (Conceptual):
            </h3>
            <p style={{
              backgroundColor: PALETTE.background,
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${PALETTE.border}`,
              fontSize: '0.95rem',
              lineHeight: '1.6',
              color: PALETTE.textSecondary,
            }}>
              {generatedVideoData.voice_over_text}
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.4rem', color: PALETTE.text, marginBottom: '0.75rem' }}>
              Captions (Conceptual Timings & Highlights):
            </h3>
            <div style={{
              backgroundColor: PALETTE.background,
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${PALETTE.border}`,
              maxHeight: '300px',
              overflowY: 'auto',
              fontSize: '0.9rem',
              lineHeight: '1.5',
              color: PALETTE.textSecondary,
            }}>
              {generatedVideoData.captions.map((caption, index) => (
                <p key={index} style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: PALETTE.accent, fontWeight: 'bold' }}>
                    [{caption.start_time.toFixed(2)}s - {caption.end_time.toFixed(2)}s]
                  </span>{' '}
                  <span style={{
                    backgroundColor: caption.highlight_effect === "ASS_STYLE_BOLD_YELLOW" ? `${PALETTE.warning}30` :
                                     caption.highlight_effect === "ASS_STYLE_COUNTDOWN" ? `${PALETTE.primary}30` :
                                     caption.highlight_effect === "ASS_STYLE_SOLUTION_DISPLAY" ? `${PALETTE.success}30` : 'transparent',
                    padding: '0.2em 0.4em',
                    borderRadius: '4px',
                  }}>
                    {caption.text}
                  </span>
                </p>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.4rem', color: PALETTE.text, marginBottom: '0.75rem' }}>
              Template Suggestion:
            </h3>
            <p style={{
              backgroundColor: PALETTE.background,
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${PALETTE.border}`,
              fontSize: '1rem',
              fontWeight: 'bold',
              color: PALETTE.secondary,
            }}>
              {generatedVideoData.template_suggestion}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

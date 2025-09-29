import React, { useState, useEffect } from 'react';
import { DatabaseService } from './services/databaseService.js';
import { GeminiService } from './services/geminiService.js';
import { VideoService } from './services/videoService.js';

function App() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [currentStep, setCurrentStep] = useState('selection');

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      loadCourses(selectedExamId);
    } else {
      setCourses([]);
      setSelectedCourseId('');
    }
  }, [selectedExamId]);

  const loadExams = async () => {
    try {
      setLoading(true);
      const examsData = await DatabaseService.getExams();
      setExams(examsData);
    } catch (err) {
      setError('Failed to load exams: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async (examId) => {
    try {
      setLoading(true);
      const coursesData = await DatabaseService.getCourses(examId);
      setCourses(coursesData);
    } catch (err) {
      setError('Failed to load courses: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateVideo = async () => {
    if (!selectedExamId || !selectedCourseId) {
      setError('Please select both exam and course');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setCurrentStep('generating');

      // Get exam details
      const exam = await DatabaseService.getExamById(selectedExamId);
      
      // Get questions for the course
      const questions = await DatabaseService.getQuestionsForCourse(selectedCourseId);
      
      if (!questions || questions.length === 0) {
        throw new Error('No questions found for this course');
      }

      // Generate script using Gemini
      const prompt = GeminiService.createScriptPrompt(questions, exam.name);
      const script = await GeminiService.generateScript(prompt);

      // Get random template
      const template = VideoService.getRandomTemplate();

      // Generate complete video data
      const completeVideoData = VideoService.generateVideoData(script, questions, exam.name, template);

      setVideoData(completeVideoData);
      setCurrentStep('preview');

    } catch (err) {
      setError('Failed to generate video: ' + err.message);
      setCurrentStep('selection');
    } finally {
      setLoading(false);
    }
  };

  const resetProcess = () => {
    setVideoData(null);
    setCurrentStep('selection');
    setError(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            AI Automatic Video Maker
          </h1>
          <p className="text-xl text-gray-300">
            Generate educational videos with AI-powered scripts, voice-over, and captions
          </p>
        </header>

        {currentStep === 'selection' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <h2 className="text-2xl font-semibold mb-6 text-center">Select Exam & Course</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Exam</label>
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={loading}
                  >
                    <option value="">Choose an exam...</option>
                    {exams.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Select Course</label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={loading || !selectedExamId}
                  >
                    <option value="">Choose a course...</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={generateVideo}
                  disabled={loading || !selectedExamId || !selectedCourseId}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 rounded-lg font-semibold text-lg transition-all duration-200 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating Video...' : 'Generate AI Video'}
                </button>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
                  <p className="text-red-200">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 'generating' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700">
              <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"></div>
              <h2 className="text-2xl font-semibold mb-4">Generating Your Video</h2>
              <p className="text-gray-300">
                AI is creating your script, analyzing questions, and preparing video components...
              </p>
            </div>
          </div>
        )}

        {currentStep === 'preview' && videoData && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-semibold">Video Preview</h2>
                <button
                  onClick={resetProcess}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Generate New Video
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Video Info */}
                <div className="space-y-6">
                  <div className="bg-gray-700/50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Video Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Exam:</span>
                        <span className="font-medium">{videoData.examName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Questions:</span>
                        <span className="font-medium">{videoData.questions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Duration:</span>
                        <span className="font-medium">{formatTime(videoData.totalDuration)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Template:</span>
                        <span className="font-medium">{videoData.template.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700/50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Template Preview</h3>
                    <div 
                      className="h-32 rounded-lg flex items-center justify-center text-center p-4"
                      style={{ 
                        background: videoData.template.backgroundColor,
                        color: videoData.template.textColor 
                      }}
                    >
                      <div>
                        <div className="font-bold text-lg">{videoData.template.name}</div>
                        <div className="text-sm opacity-80">{videoData.template.description}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Script */}
                <div className="bg-gray-700/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Generated Script</h3>
                  <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono">
                      {videoData.script}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Captions Timeline */}
              <div className="mt-8 bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Caption Timeline</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {videoData.captions.map((caption) => (
                    <div key={caption.id} className="flex items-start gap-4 p-3 bg-gray-800 rounded-lg">
                      <div className="text-xs text-purple-400 font-mono min-w-20">
                        {formatTime(caption.startTime)} - {formatTime(caption.endTime)}
                      </div>
                      <div className="flex-1 text-sm">
                        <span className={`inline-block px-2 py-1 rounded text-xs mr-2 ${
                          caption.highlightEffect === 'question-highlight' ? 'bg-blue-600' :
                          caption.highlightEffect === 'option-highlight' ? 'bg-green-600' :
                          caption.highlightEffect === 'cta-highlight' ? 'bg-purple-600' :
                          caption.highlightEffect === 'solution-display' ? 'bg-red-600' :
                          'bg-gray-600'
                        }`}>
                          {caption.highlightEffect.replace('-', ' ')}
                        </span>
                        {caption.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Voice Over Info */}
              <div className="mt-8 bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Voice Over Details</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-300">Voice ID:</span>
                    <span className="ml-2 font-mono">{videoData.voiceOver.voiceId}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">Estimated Duration:</span>
                    <span className="ml-2">{formatTime(videoData.voiceOver.duration)}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">Status:</span>
                    <span className="ml-2 capitalize">{videoData.voiceOver.status}</span>
                  </div>
                </div>
              </div>

              {/* Implementation Notes */}
              <div className="mt-8 bg-blue-900/20 border border-blue-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-blue-300">Implementation Notes</h3>
                <div className="text-sm text-blue-200 space-y-2">
                  <p>• <strong>Voice Over:</strong> Use Murf TTS API with voice ID {videoData.voiceOver.voiceId}</p>
                  <p>• <strong>Captions:</strong> Use aeneas for precise timing and FFmpeg ASS for highlight effects</p>
                  <p>• <strong>Video Editing:</strong> Implement with MoviePy + FFmpeg for rendering</p>
                  <p>• <strong>Automation:</strong> Set up Python worker with Cron job in Docker container</p>
                  <p>• <strong>Template System:</strong> Rotating templates with {videoData.template.name} style</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
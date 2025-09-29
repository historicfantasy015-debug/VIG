import { supabase } from '../lib/supabase.js';

export class DatabaseService {
  static async getExams() {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching exams:', error);
      throw error;
    }
  }

  static async getCourses(examId) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name')
        .eq('exam_id', examId)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  static async getQuestionsForCourse(courseId) {
    try {
      // Get subjects for the course
      const { data: subjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('id')
        .eq('course_id', courseId);

      if (subjectsError) throw subjectsError;
      if (!subjects || subjects.length === 0) return [];

      const subjectIds = subjects.map(s => s.id);

      // Get units for the subjects
      const { data: units, error: unitsError } = await supabase
        .from('units')
        .select('id')
        .in('subject_id', subjectIds);

      if (unitsError) throw unitsError;
      if (!units || units.length === 0) return [];

      const unitIds = units.map(u => u.id);

      // Get topics (chapters) for the units
      const { data: topics, error: topicsError } = await supabase
        .from('topics')
        .select('id')
        .in('unit_id', unitIds);

      if (topicsError) throw topicsError;
      if (!topics || topics.length === 0) return [];

      const topicIds = topics.map(t => t.id);

      // Get questions from new_questions table
      const { data: questions, error: questionsError } = await supabase
        .from('new_questions')
        .select(`
          id,
          question_statement,
          options,
          answer,
          solution,
          question_type,
          topic_id
        `)
        .in('topic_id', topicIds)
        .limit(5); // Limit to 5 questions for video

      if (questionsError) throw questionsError;
      return questions || [];
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }

  static async getExamById(examId) {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('id, name')
        .eq('id', examId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching exam:', error);
      throw error;
    }
  }
}
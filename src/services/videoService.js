export class VideoService {
  static generateCaptionTimings(script) {
    // Split script into sentences for caption timing
    const sentences = script.match(/[^\.!?]+[\.!?]+/g) || [script];
    const captions = [];
    let currentTime = 0;

    sentences.forEach((sentence, index) => {
      const cleanSentence = sentence.trim();
      const wordCount = cleanSentence.split(' ').length;
      // Estimate 0.4 seconds per word for natural speech
      const duration = Math.max(2, wordCount * 0.4);

      captions.push({
        id: index,
        text: cleanSentence,
        startTime: currentTime,
        endTime: currentTime + duration,
        highlightEffect: this.getHighlightEffect(cleanSentence)
      });

      currentTime += duration;
    });

    return captions;
  }

  static getHighlightEffect(text) {
    if (text.toLowerCase().includes('question')) {
      return 'question-highlight';
    } else if (text.toLowerCase().includes('option')) {
      return 'option-highlight';
    } else if (text.toLowerCase().includes('follow') || text.toLowerCase().includes('comment')) {
      return 'cta-highlight';
    }
    return 'default-highlight';
  }

  static generateVideoTemplates() {
    return [
      {
        id: 1,
        name: 'Dynamic Math Explainer',
        description: 'Clean & Modern with animated equations',
        backgroundColor: '#1a1a2e',
        accentColor: '#16213e',
        textColor: '#ffffff'
      },
      {
        id: 2,
        name: 'Animated Chalkboard Style',
        description: 'Engaging & Educational classroom feel',
        backgroundColor: '#2d5016',
        accentColor: '#3d6b1a',
        textColor: '#ffffff'
      },
      {
        id: 3,
        name: 'Minimalist Whiteboard',
        description: 'Focus on Content with clean design',
        backgroundColor: '#f8f9fa',
        accentColor: '#e9ecef',
        textColor: '#212529'
      },
      {
        id: 4,
        name: 'Sci-Fi Data Overlay',
        description: 'Futuristic Learning experience',
        backgroundColor: '#0a0a0a',
        accentColor: '#00ff88',
        textColor: '#00ff88'
      },
      {
        id: 5,
        name: 'Vibrant Gradient Flow',
        description: 'Energetic & Youthful design',
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        accentColor: '#764ba2',
        textColor: '#ffffff'
      }
    ];
  }

  static getRandomTemplate() {
    const templates = this.generateVideoTemplates();
    return templates[Math.floor(Math.random() * templates.length)];
  }

  static async generateVoiceOver(text, voiceId = 'ap2_01771851-fe5d-4e13-a843-a49b28e72ef9') {
    // This would integrate with Murf TTS API
    // For now, return conceptual data
    return {
      audioUrl: null, // Would be actual audio file URL from Murf
      duration: this.estimateAudioDuration(text),
      voiceId: voiceId,
      text: text,
      status: 'conceptual' // In real implementation, this would be 'generated'
    };
  }

  static estimateAudioDuration(text) {
    // Estimate based on average speaking rate (150 words per minute)
    const wordCount = text.split(' ').length;
    return Math.ceil((wordCount / 150) * 60); // Duration in seconds
  }

  static generateVideoData(script, questions, examName, template) {
    const captions = this.generateCaptionTimings(script);
    const voiceOver = this.generateVoiceOver(script);
    
    // Add solution display at the end
    const solutionText = questions.map((q, i) => 
      `Q${i + 1}: ${q.answer} - ${q.solution}`
    ).join('\n');

    const lastCaptionEnd = captions[captions.length - 1]?.endTime || 0;
    
    captions.push({
      id: captions.length,
      text: solutionText,
      startTime: lastCaptionEnd,
      endTime: lastCaptionEnd + 5,
      highlightEffect: 'solution-display'
    });

    return {
      script,
      captions,
      voiceOver,
      template,
      totalDuration: lastCaptionEnd + 5,
      questions,
      examName,
      metadata: {
        questionCount: questions.length,
        generatedAt: new Date().toISOString(),
        templateId: template.id
      }
    };
  }
}
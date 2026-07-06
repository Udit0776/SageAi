/**
 * Group past assessments by detected topics, calculate attempt counts,
 * error rates, recent trends, and priority.
 * 
 * @param {Array} assessments Array of past Assessment records
 * @returns {Array} Sorted weakness profile
 */
export function computeWeaknessProfile(assessments = []) {
  if (!assessments || assessments.length === 0) {
    return [];
  }

  const topicsList = [
    "javascript", "react", "system design", "algorithms", "databases", 
    "css", "typescript", "nodejs", "python", "devops", "testing"
  ];

  const detectTopic = (questionText, category) => {
    const text = ((questionText || "") + " " + (category || "")).toLowerCase();
    for (const topic of topicsList) {
      if (text.includes(topic)) {
        return topic;
      }
    }
    return "other";
  };

  // Group all questions by topic overall
  const overallStats = {}; // { topic: { attempts: 0, wrong: 0 } }
  
  // Group questions by topic in the last 2 assessments
  const sortedAssessments = [...assessments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const recentAssessments = sortedAssessments.slice(0, 2);
  const recentStats = {}; // { topic: { attempts: 0, wrong: 0 } }

  // Populate overallStats
  sortedAssessments.forEach(assessment => {
    const questions = assessment.questions || [];
    questions.forEach(q => {
      const topic = detectTopic(q.question, q.category);
      if (!overallStats[topic]) {
        overallStats[topic] = { attempts: 0, wrong: 0 };
      }
      overallStats[topic].attempts += 1;
      if (!q.isCorrect) {
        overallStats[topic].wrong += 1;
      }
    });
  });

  // Populate recentStats
  recentAssessments.forEach(assessment => {
    const questions = assessment.questions || [];
    questions.forEach(q => {
      const topic = detectTopic(q.question, q.category);
      if (!recentStats[topic]) {
        recentStats[topic] = { attempts: 0, wrong: 0 };
      }
      recentStats[topic].attempts += 1;
      if (!q.isCorrect) {
        recentStats[topic].wrong += 1;
      }
    });
  });

  const profile = [];
  for (const topic in overallStats) {
    const overall = overallStats[topic];
    const attemptCount = overall.attempts;
    const errorRate = overall.wrong / overall.attempts;

    // Recent trend in last 2 assessments vs overall
    const recent = recentStats[topic];
    const recentAttempts = recent ? recent.attempts : 0;
    const recentErrorRate = recentAttempts > 0 ? (recent.wrong / recent.attempts) : 0;

    let recentTrend = "stable";
    if (recentAttempts > 0) {
      const diff = recentErrorRate - errorRate;
      if (diff < -0.05) {
        recentTrend = "improving";
      } else if (diff > 0.05) {
        recentTrend = "declining";
      } else {
        recentTrend = "stable";
      }
    }

    let priority = "strong";
    if (errorRate > 0.6) {
      priority = "focus";
    } else if (errorRate >= 0.3) {
      priority = "review";
    }

    profile.push({
      topic,
      attemptCount,
      errorRate,
      recentTrend,
      priority
    });
  }

  // Sort by errorRate descending
  return profile.sort((a, b) => b.errorRate - a.errorRate);
}

/**
 * Build adaptive prompt context based on weakness profile, user skills, and industry.
 * 
 * @param {Array} weaknessProfile The calculated weakness profile
 * @param {Array} userSkills User skills array
 * @param {string} industry User industry string
 * @param {Array} last10Questions Array of last 10 question strings to avoid
 * @returns {string} Prompt context for Gemini
 */
export function buildAdaptivePromptContext(weaknessProfile = [], userSkills = [], industry = "", recentQuestions = [], assessmentsCount = 0) {
  const cleanRecentQuestions = recentQuestions.slice(0, 30).map(q => `"${q}"`).join(", ");
  
  if (assessmentsCount < 3) {
    return cleanRecentQuestions ? `Avoid repeating these recently asked questions: [${cleanRecentQuestions}]` : "";
  }

  const focus = weaknessProfile.filter(p => p.priority === "focus");
  const review = weaknessProfile.filter(p => p.priority === "review");
  const strong = weaknessProfile.filter(p => p.priority === "strong");

  const availableSkills = [...(userSkills || []), ...(industry ? [industry] : []), "general", "javascript", "react", "system design"];
  
  const focus1 = focus[0]?.topic || review[0]?.topic || availableSkills[0] || "general";
  const focus2 = focus[1]?.topic || review[1]?.topic || availableSkills[1] || "general";
  const review1 = review[0]?.topic || strong[0]?.topic || availableSkills[2] || "general";
  const strong1 = strong[0]?.topic || availableSkills[3] || "general";

  return `Generate questions with this distribution:
 - 4 questions on ${focus1} at difficulty: hard
 - 3 questions on ${focus2} at difficulty: hard  
 - 2 questions on ${review1} at difficulty: medium
 - 1 question on ${strong1} at difficulty: easy (confidence builder)
 ${cleanRecentQuestions ? `Avoid repeating these recently asked questions: [${cleanRecentQuestions}]` : ""}`;
}

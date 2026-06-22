/**
 * Compute the communication score based on filler word rate and WPM.
 * Total score: 100 (50 points from filler word rate, 50 points from WPM).
 * 
 * @param {number} fillerWordRate Number of filler words per minute
 * @param {number} averageWPM Average words per minute
 * @returns {Object} Score details, sub-scores and professional feedback strings
 */
export function computeCommunicationScore(fillerWordRate = 0, averageWPM = 0) {
  let fillerScore = 0;
  let fillerFeedback = "";

  if (fillerWordRate === 0) {
    fillerScore = 50;
    fillerFeedback = "Excellent! You used zero filler words, showing high confidence and clarity.";
  } else if (fillerWordRate <= 2) {
    fillerScore = 40;
    fillerFeedback = "Very good. Minimal filler words used. Your speech is clean and direct.";
  } else if (fillerWordRate <= 5) {
    fillerScore = 25;
    fillerFeedback = "Moderate use of filler words. Try to pause silently rather than filling the space.";
  } else if (fillerWordRate <= 10) {
    fillerScore = 10;
    fillerFeedback = "High filler word rate. Focus on slow, deliberate speech to reduce filler word occurrences.";
  } else {
    fillerScore = 0;
    fillerFeedback = "Critical filler word usage. Practice structured speaking patterns (like the STAR method) and conscious pausing.";
  }

  let wpmScore = 0;
  let wpmFeedback = "";

  if (averageWPM >= 110 && averageWPM <= 150) {
    wpmScore = 50;
    wpmFeedback = "Ideal speaking pace. Easy to follow, maintaining professional cadence and clarity.";
  } else if ((averageWPM >= 90 && averageWPM < 110) || (averageWPM > 150 && averageWPM <= 170)) {
    wpmScore = 35;
    wpmFeedback = averageWPM < 110 
      ? "Slightly slow speaking pace. Try to speak a bit more dynamically to keep interest."
      : "Slightly fast speaking pace. Remember to breathe and slow down for emphasis.";
  } else if ((averageWPM >= 70 && averageWPM < 90) || (averageWPM > 170 && averageWPM <= 200)) {
    wpmScore = 20;
    wpmFeedback = averageWPM < 90
      ? "Slow pace. Can sound hesitant or unenthusiastic. Aim for a slightly faster cadence."
      : "Fast pace. Difficult for the listener to absorb key points. Make conscious pauses.";
  } else {
    wpmScore = 5;
    wpmFeedback = averageWPM < 70
      ? "Extremely slow speaking pace. Work on articulation speed and reducing pause lengths."
      : "Extremely fast speaking pace. High risk of sounding nervous or cluttered. Practice slowing down.";
  }

  const communicationScore = fillerScore + wpmScore;

  return {
    communicationScore,
    fillerScore,
    wpmScore,
    fillerFeedback,
    wpmFeedback
  };
}

/**
 * Analyze communication trends from a list of past interview sessions.
 * 
 * @param {Array} sessions Array of past InterviewSession records
 * @returns {Object} Trends metadata including rolling averages, slopes, delta and best session
 */
export function analyzeCommunicationTrend(sessions = []) {
  // Filter sessions that have communication data
  const validSessions = sessions
    .filter(s => s.averageWPM !== null && s.fillerWordRate !== null)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Oldest first

  if (validSessions.length === 0) {
    return {
      fillerTrend: "stable",
      wpmTrend: "stable",
      fillerSlope: 0,
      wpmSlope: 0,
      bestSession: null,
      currentVsAverage: { fillerDelta: 0, wpmDelta: 0 },
      averageFillerRate: 0,
      averageWPM: 0
    };
  }

  // Last 5 sessions for rolling average and slope
  const last5Sessions = validSessions.slice(-5);
  const n = last5Sessions.length;

  const totalFillerRate = last5Sessions.reduce((acc, s) => acc + s.fillerWordRate, 0);
  const totalWPM = last5Sessions.reduce((acc, s) => acc + s.averageWPM, 0);
  
  const avgFillerRate = totalFillerRate / n;
  const avgWPM = totalWPM / n;

  // Linear regression slope: m = (N * sum(x*y) - sum(x)*sum(y)) / (N * sum(x^2) - (sum(x))^2)
  let fillerSlope = 0;
  let wpmSlope = 0;

  if (n > 1) {
    let sumX = 0;
    let sumYFiller = 0;
    let sumYWPM = 0;
    let sumXX = 0;
    let sumXYFiller = 0;
    let sumXYWPM = 0;

    last5Sessions.forEach((s, index) => {
      const x = index; // 0-indexed position
      sumX += x;
      sumXX += x * x;
      sumYFiller += s.fillerWordRate;
      sumYWPM += s.averageWPM;
      sumXYFiller += x * s.fillerWordRate;
      sumXYWPM += x * s.averageWPM;
    });

    const denom = n * sumXX - sumX * sumX;
    if (denom !== 0) {
      fillerSlope = (n * sumXYFiller - sumX * sumYFiller) / denom;
      wpmSlope = (n * sumXYWPM - sumX * sumYWPM) / denom;
    }
  }

  // Trend determination
  // For filler words: negative slope is improvement
  let fillerTrend = "stable";
  if (fillerSlope < -0.05) {
    fillerTrend = "improving";
  } else if (fillerSlope > 0.05) {
    fillerTrend = "declining";
  }

  // For WPM: moving towards ideal (130 midpoint)
  let wpmTrend = "stable";
  if (Math.abs(wpmSlope) > 0.5) {
    // If average WPM is low, a positive slope is improvement
    if (avgWPM < 110) {
      wpmTrend = wpmSlope > 0 ? "improving" : "declining";
    }
    // If average WPM is high, a negative slope is improvement
    else if (avgWPM > 150) {
      wpmTrend = wpmSlope < 0 ? "improving" : "declining";
    }
    // If average WPM is ideal, any large slope is moving away from ideal
    else {
      wpmTrend = "declining";
    }
  }

  // Find best session (highest communicationScore or overallScore)
  let bestSession = null;
  let maxScore = -1;
  validSessions.forEach(s => {
    const score = s.communicationScore !== null ? s.communicationScore : (s.overallScore || 0);
    if (score > maxScore) {
      maxScore = score;
      bestSession = {
        id: s.id,
        date: s.createdAt,
        communicationScore: score
      };
    }
  });

  // Current session (latest) vs overall average
  const currentSession = validSessions[validSessions.length - 1];
  const allSessionsFillerSum = validSessions.reduce((acc, s) => acc + s.fillerWordRate, 0);
  const allSessionsWPMSum = validSessions.reduce((acc, s) => acc + s.averageWPM, 0);
  const overallAvgFiller = allSessionsFillerSum / validSessions.length;
  const overallAvgWPM = allSessionsWPMSum / validSessions.length;

  const fillerDelta = currentSession.fillerWordRate - overallAvgFiller;
  const wpmDelta = currentSession.averageWPM - overallAvgWPM;

  return {
    fillerTrend,
    wpmTrend,
    fillerSlope,
    wpmSlope,
    bestSession,
    currentVsAverage: { fillerDelta, wpmDelta },
    averageFillerRate: avgFillerRate,
    averageWPM: avgWPM
  };
}

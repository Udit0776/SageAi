/**
 * Perform least-squares linear regression on an array of data points.
 * 
 * @param {Array} dataPoints Array of { timestamp: Date|string|number, score: number }
 * @returns {Object} Regression statistics including slope, intercept, rSquared, and trend label
 */
export function computeLinearRegression(dataPoints = []) {
  if (!dataPoints || dataPoints.length <= 1) {
    return { slope: 0, intercept: 0, rSquared: 1, trend: "flat" };
  }

  const n = dataPoints.length;
  const firstTime = new Date(dataPoints[0].timestamp).getTime();

  // Convert timestamps to x values: days since the first data point
  const xValues = dataPoints.map(dp => {
    const diffMs = new Date(dp.timestamp).getTime() - firstTime;
    return diffMs / (1000 * 60 * 60 * 24); // in days
  });
  const yValues = dataPoints.map(dp => dp.score);

  // Compute means
  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < n; i++) {
    sumX += xValues[i];
    sumY += yValues[i];
  }
  const meanX = sumX / n;
  const meanY = sumY / n;

  // Compute m (slope) and b (intercept)
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    const xDiff = xValues[i] - meanX;
    const yDiff = yValues[i] - meanY;
    num += xDiff * yDiff;
    den += xDiff * xDiff;
  }

  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;

  // Compute R^2
  let tss = 0; // Total sum of squares
  let rss = 0; // Residual sum of squares
  for (let i = 0; i < n; i++) {
    const yDiff = yValues[i] - meanY;
    tss += yDiff * yDiff;

    const predY = slope * xValues[i] + intercept;
    const res = yValues[i] - predY;
    rss += res * res;
  }

  const rSquared = tss === 0 ? 1 : 1 - (rss / tss);

  // Scale slope to score points per week (7 days)
  const slopePerWeek = slope * 7;
  let trend = "flat";
  if (slopePerWeek > 0.5) {
    trend = "improving";
  } else if (slopePerWeek < -0.5) {
    trend = "declining";
  }

  return { slope, intercept, rSquared, trend };
}

/**
 * Generate a descriptive trend insight from regression statistics.
 * 
 * @param {Object} regressionResult Output from computeLinearRegression
 * @param {number} currentScore The user's current ATS score
 * @param {Array} dataPoints Historical data points
 * @returns {string} Plain-English insight message
 */
export function generateTrendInsight(regressionResult, currentScore = 0, dataPoints = []) {
  const slopePerWeek = regressionResult.slope * 7;
  const rSquared = regressionResult.rSquared;
  const trend = regressionResult.trend;

  if (trend === "improving" && rSquared > 0.7) {
    const X = slopePerWeek.toFixed(1);
    const weeksToTarget = slopePerWeek > 0 ? Math.max(0, Math.ceil((80 - currentScore) / slopePerWeek)) : 0;
    return `Your resume quality is improving consistently at ${X} points per week. At this rate you'll reach an ATS score of 80 in ${weeksToTarget} weeks.`;
  }

  if (trend === "declining" && rSquared > 0.7) {
    const N = dataPoints.length;
    return `Your resume quality has declined over the last ${N} edits. Recent changes may have removed important keywords or weakened your bullet points.`;
  }

  if (trend === "flat") {
    return `Your resume has plateaued at around ${currentScore} points. Consider restructuring your experience section or adding more JD-specific keywords.`;
  }

  // Low R^2 or inconsistent slope
  return "Your resume score has been inconsistent — try targeting a specific job description when editing.";
}

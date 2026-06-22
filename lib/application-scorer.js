/**
 * Compute the success probability score and breakdown for a job application.
 * 
 * @param {Object} application The JobApplication object
 * @param {Object} userResume The Resume object
 * @param {Object} userProfile The User object (with skills, bio, and coverLetters array)
 * @returns {Object} Scored metrics, label, color theme, and recommendations
 */
export function computeApplicationScore(application = {}, userResume = null, userProfile = {}) {
  const msPerDay = 1000 * 60 * 60 * 24;

  // A. RESUME-JD ALIGNMENT SCORE (30 points)
  let alignment = 0;
  const role = (application.role || "").toLowerCase().trim();
  if (role) {
    const words = role.split(/[\s,./\-\(\)]+/).filter(w => w.length > 2);
    if (words.length > 0) {
      let matches = 0;
      const resumeContent = (userResume?.content || "").toLowerCase();
      words.forEach(w => {
        if (resumeContent.includes(w)) {
          matches++;
        }
      });
      alignment = (matches / words.length) * 30;
    }
  }

  // B. APPLICATION RECENCY (20 points)
  let recency = 3;
  if (application.createdAt) {
    const daysSinceApplied = Math.floor((Date.now() - new Date(application.createdAt).getTime()) / msPerDay);
    if (daysSinceApplied <= 7) {
      recency = 20;
    } else if (daysSinceApplied <= 14) {
      recency = 15;
    } else if (daysSinceApplied <= 30) {
      recency = 8;
    }
  }

  // C. PROFILE COMPLETENESS (20 points)
  let profileCompleteness = 0;
  if (userResume) profileCompleteness += 5;
  if (userResume?.atsScore >= 70) profileCompleteness += 5;
  if (userProfile?.skills && userProfile.skills.length >= 5) profileCompleteness += 5;
  if (userProfile?.bio && userProfile.bio.trim().length > 0) profileCompleteness += 5;

  // D. COVER LETTER GENERATED (15 points)
  let coverLetter = 0;
  const coverLetters = userProfile?.coverLetters || [];
  const hasCoverLetter = coverLetters.some(cl => 
    cl.companyName?.toLowerCase().trim() === application.company?.toLowerCase().trim() &&
    cl.jobTitle?.toLowerCase().trim() === application.role?.toLowerCase().trim()
  );
  if (hasCoverLetter) {
    coverLetter = 15;
  }

  // E. FOLLOW-UP ACTIVITY (15 points)
  let followUp = 0;
  if (application.lastFollowUp) {
    const daysSinceFollowUp = Math.floor((Date.now() - new Date(application.lastFollowUp).getTime()) / msPerDay);
    if (daysSinceFollowUp <= 7) {
      followUp = 15;
    } else if (daysSinceFollowUp <= 14) {
      followUp = 8;
    }
  }

  // Sum all components (0-100)
  const score = Math.round(alignment + recency + profileCompleteness + coverLetter + followUp);

  // Map to probability labels
  let label = "Very Low";
  let color = "zinc"; // grey

  if (score >= 75) {
    label = "High";
    color = "green";
  } else if (score >= 50) {
    label = "Medium";
    color = "amber";
  } else if (score >= 25) {
    label = "Low";
    color = "red";
  }

  // Top Recommendation logic (lowest scoring component ratio)
  const ratios = [
    { name: "alignment", ratio: alignment / 30, rec: "Tailor your resume to this specific job description" },
    { name: "recency", ratio: recency / 20, rec: "This application may be past the screening window" },
    { name: "profile", ratio: profileCompleteness / 20, rec: "Complete your profile to strengthen your applications" },
    { name: "coverLetter", ratio: coverLetter / 15, rec: "Generate a cover letter to significantly boost your chances" },
    { name: "followUp", ratio: followUp / 15, rec: "Send a follow-up message — you haven't followed up yet" }
  ];

  // Sort by ratio ascending (lowest ratio gets chosen)
  ratios.sort((a, b) => a.ratio - b.ratio);
  const topRecommendation = ratios[0].rec;

  return {
    score,
    label,
    color,
    breakdown: {
      alignment,
      recency,
      profileCompleteness,
      coverLetter,
      followUp
    },
    topRecommendation
  };
}

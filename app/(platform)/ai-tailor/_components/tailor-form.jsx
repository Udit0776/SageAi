"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles, FileText, Target, CheckCircle2, AlertCircle, Save, ArrowRight, Upload } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { tailorResumeWithAI, saveResume, parsePDFResume, extractResumeFromPDF } from "@/action/resume";
import MDEditor from "@uiw/react-md-editor";
import { entriesToMarkdown } from "@/app/lib/helper";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function TailorForm({ initialResume }) {
    const router = useRouter();
    const { user } = useUser();

    // Define helper first to satisfy temporal dead zone / reference limits
    const getCombinedContent = useCallback((data) => {
        if (!data) return "";
        const { summary, skills, experience, education, projects, contactInfo } = data;
        
        const parts = [];
        if (contactInfo?.mobile) parts.push(`📞 ${contactInfo.mobile}`);
        if (contactInfo?.email) parts.push(`📧 ${contactInfo.email}`);
        if (contactInfo?.linkedin) parts.push(`🔗 ${contactInfo.linkedin}`);
        
        const name = contactInfo?.name || user?.fullName || "Your Name";
        const contactSection = `## <div align="center">${name}</div>` + (parts.length > 0 ? ` \n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>` : "");

        return [
            contactSection,
            summary && `## Professional Summary\n\n${summary}`,
            skills && `## Skills\n\n${skills}`,
            entriesToMarkdown(experience || [], "Work Experience"),
            entriesToMarkdown(education || [], "Education"),
            entriesToMarkdown(projects || [], "Projects"),
        ]
            .filter(Boolean)
            .join("\n\n");
    }, [user]);

    const [isTailoring, setIsTailoring] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [jobDescription, setJobDescription] = useState("");
    const [matchScore, setMatchScore] = useState(null);
    const [keywordMatchScore, setKeywordMatchScore] = useState(null);
    const [semanticSimilarityScore, setSemanticSimilarityScore] = useState(null);
    const [semanticInterpretation, setSemanticInterpretation] = useState("");
    const [topMatchingPairs, setTopMatchingPairs] = useState([]);
    const [showPairs, setShowPairs] = useState(false);
    const [aiMatchScore, setAiMatchScore] = useState(null);
    const [matchingKeywords, setMatchingKeywords] = useState([]);
    const [missingKeywords, setMissingKeywords] = useState([]);
    const [aiExplanation, setAiExplanation] = useState("");
    const [tailoredResume, setTailoredResume] = useState(null);
    
    const [prevInitialResume, setPrevInitialResume] = useState(initialResume);
    const [resumeData, setResumeData] = useState(() => {
        if (initialResume?.content) {
            try {
                return JSON.parse(initialResume.content);
            } catch (e) {
                console.error("[TailorForm] Failed to parse initial resume:", e);
                return null;
            }
        }
        return null;
    });
    
    const [resumeContentStr, setResumeContentStr] = useState(() => initialResume?.content || null);

    // Sync state during render when initialResume prop changes
    if (initialResume !== prevInitialResume) {
        setPrevInitialResume(initialResume);
        if (initialResume?.content) {
            try {
                const parsed = JSON.parse(initialResume.content);
                setResumeData(parsed);
                setResumeContentStr(initialResume.content);
                console.log("[TailorForm] Updated resume state from new prop:", Object.keys(parsed));
            } catch (e) {
                console.error("[TailorForm] Failed to parse updated initial resume:", e);
            }
        }
    }

    // Derived state for preview content
    const previewContent = useMemo(() => {
        const dataToRender = tailoredResume || resumeData;
        return dataToRender ? getCombinedContent(dataToRender) : "";
    }, [resumeData, tailoredResume, getCombinedContent]);

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("Please upload a PDF file");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            
            toast.info("Step 1/3: Reading PDF...");
            const pdfData = await parsePDFResume(formData);
            console.log("[Upload] PDF read, base64 length:", pdfData.base64.length, "text extracted:", !!pdfData.text);
            
            toast.info("Step 2/3: AI is extracting your resume data...");
            const parsedData = await extractResumeFromPDF(pdfData);
            console.log("[Upload] AI extracted:", JSON.stringify(parsedData).substring(0, 200));
            
            toast.info("Step 3/3: Saving...");
            const contentStr = JSON.stringify(parsedData);
            await saveResume(contentStr);
            
            // Update local state directly — don't rely on router.refresh()
            setResumeData(parsedData);
            setResumeContentStr(contentStr);
            setTailoredResume(null);
            setMatchScore(null);
            setKeywordMatchScore(null);
            setSemanticSimilarityScore(null);
            setSemanticInterpretation("");
            setTopMatchingPairs([]);
            setShowPairs(false);
            setAiMatchScore(null);
            setMatchingKeywords([]);
            setMissingKeywords([]);
            setAiExplanation("");
            
            toast.success("Resume uploaded and processed successfully!");
        } catch (error) {
            console.error("[Upload] Error:", error);
            toast.error(error.message || "Failed to process resume");
        } finally {
            setIsUploading(false);
            event.target.value = "";
        }
    };

    const handleTailor = async () => {
        if (!jobDescription) {
            toast.error("Please enter a job description.");
            return;
        }
        if (!resumeContentStr) {
            toast.error("Please upload a resume first.");
            return;
        }

        setIsTailoring(true);
        try {
            toast.info("AI is analyzing and tailoring your resume...");
            const result = await tailorResumeWithAI({
                currentResume: resumeContentStr,
                jobDescription
            });

            if (result.tailoredResume) {
                setTailoredResume(result.tailoredResume);
            }
            if (result.keywordMatchScore !== undefined) {
                setKeywordMatchScore(result.keywordMatchScore);
            }
            if (result.semanticSimilarityScore !== undefined) {
                setSemanticSimilarityScore(result.semanticSimilarityScore);
            }
            if (result.semanticInterpretation !== undefined) {
                setSemanticInterpretation(result.semanticInterpretation);
            }
            if (result.topMatchingPairs !== undefined) {
                setTopMatchingPairs(result.topMatchingPairs);
            }
            if (result.aiMatchScore !== undefined) {
                setAiMatchScore(result.aiMatchScore);
                setMatchScore(result.aiMatchScore);
            }
            if (result.matchingKeywords) {
                setMatchingKeywords(result.matchingKeywords);
            }
            if (result.missingKeywords) {
                setMissingKeywords(result.missingKeywords);
            }
            if (result.aiExplanation) {
                setAiExplanation(result.aiExplanation);
            }
            toast.success("Resume tailored successfully!");
        } catch (error) {
            toast.error(error.message || "Failed to tailor resume");
        } finally {
            setIsTailoring(false);
        }
    };

    const handleSave = async () => {
        if (!tailoredResume) return;
        
        setIsSaving(true);
        try {
            const payload = {
                ...tailoredResume,
                targetJobDescription: jobDescription,
                matchScore: aiMatchScore !== null ? aiMatchScore : matchScore
            };
            await saveResume(JSON.stringify(payload));
            setResumeData(tailoredResume);
            setResumeContentStr(JSON.stringify(tailoredResume));
            setTailoredResume(null);
            toast.success("Tailored resume saved!");
        } catch (error) {
            toast.error(error.message || "Failed to save");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-title">
                        AI Job Tailor
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Optimize your resume for a specific job description to beat the ATS.
                    </p>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input id="pdf-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                </div>
            </div>

            {!resumeData ? (
                <Card className="border-dashed bg-background/30 backdrop-blur-sm">
                    <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                        <div className="p-4 rounded-full bg-primary/10">
                            <FileText className="h-10 w-10 text-primary opacity-50" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-semibold text-base sm:text-lg">No Resume Found</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
                                Upload a PDF or build a resume first.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm px-4">
                            <Button 
                                variant="outline" 
                                onClick={() => document.getElementById('pdf-upload').click()}
                                className="w-full text-xs sm:text-sm cursor-pointer"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload PDF
                            </Button>
                            <Link href="/resume" className="w-full">
                                <Button className="w-full text-xs sm:text-sm">
                                    Build from Scratch
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6 sm:space-y-8">
                    {aiMatchScore !== null && keywordMatchScore !== null && (
                        <Card className="shadow-lg border border-primary/10 bg-background/50 backdrop-blur-sm w-full">
                            <CardContent className="p-4 sm:p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1 bg-muted/10 p-3 rounded-lg border border-primary/5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-muted-foreground">Keyword Match</span>
                                            <span className="text-xs font-bold">{keywordMatchScore}%</span>
                                        </div>
                                        <Progress value={keywordMatchScore} className="h-1.5 bg-muted/40" />
                                    </div>
                                    <div className="space-y-1 bg-muted/10 p-3 rounded-lg border border-primary/5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-muted-foreground font-semibold">Semantic Similarity</span>
                                            <span className="text-xs font-bold">
                                                {semanticSimilarityScore !== null ? `${semanticSimilarityScore}%` : "N/A"}
                                            </span>
                                        </div>
                                        <Progress value={semanticSimilarityScore || 0} className="h-1.5 bg-muted/40" />
                                        {semanticInterpretation && (
                                            <div className="text-[9px] text-muted-foreground text-right font-medium mt-1">
                                                {semanticInterpretation}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1 bg-muted/10 p-3 rounded-lg border border-primary/5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-muted-foreground">AI Contextual Match</span>
                                            <span className="text-xs font-bold">{aiMatchScore}%</span>
                                        </div>
                                        <Progress value={aiMatchScore} className="h-1.5 bg-muted/40" />
                                    </div>
                                </div>

                                {/* Expandable top matching sentence pairs */}
                                {topMatchingPairs && topMatchingPairs.length > 0 && (
                                    <div className="border border-muted/50 rounded-xl overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => setShowPairs(!showPairs)}
                                            className="w-full flex items-center justify-between p-3 bg-muted/20 hover:bg-muted/30 transition-colors text-xs font-bold text-foreground cursor-pointer"
                                        >
                                            <span>🔍 Top Semantic Sentence Matches</span>
                                            <span className="text-muted-foreground text-[10px]">
                                                {showPairs ? "Collapse ▲" : "Expand ▼"}
                                            </span>
                                        </button>
                                        {showPairs && (
                                            <div className="p-3 bg-muted/5 divide-y divide-muted/30 space-y-3">
                                                {topMatchingPairs.map((pair, index) => (
                                                    <div key={index} className="pt-3 first:pt-0 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <Badge className="text-[8px] font-bold tracking-wider uppercase bg-primary/10 text-primary hover:bg-primary/20 shrink-0">
                                                                Match {index + 1} ({(pair.similarity * 100).toFixed(0)}%)
                                                            </Badge>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                                                            <div className="bg-muted/10 p-2 rounded border border-muted/30">
                                                                <span className="font-bold text-[9px] text-muted-foreground uppercase tracking-wider block mb-1">Resume:</span>
                                                                <p className="italic text-foreground">&ldquo;{pair.sentence1}&rdquo;</p>
                                                            </div>
                                                            <div className="bg-muted/10 p-2 rounded border border-muted/30">
                                                                <span className="font-bold text-[9px] text-muted-foreground uppercase tracking-wider block mb-1">Job Description:</span>
                                                                <p className="italic text-foreground">&ldquo;{pair.sentence2}&rdquo;</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {aiExplanation && (
                                    <div className="bg-muted/30 border border-muted p-3 sm:p-4 rounded-xl text-xs sm:text-sm leading-relaxed text-muted-foreground">
                                        <span className="font-bold text-foreground block mb-1">AI Explanation & Gap Analysis:</span>
                                        {aiExplanation}
                                    </div>
                                )}

                                {/* Keyword lists */}
                                <div className="space-y-4 pt-2 border-t border-muted/55">
                                    <div>
                                        <span className="text-xs font-bold text-foreground block mb-2">
                                            Matching Keywords ({matchingKeywords.length})
                                        </span>
                                        {matchingKeywords.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {matchingKeywords.map((kw, i) => (
                                                    <Badge key={i} variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] py-0.5 px-2 hover:bg-emerald-500/20 transition-all font-semibold rounded-lg">
                                                        {kw}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">None found</span>
                                        )}
                                    </div>

                                    <div>
                                        <span className="text-xs font-bold text-foreground block mb-2">
                                            Missing Keywords ({missingKeywords.length})
                                        </span>
                                        {missingKeywords.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {missingKeywords.map((kw, i) => (
                                                    <Badge key={i} variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px] py-0.5 px-2 hover:bg-rose-500/20 transition-all font-semibold rounded-lg">
                                                        {kw}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">None missing</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:h-[700px] xl:h-[780px] lg:overflow-hidden">
                        <div className="space-y-6 lg:h-full lg:flex lg:flex-col lg:overflow-hidden">
                            <Card className="border-primary/10 bg-background/50 backdrop-blur-sm shadow-xl lg:flex-grow lg:flex lg:flex-col lg:overflow-hidden">
                                <CardHeader className="p-4 sm:p-6 pb-2">
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
                                        <Target className="h-5 w-5 text-primary" />
                                        Job Description
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 space-y-4 lg:flex-grow lg:flex lg:flex-col lg:overflow-hidden">
                                    <Textarea
                                        placeholder="Paste the job requirements here..."
                                        className="min-h-[200px] lg:min-h-0 lg:flex-grow resize-none bg-muted/20 focus-visible:ring-primary/50 text-xs sm:text-sm leading-relaxed lg:overflow-y-auto"
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                    />
                                    <Button 
                                        onClick={handleTailor} 
                                        disabled={isTailoring || !jobDescription}
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all active:scale-[0.98] h-10 sm:h-12 text-sm sm:text-base font-bold rounded-xl cursor-pointer lg:shrink-0"
                                    >
                                        {isTailoring ? (
                                            <>
                                                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                                1-Click Tailor
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>

                            {aiMatchScore === null && matchScore !== null && (
                                <Card className={`border-l-4 shadow-lg lg:shrink-0 ${matchScore >= 80 ? 'border-l-green-500' : matchScore >= 60 ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm sm:text-base font-bold">ATS Match Score</span>
                                            <Badge variant={matchScore >= 80 ? "success" : matchScore >= 60 ? "warning" : "destructive"}>
                                                {matchScore}%
                                            </Badge>
                                        </div>
                                        <Progress value={matchScore} className="h-1.5 sm:h-2 mb-4" />
                                        <div className="flex items-start gap-2 text-[10px] sm:text-xs text-muted-foreground">
                                            {matchScore >= 80 ? <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" /> : <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />}
                                            <span>{matchScore >= 80 ? "Excellent profile match!" : "Good match, but room for improvement."}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <div className="space-y-6 lg:h-full lg:flex lg:flex-col lg:overflow-hidden">
                            <Card className="h-full flex flex-col border-primary/10 shadow-xl overflow-hidden lg:flex-grow">
                                <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6 py-3 sm:py-4 bg-muted/10 border-b">
                                    <div>
                                        <CardTitle className="text-sm sm:text-base font-bold">
                                            {tailoredResume ? "✨ AI Optimized Resume" : "📄 Your Resume"}
                                        </CardTitle>
                                        <CardDescription className="text-[10px] sm:text-xs">
                                            {tailoredResume ? "Optimized for the target job" : "Current version from your upload"}
                                        </CardDescription>
                                    </div>
                                    {tailoredResume && (
                                        <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving} className="text-xs cursor-pointer">
                                            {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-2" />}
                                            Save
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent className="flex-grow p-0 flex flex-col h-full overflow-hidden">
                                    <div data-color-mode="light" className="flex-grow flex flex-col h-full min-h-[400px] resume-preview-paper overflow-hidden">
                                        <MDEditor
                                            value={previewContent || "Waiting for resume data..."}
                                            preview="preview"
                                            hideToolbar
                                            height="100%"
                                            className="!border-none flex-grow"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

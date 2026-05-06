"use client";

import { useState, useEffect, useCallback } from "react";
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
    const [isTailoring, setIsTailoring] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [jobDescription, setJobDescription] = useState("");
    const [matchScore, setMatchScore] = useState(null);
    const [tailoredResume, setTailoredResume] = useState(null);
    const [previewContent, setPreviewContent] = useState("");
    const [resumeData, setResumeData] = useState(null);
    const [resumeContentStr, setResumeContentStr] = useState(null);
    const router = useRouter();
    const { user } = useUser();

    // Parse initial resume on mount and when prop changes
    useEffect(() => {
        if (initialResume?.content) {
            try {
                const parsed = JSON.parse(initialResume.content);
                setResumeData(parsed);
                setResumeContentStr(initialResume.content);
                console.log("[TailorForm] Loaded resume from server:", Object.keys(parsed));
            } catch (e) {
                console.error("[TailorForm] Failed to parse initial resume:", e);
            }
        }
    }, [initialResume]);

    // Update preview whenever resumeData or tailoredResume changes
    useEffect(() => {
        const dataToRender = tailoredResume || resumeData;
        if (dataToRender) {
            const md = getCombinedContent(dataToRender);
            setPreviewContent(md);
            console.log("[TailorForm] Preview updated, length:", md.length);
        }
    }, [resumeData, tailoredResume, user]);

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
            if (result.matchScore !== undefined) {
                setMatchScore(result.matchScore);
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
                matchScore: matchScore
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
                    <Button 
                        onClick={() => document.getElementById('pdf-upload').click()} 
                        variant="secondary" 
                        disabled={isUploading} 
                        className="flex-1 sm:flex-none text-xs sm:text-sm h-9 px-4 cursor-pointer"
                    >
                        {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                        {isUploading ? "Processing..." : "Upload PDF"}
                    </Button>
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-6">
                        <Card className="border-primary/10 bg-background/50 backdrop-blur-sm shadow-xl">
                            <CardHeader className="p-4 sm:p-6 pb-2">
                                <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
                                    <Target className="h-5 w-5 text-primary" />
                                    Job Description
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 space-y-4">
                                <Textarea
                                    placeholder="Paste the job requirements here..."
                                    className="min-h-[200px] sm:min-h-[300px] resize-none bg-muted/20 focus-visible:ring-primary/50 text-xs sm:text-sm leading-relaxed"
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                />
                                <Button 
                                    onClick={handleTailor} 
                                    disabled={isTailoring || !jobDescription}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all active:scale-[0.98] h-10 sm:h-12 text-sm sm:text-base font-bold rounded-xl cursor-pointer"
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

                        {matchScore !== null && (
                            <Card className={`border-l-4 shadow-lg ${matchScore >= 80 ? 'border-l-green-500' : matchScore >= 60 ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
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

                    <div className="space-y-6">
                        <Card className="h-full flex flex-col border-primary/10 shadow-xl overflow-hidden">
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
                            <CardContent className="flex-grow p-0 overflow-auto">
                                <div data-color-mode="light" className="min-h-[400px]">
                                    <MDEditor
                                        value={previewContent || "Waiting for resume data..."}
                                        preview="preview"
                                        hideToolbar
                                        height={600}
                                        className="!border-none !bg-white"
                                        style={{ background: "white" }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}

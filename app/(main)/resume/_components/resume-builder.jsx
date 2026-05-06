"use client";

import { getResume, improveWithAI, saveResume } from "@/action/resume";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { resumeSchema } from "@/app/lib/schema";
import useFetch from "@/hooks/use-fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/app/components/ui/label";
import { AlertTriangle, Download, Edit, Loader2, Monitor, Save, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Textarea } from "@/app/components/ui/textarea";
import EntryForm from "./entry-form";
import { toast } from "sonner";
import { entriesToMarkdown } from "@/app/lib/helper";
import MDEditor from "@uiw/react-md-editor";
import { useUser } from "@clerk/nextjs";

export default function ResumeBuilder({ initialContent }) {

    const [activeTab, setActiveTab] = useState("edit");
    const [resumeMode, setResumeMode] = useState("preview");
    const [previewContent, setPreviewContent] = useState(initialContent);
    const { user } = useUser();
    const [isGenerating, setIsGenerating] = useState(false);

    const { control, register, handleSubmit, watch, formState: { errors }, reset, setValue } = useForm({
        resolver: zodResolver(resumeSchema),
        defaultValues: {
            contactInfo: {},
            summary: "",
            skills: "",
            experience: [],
            education: [],
            projects: [],
        },

    })

    const {
        loading: isSaving,
        fn: saveResumeFn,
        data: saveResult,
        error: saveError,
    } = useFetch(saveResume);

    const {
        loading: isImproving,
        fn: improveWithAIFn,
        data: improvedContent,
        error: improveError,
    } = useFetch(improveWithAI);

    const formValues = watch();

    useEffect(() => {
        if (initialContent) {
            try {
                const content = JSON.parse(initialContent);
                reset(content);
            } catch (error) {
                console.error("Failed to parse initial content:", error);
            }
        }
    }, [initialContent, reset])

    useEffect(() => {
        if (activeTab === "edit") {
            const newContent = getCombinedContent();
            setPreviewContent(newContent ? newContent : initialContent);
        }
    }, [formValues, activeTab])

    const getContactMarkdown = () => {
        const { contactInfo } = formValues;
        const parts = [];
        if (contactInfo.mobile) parts.push(`📞 ${contactInfo.mobile}`);
        if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
        if (contactInfo.linkedin) parts.push(`🔗 ${contactInfo.linkedin}`);
        if (contactInfo.twitter) parts.push(`🐦 ${contactInfo.twitter}`);

        const name = user?.fullName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || "Your Name";

        return parts.length > 0 ? `## <div align="center">${name}</div> \n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>` : "";
    };

    const getCombinedContent = () => {
        const { summary, skills, experience, education, projects } = formValues;

        return [
            getContactMarkdown(),
            summary && `## Professional Summary\n\n${summary}`,
            skills && `## Skills\n\n${skills}`,
            entriesToMarkdown(experience, "Work Experience"),
            entriesToMarkdown(education, "Education"),
            entriesToMarkdown(projects, "Projects"),
        ]
            .filter(Boolean)
            .join("\n\n");
    }

    const onSubmit = async (data) => {
        try {
            await toast.promise(saveResumeFn(JSON.stringify(data)), {
                loading: "Saving your resume...",
                success: "Resume saved successfully!",
                error: (err) => err.message || "Failed to save resume",
            });
        } catch (error) {
            // Error is handled by toast.promise
        }
    }

    const handleImprove = async (field, type) => {
        const currentContent = watch(field);
        if (!currentContent) {
            toast.error("Please enter some content first");
            return;
        }

        try {
            const result = await improveWithAIFn({ current: currentContent, type });
            if (result) {
                setValue(field, result);
                toast.success("Content improved with AI!");
            }
        } catch (error) {
            toast.error(error.message || "Failed to improve content");
        }
    }

    const generatePDF = async () => {
        setIsGenerating(true);
        try {
            // Get the rendered markdown HTML from the preview
            const previewEl = document.querySelector(".wmde-markdown");
            if (!previewEl) {
                toast.error("Please switch to the Markdown tab first");
                return;
            }
            const htmlContent = previewEl.innerHTML;

            // Create a hidden iframe for clean printing
            const iframe = document.createElement("iframe");
            iframe.style.position = "fixed";
            iframe.style.left = "-9999px";
            iframe.style.top = "-9999px";
            iframe.style.width = "210mm";
            iframe.style.height = "297mm";
            document.body.appendChild(iframe);

            const iframeDoc = iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Resume</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            font-size: 13px;
                            line-height: 1.5;
                            color: #000;
                            background: #fff;
                            padding: 15mm;
                        }
                        h1 { font-size: 1.5em; margin-bottom: 0.4em; border-bottom: 2px solid #333; padding-bottom: 0.2em; }
                        h2 { font-size: 1.25em; margin-top: 1.2em; margin-bottom: 0.4em; border-bottom: 1px solid #ccc; padding-bottom: 0.1em; }
                        h3 { font-size: 1.05em; margin-top: 1em; margin-bottom: 0.3em; }
                        p, li { margin-bottom: 0.4em; }
                        ul, ol { padding-left: 1.5em; }
                        a { color: #0066cc; text-decoration: none; }
                        div[align="center"] { text-align: center; }
                        /* Hide MDEditor link icons and anchor markers */
                        svg, .octicon, a.anchor { display: none !important; }
                        @page { margin: 0; size: A4; }
                        @media print {
                            body { padding: 15mm; }
                        }
                    </style>
                </head>
                <body>${htmlContent}</body>
                </html>
            `);
            iframeDoc.close();

            let printed = false;

            const doPrint = () => {
                if (printed) return;
                printed = true;
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                setTimeout(() => {
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe);
                    }
                    setIsGenerating(false);
                }, 1000);
            };

            iframe.contentWindow.onload = doPrint;

            // Fallback if onload doesn't fire
            setTimeout(doPrint, 500);
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Failed to generate PDF");
            setIsGenerating(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="font-bold gradient-title text-2xl md:text-3xl">
                        Resume Builder
                    </h1>
                    <p className="text-sm mt-1">
                        Create a professional resume with AI assistance
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="px-6"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-1" /> Save
                            </>
                        )}
                    </Button>
                    <Button onClick={generatePDF} disabled={isGenerating} className="cursor-pointer">
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4 mr-1" /> Download PDF
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-muted/50 border border-border h-10 p-1">
                    <TabsTrigger
                        value="edit"
                        className="data-active:bg-white data-active:text-black px-8 transition-all font-semibold text-xs sm:text-sm"
                    >
                        Form
                    </TabsTrigger>
                    <TabsTrigger
                        value="preview"
                        className="data-active:bg-white data-active:text-black px-8 transition-all font-semibold text-xs sm:text-sm"
                    >
                        Markdown
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="edit" className="mt-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h3 className="text-base sm:text-lg font-semibold border-b pb-2">
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 p-4 sm:p-6 border rounded-lg bg-card">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs sm:text-sm">Email Address</Label>
                                    <Input
                                        id="email"
                                        {...register("contactInfo.email")}
                                        type="email"
                                        placeholder="your@email.com"
                                        className="text-xs sm:text-sm"
                                        error={errors.contactInfo?.email}
                                    />
                                    {errors.contactInfo?.email && (
                                        <p className="text-destructive text-[10px] sm:text-xs font-medium">
                                            {errors.contactInfo.email.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mobile" className="text-xs sm:text-sm">Mobile Number</Label>
                                    <Input
                                        id="mobile"
                                        {...register("contactInfo.mobile")}
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        className="text-xs sm:text-sm"
                                    />
                                    {errors.contactInfo?.mobile && (
                                        <p className="text-destructive text-[10px] sm:text-xs font-medium">
                                            {errors.contactInfo.mobile.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="linkedin" className="text-xs sm:text-sm">LinkedIn URL</Label>
                                    <Input
                                        id="linkedin"
                                        {...register("contactInfo.linkedin")}
                                        type="url"
                                        placeholder="https://linkedin.com/in/yourprofile"
                                        className="text-xs sm:text-sm"
                                    />
                                    {errors.contactInfo?.linkedin && (
                                        <p className="text-destructive text-[10px] sm:text-xs font-medium">
                                            {errors.contactInfo.linkedin.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="twitter" className="text-xs sm:text-sm">Twitter / X Profile</Label>
                                    <Input
                                        id="twitter"
                                        {...register("contactInfo.twitter")}
                                        type="url"
                                        placeholder="https://twitter.com/yourhandle"
                                        className="text-xs sm:text-sm"
                                    />
                                    {errors.contactInfo?.twitter && (
                                        <p className="text-destructive text-[10px] sm:text-xs font-medium">
                                            {errors.contactInfo.twitter.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Professional Summary */}
                        <div className="space-y-4">
                            <h3 className="text-base sm:text-lg font-semibold border-b pb-2">Professional Summary</h3>
                            <div className="p-4 sm:p-6 border rounded-lg bg-card space-y-4">
                                <Controller
                                    name="summary"
                                    control={control}
                                    render={({ field }) => (
                                        <Textarea
                                            {...field}
                                            className="h-32 text-xs sm:text-sm"
                                            placeholder="Write a compelling professional summary..."
                                        />
                                    )}
                                />
                                {errors.summary && (
                                    <p className="text-destructive text-[10px] sm:text-xs font-medium">
                                        {errors.summary.message}
                                    </p>
                                )}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs sm:text-sm h-8"
                                    onClick={() => handleImprove("summary", "Professional Summary")}
                                    disabled={isImproving || !watch("summary")}
                                >
                                    {isImproving ? (
                                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1" />
                                    ) : (
                                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    )}
                                    Improve with AI
                                </Button>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="space-y-4">
                            <h3 className="text-base sm:text-lg font-semibold border-b pb-2">Skills</h3>
                            <div className="p-4 sm:p-6 border rounded-lg bg-card space-y-4">
                                <Controller
                                    name="skills"
                                    control={control}
                                    render={({ field }) => (
                                        <Textarea
                                            {...field}
                                            className="h-32 text-xs sm:text-sm"
                                            placeholder="List your key skills (comma separated)..."
                                        />
                                    )}
                                />
                                {errors.skills && (
                                    <p className="text-destructive text-[10px] sm:text-xs font-medium">
                                        {errors.skills.message}
                                    </p>
                                )}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs sm:text-sm h-8"
                                    onClick={() => handleImprove("skills", "Skills")}
                                    disabled={isImproving || !watch("skills")}
                                >
                                    {isImproving ? (
                                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1" />
                                    ) : (
                                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    )}
                                    Improve with AI
                                </Button>
                            </div>
                        </div>

                        {/* Work Experience */}
                        <div className="space-y-4">
                            <h3 className="text-base sm:text-lg font-semibold border-b pb-2">Work Experience</h3>
                            <div className="p-4 sm:p-6 border rounded-lg bg-card">
                                <Controller
                                    name="experience"
                                    control={control}
                                    render={({ field }) => (
                                        <EntryForm
                                            type="Experience"
                                            entries={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                {errors.experience && (
                                    <p className="text-destructive text-[10px] sm:text-xs font-medium">
                                        {errors.experience.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="space-y-4">
                            <h3 className="text-base sm:text-lg font-semibold border-b pb-2">Education</h3>
                            <div className="p-4 sm:p-6 border rounded-lg bg-card">
                                <Controller
                                    name="education"
                                    control={control}
                                    render={({ field }) => (
                                        <EntryForm
                                            type="Education"
                                            entries={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                {errors.education && (
                                    <p className="text-destructive text-[10px] sm:text-xs font-medium">
                                        {errors.education.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Projects */}
                        <div className="space-y-4">
                            <h3 className="text-base sm:text-lg font-semibold border-b pb-2">Projects</h3>
                            <div className="p-4 sm:p-6 border rounded-lg bg-card">
                                <Controller
                                    name="projects"
                                    control={control}
                                    render={({ field }) => (
                                        <EntryForm
                                            type="Project"
                                            entries={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                {errors.projects && (
                                    <p className="text-destructive text-[10px] sm:text-xs font-medium">
                                        {errors.projects.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </form>
                </TabsContent>
                <TabsContent value="preview" className="mt-6">
                    <Button variant="link" type="button" className="mb-2 text-xs sm:text-sm" onClick={() => setResumeMode(resumeMode === "preview" ? "edit" : "preview")}>
                        {resumeMode === "preview" ? (
                            <>
                                <Edit className="h-4 w-4 mr-1" />Edit Resume
                            </>
                        ) : (
                            <>
                                <Monitor className="h-4 w-4 mr-1" />Show Preview
                            </>
                        )}
                    </Button>

                    {resumeMode !== 'preview' && (
                        <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
                            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-[10px] sm:text-sm font-medium">You will lose edited markdown if you update the form data.</span>
                        </div>
                    )}

                    <div className="border rounded-lg max-w-3xl mx-auto overflow-hidden shadow-sm">
                        <MDEditor value={previewContent} onChange={setPreviewContent} height={800} preview={resumeMode} />
                    </div>

                </TabsContent>
            </Tabs>
        </div>
    );
}
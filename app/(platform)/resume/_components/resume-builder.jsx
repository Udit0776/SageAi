"use client";

import {
  getResume,
  improveWithAI,
  saveResume,
  parsePDFResume,
  extractResumeFromPDF,
  parseMarkdownResume,
  analyzeResumeATS,
} from "@/action/resume";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { resumeSchema } from "@/app/lib/schema";
import useFetch from "@/hooks/use-fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/app/components/ui/label";
import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Monitor,
  Save,
  Sparkles,
  AlertCircle,
  Award,
  CheckCircle2,
  Target,
  Info,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { useEffect, useState } from "react";
import { Progress } from "@/app/components/ui/progress";
import { computeATSScore, getPlainTextFromResume } from "@/lib/ats-scorer";
import { Controller, useForm } from "react-hook-form";
import { Textarea } from "@/app/components/ui/textarea";
import EntryForm from "./entry-form";
import { toast } from "sonner";
import { entriesToMarkdown } from "@/app/lib/helper";
import MDEditor from "@uiw/react-md-editor";
import { useUser } from "@clerk/nextjs";

function markdownToHtml(markdown) {
  if (!markdown) return "";

  let html = markdown.replace(/\r\n/g, "\n");

  // Headers
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");

  // Horizontal rule
  html = html.replace(/^---$/gm, "<hr />");

  // Bullet list items
  html = html.replace(/^\s*[-*]\s+(.+)$/gm, "<li>$1</li>");

  // Wrap consecutive <li> tags in <ul>
  html = html.replace(/(?:<li>.*?<\/li>\s*)+/g, (match) => {
    return `<ul>${match}</ul>`;
  });

  // Inline links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Convert paragraphs - split by empty lines, and wrap non-element blocks
  const blocks = html.split(/\n\n+/);
  html = blocks
    .map((block) => {
      block = block.trim();
      if (!block) return "";
      if (
        block.startsWith("<h") ||
        block.startsWith("<ul") ||
        block.startsWith("<ol") ||
        block.startsWith("<div") ||
        block.startsWith("<hr") ||
        block.startsWith("<p")
      ) {
        return block;
      }
      return `<p>${block.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");

  return html;
}

export default function ResumeBuilder({ initialContent, initialAtsResult, userProfile }) {
  const [activeTab, setActiveTab] = useState("edit");
  const [resumeMode, setResumeMode] = useState("preview");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const { user } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [isCustomMarkdownMode, setIsCustomMarkdownMode] = useState(false);
  const [isParsingMarkdown, setIsParsingMarkdown] = useState(false);

  const [jdText, setJdText] = useState(
    initialAtsResult?.targetJobDescription || "",
  );
  const [isScanning, setIsScanning] = useState(false);
  const [atsResult, setAtsResult] = useState(() => {
    if (initialAtsResult?.atsScore && initialContent) {
      try {
        const resumeText = getPlainTextFromResume(initialContent);
        let options = {};
        const jd = initialAtsResult.targetJobDescription || "";
        if (!jd || jd.trim().length === 0) {
          options.isGeneralStructuralOnly = true;
        }

        const scoreBreakdown = computeATSScore(
          resumeText,
          jd,
          options
        );
        return {
          ...scoreBreakdown,
          aiFeedback: initialAtsResult.feedback,
        };
      } catch (e) {
        console.error("Failed to compute initial ATS score:", e);
      }
    }
    return null;
  });

  const getActiveScanMode = () => {
    if (jdText && jdText.trim().length > 0) {
      return {
        mode: "targeted",
        title: "Targeted Scan Mode",
        description: "Matching your resume keywords specifically against the provided Job Description.",
        color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      };
    }
    return {
      mode: "structural",
      title: "Structural Check Mode",
      description: "Evaluating formatting, section detection, and action verbs only. Paste a Job Description to enable keyword matching.",
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20"
    };
  };

  const activeScanMode = getActiveScanMode();

  const handlePDFUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    setIsUploading(true);
    setUploadProgressText("Extracting PDF text...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Step 1: Parse PDF to base64 & extract text using unpdf
      const parseResult = await parsePDFResume(formData);

      setUploadProgressText("Structuring content with Gemini AI...");

      // Step 2: Use Gemini to extract resume data into structured JSON
      const extractedData = await extractResumeFromPDF(parseResult);

      // Step 3: Reset the React Hook Form fields
      reset(extractedData);
      setIsCustomMarkdownMode(false);

      toast.success("Resume parsed and imported successfully!");
    } catch (error) {
      console.error("PDF upload/parsing failed:", error);
      toast.error(error.message || "Failed to parse and import resume");
    } finally {
      setIsUploading(false);
      setUploadProgressText("");
    }
  };

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

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
    const loadInitial = async () => {
      if (initialContent) {
        try {
          const content = JSON.parse(initialContent);
          reset(content);
          if (content.customMarkdown) {
            setPreviewContent(content.customMarkdown);
            setIsCustomMarkdownMode(true);
          } else {
            setIsCustomMarkdownMode(false);
          }
        } catch (error) {
          console.log("Initial content is raw Markdown, parsing to JSON...");
          setIsParsingMarkdown(true);
          try {
            const parsed = await parseMarkdownResume(initialContent);
            reset(parsed);

            // Automatically save the structured JSON back to the database
            const payload = {
              ...parsed,
              customMarkdown: initialContent,
            };
            await saveResume(JSON.stringify(payload));
          } catch (parseError) {
            console.error("Failed to parse Markdown to JSON:", parseError);
          } finally {
            setIsParsingMarkdown(false);
            setPreviewContent(initialContent);
            setIsCustomMarkdownMode(true);
          }
        }
      }
    };
    loadInitial();
  }, [initialContent, reset]);

  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent ? newContent : initialContent);
    }
  }, [formValues, activeTab]);

  const getContactMarkdown = () => {
    const { contactInfo } = formValues;
    const parts = [];
    if (contactInfo.mobile) parts.push(contactInfo.mobile);
    if (contactInfo.email) parts.push(contactInfo.email);
    if (contactInfo.linkedin) {
      const cleanLink = contactInfo.linkedin.replace(/https?:\/\/(www\.)?/, "");
      parts.push(`[${cleanLink}](${contactInfo.linkedin})`);
    }
    if (contactInfo.twitter) {
      const cleanTwitter = contactInfo.twitter.replace(
        /https?:\/\/(www\.)?(twitter\.com|x\.com)\//,
        "@",
      );
      parts.push(`[${cleanTwitter}](${contactInfo.twitter})`);
    }

    const name = user?.fullName || "Your Name";

    return parts.length > 0
      ? `\n# <div align="center" style="font-size: 1.8em; font-weight: bold; margin-bottom: 2px;">${name}</div>\n<div align="center" style="font-size: 12px; color: #444; margin-bottom: 12px; font-family: sans-serif;">\n\n${parts.join("  |  ")}\n\n</div>\n\n---`
      : "";
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
  };

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const toastId = toast.loading("Saving and scanning resume...");

      // Auto-save resume content first so that the scanner runs on the latest edits
      const currentContent = isCustomMarkdownMode
        ? previewContent
        : getCombinedContent();
      const payload = {
        ...formValues,
        customMarkdown: isCustomMarkdownMode ? previewContent : "",
      };

      await saveResume(JSON.stringify(payload));

      const result = await analyzeResumeATS(jdText);
      setAtsResult(result);
      toast.success("ATS scan complete!", { id: toastId });
    } catch (error) {
      toast.error(error.message || "Failed to scan resume");
    } finally {
      setIsScanning(false);
    }
  };

  const onSubmit = async (data) => {
    const toastId = toast.loading("Saving your resume...");
    const payload = {
      ...data,
      customMarkdown: "", // Clear custom markdown to force regeneration from form fields
    };
    const res = await saveResumeFn(JSON.stringify(payload));
    if (res) {
      toast.success("Resume saved successfully!", { id: toastId });
      setIsCustomMarkdownMode(false);
    } else {
      toast.dismiss(toastId);
    }
  };

  const onInvalid = (errors) => {
    toast.error("Please fill in all required fields correctly.");
  };

  const handleSaveMarkdown = async () => {
    const toastId = toast.loading("Saving your resume...");
    const payload = {
      ...formValues,
      customMarkdown: previewContent,
    };
    const res = await saveResumeFn(JSON.stringify(payload));
    if (res) {
      toast.success("Resume saved successfully!", { id: toastId });
      setIsCustomMarkdownMode(true);
    } else {
      toast.dismiss(toastId);
    }
  };

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
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    const toastId = toast.loading("Generating your PDF...");
    try {
      // Compile the markdown directly to HTML to allow downloads from any tab
      const htmlContent = markdownToHtml(previewContent);
      if (!htmlContent) {
        toast.error("Please add some content to your resume first", {
          id: toastId,
        });
        setIsGenerating(false);
        return;
      }

      // Create a hidden iframe to isolate styles from Tailwind CSS v4 color parsing bugs
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
                </head>
                <body>
                    <div id="pdf-content-wrapper">
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body, #pdf-content-wrapper {
                                font-family: 'Georgia', 'Times New Roman', Times, serif;
                                font-size: 11px;
                                line-height: 1.4;
                                color: #111;
                                background: #fff;
                            }
                            #pdf-content-wrapper {
                                padding: 20mm 15mm;
                                width: 100%;
                            }
                            h1 { 
                                font-size: 2em; 
                                font-weight: bold; 
                                text-align: center; 
                                margin-bottom: 5px; 
                                color: #000;
                            }
                            h2 { 
                                font-size: 1.15em; 
                                margin-top: 1.4em; 
                                margin-bottom: 0.5em; 
                                border-bottom: 1.5px solid #222; 
                                padding-bottom: 3px; 
                                text-transform: uppercase; 
                                font-weight: bold;
                                color: #000;
                                clear: both;
                            }
                            h3 { 
                                font-size: 1em; 
                                margin-top: 0.8em; 
                                margin-bottom: 0.2em; 
                                font-weight: bold; 
                                color: #111;
                            }
                            p, li { 
                                margin-bottom: 0.3em; 
                                text-align: justify;
                                color: #222;
                            }
                            ul, ol { 
                                padding-left: 1.5em; 
                            }
                            a { 
                                color: #000; 
                                text-decoration: underline; 
                            }
                            div[align="center"] { 
                                text-align: center; 
                            }
                            hr { 
                                border: 0; 
                                border-top: 1px solid #ccc; 
                                margin: 10px 0; 
                            }
                            svg, .octicon, a.anchor { display: none !important; }
                            span[style*="float: right"] {
                                float: right !important;
                                font-weight: normal !important;
                                font-size: 0.85em;
                                color: #555;
                                font-family: sans-serif;
                            }
                        </style>
                        <div id="pdf-content">${htmlContent}</div>
                    </div>
                </body>
                </html>
            `);
      iframeDoc.close();

      // Wait for iframe content to load
      await new Promise((resolve) => {
        iframe.contentWindow.onload = resolve;
        setTimeout(resolve, 300);
      });

      // Dynamically import html2pdf.js on the client side with fallback
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const opt = {
        margin: 0,
        filename: `${user?.fullName || "resume"}_resume.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          window: iframe.contentWindow,
          document: iframe.contentWindow.document,
          onclone: (clonedDoc) => {
            // Strip all global/parent styles and links from the head of the rendering canvas document clone
            if (clonedDoc.head) {
              const sheets = clonedDoc.head.querySelectorAll("style, link");
              sheets.forEach((sheet) => {
                try {
                  sheet.parentNode.removeChild(sheet);
                } catch (e) {}
              });
            }
            // Strip all styles/links from the body that are not our isolated PDF styles
            if (clonedDoc.body) {
              const bodySheets = clonedDoc.body.querySelectorAll("style, link");
              bodySheets.forEach((sheet) => {
                try {
                  const wrapper = clonedDoc.getElementById(
                    "pdf-content-wrapper",
                  );
                  if (!wrapper || !wrapper.contains(sheet)) {
                    sheet.parentNode.removeChild(sheet);
                  }
                } catch (e) {}
              });
            }
          },
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      const elementToRender = iframeDoc.getElementById("pdf-content-wrapper");

      // Redirect document methods temporarily to isolate html2pdf within the iframe
      const originalCreateElement = document.createElement;
      const originalAppendChild = document.body.appendChild;
      const originalRemoveChild = document.body.removeChild;

      try {
        document.createElement = function (tagName, options) {
          const tag = tagName.toLowerCase();
          // Redirect only rendering tags; bypass 'a' tags so file downloads trigger normally
          if (tag === "div" || tag === "canvas" || tag === "img") {
            return iframeDoc.createElement(tagName, options);
          }
          return originalCreateElement.call(document, tagName, options);
        };
        document.body.appendChild = function (child) {
          if (child && child.ownerDocument === iframeDoc) {
            if (child.tagName && child.tagName.toLowerCase() === "a") {
              return originalAppendChild.call(document.body, child);
            }
            return iframeDoc.body.appendChild(child);
          }
          return originalAppendChild.apply(this, arguments);
        };
        document.body.removeChild = function (child) {
          if (child && child.ownerDocument === iframeDoc) {
            if (child.tagName && child.tagName.toLowerCase() === "a") {
              return originalRemoveChild.call(document.body, child);
            }
            return iframeDoc.body.removeChild(child);
          }
          return originalRemoveChild.apply(this, arguments);
        };

        await html2pdf().from(elementToRender).set(opt).save();
      } finally {
        // Restore original document methods immediately
        document.createElement = originalCreateElement;
        document.body.appendChild = originalAppendChild;
        document.body.removeChild = originalRemoveChild;
      }

      document.body.removeChild(iframe);
      toast.success("PDF downloaded successfully!", { id: toastId });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isParsingMarkdown) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-xs sm:text-sm text-zinc-400 font-medium animate-pulse">
          Sage AI is converting your resume format...
        </p>
      </div>
    );
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
            onClick={
              activeTab === "preview"
                ? handleSaveMarkdown
                : handleSubmit(onSubmit, onInvalid)
            }
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
          <Button
            onClick={generatePDF}
            disabled={isGenerating}
            className="cursor-pointer"
          >
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

      {/* AI Resume Import Banner */}
      <div className="p-5 rounded-2xl border border-dashed border-indigo-500/20 bg-[#09090b]/40 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden mt-2">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="flex items-start gap-3 relative z-10">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 mt-0.5">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              AI Quick Start Import
              <span className="text-[9px] font-mono tracking-widest bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded uppercase">
                gemini-powered
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-xl">
              Upload your existing PDF resume. Sage AI will extract your details
              and automatically pre-fill the form fields for you in seconds.
            </p>
          </div>
        </div>

        <div className="relative z-10 shrink-0">
          {isUploading ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 bg-indigo-500/5 border border-indigo-500/10 px-5 py-2.5 rounded-xl shadow-lg">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
              {uploadProgressText}
            </div>
          ) : (
            <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] text-white text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 border-0">
              <Download className="h-4 w-4 rotate-180" />
              Import from PDF
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handlePDFUpload}
              />
            </label>
          )}
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
          <TabsTrigger
            value="ats"
            className="data-active:bg-white data-active:text-black px-8 transition-all font-semibold text-xs sm:text-sm"
          >
            ATS Scan
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
                  <Label htmlFor="email" className="text-xs sm:text-sm">
                    Email Address
                  </Label>
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
                  <Label htmlFor="mobile" className="text-xs sm:text-sm">
                    Mobile Number
                  </Label>
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
                  <Label htmlFor="linkedin" className="text-xs sm:text-sm">
                    LinkedIn URL
                  </Label>
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
                  <Label htmlFor="twitter" className="text-xs sm:text-sm">
                    Twitter / X Profile
                  </Label>
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
              <h3 className="text-base sm:text-lg font-semibold border-b pb-2">
                Professional Summary
              </h3>
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
                  onClick={() =>
                    handleImprove("summary", "Professional Summary")
                  }
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
              <h3 className="text-base sm:text-lg font-semibold border-b pb-2">
                Skills
              </h3>
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
              <h3 className="text-base sm:text-lg font-semibold border-b pb-2">
                Work Experience
              </h3>
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
              <h3 className="text-base sm:text-lg font-semibold border-b pb-2">
                Education
              </h3>
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
              <h3 className="text-base sm:text-lg font-semibold border-b pb-2">
                Projects
              </h3>
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
          <Button
            variant="link"
            type="button"
            className="mb-2 text-xs sm:text-sm"
            onClick={() =>
              setResumeMode(resumeMode === "preview" ? "edit" : "preview")
            }
          >
            {resumeMode === "preview" ? (
              <>
                <Edit className="h-4 w-4 mr-1" />
                Edit Resume
              </>
            ) : (
              <>
                <Monitor className="h-4 w-4 mr-1" />
                Show Preview
              </>
            )}
          </Button>

          {resumeMode !== "preview" && (
            <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-[10px] sm:text-sm font-medium">
                You will lose edited markdown if you update the form data.
              </span>
            </div>
          )}

          <div className="border rounded-lg max-w-3xl mx-auto overflow-hidden shadow-sm resume-preview-paper">
            <MDEditor
              value={previewContent}
              onChange={setPreviewContent}
              height={800}
              preview={resumeMode}
            />
          </div>
        </TabsContent>
        <TabsContent value="ats" className="mt-6 space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-xl">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                ATS Scanner & Optimization
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Test your resume against a target job description. We will
                verify formatting, keywords, action verbs, and structure.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="ats-jd"
                  className="text-xs font-bold text-zinc-300"
                >
                  Target Job Description (Optional but recommended for keyword
                  match)
                </Label>
                <Textarea
                  id="ats-jd"
                  placeholder="Paste the target job description here..."
                  className="min-h-[150px] resize-none text-xs sm:text-sm bg-background/50 border-zinc-800 focus-visible:ring-indigo-500"
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  disabled={isScanning}
                />
                
                {/* Active Scan Mode Indicator */}
                <div className={`mt-2 p-3 rounded-lg border flex items-start gap-2.5 text-xs transition-colors duration-300 ${activeScanMode.color}`}>
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">{activeScanMode.title}</div>
                    <div className="text-[11px] opacity-80 mt-0.5 leading-relaxed">{activeScanMode.description}</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={handleScan}
                  disabled={isScanning}
                  className="w-full sm:w-auto px-8 h-10 text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg transition-all active:scale-[0.98]"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin text-indigo-200" />
                      Scanning Resume...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Run ATS Scan
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {atsResult && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
              {/* Left Column: Overall Score & Sub-scores */}
              <div className="space-y-6 lg:col-span-1">
                <Card className="border-primary/10 shadow-lg text-center bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                      ATS Match Rating
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 flex flex-col items-center">
                    <div className="relative flex items-center justify-center w-36 h-36">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          className="text-zinc-800"
                          strokeWidth="8"
                          stroke="currentColor"
                          fill="transparent"
                          r="60"
                          cx="72"
                          cy="72"
                        />
                        <circle
                          className={
                            atsResult.totalScore >= 85
                              ? "text-emerald-500"
                              : atsResult.totalScore >= 70
                                ? "text-indigo-500"
                                : atsResult.totalScore >= 55
                                  ? "text-amber-500"
                                  : "text-rose-500"
                          }
                          strokeWidth="8"
                          strokeDasharray={377}
                          strokeDashoffset={
                            377 - (377 * atsResult.totalScore) / 100
                          }
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="60"
                          cx="72"
                          cy="72"
                          style={{
                            transition: "stroke-dashoffset 1s ease-in-out",
                          }}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-4xl font-extrabold text-white">
                          {atsResult.totalScore}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                          Score
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col items-center gap-2 text-center w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400 font-semibold">
                          Letter Grade:
                        </span>
                        <Badge
                          className={`text-sm font-black px-3.5 py-0.5 rounded-full border border-zinc-700 ${
                            atsResult.grade === "A"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : atsResult.grade === "B"
                                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                : atsResult.grade === "C"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {atsResult.grade}
                        </Badge>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5">
                        Mode: {atsResult.scanMode === "targeted" ? "Targeted Match" : "Structural Check"}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/10 shadow-lg">
                  <CardHeader className="pb-3 border-b border-zinc-800">
                    <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-zinc-300">
                      <Award className="h-4 w-4 text-indigo-400" />
                      Score Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-zinc-400">Section Detection</span>
                        <span className="text-zinc-200">
                          {atsResult.breakdown.section}/{atsResult.scanMode === "structural" ? 35 : 25}
                        </span>
                      </div>
                      <Progress
                        value={(atsResult.breakdown.section / (atsResult.scanMode === "structural" ? 35 : 25)) * 100}
                        className="h-1.5 bg-zinc-800"
                        indicatorClassName="bg-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-zinc-400">Keyword Density</span>
                        <span className="text-zinc-200">
                          {atsResult.scanMode === "structural" ? "N/A (0)" : `${atsResult.breakdown.keyword}/35`}
                        </span>
                      </div>
                      <Progress
                        value={atsResult.scanMode === "structural" ? 0 : (atsResult.breakdown.keyword / 35) * 100}
                        className="h-1.5 bg-zinc-800"
                        indicatorClassName="bg-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-zinc-400">Action Verbs</span>
                        <span className="text-zinc-200">
                          {atsResult.breakdown.actionVerb}/{atsResult.scanMode === "structural" ? 30 : 20}
                        </span>
                      </div>
                      <Progress
                        value={(atsResult.breakdown.actionVerb / (atsResult.scanMode === "structural" ? 30 : 20)) * 100}
                        className="h-1.5 bg-zinc-800"
                        indicatorClassName="bg-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-zinc-400">
                          Formatting Quality
                        </span>
                        <span className="text-zinc-200">
                          {atsResult.breakdown.formatting}/{atsResult.scanMode === "structural" ? 35 : 20}
                        </span>
                      </div>
                      <Progress
                        value={(atsResult.breakdown.formatting / (atsResult.scanMode === "structural" ? 35 : 20)) * 100}
                        className="h-1.5 bg-zinc-800"
                        indicatorClassName="bg-indigo-500"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Keyword Match & Warnings */}
              <div className="space-y-6 lg:col-span-2">
                <Card className="border-primary/10 shadow-lg">
                  <CardHeader className="pb-3 border-b border-zinc-800">
                    <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-zinc-300">
                      <Target className="h-4 w-4 text-indigo-400" />
                      Target JD Keywords Matching
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {!atsResult.matchedKeywords.length && !atsResult.missingKeywords.length ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <Target className="h-8 w-8 text-zinc-500/40 mb-2" />
                        <p className="text-xs font-bold text-zinc-400">No Keywords Evaluated</p>
                        <p className="text-[10px] text-zinc-500 mt-1 max-w-xs leading-relaxed">
                          {atsResult.scanMode === "structural" 
                            ? "Currently in Structural Check Mode. Paste a job description to enable keyword scanning."
                            : "Paste a target job description in the Scanner above to calculate matching keywords and unlock the remaining 35 points of the ATS score."}
                        </p>
                      </div>
                    ) : (
                      <>
                        {atsResult.missingKeywords.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs font-bold text-rose-400 flex items-center gap-1">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Missing Keywords ({atsResult.missingKeywords.length})
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {atsResult.missingKeywords
                                .slice(0, 30)
                                .map((kw, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-[10px] bg-rose-500/5 text-rose-300 border-rose-500/10 py-0.5"
                                  >
                                    {kw}
                                  </Badge>
                                ))}
                              {atsResult.missingKeywords.length > 30 && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] bg-zinc-800 text-zinc-400 border-zinc-700 py-0.5"
                                >
                                  +{atsResult.missingKeywords.length - 30} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {atsResult.matchedKeywords.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Matched Keywords ({atsResult.matchedKeywords.length})
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {atsResult.matchedKeywords
                                .slice(0, 30)
                                .map((kw, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-[10px] bg-emerald-500/5 text-emerald-300 border-emerald-500/10 py-0.5"
                                  >
                                    {kw}
                                  </Badge>
                                ))}
                              {atsResult.matchedKeywords.length > 30 && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] bg-zinc-800 text-zinc-400 border-zinc-700 py-0.5"
                                >
                                  +{atsResult.matchedKeywords.length - 30} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {atsResult.weakBullets && atsResult.weakBullets.length > 0 && (
                  <Card className="border-primary/10 shadow-lg">
                    <CardHeader className="pb-3 border-b border-zinc-800">
                      <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-zinc-300">
                        <Sparkles className="h-4 w-4 text-indigo-400" />
                        Action Verbs Analysis ({atsResult.actionVerbBullets}/
                        {atsResult.totalBullets} bullets)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        The following bullet points do not start with a strong
                        action verb. Consider rewriting them to lead with
                        achievements (e.g. "Spearheaded X", "Engineered Y",
                        "Delivered Z").
                      </p>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                        {atsResult.weakBullets.map((bullet, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-lg bg-zinc-800/40 border border-zinc-800 flex items-start gap-2.5 text-xs text-zinc-300"
                          >
                            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <span>"{bullet}"</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="border-primary/10 shadow-lg">
                  <CardHeader className="pb-3 border-b border-zinc-800">
                    <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-zinc-300">
                      <AlertCircle className="h-4 w-4 text-indigo-400" />
                      Formatting & Parsing Checklist
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {atsResult.penalties.length > 0 ? (
                      <div className="space-y-2">
                        {atsResult.penalties.map((penalty, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/10 flex items-center gap-3 text-xs text-rose-300"
                          >
                            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                            <span>{penalty}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3 text-xs text-emerald-300">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                        <div>
                          <div className="font-bold">
                            Perfect ATS Formatting!
                          </div>
                          <div className="text-[10px] text-emerald-400/80 mt-0.5">
                            No tables, long blocks, or missing key attributes
                            found in the text.
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Qualitative Feedback Section */}
              {atsResult.aiFeedback && (
                <div className="col-span-1 lg:col-span-3">
                  <Card className="border-primary/10 shadow-lg">
                    <CardHeader className="pb-3 border-b border-zinc-800">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-zinc-300">
                        <Sparkles className="h-4 w-4 text-indigo-400" />
                        AI-Generated Feedback & Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm text-zinc-300 leading-relaxed space-y-4">
                        <MDEditor.Markdown source={atsResult.aiFeedback} style={{ background: 'transparent' }} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

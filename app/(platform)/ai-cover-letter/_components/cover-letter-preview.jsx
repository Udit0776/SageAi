"use client";

import React, { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/app/components/ui/button";
import { Save, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateCoverLetter } from "@/action/cover-letter";
import useFetch from "@/hooks/use-fetch";

const CoverLetterPreview = ({ id, initialContent }) => {
  const [content, setContent] = useState(initialContent);

  const {
    loading: isSaving,
    fn: saveLetterFn,
    data: savedLetter,
  } = useFetch(updateCoverLetter);

  const handleSave = async () => {
    try {
      await toast.promise(saveLetterFn(id, content), {
        loading: "Saving cover letter...",
        success: "Cover letter saved successfully!",
        error: (err) => err.message || "Failed to save cover letter",
      });
    } catch (error) {
      // Error handled by toast.promise
    }
  };

  const generatePDF = async () => {
    const printWindow = document.createElement('iframe');
    printWindow.style.position = 'fixed';
    printWindow.style.right = '0';
    printWindow.style.bottom = '0';
    printWindow.style.width = '0';
    printWindow.style.height = '0';
    printWindow.style.border = '0';
    document.body.appendChild(printWindow);

    const markdownHtml = `
      <html>
        <head>
          <title>Cover Letter</title>
          <style>
            @page { margin: 20mm; }
            body { 
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              line-height: 1.6;
              color: #111;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              white-space: pre-wrap;
              font-size: 11pt;
            }
            .header { margin-bottom: 30px; }
            .content { text-align: justify; }
          </style>
        </head>
        <body>
          <div class="content">${content.replace(/\n/g, '<br>')}</div>
        </body>
      </html>
    `;

    printWindow.contentDocument.write(markdownHtml);
    printWindow.contentDocument.close();

    printWindow.contentWindow.onload = () => {
      printWindow.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(printWindow);
      }, 1000);
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSave} 
          disabled={isSaving}
          className="text-xs sm:text-sm cursor-pointer"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={generatePDF}
          className="text-xs sm:text-sm cursor-pointer"
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      <div className="border rounded-lg max-w-3xl mx-auto overflow-hidden shadow-sm" data-color-mode="dark">
        <MDEditor 
          value={content} 
          onChange={setContent}
          height={700} 
          className="bg-card"
          preview="edit"
        />
      </div>
    </div>
  );
};

export default CoverLetterPreview;
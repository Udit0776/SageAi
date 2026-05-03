import { getResume } from "@/action/resume";
import ResumeBuilder from "./_components/resume-builder";

export default async function ResumePage() {
  const resume = await getResume();
  
  return (
    <div>
      <ResumeBuilder initialContent={resume?.content} />
    </div>
  );
}
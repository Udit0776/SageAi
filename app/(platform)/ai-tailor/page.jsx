import { getResume } from "@/action/resume";
import TailorForm from "./_components/tailor-form";

export default async function AiTailorPage() {
    const resume = await getResume();

    return (
        <div className="container mx-auto py-6 sm:py-10 px-4 md:px-8">
            <TailorForm initialResume={resume} />
        </div>
    );
}

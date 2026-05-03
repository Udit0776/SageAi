import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { getCoverLetters } from "@/action/cover-letter";
import CoverLetterList from "./_components/cover-letter-list";

export default async function AICoverLetterPage() {
    const coverLetters = await getCoverLetters();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold gradient-title">
                        My Cover Letters
                    </h1>
                    <p className="text-sm mt-2">
                        Manage and view your AI-generated cover letters
                    </p>
                </div>
                <Link href="/ai-cover-letter/new">
                    <Button className="cursor-pointer">
                        <Plus className="h-4 w-4 mr-2" />
                        Create New
                    </Button>
                </Link>
            </div>

            <CoverLetterList coverLetters={coverLetters} />
        </div>
    );
}
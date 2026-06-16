"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";
import { deleteCoverLetter } from "@/action/cover-letter";

export default function CoverLetterList({ coverLetters }) {
    const router = useRouter();

    const handleDelete = async (id) => {
        try {
            await deleteCoverLetter(id);
            toast.success("Cover letter deleted successfully!");
            router.refresh();
        } catch (error) {
            toast.error(error.message || "Failed to delete cover letter");
        }
    };

    if (!coverLetters?.length) {
        return (
            <Card className="bg-card">
                <CardHeader>
                    <CardTitle className="text-sm">No Cover Letters Yet</CardTitle>
                    <CardDescription className="text-sm">
                        Create your first cover letter to get started
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coverLetters.map((letter) => (
                <Card key={letter.id} className="bg-card border-primary/10 hover:border-primary/30 transition-all duration-300">
                    <CardHeader className="p-4">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <CardTitle className="text-base font-bold truncate">
                                    {letter.jobTitle}
                                </CardTitle>
                                <CardDescription className="truncate text-xs">
                                    at {letter.companyName}
                                </CardDescription>
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 cursor-pointer"
                                    onClick={() => router.push(`/ai-cover-letter/${letter.id}`)}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer text-destructive hover:bg-destructive/10">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Cover Letter?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently
                                                delete your cover letter for {letter.jobTitle} at{" "}
                                                {letter.companyName}.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(letter.id)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-muted-foreground text-xs line-clamp-3">
                            {letter.jobDescription}
                        </div>
                        <div className="mt-4 text-[10px] text-muted-foreground">
                            Created {format(new Date(letter.createdAt), "PPP")}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/app/components/ui/dialog";
import { Trophy, Calendar, ExternalLink } from "lucide-react";

export const QuizList = ({ assessments }) => {
    const router = useRouter();
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    return (
        <>
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="text-left">
                        <CardTitle className="gradient-title text-xl font-bold">
                            Recent Quizzes
                        </CardTitle>
                        <CardDescription className="text-xs">Review your past quiz performance</CardDescription>
                    </div>
                    <Button 
                        onClick={() => router.push(`/interview/mock`)} 
                        size="sm"
                        className="px-6 font-semibold shadow-sm"
                    >
                        Start New Quiz
                    </Button>
                </CardHeader>
                <CardContent className="px-2 sm:px-6 pb-6">
                    {assessments?.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {assessments.map((quiz) => (
                                <div 
                                    key={quiz.id} 
                                    className="group relative flex items-center justify-between p-3 rounded-lg border border-primary/5 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer"
                                    onClick={() => setSelectedQuiz(quiz)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                            <Trophy className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-xs">
                                                    Technical Quiz
                                                </h4>
                                                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                                                    {quiz.category}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(quiz.createdAt), "MMM dd, yyyy")}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-[9px] uppercase text-muted-foreground font-bold">Score</p>
                                            <p className="text-sm font-bold text-primary">{quiz.quizScore.toFixed(0)}%</p>
                                        </div>
                                        <div className="hidden sm:block p-1 rounded-full bg-muted group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                            <ExternalLink className="h-3 w-3" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 border-2 border-dashed border-primary/5 rounded-lg">
                            <p className="text-xs text-muted-foreground italic">No quizzes found yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
                <DialogContent className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl gradient-title font-bold">
                            Quiz Review
                        </DialogTitle>
                    </DialogHeader>
                    {selectedQuiz && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10">
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Score</p>
                                    <p className="text-2xl font-bold text-primary">{selectedQuiz.quizScore.toFixed(0)}%</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Date</p>
                                    <p className="text-sm font-medium">{format(new Date(selectedQuiz.createdAt), "MMM dd, yyyy")}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {selectedQuiz.questions.map((q, index) => (
                                    <div key={index} className="p-4 rounded-lg border bg-muted/30 space-y-3">
                                        <div className="flex items-start gap-2">
                                            <div className={`mt-0.5 text-sm ${q.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                                {q.isCorrect ? "✓" : "✕"}
                                            </div>
                                            <p className="font-medium text-xs leading-tight">{q.question}</p>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                                            <div className={`p-1.5 rounded ${q.isCorrect ? 'bg-green-500/5 border border-green-500/10' : 'bg-red-500/5 border border-red-500/10'}`}>
                                                <p className="text-muted-foreground uppercase font-bold mb-0.5">Your Answer</p>
                                                <p className={q.isCorrect ? "text-green-600 font-medium" : "text-red-600 font-medium"}>{q.userAnswer}</p>
                                            </div>
                                            {!q.isCorrect && (
                                                <div className="p-1.5 rounded bg-green-500/5 border border-green-500/10">
                                                    <p className="text-muted-foreground uppercase font-bold mb-0.5">Correct Answer</p>
                                                    <p className="text-green-600 font-medium">{q.answer}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-[10px] p-2 bg-muted rounded border-l border-primary/30">
                                            <p className="text-muted-foreground italic">{q.explanation}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
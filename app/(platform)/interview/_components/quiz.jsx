"use client";

import { generateQuiz, saveQuizResult, getAssessments } from "@/action/interview";
import { computeWeaknessProfile } from "@/lib/quiz-adapter";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import useFetch from "@/hooks/use-fetch";
import { useEffect, useState } from "react";
import { PuffLoader } from "react-spinners";
import { toast } from "sonner";
import { Award, Brain, ArrowLeft, Lightbulb } from "lucide-react";

export const Quiz = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [pastAssessments, setPastAssessments] = useState([]);

    const {
        loading: quizLoading,
        fn: generateQuizFn,
        data: quizData,
    } = useFetch(generateQuiz);

    const {
        loading: savingResult,
        fn: saveQuizResultFn,
        data: resultData,
        setData: setResultData,
    } = useFetch(saveQuizResult);

    // Fetch past assessments on component mount
    const loadPastAssessments = async () => {
        try {
            const data = await getAssessments();
            setPastAssessments(data || []);
        } catch (err) {
            console.error("Failed to load past assessments for analytics:", err);
        }
    };

    useEffect(() => {
        loadPastAssessments();
    }, []);

    useEffect(() => {
        if (quizData?.questions) {
            setAnswers(new Array(quizData.questions.length).fill(null));
        }
    }, [quizData]);

    const handleAnswer = (answer) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = answer;
        setAnswers(newAnswers);
    }

    const handleNext = () => {
        const questionsList = quizData?.questions || [];
        if (currentQuestion < questionsList.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            finishQuiz();
        }
    }

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    }

    const calculateScore = () => {
        let correct = 0;
        const questionsList = quizData?.questions || [];
        answers.forEach((answer, index) => {
            if (answer === questionsList[index]?.correctAnswer) {
                correct++;
            }
        });
        return (correct / (questionsList.length || 1)) * 100;
    }

    const finishQuiz = async () => {
        const score = calculateScore();
        try {
            const questionsList = quizData?.questions || [];
            await saveQuizResultFn(questionsList, answers, score);
            toast.success("Quiz completed!");
            // Refresh past assessments to include this new result
            loadPastAssessments();
        } catch (error) {
            toast.error(error.message || "Failed to save quiz result");
        }
    }

    // Calculate how current results compare to user's past average per topic
    const getTopicComparisons = () => {
        if (!resultData || !pastAssessments || pastAssessments.length === 0) return [];
        
        // 1. Group current quiz questions by topic and get correct counts
        const currentTopicStats = {};
        resultData.questions.forEach(q => {
            const topic = q.category || "other";
            if (!currentTopicStats[topic]) {
                currentTopicStats[topic] = { correct: 0, total: 0 };
            }
            currentTopicStats[topic].total += 1;
            if (q.isCorrect) {
                currentTopicStats[topic].correct += 1;
            }
        });

        // 2. Group past assessments by topic and get correct counts
        const pastTopicStats = {};
        pastAssessments.forEach(assessment => {
            const qs = assessment.questions || [];
            qs.forEach(q => {
                const topic = q.category || "other";
                if (!pastTopicStats[topic]) {
                    pastTopicStats[topic] = { correct: 0, total: 0 };
                }
                pastTopicStats[topic].total += 1;
                if (q.isCorrect) {
                    pastTopicStats[topic].correct += 1;
                }
            });
        });

        // 3. Compare current vs past
        const comparisons = [];
        Object.entries(currentTopicStats).forEach(([topic, current]) => {
            if (topic === "other" || topic === "general") return;
            const currentRate = current.correct / current.total;
            
            const past = pastTopicStats[topic];
            if (past && past.total > 0) {
                const pastRate = past.correct / past.total;
                const diff = Math.round((currentRate - pastRate) * 100);
                
                comparisons.push({
                    topic,
                    diff,
                    currentRate: Math.round(currentRate * 100),
                    pastRate: Math.round(pastRate * 100),
                });
            }
        });

        return comparisons;
    };

    if (quizLoading || savingResult) {
        return (
            <div className="flex justify-center items-center h-[200px]">
                <PuffLoader color="white" />
            </div>
        );
    }

    if (resultData) {
        const comparisons = getTopicComparisons();
        const questionsList = quizData?.questions || [];

        return (
            <div className="mx-2 space-y-6">
                <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold gradient-title">Quiz Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center justify-center p-6 bg-primary/5 rounded-xl border border-primary/10">
                            <div className="text-5xl font-bold text-primary mb-2">
                                {resultData.quizScore.toFixed(0)}%
                            </div>
                            <div className="text-muted-foreground">
                                You got {Math.round((resultData.quizScore / 100) * questionsList.length)} out of {questionsList.length} questions correct
                            </div>
                        </div>

                        {/* Performance comparison vs past averages */}
                        {comparisons.length > 0 && (
                            <div className="p-4 bg-muted/30 rounded-lg border border-primary/10 space-y-3">
                                <p className="font-bold text-sm flex items-center gap-2 text-foreground">
                                    <Award className="h-4 w-4 text-primary" /> Performance Insights:
                                </p>
                                <div className="space-y-2 mt-1">
                                    {comparisons.map((c) => (
                                        <div key={c.topic} className="flex justify-between items-center text-xs">
                                            <span className="capitalize font-semibold text-muted-foreground">{c.topic}</span>
                                            <span className={`font-bold ${c.diff > 0 ? "text-green-500" : c.diff < 0 ? "text-red-500" : "text-yellow-500"}`}>
                                                {c.diff > 0 
                                                    ? `You improved (+${c.diff}% vs your average)` 
                                                    : c.diff < 0 
                                                    ? `Practice needed (${c.diff}% vs your average)` 
                                                    : `Matched your average (${c.currentRate}%)`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {resultData.improvementTip && (
                            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                                <p className="font-semibold mb-2 flex items-center gap-2">
                                    <span className="text-lg">💡</span> Improvement Tip:
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed">{resultData.improvementTip}</p>
                            </div>
                        )}

                        <div className="space-y-8">
                            <h3 className="font-semibold text-lg border-b pb-2">Question Review</h3>
                            {resultData.questions.map((q, index) => (
                                <div key={index} className="p-6 rounded-lg border bg-muted/30 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1 p-1 rounded-full ${q.isCorrect ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                            {q.isCorrect ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm leading-snug">{q.question}</p>
                                            {q.category && q.category !== "other" && (
                                                <Badge className="bg-primary/10 text-primary border-none text-[9px] mt-1 capitalize">
                                                    {q.category} • {q.difficulty || "medium"}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                        <div className={`p-2 rounded ${q.isCorrect ? 'bg-green-500/5 border border-green-500/10' : 'bg-red-500/5 border border-red-500/10'}`}>
                                            <p className="text-muted-foreground mb-1 uppercase font-bold tracking-wider">Your Answer</p>
                                            <p className={q.isCorrect ? "text-green-600 font-medium" : "text-red-600 font-medium"}>{q.userAnswer}</p>
                                        </div>
                                        {!q.isCorrect && (
                                            <div className="p-2 rounded bg-green-500/5 border border-green-500/10">
                                                <p className="text-muted-foreground mb-1 uppercase font-bold tracking-wider">Correct Answer</p>
                                                <p className="text-green-600 font-medium">{q.answer}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-xs p-3 bg-muted rounded border-l-2 border-primary/30">
                                        <p className="text-muted-foreground">{q.explanation}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <Button onClick={() => {
                            setResultData(null);
                            generateQuizFn();
                            setCurrentQuestion(0);
                            setAnswers([]);
                        }} className="px-10 py-4 text-base font-semibold shadow-md">
                            Retake Technical Quiz
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (!quizData) {
        const weaknessProfile = computeWeaknessProfile(pastAssessments);
        const isPersonalized = pastAssessments.length >= 3;
        const focusList = weaknessProfile.filter(w => w.priority === "focus").map(w => w.topic);
        const reviewList = weaknessProfile.filter(w => w.priority === "review").map(w => w.topic);

        return (
            <Card className="mx-2">
                <CardHeader>
                    <CardTitle>
                        Ready to test your knowledge?
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Personalized difficulty badge and topic breakdown */}
                    {isPersonalized && (
                        <div className="flex flex-col gap-2.5 p-4 bg-primary/10 border border-primary/20 rounded-xl text-left">
                            <div className="flex items-center gap-2">
                                <Badge className="bg-primary text-white hover:bg-primary/95 border-none text-[10px] px-2 py-0.5 font-bold">
                                    Personalised for you
                                </Badge>
                                <span className="text-[10px] text-muted-foreground font-semibold">
                                    Based on your last {pastAssessments.length} attempts
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Focusing on: <span className="text-primary font-bold capitalize">{(focusList.slice(0, 2).join(", ") || "various topics")}</span>
                                {" | "}
                                Reviewing: <span className="text-primary font-bold capitalize">{(reviewList.slice(0, 1).join(", ") || "various topics")}</span>
                            </p>
                        </div>
                    )}
                    <p className="text-muted-foreground text-left text-xs sm:text-sm">
                        This quiz contains 10 questions that will help you prepare for your target role. 
                        {isPersonalized 
                          ? " We have adjusted the question difficulties and topic distributions based on your past performance profile." 
                          : " These questions are tailored to your target industry and skills."} Take your time and choose the best answer for each.
                    </p>
                </CardContent>
                <CardFooter className="justify-center">
                    <Button
                        onClick={generateQuizFn}
                        disabled={quizLoading}
                    >
                        {quizLoading ? "Generating Quiz..." : "Start Quiz"}
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    const questionsList = quizData?.questions || [];
    const question = questionsList[currentQuestion];

    return (
        <Card className="mx-2 mb-4">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg">
                        Question {currentQuestion + 1} of {questionsList.length}
                    </CardTitle>
                    {question?.category && question?.category !== "other" && (
                        <Badge className="capitalize font-bold bg-primary/15 text-primary border-none">
                            {question.category} ({question.difficulty || "medium"})
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-base font-medium leading-relaxed text-left">
                    {question?.question}
                </p>

                <RadioGroup className="space-y-3 text-left" onValueChange={handleAnswer} value={answers[currentQuestion]}>
                    {question?.options?.map((option, index) => (
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer" key={index}>
                            <RadioGroupItem
                                value={option}
                                id={`option-${index}`}
                            />
                            <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-sm font-normal text-foreground">
                                {option}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>

            </CardContent>
            <CardFooter className="flex justify-between gap-2">
                <Button
                    onClick={handlePrevious}
                    variant="outline"
                    disabled={currentQuestion === 0}
                    className="flex-grow sm:flex-none"
                >
                    Previous
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={!answers[currentQuestion] || savingResult}
                    className="flex-grow sm:flex-none"
                >
                    {savingResult ? "Saving..." : currentQuestion < questionsList.length - 1 ? "Next" : "Finish Quiz"}
                </Button>
            </CardFooter>
        </Card>
    )
}
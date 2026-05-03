"use client";

import { generateQuiz, saveQuizResult } from "@/action/interview";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Label } from "@/app/components/ui/label";
import useFetch from "@/hooks/use-fetch";
import { useEffect, useState } from "react";
import { PuffLoader } from "react-spinners";
import { toast } from "sonner";

export const Quiz = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [showExplanation, setShowExplanation] = useState(false);

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

    useEffect(() => {
        if (quizData) {
            setAnswers(new Array(quizData?.length).fill(null));
        }
    }, [quizData]);

    const handleAnswer = (answer) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = answer;
        setAnswers(newAnswers);
    }

    const handleNext = () => {
        if (currentQuestion < quizData.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setShowExplanation(false);
        } else {
            finishQuiz();
        }
    }

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            setShowExplanation(false);
        }
    }


    // from video
    const calculateScore = () => {
        let correct = 0;
        answers.forEach((answer, index) => {
            if (answer === quizData[index].correctAnswer) {
                correct++;
            }
        });
        return (correct / quizData?.length) * 100;
    }

    const finishQuiz = async () => {
        const score = calculateScore();
        try {
            await saveQuizResultFn(quizData, answers, score);
            toast.success("Quiz completed!");
        } catch (error) {
            toast.error(error.message || "Failed to save quiz result");
        }
    }

    // const finishQuiz = async () => {
    //     const score = answers.reduce((acc, curr, index) => {
    //         if (curr === quizData[index].correctAnswer) {
    //             return acc + 1;
    //         }
    //         return acc;
    //     }, 0);

    //     try {
    //         await saveQuizResultFn(quizData, answers, score);
    //         toast.success("Quiz completed!");
    //     } catch (error) {
    //         toast.error(error.message || "Failed to save quiz result");
    //     }
    // }

    if (quizLoading || savingResult) {
        return (
            <div className="flex justify-center items-center h-[200px]">
                <PuffLoader color="white" />
            </div>
        );
    }

    if (resultData) {
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
                                You got {Math.round((resultData.quizScore / 100) * quizData.length)} out of {quizData.length} questions correct
                            </div>
                        </div>

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
                                        <p className="font-medium text-sm leading-snug">{q.question}</p>
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
                            setShowExplanation(false);
                        }} className="px-10 py-4 text-base font-semibold shadow-md">
                            Retake Technical Quiz
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (!quizData) {
        return (
            <Card className="mx-2">
                <CardHeader>
                    <CardTitle>
                        Ready to test your knowledge?
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This quiz contains 10 questions that will help you prepare for your next interview. These questions are tailored to your specific industry and roles you're targeting. Take your time and choose the best answer for each question.
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

    const question = quizData[currentQuestion];

    return (
        <Card className="mx-2 mb-4">
            <CardHeader>
                <CardTitle>
                    Question {currentQuestion + 1} of {quizData?.length}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-base font-medium leading-relaxed">
                    {question?.question}
                </p>

                <RadioGroup className="space-y-3" onValueChange={handleAnswer} value={answers[currentQuestion]}>
                    {question?.options?.map((option, index) => (
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer" key={index}>
                            <RadioGroupItem
                                value={option}
                                id={`option-${index}`}
                            />
                            <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-sm font-normal">
                                {option}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>

                {showExplanation && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                        <p className="font-medium text-primary mb-1">Explanation:</p>
                        <p className="text-sm text-muted-foreground">{question?.explanation}</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
                {!showExplanation && (
                    <Button
                        variant="outline"
                        onClick={() => setShowExplanation(true)}
                        disabled={!answers[currentQuestion]}
                        className="w-full sm:w-auto"
                    >
                        Show Explanation
                    </Button>
                )}
                <div className="flex justify-between sm:justify-end gap-2 w-full">
                    <Button
                        onClick={handlePrevious}
                        variant="outline"
                        disabled={currentQuestion === 0}
                        className="flex-1 sm:flex-none"
                    >
                        Previous
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={!answers[currentQuestion] || savingResult}
                        className="flex-1 sm:flex-none"
                    >
                        {savingResult ? "Saving..." : currentQuestion < quizData.length - 1 ? "Next" : "Finish Quiz"}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}
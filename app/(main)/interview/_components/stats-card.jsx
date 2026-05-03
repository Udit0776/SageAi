import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Brain, Trophy, CheckCircle2 } from "lucide-react";

export const StatsCards = ({ assessments }) => {
    const getAverageScore = () => {
        if (!assessments?.length) return 0;

        const total = assessments.reduce((sum, assessment) => sum + assessment.quizScore, 0);
        return (total / assessments.length).toFixed(1);
    };

    const getLatestAssessment = () => {
        if (!assessments || !assessments.length) return null;
        return assessments[0];
    }

    const getTotalQuestions = () => {
        if (!assessments?.length) return 0;
        return assessments.reduce((sum, assessment) => sum + assessment.questions.length, 0);
    };

    const latestAssessment = getLatestAssessment();
    const averageScore = getAverageScore();
    const totalQuestions = getTotalQuestions();

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                        Average Score
                    </CardTitle>
                    <Trophy className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-1">
                        <div className="text-2xl font-bold tracking-tight text-primary">
                            {averageScore}%
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Across all assessments
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                        Questions Practiced
                    </CardTitle>
                    <Brain className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-1">
                        <div className="text-2xl font-bold tracking-tight text-primary">
                            {totalQuestions}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Total Questions Attempted
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                        Latest Score
                    </CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-1">
                        <div className="text-2xl font-bold tracking-tight text-primary">
                            {latestAssessment ? `${latestAssessment.quizScore.toFixed(1)}%` : "0%"}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {latestAssessment 
                                ? `as of ${new Date(latestAssessment.createdAt).toLocaleDateString()}` 
                                : "No assessments yet"
                            }
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
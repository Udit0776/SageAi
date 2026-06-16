import { improveWithAI } from "@/action/resume";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { entrySchema } from "@/app/lib/schema";
import useFetch from "@/hooks/use-fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import parse from "date-fns/parse";
import format from "date-fns/format";

const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const date = parse(dateString, "yyyy-MM", new Date());
    return format(date, "MMM yyyy")
}

export default function EntryForm({ type, entries, onChange }) {
    const [isAdding, setIsAdding] = useState(false);

    const {
        register,
        handleSubmit: handleValidation,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm({
        resolver: zodResolver(entrySchema),
        defaultValues: {
            title: "",
            organization: "",
            startDate: "",
            endDate: "",
            description: "",
            current: false,
        }
    })

    const current = watch("current");

    const {
        loading: isImproving,
        fn: improveWithAIFn,
        data: improvedContent,
        error: improveError,
    } = useFetch(improveWithAI);

    const handleAdd = handleValidation((data) => {
        const newEntries = [...entries, data];
        onChange(newEntries);
        reset();
        setIsAdding(false);
    });

    // const handleDelete = (index) => {
    //     const newEntries = entries.filter((_, i) => i !== index);
    //     onChange(newEntries);
    // }

    // const handleAdd = handleValidation((data) => {
    //     const formattedEntry = {
    //         ...data,
    //         startDate: formatDisplayDate(data.startDate),
    //         endDate: data.current ? "" : formatDisplayDate(data.endDate),
    //     }
    //     onChange([...entries, formattedEntry]);
    //     reset();
    //     setIsAdding(false);
    // })

    const handleImprove = async () => {
        const description = watch("description");
        if (!description) {
            toast.error("Please enter a description first");
            return;
        }

        try {
            const result = await improveWithAIFn({
                current: description,
                type: type.toLowerCase(),
            });
            if (result) {
                setValue("description", result);
                toast.success("Description improved with AI!");
            }
        } catch (error) {
            toast.error(error.message || "Failed to improve description");
        }
    };

    return (
        <div className="space-y-4">
            {entries.length > 0 && (
                <div className="space-y-4">
                    {entries.map((item, index) => (
                        <Card key={index} className="bg-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {item.title} @ {item.organization}
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onChange(entries.filter((_, i) => i !== index))}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">
                                    {formatDisplayDate(item.startDate)} - {item.current ? "Present" : formatDisplayDate(item.endDate)}
                                </p>
                                <p className="mt-2 text-sm whitespace-pre-wrap">{item.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {isAdding && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm sm:text-base">Add {type}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Input
                                    placeholder="Title/Position"
                                    {...register("title")}
                                    error={errors.title}
                                    className="text-xs sm:text-sm"
                                />
                                {errors.title && (
                                    <p className="text-xs text-red-500">{errors.title.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Input
                                    placeholder="Organization/Company"
                                    {...register("organization")}
                                    error={errors.organization}
                                    className="text-xs sm:text-sm"
                                />
                                {errors.organization && (
                                    <p className="text-xs text-red-500">{errors.organization.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Input
                                    type="month"
                                    {...register("startDate")}
                                    error={errors.startDate}
                                    className="text-xs sm:text-sm"
                                />
                                {errors.startDate && (
                                    <p className="text-xs text-red-500">{errors.startDate.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className={current ? "cursor-not-allowed" : ""}>
                                    <Input
                                        type="month"
                                        {...register("endDate")}
                                        disabled={current}
                                        className={cn(
                                            "text-xs sm:text-sm",
                                            current ? "pointer-events-none opacity-50" : ""
                                        )}
                                        error={errors.endDate}
                                    />
                                </div>
                                {errors.endDate && (
                                    <p className="text-xs text-red-500">{errors.endDate.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="current"
                                className="h-3 w-3 sm:h-4 sm:w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                                {...register("current")}
                                onChange={(e) => {
                                    setValue("current", e.target.checked);
                                    if (e.target.checked) {
                                        setValue("endDate", "");
                                    }
                                }}
                            />
                            <label
                                htmlFor="current"
                                className="text-xs sm:text-sm font-medium cursor-pointer text-muted-foreground"
                            >
                                Current {type}
                            </label>
                        </div>

                        <div className="space-y-2 mt-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                <label className="text-xs sm:text-sm font-medium">Description</label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-8 mb-1 sm:mb-0"
                                    onClick={handleImprove}
                                    disabled={isImproving || !watch("description")}
                                >
                                    {isImproving ? (
                                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1" />
                                    ) : (
                                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    )}
                                    Improve with AI
                                </Button>
                            </div>
                            <Textarea
                                placeholder={`Description of your ${type.toLowerCase()}`}
                                className="h-32 text-xs sm:text-sm"
                                {...register("description")}
                                error={errors.description}
                            />
                            {errors.description && (
                                <p className="text-xs text-red-500">{errors.description.message}</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 px-4 pb-4 sm:px-6 sm:pb-6">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs sm:text-sm"
                            onClick={() => {
                                setIsAdding(false);
                                reset();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            className="text-xs sm:text-sm"
                            onClick={handleAdd}
                        >
                            Add {type}
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {!isAdding && (
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                        onClick={() => setIsAdding(true)}
                    >
                        <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> Add {type}
                    </Button>
                </div>
            )}
        </div>
    );
}

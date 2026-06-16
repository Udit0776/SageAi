"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema } from '@/app/lib/schema';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';
import { updateUser } from '@/action/user';
import { Loader2, Sparkles, Brain, Briefcase, User, ChevronLeft, ChevronRight, X, Cpu } from 'lucide-react';
import useFetch from '@/hooks/use-fetch';
import { toast } from 'sonner';
import InteractiveNeuralNetwork from "@/app/components/interactive-neural-network";

const steps = [
    { id: 1, title: "Career Path", description: "Choose your primary industry and focus", icon: Briefcase },
    { id: 2, title: "Core Expertise", description: "Define your skills and experience level", icon: Brain },
    { id: 3, title: "Elevator Pitch", description: "Introduce yourself to the platform", icon: User }
];

const bioTemplates = [
    {
        title: "Developer",
        text: "Full-Stack Engineer with a passion for building scalable, high-performance web applications and design systems. Skilled in React, Next.js, and cloud architecture."
    },
    {
        title: "Designer",
        text: "UX/UI Designer dedicated to creating elegant, user-centric interfaces. Strong expertise in wireframing, prototyping, user research, and collaborative design cycles."
    },
    {
        title: "Product Manager",
        text: "Product Leader with 4+ years of experience leading cross-functional teams, defining product roadmaps, and delivering high-value business features."
    },
    {
        title: "Data Analyst",
        text: "Data Scientist skilled in Python machine learning models, statistical analysis, and data visualization. Passionate about driving business growth with data insights."
    }
];

export default function OnboardingForm({ industries }) {
    const [step, setStep] = useState(1);
    const [selectedIndustry, setSelectedIndustry] = useState(null);
    const [skillsList, setSkillsList] = useState([]);
    const [skillInput, setSkillInput] = useState("");
    const router = useRouter();

    const { loading: updateLoading, fn: updateUserFn, data: updateResult } = useFetch(updateUser);

    const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = useForm({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            industry: "",
            subIndustry: "",
            experience: "",
            skills: "",
            bio: ""
        }
    });

    const watchIndustry = watch("industry");
    const watchExperience = watch("experience");
    const watchBio = watch("bio");

    // Sync selected industry details when dropdown selection changes
    useEffect(() => {
        if (watchIndustry && industries) {
            const found = industries.find((ind) => ind.id === watchIndustry);
            setSelectedIndustry(found || null);
        }
    }, [watchIndustry, industries]);

    // Sync skillsList state changes to React Hook Form field
    useEffect(() => {
        setValue("skills", skillsList.join(", "), { shouldValidate: step === 2 });
    }, [skillsList, setValue, step]);

    // On form submit, format industry string and call the server action
    const onSubmit = async (values) => {
        try {
            const formattedIndustry = `${values.industry} - ${values.subIndustry.toLowerCase().replace(/ /g, "_")}`;
            await updateUserFn({
                ...values,
                industry: formattedIndustry,
            });
        } catch (error) {
            console.error("Submission failed:", error);
        }
    };

    // Redirect to dashboard on successful database write
    useEffect(() => {
        if (updateResult?.success && !updateLoading) {
            toast.success("Profile updated successfully!");
            router.push("/dashboard");
        } else if (updateResult?.success === false) {
            toast.error(updateResult.error || "Failed to update profile");
        }
    }, [updateResult, updateLoading, router]);

    // Skill tags helpers
    const addSkill = (skill) => {
        const skillsToAdd = skill
            .split(",")
            .map(s => s.trim())
            .filter(s => s && !skillsList.includes(s));

        if (skillsToAdd.length > 0) {
            setSkillsList([...skillsList, ...skillsToAdd]);
        }
        setSkillInput("");
    };

    const removeSkill = (indexToRemove) => {
        setSkillsList(skillsList.filter((_, i) => i !== indexToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addSkill(skillInput);
        }
    };

    const handleFormKeyDown = (e) => {
        if (e.key === "Enter") {
            const target = e.target;
            // Let the textarea and skills inputs handle Enter natively or with their handlers
            if (target.tagName === "TEXTAREA" || target.id === "skills-input") {
                return;
            }
            e.preventDefault();
        }
    };

    // Step navigation helpers
    const handleNext = async () => {
        let fieldsToValidate = [];
        if (step === 1) {
            fieldsToValidate = ["industry", "subIndustry"];
        } else if (step === 2) {
            fieldsToValidate = ["experience", "skills"];
        }

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setStep(prev => Math.min(prev + 1, 3));
        } else {
            toast.error("Please fill out the required fields correctly.");
        }
    };

    const handleBack = () => {
        setStep(prev => Math.max(prev - 1, 1));
    };

    // Get description of career level based on experience
    const getExperienceLabel = (exp) => {
        if (!exp && exp !== 0) return "";
        const num = parseInt(exp, 10);
        if (isNaN(num)) return "";
        if (num <= 1) return "Entry-Level (0-1 yrs)";
        if (num <= 3) return "Junior-Mid Level (2-3 yrs)";
        if (num <= 5) return "Mid-Career (4-5 yrs)";
        if (num <= 8) return "Senior Expert (6-8 yrs)";
        return "Executive / Lead (9+ yrs)";
    };

    const progressPercent = (step / 3) * 100;

    return (
        <div className='flex flex-col md:flex-row gap-6 lg:gap-8 flex-1 md:h-[calc(100vh-5rem)] bg-transparent overflow-hidden w-full max-w-7xl mx-auto px-4 md:px-8 pt-4 pb-8'>
            
            {/* Left Column (Desktop Visual Dashboard) */}
            <div className='w-[360px] lg:w-[420px] hidden md:flex flex-col justify-between p-8 bg-[#09090b]/40 border border-white/5 rounded-2xl relative overflow-hidden select-none shrink-0 h-full shadow-2xl backdrop-blur-md'>
                {/* Canvas background element */}
                <InteractiveNeuralNetwork />

                {/* Ambient glow backgrounds */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[90px] pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-8">
                            <span className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">S</span>
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">Sage AI // Core</span>
                        </div>

                        <h1 className="text-xl font-extrabold tracking-tight text-white mb-3 leading-tight">
                            Setup your career vectors
                        </h1>
                        <p className="text-[11px] text-zinc-400 leading-relaxed mb-8">
                            Sage AI coordinates your industry metrics, skillset mapping, and profile insights to customize interview coaching, application tracking, and resume alignment.
                        </p>

                        {/* Step Timeline Indicator Container */}
                        <div className="relative p-5 rounded-xl border border-white/5 bg-white/[0.01] backdrop-blur-md shadow-2xl overflow-hidden">
                            {/* Vertical connecting line */}
                            <div className="absolute left-[34px] top-6 bottom-6 w-[2px] bg-zinc-900 z-0">
                                <div 
                                    className="w-full bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 origin-top shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                                    style={{ height: `${((step - 1) / 2) * 100}%` }}
                                />
                            </div>

                            <div className="space-y-10 relative z-10">
                                {steps.map((s) => {
                                    const Icon = s.icon;
                                    const isActive = step === s.id;
                                    const isCompleted = step > s.id;
                                    
                                    return (
                                        <div key={s.id} className="relative flex items-center gap-4 transition-all duration-300">
                                            {/* Step Bullet */}
                                            <div className={`h-7 w-7 rounded-full flex items-center justify-center border transition-all duration-300 z-10 bg-zinc-950 shrink-0 ${
                                                isActive 
                                                    ? "border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.6)] bg-indigo-950/30 ring-2 ring-indigo-500/20" 
                                                    : isCompleted 
                                                        ? "border-indigo-600 bg-indigo-600 text-white" 
                                                        : "border-zinc-800 text-zinc-500"
                                            }`}>
                                                {isCompleted ? (
                                                    <span className="text-[10px] font-bold">✓</span>
                                                ) : (
                                                    <span className="text-[10px] font-bold font-mono">{s.id}</span>
                                                )}
                                            </div>

                                            <div className="flex gap-3 items-center">
                                                <div className={`p-1.5 rounded-lg transition-colors duration-300 shrink-0 ${
                                                    isActive ? "bg-indigo-600/15 text-indigo-400" : isCompleted ? "bg-indigo-950/20 text-indigo-500/60" : "bg-zinc-900/50 text-zinc-700"
                                                }`}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`text-[12px] font-bold transition-colors duration-300 ${
                                                            isActive ? "text-white animate-pulse" : isCompleted ? "text-zinc-400" : "text-zinc-500"
                                                        }`}>
                                                            {s.title}
                                                        </span>
                                                        {isActive && (
                                                            <span className="text-[7px] font-mono font-bold tracking-widest text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded uppercase animate-pulse border border-indigo-500/20">active</span>
                                                        )}
                                                        {isCompleted && (
                                                            <span className="text-[7px] font-mono font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded uppercase border border-emerald-500/20">done</span>
                                                        )}
                                                    </div>
                                                    <span className={`text-[9.5px] transition-colors duration-300 mt-0.5 leading-normal ${
                                                        isActive ? "text-zinc-400" : isCompleted ? "text-zinc-500" : "text-zinc-700"
                                                    }`}>
                                                        {s.description}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="text-[9px] text-zinc-500 font-mono tracking-wider flex items-center gap-1.5 mt-8 border-t border-white/5 pt-4">
                        <Cpu className="h-3 w-3 text-indigo-500/40" />
                        SYSTEM: CONTEXT_ACTIVE // TLS_1.3 // SECURE
                    </div>
                </div>
            </div>

            {/* Right Column (Interactive Wizard Card Container) */}
            <div className='flex-1 flex flex-col justify-center items-center p-4 md:p-8 bg-transparent overflow-y-auto relative h-full w-full'>
                {/* Glow rings */}
                <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Gradient Border Card Wrapper */}
                <div className="relative p-[1px] rounded-2xl bg-gradient-to-b from-indigo-500/30 via-white/[0.04] to-transparent shadow-[0_0_80px_-20px_rgba(99,102,241,0.2)] w-full max-w-2xl h-full md:h-auto">
                    <div className='bg-[#09090b]/90 backdrop-blur-2xl p-6 sm:p-8 rounded-2xl w-full h-full relative overflow-hidden'>
                        
                        {/* Header Progress Indicators */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2 text-xs font-semibold text-zinc-400">
                                <span className="text-[10px] font-mono tracking-wider text-indigo-400 uppercase">Step {step} of 3</span>
                                <span className="text-[10px] font-mono tracking-wider uppercase">{Math.round(progressPercent)}% Complete</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden relative">
                                <div 
                                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleFormKeyDown} className="space-y-5">
                            
                            {/* STEP 1: CAREER IDENTITY */}
                            {step === 1 && (
                                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div>
                                        <h2 className="text-base font-bold text-white">Choose your career track</h2>
                                        <p className="text-[11px] text-zinc-400 mt-1">This configures market analytics and AI models for your specific industry.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor='industry' className="text-zinc-300 font-medium text-xs">Industry</Label>
                                        <Select 
                                            onValueChange={(value) => {
                                                setValue("industry", value, { shouldValidate: true });
                                                setValue("subIndustry", "");
                                            }} 
                                            value={watchIndustry}
                                        >
                                            <SelectTrigger id='industry' className="bg-white/[0.02] border-white/10 hover:bg-white/[0.04] focus:border-indigo-500/50 transition-colors h-10 text-white text-xs">
                                                <SelectValue placeholder="Select an Industry" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-950 border-white/10 text-zinc-200">
                                                <SelectGroup>
                                                    {industries?.map((ind) => (
                                                        <SelectItem key={ind.id} value={ind.id} className="focus:bg-indigo-650 focus:text-white cursor-pointer text-xs">{ind.name}</SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {errors.industry && (
                                            <p className='text-xs text-red-500 mt-1'>{errors.industry.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor='subIndustry' className="text-zinc-300 font-medium text-xs">Specialization</Label>
                                        <Select 
                                            disabled={!watchIndustry}
                                            onValueChange={(value) => {
                                                setValue("subIndustry", value, { shouldValidate: true });
                                            }} 
                                            value={watch("subIndustry")}
                                        >
                                            <SelectTrigger id='subIndustry' className="bg-white/[0.02] border-white/10 hover:bg-white/[0.04] disabled:opacity-40 transition-colors h-10 text-white text-xs">
                                                <SelectValue placeholder={watchIndustry ? "Select a Specialization" : "Choose an industry first"} />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-950 border-white/10 text-zinc-200">
                                                <SelectGroup>
                                                    {selectedIndustry?.subIndustries?.map((ind) => (
                                                        <SelectItem key={ind} value={ind} className="focus:bg-indigo-650 focus:text-white cursor-pointer text-xs">{ind}</SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {errors.subIndustry && (
                                            <p className='text-xs text-red-500 mt-1'>{errors.subIndustry.message}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: EXPERIENCE & SKILLS */}
                            {step === 2 && (
                                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div>
                                        <h2 className="text-base font-bold text-white">Define your expertise</h2>
                                        <p className="text-[11px] text-zinc-400 mt-1">Provide your experience levels and the technology stacks you work with.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor='experience' className="text-zinc-300 font-medium text-xs">Years of Experience</Label>
                                            {watchExperience !== undefined && watchExperience !== "" && (
                                                <span className="text-[9.5px] font-mono font-bold tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                                                    {getExperienceLabel(watchExperience)}
                                                </span>
                                            )}
                                        </div>
                                        <Input
                                            id="experience"
                                            type="number"
                                            min="0"
                                            max="50"
                                            placeholder="Enter years of experience"
                                            className="bg-white/[0.02] border-white/10 hover:bg-white/[0.04] focus:border-indigo-500/50 transition-all h-10 text-white text-xs"
                                            {...register("experience")}
                                            onWheel={(e) => e.target.blur()} 
                                        />
                                        {errors.experience && (
                                            <p className='text-xs text-red-500 mt-1'>{errors.experience.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor='skills' className="text-zinc-300 font-medium text-xs">Core Skills</Label>
                                        <div className="flex flex-wrap gap-1.5 p-2 bg-white/[0.02] border border-white/10 rounded-lg min-h-[44px] focus-within:border-indigo-500/50 transition-colors">
                                            {skillsList.map((skill, index) => (
                                                <span key={index} className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 transition-colors">
                                                    {skill}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSkill(index)}
                                                        className="hover:text-red-400 focus:outline-none cursor-pointer"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                            <input
                                                id="skills-input"
                                                type="text"
                                                placeholder={skillsList.length === 0 ? "Type skill + press Enter/Comma..." : "Add skill..."}
                                                value={skillInput}
                                                onChange={(e) => setSkillInput(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                className="flex-1 min-w-[120px] bg-transparent border-0 outline-none text-xs text-white placeholder-zinc-500 py-0.5"
                                            />
                                        </div>
                                        <p className="text-[10px] text-zinc-550">Separate multiple skills with Enter or commas.</p>
                                        <input type="hidden" {...register("skills")} />
                                        {errors.skills && (
                                            <p className='text-xs text-red-500 mt-1'>{errors.skills.message}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: ELEVATOR PITCH */}
                            {step === 3 && (
                                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div>
                                        <h2 className="text-base font-bold text-white">Your professional pitch</h2>
                                        <p className="text-[11px] text-zinc-400 mt-1">Briefly sum up your focus, achievements, and career aspirations.</p>
                                    </div>                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor='bio' className="text-zinc-300 font-medium text-xs">Professional Summary</Label>
                                            <span className={`text-[10px] font-mono ${(watchBio?.length || 0) > 480 ? "text-red-400" : "text-zinc-500"}`}>
                                                {watchBio?.length || 0} / 500
                                            </span>
                                        </div>
                                        <Textarea
                                            id="bio"
                                            placeholder="Tell us about your professional background..."
                                            className="h-32 bg-white/[0.02] border-white/10 hover:bg-white/[0.04] focus:border-indigo-500/50 transition-all text-white text-xs resize-none"
                                            {...register("bio")} 
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.stopPropagation();
                                                }
                                            }}
                                        />
                                        {errors.bio && (
                                            <p className='text-xs text-red-500 mt-1'>{errors.bio.message}</p>
                                        )}
                                    </div>

                                    {/* Starter Prompts */}
                                    <div className="space-y-2">
                                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Bio Templates</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {bioTemplates.map((template, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => {
                                                        setValue("bio", template.text, { shouldValidate: true });
                                                    }}
                                                    className="inline-flex items-center text-[10px] font-semibold px-2 py-1 rounded bg-zinc-900 border border-white/5 hover:border-indigo-500/30 text-zinc-400 hover:text-white transition-all cursor-pointer"
                                                >
                                                    <Sparkles className="h-2.5 w-2.5 mr-1 text-indigo-400" />
                                                    {template.title}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Footer Buttons */}
                            <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-8">
                                {step > 1 ? (
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={handleBack}
                                        className="border-white/5 hover:bg-white/5 text-zinc-300 hover:text-white flex items-center gap-1.5 px-4 h-9 cursor-pointer transition-all active:scale-95 text-xs"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Back
                                    </Button>
                                ) : (
                                    <div /> // spacer
                                )}

                                {step < 3 ? (
                                    <Button
                                        type="button"
                                        onClick={handleNext}
                                        className="bg-indigo-600 hover:bg-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] text-white font-semibold flex items-center gap-1.5 px-5 h-9 cursor-pointer transition-all active:scale-95 border-0 text-xs"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={updateLoading}
                                        className="bg-indigo-600 hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] text-white font-bold flex items-center justify-center gap-2 px-6 h-10 cursor-pointer transition-all active:scale-95 border-0 text-xs"
                                    >
                                        {updateLoading ? (
                                            <>
                                                <Loader2 className='h-4 w-4 animate-spin' />
                                                Saving profile...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-4 w-4 text-white" />
                                                Complete Profile
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    );
}
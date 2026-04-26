"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema } from '@/app/lib/schema';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';
import { updateUser } from '@/action/user';
import { Loader2 } from 'lucide-react';
import useFetch from '@/hooks/use-fetch';
import { toast } from 'sonner';

export default function OnboardingForm({ industries }) {

    const [selectedIndustry, setSelectedIndustry] = useState(null);
    const router = useRouter();

    const { loading: updateLoading, fn: updateUserFn, data: updateResult } = useFetch(updateUser)

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
        resolver: zodResolver(onboardingSchema),
    });

    const onSubmit = async (values) => {
        try {
            const formattedIndustry = `${values.industry} - ${values.subIndustry.toLowerCase().replace(/ /g, "_")}`
            await updateUserFn({
                ...values,
                industry: formattedIndustry,
            })
        } catch (error) { }
    };

    useEffect(() => {
        if (updateResult?.success && !updateLoading) {
            toast.success("Profile updated successfully!")
            router.push("/dashboard")
            router.refresh();
        }
    }, [updateResult, updateLoading, router])

    const watchIndustry = watch("industry");

    return (
        <div className='flex items-center justify-center bg-background'>
            <Card className='w-full max-w-lg mt-10 mb-24 mx-2'>
                <CardHeader>
                    <CardTitle>Complete your profile</CardTitle>
                    <CardDescription className="text-xs">Select your industry to get personalized career insights and recommendations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-2">
                            <Label htmlFor='industry'>Industry</Label>
                            <Select onValueChange={(value) => {
                                setValue("industry", value);
                                setSelectedIndustry(
                                    industries.find((ind) => ind.id === value)
                                );
                                setValue("subIndustry", "");
                            }} value={watchIndustry}>
                                <SelectTrigger id='industry'>
                                    <SelectValue placeholder="Select an Industry" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {industries?.map((ind) => {
                                            return <SelectItem key={ind.id} value={ind.id}>{ind.name}</SelectItem>
                                        })}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errors.industry && (
                                <p className='text-sm text-red-500'>{errors.industry.message}</p>
                            )}
                        </div>

                        {watchIndustry && (
                            <div className="space-y-2">
                                <Label htmlFor='subIndustry'>Specialization</Label>
                                <Select onValueChange={(value) => {
                                    setValue("subIndustry", value);
                                }} value={watch("subIndustry")}>
                                    <SelectTrigger id='subIndustry'>
                                        <SelectValue placeholder="Select a Specialization" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {selectedIndustry?.subIndustries?.map((ind) => {
                                                return <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                                            })}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.subIndustry && (
                                    <p className='text-sm text-red-500'>{errors.subIndustry.message}</p>
                                )}
                            </div>)}

                        <div className="space-y-2">
                            <Label htmlFor='experience'>Years of Experience</Label>
                            <Input
                                id="experience"
                                type="number"
                                min="0"
                                max="50"
                                placeholder="Enter years of experience"
                                {...register("experience")}
                                onWheel={(e) => e.target.blur()} />
                            {errors.experience && (
                                <p className='text-sm text-red-500'>{errors.experience.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor='skills'>Skills</Label>
                            <Input
                                id="skills"
                                placeholder="Enter skills"
                                {...register("skills")} />
                            <p className="text-xs text-muted-foreground">Separate multiple skills with commas (e.g. React, Node.js, MongoDB)</p>
                            {errors.skills && (
                                <p className='text-sm text-red-500'>{errors.skills.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor='bio'>Professional Summary</Label>
                            <Textarea
                                id="bio"
                                placeholder="Tell us about your professional background..."
                                className="h-32"
                                {...register("bio")} />
                            <p className="text-xs text-muted-foreground">Keep it under 500 characters</p>
                            {errors.bio && (
                                <p className='text-sm text-red-500'>{errors.bio.message}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full mt-6" disabled={updateLoading}>
                            {updateLoading ? (
                                <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Saving Profile...
                                </>
                            ) : (
                                "Complete Profile"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
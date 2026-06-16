import React from "react";
import OnboardingForm from "./_components/onboarding-form";
import { getUserOnboardingStatus } from "@/action/user";
import { redirect } from "next/navigation";
import { industries } from "@/data/industries";

export default async function OnboardingPage() {
    const { isOnboarded } = await getUserOnboardingStatus();

    if (isOnboarded) {
        redirect("/dashboard");
    }

    return (
        <div className="flex-1 flex flex-col bg-background">
            <OnboardingForm industries={industries} />
        </div>
    );
}
import React from "react";
import OnboardingForm from "./component/onboarding-form";
import { getUserOnboardingStatus } from "@/action/user";
import { redirect } from "next/navigation";
import { industries } from "@/data/industries";

export default async function OnboardingPage() {
    const { isOnboarded } = await getUserOnboardingStatus();

    if (isOnboarded) {
        redirect("/dashboard");
    }

    return (
        <main>
            <OnboardingForm industries={industries} />
        </main>
    );
}
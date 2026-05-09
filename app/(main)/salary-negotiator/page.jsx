"use client";

import { useState } from "react";
import { getUserOnboardingStatus } from "@/action/user";
import { redirect } from "next/navigation";
import NegotiationSetup from "./_components/negotiation-setup";
import NegotiationChat from "./_components/negotiation-chat";

export default function SalaryNegotiatorPage() {
  const [activeSession, setActiveSession] = useState(null);

  if (activeSession && activeSession.id) {
    return (
      <div className="container mx-auto py-10 px-4">
        <NegotiationChat session={activeSession} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <NegotiationSetup onStart={setActiveSession} />
    </div>
  );
}

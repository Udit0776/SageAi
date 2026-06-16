"use client";

import { useState } from "react";
import NegotiationSetup from "./negotiation-setup";
import NegotiationChat from "./negotiation-chat";

export default function NegotiatorClient({ user }) {
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
      <NegotiationSetup user={user} onStart={setActiveSession} />
    </div>
  );
}

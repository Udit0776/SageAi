import { SignUp } from "@clerk/nextjs";
import React from "react";

export default function Page() {
    return (
        <SignUp
            appearance={{
                elements: {
                    rootBox: "mx-auto",
                    card: "shadow-none border border-zinc-800",
                },
                variables: {
                    fontSize: "0.875rem", // Smaller font size
                }
            }}
        />
    );
}
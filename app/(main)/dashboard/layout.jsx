import React, { Suspense } from "react";
import { PuffLoader } from "react-spinners";

export default function Layout({ children }) {
    return (
        <div className="px-4 md:px-8 pt-10">

            <Suspense fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                    <PuffLoader color="gray" />
                </div>
            }>
                {children}
            </Suspense>
        </div>
    );
}
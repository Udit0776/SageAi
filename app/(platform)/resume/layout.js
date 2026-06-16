import React, { Suspense } from "react";
import { PuffLoader } from "react-spinners";

const Layout = ({ children }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-20">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[75vh]">
            <PuffLoader color="gray" size={60} />
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
};

export default Layout;

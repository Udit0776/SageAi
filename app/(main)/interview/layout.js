import React, { Suspense } from "react";
import { PuffLoader } from "react-spinners";

const Layout = ({ children }) => {
  return (
    <div className="px-4 md:px-8 pt-10">
      <Suspense
        fallback={<PuffLoader className="mt-4" width={"100%"} color="gray" />}
      >
        {children}
      </Suspense>
    </div>
  );
};

export default Layout;

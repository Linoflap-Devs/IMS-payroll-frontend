"use client";

import { useEffect } from "react";
import { Card } from "../ui/card";

export default function Settings() {
  
  return (
    <>
      <div className="h-full w-full p-3 pt-3 overflow-hidden">
        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .overflow-y-auto::-webkit-scrollbar,
          .overflow-auto::-webkit-scrollbar,
          .overflow-scroll::-webkit-scrollbar {
            display: none;
          }
          .overflow-y-auto,
          .overflow-auto,
          .overflow-scroll {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        <div className="h-full overflow-hidden">
          <div className="p-3 pt-0 sm:p-4 flex flex-col space-y-4 sm:space-y-5 h-full">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-semibold mb-0">Manage Settings</h1>
            </div>
            <Card className="h-[calc(100vh-180px)] flex flex-col overflow-hidden"></Card>
          </div>
        </div>
      </div>
    </>
  );
}

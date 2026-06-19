"use client";

export default function DesignAgentStudio({ apiKey, isHeaderVisible, onToggleHeader }) {
  return (
    <div className="h-full w-full bg-black flex items-center justify-center">
      <div className="max-w-md text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H4.212c-1.444 0-2.414-1.798-1.414-2.798L4.2 15.3" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Design Agent nicht verfügbar</h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Der Design Agent ist ein MuAPI-exklusives Feature und steht auf fal.ai nicht zur Verfügung.
        </p>
      </div>
    </div>
  );
}

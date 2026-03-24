"use client";

import { useState } from "react";

interface Step {
  id: string;
  stepNumber: number;
  instruction: string;
}

interface FlowchartStepsProps {
  steps: Step[];
}

export function FlowchartSteps({ steps }: FlowchartStepsProps) {
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  const handleStepClick = (id: string) => {
    setActiveStepId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col items-center px-0 pb-6">
      {steps.map((step, index) => {
        const isActive = activeStepId === step.id;
        return (
          <div key={step.id} className="w-full flex flex-col items-center">
            {/* Step card */}
            <button
              type="button"
              onClick={() => handleStepClick(step.id)}
              className={[
                "w-full bg-card rounded-[14px] p-[14px_16px] flex items-start gap-3 text-left transition-all duration-200",
                isActive
                  ? "border-[1.5px] border-primary shadow-[0_2px_8px_rgba(224,122,58,0.12)]"
                  : "border-[1.5px] border-border",
              ].join(" ")}
            >
              {/* Numbered circle */}
              <span
                className={[
                  "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold text-white",
                  isActive ? "bg-primary-dark" : "bg-primary",
                ].join(" ")}
              >
                {step.stepNumber}
              </span>

              {/* Instruction text */}
              <p className="text-[15px] leading-[1.45] text-foreground pt-[3px]">
                {step.instruction}
              </p>
            </button>

            {/* Connector — shown between steps, not after the last one */}
            {index < steps.length - 1 && (
              <div className="flex flex-col items-center h-8 justify-center">
                {/* Vertical line */}
                <div className="w-[2px] h-[18px] bg-primary" />
                {/* Downward-pointing arrow (CSS triangle) */}
                <div
                  className="w-0 h-0"
                  style={{
                    borderLeft: "6px solid transparent",
                    borderRight: "6px solid transparent",
                    borderTop: "7px solid var(--color-primary)",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

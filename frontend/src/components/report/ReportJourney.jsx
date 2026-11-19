"use client";

import { useState } from "react";

const stages = [
  {
    number: "01",
    title: "Report Submitted",
    subtitle: "Every change starts somewhere.",
    description:
      "Your report, including its location, description, and images, is submitted to EcoTrack and securely recorded for review.",
    icon: "📍",
    color: "blue",
    badge: "Submission",
    details: [
      "Location and description recorded",
      "Images attached as evidence",
      "Report added to the system",
    ],
  },
  {
    number: "02",
    title: "Under Verification",
    subtitle: "Every report deserves attention.",
    description:
      "Our administrators examine the submitted information, verify the reported location, and check whether the issue requires action.",
    icon: "🔍",
    color: "violet",
    badge: "Verification",
    details: [
      "Description and images inspected",
      "Location and validity checked",
      "Duplicate reports identified",
    ],
  },
  {
    number: "03",
    title: "Report Approved",
    subtitle: "A problem identified. A solution begins.",
    description:
      "Once verified, your report is approved and becomes eligible for further environmental action.",
    icon: "✓",
    color: "green",
    badge: "Approval",
    details: [
      "Report successfully verified",
      "Environmental issue documented",
      "Next action can be planned",
    ],
  },
  {
    number: "04",
    title: "Cleanup Mission",
    subtitle: "Together, we turn reports into action.",
    description:
      "If organized cleanup is needed, administrators can transform the approved report into a community mission that volunteers can discover and join.",
    icon: "🌱",
    color: "orange",
    badge: "Community Action",
    details: [
      "Cleanup mission organized",
      "Volunteers invited to participate",
      "Cleanup activities coordinated",
    ],
  },
  {
    number: "05",
    title: "Real-World Impact",
    subtitle: "A cleaner community starts with you.",
    description:
      "After the cleanup or necessary action is completed, administrators verify the results and record the environmental improvement.",
    icon: "🏆",
    color: "emerald",
    badge: "Impact Achieved",
    details: [
      "Cleanup results verified",
      "Report marked as resolved",
      "Eligible contributions recognized",
    ],
  },
];

const colors = {
  blue: {
    icon: "bg-blue-100 text-blue-600",
    badge: "bg-blue-50 text-blue-700",
    border: "border-blue-200",
    glow: "shadow-blue-100",
  },
  violet: {
    icon: "bg-violet-100 text-violet-600",
    badge: "bg-violet-50 text-violet-700",
    border: "border-violet-200",
    glow: "shadow-violet-100",
  },
  green: {
    icon: "bg-green-100 text-green-600",
    badge: "bg-green-50 text-green-700",
    border: "border-green-200",
    glow: "shadow-green-100",
  },
  orange: {
    icon: "bg-orange-100 text-orange-600",
    badge: "bg-orange-50 text-orange-700",
    border: "border-orange-200",
    glow: "shadow-orange-100",
  },
  emerald: {
    icon: "bg-emerald-100 text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700",
    border: "border-emerald-200",
    glow: "shadow-emerald-100",
  },
};

export default function ReportJourney() {
  const [activeStep, setActiveStep] = useState(0);

  const active = stages[activeStep];
  const theme = colors[active.color];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white px-5 py-12 shadow-sm sm:px-8 lg:px-12">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-green-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-emerald-100/40 blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-green-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            The EcoTrack Process
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            From a Small Report
            <span className="block text-green-600">To a Cleaner Tomorrow.</span>
          </h2>

          <p className="mt-4 leading-7 text-gray-500">
            Your report is more than information. It&apos;s the beginning of a
            journey that connects environmental awareness with real community
            action.
          </p>
        </div>

        {/* Journey Timeline */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 top-7 hidden h-1 rounded-full bg-gray-100 md:block" />

          <div
            className="absolute left-0 top-7 hidden h-1 rounded-full bg-gradient-to-r from-blue-400 via-green-500 to-emerald-500 transition-all duration-700 ease-in-out md:block"
            style={{
              width: `${(activeStep / (stages.length - 1)) * 100}%`,
            }}
          />

          <div className="relative grid gap-7 md:grid-cols-5 md:gap-3">
            {stages.map((stage, index) => {
              const selected = activeStep === index;
              const completed = activeStep > index;
              const stageTheme = colors[stage.color];

              return (
                <button
                  key={stage.number}
                  onClick={() => setActiveStep(index)}
                  className="group flex items-center gap-4 text-left md:flex-col md:gap-4 md:text-center"
                >
                  {/* Stage icon */}
                  <div
                    className={`
                      relative z-10 flex h-14 w-14 shrink-0 items-center justify-center
                      rounded-2xl border-4 border-white text-xl
                      transition-all duration-300
                      ${
                        selected
                          ? `${stageTheme.icon} scale-110 shadow-lg ${stageTheme.glow}`
                          : completed
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                      }
                    `}
                  >
                    {completed ? "✓" : stage.icon}

                    {selected && (
                      <span className="absolute -inset-2 -z-10 animate-ping rounded-2xl bg-green-200/40" />
                    )}
                  </div>

                  {/* Stage information */}
                  <div>
                    <span className="text-xs font-bold tracking-widest text-gray-400">
                      STEP {stage.number}
                    </span>

                    <h3
                      className={`mt-1 text-sm font-bold transition-colors ${
                        selected ? "text-green-700" : "text-gray-700"
                      }`}
                    >
                      {stage.title}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active stage details */}
        <div
          key={activeStep}
          className="mx-auto mt-14 max-w-4xl animate-[fadeIn_0.45s_ease-out]"
        >
          <div
            className={`rounded-3xl border ${theme.border} bg-white p-6 shadow-xl ${theme.glow} sm:p-9`}
          >
            <div className="grid items-center gap-8 md:grid-cols-[1fr_1fr]">
              {/* Left content */}
              <div>
                <span
                  className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${theme.badge}`}
                >
                  {active.badge}
                </span>

                <h3 className="mt-5 text-2xl font-bold text-gray-900 sm:text-3xl">
                  {active.title}
                </h3>

                <p className="mt-2 font-medium text-gray-500">
                  {active.subtitle}
                </p>

                <p className="mt-5 text-sm leading-7 text-gray-600">
                  {active.description}
                </p>

                {/* Navigation */}
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep((prev) => prev - 1)}
                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    disabled={activeStep === stages.length - 1}
                    onClick={() => setActiveStep((prev) => prev + 1)}
                    className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next Stage →
                  </button>
                </div>
              </div>

              {/* Right visual */}
              <div
                className={`relative flex min-h-64 items-center justify-center overflow-hidden rounded-2xl ${theme.icon}`}
              >
                <div className="absolute h-48 w-48 animate-pulse rounded-full border border-current/20" />
                <div className="absolute h-36 w-36 rounded-full border border-current/20" />

                <div className="relative flex h-28 w-28 animate-[float_3s_ease-in-out_infinite] items-center justify-center rounded-3xl bg-white text-5xl shadow-xl">
                  {active.icon}
                </div>

                <div className="absolute bottom-5 left-5 rounded-xl bg-white/80 px-3 py-2 text-xs font-bold text-gray-600 backdrop-blur">
                  {active.number} / 05
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="mt-9 border-t border-gray-100 pt-6">
              <h4 className="mb-4 text-sm font-bold text-gray-800">
                What happens at this stage?
              </h4>

              <div className="grid gap-3 sm:grid-cols-3">
                {active.details.map((detail, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="mt-0.5 font-bold text-green-600">✓</span>
                    {detail}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm font-medium text-gray-500">
            One report can inspire an entire community.
          </p>

          <p className="mt-2 text-lg font-bold text-green-700">
            Report Today. Create Impact Tomorrow. 🌱
          </p>
        </div>
      </div>

      {/* Component animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </section>
  );
}

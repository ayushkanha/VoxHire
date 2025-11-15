import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Briefcase,
  CalendarClock,
  Timer,
  ListOrdered,
  Activity,
  CheckCircle2,
  RotateCw,
  Download,
  Trash2,
  Headphones,
} from "lucide-react";

export default function Results() {
  const [interviews, setInterviews] = useState<
    Array<{
      id: string;
      role: string;
      date: string;
      duration: number;
      questions: number;
      answers: Array<{ question: string; duration: number }>;
    }>
  >([
    {
      id: "1",
      role: "Front-End Developer",
      date: "Mar 03, 10:24",
      duration: 286,
      questions: 3,
      answers: [
        { question: "Tell us about your most recent project.", duration: 52 },
        {
          question: "How do you approach debugging complex issues?",
          duration: 72,
        },
        {
          question: "Describe strategies to improve performance.",
          duration: 162,
        },
      ],
    },
  ]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const calculateAvg = (questions: number, duration: number) => {
    return formatTime(Math.floor(duration / questions));
  };

  const exportJSON = (interview: (typeof interviews)[0]) => {
    const data = JSON.stringify(interview, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-${interview.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearData = () => {
    if (confirm("Are you sure you want to clear all interview data?")) {
      setInterviews([]);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60 bg-neutral-950/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="h-8 w-8 grid place-items-center rounded-md bg-white text-neutral-900 font-semibold tracking-tight hover:bg-neutral-100 transition-colors">
                VH
              </div>
              <div className="flex flex-col">
                <span className="text-lg tracking-tight font-semibold">
                  VoxHire
                </span>
                <span className="text-xs text-neutral-400">
                  Interview results
                </span>
              </div>
            </div>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <Link href="/interview">
              <button className="text-neutral-300 hover:text-white transition-colors inline-flex items-center gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Back to interview
              </button>
            </Link>
            <a
              href="#"
              className="text-neutral-300 hover:text-white transition-colors"
            >
              Help
            </a>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Summary */}
        <aside className="lg:col-span-1 space-y-6">
          {interviews.length > 0 ? (
            interviews.map((interview) => (
              <section
                key={interview.id}
                className="rounded-xl border border-white/10 bg-white/5"
              >
                <div className="p-5 border-b border-white/10">
                  <h2 className="text-xl tracking-tight font-semibold">
                    Interview summary
                  </h2>
                  <p className="text-sm text-neutral-400 mt-1">
                    Overview of role, time, and completion status.
                  </p>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5">
                    <div className="h-8 w-8 rounded-md bg-indigo-600/20 border border-indigo-500/30 grid place-items-center">
                      <Briefcase className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-neutral-400">Role</p>
                      <p className="text-sm truncate">{interview.role}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-neutral-300" />
                        <span className="text-xs text-neutral-400">Date</span>
                      </div>
                      <p className="mt-1 text-sm">{interview.date}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-neutral-300" />
                        <span className="text-xs text-neutral-400">
                          Total length
                        </span>
                      </div>
                      <p className="mt-1 text-sm tabular-nums">
                        {formatTime(interview.duration)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                      <div className="flex items-center gap-2">
                        <ListOrdered className="h-4 w-4 text-neutral-300" />
                        <span className="text-xs text-neutral-400">
                          Questions
                        </span>
                      </div>
                      <p className="mt-1 text-sm">{interview.questions}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-neutral-300" />
                        <span className="text-xs text-neutral-400">
                          Avg. length
                        </span>
                      </div>
                      <p className="mt-1 text-sm tabular-nums">
                        {calculateAvg(interview.questions, interview.duration)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg border border-emerald-500/30 bg-emerald-600/10">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-emerald-200">Complete</span>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                    <Link href="/interview">
                      <Button className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-colors">
                        <RotateCw className="h-4 w-4" />
                        <span className="text-sm">Start new interview</span>
                      </Button>
                    </Link>
                    <button
                      onClick={() => exportJSON(interview)}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-indigo-500/30 bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span className="text-sm font-medium">Export JSON</span>
                    </button>
                    <button
                      onClick={clearData}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-rose-500/30 bg-rose-600/20 hover:bg-rose-600/30 text-rose-100 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-sm">Clear data</span>
                    </button>
                  </div>
                </div>
              </section>
            ))
          ) : (
            <section className="rounded-xl border border-white/10 bg-white/5">
              <div className="p-5 border-b border-white/10">
                <h2 className="text-xl tracking-tight font-semibold">
                  No interviews yet
                </h2>
                <p className="text-sm text-neutral-400 mt-1">
                  Start an interview to see results here.
                </p>
              </div>
              <div className="p-5">
                <Link href="/interview">
                  <Button className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-indigo-500/30 bg-indigo-600 hover:bg-indigo-500">
                    <span className="text-sm font-medium">Start interview</span>
                  </Button>
                </Link>
              </div>
            </section>
          )}
        </aside>

        {/* Right: Answers */}
        <section className="lg:col-span-2 space-y-6">
          {interviews.length > 0 ? (
            interviews.map((interview) => (
              <div key={interview.id} className="space-y-4">
                <h2 className="text-2xl tracking-tight font-semibold">
                  Interview Answers
                </h2>
                {interview.answers.map((answer, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
                  >
                    <div className="p-5 border-b border-white/10">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="inline-flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-xs border border-white/10 bg-white/5 text-neutral-300">
                              Question {idx + 1}
                            </span>
                            <span className="text-xs text-neutral-500">
                              Submitted
                            </span>
                          </div>
                          <h3 className="mt-2 text-lg tracking-tight font-semibold">
                            {answer.question}
                          </h3>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-white/10 bg-neutral-900 text-xs tabular-nums whitespace-nowrap">
                          <Timer className="h-3.5 w-3.5" />
                          {formatTime(answer.duration)}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="rounded-lg border border-white/10 bg-neutral-950/60 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Headphones className="h-4 w-4 text-neutral-300" />
                            <span className="text-sm text-neutral-300">
                              Recorded answer
                            </span>
                          </div>
                          <span className="text-xs tabular-nums text-neutral-500">
                            {formatTime(answer.duration)}
                          </span>
                        </div>
                        <audio
                          controls
                          className="w-full h-10 rounded-md"
                          style={{
                            accentColor: "#4f46e5",
                          }}
                        >
                          Your browser does not support audio playback.
                        </audio>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
              <h3 className="text-lg tracking-tight font-semibold">
                No interview data available
              </h3>
              <p className="text-sm text-neutral-400 mt-2">
                Complete an interview to see your answers and results here.
              </p>
              <Link href="/interview">
                <Button className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-indigo-500/30 bg-indigo-600 hover:bg-indigo-500">
                  <span className="text-sm font-medium">Start interview</span>
                </Button>
              </Link>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-white/10 text-sm text-neutral-500">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p>
            © {new Date().getFullYear()} VoxHire. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-neutral-300 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-neutral-300 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

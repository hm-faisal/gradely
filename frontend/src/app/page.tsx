import { CircleCheck, GraduationCap, ShieldCheck, Zap } from "lucide-react";
import { AuthCard } from "@/features/auth/components/auth-card";

const highlights = [
  {
    icon: Zap,
    title: "Built for speed",
    description: "Submissions and grades update the moment they happen.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    description:
      "Session cookies are http-only and every request is validated.",
  },
  {
    icon: CircleCheck,
    title: "Clear feedback",
    description: "Give students the context they need to improve.",
  },
];

export default function Home() {
  return (
    <main className="relative flex min-h-svh flex-1 items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-40 right-[-10%] size-[28rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-10%] size-[28rem] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <section className="hidden flex-col gap-9 lg:flex">
          <div className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-5" aria-hidden="true" />
            </span>
            Gradely
          </div>

          <div className="space-y-5">
            <h1 className="text-4xl font-semibold tracking-tight text-balance">
              Grade smarter. Teach better. Learn faster.
            </h1>
            <p className="max-w-md text-base text-muted-foreground">
              Gradely brings assignments, submissions, and feedback into one
              calm workspace — so your class can focus on what matters.
            </p>
          </div>

          <ul className="grid gap-4">
            {highlights.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="text-xs text-muted-foreground">
            © Gradely. All rights reserved.
          </p>
        </section>

        <section className="flex w-full justify-center">
          <AuthCard />
        </section>
      </div>
    </main>
  );
}

const features = [
  {
    title: "Customer-Obsessed Workflow",
    description:
      "A clean end-to-end experience designed around the real user problem, not just the technology.",
  },
  {
    title: "Scalable Serverless Core",
    description:
      "Built for AWS Lambda, API Gateway, DynamoDB, and secure cloud-native expansion.",
  },
  {
    title: "AI-Ready Architecture",
    description:
      "Prepared for Amazon Bedrock-powered intelligence, recommendations, summaries, and automation.",
  },
];

const metrics = [
  { label: "Prototype Goal", value: "48 hrs" },
  { label: "Architecture", value: "AWS-first" },
  { label: "Focus", value: "MVP + Impact" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff9900] font-bold text-slate-950">
              H6
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">HackOn 6.0</p>
              <p className="text-xs text-slate-500">Amazon-grade prototype</p>
            </div>
          </div>

          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="hover:text-slate-950">
              Features
            </a>
            <a href="#architecture" className="hover:text-slate-950">
              Architecture
            </a>
            <a href="#demo" className="hover:text-slate-950">
              Demo
            </a>
          </div>

          <button className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
            Launch Demo
          </button>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700">
            Built with Customer Obsession, Ownership, and Bias for Action
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
            A scalable AWS-first solution for the final HackOn problem.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            This frontend is our launchpad. Once the problem statement arrives,
            we will plug in the exact workflow, backend APIs, DynamoDB schema,
            and AI layer needed to build a polished working prototype.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button className="rounded-xl bg-[#ff9900] px-6 py-3 font-semibold text-slate-950 shadow-sm transition hover:bg-[#f3a21b]">
              Start User Journey
            </button>
            <button className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 transition hover:bg-slate-50">
              View Architecture
            </button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-2xl font-bold text-slate-950">
                  {metric.value}
                </p>
                <p className="mt-1 text-sm text-slate-500">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-800 to-slate-700 p-6 text-white">
            <div className="mb-8 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-300">
                System Status
              </p>
              <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                Ready
              </span>
            </div>

            <div className="space-y-4">
              {[
                "Next.js frontend initialized",
                "AWS CLI configured",
                "Serverless backend planned",
                "DynamoDB persistence planned",
                "Bedrock AI layer ready",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl bg-white/10 p-4"
                >
                  <div className="h-2.5 w-2.5 rounded-full bg-[#ff9900]" />
                  <span className="text-sm text-slate-100">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#ff9900]">
            Prototype Principles
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            Designed to impress judges and stay buildable in 48 hours.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 h-12 w-12 rounded-2xl bg-orange-100" />
              <h3 className="text-lg font-bold text-slate-950">
                {feature.title}
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="architecture" className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#ff9900]">
            Planned Architecture
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            Frontend → API Gateway → Lambda → DynamoDB → Bedrock
          </h2>
          <p className="mt-4 max-w-3xl leading-8 text-slate-600">
            The final implementation will use a secure API layer, serverless
            compute, cloud database persistence, and optional GenAI workflows
            depending on the problem statement.
          </p>
        </div>
      </section>

      <footer className="mt-12 border-t border-slate-200 bg-white px-6 py-6 text-center text-sm text-slate-500">
        HackOn 6.0 Prototype Base · Built for speed, scale, and customer impact
      </footer>
    </main>
  );
}

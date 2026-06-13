"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BudgetMode,
  checkoutNowOrder,
  DecisionMode,
  generateNowPlan,
  getCartItemCount,
  getCartMode,
  getCartTotal,
  getHealth,
  getNowOrders,
  NowCartItem,
  NowCartMode,
  NowOrder,
  NowPlan,
  sendNowFeedback,
} from "@/lib/api";

const DEMO_USER_ID = "demo-user-001";

const quickPrompts = [
  "4 friends are coming in 30 minutes",
  "I need breakfast for two tomorrow morning",
  "I have a cold and sore throat",
  "I have an interview in 1 hour",
  "I need to clean my kitchen quickly",
  "It is raining and I need essentials",
  "Baby care emergency",
  "Late-night snacks for movie night",
];

const aisles = [
  "All",
  "Past Purchases",
  "Aisles",
  "Deals",
  "Panic Mode",
  "Breakfast",
  "Guests",
  "Health",
  "Baby",
  "Cleaning",
  "Work Essentials",
];

const modeOptions: {
  value: DecisionMode;
  label: string;
  subtitle: string;
}[] = [
  {
    value: "fastest",
    label: "Fastest",
    subtitle: "Lowest ETA",
  },
  {
    value: "bestValue",
    label: "Best Value",
    subtitle: "Balanced spend",
  },
  {
    value: "mostComplete",
    label: "Most Complete",
    subtitle: "Covers more",
  },
];

const budgetOptions: {
  value: BudgetMode;
  label: string;
}[] = [
  {
    value: "save",
    label: "Save",
  },
  {
    value: "balanced",
    label: "Balanced",
  },
  {
    value: "premium",
    label: "Premium",
  },
];

function formatPrice(value: number) {
  return `₹${Math.round(Number(value || 0))}`;
}

function getUrgencyStyle(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes("critical")) {
    return "bg-red-50 text-red-700 ring-red-200";
  }

  if (normalized.includes("high")) {
    return "bg-orange-50 text-orange-700 ring-orange-200";
  }

  if (normalized.includes("medium")) {
    return "bg-yellow-50 text-yellow-800 ring-yellow-200";
  }

  return "bg-emerald-50 text-emerald-700 ring-emerald-200";
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  );
}

function ConfidenceBar({ label, value }: { label: string; value: number }) {
  const safeValue = Math.max(0, Math.min(100, Number(value || 0)));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-bold text-slate-900">{safeValue}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-amber-400"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

function ProductImageBadge({ name }: { name: string }) {
  const lower = name.toLowerCase();

  let emoji = "📦";
  if (lower.includes("cola") || lower.includes("juice")) emoji = "🥤";
  else if (lower.includes("chips") || lower.includes("nachos")) emoji = "🍿";
  else if (lower.includes("cup")) emoji = "🥛";
  else if (lower.includes("tissue")) emoji = "🧻";
  else if (lower.includes("milk")) emoji = "🥛";
  else if (lower.includes("bread")) emoji = "🍞";
  else if (lower.includes("banana")) emoji = "🍌";
  else if (lower.includes("egg")) emoji = "🥚";
  else if (lower.includes("ice cream")) emoji = "🍨";
  else if (lower.includes("charger")) emoji = "🔌";
  else if (lower.includes("cleaner")) emoji = "🧽";
  else if (lower.includes("diaper") || lower.includes("baby")) emoji = "🍼";
  else if (lower.includes("umbrella")) emoji = "☂️";

  return (
    <div className="flex h-24 w-full items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 text-5xl">
      {emoji}
    </div>
  );
}

function ProductCard({
  item,
  plan,
  selectedMode,
}: {
  item: NowCartItem;
  plan: NowPlan;
  selectedMode: DecisionMode;
}) {
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  async function handleFeedback() {
    try {
      await sendNowFeedback({
        userId: DEMO_USER_ID,
        planId: plan.planId,
        action: "removed_or_not_needed",
        productId: item.productId,
        productName: item.name,
        selectedMode,
        note: "User marked this recommendation as not needed from the cart UI.",
      });
      setFeedbackSaved(true);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="min-w-[180px] rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <ProductImageBadge name={item.name} />

      <div className="mt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-950">
            {item.name}
          </h3>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
            {item.etaMinutes}m
          </span>
        </div>

        <p className="mt-2 text-lg font-black text-slate-950">
          {formatPrice(item.price)}
        </p>

        <p className="mt-1 text-xs text-slate-500">Qty: {item.quantity}</p>

        <p className="mt-2 line-clamp-3 min-h-[48px] text-xs leading-relaxed text-slate-600">
          {item.reason}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <button className="flex-1 rounded-full bg-amber-400 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-amber-300">
            Added
          </button>
          <button
            onClick={handleFeedback}
            disabled={feedbackSaved}
            className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {feedbackSaved ? "Saved" : "Skip"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RegretCard({
  item,
}: {
  item: {
    productId: string;
    name: string;
    price: number;
    etaMinutes: number;
    reason: string;
  };
}) {
  return (
    <div className="min-w-[190px] rounded-2xl border border-orange-100 bg-orange-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-950">{item.name}</p>
          <p className="mt-1 text-xs text-orange-800">{item.reason}</p>
        </div>
        <span className="rounded-full bg-white px-2 py-1 text-xs font-black text-orange-700">
          {item.etaMinutes}m
        </span>
      </div>
      <p className="mt-3 text-sm font-black text-slate-950">
        {formatPrice(item.price)}
      </p>
    </div>
  );
}

function CartModeTabs({
  selectedMode,
  onChange,
  plan,
}: {
  selectedMode: DecisionMode;
  onChange: (mode: DecisionMode) => void;
  plan: NowPlan;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {modeOptions.map((mode) => {
        const cartMode = getCartMode(plan, mode.value);
        const isActive = selectedMode === mode.value;

        return (
          <button
            key={mode.value}
            onClick={() => onChange(mode.value)}
            className={`rounded-2xl border p-4 text-left transition ${
              isActive
                ? "border-amber-400 bg-amber-50 shadow-sm ring-2 ring-amber-200"
                : "border-slate-200 bg-white hover:border-amber-200"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-black text-slate-950">{mode.label}</p>
              <span className="rounded-full bg-slate-950 px-2 py-1 text-xs font-bold text-white">
                {cartMode.etaMinutes}m
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {mode.subtitle}
            </p>
            <p className="mt-2 text-xs text-slate-600">{cartMode.modeReason}</p>
          </button>
        );
      })}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
        ⚡
      </div>
      <h3 className="mt-4 text-xl font-black text-slate-950">
        Your AI cart will appear here
      </h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
        Describe the urgent situation. Amazon Now Assist will generate Fastest,
        Best Value, and Most Complete carts using AI, urgency, time context, and
        available inventory.
      </p>
    </div>
  );
}

export default function Home() {
  const [healthStatus, setHealthStatus] = useState("Checking");
  const [userRequest, setUserRequest] = useState(
    "4 friends are coming in 30 minutes"
  );
  const [budgetMode, setBudgetMode] = useState<BudgetMode>("balanced");
  const [decisionMode, setDecisionMode] = useState<DecisionMode>("fastest");
  const [selectedMode, setSelectedMode] = useState<DecisionMode>("fastest");
  const [panicMode, setPanicMode] = useState(true);
  const [plan, setPlan] = useState<NowPlan | null>(null);
  const [orders, setOrders] = useState<NowOrder[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState("");
  const [checkoutMessage, setCheckoutMessage] = useState("");

  const activeCart = useMemo<NowCartMode | null>(() => {
    if (!plan) return null;
    return getCartMode(plan, selectedMode);
  }, [plan, selectedMode]);

  const cartTotal = activeCart ? getCartTotal(activeCart) : 0;
  const cartItemCount = activeCart ? getCartItemCount(activeCart) : 0;

  async function loadInitialData() {
    try {
      const [health, orderResponse] = await Promise.all([
        getHealth(),
        getNowOrders(DEMO_USER_ID).catch(() => ({
          success: true,
          count: 0,
          orders: [],
        })),
      ]);

      setHealthStatus(health?.success ? "Live" : "Degraded");
      setOrders(orderResponse.orders || []);
    } catch (err) {
      console.error(err);
      setHealthStatus("Offline");
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  async function handleGenerate(event?: FormEvent) {
    event?.preventDefault();

    const trimmedRequest = userRequest.trim();

    if (!trimmedRequest) {
      setError("Describe what you need right now.");
      return;
    }

    setError("");
    setCheckoutMessage("");
    setIsGenerating(true);

    try {
      const response = await generateNowPlan({
        userId: DEMO_USER_ID,
        userRequest: trimmedRequest,
        budgetMode,
        decisionMode,
        panicMode,
      });

      setPlan(response.plan);
      setSelectedMode(response.plan.recommendedMode || decisionMode);

      await sendNowFeedback({
        userId: DEMO_USER_ID,
        planId: response.plan.planId,
        action: "generated_plan",
        selectedMode: response.plan.recommendedMode || decisionMode,
        note: trimmedRequest,
      }).catch(() => null);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate your urgent cart."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCheckout() {
    if (!plan) return;

    setIsCheckingOut(true);
    setCheckoutMessage("");
    setError("");

    try {
      const response = await checkoutNowOrder({
        userId: DEMO_USER_ID,
        plan,
        selectedMode,
      });

      setCheckoutMessage(
        `${response.message}. Order ${response.order.id.slice(0, 13)} saved.`
      );

      await sendNowFeedback({
        userId: DEMO_USER_ID,
        planId: plan.planId,
        action: "checkout_completed",
        selectedMode,
        note: `Checked out ${cartItemCount} items worth ${formatPrice(
          cartTotal
        )}.`,
      }).catch(() => null);

      const orderResponse = await getNowOrders(DEMO_USER_ID);
      setOrders(orderResponse.orders || []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#e8e8e8] text-slate-950">
      <header className="sticky top-0 z-40 bg-[#131921] text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <div className="flex min-w-fit items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-amber-400 text-lg font-black text-slate-950">
              a
            </div>
            <div>
              <p className="text-sm font-black leading-none">Amazon Now</p>
              <p className="text-[11px] text-slate-300">Assist</p>
            </div>
          </div>

          <div className="hidden min-w-fit text-xs md:block">
            <p className="text-slate-300">Delivering to</p>
            <p className="font-bold">Gwalior 474001</p>
          </div>

          <form
            onSubmit={handleGenerate}
            className="flex flex-1 overflow-hidden rounded-md bg-white"
          >
            <select
              value={decisionMode}
              onChange={(event) =>
                setDecisionMode(event.target.value as DecisionMode)
              }
              className="hidden bg-slate-100 px-3 text-xs font-bold text-slate-700 outline-none md:block"
            >
              <option value="fastest">Fastest</option>
              <option value="bestValue">Best Value</option>
              <option value="mostComplete">Most Complete</option>
            </select>

            <input
              value={userRequest}
              onChange={(event) => setUserRequest(event.target.value)}
              placeholder="Tell us what you need right now"
              className="min-w-0 flex-1 px-4 py-3 text-sm text-slate-950 outline-none"
            />

            <button
              disabled={isGenerating}
              className="bg-amber-400 px-5 text-sm font-black text-slate-950 transition hover:bg-amber-300 disabled:opacity-70"
            >
              {isGenerating ? "..." : "⚡"}
            </button>
          </form>

          <div className="hidden min-w-fit text-xs lg:block">
            <p className="text-slate-300">Hello, demo</p>
            <p className="font-bold">Account</p>
          </div>

          <div className="hidden min-w-fit text-xs lg:block">
            <p className="text-slate-300">Returns</p>
            <p className="font-bold">& Orders</p>
          </div>

          <button className="min-w-fit rounded-md border border-slate-600 px-3 py-2 text-sm font-black">
            🛒 {cartItemCount}
          </button>
        </div>

        <nav className="bg-[#232f3e]">
          <div className="mx-auto flex max-w-7xl gap-4 overflow-x-auto px-4 py-2 text-sm font-medium text-white">
            {aisles.map((aisle) => (
              <button
                key={aisle}
                className="min-w-fit rounded px-1 py-1 transition hover:text-amber-300"
              >
                {aisle}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xl font-black text-[#00a8a8]">
              amazon now
            </span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
              AI Need-to-Cart
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
              Backend: {healthStatus}
            </span>
          </div>

          <p className="text-sm text-slate-600">
            Describe the situation. Get a ready cart in seconds.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-5">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#d7f7f2] via-[#f7f2d7] to-[#ffe6b7] shadow-sm">
          <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_0.8fr] md:p-8">
            <div>
              <div className="inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-black text-slate-800">
                ⚡ Urgent shopping, reimagined
              </div>
              <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                Need it now? Tell us the situation. Get the cart in seconds.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-700 md:text-base">
                Amazon Now Assist converts real-life urgent needs into
                AI-generated carts with urgency score, confidence, forgotten
                essentials, and one-tap checkout.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {quickPrompts.slice(0, 5).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setUserRequest(prompt)}
                    className="rounded-full bg-white/80 px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-white"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {["🥤 Drinks", "🍿 Snacks", "🧻 Essentials", "🍞 Breakfast"].map(
                (item) => (
                  <div
                    key={item}
                    className="flex min-h-24 items-center justify-center rounded-2xl bg-white/80 p-4 text-center text-lg font-black text-slate-900 shadow-sm"
                  >
                    {item}
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.5fr]">
          <aside className="space-y-5">
            <form
              onSubmit={handleGenerate}
              className="rounded-3xl bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-amber-600">
                    Need-to-Cart Engine
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">
                    What do you need right now?
                  </h2>
                </div>

                <label className="flex cursor-pointer items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-xs font-black text-red-700">
                  <input
                    type="checkbox"
                    checked={panicMode}
                    onChange={(event) => setPanicMode(event.target.checked)}
                    className="accent-red-600"
                  />
                  Panic Mode
                </label>
              </div>

              <textarea
                value={userRequest}
                onChange={(event) => setUserRequest(event.target.value)}
                rows={4}
                className="mt-4 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-950 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                placeholder="Example: 4 friends are coming in 30 minutes"
              />

              <div className="mt-4">
                <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">
                  Budget
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {budgetOptions.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => setBudgetMode(option.value)}
                      className={`rounded-xl border px-3 py-2 text-sm font-black transition ${
                        budgetMode === option.value
                          ? "border-amber-400 bg-amber-50 text-slate-950"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">
                  Decision Mode
                </p>
                <div className="grid gap-2">
                  {modeOptions.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => {
                        setDecisionMode(option.value);
                        setSelectedMode(option.value);
                      }}
                      className={`rounded-xl border px-3 py-3 text-left transition ${
                        decisionMode === option.value
                          ? "border-amber-400 bg-amber-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <p className="text-sm font-black text-slate-950">
                        {option.label}
                      </p>
                      <p className="text-xs text-slate-500">
                        {option.subtitle}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {error ? (
                <div className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isGenerating}
                className="mt-5 w-full rounded-2xl bg-amber-400 px-5 py-4 text-base font-black text-slate-950 shadow-sm transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isGenerating ? "Generating AI cart..." : "Generate Now Cart"}
              </button>
            </form>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <h3 className="text-lg font-black text-slate-950">
                Quick situations
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setUserRequest(prompt)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="space-y-5">
            {!plan || !activeCart ? (
              <EmptyState />
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-4">
                  <MetricCard
                    label="Urgency"
                    value={`${plan.urgencyScore}/100`}
                    helper={plan.urgencyLabel}
                  />
                  <MetricCard
                    label="Cart Confidence"
                    value={`${plan.confidence.overall}%`}
                    helper="AI confidence"
                  />
                  <MetricCard
                    label="Delivery ETA"
                    value={`${activeCart.etaMinutes} min`}
                    helper="Mode estimate"
                  />
                  <MetricCard
                    label="Decisions"
                    value={`${plan.metrics.decisionsReducedFrom} → ${plan.metrics.decisionsReducedTo}`}
                    helper="Decision compression"
                  />
                </div>

                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${getUrgencyStyle(
                            plan.urgencyLabel
                          )}`}
                        >
                          {plan.urgencyLabel} urgency
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                          {plan.needCategory}
                        </span>
                        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
                          {plan.timeContext.timeOfDay}
                        </span>
                      </div>

                      <h2 className="mt-3 text-2xl font-black text-slate-950">
                        {activeCart.cartTitle}
                      </h2>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        {plan.aiExplanation}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
                      <p className="text-xs text-slate-300">Selected total</p>
                      <p className="text-2xl font-black">
                        {formatPrice(cartTotal)}
                      </p>
                      <p className="text-xs text-slate-300">
                        {cartItemCount} items
                      </p>
                    </div>
                  </div>
                </div>

                <CartModeTabs
                  selectedMode={selectedMode}
                  onChange={setSelectedMode}
                  plan={plan}
                />

                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-black text-slate-950">
                        AI-generated cart
                      </h3>
                      <p className="text-sm text-slate-500">
                        {activeCart.modeReason}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
                      Arrives in {activeCart.etaMinutes}m
                    </span>
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {activeCart.items.map((item) => (
                      <ProductCard
                        key={item.productId}
                        item={item}
                        plan={plan}
                        selectedMode={selectedMode}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="rounded-3xl bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-black text-slate-950">
                      People often forget these
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Regret-prevention suggestions generated by AI.
                    </p>

                    {plan.regretPrevention.length > 0 ? (
                      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                        {plan.regretPrevention.map((item) => (
                          <RegretCard key={item.productId} item={item} />
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                        No extra forgotten essentials detected for this cart.
                      </p>
                    )}
                  </div>

                  <div className="rounded-3xl bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-black text-slate-950">
                      Confidence breakdown
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {plan.confidence.reason}
                    </p>

                    <div className="mt-4 space-y-3">
                      <ConfidenceBar
                        label="Need match"
                        value={plan.confidence.needMatch}
                      />
                      <ConfidenceBar
                        label="Availability fit"
                        value={plan.confidence.availabilityFit}
                      />
                      <ConfidenceBar
                        label="Budget fit"
                        value={plan.confidence.budgetFit}
                      />
                      <ConfidenceBar
                        label="Completeness"
                        value={plan.confidence.completeness}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-black text-slate-950">
                    Faster alternatives
                  </h3>

                  {plan.substitutions.length > 0 ? (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {plan.substitutions.map((substitution) => (
                        <div
                          key={`${substitution.originalProductId}-${substitution.suggestedProductId}`}
                          className="rounded-2xl border border-slate-200 p-4"
                        >
                          <p className="text-sm font-black text-slate-950">
                            {substitution.originalName} →{" "}
                            {substitution.suggestedName}
                          </p>
                          <p className="mt-1 text-xs text-emerald-700">
                            Saves {substitution.minutesSaved} minutes
                          </p>
                          <p className="mt-2 text-xs text-slate-600">
                            {substitution.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                      No substitution needed. Current cart already fits
                      availability and urgency.
                    </p>
                  )}
                </div>

                {checkoutMessage ? (
                  <div className="rounded-3xl bg-emerald-50 p-5 text-sm font-bold text-emerald-800 ring-1 ring-emerald-200">
                    {checkoutMessage}
                  </div>
                ) : null}
              </>
            )}
          </section>
        </section>

        <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Past urgent orders
              </h2>
              <p className="text-sm text-slate-500">
                Stored in DynamoDB for personalization memory.
              </p>
            </div>

            <button
              onClick={loadInitialData}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          {orders.length > 0 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {orders.slice(0, 6).map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <p className="text-sm font-black text-slate-950">
                    {order.plan?.needCategory || "Urgent order"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                    {order.plan?.userRequest}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">
                      {order.selectedMode}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 font-bold text-emerald-700">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
              No orders yet. Generate a cart and checkout to create the first
              urgent order.
            </p>
          )}
        </section>
      </div>

      {plan && activeCart ? (
        <div className="sticky bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black text-slate-950">
                {cartItemCount} items · {formatPrice(cartTotal)} · ETA{" "}
                {activeCart.etaMinutes} min
              </p>
              <p className="text-xs text-slate-500">
                {plan.checkoutSummary.oneTapMessage}
              </p>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="rounded-2xl bg-amber-400 px-8 py-3 text-sm font-black text-slate-950 shadow-sm transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCheckingOut ? "Placing order..." : "Checkout Now"}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

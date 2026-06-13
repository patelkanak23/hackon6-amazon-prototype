"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BudgetMode,
  checkoutNowOrder,
  DecisionMode,
  generateNowPlan,
  getHealth,
  getItems,
  getNowOrders,
  NowCartItem,
  NowOrder,
  NowPlan,
  seedNowInventory,
  sendNowFeedback,
} from "@/lib/api";

const DEMO_USER_ID = "demo-user-001";

type StoreProduct = {
  id: string;
  entityType?: string;
  name: string;
  category?: string;
  aisle?: string;
  price: number;
  etaMinutes: number;
  available?: boolean;
  tags?: string[];
  imageHint?: string;
};

const quickPrompts = [
  "4 friends are coming in 30 minutes",
  "I need breakfast for two tomorrow morning",
  "I have a cold and sore throat",
  "I have an interview in 1 hour",
  "I need to clean my kitchen quickly",
  "It is raining and I need essentials",
];

const navItems = [
  "All",
  "Fresh",
  "Grocery",
  "Snacks",
  "Breakfast",
  "Health",
  "Baby",
  "Cleaning",
  "Electronics",
  "Deals",
];

const budgetOptions: { value: BudgetMode; label: string }[] = [
  { value: "save", label: "Save" },
  { value: "balanced", label: "Balanced" },
  { value: "premium", label: "Premium" },
];

const modeOptions: {
  value: DecisionMode;
  label: string;
  helper: string;
}[] = [
  { value: "fastest", label: "Fastest", helper: "lowest ETA" },
  { value: "bestValue", label: "Best Value", helper: "balanced price" },
  { value: "mostComplete", label: "Complete", helper: "fuller basket" },
];

function formatPrice(value: number) {
  return `₹${Math.round(Number(value || 0))}`;
}

function productEmoji(name: string) {
  const lower = name.toLowerCase();

  if (lower.includes("cola") || lower.includes("juice")) return "🥤";
  if (lower.includes("chips") || lower.includes("nachos")) return "🍿";
  if (lower.includes("cup")) return "🥛";
  if (lower.includes("tissue")) return "🧻";
  if (lower.includes("milk")) return "🥛";
  if (lower.includes("bread")) return "🍞";
  if (lower.includes("banana")) return "🍌";
  if (lower.includes("egg")) return "🥚";
  if (lower.includes("cereal")) return "🥣";
  if (lower.includes("tea")) return "☕";
  if (lower.includes("ice cream")) return "🍨";
  if (lower.includes("charger")) return "🔌";
  if (lower.includes("notebook") || lower.includes("pen")) return "📝";
  if (lower.includes("deodorant")) return "🧴";
  if (lower.includes("cleaner")) return "🧽";
  if (lower.includes("diaper") || lower.includes("baby")) return "🍼";
  if (lower.includes("umbrella")) return "☂️";
  if (lower.includes("thermometer")) return "🌡️";

  return "📦";
}

function productToCartItem(product: StoreProduct): NowCartItem {
  return {
    productId: product.id,
    name: product.name,
    quantity: 1,
    price: product.price,
    etaMinutes: product.etaMinutes,
    reason: "Added from Amazon Now aisle.",
  };
}

function uniqueCartItems(items: NowCartItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.productId)) return false;
    seen.add(item.productId);
    return true;
  });
}

function buildDeckFromPlan(plan: NowPlan, mode: DecisionMode) {
  const primary = plan.cartModes[mode]?.items || [];
  const fastest = plan.cartModes.fastest?.items || [];
  const bestValue = plan.cartModes.bestValue?.items || [];
  const mostComplete = plan.cartModes.mostComplete?.items || [];

  const regretItems: NowCartItem[] = (plan.regretPrevention || []).map(
    (item) => ({
      productId: item.productId,
      name: item.name,
      quantity: 1,
      price: item.price,
      etaMinutes: item.etaMinutes,
      reason: item.reason,
    })
  );

  return uniqueCartItems([
    ...primary,
    ...mostComplete,
    ...fastest,
    ...bestValue,
    ...regretItems,
  ]).slice(0, 6);
}

function getCartTotal(items: NowCartItem[]) {
  return items.reduce((sum, item) => {
    return sum + Number(item.price || 0) * Number(item.quantity || 1);
  }, 0);
}

function getCartCount(items: NowCartItem[]) {
  return items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
}

function getCartEta(items: NowCartItem[]) {
  if (!items.length) return 0;
  return Math.max(...items.map((item) => Number(item.etaMinutes || 0)));
}

function SmallProductCard({
  product,
  onAdd,
}: {
  product: StoreProduct;
  onAdd: (item: NowCartItem) => void;
}) {
  return (
    <div className="min-w-[142px] rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex h-20 items-center justify-center rounded-lg bg-slate-50 text-4xl">
        {productEmoji(product.name)}
      </div>

      <p className="mt-2 h-9 overflow-hidden text-xs font-bold leading-tight text-slate-900">
        {product.name}
      </p>

      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-sm font-black text-slate-950">
          {formatPrice(product.price)}
        </p>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">
          {product.etaMinutes}m
        </span>
      </div>

      <button
        onClick={() => onAdd(productToCartItem(product))}
        className="mt-2 w-full rounded-full bg-amber-400 px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-amber-300"
      >
        Add
      </button>
    </div>
  );
}

function DeckCard({
  item,
  index,
  total,
  onAdd,
  onSkip,
  disabled,
}: {
  item: NowCartItem;
  index: number;
  total: number;
  onAdd: () => void;
  onSkip: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl bg-slate-200" />
      <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-2xl bg-slate-100" />

      <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wide text-amber-600">
              Recommendation {index + 1} of {total}
            </p>
            <h3 className="mt-1 text-lg font-black leading-tight text-slate-950">
              {item.name}
            </h3>
          </div>

          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
            {item.etaMinutes}m
          </span>
        </div>

        <div className="mt-4 flex h-28 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 text-6xl">
          {productEmoji(item.name)}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-slate-950">
              {formatPrice(item.price)}
            </p>
            <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
          </div>

          <div className="rounded-xl bg-slate-950 px-3 py-2 text-right text-white">
            <p className="text-[10px] text-slate-300">ETA</p>
            <p className="text-sm font-black">{item.etaMinutes} min</p>
          </div>
        </div>

        <p className="mt-3 min-h-[44px] text-xs leading-5 text-slate-600">
          {item.reason}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={onSkip}
            disabled={disabled}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Skip
          </button>
          <button
            onClick={onAdd}
            disabled={disabled}
            className="rounded-xl bg-amber-400 px-4 py-3 text-sm font-black text-slate-950 hover:bg-amber-300 disabled:opacity-60"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({
  open,
  onClose,
  items,
  onRemove,
  onCheckout,
  isCheckingOut,
  checkoutMessage,
}: {
  open: boolean;
  onClose: () => void;
  items: NowCartItem[];
  onRemove: (productId: string) => void;
  onCheckout: () => void;
  isCheckingOut: boolean;
  checkoutMessage: string;
}) {
  const total = getCartTotal(items);
  const count = getCartCount(items);
  const eta = getCartEta(items);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close cart backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/45"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-slate-950">Your Cart</h2>
            <p className="text-xs text-slate-500">
              {count} items · ETA {eta || "--"} min
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-black text-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {items.length ? (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-3 rounded-xl border border-slate-200 p-3"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-50 text-3xl">
                  {productEmoji(item.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-950">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Qty {item.quantity} · {item.etaMinutes}m
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-950">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>

                <button
                  onClick={() => onRemove(item.productId)}
                  className="h-fit rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-600"
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">
              Your cart is empty. Add products from aisles or AI
              recommendations.
            </div>
          )}

          {checkoutMessage ? (
            <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800 ring-1 ring-emerald-200">
              {checkoutMessage}
            </div>
          ) : null}
        </div>

        <div className="border-t border-slate-200 p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-600">Subtotal</p>
            <p className="text-2xl font-black text-slate-950">
              {formatPrice(total)}
            </p>
          </div>

          <button
            onClick={onCheckout}
            disabled={!items.length || isCheckingOut}
            className="w-full rounded-xl bg-amber-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCheckingOut ? "Placing order..." : "Proceed to checkout"}
          </button>
        </div>
      </aside>
    </div>
  );
}

function AssistPanel({
  open,
  onClose,
  userRequest,
  setUserRequest,
  budgetMode,
  setBudgetMode,
  decisionMode,
  setDecisionMode,
  panicMode,
  setPanicMode,
  onGenerate,
  isGenerating,
  plan,
  deckItems,
  onAddDeckItem,
  onSkipDeckItem,
  error,
}: {
  open: boolean;
  onClose: () => void;
  userRequest: string;
  setUserRequest: (value: string) => void;
  budgetMode: BudgetMode;
  setBudgetMode: (value: BudgetMode) => void;
  decisionMode: DecisionMode;
  setDecisionMode: (value: DecisionMode) => void;
  panicMode: boolean;
  setPanicMode: (value: boolean) => void;
  onGenerate: (event?: FormEvent) => void;
  isGenerating: boolean;
  plan: NowPlan | null;
  deckItems: NowCartItem[];
  onAddDeckItem: () => void;
  onSkipDeckItem: () => void;
  error: string;
}) {
  if (!open) return null;

  const topItem = deckItems[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-3 md:p-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-[#e8e8e8] shadow-2xl">
        <div className="flex items-center justify-between bg-[#131921] px-4 py-3 text-white">
          <div>
            <p className="text-sm font-black">⚡ Amazon Now Assist</p>
            <p className="text-xs text-slate-300">
              AI urgent cart · Need-to-Cart in seconds
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-slate-600 px-3 py-1.5 text-sm font-black"
          >
            Close
          </button>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[0.8fr_1.2fr]">
          <form
            onSubmit={onGenerate}
            className="rounded-2xl bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wide text-amber-600">
                  Urgent shortcut
                </p>
                <h2 className="text-xl font-black text-slate-950">
                  What do you need right now?
                </h2>
              </div>

              <label className="flex cursor-pointer items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-700">
                <input
                  type="checkbox"
                  checked={panicMode}
                  onChange={(event) => setPanicMode(event.target.checked)}
                  className="accent-red-600"
                />
                Panic
              </label>
            </div>

            <textarea
              value={userRequest}
              onChange={(event) => setUserRequest(event.target.value)}
              rows={4}
              className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-amber-400 focus:bg-white"
            />

            <div className="mt-3">
              <p className="mb-2 text-xs font-black uppercase text-slate-500">
                Budget
              </p>
              <div className="grid grid-cols-3 gap-2">
                {budgetOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => setBudgetMode(option.value)}
                    className={`rounded-lg border px-2 py-2 text-xs font-black ${
                      budgetMode === option.value
                        ? "border-amber-400 bg-amber-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <p className="mb-2 text-xs font-black uppercase text-slate-500">
                Decision mode
              </p>
              <div className="grid grid-cols-3 gap-2">
                {modeOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => setDecisionMode(option.value)}
                    className={`rounded-lg border px-2 py-2 text-left ${
                      decisionMode === option.value
                        ? "border-amber-400 bg-amber-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <p className="text-xs font-black text-slate-950">
                      {option.label}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {option.helper}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  onClick={() => setUserRequest(prompt)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-amber-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {error ? (
              <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isGenerating}
              className="mt-4 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-black text-slate-950 hover:bg-amber-300 disabled:opacity-70"
            >
              {isGenerating ? "Generating..." : "Generate recommendation deck"}
            </button>
          </form>

          <section className="rounded-2xl bg-white p-4 shadow-sm">
            {!plan ? (
              <div className="flex min-h-[430px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-3xl">
                  ⚡
                </div>
                <h3 className="mt-4 text-xl font-black text-slate-950">
                  AI recommendation deck
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Generate a cart and review one item at a time. Add useful
                  items, skip the rest, and your cart updates instantly.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[0.95fr_1fr]">
                <div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-red-50 p-3">
                      <p className="text-[10px] font-black uppercase text-red-700">
                        Urgency
                      </p>
                      <p className="text-lg font-black text-red-800">
                        {plan.urgencyScore}
                      </p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-3">
                      <p className="text-[10px] font-black uppercase text-emerald-700">
                        Confidence
                      </p>
                      <p className="text-lg font-black text-emerald-800">
                        {plan.confidence.overall}%
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-100 p-3">
                      <p className="text-[10px] font-black uppercase text-slate-600">
                        Mode
                      </p>
                      <p className="text-lg font-black capitalize text-slate-950">
                        {decisionMode}
                      </p>
                    </div>
                  </div>

                  <h3 className="mt-4 text-lg font-black text-slate-950">
                    {plan.cartModes[decisionMode]?.cartTitle ||
                      "AI urgent cart"}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {plan.aiExplanation}
                  </p>

                  <div className="mt-4 rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-black text-slate-950">
                      Why this stands out
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      The app compresses shopping decisions from{" "}
                      {plan.metrics.decisionsReducedFrom} to{" "}
                      {plan.metrics.decisionsReducedTo}, then lets the customer
                      accept or skip each AI-generated item.
                    </p>
                  </div>
                </div>

                <div>
                  {topItem ? (
                    <DeckCard
                      item={topItem}
                      index={
                        buildDeckFromPlan(plan, decisionMode).length -
                        deckItems.length
                      }
                      total={buildDeckFromPlan(plan, decisionMode).length}
                      onAdd={onAddDeckItem}
                      onSkip={onSkipDeckItem}
                      disabled={isGenerating}
                    />
                  ) : (
                    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl bg-emerald-50 p-6 text-center ring-1 ring-emerald-100">
                      <div className="text-4xl">✅</div>
                      <h3 className="mt-3 text-xl font-black text-emerald-900">
                        Deck completed
                      </h3>
                      <p className="mt-2 text-sm text-emerald-800">
                        You reviewed all AI recommendations. Open cart to check
                        selected items.
                      </p>
                    </div>
                  )}

                  {deckItems.length > 0 ? (
                    <p className="mt-4 text-center text-xs font-bold text-slate-500">
                      {deckItems.length} cards remaining
                    </p>
                  ) : null}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [healthStatus, setHealthStatus] = useState("Checking");
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [orders, setOrders] = useState<NowOrder[]>([]);
  const [search, setSearch] = useState("");

  const [assistOpen, setAssistOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const [userRequest, setUserRequest] = useState(
    "4 friends are coming in 30 minutes"
  );
  const [budgetMode, setBudgetMode] = useState<BudgetMode>("balanced");
  const [decisionMode, setDecisionMode] = useState<DecisionMode>("fastest");
  const [panicMode, setPanicMode] = useState(true);

  const [plan, setPlan] = useState<NowPlan | null>(null);
  const [deckItems, setDeckItems] = useState<NowCartItem[]>([]);
  const [cartItems, setCartItems] = useState<NowCartItem[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState("");
  const [checkoutMessage, setCheckoutMessage] = useState("");

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return products;

    return products.filter((product) => {
      return `${product.name} ${product.category || ""} ${product.aisle || ""}`
        .toLowerCase()
        .includes(query);
    });
  }, [products, search]);

  const productsByAisle = useMemo(() => {
    const grouped = new Map<string, StoreProduct[]>();

    filteredProducts.forEach((product) => {
      const key = product.aisle || product.category || "Amazon Now";
      const existing = grouped.get(key) || [];
      grouped.set(key, [...existing, product]);
    });

    return Array.from(grouped.entries());
  }, [filteredProducts]);

  const cartTotal = getCartTotal(cartItems);
  const cartCount = getCartCount(cartItems);
  const cartEta = getCartEta(cartItems);

  async function loadInitialData() {
    try {
      const [health, itemResponse, orderResponse] = await Promise.all([
        getHealth(),
        getItems(),
        getNowOrders(DEMO_USER_ID).catch(() => ({
          success: true,
          count: 0,
          orders: [],
        })),
      ]);

      setHealthStatus(health?.success ? "Live" : "Offline");

      let productList = (itemResponse.items || []).filter(
        (item) => item.entityType === "PRODUCT"
      ) as unknown as StoreProduct[];

      if (!productList.length) {
        await seedNowInventory();
        const freshItems = await getItems();
        productList = (freshItems.items || []).filter(
          (item) => item.entityType === "PRODUCT"
        ) as unknown as StoreProduct[];
      }

      productList.sort((a, b) => {
        return (a.etaMinutes || 99) - (b.etaMinutes || 99);
      });

      setProducts(productList);
      setOrders(orderResponse.orders || []);
    } catch (err) {
      console.error(err);
      setHealthStatus("Offline");
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  function addToCart(item: NowCartItem) {
    setCartItems((current) => {
      const existing = current.find(
        (cartItem) => cartItem.productId === item.productId
      );

      if (existing) {
        return current.map((cartItem) =>
          cartItem.productId === item.productId
            ? {
                ...cartItem,
                quantity:
                  Number(cartItem.quantity || 1) + Number(item.quantity || 1),
              }
            : cartItem
        );
      }

      return [...current, item];
    });
  }

  function removeFromCart(productId: string) {
    setCartItems((current) =>
      current.filter((item) => item.productId !== productId)
    );
  }

  async function handleGenerate(event?: FormEvent) {
    event?.preventDefault();

    const trimmed = userRequest.trim();

    if (!trimmed) {
      setError("Describe what you need urgently.");
      return;
    }

    setError("");
    setCheckoutMessage("");
    setIsGenerating(true);

    try {
      const response = await generateNowPlan({
        userId: DEMO_USER_ID,
        userRequest: trimmed,
        budgetMode,
        decisionMode,
        panicMode,
      });

      setPlan(response.plan);
      setDeckItems(buildDeckFromPlan(response.plan, decisionMode));

      await sendNowFeedback({
        userId: DEMO_USER_ID,
        planId: response.plan.planId,
        action: "generated_recommendation_deck",
        selectedMode: decisionMode,
        note: trimmed,
      }).catch(() => null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to generate deck.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleAddDeckItem() {
    const item = deckItems[0];
    if (!item) return;

    addToCart(item);
    setDeckItems((current) => current.slice(1));

    if (plan) {
      await sendNowFeedback({
        userId: DEMO_USER_ID,
        planId: plan.planId,
        action: "added_to_cart",
        productId: item.productId,
        productName: item.name,
        selectedMode: decisionMode,
        note: "Added from AI recommendation deck.",
      }).catch(() => null);
    }
  }

  async function handleSkipDeckItem() {
    const item = deckItems[0];
    if (!item) return;

    setDeckItems((current) => current.slice(1));

    if (plan) {
      await sendNowFeedback({
        userId: DEMO_USER_ID,
        planId: plan.planId,
        action: "skipped_recommendation",
        productId: item.productId,
        productName: item.name,
        selectedMode: decisionMode,
        note: "Skipped from AI recommendation deck.",
      }).catch(() => null);
    }
  }

  function buildCheckoutPlan(): NowPlan {
    const now = new Date().toISOString();

    if (plan) {
      return {
        ...plan,
        checkoutSummary: {
          ...plan.checkoutSummary,
          estimatedTotal: cartTotal,
          itemCount: cartCount,
          etaMinutes: cartEta,
        },
        cartModes: {
          ...plan.cartModes,
          [decisionMode]: {
            ...plan.cartModes[decisionMode],
            items: cartItems,
            etaMinutes: cartEta,
            cartTitle: "Selected urgent cart",
          },
        },
      };
    }

    return {
      planId: `manual_${Date.now()}`,
      userRequest: "Manual Amazon Now cart",
      needCategory: "manual_cart",
      urgencyLabel: "Medium",
      urgencyScore: 50,
      urgencyReason: "Customer selected products manually.",
      peopleCount: 1,
      timeContext: {
        timeOfDay: "current",
        reason: "Manual storefront order.",
      },
      budgetMode,
      panicMode: false,
      recommendedMode: decisionMode,
      cartModes: {
        fastest: {
          modeLabel: "Fastest",
          etaMinutes: cartEta,
          cartTitle: "Manual Cart",
          items: cartItems,
          modeReason: "Customer selected these items manually.",
        },
        bestValue: {
          modeLabel: "Best Value",
          etaMinutes: cartEta,
          cartTitle: "Manual Cart",
          items: cartItems,
          modeReason: "Customer selected these items manually.",
        },
        mostComplete: {
          modeLabel: "Most Complete",
          etaMinutes: cartEta,
          cartTitle: "Manual Cart",
          items: cartItems,
          modeReason: "Customer selected these items manually.",
        },
      },
      regretPrevention: [],
      substitutions: [],
      confidence: {
        overall: 80,
        needMatch: 80,
        availabilityFit: 85,
        budgetFit: 80,
        completeness: 75,
        reason: "Manual cart created from storefront selections.",
      },
      aiExplanation:
        "This order was created from manual Amazon Now selections.",
      checkoutSummary: {
        estimatedTotal: cartTotal,
        itemCount: cartCount,
        etaMinutes: cartEta,
        oneTapMessage: "Checkout your selected Amazon Now cart.",
      },
      metrics: {
        estimatedTimeToCartSeconds: 0,
        decisionsReducedFrom: cartCount,
        decisionsReducedTo: cartCount,
        forgottenEssentialsPrevented: 0,
      },
      userId: DEMO_USER_ID,
      generatedAt: now,
      modelId: "manual",
    };
  }

  async function handleCheckout() {
    if (!cartItems.length) return;

    setIsCheckingOut(true);
    setCheckoutMessage("");
    setError("");

    try {
      const checkoutPlan = buildCheckoutPlan();

      const response = await checkoutNowOrder({
        userId: DEMO_USER_ID,
        plan: checkoutPlan,
        selectedMode: decisionMode,
      });

      setCheckoutMessage(
        `${response.message}. ${cartCount} items saved to DynamoDB.`
      );

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
    <main className="min-h-screen bg-[#eaeded] text-slate-950">
      <header className="sticky top-0 z-40 bg-[#131921] text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2">
          <div className="flex min-w-fit items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-400 text-base font-black text-slate-950">
              a
            </div>
            <div>
              <p className="text-sm font-black leading-none">Amazon Now</p>
              <p className="text-[10px] text-slate-300">10-min essentials</p>
            </div>
          </div>

          <div className="hidden min-w-fit text-[11px] md:block">
            <p className="text-slate-300">Deliver to</p>
            <p className="font-bold">Gwalior 474001</p>
          </div>

          <div className="flex flex-1 overflow-hidden rounded-md bg-white">
            <select className="hidden bg-slate-100 px-2 text-xs font-bold text-slate-700 outline-none md:block">
              <option>Amazon Now</option>
            </select>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search Amazon Now"
              className="min-w-0 flex-1 px-3 py-2.5 text-sm text-slate-950 outline-none"
            />
            <button className="bg-amber-400 px-4 text-sm font-black text-slate-950">
              🔍
            </button>
          </div>

          <button
            onClick={() => setAssistOpen(true)}
            className="hidden rounded-md bg-[#00a8a8] px-3 py-2 text-xs font-black text-white hover:bg-[#009090] md:block"
          >
            ⚡ Need it now?
          </button>

          <button
            onClick={() => setCartOpen(true)}
            className="min-w-fit rounded-md border border-slate-600 px-3 py-2 text-sm font-black"
          >
            🛒 {cartCount}
          </button>
        </div>

        <nav className="bg-[#232f3e]">
          <div className="mx-auto flex max-w-7xl gap-4 overflow-x-auto px-4 py-1.5 text-xs font-bold text-white">
            {navItems.map((item) => (
              <button key={item} className="min-w-fit hover:text-amber-300">
                {item}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <section className="bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black text-[#00a8a8]">
              amazon now
            </span>
            <button
              onClick={() => setAssistOpen(true)}
              className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-900 md:hidden"
            >
              ⚡ AI urgent cart
            </button>
          </div>

          <p className="text-xs font-medium text-slate-600">
            Backend:{" "}
            <span className="font-black text-emerald-700">{healthStatus}</span>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-4">
        <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#d7f7f2] via-[#fff2c8] to-[#ffdf9f] shadow-sm">
          <div className="grid gap-4 p-5 md:grid-cols-[1.25fr_0.75fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-700">
                Amazon Now Assist
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-4xl">
                Daily essentials, fast. Urgent carts, faster.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
                Shop normally from categories, or use the AI urgent shortcut
                near the cart when you need a complete cart in seconds.
              </p>
              <button
                onClick={() => setAssistOpen(true)}
                className="mt-4 rounded-xl bg-[#131921] px-5 py-2.5 text-sm font-black text-white hover:bg-[#232f3e]"
              >
                ⚡ Open urgent recommendation deck
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {["🥤 Drinks", "🍿 Snacks", "🧻 Essentials", "🍞 Breakfast"].map(
                (item) => (
                  <div
                    key={item}
                    className="flex h-20 items-center justify-center rounded-xl bg-white/80 text-sm font-black text-slate-950 shadow-sm"
                  >
                    {item}
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-[11px] font-black uppercase text-slate-500">
              AI feature
            </p>
            <p className="mt-1 text-lg font-black text-slate-950">
              Need-to-Cart
            </p>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-[11px] font-black uppercase text-slate-500">
              Decision flow
            </p>
            <p className="mt-1 text-lg font-black text-slate-950">Add / Skip</p>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-[11px] font-black uppercase text-slate-500">
              Products
            </p>
            <p className="mt-1 text-lg font-black text-slate-950">
              {products.length}
            </p>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-[11px] font-black uppercase text-slate-500">
              Orders
            </p>
            <p className="mt-1 text-lg font-black text-slate-950">
              {orders.length}
            </p>
          </div>
        </section>

        <section className="mt-4 space-y-5">
          {productsByAisle.length ? (
            productsByAisle.map(([aisle, aisleProducts]) => (
              <div key={aisle} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-950">
                      {aisle}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Fast-moving Amazon Now essentials
                    </p>
                  </div>
                  <button className="text-xs font-black text-[#007185]">
                    See all
                  </button>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-1">
                  {aisleProducts.map((product) => (
                    <SmallProductCard
                      key={product.id}
                      product={product}
                      onAdd={addToCart}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
              Loading Amazon Now products...
            </div>
          )}
        </section>
      </div>

      {cartItems.length ? (
        <div className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 shadow-[0_-8px_25px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-black text-slate-950">
                {cartCount} items · {formatPrice(cartTotal)}
              </p>
              <p className="text-xs text-slate-500">
                Estimated delivery {cartEta} min
              </p>
            </div>

            <button
              onClick={() => setCartOpen(true)}
              className="rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-black text-slate-950 hover:bg-amber-300"
            >
              View cart / Checkout
            </button>
          </div>
        </div>
      ) : null}

      <AssistPanel
        open={assistOpen}
        onClose={() => setAssistOpen(false)}
        userRequest={userRequest}
        setUserRequest={setUserRequest}
        budgetMode={budgetMode}
        setBudgetMode={setBudgetMode}
        decisionMode={decisionMode}
        setDecisionMode={setDecisionMode}
        panicMode={panicMode}
        setPanicMode={setPanicMode}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        plan={plan}
        deckItems={deckItems}
        onAddDeckItem={handleAddDeckItem}
        onSkipDeckItem={handleSkipDeckItem}
        error={error}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
        isCheckingOut={isCheckingOut}
        checkoutMessage={checkoutMessage}
      />
    </main>
  );
}

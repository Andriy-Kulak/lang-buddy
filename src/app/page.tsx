"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { STARTER_CARDS, type LearningCard, type LearningTopic } from "@/lib/cards";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { VoxBot } from "@/components/characters/3d/VoxBot";

const STORAGE_KEYS = {
  cards: "lang-buddy.cards.v1",
  progress: "lang-buddy.progress.v1",
  dailyDeck: "lang-buddy.daily-deck.v1",
} as const;

const DAILY_CARD_TARGET = 20;

type CardProgress = {
  attempts: number;
  mastered: boolean;
  lastReviewed: string | null;
};

type ProgressMap = Record<string, CardProgress>;

type DailyDeck = {
  date: string;
  cardIds: string[];
};

const DEFAULT_PROGRESS: CardProgress = {
  attempts: 0,
  mastered: false,
  lastReviewed: null,
};

const TOPIC_LABELS: Record<LearningTopic, string> = {
  english: "English",
  reading: "Reading",
  science: "Science",
  math: "Math",
};

function readFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function shuffle<T>(values: T[]): T[] {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function pickDailyDeck(cards: LearningCard[], progress: ProgressMap): LearningCard[] {
  const ranked = cards
    .map((card) => {
      const cardProgress = progress[card.id] ?? DEFAULT_PROGRESS;
      return {
        card,
        score: cardProgress.attempts + (cardProgress.mastered ? 6 : 0),
      };
    })
    .sort((a, b) => a.score - b.score);

  const grouped = new Map<number, LearningCard[]>();
  for (const item of ranked) {
    const bucket = grouped.get(item.score) ?? [];
    bucket.push(item.card);
    grouped.set(item.score, bucket);
  }

  const merged: LearningCard[] = [];
  for (const [, group] of grouped) {
    merged.push(...shuffle(group));
  }

  return merged.slice(0, Math.min(DAILY_CARD_TARGET, merged.length));
}

function getProgress(progress: ProgressMap, cardId: string): CardProgress {
  return progress[cardId] ?? DEFAULT_PROGRESS;
}

function makeTutorPrompt(card: LearningCard): string {
  return [
    `Let's practice this card with a child learner.`,
    `Word: "${card.english}"`,
    `Spanish: "${card.spanish}"`,
    `Topic: ${card.topic}`,
    `Context: ${card.context}`,
    `Question: ${card.prompt}`,
    `Please use simple English, include one Spanish support phrase, and wait for a short answer.`,
  ].join(" ");
}

function getStatusTone(status: string): string {
  if (status === "connected" || status === "transcribing") {
    return "bg-emerald-100 text-emerald-800 border-emerald-300";
  }
  if (status === "connecting") {
    return "bg-amber-100 text-amber-800 border-amber-300";
  }
  if (status === "error") {
    return "bg-rose-100 text-rose-800 border-rose-300";
  }
  return "bg-slate-100 text-slate-700 border-slate-300";
}

async function requestConversationToken(): Promise<string> {
  const response = await fetch("/api/elevenlabs/conversation-token", {
    method: "POST",
  });

  const payload = (await response.json().catch(() => ({}))) as {
    conversationToken?: string;
    error?: string;
    details?: string;
  };

  if (!response.ok) {
    const message = payload.error ?? "Could not create a secure ElevenLabs conversation token.";
    throw new Error(message);
  }

  if (!payload.conversationToken) {
    throw new Error("Token endpoint returned no conversation token.");
  }

  return payload.conversationToken;
}

export default function Home() {
  const [cards, setCards] = useState<LearningCard[]>(STARTER_CARDS);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [dailyCardIds, setDailyCardIds] = useState<string[]>([]);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [lastSentMessage, setLastSentMessage] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.8);
  const [micMuted, setMicMuted] = useState(false);
  const lastContextKeyRef = useRef<string | null>(null);

  const publicAgentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

  const conversation = useConversation({
    volume,
    micMuted,
    onError: (event) => {
      const genericMessage =
        "Conversation error. Check your ElevenLabs agent configuration and browser permissions.";

      if (
        typeof event === "object" &&
        event !== null &&
        "message" in event &&
        typeof (event as { message?: unknown }).message === "string"
      ) {
        setLastError((event as { message: string }).message);
        return;
      }

      setLastError(genericMessage);
    },
  });

  const {
    endSession,
    isSpeaking,
    sendContextualUpdate,
    sendUserActivity,
    sendUserMessage,
    setVolume: setConversationVolume,
    startSession,
    status,
  } = conversation;

  useEffect(() => {
    const storedCards = readFromStorage<LearningCard[]>(STORAGE_KEYS.cards, STARTER_CARDS);
    const validCards = storedCards.length > 0 ? storedCards : STARTER_CARDS;
    const storedProgress = readFromStorage<ProgressMap>(STORAGE_KEYS.progress, {});
    const storedDeck = readFromStorage<DailyDeck | null>(STORAGE_KEYS.dailyDeck, null);
    const today = getTodayKey();

    const cardIds = new Set(validCards.map((card) => card.id));
    let selectedCardIds =
      storedDeck?.date === today
        ? storedDeck.cardIds.filter((cardId) => cardIds.has(cardId))
        : [];

    if (selectedCardIds.length === 0) {
      selectedCardIds = pickDailyDeck(validCards, storedProgress).map((card) => card.id);
      window.localStorage.setItem(
        STORAGE_KEYS.dailyDeck,
        JSON.stringify({
          date: today,
          cardIds: selectedCardIds,
        } satisfies DailyDeck),
      );
    }

    setCards(validCards);
    setProgress(storedProgress);
    setDailyCardIds(selectedCardIds);
    setActiveCardId(selectedCardIds[0] ?? null);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEYS.cards, JSON.stringify(cards));
  }, [cards, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
  }, [progress, hydrated]);

  const cardsById = useMemo(
    () => new Map(cards.map((card) => [card.id, card] as const)),
    [cards],
  );

  const dailyCards = useMemo(
    () => dailyCardIds.map((cardId) => cardsById.get(cardId)).filter(Boolean) as LearningCard[],
    [cardsById, dailyCardIds],
  );

  useEffect(() => {
    if (dailyCards.length === 0) {
      return;
    }

    if (!activeCardId || !dailyCards.some((card) => card.id === activeCardId)) {
      setActiveCardId(dailyCards[0].id);
    }
  }, [activeCardId, dailyCards]);

  const activeCard =
    dailyCards.find((card) => card.id === activeCardId) ??
    dailyCards[0] ??
    null;

  const activeCardProgress = activeCard
    ? getProgress(progress, activeCard.id)
    : DEFAULT_PROGRESS;

  const masteredCount = dailyCards.filter(
    (card) => getProgress(progress, card.id).mastered,
  ).length;

  const liveSession = status === "connected";

  useEffect(() => {
    if (!activeCard || !liveSession || !conversationId) {
      return;
    }

    const contextKey = `${conversationId}:${activeCard.id}`;
    if (lastContextKeyRef.current === contextKey) {
      return;
    }

    sendContextualUpdate(
      `Current learning focus is "${activeCard.english}" (${activeCard.spanish}). The learner is a young Spanish-first student practicing English. Keep coaching warm, brief, and concrete.`,
    );
    lastContextKeyRef.current = contextKey;
  }, [activeCard, conversationId, liveSession, sendContextualUpdate]);

  const startConversation = useCallback(async () => {
    setLastError(null);

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setLastError(
        "Microphone permission is required for voice mode. Allow access in your browser settings.",
      );
      return;
    }

    try {
      lastContextKeyRef.current = null;
      const session = publicAgentId
        ? await startSession({
            agentId: publicAgentId,
            connectionType: "webrtc",
          })
        : await startSession({
            conversationToken: await requestConversationToken(),
            connectionType: "webrtc",
          });
      setConversationId(session);

      if (activeCard) {
        sendUserMessage(makeTutorPrompt(activeCard));
      }
    } catch (error) {
      setLastError(
        error instanceof Error
          ? error.message
          : "Could not connect to ElevenLabs. Confirm your agent setup and credentials.",
      );
    }
  }, [activeCard, publicAgentId, sendUserMessage, startSession]);

  const stopConversation = useCallback(async () => {
    setLastError(null);
    try {
      await endSession();
    } finally {
      lastContextKeyRef.current = null;
      setConversationId(null);
    }
  }, [endSession]);

  const sendMessage = useCallback(
    (message: string) => {
      const trimmed = message.trim();
      if (!trimmed) {
        return;
      }

      setLastSentMessage(trimmed);

      if (liveSession) {
        sendUserMessage(trimmed);
      }

      setInputMessage("");
    },
    [liveSession, sendUserMessage],
  );

  const markAttempt = useCallback((cardId: string) => {
    const today = getTodayKey();
    setProgress((previous) => {
      const current = previous[cardId] ?? DEFAULT_PROGRESS;
      return {
        ...previous,
        [cardId]: {
          ...current,
          attempts: current.attempts + 1,
          lastReviewed: today,
        },
      };
    });
  }, []);

  const toggleMastered = useCallback((cardId: string) => {
    const today = getTodayKey();
    setProgress((previous) => {
      const current = previous[cardId] ?? DEFAULT_PROGRESS;
      return {
        ...previous,
        [cardId]: {
          ...current,
          mastered: !current.mastered,
          lastReviewed: today,
        },
      };
    });
  }, []);

  const resetDeck = useCallback(() => {
    const selectedCards = pickDailyDeck(cards, progress);
    const selectedIds = selectedCards.map((card) => card.id);
    const today = getTodayKey();

    setDailyCardIds(selectedIds);
    setActiveCardId(selectedIds[0] ?? null);
    window.localStorage.setItem(
      STORAGE_KEYS.dailyDeck,
      JSON.stringify({
        date: today,
        cardIds: selectedIds,
      } satisfies DailyDeck),
    );
  }, [cards, progress]);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    [],
  );

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_20%_20%,#d4f7ec_0,#f7fbff_45%,#eef6ff_100%)]">
        <p className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 shadow-sm">
          Loading morning session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,#c8fae8_0,#e6f9ff_35%,#f9f8ff_70%,#ffffff_100%)] pb-10">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-6 sm:px-8 sm:pt-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.4)] backdrop-blur">
          <div className="relative p-6 sm:p-8">
            <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-cyan-200/40 blur-3xl" />
            <div className="absolute -left-28 -bottom-20 h-52 w-52 rounded-full bg-emerald-200/50 blur-3xl" />

            <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Morning Check-In
                </p>
                <h1 className="font-display text-3xl text-slate-900 sm:text-4xl">
                  Lang Buddy Tutor
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                  Side-by-side English and Spanish cards with a voice coach for daily
                  practice. Goal: up to {DAILY_CARD_TARGET} cards each morning.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm sm:min-w-[300px]">
                <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Date</p>
                  <p className="mt-1 font-semibold text-slate-800">{todayLabel}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Mastered</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {masteredCount} / {dailyCards.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
          <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl text-slate-900">Today&apos;s Cards</h2>
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                onClick={resetDeck}
              >
                Refresh deck
              </button>
            </div>

            <div className="mt-4 grid max-h-52 gap-2 overflow-auto rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
              {dailyCards.map((card, index) => {
                const cardProgress = getProgress(progress, card.id);
                const isActive = card.id === activeCard?.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setActiveCardId(card.id)}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                      isActive
                        ? "border-teal-300 bg-teal-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Card {index + 1} - {TOPIC_LABELS[card.topic]}
                      </p>
                      <p className="font-semibold text-slate-800">
                        {card.english} / {card.spanish}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        cardProgress.mastered
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {cardProgress.mastered ? "Mastered" : `${cardProgress.attempts} tries`}
                    </span>
                  </button>
                );
              })}
            </div>

            {activeCard ? (
              <div className="mt-5 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-cyan-200 bg-cyan-50/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
                      English
                    </p>
                    <p className="mt-2 font-display text-3xl text-cyan-950">{activeCard.english}</p>
                    <p className="mt-3 text-sm text-cyan-900/90">{activeCard.exampleEnglish}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                      Spanish
                    </p>
                    <p className="mt-2 font-display text-3xl text-emerald-950">{activeCard.spanish}</p>
                    <p className="mt-3 text-sm text-emerald-900/90">{activeCard.exampleSpanish}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Context
                  </p>
                  <p className="mt-1 text-slate-700">{activeCard.context}</p>
                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    Ask: {activeCard.prompt}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => markAttempt(activeCard.id)}
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Mark practiced
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleMastered(activeCard.id)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activeCardProgress.mastered
                        ? "bg-emerald-600 text-white hover:bg-emerald-500"
                        : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    }`}
                  >
                    {activeCardProgress.mastered ? "Unmark mastered" : "Mark mastered"}
                  </button>
                  <button
                    type="button"
                    onClick={() => sendMessage(makeTutorPrompt(activeCard))}
                    className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-800 transition hover:bg-indigo-200"
                  >
                    Coach me on this card
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                No cards found for today. Refresh the deck to regenerate.
              </p>
            )}
          </article>

          <aside className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-slate-900">Voice Buddy</h2>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${getStatusTone(
                  status,
                )}`}
              >
                {status}
              </span>
            </div>

            <div className="mt-5 h-64 w-full rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden cursor-pointer">
              <Canvas camera={{ position: [0, 1.5, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
                <Environment preset="city" />
                <group position={[0, -0.5, 0]}>
                  <VoxBot isSpeaking={isSpeaking} status={status} />
                </group>
                <OrbitControls enableZoom={false} autoRotate={false} target={[0, 0.5, 0]} />
              </Canvas>
            </div>

            <p className="mt-5 text-sm text-slate-600">
              Start a short conversation and let the tutor ask one question at a time.
              Keep answers short and simple.
            </p>

            {!publicAgentId ? (
              <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                Using secure token mode. Set <code>ELEVENLABS_API_KEY</code> and{" "}
                <code>ELEVENLABS_AGENT_ID</code> in <code>.env.local</code>, or set{" "}
                <code>NEXT_PUBLIC_ELEVENLABS_AGENT_ID</code> for public agent mode.
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={liveSession ? stopConversation : startConversation}
                className={`rounded-full px-5 py-2 text-sm font-semibold text-white transition ${
                  liveSession ? "bg-rose-600 hover:bg-rose-500" : "bg-cyan-700 hover:bg-cyan-600"
                }`}
              >
                {liveSession ? "End session" : "Start session"}
              </button>

              <button
                type="button"
                onClick={() => setMicMuted((value) => !value)}
                className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                  micMuted
                    ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {micMuted ? "Mic muted" : "Mic live"}
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Output volume
                <span className="text-slate-700">{Math.round(volume * 100)}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(volume * 100)}
                onChange={(event) => {
                  const nextVolume = Number(event.target.value) / 100;
                  setVolume(nextVolume);
                  setConversationVolume({ volume: nextVolume });
                }}
                className="mt-3 w-full accent-cyan-700"
              />
            </div>

            <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
              <label htmlFor="coach-message" className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Send a message
              </label>
              <textarea
                id="coach-message"
                value={inputMessage}
                onChange={(event) => {
                  setInputMessage(event.target.value);
                  if (liveSession) {
                    sendUserActivity();
                  }
                }}
                placeholder="Example: Help me practice the word parallel lines with one question."
                className="h-24 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none ring-cyan-300 transition focus:ring-2"
              />
              <button
                type="button"
                onClick={() => sendMessage(inputMessage)}
                className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Send to tutor
              </button>
            </div>

            <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Session details
              </p>
              <p className="text-slate-700">
                Mode:{" "}
                <span className="font-semibold text-slate-900">
                  {isSpeaking ? "Tutor speaking" : "Tutor listening"}
                </span>
              </p>
              <p className="text-slate-700">
                Conversation ID:{" "}
                <span className="break-all font-mono text-xs text-slate-900">
                  {conversationId ?? "Not started"}
                </span>
              </p>
              <p className="text-slate-700">
                Last prompt:{" "}
                <span className="font-medium text-slate-900">
                  {lastSentMessage ?? "No prompt sent yet"}
                </span>
              </p>
            </div>

            {lastError ? (
              <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
                {lastError}
              </p>
            ) : null}
          </aside>
        </section>
      </main>
    </div>
  );
}

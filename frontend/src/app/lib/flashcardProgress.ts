import { getAuthSession } from "./storage";

const STORAGE_KEY_PREFIX = "ilumina:aluno:flashcard-progress:v2";

export interface FlashcardProgress {
  colecaoId: string;
  currentIndex: number;
  maxSeenIndex: number;
  totalCards: number;
  updatedAt: string;
}

type ProgressMap = Record<string, FlashcardProgress>;

function getStorageKey(): string {
  const session = getAuthSession();
  const userScope = session?.user.alunoId ?? session?.user.userId ?? "anonymous";
  return `${STORAGE_KEY_PREFIX}:${userScope}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readProgressMap(): ProgressMap {
  if (!isBrowser()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey());
    return raw ? JSON.parse(raw) as ProgressMap : {};
  } catch {
    return {};
  }
}

function writeProgressMap(progressMap: ProgressMap) {
  if (isBrowser()) {
    window.localStorage.setItem(getStorageKey(), JSON.stringify(progressMap));
  }
}

export function getFlashcardProgress(colecaoId: string): FlashcardProgress | null {
  return readProgressMap()[colecaoId] ?? null;
}

export function getAllFlashcardProgress(): ProgressMap {
  return readProgressMap();
}

export function saveFlashcardProgress(colecaoId: string, currentIndex: number, totalCards: number): FlashcardProgress {
  const progressMap = readProgressMap();
  const previous = progressMap[colecaoId];
  const safeTotal = Math.max(0, totalCards);
  const safeCurrent = safeTotal > 0 ? Math.min(Math.max(0, currentIndex), safeTotal - 1) : 0;
  const next: FlashcardProgress = {
    colecaoId,
    currentIndex: safeCurrent,
    maxSeenIndex: Math.max(previous?.maxSeenIndex ?? 0, safeCurrent),
    totalCards: safeTotal,
    updatedAt: new Date().toISOString(),
  };

  progressMap[colecaoId] = next;
  writeProgressMap(progressMap);
  return next;
}

export function getFlashcardProgressPercent(progress: FlashcardProgress | null, totalCards: number): number {
  if (!progress || totalCards <= 0) {
    return 0;
  }

  return Math.min(100, Math.round(((progress.maxSeenIndex + 1) / totalCards) * 100));
}

export function isFlashcardCollectionCompleted(progress: FlashcardProgress | null, totalCards: number): boolean {
  return totalCards > 0 && getFlashcardProgressPercent(progress, totalCards) >= 100;
}

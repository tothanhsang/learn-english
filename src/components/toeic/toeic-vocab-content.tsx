"use client"

import { useState, useEffect, useMemo } from "react"
import {
  BookOpen,
  Layers,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Trophy,
  Search,
  Check,
  X,
  Shuffle,
  Settings,
  Flame,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AudioPlayer } from "@/components/audio-player"
import { ToeicVocabWord } from "@/types/toeic"

interface ToeicVocabContentProps {
  lessonTitle: string
  vocabulary: ToeicVocabWord[]
}

type TabType = "study" | "cards" | "match" | "quiz"

// Spaced repetition types and helpers
interface ProgressItem {
  id: string
  ease: number
  intervalDays: number
  dueAt: number
  lapses: number
  correct: number
  wrong: number
  lastResult: number | null
  lastReviewedAt: number | null
}

interface Progress {
  lesson: string
  createdAt: number
  streak: number
  lastStudyDay: string | null
  totalReviews: number
  items: Record<string, ProgressItem>
}

function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, n))
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function getStorageKey(lesson: string): string {
  return `toeic_vocab_progress_${lesson.replace(/\s+/g, "_").toLowerCase()}`
}

function loadProgress(lesson: string): Progress | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(getStorageKey(lesson))
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveProgress(lesson: string, p: Progress): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(getStorageKey(lesson), JSON.stringify(p))
  } catch {}
}

function initProgress(lesson: string, words: ToeicVocabWord[]): Progress {
  const base: Progress = {
    lesson,
    createdAt: Date.now(),
    streak: 0,
    lastStudyDay: null,
    totalReviews: 0,
    items: {},
  }
  for (const w of words) {
    base.items[w.word] = {
      id: w.word,
      ease: 2.3,
      intervalDays: 0,
      dueAt: Date.now(),
      lapses: 0,
      correct: 0,
      wrong: 0,
      lastResult: null,
      lastReviewedAt: null,
    }
  }
  return base
}

function computeNext(item: ProgressItem, grade: number): ProgressItem {
  const now = Date.now()
  const next = { ...item }
  next.lastReviewedAt = now
  next.lastResult = grade

  if (grade < 3) {
    next.lapses += 1
    next.wrong += 1
    next.intervalDays = 0
    next.dueAt = now + 5 * 60 * 1000
    next.ease = clamp(next.ease - 0.2, 1.3, 2.7)
    return next
  }

  next.correct += 1
  const ease = next.ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
  next.ease = clamp(ease, 1.3, 2.7)

  if (next.intervalDays <= 0) next.intervalDays = 1
  else if (next.intervalDays === 1) next.intervalDays = 3
  else next.intervalDays = Math.round(next.intervalDays * next.ease)

  next.dueAt = now + next.intervalDays * 24 * 60 * 60 * 1000
  return next
}

function pct(n: number, d: number): number {
  if (!d) return 0
  return Math.round((n / d) * 100)
}

function getDueIds(progress: Progress): string[] {
  const now = Date.now()
  return Object.values(progress.items)
    .filter((it) => it.dueAt <= now)
    .sort((a, b) => a.dueAt - b.dueAt)
    .map((x) => x.id)
}

type Mastery = "new" | "learning" | "mastered" | "struggling"

function getMastery(item: ProgressItem): Mastery {
  const total = item.correct + item.wrong
  if (!total) return "new"
  const acc = item.correct / total
  if (acc >= 0.9 && item.intervalDays >= 7) return "mastered"
  if (acc >= 0.7) return "learning"
  return "struggling"
}

function masteryBadge(m: Mastery): { label: string; variant: "new" | "learning" | "mastered" | "destructive" } {
  if (m === "mastered") return { label: "Mastered", variant: "mastered" }
  if (m === "learning") return { label: "Learning", variant: "learning" }
  if (m === "struggling") return { label: "Struggling", variant: "destructive" }
  return { label: "New", variant: "new" }
}

export function ToeicVocabContent({ lessonTitle, vocabulary }: ToeicVocabContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>("study")
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Progress state with spaced repetition
  const [progress, setProgress] = useState<Progress>(() => {
    const loaded = loadProgress(lessonTitle)
    if (loaded?.items && Object.keys(loaded.items).length === vocabulary.length) return loaded
    return initProgress(lessonTitle, vocabulary)
  })

  const [studyQueue, setStudyQueue] = useState<string[]>(() => {
    const loaded = loadProgress(lessonTitle) || initProgress(lessonTitle, vocabulary)
    const due = getDueIds(loaded)
    return due.length ? due : shuffleArray(vocabulary.map((w) => w.word))
  })

  const [cardIndex, setCardIndex] = useState(0)
  const [showBack, setShowBack] = useState(false)

  // Stats
  const dueCount = useMemo(() => getDueIds(progress).length, [progress])

  const stats = useMemo(() => {
    const items = Object.values(progress.items)
    const total = items.length
    const mastered = items.filter((i) => getMastery(i) === "mastered").length
    const totalCorrect = items.reduce((a, b) => a + b.correct, 0)
    const totalWrong = items.reduce((a, b) => a + b.wrong, 0)
    return { total, mastered, totalCorrect, totalWrong, accuracy: pct(totalCorrect, totalCorrect + totalWrong) }
  }, [progress])

  // Persist progress
  useEffect(() => {
    saveProgress(lessonTitle, progress)
  }, [progress, lessonTitle])

  // Re-init progress when vocabulary changes
  useEffect(() => {
    const loaded = loadProgress(lessonTitle)
    if (!loaded || Object.keys(loaded.items).length !== vocabulary.length) {
      const newProgress = initProgress(lessonTitle, vocabulary)
      setProgress(newProgress)
      setStudyQueue(shuffleArray(vocabulary.map((w) => w.word)))
      setCardIndex(0)
    }
  }, [lessonTitle, vocabulary])

  function bumpStreak() {
    const today = todayKey()
    setProgress((p) => {
      const next = { ...p }
      if (next.lastStudyDay === today) return next
      const last = next.lastStudyDay
      const dToday = new Date(today)
      const dLast = last ? new Date(last) : null
      let newStreak = 1
      if (dLast) {
        const diffDays = Math.round((dToday.getTime() - dLast.getTime()) / (24 * 60 * 60 * 1000))
        if (diffDays === 1) newStreak = (next.streak || 0) + 1
        else newStreak = 1
      }
      next.streak = newStreak
      next.lastStudyDay = today
      return next
    })
  }

  function gradeCard(wordId: string, grade: number) {
    bumpStreak()
    setProgress((p) => {
      const next = { ...p, items: { ...p.items } }
      const cur = next.items[wordId]
      if (cur) {
        next.items[wordId] = computeNext(cur, grade)
        next.totalReviews = (next.totalReviews || 0) + 1
      }
      return next
    })
    setShowBack(false)
    setCardIndex((i) => {
      const ni = i + 1
      if (ni >= studyQueue.length) {
        const due = getDueIds(progress)
        const all = vocabulary.map((w) => w.word)
        const rest = all.filter((id) => !due.includes(id))
        const nextQueue = [...due, ...shuffleArray(rest)]
        setStudyQueue(nextQueue)
        return 0
      }
      return ni
    })
  }

  function resetProgress() {
    const p = initProgress(lessonTitle, vocabulary)
    setProgress(p)
    setStudyQueue(shuffleArray(vocabulary.map((w) => w.word)))
    setCardIndex(0)
    setShowBack(false)
  }

  function reshuffle() {
    setStudyQueue((q) => shuffleArray(q))
    setCardIndex(0)
    setShowBack(false)
  }

  function startDueSession() {
    const due = getDueIds(progress)
    if (!due.length) {
      setStudyQueue(shuffleArray(vocabulary.map((w) => w.word)))
    } else {
      setStudyQueue(due)
    }
    setCardIndex(0)
    setShowBack(false)
    setActiveTab("cards")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{lessonTitle}</h1>
          <p className="text-gray-500 dark:text-white/60 mt-1">
            {vocabulary.length} từ vựng cần học
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
          <Settings size={20} />
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/10">
          <div className="text-xs text-gray-500 dark:text-white/50 font-medium uppercase tracking-wider">Due</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{dueCount}</span>
            {dueCount > 0 && (
              <button onClick={startDueSession} className="text-xs text-primary-600 dark:text-accent-pink hover:underline">
                Start
              </button>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/10">
          <div className="text-xs text-gray-500 dark:text-white/50 font-medium uppercase tracking-wider">Streak</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{progress.streak || 0}</span>
            <span className="text-sm text-gray-500 dark:text-white/50">days</span>
          </div>
        </div>
        <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/10">
          <div className="text-xs text-gray-500 dark:text-white/50 font-medium uppercase tracking-wider">Accuracy</div>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stats.accuracy}%</div>
        </div>
        <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/10">
          <div className="text-xs text-gray-500 dark:text-white/50 font-medium uppercase tracking-wider">Mastered</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.mastered}</span>
            <span className="text-sm text-gray-500 dark:text-white/50">/ {stats.total}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl">
        <TabButton
          icon={<BookOpen size={18} />}
          label="Học"
          active={activeTab === "study"}
          onClick={() => setActiveTab("study")}
        />
        <TabButton
          icon={<Layers size={18} />}
          label="Thẻ"
          active={activeTab === "cards"}
          onClick={() => setActiveTab("cards")}
        />
        <TabButton
          icon={<Shuffle size={18} />}
          label="Ghép"
          active={activeTab === "match"}
          onClick={() => setActiveTab("match")}
        />
        <TabButton
          icon={<CheckCircle2 size={18} />}
          label="Quiz"
          active={activeTab === "quiz"}
          onClick={() => setActiveTab("quiz")}
        />
      </div>

      {/* Content */}
      {activeTab === "study" && <StudyView vocabulary={vocabulary} progress={progress} />}
      {activeTab === "cards" && (
        <FlashcardsView
          vocabulary={vocabulary}
          progress={progress}
          studyQueue={studyQueue}
          cardIndex={cardIndex}
          showBack={showBack}
          setShowBack={setShowBack}
          setCardIndex={setCardIndex}
          gradeCard={gradeCard}
          reshuffle={reshuffle}
          startDueSession={startDueSession}
          dueCount={dueCount}
        />
      )}
      {activeTab === "match" && <MatchGameView vocabulary={vocabulary} />}
      {activeTab === "quiz" && <QuizView vocabulary={vocabulary} gradeCard={gradeCard} />}

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Cài đặt</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Đặt lại tiến độ</div>
              <div className="mt-1 text-sm text-gray-500 dark:text-white/60">
                Xóa streak và lịch sử học tập của bài này.
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    resetProgress()
                    setSettingsOpen(false)
                  }}
                >
                  <RotateCcw size={16} className="mr-2" />
                  Đặt lại
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSettingsOpen(false)}>
                  Hủy
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Thông tin</div>
              <div className="mt-1 text-sm text-gray-500 dark:text-white/60">
                Học từ vựng với spaced repetition (SM-2). Tiến độ được lưu cục bộ.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TabButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium flex-1 justify-center ${
        active
          ? "bg-white dark:bg-white/10 text-primary-600 dark:text-accent-pink shadow-sm"
          : "text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}


// Study View
function StudyView({ vocabulary, progress }: { vocabulary: ToeicVocabWord[]; progress: Progress }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredWords = vocabulary.filter(
    (v) =>
      v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.definition.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40 w-5 h-5" />
        <input
          type="text"
          placeholder="Tìm từ vựng..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-pink/50 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Word Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWords.map((item, idx) => {
          const progressItem = progress.items[item.word]
          const mastery = progressItem ? getMastery(progressItem) : "new"
          const badge = masteryBadge(mastery)

          return (
            <div
              key={idx}
              className="bg-white dark:glass-card p-6 rounded-2xl border border-gray-100 dark:border-white/10 hover:shadow-md dark:hover:shadow-accent-pink/10 transition-shadow group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-1">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">{item.word}</h3>
                  <AudioPlayer text={item.word} />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                  <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/60 rounded uppercase tracking-wider">
                    {item.part_of_speech}
                  </span>
                </div>
              </div>
              <p className="text-primary-600 dark:text-accent-pink font-medium mb-4">{item.definition}</p>
              <div className="space-y-2">
                <p className="text-xs text-gray-400 dark:text-white/40 font-bold uppercase tracking-widest">
                  Ví dụ
                </p>
                {item.examples.map((ex, i) => (
                  <p
                    key={i}
                    className="text-sm text-gray-600 dark:text-white/70 italic border-l-2 border-primary-100 dark:border-accent-pink/30 pl-3"
                  >
                    &quot;{ex}&quot;
                  </p>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {filteredWords.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-white/60">
          Không tìm thấy từ vựng phù hợp
        </div>
      )}
    </div>
  )
}

// Flashcards View with Spaced Repetition
function FlashcardsView({
  vocabulary,
  progress,
  studyQueue,
  cardIndex,
  showBack,
  setShowBack,
  setCardIndex,
  gradeCard,
  reshuffle,
  startDueSession,
  dueCount,
}: {
  vocabulary: ToeicVocabWord[]
  progress: Progress
  studyQueue: string[]
  cardIndex: number
  showBack: boolean
  setShowBack: (v: boolean) => void
  setCardIndex: (fn: (i: number) => number) => void
  gradeCard: (wordId: string, grade: number) => void
  reshuffle: () => void
  startDueSession: () => void
  dueCount: number
}) {
  const activeWordId = studyQueue[cardIndex] || vocabulary[0]?.word
  const current = vocabulary.find((v) => v.word === activeWordId) || vocabulary[0]
  const progressItem = progress.items[activeWordId]
  const mastery = progressItem ? getMastery(progressItem) : "new"
  const badge = masteryBadge(mastery)

  const next = () => {
    setShowBack(false)
    setCardIndex((i) => (i + 1) % studyQueue.length)
  }

  const prev = () => {
    setShowBack(false)
    setCardIndex((i) => (i - 1 + studyQueue.length) % studyQueue.length)
  }

  return (
    <div className="flex flex-col items-center py-6">
      <div
        className="w-full max-w-lg aspect-[4/3] cursor-pointer [perspective:1000px]"
        onClick={() => setShowBack(!showBack)}
      >
        <div
          className={`relative w-full h-full text-center transition-all duration-500 [transform-style:preserve-3d] ${
            showBack ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* Front */}
          <div className="absolute inset-0 bg-white dark:glass-card border-2 border-gray-200 dark:border-white/15 rounded-3xl shadow-xl [backface-visibility:hidden] flex flex-col items-center justify-center p-10">
            <Badge variant={badge.variant} className="mb-4">{badge.label}</Badge>
            <h2 className="text-4xl font-black text-gray-800 dark:text-white tracking-tight">
              {current.word}
            </h2>
            <p className="mt-4 text-gray-400 dark:text-white/60 font-medium">{current.part_of_speech}</p>
            <div onClick={(e) => e.stopPropagation()} className="mt-4">
              <AudioPlayer text={current.word} />
            </div>
            <p className="mt-8 text-gray-300 dark:text-white/30 text-sm">Bấm để xem nghĩa</p>
          </div>
          {/* Back */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-accent-pink dark:to-pink-600 text-white rounded-3xl shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col items-center justify-center p-10">
            <span className="text-white/70 text-sm font-bold uppercase tracking-widest mb-4">
              Định nghĩa
            </span>
            <p className="text-2xl font-semibold leading-relaxed mb-6">{current.definition}</p>
            <div className="w-full h-px bg-white/20 mb-6" />
            <p className="text-sm text-white/80 italic">&quot;{current.examples[0]}&quot;</p>
          </div>
        </div>
      </div>

      {/* Grading */}
      {showBack && (
        <div className="mt-6 w-full max-w-lg">
          <p className="text-sm font-medium text-gray-700 dark:text-white/80 mb-3 text-center">Bạn nhớ từ này thế nào?</p>
          <div className="grid grid-cols-4 gap-2">
            <Button variant="destructive" onClick={() => gradeCard(activeWordId, 1)} className="flex-col h-auto py-3">
              <X size={18} />
              <span className="text-xs mt-1">Lại</span>
            </Button>
            <Button variant="outline" onClick={() => gradeCard(activeWordId, 3)} className="flex-col h-auto py-3">
              <span className="text-xs">Tạm</span>
            </Button>
            <Button variant="outline" onClick={() => gradeCard(activeWordId, 4)} className="flex-col h-auto py-3">
              <span className="text-xs">Tốt</span>
            </Button>
            <Button variant="default" onClick={() => gradeCard(activeWordId, 5)} className="flex-col h-auto py-3">
              <Check size={18} />
              <span className="text-xs mt-1">Dễ</span>
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-8 mt-8">
        <Button
          variant="outline"
          size="icon"
          onClick={prev}
          className="w-12 h-12 rounded-full"
        >
          <ChevronLeft size={24} />
        </Button>
        <span className="text-gray-500 dark:text-white/60 font-mono font-bold bg-gray-100 dark:bg-white/10 px-4 py-2 rounded-lg">
          {cardIndex + 1} / {studyQueue.length}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={next}
          className="w-12 h-12 rounded-full"
        >
          <ChevronRight size={24} />
        </Button>
      </div>

      <div className="flex gap-2 mt-4">
        <Button variant="ghost" size="sm" onClick={reshuffle} className="gap-2">
          <Shuffle size={16} />
          Trộn
        </Button>
        <Button variant="ghost" size="sm" onClick={startDueSession} className="gap-2">
          <Flame size={16} />
          Due ({dueCount})
        </Button>
      </div>
    </div>
  )
}

// Match Game View
function MatchGameView({ vocabulary }: { vocabulary: ToeicVocabWord[] }) {
  const [cards, setCards] = useState<
    { id: string; text: string; type: "word" | "def"; matchId: string }[]
  >([])
  const [selected, setSelected] = useState<typeof cards>([])
  const [matched, setMatched] = useState<string[]>([])
  const [gameStatus, setGameStatus] = useState<"playing" | "won">("playing")
  const [startTime, setStartTime] = useState(Date.now())
  const [finishTime, setFinishTime] = useState<number | null>(null)

  const initGame = () => {
    const wordCards = vocabulary.map((v) => ({
      id: `w-${v.word}`,
      text: v.word,
      type: "word" as const,
      matchId: v.word,
    }))
    const defCards = vocabulary.map((v) => ({
      id: `d-${v.word}`,
      text: v.definition,
      type: "def" as const,
      matchId: v.word,
    }))
    const shuffled = [...wordCards, ...defCards].sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setSelected([])
    setMatched([])
    setGameStatus("playing")
    setStartTime(Date.now())
    setFinishTime(null)
  }

  useEffect(() => {
    initGame()
  }, [vocabulary])

  const handleCardClick = (card: (typeof cards)[0]) => {
    if (matched.includes(card.id) || selected.some((s) => s.id === card.id) || selected.length >= 2)
      return

    const newSelected = [...selected, card]
    setSelected(newSelected)

    if (newSelected.length === 2) {
      if (newSelected[0].matchId === newSelected[1].matchId && newSelected[0].type !== newSelected[1].type) {
        const newMatched = [...matched, newSelected[0].id, newSelected[1].id]
        setMatched(newMatched)
        setSelected([])
        if (newMatched.length === cards.length) {
          setGameStatus("won")
          setFinishTime(Date.now())
        }
      } else {
        setTimeout(() => setSelected([]), 800)
      }
    }
  }

  if (gameStatus === "won") {
    return (
      <div className="text-center py-16 bg-white dark:glass-card rounded-3xl border border-gray-200 dark:border-white/10">
        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy size={40} />
        </div>
        <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-4">Tuyệt vời!</h2>
        <p className="text-gray-500 dark:text-white/60 mb-8 text-lg">
          Bạn đã ghép tất cả trong {Math.floor((finishTime! - startTime) / 1000)} giây.
        </p>
        <Button onClick={initGame} className="gap-2">
          <RotateCcw size={18} />
          Chơi lại
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500 dark:text-white/60">
          Đã ghép: {matched.length / 2} / {vocabulary.length}
        </p>
        <Button variant="ghost" size="sm" onClick={initGame} className="gap-2">
          <RotateCcw size={16} />
          Làm mới
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {cards.map((card) => {
          const isSelected = selected.some((s) => s.id === card.id)
          const isMatched = matched.includes(card.id)

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`
                min-h-[100px] p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center text-center text-sm font-medium
                ${isMatched ? "opacity-0 scale-90 pointer-events-none" : ""}
                ${
                  isSelected
                    ? "border-primary-500 dark:border-accent-pink bg-primary-50 dark:bg-accent-pink/10 text-primary-700 dark:text-accent-pink scale-105 z-10"
                    : "border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 hover:border-gray-200 dark:hover:border-white/20 text-gray-700 dark:text-white/80"
                }
              `}
            >
              {card.text}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Quiz View
function QuizView({ vocabulary, gradeCard }: { vocabulary: ToeicVocabWord[]; gradeCard: (wordId: string, grade: number) => void }) {
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [isAnswered, setIsAnswered] = useState(false)

  const currentQuestion = vocabulary[index]

  const options = useMemo(() => {
    const wrongAnswers = vocabulary
      .filter((v) => v.word !== currentQuestion.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((v) => v.word)
    return [...wrongAnswers, currentQuestion.word].sort(() => Math.random() - 0.5)
  }, [index, vocabulary, currentQuestion.word])

  const handleAnswer = (option: string) => {
    if (isAnswered) return
    setSelectedOption(option)
    setIsAnswered(true)
    const isCorrect = option === currentQuestion.word
    if (isCorrect) {
      setScore((s) => s + 1)
      gradeCard(currentQuestion.word, 5)
    } else {
      gradeCard(currentQuestion.word, 1)
    }
  }

  const nextQuestion = () => {
    if (index + 1 < vocabulary.length) {
      setIndex(index + 1)
      setSelectedOption(null)
      setIsAnswered(false)
    } else {
      setShowResults(true)
    }
  }

  const restart = () => {
    setIndex(0)
    setScore(0)
    setSelectedOption(null)
    setShowResults(false)
    setIsAnswered(false)
  }

  if (showResults) {
    const percentage = Math.round((score / vocabulary.length) * 100)
    return (
      <div className="max-w-md mx-auto text-center py-10 bg-white dark:glass-card rounded-3xl border border-gray-200 dark:border-white/10 p-8">
        <Trophy className="w-16 h-16 text-primary-500 dark:text-accent-pink mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Hoàn thành!</h2>
        <p className="text-gray-500 dark:text-white/60 mb-6">
          Bạn đã trả lời đúng {score} / {vocabulary.length} câu
        </p>
        <div className="w-full bg-gray-100 dark:bg-white/10 h-4 rounded-full mb-8 overflow-hidden">
          <div
            className="bg-primary-500 dark:bg-accent-pink h-full transition-all duration-1000"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <Button onClick={restart} className="w-full gap-2">
          <RotateCcw size={18} />
          Làm lại
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-primary-600 dark:text-accent-pink font-bold">Câu {index + 1}</span>
          <p className="text-gray-400 dark:text-white/40 text-sm">Chọn từ đúng với định nghĩa</p>
        </div>
        <span className="text-sm font-bold text-gray-500 dark:text-white/60 bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-lg">
          {index + 1}/{vocabulary.length}
        </span>
      </div>

      {/* Question */}
      <div className="bg-white dark:glass-card rounded-3xl border-2 border-gray-100 dark:border-white/10 p-8">
        <p className="text-xl font-bold text-gray-800 dark:text-white leading-relaxed">
          &quot;{currentQuestion.definition}&quot;
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((opt, i) => {
          let style =
            "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/80 hover:border-primary-300 dark:hover:border-accent-pink/50"
          if (isAnswered) {
            if (opt === currentQuestion.word) {
              style =
                "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 dark:border-emerald-400 text-emerald-700 dark:text-emerald-400"
            } else if (opt === selectedOption) {
              style =
                "bg-rose-50 dark:bg-rose-500/10 border-rose-500 dark:border-rose-400 text-rose-700 dark:text-rose-400"
            } else {
              style =
                "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-300 dark:text-white/30"
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              disabled={isAnswered}
              className={`p-5 rounded-2xl border-2 font-bold text-left transition-all flex items-center justify-between ${style}`}
            >
              <span>{opt}</span>
              {isAnswered && opt === currentQuestion.word && (
                <Check size={20} className="text-emerald-500 dark:text-emerald-400" />
              )}
              {isAnswered && opt === selectedOption && opt !== currentQuestion.word && (
                <X size={20} className="text-rose-500 dark:text-rose-400" />
              )}
            </button>
          )
        })}
      </div>

      {/* Next Button */}
      {isAnswered && (
        <Button onClick={nextQuestion} className="w-full">
          {index + 1 === vocabulary.length ? "Xem kết quả" : "Câu tiếp theo"}
        </Button>
      )}
    </div>
  )
}

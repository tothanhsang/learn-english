"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Layers,
  RotateCcw,
  Search,
  Settings,
  Shuffle,
  X,
} from "lucide-react"
import { AudioPlayer } from "@/components/audio-player"

const LESSON = "Job Advertising and Recruiting"

interface Word {
  id: string
  word: string
  pos: string
  definition: string
  example_a: string
  example_b: string
}

const WORDS: Word[] = [
  {
    id: "abundant",
    word: "abundant",
    pos: "adj.",
    definition: "plentiful, in large quantities",
    example_a: "The computer analyst was glad to have chosen a field in which jobs were abundant.",
    example_b: "The recruiter was surprised by the abundant number of qualified applicants.",
  },
  {
    id: "accomplishment",
    word: "accomplishment",
    pos: "n.",
    definition: "an achievement, a success",
    example_a: "The success of the company was based on its early accomplishments.",
    example_b: "In honor of her accomplishments, the manager was promoted.",
  },
  {
    id: "bring together",
    word: "bring together",
    pos: "v.",
    definition: "to join, to gather",
    example_a: "Every year, the firm brings together its top lawyers and its newest recruits for a training session.",
    example_b: "Our goal this year is to bring together the most creative group we can find.",
  },
  {
    id: "candidate",
    word: "candidate",
    pos: "n.",
    definition: "one being considered for a position, office, or award",
    example_a: "The recruiter will interview all candidates for the position.",
    example_b: "The president of our company is a candidate for the Outstanding Business Award.",
  },
  {
    id: "come up with",
    word: "come up with",
    pos: "v.",
    definition: "to plan, to invent, to think of",
    example_a: "In order for that small business to succeed, it needs to come up with a new strategy.",
    example_b: "How was the new employee able to come up with that cost-cutting idea after only one week on the job?",
  },
  {
    id: "commensurate",
    word: "commensurate",
    pos: "adj.",
    definition: "in proportion to, corresponding, equal to",
    example_a: "Generally the first year's salary is commensurate with experience and education level.",
    example_b: "As mentioned in your packets, the number of new recruits will be commensurate with the number of vacancies at the company.",
  },
  {
    id: "match",
    word: "match",
    pos: "n./v.",
    definition: "a fit, a similarity; to put together, to fit",
    example_a: "It is difficult to make a decision when both candidates seem to be a perfect match.",
    example_b: "A headhunter matches qualified candidates to suitable positions.",
  },
  {
    id: "profile",
    word: "profile",
    pos: "n.",
    definition: "a group of characteristics or traits",
    example_a: "The recruiter told him that, unfortunately, he did not fit the job profile.",
    example_b: "As jobs change, so does the company's profile for the job candidate.",
  },
  {
    id: "qualifications",
    word: "qualifications",
    pos: "n.",
    definition: "requirements, qualities, or abilities needed for something",
    example_a: "The job seeker had done extensive volunteer work and was able to add this experience to his list of qualifications.",
    example_b: "The applicant had so many qualifications that the company created a new position for her.",
  },
  {
    id: "recruit",
    word: "recruit",
    pos: "v./n.",
    definition: "to attract people to join an organization or a cause; a person who is recruited",
    example_a: "When the consulting firm recruited her, they offered to pay her relocation expenses.",
    example_b: "The new recruits spent the entire day in training.",
  },
  {
    id: "submit",
    word: "submit",
    pos: "v.",
    definition: "to present for consideration",
    example_a: "Submit your résumé to the human resources department.",
    example_b: "The applicant submitted all her paperwork in a professional and timely manner.",
  },
  {
    id: "time-consuming",
    word: "time-consuming",
    pos: "adj.",
    definition: "taking up a lot of time, lengthy",
    example_a: "Even though it was time-consuming, all of the participants felt that the open house was very worthwhile.",
    example_b: "Five interviews later, Ms. Lopez had the job, but it was the most time-consuming process she had ever gone through.",
  },
]

const STORAGE_KEY = "vocab_app_progress_v1"

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

function normalizeAnswer(s: string): string {
  return (s || "").trim().toLowerCase().replace(/\s+/g, " ").replace(/['']/g, "'")
}

function shuffle<T>(arr: T[]): T[] {
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

function loadProgress(): Progress | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveProgress(p: Progress): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {}
}

function initProgress(): Progress {
  const base: Progress = {
    lesson: LESSON,
    createdAt: Date.now(),
    streak: 0,
    lastStudyDay: null,
    totalReviews: 0,
    items: {},
  }
  for (const w of WORDS) {
    base.items[w.id] = {
      id: w.id,
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

type TabType = "study" | "cards" | "quiz"

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

export default function VocabLearningPage() {
  const [activeTab, setActiveTab] = useState<TabType>("study")
  const [progress, setProgress] = useState<Progress>(() => {
    const loaded = loadProgress()
    if (loaded?.items) return loaded
    return initProgress()
  })

  const [studyQueue, setStudyQueue] = useState<string[]>(() => {
    const loaded = loadProgress() || initProgress()
    const due = getDueIds(loaded)
    return due.length ? due : shuffle(WORDS.map((w) => w.id))
  })

  const [index, setIndex] = useState(0)
  const [showBack, setShowBack] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [quizInput, setQuizInput] = useState("")
  const [quizResult, setQuizResult] = useState<{ ok: boolean; expected: string } | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const activeId = studyQueue[index] || WORDS[0].id
  const activeWord = useMemo(() => WORDS.find((w) => w.id === activeId) || WORDS[0], [activeId])
  const activeItem = progress.items[activeId]

  const dueCount = useMemo(() => getDueIds(progress).length, [progress])

  const stats = useMemo(() => {
    const items = Object.values(progress.items)
    const total = items.length
    const mastered = items.filter((i) => getMastery(i) === "mastered").length
    const learning = items.filter((i) => getMastery(i) === "learning").length
    const struggling = items.filter((i) => getMastery(i) === "struggling").length
    const fresh = items.filter((i) => getMastery(i) === "new").length
    const totalCorrect = items.reduce((a, b) => a + b.correct, 0)
    const totalWrong = items.reduce((a, b) => a + b.wrong, 0)
    return { total, mastered, learning, struggling, fresh, totalCorrect, totalWrong, accuracy: pct(totalCorrect, totalCorrect + totalWrong) }
  }, [progress])

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

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

  function gradeCard(grade: number) {
    bumpStreak()
    setProgress((p) => {
      const next = { ...p, items: { ...p.items } }
      const cur = next.items[activeId]
      next.items[activeId] = computeNext(cur, grade)
      next.totalReviews = (next.totalReviews || 0) + 1
      return next
    })
    setShowBack(false)
    setIndex((i) => {
      const ni = i + 1
      if (ni >= studyQueue.length) {
        const due = getDueIds(progress)
        const all = WORDS.map((w) => w.id)
        const rest = all.filter((id) => !due.includes(id))
        const nextQueue = [...due, ...shuffle(rest)]
        setStudyQueue(nextQueue)
        return 0
      }
      return ni
    })
  }

  function resetProgress() {
    const p = initProgress()
    setProgress(p)
    setStudyQueue(shuffle(WORDS.map((w) => w.id)))
    setIndex(0)
    setShowBack(false)
    setQuizInput("")
    setQuizResult(null)
  }

  function reshuffle() {
    setStudyQueue((q) => shuffle(q))
    setIndex(0)
    setShowBack(false)
  }

  function startDueSession() {
    const due = getDueIds(progress)
    if (!due.length) {
      setStudyQueue(shuffle(WORDS.map((w) => w.id)))
    } else {
      setStudyQueue(due)
    }
    setIndex(0)
    setShowBack(false)
    setActiveTab("cards")
  }

  const filteredWords = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return WORDS.filter((w) => {
      if (!q) return true
      return w.word.toLowerCase().includes(q) || w.definition.toLowerCase().includes(q)
    })
  }, [searchTerm])

  function quizCheck() {
    const expected = normalizeAnswer(activeWord.word)
    const got = normalizeAnswer(quizInput)
    const ok = got === expected
    setQuizResult({ ok, expected: activeWord.word })
    const grade = ok ? 5 : 2
    gradeCard(grade)
    setQuizInput("")
  }

  const mastery = getMastery(activeItem)
  const badge = masteryBadge(mastery)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{LESSON}</h1>
          <p className="text-gray-500 dark:text-white/60 mt-1">
            {WORDS.length} words to learn
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
          label="Study"
          active={activeTab === "study"}
          onClick={() => setActiveTab("study")}
        />
        <TabButton
          icon={<Layers size={18} />}
          label="Cards"
          active={activeTab === "cards"}
          onClick={() => setActiveTab("cards")}
        />
        <TabButton
          icon={<CheckCircle2 size={18} />}
          label="Quiz"
          active={activeTab === "quiz"}
          onClick={() => setActiveTab("quiz")}
        />
      </div>

      {/* Content */}
      {activeTab === "study" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Search words..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-pink/50 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Word Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWords.map((item) => {
              const it = progress.items[item.id]
              const m = getMastery(it)
              const b = masteryBadge(m)

              return (
                <div
                  key={item.id}
                  className="bg-white dark:glass-card p-6 rounded-2xl border border-gray-100 dark:border-white/10 hover:shadow-md dark:hover:shadow-accent-pink/10 transition-shadow group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-1">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">{item.word}</h3>
                      <AudioPlayer text={item.word} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={b.variant}>{b.label}</Badge>
                      <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/60 rounded uppercase tracking-wider">
                        {item.pos}
                      </span>
                    </div>
                  </div>
                  <p className="text-primary-600 dark:text-accent-pink font-medium mb-4">{item.definition}</p>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 dark:text-white/40 font-bold uppercase tracking-widest">Examples</p>
                    <p className="text-sm text-gray-600 dark:text-white/70 italic border-l-2 border-primary-100 dark:border-accent-pink/30 pl-3">
                      &quot;{item.example_a}&quot;
                    </p>
                    <p className="text-sm text-gray-600 dark:text-white/70 italic border-l-2 border-primary-100 dark:border-accent-pink/30 pl-3">
                      &quot;{item.example_b}&quot;
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredWords.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-white/60">
              No words found
            </div>
          )}
        </div>
      )}

      {activeTab === "cards" && (
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
                  {activeWord.word}
                </h2>
                <p className="mt-4 text-gray-400 dark:text-white/60 font-medium">{activeWord.pos}</p>
                <div onClick={(e) => e.stopPropagation()} className="mt-4">
                  <AudioPlayer text={activeWord.word} />
                </div>
                <p className="mt-8 text-gray-300 dark:text-white/30 text-sm">Tap to reveal</p>
              </div>
              {/* Back */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-accent-pink dark:to-pink-600 text-white rounded-3xl shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col items-center justify-center p-10">
                <span className="text-white/70 text-sm font-bold uppercase tracking-widest mb-4">Definition</span>
                <p className="text-2xl font-semibold leading-relaxed mb-6">{activeWord.definition}</p>
                <div className="w-full h-px bg-white/20 mb-6" />
                <p className="text-sm text-white/80 italic">&quot;{activeWord.example_a}&quot;</p>
              </div>
            </div>
          </div>

          {/* Grading */}
          {showBack && (
            <div className="mt-6 w-full max-w-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-white/80 mb-3 text-center">How well did you know it?</p>
              <div className="grid grid-cols-4 gap-2">
                <Button variant="destructive" onClick={() => gradeCard(1)} className="flex-col h-auto py-3">
                  <X size={18} />
                  <span className="text-xs mt-1">Again</span>
                </Button>
                <Button variant="outline" onClick={() => gradeCard(3)} className="flex-col h-auto py-3">
                  <span className="text-xs">Okay</span>
                </Button>
                <Button variant="outline" onClick={() => gradeCard(4)} className="flex-col h-auto py-3">
                  <span className="text-xs">Good</span>
                </Button>
                <Button variant="default" onClick={() => gradeCard(5)} className="flex-col h-auto py-3">
                  <Check size={18} />
                  <span className="text-xs mt-1">Easy</span>
                </Button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-8 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => { setIndex((i) => (i - 1 + studyQueue.length) % studyQueue.length); setShowBack(false) }}
              className="w-12 h-12 rounded-full"
            >
              <ChevronLeft size={24} />
            </Button>
            <span className="text-gray-500 dark:text-white/60 font-mono font-bold bg-gray-100 dark:bg-white/10 px-4 py-2 rounded-lg">
              {index + 1} / {studyQueue.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => { setIndex((i) => (i + 1) % studyQueue.length); setShowBack(false) }}
              className="w-12 h-12 rounded-full"
            >
              <ChevronRight size={24} />
            </Button>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="ghost" size="sm" onClick={reshuffle} className="gap-2">
              <Shuffle size={16} />
              Shuffle
            </Button>
            <Button variant="ghost" size="sm" onClick={startDueSession} className="gap-2">
              <Flame size={16} />
              Due ({dueCount})
            </Button>
          </div>
        </div>
      )}

      {activeTab === "quiz" && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Progress */}
          <div className="flex justify-between items-center">
            <div>
              <span className="text-primary-600 dark:text-accent-pink font-bold">Question {index + 1}</span>
              <p className="text-gray-400 dark:text-white/40 text-sm">Type the word that matches</p>
            </div>
            <span className="text-sm font-bold text-gray-500 dark:text-white/60 bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-lg">
              {index + 1}/{studyQueue.length}
            </span>
          </div>

          {/* Question */}
          <div className="bg-white dark:glass-card rounded-3xl border-2 border-gray-100 dark:border-white/10 p-8">
            <p className="text-xl font-bold text-gray-800 dark:text-white leading-relaxed">
              &quot;{activeWord.definition}&quot;
            </p>
            <p className="mt-4 text-sm text-gray-500 dark:text-white/50 italic">
              {activeWord.example_a}
            </p>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2">
            <Input
              value={quizInput}
              onChange={(e) => setQuizInput(e.target.value)}
              placeholder="Type the word..."
              className="h-12"
              onKeyDown={(e) => { if (e.key === "Enter") quizCheck() }}
            />
            <Button onClick={quizCheck} className="h-12" disabled={!quizInput.trim()}>
              Check
            </Button>
          </div>

          {quizResult && (
            <div className={`rounded-xl p-4 ${quizResult.ok ? "bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30" : "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30"}`}>
              {quizResult.ok ? (
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Check size={20} />
                  Correct!
                </div>
              ) : (
                <div className="text-red-700 dark:text-red-400">
                  <div className="flex items-center gap-2">
                    <X size={20} />
                    Not quite.
                  </div>
                  <div className="mt-1">
                    Expected: <span className="font-bold">{quizResult.expected}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => { setIndex((i) => Math.max(0, i - 1)); setQuizResult(null) }}
              disabled={index === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              onClick={() => { setIndex((i) => Math.min(studyQueue.length - 1, i + 1)); setQuizResult(null) }}
              disabled={index >= studyQueue.length - 1}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Reset Progress</div>
              <div className="mt-1 text-sm text-gray-500 dark:text-white/60">
                Clear your streak and spaced repetition history.
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
                  Reset
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSettingsOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white">About</div>
              <div className="mt-1 text-sm text-gray-500 dark:text-white/60">
                Vocabulary learning with spaced repetition. Progress is saved locally.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

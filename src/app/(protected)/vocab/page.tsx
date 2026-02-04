"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Dices,
  Flame,
  GraduationCap,
  ListChecks,
  Search,
  Shuffle,
  Sparkles,
  Volume2,
  X,
} from "lucide-react"

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
  return (s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/['']/g, "'")
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
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`
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
  } catch {
    // ignore
  }
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

function speak(text: string): void {
  try {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.95
    u.pitch = 1
    u.lang = "en-US"
    window.speechSynthesis.speak(u)
  } catch {
    // ignore
  }
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

function masteryBadge(m: Mastery): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  if (m === "mastered") return { label: "Mastered", variant: "default" }
  if (m === "learning") return { label: "Learning", variant: "secondary" }
  if (m === "struggling") return { label: "Struggling", variant: "destructive" }
  return { label: "New", variant: "outline" }
}

type Mode = "study" | "quiz" | "list"
type Filter = "all" | "due" | "new" | "learning" | "mastered" | "struggling"

export default function VocabLearningPage() {
  const [mode, setMode] = useState<Mode>("study")
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
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<Filter>("all")

  const [quizInput, setQuizInput] = useState("")
  const [quizResult, setQuizResult] = useState<{ ok: boolean; expected: string } | null>(null)

  const [settingsOpen, setSettingsOpen] = useState(false)

  const activeId = studyQueue[index] || WORDS[0].id
  const activeWord = useMemo(
    () => WORDS.find((w) => w.id === activeId) || WORDS[0],
    [activeId]
  )
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

    return {
      total,
      mastered,
      learning,
      struggling,
      fresh,
      totalCorrect,
      totalWrong,
      accuracy: pct(totalCorrect, totalCorrect + totalWrong),
    }
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
        const diffDays = Math.round(
          (dToday.getTime() - dLast.getTime()) / (24 * 60 * 60 * 1000)
        )
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

  function goPrev() {
    setIndex((i) => Math.max(0, i - 1))
    setShowBack(false)
  }

  function goNext() {
    setIndex((i) => Math.min(studyQueue.length - 1, i + 1))
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
    setMode("study")
  }

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase()
    const now = Date.now()

    return WORDS.filter((w) => {
      const it = progress.items[w.id]
      const m = getMastery(it)

      if (filter === "due" && !(it.dueAt <= now)) return false
      if (filter === "new" && m !== "new") return false
      if (filter === "learning" && m !== "learning") return false
      if (filter === "mastered" && m !== "mastered") return false
      if (filter === "struggling" && m !== "struggling") return false

      if (!q) return true
      return (
        w.word.toLowerCase().includes(q) ||
        w.definition.toLowerCase().includes(q) ||
        w.example_a.toLowerCase().includes(q) ||
        w.example_b.toLowerCase().includes(q)
      )
    })
  }, [search, filter, progress])

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
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 text-zinc-900 dark:text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-white dark:bg-white/5 px-3 py-1 text-sm shadow-sm">
              <GraduationCap className="h-4 w-4" />
              <span className="font-medium">Vocabulary</span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-600 dark:text-zinc-400">{LESSON}</span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
              Learn smarter, not harder
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Flashcards + quiz + spaced repetition. Your progress is saved locally.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={mode === "study" ? "default" : "secondary"}
              onClick={() => setMode("study")}
              className="rounded-2xl"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Study
            </Button>
            <Button
              variant={mode === "quiz" ? "default" : "secondary"}
              onClick={() => setMode("quiz")}
              className="rounded-2xl"
            >
              <Dices className="mr-2 h-4 w-4" />
              Quiz
            </Button>
            <Button
              variant={mode === "list" ? "default" : "secondary"}
              onClick={() => setMode("list")}
              className="rounded-2xl"
            >
              <ListChecks className="mr-2 h-4 w-4" />
              Word list
            </Button>
            <Button
              variant="outline"
              onClick={() => setSettingsOpen(true)}
              className="rounded-2xl"
            >
              Settings
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card className="rounded-3xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Due now
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between">
              <div className="text-3xl font-semibold">{dueCount}</div>
              <Button
                variant="secondary"
                className="rounded-2xl"
                onClick={startDueSession}
              >
                <Flame className="mr-2 h-4 w-4" />
                Start
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between">
              <div className="text-3xl font-semibold">{progress.streak || 0}</div>
              <div className="text-sm text-zinc-500">days</div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between">
              <div className="text-3xl font-semibold">{stats.accuracy}%</div>
              <div className="text-sm text-zinc-500">
                {stats.totalCorrect} ✓ / {stats.totalWrong} ✕
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-12">
          <div className="md:col-span-8">
            <AnimatePresence mode="wait">
              {mode === "study" && (
                <motion.div
                  key="study"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="rounded-3xl shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">
                            Flashcard {index + 1}/{studyQueue.length}
                          </CardTitle>
                          <Badge variant={badge.variant} className="rounded-full">
                            {badge.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-2xl"
                            onClick={() => speak(activeWord.word)}
                            aria-label="Speak"
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-2xl"
                            onClick={reshuffle}
                            aria-label="Shuffle"
                          >
                            <Shuffle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <motion.button
                        onClick={() => setShowBack((s) => !s)}
                        className="w-full rounded-3xl border bg-white dark:bg-white/5 p-5 text-left shadow-sm transition hover:shadow"
                        whileTap={{ scale: 0.99 }}
                      >
                        {!showBack ? (
                          <div>
                            <div className="text-xs text-zinc-500">Tap to reveal</div>
                            <div className="mt-2 flex items-baseline gap-2">
                              <div className="text-3xl font-semibold tracking-tight">
                                {activeWord.word}
                              </div>
                              <div className="text-sm text-zinc-500">
                                {activeWord.pos}
                              </div>
                            </div>
                            <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                              Think: meaning + 1 sentence.
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-xs text-zinc-500">Definition</div>
                            <div className="mt-2 text-lg font-medium">
                              {activeWord.definition}
                            </div>

                            <div className="mt-4 grid gap-3">
                              <div className="rounded-2xl bg-zinc-50 dark:bg-white/5 p-4">
                                <div className="text-xs font-medium text-zinc-500">
                                  Example A
                                </div>
                                <div className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">
                                  {activeWord.example_a}
                                </div>
                              </div>
                              <div className="rounded-2xl bg-zinc-50 dark:bg-white/5 p-4">
                                <div className="text-xs font-medium text-zinc-500">
                                  Example B
                                </div>
                                <div className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">
                                  {activeWord.example_b}
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="rounded-full">
                                Interval: {activeItem.intervalDays}d
                              </Badge>
                              <Badge variant="outline" className="rounded-full">
                                Ease: {activeItem.ease.toFixed(2)}
                              </Badge>
                              <Badge variant="outline" className="rounded-full">
                                Correct: {activeItem.correct}
                              </Badge>
                              <Badge variant="outline" className="rounded-full">
                                Wrong: {activeItem.wrong}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </motion.button>

                      <div className="mt-4 flex flex-col gap-2">
                        <div className="text-sm font-medium">How well did you know it?</div>
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                          <Button
                            variant="destructive"
                            className="rounded-2xl"
                            onClick={() => gradeCard(1)}
                            disabled={!showBack}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Again
                          </Button>
                          <Button
                            variant="secondary"
                            className="rounded-2xl"
                            onClick={() => gradeCard(3)}
                            disabled={!showBack}
                          >
                            Okay
                          </Button>
                          <Button
                            variant="secondary"
                            className="rounded-2xl"
                            onClick={() => gradeCard(4)}
                            disabled={!showBack}
                          >
                            Good
                          </Button>
                          <Button
                            className="rounded-2xl"
                            onClick={() => gradeCard(5)}
                            disabled={!showBack}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Easy
                          </Button>
                        </div>
                        <div className="text-xs text-zinc-500">
                          Tip: you can only grade after revealing the answer.
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <Button
                          variant="outline"
                          className="rounded-2xl"
                          onClick={goPrev}
                          disabled={index === 0}
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Prev
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-2xl"
                          onClick={goNext}
                          disabled={index >= studyQueue.length - 1}
                        >
                          Next
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {mode === "quiz" && (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="rounded-3xl shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-3">
                        <CardTitle className="text-base">
                          Quiz {index + 1}/{studyQueue.length}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={badge.variant} className="rounded-full">
                            {badge.label}
                          </Badge>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-2xl"
                            onClick={() => speak(activeWord.word)}
                            aria-label="Speak"
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-3xl border bg-white dark:bg-white/5 p-5 shadow-sm">
                        <div className="text-xs text-zinc-500">Definition</div>
                        <div className="mt-2 text-lg font-medium">
                          {activeWord.definition}
                        </div>
                        <div className="mt-4 grid gap-3">
                          <div className="rounded-2xl bg-zinc-50 dark:bg-white/5 p-4">
                            <div className="text-xs font-medium text-zinc-500">
                              Example
                            </div>
                            <div className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">
                              {activeWord.example_a}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center gap-2">
                          <Input
                            value={quizInput}
                            onChange={(e) => setQuizInput(e.target.value)}
                            placeholder="Type the word..."
                            className="h-11 rounded-2xl"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") quizCheck()
                            }}
                          />
                          <Button
                            onClick={quizCheck}
                            className="h-11 rounded-2xl"
                            disabled={!quizInput.trim()}
                          >
                            Check
                          </Button>
                        </div>

                        {quizResult && (
                          <div className="mt-3 rounded-2xl border bg-white dark:bg-white/5 p-4 text-sm">
                            {quizResult.ok ? (
                              <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                                <Check className="h-4 w-4" />
                                Correct!
                              </div>
                            ) : (
                              <div className="text-zinc-800 dark:text-zinc-200">
                                <div className="flex items-center gap-2">
                                  <X className="h-4 w-4" />
                                  Not quite.
                                </div>
                                <div className="mt-1 text-zinc-600 dark:text-zinc-400">
                                  Expected: <span className="font-medium">{quizResult.expected}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <Button
                          variant="outline"
                          className="rounded-2xl"
                          onClick={goPrev}
                          disabled={index === 0}
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Prev
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-2xl"
                          onClick={goNext}
                          disabled={index >= studyQueue.length - 1}
                        >
                          Next
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {mode === "list" && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="rounded-3xl shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <CardTitle className="text-base">All words</CardTitle>
                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                          <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <Input
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              placeholder="Search words, meanings, examples..."
                              className="h-11 w-full rounded-2xl pl-10 md:w-[320px]"
                            />
                          </div>

                          <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
                            <SelectTrigger className="h-11 w-full rounded-2xl md:w-[200px]">
                              <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="due">Due</SelectItem>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="learning">Learning</SelectItem>
                              <SelectItem value="mastered">Mastered</SelectItem>
                              <SelectItem value="struggling">Struggling</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid gap-3">
                        {filteredList.map((w) => {
                          const it = progress.items[w.id]
                          const m = getMastery(it)
                          const b = masteryBadge(m)

                          return (
                            <div
                              key={w.id}
                              className="rounded-3xl border bg-white dark:bg-white/5 p-4 shadow-sm"
                            >
                              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <div className="flex items-baseline gap-2">
                                    <div className="text-xl font-semibold">{w.word}</div>
                                    <div className="text-sm text-zinc-500">{w.pos}</div>
                                    <Badge
                                      variant={b.variant}
                                      className="ml-1 rounded-full"
                                    >
                                      {b.label}
                                    </Badge>
                                  </div>
                                  <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                                    {w.definition}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-2xl"
                                    onClick={() => speak(w.word)}
                                    aria-label="Speak"
                                  >
                                    <Volume2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    className="rounded-2xl"
                                    onClick={() => {
                                      setStudyQueue([w.id, ...studyQueue.filter((id) => id !== w.id)])
                                      setIndex(0)
                                      setMode("study")
                                      setShowBack(false)
                                    }}
                                  >
                                    Study
                                  </Button>
                                </div>
                              </div>

                              <div className="mt-3 grid gap-2 md:grid-cols-2">
                                <div className="rounded-2xl bg-zinc-50 dark:bg-white/5 p-3 text-sm text-zinc-800 dark:text-zinc-200">
                                  {w.example_a}
                                </div>
                                <div className="rounded-2xl bg-zinc-50 dark:bg-white/5 p-3 text-sm text-zinc-800 dark:text-zinc-200">
                                  {w.example_b}
                                </div>
                              </div>

                              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                                <span className="rounded-full border bg-white dark:bg-white/5 px-2 py-1">
                                  Interval: {it.intervalDays}d
                                </span>
                                <span className="rounded-full border bg-white dark:bg-white/5 px-2 py-1">
                                  Ease: {it.ease.toFixed(2)}
                                </span>
                                <span className="rounded-full border bg-white dark:bg-white/5 px-2 py-1">
                                  Correct: {it.correct}
                                </span>
                                <span className="rounded-full border bg-white dark:bg-white/5 px-2 py-1">
                                  Wrong: {it.wrong}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {!filteredList.length && (
                        <div className="rounded-3xl border bg-white dark:bg-white/5 p-6 text-sm text-zinc-600 dark:text-zinc-400">
                          No results.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="md:col-span-4">
            <Card className="rounded-3xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <div className="rounded-3xl border bg-white dark:bg-white/5 p-4">
                    <div className="text-xs text-zinc-500">Words</div>
                    <div className="mt-1 text-2xl font-semibold">{stats.total}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-3xl border bg-white dark:bg-white/5 p-4">
                      <div className="text-xs text-zinc-500">New</div>
                      <div className="mt-1 text-xl font-semibold">{stats.fresh}</div>
                    </div>
                    <div className="rounded-3xl border bg-white dark:bg-white/5 p-4">
                      <div className="text-xs text-zinc-500">Learning</div>
                      <div className="mt-1 text-xl font-semibold">{stats.learning}</div>
                    </div>
                    <div className="rounded-3xl border bg-white dark:bg-white/5 p-4">
                      <div className="text-xs text-zinc-500">Mastered</div>
                      <div className="mt-1 text-xl font-semibold">{stats.mastered}</div>
                    </div>
                    <div className="rounded-3xl border bg-white dark:bg-white/5 p-4">
                      <div className="text-xs text-zinc-500">Struggling</div>
                      <div className="mt-1 text-xl font-semibold">{stats.struggling}</div>
                    </div>
                  </div>

                  <div className="rounded-3xl border bg-white dark:bg-white/5 p-4">
                    <div className="text-xs text-zinc-500">Total reviews</div>
                    <div className="mt-1 text-2xl font-semibold">
                      {progress.totalReviews || 0}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="secondary"
                      className="rounded-2xl"
                      onClick={startDueSession}
                    >
                      <Flame className="mr-2 h-4 w-4" />
                      Study due words
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-2xl"
                      onClick={reshuffle}
                    >
                      <Shuffle className="mr-2 h-4 w-4" />
                      Shuffle session
                    </Button>
                  </div>

                  <div className="rounded-3xl border bg-white dark:bg-white/5 p-4">
                    <div className="text-xs font-medium text-zinc-500">Quick tips</div>
                    <ul className="mt-2 list-disc pl-5 text-sm text-zinc-700 dark:text-zinc-300">
                      <li>Reveal → grade honestly.</li>
                      <li>Use Quiz to force recall.</li>
                      <li>Tap the speaker to practice pronunciation.</li>
                      <li>Do 5 minutes daily for streak.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="rounded-3xl border bg-white dark:bg-white/5 p-4">
              <div className="text-sm font-medium">Reset progress</div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Clears your streak and spaced repetition history.
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="destructive"
                  className="rounded-2xl"
                  onClick={() => {
                    resetProgress()
                    setSettingsOpen(false)
                  }}
                >
                  Reset
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => setSettingsOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border bg-white dark:bg-white/5 p-4">
              <div className="text-sm font-medium">About</div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Vocabulary learning with spaced repetition. Progress is saved in localStorage.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

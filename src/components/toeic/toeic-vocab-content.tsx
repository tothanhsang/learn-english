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
  Volume2,
  Shuffle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToeicVocabWord } from "@/types/toeic"

interface ToeicVocabContentProps {
  lessonTitle: string
  vocabulary: ToeicVocabWord[]
}

type TabType = "study" | "cards" | "match" | "quiz"

export function ToeicVocabContent({ lessonTitle, vocabulary }: ToeicVocabContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>("study")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{lessonTitle}</h1>
        <p className="text-gray-500 dark:text-white/60 mt-1">
          {vocabulary.length} từ vựng cần học
        </p>
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
      {activeTab === "study" && <StudyView vocabulary={vocabulary} />}
      {activeTab === "cards" && <FlashcardsView vocabulary={vocabulary} />}
      {activeTab === "match" && <MatchGameView vocabulary={vocabulary} />}
      {activeTab === "quiz" && <QuizView vocabulary={vocabulary} />}
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

// Audio helper
function playAudio(text: string) {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-US"
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }
}

// Study View
function StudyView({ vocabulary }: { vocabulary: ToeicVocabWord[] }) {
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
        {filteredWords.map((item, idx) => (
          <div
            key={idx}
            className="bg-white dark:glass-card p-6 rounded-2xl border border-gray-100 dark:border-white/10 hover:shadow-md dark:hover:shadow-accent-pink/10 transition-shadow group"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{item.word}</h3>
                <button
                  onClick={() => playAudio(item.word)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-white/40 hover:text-primary-600 dark:hover:text-accent-pink transition-colors"
                >
                  <Volume2 size={16} />
                </button>
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/60 rounded uppercase tracking-wider">
                {item.part_of_speech}
              </span>
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
        ))}
      </div>

      {filteredWords.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-white/60">
          Không tìm thấy từ vựng phù hợp
        </div>
      )}
    </div>
  )
}

// Flashcards View
function FlashcardsView({ vocabulary }: { vocabulary: ToeicVocabWord[] }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const current = vocabulary[index]

  const next = () => {
    setFlipped(false)
    setTimeout(() => setIndex((i) => (i + 1) % vocabulary.length), 150)
  }

  const prev = () => {
    setFlipped(false)
    setTimeout(() => setIndex((i) => (i - 1 + vocabulary.length) % vocabulary.length), 150)
  }

  return (
    <div className="flex flex-col items-center py-6">
      <div
        className="w-full max-w-lg aspect-[4/3] cursor-pointer [perspective:1000px]"
        onClick={() => setFlipped(!flipped)}
      >
        <div
          className={`relative w-full h-full text-center transition-all duration-500 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* Front */}
          <div className="absolute inset-0 bg-white dark:glass-card border-2 border-gray-200 dark:border-white/15 rounded-3xl shadow-xl [backface-visibility:hidden] flex flex-col items-center justify-center p-10">
            <span className="text-primary-500 dark:text-accent-pink text-sm font-bold uppercase tracking-widest mb-4">
              Từ vựng
            </span>
            <h2 className="text-4xl font-black text-gray-800 dark:text-white tracking-tight">
              {current.word}
            </h2>
            <p className="mt-4 text-gray-400 dark:text-white/60 font-medium">{current.part_of_speech}</p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                playAudio(current.word)
              }}
              className="mt-4 p-3 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-600 dark:text-white/80 transition-colors"
            >
              <Volume2 size={24} />
            </button>
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
          {index + 1} / {vocabulary.length}
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
function QuizView({ vocabulary }: { vocabulary: ToeicVocabWord[] }) {
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
    if (option === currentQuestion.word) setScore((s) => s + 1)
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

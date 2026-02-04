"use client"

import { ChevronDown, Book } from "lucide-react"
import { ToeicLesson } from "@/types/toeic"

interface ToeicLessonSelectorProps {
  lessons: ToeicLesson[]
  currentLesson: number
  onLessonChange: (index: number) => void
}

export function ToeicLessonSelector({
  lessons,
  currentLesson,
  onLessonChange,
}: ToeicLessonSelectorProps) {
  return (
    <div className="relative">
      <select
        value={currentLesson}
        onChange={(e) => onLessonChange(Number(e.target.value))}
        className="appearance-none w-full px-4 py-3 pl-10 pr-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white font-medium cursor-pointer focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-pink/50 outline-none"
      >
        {lessons.map((lesson, idx) => (
          <option key={idx} value={idx}>
            {lesson.lesson_title}
          </option>
        ))}
      </select>
      <Book className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/40 pointer-events-none" />
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/40 pointer-events-none" />
    </div>
  )
}

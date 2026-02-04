"use client"

import { useState } from "react"
import { ToeicVocabContent } from "@/components/toeic/toeic-vocab-content"
import { ToeicLessonSelector } from "@/components/toeic/toeic-lesson-selector"
import lesson11 from "../../../../vocabularys-600-toeic/lessons-11.json"
import lesson12 from "../../../../vocabularys-600-toeic/lessons-12.json"

const lessons = [lesson11, lesson12]

export default function ToeicPage() {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const currentLesson = lessons[currentLessonIndex]

  return (
    <div className="space-y-6">
      <ToeicLessonSelector
        lessons={lessons}
        currentLesson={currentLessonIndex}
        onLessonChange={setCurrentLessonIndex}
      />
      <ToeicVocabContent
        lessonTitle={currentLesson.lesson_title}
        vocabulary={currentLesson.vocabulary}
      />
    </div>
  )
}

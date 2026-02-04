import { ToeicVocabContent } from "@/components/toeic/toeic-vocab-content"
import lesson11 from "../../../../vocabularys-600-toeic/lessons-11.json"

export default function ToeicPage() {
  return (
    <ToeicVocabContent
      lessonTitle={lesson11.lesson_title}
      vocabulary={lesson11.vocabulary}
    />
  )
}

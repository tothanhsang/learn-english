export interface ToeicVocabWord {
  word: string
  part_of_speech: string
  definition: string
  examples: string[]
}

export interface ToeicLesson {
  lesson_title: string
  vocabulary: ToeicVocabWord[]
}

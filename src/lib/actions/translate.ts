'use server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export async function translateToVietnamese(text: string): Promise<string> {
  if (!text.trim()) return ''

  // If no API key, return empty (user can still manually enter)
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not set, skipping translation')
    return ''
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Dịch nghĩa tiếng Anh sau sang tiếng Việt ngắn gọn, chỉ trả về bản dịch không giải thích thêm:\n\n"${text}"`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 100,
          }
        })
      }
    )

    if (!response.ok) {
      console.error('Gemini API error:', response.status)
      return ''
    }

    const data = await response.json()
    const translated = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Clean up response (remove quotes if present)
    return translated.replace(/^["']|["']$/g, '').trim()
  } catch (error) {
    console.error('Translation error:', error)
    return ''
  }
}

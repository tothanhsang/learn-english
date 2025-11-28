# Text-to-Speech (TTS) Options Research for Vocabulary Learning App

**Date**: November 27, 2025
**Purpose**: MVP-focused cost-effective TTS solution evaluation

---

## Executive Summary

Four primary TTS solutions evaluated for vocabulary learning app: **Web Speech API** (free, inconsistent quality), **Google Cloud TTS** (superior quality, $4/1M chars), **Amazon Polly** (competitive, $4-16/1M chars), **free alternatives** (limited quality, offline capable). **Recommendation for MVP: Web Speech API + Google Cloud TTS fallback**. Web Speech API provides zero-cost option with acceptable English pronunciation; upgrade to Google Cloud for production when budget available. Avoids upfront cloud costs while maintaining quality path.

---

## Technology Comparison Matrix

| Aspect | Web Speech API | Google Cloud TTS | Amazon Polly | ResponsiveVoice |
|--------|---|---|---|---|
| **Cost** | Free | $4/1M chars | $4/1M chars std, $16/1M neural | Free (non-commercial) |
| **Quality** | Variable (OS-dependent) | Excellent (WaveNet neural) | Good-Excellent (neural option) | Good (cloud-based) |
| **Offline** | No | No | No | No |
| **Implementation** | Native JS | API integration | AWS SDK | CDN script |
| **English Voices** | 2-4 | 50+ | 20+ | 51 languages |
| **Pronunciation Control** | Basic | SSML + natural language | SSML + lexicons | Limited |

---

## Detailed Analysis

### 1. Web Speech API (Browser Native)
**Pros:**
- Zero cost, zero setup, zero API keys
- Built into all modern browsers (Chrome, Firefox, Safari, Edge)
- Instant deployment, no backend required
- Acceptable English pronunciation for most vocabulary use cases
- Low latency (local synthesis)

**Cons:**
- Voice quality varies dramatically by OS (Windows voices sound robotic; macOS/iOS significantly better)
- Limited control over pronunciation
- No guaranteed consistency across devices
- Deprecated in some browser contexts; not guaranteed long-term support

**Best For:** MVP prototyping, budget-constrained launches

---

### 2. Google Cloud Text-to-Speech
**Pricing:** $4.00 per 1M characters (standard/WaveNet voices after free trial)
**Free Tier:** $300 credit (new customers)

**Quality Highlights:**
- DeepMind WaveNet neural synthesis: near-human quality
- 380+ voices across 75+ languages
- 50+ high-quality English voices with various accents
- Advanced SSML control: pitch, rate, emphasis, pausing
- Natural language prompts for emotional range control

**Pros:**
- Industry-leading voice quality
- Extensive customization for pronunciation
- Real-time streaming available
- Custom voice creation possible (10s audio minimum)

**Cons:**
- Requires backend integration + API authentication
- Cloud dependency (latency ~200-500ms)
- After free trial, ongoing costs

**Calculation:** 100 vocabulary words × 10 characters avg = 1K chars/day = 30K/month = $0.12/month at scale. Negligible cost.

---

### 3. Amazon Polly
**Pricing:** $4/1M chars (standard), $16/1M chars (neural)
**Free Tier:** 5M standard/month for 12 months

**Quality Highlights:**
- 100+ voices in 40+ languages
- Neural voices comparable to Google Cloud quality
- Speech Synthesis Markup Language (SSML) support
- Custom lexicons for special pronunciations
- Long-Form voices for extended content ($100/1M chars)

**Pros:**
- AWS ecosystem integration (easier if using AWS stack)
- Output caching at no additional cost
- Generous free tier (5M chars/month)
- Speech Marks feature (word-level timing metadata)

**Cons:**
- Slightly higher neural pricing ($16 vs $4 standard)
- Less intuitive API than Google Cloud
- Requires AWS account setup

---

### 4. Open Source / Free Alternatives
**Key Options:** Coqui TTS, Mimic 3, Flite, OpenTTS

**Pros:**
- Completely free
- Offline capable (self-hosted)
- Privacy-focused

**Cons:**
- Significantly lower voice quality for English
- Requires backend infrastructure (hosting, maintenance)
- Limited to few voices
- Complex setup for web integration
- Poor prosody (intonation, naturalness) for vocabulary learning

**Not Recommended for Vocabulary App:** Voice quality critical for language learning; poor quality undermines core pedagogical purpose.

---

## MVP Recommendation: Hybrid Approach

**Phase 1 (MVP Launch - Week 1-2):**
1. Implement Web Speech API as primary TTS
2. Use native browser voices (sufficient for MVP)
3. Zero infrastructure cost
4. Test user reception of voice-based learning

**Phase 2 (Beta - Week 3-4, if user feedback positive):**
1. Integrate Google Cloud TTS as fallback/premium option
2. Use $300 free credit (covers ~2.5M character synthesis)
3. Implement smart routing: Web Speech for basic use, Google Cloud for premium features
4. Validate demand before committed spend

**Phase 3 (Production - Month 2+):**
1. Full Google Cloud TTS migration (if traction exists)
2. Monthly cost: $2-5 for typical vocabulary app usage
3. Superior voice quality, consistent experience across devices
4. SSML-based pronunciation hints for difficult words

---

## Implementation Complexity

**Web Speech API:** 10 lines of code
```javascript
const utterance = new SpeechSynthesisUtterance(word);
utterance.lang = 'en-US';
speechSynthesis.speak(utterance);
```

**Google Cloud TTS:** Requires backend API integration (Node.js/Python), credential management, ~100 lines of code

**Verdict:** MVP uses Web Speech (minimal friction); upgrade path clear to Google Cloud.

---

## Cost Analysis (First Year)

| Scenario | Cost |
|----------|------|
| Web Speech API only | $0 |
| Web Speech MVP + Google Cloud $300 credit | $0 (covers 6 months typical usage) |
| Full Google Cloud ($4/1M chars) | $24-60/year for 6-15M chars |
| Amazon Polly ($4 standard) | $0-60 (covered by 5M/month free tier) |

---

## Unresolved Questions

1. **User pronunciation validation needed?** (Current research assumes one-way TTS; if requiring speech-to-text feedback, costs increase 2-3x)
2. **Target user base geography?** (Affects voice accent selection; US vs UK vs Australian English vary significantly)
3. **Offline requirement?** (Not addressed in MVP; if critical, re-evaluate open-source options despite quality trade-offs)

---

## Sources

- [MDN: Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API)
- [Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech)
- [Google Cloud TTS Pricing](https://cloud.google.com/text-to-speech/pricing)
- [Amazon Polly](https://aws.amazon.com/polly/)
- [Amazon Polly Pricing](https://aws.amazon.com/polly/pricing/)
- [ResponsiveVoice](https://responsivevoice.org/)
- [Best TTS APIs 2025 - Eden AI](https://www.edenai.co/post/best-text-to-speech-apis)
- [TTS for Language Learning - Preply](https://preply.com/en/blog/the-best-text-to-speech-apps/)

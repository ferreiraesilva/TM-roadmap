# Spike: Audio Transcription Benchmark for Voice Messages

## Status

In Progress

## Product

MinhaIncorporadora

## Related Epic or Initiative

PR-0005

## Question

What is the most accurate, low-latency, and cost-effective audio transcription model/service to convert broker voice messages into text?

## Context

Brokers interacting with the MinhaIncorporadora sales assistant on messaging channels (like Telegram or WhatsApp) occasionally send voice messages instead of typing. Currently, the system registers the audio file as an attachment but fails to transcribe it, leading to empty text queries and a lack of response from the AI. To support voice-based interaction, we must integrate an audio transcription layer. We need to evaluate available alternatives to find a solution that balances cost, accuracy (especially for Brazilian Portuguese in a real estate context), and response latency.

## Research Scope

1. **Evaluate Transcription Providers:**
   - OpenAI Whisper API (hosted by OpenAI).
   - Whisper-large-v3 / Distil-Whisper via OpenRouter (or Groq, if applicable).
   - Deepgram (Nova-2 model).
   - Local/Self-hosted Whisper options (Whisper.cpp, Faster-Whisper on CPU/GPU).
2. **Key Metrics to Compare:**
   - **Cost:** Cost per minute of audio transcribed.
   - **Latency:** Round-trip response time for typical voice messages (5 seconds to 1 minute).
   - **Accuracy:** Quality of Brazilian Portuguese transcription, including real estate terms, numbers (prices, areas), and common speech patterns.
   - **Formats supported:** Ease of handling typical formats sent by Telegram (.ogg/Opus) and WhatsApp (.ogg/Opus, .m4a).
3. **Integration Complexity:**
   - Authentication, API limits, and SDK availability.

## Out of Scope

- Implementing the final production voice-message ingestion pipeline in MinhaIncorporadora.
- Building custom audio player interfaces in the channels.

## Expected Output

- Benchmark report comparing cost, latency, and accuracy of the evaluated models.
- Technical recommendation on the best provider and configuration for MinhaIncorporadora.
- Decision record or RFC outlining the selected architecture.

## Timebox

3 days.

## Findings

We executed a benchmark comparing three primary approaches using an audio test file (14-second WAV file, 576 KB) over the OpenRouter API:

1. **Dedicated Speech-to-Text Endpoint (`openai/whisper-1` via `/audio/transcriptions`):**
   - **Latency:** ~1.8 - 2.04 seconds.
   - **Cost:** $0.0014 per request ($0.006 per minute / $0.0001 per second).
   - **Accuracy:** Excellent. Correctly spelled the proper noun "Nuphonic" and delivered punctuation naturally.
   - **Pros:** Fast execution, high accuracy on specialized terms.
   - **Cons:** More expensive than Gemini multimodal alternatives.

2. **Multimodal LLM (`google/gemini-2.5-flash-lite` via `/chat/completions`):**
   - **Latency:** ~2.70 seconds.
   - **Cost:** $0.000129 per request (approximately **11 times cheaper** than Whisper-1).
   - **Accuracy:** Good. Transcribed standard speech perfectly but missed the specific proper noun "Nuphonic" (transcribed as "Nthnik").
   - **Pros:** Extremely cost-efficient ($0.10/M prompt tokens, $0.30/M audio tokens).
   - **Cons:** Slightly higher latency, minor proper noun spelling issues.

3. **Multimodal LLM (`google/gemini-2.5-flash` via `/chat/completions`):**
   - **Latency:** ~2.57 seconds.
   - **Cost:** $0.0004885 per request (approximately **3 times cheaper** than Whisper-1).
   - **Accuracy:** Very Good. Transcribed the proper noun as "Nuthonic".
   - **Pros:** Better reasoning/context-aware transcription than Lite.
   - **Cons:** Slower than Whisper, more expensive than Lite.

## Recommendation

For the **MinhaIncorporadora** production environment:
- **Primary Recommendation:** Use **`google/gemini-2.5-flash-lite`** as the default option because of its unparalleled cost efficiency (nearly 11x cheaper than Whisper-1) and acceptable latency (~2.7s). Since broker audio messages mostly contain common speech (e.g. asking for floor plans, prices, or handling general questions), standard Portuguese language spelling is sufficient, and the LLM's context window can rectify minor spelling errors.
- **Fallback/Alternative:** If high accuracy on complex proper nouns (e.g., specific buyer names or exotic neighborhood names) is critical, **`openai/whisper-1`** can be used as a premium alternative.

## Follow-up Issues

- [ ] RFC-0009: Inbound Voice Message Ingest and Transcription Pipeline
- [ ] US-0009: As a broker, I want to send voice messages so that I can query the assistant on the go

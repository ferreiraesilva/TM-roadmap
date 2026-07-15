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

*(To be filled during the investigation)*

## Recommendation

*(To be filled during the investigation)*

## Follow-up Issues

- [ ] RFC-0009: Inbound Voice Message Ingest and Transcription Pipeline
- [ ] US-0009: As a broker, I want to send voice messages so that I can query the assistant on the go

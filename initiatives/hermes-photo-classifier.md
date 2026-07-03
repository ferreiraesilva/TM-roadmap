# Initiative: Hermes Photo Classifier

## Status

Active

## Product

Other

## Summary

Hermes Photo Classifier is an intelligent photo management and memory enrichment system that automatically catalogs family photos with AI-powered classification and enables contextual retrieval with human-curated storytelling.

The system combines machine learning for photo analysis with a semantic search layer that understands natural language queries. Users can retrieve photos using conversational context (e.g., "photos of Leonardo as a small child at grandmother's house") and enrich each photo with personal narratives and memories.

When photos are retrieved, they are presented not just as images but as complete memory experiences, combining visual content with the stories and context that give them meaning.

## Problem

Family photo collections grow rapidly but become disorganized and forgotten over time. While cloud storage solutions handle backup, they lack:

1. Intelligent organization beyond file metadata
2. Contextual retrieval matching how humans remember (by people, places, ages, events, and feelings)
3. Space for personal narratives and memories associated with specific moments
4. A way to discover forgotten memories and share their stories

## Objective

Enable users to:

1. Automatically catalog family photos with intelligent classification
2. Retrieve photos using natural language and contextual queries
3. Enrich photos with personal stories and metadata
4. Discover and relive forgotten memories with their full narrative context
5. Share photos as complete memory experiences (image + story)

## Target Users

- Family members wanting to organize and remember personal history
- Users with large photo collections lacking structure
- People interested in preserving family narratives alongside images
- Anyone seeking semantic search over their photo library

## Scope

**Included:**

- Automatic photo ingestion and classification using Claude Vision
- Multi-dimensional classification: people, locations, estimated age/time period, events, emotions
- Semantic search and retrieval with natural language queries
- Photo metadata enrichment interface (manual story/context addition)
- Photo presentation with context (image + associated narrative)
- Storage and vector embeddings for semantic search
- Web or CLI interface for retrieval and enrichment

**Not Included:**

- Facial recognition (using vision classification instead)
- Photo editing or manipulation
- Social sharing features (initial scope)
- Multi-user or family-shared accounts (initial scope)
- Mobile application (initial scope)
- Video support (initial scope)

## Success Criteria

- System automatically classifies 100+ photos with accurate person, location, age, and event data
- Natural language queries return relevant photos (e.g., "fotos do leonardo pequeno na casa dos avos")
- Users can add custom narratives to photos (e.g., "taken when I had dengue, 5 years old, grandmother gave me cold water baths to bring down fever")
- Retrieved photos display image + associated narrative together
- Semantic search returns contextually relevant results (not just keyword matches)
- System architecture supports adding 1000+ photos without performance degradation

## Related Epics

- [ ] Photo Ingestion and Automatic Classification
- [ ] Semantic Search and Retrieval
- [ ] Memory Enrichment Interface
- [ ] Photo Presentation and Storytelling

## Dependencies

- Claude Vision API for photo classification
- Vector database (Weaviate, Pinecone, Milvus, or similar) for semantic search
- Storage solution for photos (local filesystem or S3-compatible)
- Metadata storage (SQLite or PostgreSQL)

## Risks

- Vision model classification accuracy may require manual correction for sensitive family moments
- Vector embeddings for semantic search may miss contextual nuances best expressed by human narrative
- Privacy concerns with storing photo metadata and stories (mitigate: local-first storage option)
- Schema evolution as classification categories grow and refine

## Open Questions

- Should initial version support local storage only or cloud storage (S3)?
- Which vector database is most suitable for this use case?
- Should narrative enrichment support audio (voice recordings) in addition to text?
- Should the system support multiple languages for narratives?
- What is the target scale (100 photos, 1000s, 10,000s)?
- Should classification be fully automatic or semi-supervised with user feedback?

## Target Repositories

- `hermes-photo-classifier` (core engine + API)
- Existing Hermes infra for deployment

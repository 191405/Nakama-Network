# Nakama Network Backend

FastAPI backend for the Nakama Network anime mobile app.

## Features

- **Anime Data**: Trending, seasonal, popular, search, genre filtering
- **Characters**: Top characters, random character of the day
- **AI Features**: Oracle chatbot, mood recommendations, quotes, trivia
- **Caching**: Redis with in-memory fallback
- **Rate Limiting**: Respects Jikan API limits (3 req/sec)

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Required:
- `GEMINI_API_KEY` - Google Gemini API key

Optional:
- `REDIS_URL` - Redis connection (falls back to in-memory)

### 3. Run Server

```bash
# Development (with auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or simply
python -m app.main
```

### 4. Test Endpoints

Open http://localhost:8000/docs for Swagger UI

## API Endpoints

### Anime
| Endpoint | Description |
|----------|-------------|
| `GET /anime/trending?page=1&limit=25` | Trending anime |
| `GET /anime/seasonal?page=1` | Currently airing |
| `GET /anime/popular?page=1` | All-time popular |
| `GET /anime/search?q=naruto` | Search anime |
| `GET /anime/genre/action` | Filter by genre |
| `GET /anime/{id}` | Anime details |

### Characters
| Endpoint | Description |
|----------|-------------|
| `GET /characters/top` | Top characters |
| `GET /characters/random` | Random character |
| `GET /characters/{id}` | Character details |

### AI
| Endpoint | Description |
|----------|-------------|
| `POST /ai/oracle` | Ask The Oracle |
| `POST /ai/mood` | Mood recommendations |
| `POST /ai/quote` | Generate quote |
| `GET /ai/prophecy` | Daily prophecy |
| `POST /ai/trivia` | Generate trivia |

## Architecture

```
Mobile App → FastAPI Backend → Jikan API
                  ↓
            Redis Cache
                  ↓
            Gemini AI
```

## Caching TTLs

| Data | TTL |
|------|-----|
| Trending | 1 hour |
| Seasonal | 6 hours |
| Search | 15 minutes |
| Details | 24 hours |
| Characters | 24 hours |

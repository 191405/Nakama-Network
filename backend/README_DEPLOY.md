# Nakama Network Backend API

FastAPI backend for the Nakama Network anime community platform.

## 🚀 One-Click Deploy

### Deploy to Render
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/yourusername/nakama-network)

### Deploy to Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/nakama-network)

### Deploy to Fly.io
```bash
fly launch
```

---

## 📋 Quick Start (Local Development)

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 3. Run Server
```bash
uvicorn app.main:app --reload
```

Server runs at: http://localhost:8000

API Docs: http://localhost:8000/docs

---

## 🐳 Docker Deployment

### Build and Run
```bash
docker build -t nakama-api .
docker run -p 8000:8000 -e GEMINI_API_KEY=your_key nakama-api
```

### Using Docker Compose
```bash
docker-compose up -d
```

---

## 🌐 Production Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions on:
- Render.com (Free tier available)
- Railway.app
- Fly.io
- Vercel
- VPS with Docker

---

## 📡 API Endpoints

### Anime
- `GET /anime/trending` - Trending anime
- `GET /anime/seasonal` - Currently airing
- `GET /anime/popular` - All-time popular
- `GET /anime/search?q=naruto` - Search anime
- `GET /anime/{id}` - Anime details

### Characters
- `GET /characters/top` - Top characters
- `GET /characters/random` - Random character
- `GET /characters/{id}` - Character details

### AI Features
- `POST /ai/oracle` - Ask The Oracle
- `POST /ai/mood` - Mood-based recommendations
- `GET /ai/prophecy` - Daily prophecy
- `POST /ai/trivia` - Generate trivia

### Users & Auth
- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `GET /users/me` - Get current user
- `PUT /users/me` - Update profile

### Community
- `GET /reviews` - Get reviews
- `POST /reviews` - Create review
- `GET /clans` - Get clans
- `POST /clans` - Create clan

---

## 🔧 Environment Variables

```env
# Required
GEMINI_API_KEY=your_gemini_api_key

# Optional
DEBUG=false
PORT=8000
REDIS_URL=redis://localhost:6379
CORS_ORIGINS=https://your-frontend.com
JWT_SECRET_KEY=your_secret_key
```

---

## 🧪 Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=app tests/
```

---

## 📊 Features

- ✅ RESTful API with FastAPI
- ✅ Google Gemini AI integration
- ✅ Jikan API (MyAnimeList) integration
- ✅ Redis caching
- ✅ Rate limiting
- ✅ JWT authentication
- ✅ CORS configuration
- ✅ SQLAlchemy ORM
- ✅ Async/await support
- ✅ API documentation (Swagger/ReDoc)
- ✅ Docker support
- ✅ Health check endpoint

---

## 🔒 Security

- Rate limiting (100 req/min)
- JWT token authentication
- CORS protection
- Input validation with Pydantic
- SQL injection prevention
- XSS protection

---

## 📈 Performance

- Redis caching for API responses
- Async database operations
- Connection pooling
- Response compression
- CDN-ready static files

---

## 🛠️ Tech Stack

- **Framework**: FastAPI
- **Database**: SQLAlchemy + PostgreSQL/SQLite
- **Cache**: Redis
- **AI**: Google Gemini
- **External APIs**: Jikan (MyAnimeList)
- **Auth**: JWT
- **Deployment**: Docker, Render, Railway, Fly.io

---

## 📞 Support

- Documentation: `/docs` endpoint
- Issues: GitHub Issues
- Email: nakamanetworkonline@gmail.com

---

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ⚡ by Nakama Network Team**

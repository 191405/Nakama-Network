# Backend Deployment Guide - Nakama Network API

## 🚀 Quick Deploy Options

### Option 1: Render.com (Recommended - Free Tier Available)

**Steps:**
1. Push your code to GitHub
2. Go to [Render.com](https://render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: nakama-network-api
   - **Region**: Oregon (or closest to you)
   - **Branch**: main
   - **Root Directory**: backend
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables:
   ```
   DEBUG=false
   GEMINI_API_KEY=your_gemini_api_key
   CORS_ORIGINS=https://your-frontend-url.vercel.app
   JWT_SECRET_KEY=generate_random_secret_key
   SMTP_USER=nakamanetworkonline@gmail.com
   SMTP_PASSWORD=tjamrvzasbuedbnj
   SMTP_EMAIL=nakamanetworkonline@gmail.com
   ```
7. Click "Create Web Service"
8. Your API will be live at: `https://nakama-network-api.onrender.com`

**Free Tier Limits:**
- 750 hours/month
- Spins down after 15 min inactivity
- 512 MB RAM

---

### Option 2: Railway.app (Easy Deploy)

**Steps:**
1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```
2. Login:
   ```bash
   railway login
   ```
3. Navigate to backend:
   ```bash
   cd backend
   ```
4. Initialize:
   ```bash
   railway init
   ```
5. Add environment variables:
   ```bash
   railway variables set DEBUG=false
   railway variables set GEMINI_API_KEY=your_key
   railway variables set CORS_ORIGINS=https://your-frontend.vercel.app
   ```
6. Deploy:
   ```bash
   railway up
   ```
7. Get URL:
   ```bash
   railway domain
   ```

**Pricing:**
- $5/month for 500 hours
- No cold starts
- Better performance than Render free tier

---

### Option 3: Fly.io (Global Edge Network)

**Steps:**
1. Install Fly CLI:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```
2. Login:
   ```bash
   fly auth login
   ```
3. Navigate to backend:
   ```bash
   cd backend
   ```
4. Launch app:
   ```bash
   fly launch
   ```
5. Follow prompts:
   - App name: nakama-network-api
   - Region: Choose closest
   - PostgreSQL: No
   - Redis: Optional (Yes for caching)
6. Set secrets:
   ```bash
   fly secrets set GEMINI_API_KEY=your_key
   fly secrets set DEBUG=false
   fly secrets set CORS_ORIGINS=https://your-frontend.vercel.app
   ```
7. Deploy:
   ```bash
   fly deploy
   ```

**Free Tier:**
- 3 shared-cpu-1x VMs
- 160GB outbound data transfer
- Global edge network

---

### Option 4: Docker + Any VPS (DigitalOcean, Linode, AWS EC2)

**Steps:**

1. **Build Docker Image:**
   ```bash
   cd backend
   docker build -t nakama-api .
   ```

2. **Test Locally:**
   ```bash
   docker run -p 8000:8000 \
     -e GEMINI_API_KEY=your_key \
     -e DEBUG=false \
     nakama-api
   ```

3. **Deploy to VPS:**
   ```bash
   # SSH into your server
   ssh user@your-server-ip
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Clone repo
   git clone your-repo-url
   cd backend
   
   # Create .env file
   nano .env
   # Add your environment variables
   
   # Run with docker-compose
   docker-compose up -d
   ```

4. **Setup Nginx Reverse Proxy:**
   ```nginx
   server {
       listen 80;
       server_name api.nakamanetwork.com;
       
       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

5. **Setup SSL with Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.nakamanetwork.com
   ```

---

### Option 5: Vercel (Serverless)

**Note:** Vercel has limitations for FastAPI (10s timeout on free tier)

**Steps:**
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Navigate to backend:
   ```bash
   cd backend
   ```
3. Deploy:
   ```bash
   vercel
   ```
4. Add environment variables in Vercel dashboard
5. Your API will be at: `https://nakama-api.vercel.app`

**Limitations:**
- 10s execution timeout (free tier)
- Not ideal for long-running requests
- Better for simple APIs

---

## 🔧 Environment Variables

Required for all deployments:

```env
# Core
DEBUG=false
HOST=0.0.0.0
PORT=8000

# AI
GEMINI_API_KEY=your_gemini_api_key_here

# CORS (Update with your frontend URL)
CORS_ORIGINS=https://your-frontend.vercel.app,https://your-domain.com

# Security
JWT_SECRET_KEY=generate_a_random_secret_key_here

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=nakamanetworkonline@gmail.com
SMTP_PASSWORD=tjamrvzasbuedbnj
SMTP_EMAIL=nakamanetworkonline@gmail.com

# Redis (Optional - for caching)
REDIS_URL=redis://localhost:6379
```

---

## 📝 Post-Deployment Checklist

1. **Test Health Endpoint:**
   ```bash
   curl https://your-api-url.com/health
   ```

2. **Test API Endpoints:**
   ```bash
   # Get trending anime
   curl https://your-api-url.com/anime/trending
   
   # Test AI endpoint
   curl -X POST https://your-api-url.com/ai/oracle \
     -H "Content-Type: application/json" \
     -d '{"message": "Recommend me an anime"}'
   ```

3. **Update Frontend:**
   - Update API URL in frontend `.env`:
     ```env
     VITE_API_URL=https://your-api-url.com
     ```

4. **Monitor Logs:**
   - Render: Dashboard → Logs
   - Railway: `railway logs`
   - Fly.io: `fly logs`
   - Docker: `docker logs container_name`

5. **Setup Monitoring:**
   - Use UptimeRobot for uptime monitoring
   - Setup error tracking (Sentry)
   - Monitor API response times

---

## 🔒 Security Best Practices

1. **Never commit `.env` file**
2. **Use strong JWT secret** (generate with `openssl rand -hex 32`)
3. **Enable HTTPS** (automatic on Render/Railway/Fly)
4. **Restrict CORS** to your frontend domains only
5. **Rate limiting** is already configured in the app
6. **Keep dependencies updated**: `pip list --outdated`

---

## 🚨 Troubleshooting

### Issue: API returns 502/503
**Solution:** Check logs, ensure all dependencies installed

### Issue: CORS errors
**Solution:** Add your frontend URL to `CORS_ORIGINS` env var

### Issue: Gemini API not working
**Solution:** Verify `GEMINI_API_KEY` is set correctly

### Issue: Slow cold starts (Render free tier)
**Solution:** 
- Upgrade to paid tier, or
- Use Railway/Fly.io, or
- Implement a ping service to keep it warm

### Issue: Database connection errors
**Solution:** Ensure SQLite file has write permissions

---

## 📊 Performance Optimization

1. **Enable Redis Caching:**
   - Add Redis addon on your platform
   - Set `REDIS_URL` environment variable

2. **Use CDN for Static Files:**
   - Upload videos to Cloudflare R2 or AWS S3
   - Update file URLs in responses

3. **Database Optimization:**
   - Add indexes to frequently queried fields
   - Use connection pooling

4. **API Response Caching:**
   - Already implemented for Jikan API calls
   - Adjust TTL values in config if needed

---

## 💰 Cost Comparison

| Platform | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| **Render** | 750hrs/month | $7/month | Hobby projects |
| **Railway** | $5 credit | $5/month | Small apps |
| **Fly.io** | 3 VMs free | $1.94/VM | Global apps |
| **Vercel** | Unlimited | $20/month | Serverless |
| **DigitalOcean** | None | $6/month | Full control |

---

## 🎯 Recommended Setup

**For Production:**
1. **Backend**: Railway or Fly.io ($5-10/month)
2. **Frontend**: Vercel (Free)
3. **Database**: Railway PostgreSQL (Free tier)
4. **Redis**: Railway Redis (Free tier)
5. **Monitoring**: UptimeRobot (Free)

**Total Cost**: $5-10/month

---

## 📞 Support

If you encounter issues:
1. Check logs first
2. Verify environment variables
3. Test endpoints with curl/Postman
4. Check platform status pages
5. Review FastAPI documentation

---

## 🔗 Useful Links

- [FastAPI Deployment Docs](https://fastapi.tiangolo.com/deployment/)
- [Render Python Guide](https://render.com/docs/deploy-fastapi)
- [Railway Docs](https://docs.railway.app/)
- [Fly.io Python Guide](https://fly.io/docs/languages-and-frameworks/python/)
- [Docker FastAPI Guide](https://fastapi.tiangolo.com/deployment/docker/)

---

**Your API is now ready to deploy! Choose the platform that best fits your needs and budget.**

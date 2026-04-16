# Backend Hosting - Complete Setup Summary

## ✅ Files Created for Deployment

### 1. **Render.com Deployment**
- `Procfile` - Process file for Render
- `render.yaml` - Render configuration
- `runtime.txt` - Python version specification

### 2. **Railway.app Deployment**
- `railway.json` - Railway configuration

### 3. **Vercel Deployment**
- `vercel.json` - Vercel serverless configuration

### 4. **Docker Deployment**
- `Dockerfile` - Container image definition
- `docker-compose.yml` - Multi-container setup with Redis
- `.dockerignore` - Files to exclude from image

### 5. **Documentation**
- `DEPLOYMENT_GUIDE.md` - Comprehensive deployment guide
- `README_DEPLOY.md` - Quick reference with deploy buttons
- `deploy.sh` - Linux/Mac deploy script
- `deploy.bat` - Windows deploy script

---

## 🎯 Recommended Hosting: Render.com (Free Tier)

### Why Render?
- ✅ Free tier available (750 hours/month)
- ✅ Automatic HTTPS
- ✅ Easy GitHub integration
- ✅ Zero configuration needed
- ✅ Built-in health checks
- ✅ Automatic deploys on git push

### Quick Deploy Steps:

1. **Push to GitHub:**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Backend ready for deployment"
   git remote add origin https://github.com/yourusername/nakama-network.git
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select repository
   - Configure:
     - **Name**: nakama-network-api
     - **Root Directory**: `backend`
     - **Environment**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Add Environment Variables:**
   ```
   DEBUG=false
   GEMINI_API_KEY=AIzaSyCTM8ktds1ms0wg2OOoytTwU9CSL22ci70
   CORS_ORIGINS=https://your-frontend.vercel.app
   JWT_SECRET_KEY=nk_prod_secret_2026_change_this
   SMTP_USER=nakamanetworkonline@gmail.com
   SMTP_PASSWORD=tjamrvzasbuedbnj
   SMTP_EMAIL=nakamanetworkonline@gmail.com
   ```

4. **Deploy!**
   - Click "Create Web Service"
   - Wait 3-5 minutes
   - Your API will be live at: `https://nakama-network-api.onrender.com`

---

## 🔗 Update Frontend to Use Hosted Backend

After deploying, update your frontend `.env.local`:

```env
VITE_API_URL=https://nakama-network-api.onrender.com
```

Then update API calls in frontend:

```javascript
// src/utils/api.js or similar
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const fetchTrendingAnime = async () => {
  const response = await fetch(`${API_BASE_URL}/anime/trending`);
  return response.json();
};
```

---

## 🧪 Test Your Deployed API

### 1. Health Check
```bash
curl https://nakama-network-api.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "services": {
    "api": true,
    "cache": true,
    "jikan": true,
    "gemini": true
  }
}
```

### 2. Test Anime Endpoint
```bash
curl https://nakama-network-api.onrender.com/anime/trending?limit=5
```

### 3. Test AI Endpoint
```bash
curl -X POST https://nakama-network-api.onrender.com/ai/oracle \
  -H "Content-Type: application/json" \
  -d '{"message": "Recommend me an action anime"}'
```

---

## 📊 Alternative Hosting Options

### Railway.app ($5/month)
**Pros:**
- No cold starts
- Better performance
- 500 hours included
- Easy CLI deployment

**Deploy:**
```bash
npm i -g @railway/cli
railway login
cd backend
railway init
railway up
```

### Fly.io (Free tier)
**Pros:**
- Global edge network
- 3 VMs free
- Low latency worldwide
- Great for international users

**Deploy:**
```bash
curl -L https://fly.io/install.sh | sh
fly auth login
cd backend
fly launch
fly deploy
```

### Docker on VPS (DigitalOcean $6/month)
**Pros:**
- Full control
- No cold starts
- Predictable performance
- Can run Redis locally

**Deploy:**
```bash
# On your VPS
git clone your-repo
cd backend
docker-compose up -d
```

---

## 🔧 Post-Deployment Configuration

### 1. Setup Custom Domain (Optional)
- Buy domain from Namecheap/GoDaddy
- Add CNAME record: `api.yourdomain.com` → `nakama-network-api.onrender.com`
- Update CORS_ORIGINS to include your domain

### 2. Setup Monitoring
- **UptimeRobot**: Free uptime monitoring
- **Sentry**: Error tracking
- **LogRocket**: Session replay

### 3. Enable Redis Caching
- Add Redis addon on Render (free tier available)
- Set `REDIS_URL` environment variable
- Restart service

### 4. Setup CI/CD
- Automatic deploys on git push (already enabled on Render)
- Add GitHub Actions for testing before deploy

---

## 🚨 Common Issues & Solutions

### Issue: 502 Bad Gateway
**Solution:** Check logs in Render dashboard, ensure all dependencies installed

### Issue: CORS Errors
**Solution:** Add your frontend URL to `CORS_ORIGINS` environment variable

### Issue: Slow Response Times
**Solution:** 
- Enable Redis caching
- Upgrade to paid tier
- Use Railway/Fly.io instead

### Issue: Cold Starts (Render Free Tier)
**Solution:**
- Upgrade to paid tier ($7/month), or
- Use a ping service to keep it warm, or
- Switch to Railway/Fly.io

### Issue: Gemini API Errors
**Solution:** Verify `GEMINI_API_KEY` is set correctly in environment variables

---

## 💰 Cost Breakdown

| Platform | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| **Render** | 750hrs/month | $7/month | Hobby projects |
| **Railway** | $5 credit | $5/month | Small apps |
| **Fly.io** | 3 VMs | $1.94/VM | Global reach |
| **DigitalOcean** | None | $6/month | Full control |

**Recommended for Production:** Railway ($5/month) or Fly.io (Free tier)

---

## 📈 Performance Optimization

### 1. Enable Caching
```python
# Already implemented in the code
# Just add Redis URL to environment variables
REDIS_URL=redis://your-redis-url
```

### 2. Use CDN for Static Files
- Upload videos to Cloudflare R2
- Update file URLs in responses

### 3. Database Optimization
- Add indexes to frequently queried fields
- Use connection pooling (already configured)

### 4. API Response Compression
- Already enabled in FastAPI
- Reduces bandwidth usage

---

## 🎉 Success Checklist

- [ ] Backend deployed to Render/Railway/Fly.io
- [ ] Health endpoint returns 200 OK
- [ ] API endpoints tested and working
- [ ] Frontend updated with API URL
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Monitoring setup (optional)
- [ ] Custom domain configured (optional)
- [ ] Redis caching enabled (optional)

---

## 🔗 Useful Resources

- [FastAPI Deployment Docs](https://fastapi.tiangolo.com/deployment/)
- [Render Python Guide](https://render.com/docs/deploy-fastapi)
- [Railway Documentation](https://docs.railway.app/)
- [Fly.io Python Guide](https://fly.io/docs/languages-and-frameworks/python/)
- [Docker FastAPI Tutorial](https://fastapi.tiangolo.com/deployment/docker/)

---

## 📞 Need Help?

1. Check `DEPLOYMENT_GUIDE.md` for detailed instructions
2. Review platform-specific documentation
3. Check logs in your hosting dashboard
4. Test endpoints with curl/Postman
5. Verify environment variables are set correctly

---

**Your backend is now ready to host! Choose your platform and deploy in minutes! 🚀**

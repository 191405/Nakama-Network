# 🚀 Nakama Network - Quick Start

**Get running in 5 minutes!**

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Setup Firebase

1. Go to https://console.firebase.google.com/
2. Create new project: "nakama-network-halfmoon"
3. Enable Authentication → Google + Anonymous
4. Enable Firestore Database → Test mode
5. Enable Storage
6. Get config from Project Settings → Your apps → Web

## Step 3: Setup Gemini API

1. Go to https://makersuite.google.com/app/apikey
2. Create API Key
3. Copy the key

## Step 4: Create .env File

```bash
cp .env.example .env
```

Edit `.env` with your keys from steps 2 & 3

## Step 5: Run

```bash
npm run dev
```

Open http://localhost:5173

**Done!** 🎉

---

## Need Help?

- **Full Setup**: Read `SETUP.md`
- **Deploy**: Read `DEPLOYMENT.md`  
- **Features**: Read `README.md`
- **Overview**: Read `PROJECT_SUMMARY.md`

## First Time Login

1. Click "Continue with Google" or "Enter as Guest"
2. You'll be taken to The Hub
3. Explore all 7 sections!

## Test the Features

✅ Try AI Prophecy on The Hub
✅ Watch anime trailers on Stream-X  
✅ Battle AI trivia in The Arena
✅ Generate a clan in Clan HQ
✅ Chat with The Oracle
✅ Read anime news

## Troubleshooting

**Can't login?**
- Check Firebase config in .env
- Verify Authentication is enabled

**AI not working?**
- Check Gemini API key in .env
- Verify API key is enabled

**Build errors?**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

**Welcome to NK Network** - The Hidden Layer of Anime 🎌

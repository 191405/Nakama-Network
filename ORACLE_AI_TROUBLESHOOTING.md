# 🔧 Oracle AI Troubleshooting Guide

## ✅ Issue Fixed!

The Oracle AI was unavailable due to **2 configuration issues**:

### Issue #1: Wrong Environment Variable Name ❌
**Before:**
```javascript
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
```

**After:** ✅
```javascript
const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
```

**Why it failed:** The code was looking for `VITE_GEMINI_API_KEY`, but your `.env.local` has `VITE_GOOGLE_GEMINI_API_KEY`. This made the API key `undefined`, causing all requests to fail.

---

### Issue #2: Incorrect API Model Name ❌
**Before:**
```javascript
const GEMINI_API_URL = '...models/gemini-2.5-flash:generateContent';
```

**After:** ✅
```javascript
const GEMINI_API_URL = '...models/gemini-1.5-flash:generateContent';
```

**Why it failed:** The model `gemini-2.5-flash` doesn't exist (as of Dec 2024). Using `gemini-1.5-flash` is the current stable version.

---

## 📋 Diagnostics Checklist

When Oracle AI is unavailable, check these in order:

### 1. ✅ Environment Variable Is Set
```bash
# In your .env.local, you should have:
VITE_GOOGLE_GEMINI_API_KEY=AIzaSyA_XNHPkNDm-QAJzUZ_UfK9J8b6OSEPwEg
```

### 2. ✅ API Key Is Valid
```bash
# Visit: https://makersuite.google.com/app/apikey
# and verify your key still works
```

### 3. ✅ Dev Server Is Restarted
```bash
# After changing .env.local, restart Vite:
npm run dev
```

### 4. ✅ Browser Console Has No Errors
```bash
# Open Chrome DevTools → Console tab
# Look for error messages like:
# - "API key not configured"
# - "401 Unauthorized"
# - "429 Too Many Requests"
# - "503 Service Unavailable"
```

### 5. ✅ Internet Connection Works
```bash
# Test connectivity to Google APIs
# https://generativelanguage.googleapis.com should respond
```

---

## 🔍 Debugging Steps

### Step 1: Check the Console
When you use Oracle, open Chrome DevTools (F12) and go to Console tab. You should see:
- ✅ No errors with `VITE_GOOGLE_GEMINI_API_KEY`
- ✅ API request goes to `generativelanguage.googleapis.com`
- ✅ Response contains `candidates` array

### Step 2: Check Error Messages
The Oracle now returns descriptive error messages:

| Error | Cause | Solution |
|-------|-------|----------|
| "cosmic disturbance" | API key missing/invalid | Add correct `VITE_GOOGLE_GEMINI_API_KEY` to `.env.local` |
| "connection falters" | API key is wrong format | Get new key from [makersuite.google.com](https://makersuite.google.com/app/apikey) |
| "overloaded with requests" | Rate limit hit (429 error) | Wait a few minutes and try again |
| "technical difficulties" | Google service down (503 error) | Check Google status page, try later |

### Step 3: Test the API Directly
You can test the API in your browser console:
```javascript
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{
      parts: [{ text: 'Hello, are you working?' }]
    }]
  })
}).then(r => r.json()).then(d => console.log(d));
```

---

## 🚀 Getting a New API Key (If Needed)

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key
5. Add to your `.env.local`:
   ```dotenv
   VITE_GOOGLE_GEMINI_API_KEY=your_new_key_here
   ```
6. Restart your dev server: `npm run dev`
7. Test Oracle again

---

## 📌 Common Issues & Solutions

### Issue: "Oracle is temporarily unavailable"
**Cause:** Generic fallback message
**Solution:** Check console for specific error, then fix based on error type above

### Issue: Empty response from Oracle
**Cause:** API returned no candidates
**Solution:** Check if your prompt is too long or if API is rate limiting

### Issue: Oracle responds slowly
**Cause:** Gemini API can be slow
**Solution:** This is normal, responses take 2-5 seconds. Check if UI shows loading spinner.

### Issue: Oracle says "connection falters"
**Cause:** API key is invalid/wrong format
**Solution:** 
1. Verify key format (should be ~40 characters starting with "AIza")
2. Get fresh key from makersuite.google.com
3. Make sure it's added exactly as `VITE_GOOGLE_GEMINI_API_KEY` (not `VITE_GEMINI_API_KEY`)

---

## ✨ Features Now Working

With the fixes, these features should now work:

✅ **Oracle Chat** - Ask anime questions and get wisdom
✅ **Daily Prophecy** - Get mysterious daily fortunes in Hub page
✅ **Clan Name Generator** - Generate anime-inspired clan names
✅ **AI Sensei** - Explain anime cultural elements
✅ **Ghost Mode** - Live character commentary
✅ **Trivia Questions** - Generate anime trivia with 4 options

---

## 🎯 Quick Restart Guide

If Oracle still isn't working after the fixes:

1. **Kill the dev server**: `Ctrl + C` in terminal
2. **Verify `.env.local`**: 
   ```bash
   cat .env.local | grep GEMINI
   # Should show: VITE_GOOGLE_GEMINI_API_KEY=AIza...
   ```
3. **Restart dev server**: `npm run dev`
4. **Clear browser cache**: `Ctrl + Shift + Delete` → Clear All → Reload
5. **Test Oracle**: Go to Oracle page and ask a question

---

## 📚 Related Files Changed

- ✅ `src/utils/gemini.js` - Fixed API key variable name and model version
- ✅ Added better error handling with user-friendly messages
- ✅ `.env.local` - Already had correct `VITE_GOOGLE_GEMINI_API_KEY` configured

---

**Status**: ✅ Oracle AI should now be fully functional!

*If issues persist, check your internet connection, API key validity, and browser console for specific error messages.*

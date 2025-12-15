# Fixing Blank Page Issue

If you're seeing a blank page, here's how to diagnose and fix it:

## Quick Diagnosis Steps

### 1. Open Browser Console
Press `F12` (or `Cmd+Option+I` on Mac) and check the Console tab for errors.

**Common errors:**
- `Failed to load resource: 404` → Base path issue
- `Uncaught ReferenceError` → JavaScript error
- `CORS error` → Usually not an issue with GitHub Pages
- No errors → React might not be mounting

### 2. Check Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. Refresh the page
4. Look for:
   - ❌ Red entries (404 errors) on `.js` or `.css` files
   - ✅ All files loading successfully (200 status)

### 3. Verify Your URL
Make sure you're visiting:
```
https://shaansen.github.io/do-the-math/
```
**NOT:**
- `https://shaansen.github.io/do-the-math` (missing trailing slash)
- `https://shaansen.github.io/do-the-math/index.html`

## Common Causes & Solutions

### Issue 1: Base Path Mismatch (Most Common)

**Symptoms:**
- Blank page
- Console shows 404 errors for `.js` files
- Files trying to load from wrong path

**Solution:**
1. Check the workflow is using the correct base path:
   ```yaml
   BASE_PATH: '/do-the-math/'
   ```
2. Verify in GitHub Actions build log that it says:
   ```
   BASE_PATH='/do-the-math/'
   ```

### Issue 2: Assets Not Loading

**Check the built files:**
1. Go to: `https://shaansen.github.io/do-the-math/assets/`
2. You should see files like:
   - `index-xxxxx.js`
   - `index-xxxxx.css`

If you see a 404, the deployment didn't work correctly.

### Issue 3: JavaScript Errors

**Check browser console for:**
- Syntax errors
- Import errors
- Runtime errors

**Solution:**
- Look at the error message
- Check which file/line is causing the issue
- The error boundary should catch React errors

### Issue 4: Cached Old Version

**Solution:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Or clear cache:
   - Chrome: Settings → Privacy → Clear browsing data
   - Firefox: Settings → Privacy → Clear Data
   - Safari: Develop → Empty Caches

### Issue 5: Browser Compatibility

**The app works on:**
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Not supported:**
- ❌ Internet Explorer (IE is dead)
- ❌ Very old browsers

## Mobile Browser Support

### ✅ Works On:
- **iOS Safari** (iOS 12+)
- **Chrome Mobile** (Android)
- **Firefox Mobile**
- **Samsung Internet**

### Mobile-Specific Features:
- 📸 Camera access for bill photos
- 👆 Touch-friendly buttons (44px minimum)
- 📱 Responsive design
- 🔄 Swipe gestures (where applicable)

### Testing on Mobile:
1. Open: `https://shaansen.github.io/do-the-math/` on your phone
2. Check if the page loads
3. Try taking a photo of a receipt
4. Check browser console (if possible) for errors

## Debug Steps

### Step 1: Check Deployment
1. Go to: https://github.com/shaansen/do-the-math/actions
2. Find the latest workflow run
3. Check if it completed successfully (green checkmark)

### Step 2: Check Built Files
Visit these URLs directly:
- `https://shaansen.github.io/do-the-math/index.html`
- `https://shaansen.github.io/do-the-math/assets/` (should show file list or 404)

### Step 3: Check Console
1. Open DevTools (F12)
2. Console tab
3. Look for errors or warnings
4. Share the error message if you see one

### Step 4: Test Locally
Build and test locally first:
```bash
BASE_PATH='/do-the-math/' npm run build
npm run preview
```
Then visit: `http://localhost:4173/do-the-math/`

## Quick Fix Commands

If you want to trigger a fresh deployment:

```bash
# Make a small change
echo "# Debug" >> README.md

# Commit and push
git add .
git commit -m "Trigger fresh deployment"
git push
```

Wait 5-10 minutes after the workflow completes, then check again.

## Still Not Working?

1. **Check the browser console** - What errors do you see?
2. **Check the Network tab** - Are files loading?
3. **Try a different browser** - Does it work in Chrome/Firefox?
4. **Try incognito mode** - Rules out cache/extensions
5. **Check GitHub Pages status** - Settings → Pages should show it's live

## Need More Help?

Share:
1. What browser you're using
2. Any console errors (F12 → Console)
3. What you see in Network tab (F12 → Network)
4. Screenshot of the blank page

This will help diagnose the exact issue!




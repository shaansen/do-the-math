# Troubleshooting 404 Error on GitHub Pages

If you're seeing a 404 error, follow these steps:

## Step 1: Check GitHub Actions Workflow

1. Go to your repository: https://github.com/shaansen/do-the-math
2. Click on the **Actions** tab
3. Check if there's a workflow run:
   - ✅ **Green checkmark** = Success! Wait 2-5 minutes for GitHub Pages to update
   - ❌ **Red X** = Build failed - check the error messages
   - 🟡 **Yellow circle** = Still running - wait for it to complete
   - **No workflow** = The workflow file might not be committed

## Step 2: Enable GitHub Pages (Important!)

1. Go to your repository → **Settings** tab
2. Click **Pages** in the left sidebar
3. Under **Source**, you should see:

   - ✅ **GitHub Actions** selected = Correct!
   - ❌ **Deploy from a branch** = Wrong! Change this
   - ❌ **None** = Not enabled! Select "GitHub Actions"

4. If it's not set to "GitHub Actions":
   - Select **GitHub Actions** from the dropdown
   - Save (if there's a save button)

## Step 3: Check Workflow Status

After enabling GitHub Actions as the source:

1. Go to **Actions** tab again
2. You should see "Deploy to GitHub Pages" workflow
3. Click on it to see if it's running/completed
4. If it completed successfully, wait 2-5 minutes for GitHub Pages to propagate

## Step 4: Verify the URL

Your app should be at:

```
https://shaansen.github.io/do-the-math/
```

**Important:** Make sure you include:

- ✅ The trailing slash at the end (`/`)
- ✅ Your GitHub username (`shaansen`)
- ✅ Your repository name (`do-the-math`)

## Step 5: Common Issues

### Issue: "No workflow runs found"

**Solution:** Make sure you've:

1. Committed the `.github/workflows/deploy.yml` file
2. Pushed it to the `main` branch

### Issue: Workflow failed with build error

**Solution:**

1. Click on the failed workflow
2. Check the error message
3. Common issues:
   - Missing dependencies (check package.json is committed)
   - Build errors (check the build step output)

### Issue: Workflow succeeds but still 404

**Solutions:**

1. **Wait 5-10 minutes** - GitHub Pages can take time to propagate
2. **Clear browser cache** - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. **Check the build output** - Verify BASE_PATH is set correctly
4. **Try incognito/private window** - Rules out cache issues

### Issue: Blank page (not 404)

**Solution:** This might be a base path issue. Check:

1. The workflow sets `BASE_PATH: '/do-the-math/'`
2. Open browser console (F12) and check for errors
3. Look for 404 errors on CSS/JS files

## Step 6: Manual Verification

To verify everything is set up correctly, check:

1. **Workflow file exists:**

   ```
   .github/workflows/deploy.yml
   ```

2. **Package.json has build script:**

   ```json
   "scripts": {
     "build": "vite build"
   }
   ```

3. **Vite config reads BASE_PATH:**
   ```js
   const base = process.env.BASE_PATH || "/";
   ```

## Still Not Working?

1. **Re-run the workflow manually:**

   - Go to Actions tab
   - Click on "Deploy to GitHub Pages"
   - Click "Run workflow" button (top right)
   - Select `main` branch
   - Click "Run workflow"

2. **Check repository settings:**

   - Settings → Pages
   - Should show "Your site is live at https://shaansen.github.io/do-the-math/"
   - Source should be "GitHub Actions"

3. **Verify files are pushed:**
   ```bash
   git log --oneline
   git branch
   ```
   Make sure you're on `main` branch and files are committed.

## Quick Fix: Trigger New Deployment

If nothing works, try triggering a new deployment:

1. Make a small change to any file (like README.md)
2. Commit and push:
   ```bash
   git add .
   git commit -m "Trigger deployment"
   git push
   ```
3. Wait for the workflow to run (check Actions tab)
4. Wait 5 minutes after it completes

## Need More Help?

Check the browser console (F12 → Console tab) for specific error messages. Common errors:

- `Failed to load resource: 404` - Base path issue
- `CORS error` - Usually not an issue with GitHub Pages
- JavaScript errors - Check the error details



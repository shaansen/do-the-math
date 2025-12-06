# Deployment Guide for GitHub Pages

This guide will help you deploy the Do the math app to GitHub Pages.

## Quick Start (Automatic Deployment)

1. **Push your code to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. **Enable GitHub Pages in your repository:**

   - Go to your repository on GitHub
   - Click on **Settings** tab
   - Scroll down to **Pages** in the left sidebar
   - Under **Source**, select **GitHub Actions**
   - The workflow will automatically deploy when you push to `main`

3. **Your app will be live at:**
   - `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

That's it! The GitHub Actions workflow will automatically:

- Build your app with the correct base path
- Deploy to GitHub Pages
- Update on every push to `main` branch

## Manual Deployment

If you prefer to deploy manually:

1. **Build the app with the correct base path:**

   ```bash
   # Replace 'YOUR_REPO_NAME' with your actual repository name
   BASE_PATH='/YOUR_REPO_NAME/' npm run build
   ```

2. **Deploy to gh-pages branch:**

   ```bash
   npm run deploy:gh-pages
   ```

3. **Enable GitHub Pages:**
   - Go to Settings → Pages
   - Select source: `gh-pages` branch
   - Save

## Custom Domain

If you're using a custom domain (e.g., `yourdomain.com`):

1. Build with root base path:

   ```bash
   BASE_PATH='/' npm run build
   ```

2. Deploy:

   ```bash
   npm run deploy:gh-pages
   ```

3. Add a `CNAME` file in the `public` folder with your domain name

## Troubleshooting

### App loads but shows blank page

- Check that the `BASE_PATH` matches your repository name
- Clear your browser cache
- Check browser console for errors

### Images or assets not loading

- Ensure the base path includes trailing slash: `/repo-name/`
- Verify the `BASE_PATH` environment variable is set correctly

### Workflow fails

- Check GitHub Actions tab for error messages
- Ensure you've enabled GitHub Pages in repository settings
- Verify the workflow file exists at `.github/workflows/deploy.yml`

## Local Testing Before Deployment

Test your production build locally:

```bash
# Build with your repo name
BASE_PATH='/YOUR_REPO_NAME/' npm run build

# Preview the build
npm run preview
```

This helps catch issues before deploying to GitHub Pages.

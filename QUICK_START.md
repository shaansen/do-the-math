# Quick Start Guide 🚀

Get your Bill Splitter app up and running on GitHub Pages in 5 minutes!

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it something like `bill-splitter` or `split-app`
3. **Don't** initialize it with a README (we already have one)

## Step 2: Push Your Code

Open terminal in this directory and run:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Bill Splitter app"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu bar)
3. Click **Pages** (left sidebar)
4. Under **Source**, select **GitHub Actions**
5. Save (if there's a save button)

## Step 4: Wait for Deployment

1. Go to the **Actions** tab in your repository
2. You should see a workflow running (or completed)
3. Once it's green (✓), your app is live!

## Step 5: Access Your App

Your app will be available at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

Replace with your actual username and repository name.

## That's It! 🎉

Your app is now live on GitHub Pages. Every time you push changes to the `main` branch, it will automatically rebuild and deploy.

## Troubleshooting

**Workflow not running?**
- Make sure you pushed to the `main` branch
- Check that the workflow file exists at `.github/workflows/deploy.yml`

**App shows blank page?**
- Wait a few minutes for GitHub Pages to propagate
- Clear your browser cache
- Check the browser console for errors

**Need help?**
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
- Check [README.md](./README.md) for more information


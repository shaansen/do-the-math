# Bill Splitter App 💳

A modern web app to split bills and receipts with your partner. Take a photo of your bill, assign items to each person, and automatically calculate the split including taxes.

## Features

- 📸 **Photo Capture**: Take a picture of your bill or upload an image
- 🔍 **OCR Processing**: Automatically extracts items and prices from receipts
- 👥 **Smart Assignment**: Assign items to person 1, person 2, or both
- 💰 **Tax Splitting**: Automatically calculates and splits taxes proportionally
- 📊 **Clear Summary**: Beautiful breakdown showing each person's total

## Getting Started

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deploying to GitHub Pages

### Quick Start (Recommended - Automatic)

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

3. **That's it!** The workflow automatically deploys on every push to `main`.

Your app will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

> 📖 See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions and troubleshooting.

### Manual Deployment

If you prefer manual deployment:

1. **Build with your repository name:**
   ```bash
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

## Configuration

### Changing the Base Path

If your GitHub Pages URL is `https://username.github.io/repo-name/`, you need to set the base path:

**For manual deployment:**
Update the build script in `package.json`:
```json
"build:gh-pages": "BASE_PATH='/repo-name/' vite build"
```

**For automatic deployment:**
The GitHub Actions workflow automatically uses your repository name. If you need to customize it, edit `.github/workflows/deploy.yml` and change:
```yaml
BASE_PATH: '/your-custom-path/'
```

### Using a Custom Domain

If you're using a custom domain (e.g., `https://yourdomain.com`), set the base path to `/`:

```bash
BASE_PATH='/' npm run build
```

## How to Use

1. **Take or Upload a Photo**: Click "Use Camera" to take a photo or "Choose File" to upload an existing image
2. **Wait for Processing**: The app will extract items and prices from your bill using OCR
3. **Assign Items**: Click on each item to assign it to you, your partner, or both
4. **Review Summary**: See the breakdown showing each person's share including proportional tax
5. **Start New Bill**: Click "Start New Bill" to process another receipt

## Technologies Used

- React 18
- Vite
- Tesseract.js (OCR)
- Modern CSS with Gradients

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes

- OCR accuracy depends on bill image quality. Ensure good lighting and clear text.
- For best results, use high-resolution images with clear, readable text.
- If OCR doesn't detect items automatically, you may need to add them manually (feature coming soon).

## License

MIT


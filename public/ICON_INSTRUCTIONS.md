# How to Generate Home Screen Icons

## Quick Steps

1. **Open the icon generator:**
   - In development: `http://localhost:5173/icon-generator.html`
   - Or after deployment: `https://shaansen.github.io/do-the-math/icon-generator.html`

2. **Wait for avatars to load** (they should appear side by side)

3. **Click "Download Icon as PNG"** button

4. **Save the downloaded files** to the `public` folder:
   - `apple-touch-icon.png` (180x180) - for iOS
   - `icon-192.png` (192x192) - for Android
   - `icon-512.png` (512x512) - for Android
   - `favicon-32x32.png` (32x32) - for browser tab
   - `favicon-16x16.png` (16x16) - for browser tab

5. **Commit and push** the icon files to GitHub

6. **After deployment**, when you "Add to Home Screen" on iPhone, you'll see the avatars icon instead of the letter "D"!

## Manual Method (if download doesn't work)

If the download button doesn't work:
1. Take a screenshot of the icon container (the colored box with avatars)
2. Crop it to exactly 180x180 pixels
3. Save as `apple-touch-icon.png` in the `public` folder
4. Resize to create the other sizes (192x192, 512x512, 32x32, 16x16)


# OCR Configuration

This app uses **Tesseract.js** for OCR (Optical Character Recognition) to extract prices from bill images.

## Current Setup

- **Library**: Tesseract.js v5.0.4
- **Mode**: Client-side processing (no external API calls)
- **Optimization**: Configured for numbers only (`0123456789.$`)
- **Engine**: LSTM Neural Network engine for better accuracy

## How It Works

1. User uploads/takes a photo of the bill
2. Image is processed client-side using Tesseract.js
3. Only numbers and prices are extracted (filters out text)
4. Detected prices are displayed in a list for assignment

## Optimizations Applied

- **Character Whitelist**: Only looks for numbers and decimal points
- **Page Segmentation**: Optimized for uniform text blocks
- **LSTM Engine**: Uses neural network for better recognition
- **Word-level Extraction**: Processes both full text and individual word boxes

## Benefits

✅ **Privacy**: All processing happens in the browser  
✅ **Free**: No API costs or limits  
✅ **Fast**: Optimized for numbers only  
✅ **Reliable**: Works offline once loaded  

## Tips for Best Results

- Use clear, well-lit photos
- Ensure text is readable and not blurry
- Hold camera steady while taking photos
- Use high-resolution images when possible

## Future Improvements

If you need better accuracy in the future, consider:
- Google Cloud Vision API (requires API key, more accurate)
- Azure Computer Vision (requires API key)
- Image preprocessing (contrast, brightness adjustments)

For now, Tesseract.js provides a good balance of accuracy, privacy, and ease of use.


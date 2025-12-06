# OCR Configuration

This app uses **Tesseract.js** as the primary OCR engine, with **OCR.space** as an automatic fallback for better accuracy.

## Current Setup

### Primary: Tesseract.js
- **Library**: Tesseract.js v5.0.4
- **Mode**: Client-side processing (runs in browser)
- **Optimization**: Configured for numbers only (`0123456789.$`)
- **Engine**: LSTM Neural Network engine for better accuracy
- **Privacy**: All processing happens locally in the browser

### Fallback: OCR.space API
- **Service**: Cloud-based OCR API
- **Free Tier**: 25,000 requests/month (no API key required)
- **Activation**: Automatically used when Tesseract finds no prices or fails
- **Benefits**: Higher accuracy for difficult images
- **Privacy Note**: Images are sent to OCR.space servers (deleted after processing)

## How It Works

1. User uploads/takes a photo of the bill
2. Image is enhanced automatically (contrast, brightness, upscaling)
3. **Primary**: Tesseract.js processes the image client-side
4. **Fallback**: If Tesseract finds no prices or fails, OCR.space API is used automatically
5. Prices are extracted and displayed in a list for assignment

## Optimizations Applied

- **Character Whitelist**: Only looks for numbers and decimal points
- **Page Segmentation**: Optimized for uniform text blocks
- **LSTM Engine**: Uses neural network for better recognition
- **Word-level Extraction**: Processes both full text and individual word boxes
- **Automatic Image Enhancement**: Pre-processing improves OCR accuracy
- **Dual OCR Strategy**: Tesseract for privacy, OCR.space for accuracy

## Benefits

✅ **Privacy First**: Tesseract processes locally in browser  
✅ **Better Accuracy**: OCR.space fallback for difficult images  
✅ **Free**: No API costs (OCR.space free tier: 25k requests/month)  
✅ **Reliable**: Works offline with Tesseract, online with OCR.space fallback  
✅ **Automatic**: Seamless fallback - no user action needed  

## Tips for Best Results

- Use clear, well-lit photos
- Ensure text is readable and not blurry
- Hold camera steady while taking photos
- Use high-resolution images when possible
- The app automatically tries both OCR methods for best results

## API Key (Optional)

If you want to use OCR.space with higher limits or want to track usage:
1. Sign up at [ocr.space](https://ocr.space/ocrapi)
2. Get your free API key
3. Update `ocrService.js` and uncomment the `apikey` line in `extractPricesWithOCRSpace()`



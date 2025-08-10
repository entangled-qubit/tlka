# Image Management Guide

This guide explains how to add new images to the website and handle HEIC files.

## Adding New Images

### For Main Carousel (images_main folder)

1. Add your images to the `images_main` folder
2. Update the `imagesMainFiles` array in `script.js`:
   ```javascript
   const imagesMainFiles = [
     'images_main/kabir1.jpg',
     'images_main/kabir2.jpg',
     'images_main/kabir3.jpg',
     // Add your new images here
     'images_main/your-new-image.jpg'
   ];
   ```

### For Scattered Background Photos (photos_scattered folder)

1. Add your images to the `photos_scattered` folder
2. Update the `images` array in `script.js`:
   ```javascript
   const images = [
     'photos_scattered/be674d9d-9fef-413e-8706-10ae0f8e4da9.JPG',
     'photos_scattered/kabir1.jpg',
     // ... other images
     'photos_scattered/your-new-image.jpg'
   ];
   ```

## HEIC File Support

HEIC (High Efficiency Image Format) files are now automatically converted to JPG using the heic2any library, providing better browser compatibility.

### How HEIC Conversion Works

The website now includes the heic2any library which:
1. Automatically detects HEIC files in the scattered background photos
2. Converts them to JPG format in the browser
3. Falls back to the original HEIC if conversion fails

### Browser Compatibility

With the heic2any library:
- HEIC files now work in all modern browsers (Chrome, Firefox, Edge, Safari)
- No manual conversion needed
- Automatic fallback to original HEIC if conversion fails

### Manual Conversion (Optional)

If you prefer to convert HEIC files manually, here are several methods:

1. **Using ImageMagick (command line)**
   ```bash
   # Install ImageMagick first
   # Then convert HEIC to JPG
   magick convert input.HEIC output.jpg
   ```

2. **Using Adobe DNG Converter**
   - Download from Adobe website
   - Batch convert HEIC files to JPG

3. **Online Converters**
   - CloudConvert
   - Convertio
   - HEICtoJPEG.com

4. **Using Preview on macOS**
   - Open HEIC file in Preview
   - Go to File > Export
   - Select JPG format
   - Save the file

### Recommended Workflow

1. Add HEIC files directly to the `photos_scattered` folder
2. Update the `images` array in `script.js` with the HEIC file paths
3. The heic2any library will automatically convert them for display
4. For best performance, consider converting HEIC to JPG manually before uploading

## Best Practices

1. **File Formats**: JPG files provide the best compatibility, but HEIC is now supported
2. **File Sizes**: Optimize images to reduce loading times
3. **Naming**: Use descriptive filenames without spaces or special characters
4. **Organization**: Keep images organized in their respective folders
5. **Backup**: Always keep backups of original images before conversion

## Testing Image Display

After adding new images:
1. Open `index.html` in different browsers (Chrome, Firefox, Safari, Edge)
2. Check that all images display correctly
3. Verify that the carousel functionality works
4. Test on mobile devices to ensure responsive design
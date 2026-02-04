import { getIndex } from "../engine/utils.js";

/**
 * Clean pixelation via downsampling
 * Reduces image to target size by averaging pixels
 * No color quantization - keeps natural colors like pixelartvillage.com
 */
export function pixelateImage(ctx, sourceImageData, pixelSize) {
    const srcWidth = sourceImageData.width;
    const srcHeight = sourceImageData.height;
    const srcData = sourceImageData.data;
    
    // Calculate target dimensions
    const targetWidth = Math.floor(srcWidth / pixelSize);
    const targetHeight = Math.floor(srcHeight / pixelSize);
    
    if (targetWidth === 0 || targetHeight === 0) {
        return sourceImageData;
    }
    
    const targetImageData = ctx.createImageData(targetWidth, targetHeight);
    const targetData = targetImageData.data;
    
    // For each target pixel, average the corresponding source block
    for (let y = 0; y < targetHeight; y++) {
        for (let x = 0; x < targetWidth; x++) {
            const srcX = x * pixelSize;
            const srcY = y * pixelSize;
            
            let r = 0, g = 0, b = 0, a = 0;
            let count = 0;
            
            // Average all pixels in this block
            for (let dy = 0; dy < pixelSize && srcY + dy < srcHeight; dy++) {
                for (let dx = 0; dx < pixelSize && srcX + dx < srcWidth; dx++) {
                    const i = getIndex(srcX + dx, srcY + dy, srcWidth);
                    r += srcData[i];
                    g += srcData[i + 1];
                    b += srcData[i + 2];
                    a += srcData[i + 3];
                    count++;
                }
            }
            
            // Set averaged color (no quantization!)
            const targetIndex = getIndex(x, y, targetWidth);
            targetData[targetIndex] = r / count;
            targetData[targetIndex + 1] = g / count;
            targetData[targetIndex + 2] = b / count;
            targetData[targetIndex + 3] = a / count;
        }
    }
    
    return targetImageData;
}

/**
 * Upscale pixelated image back to larger size
 * Each pixel becomes a solid block (nearest neighbor)
 */
export function upscalePixelated(ctx, pixelatedData, targetWidth, targetHeight) {
    const srcWidth = pixelatedData.width;
    const srcHeight = pixelatedData.height;
    const srcData = pixelatedData.data;
    
    const scaleX = targetWidth / srcWidth;
    const scaleY = targetHeight / srcHeight;
    
    const resultData = ctx.createImageData(targetWidth, targetHeight);
    const resultPixels = resultData.data;
    
    for (let y = 0; y < targetHeight; y++) {
        for (let x = 0; x < targetWidth; x++) {
            // Find source pixel (nearest neighbor)
            const srcX = Math.floor(x / scaleX);
            const srcY = Math.floor(y / scaleY);
            
            const srcIndex = getIndex(srcX, srcY, srcWidth);
            const targetIndex = getIndex(x, y, targetWidth);
            
            resultPixels[targetIndex] = srcData[srcIndex];
            resultPixels[targetIndex + 1] = srcData[srcIndex + 1];
            resultPixels[targetIndex + 2] = srcData[srcIndex + 2];
            resultPixels[targetIndex + 3] = srcData[srcIndex + 3];
        }
    }
    
    return resultData;
}


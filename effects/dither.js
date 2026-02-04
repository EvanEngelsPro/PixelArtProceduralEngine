import { getIndex } from "../engine/utils.js";

/**
 * Dithering effect using Floyd-Steinberg algorithm
 * Creates a retro pixel art look by reducing colors and diffusing error
 */
export function ditherEffect(imageData, params = {}) {
    const { width, height, data } = imageData;
    const levels = params.levels || 2; // Number of color levels per channel
    const factor = 255 / (levels - 1);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = getIndex(x, y, width);
            
            // Skip transparent pixels
            if (data[i + 3] === 0) continue;

            // Process each RGB channel
            for (let c = 0; c < 3; c++) {
                const oldPixel = data[i + c];
                const newPixel = Math.round(oldPixel / factor) * factor;
                data[i + c] = newPixel;
                
                const error = oldPixel - newPixel;
                
                // Distribute error to neighboring pixels (Floyd-Steinberg)
                if (x + 1 < width) {
                    const ri = getIndex(x + 1, y, width);
                    data[ri + c] = Math.min(255, Math.max(0, data[ri + c] + error * 7 / 16));
                }
                if (x - 1 >= 0 && y + 1 < height) {
                    const bli = getIndex(x - 1, y + 1, width);
                    data[bli + c] = Math.min(255, Math.max(0, data[bli + c] + error * 3 / 16));
                }
                if (y + 1 < height) {
                    const bi = getIndex(x, y + 1, width);
                    data[bi + c] = Math.min(255, Math.max(0, data[bi + c] + error * 5 / 16));
                }
                if (x + 1 < width && y + 1 < height) {
                    const bri = getIndex(x + 1, y + 1, width);
                    data[bri + c] = Math.min(255, Math.max(0, data[bri + c] + error * 1 / 16));
                }
            }
        }
    }
}

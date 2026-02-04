import { getIndex } from "../engine/utils.js";

/**
 * Adds procedural noise to the image
 * Useful for creating texture and variation
 */
export function noiseEffect(imageData, params = {}) {
    const { width, height, data } = imageData;
    const intensity = params.intensity || 0.1;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = getIndex(x, y, width);
            
            // Skip transparent pixels
            if (data[i + 3] === 0) continue;

            // Add random noise to each RGB channel
            const noise = (Math.random() - 0.5) * 255 * intensity;
            data[i] = Math.min(255, Math.max(0, data[i] + noise));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
        }
    }
}

import { getIndex } from "../engine/utils.js";

/**
 * Adjust brightness of an image
 * @param {ImageData} imageData - The image data to adjust
 * @param {number} value - Brightness adjustment (-100 to +100)
 */
export function adjustBrightness(imageData, value) {
    const data = imageData.data;
    const adjustment = (value / 100) * 255;
    
    for (let i = 0; i < data.length; i += 4) {
        // Skip transparent pixels
        if (data[i + 3] === 0) continue;
        
        data[i] = Math.min(255, Math.max(0, data[i] + adjustment));     // R
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + adjustment)); // G
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + adjustment)); // B
    }
}

/**
 * Adjust contrast of an image
 * @param {ImageData} imageData - The image data to adjust
 * @param {number} value - Contrast adjustment (-100 to +100)
 */
export function adjustContrast(imageData, value) {
    const data = imageData.data;
    const factor = (259 * (value + 255)) / (255 * (259 - value));
    
    for (let i = 0; i < data.length; i += 4) {
        // Skip transparent pixels
        if (data[i + 3] === 0) continue;
        
        data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));     // R
        data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128)); // G
        data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128)); // B
    }
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    
    return [h, s, l];
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h, s, l) {
    let r, g, b;
    
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Adjust saturation of an image
 * @param {ImageData} imageData - The image data to adjust
 * @param {number} value - Saturation adjustment (-100 to +100)
 */
export function adjustSaturation(imageData, value) {
    const data = imageData.data;
    const adjustment = value / 100;
    
    for (let i = 0; i < data.length; i += 4) {
        // Skip transparent pixels
        if (data[i + 3] === 0) continue;
        
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const [h, s, l] = rgbToHsl(r, g, b);
        const newS = Math.min(1, Math.max(0, s + adjustment));
        const [newR, newG, newB] = hslToRgb(h, newS, l);
        
        data[i] = newR;
        data[i + 1] = newG;
        data[i + 2] = newB;
    }
}

/**
 * Apply all adjustments at once
 * @param {ImageData} imageData - The image data to adjust
 * @param {Object} adjustments - { brightness, contrast, saturation }
 */
export function applyAllAdjustments(imageData, adjustments) {
    const { brightness = 0, contrast = 0, saturation = 0 } = adjustments;
    
    // Apply in order: brightness -> contrast -> saturation
    if (brightness !== 0) {
        adjustBrightness(imageData, brightness);
    }
    if (contrast !== 0) {
        adjustContrast(imageData, contrast);
    }
    if (saturation !== 0) {
        adjustSaturation(imageData, saturation);
    }
}

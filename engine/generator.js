import { getIndex } from "./utils.js";

/**
 * Simple 2D Perlin-like noise function
 * Used for procedural generation
 */
function noise2D(x, y, seed = 0) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
}

/**
 * Smoothed noise using bilinear interpolation
 */
function smoothNoise(x, y, seed = 0) {
    const fracX = x - Math.floor(x);
    const fracY = y - Math.floor(y);
    
    const x1 = Math.floor(x);
    const y1 = Math.floor(y);
    const x2 = x1 + 1;
    const y2 = y1 + 1;
    
    const v1 = noise2D(x1, y1, seed);
    const v2 = noise2D(x2, y1, seed);
    const v3 = noise2D(x1, y2, seed);
    const v4 = noise2D(x2, y2, seed);
    
    const i1 = v1 * (1 - fracX) + v2 * fracX;
    const i2 = v3 * (1 - fracX) + v4 * fracX;
    
    return i1 * (1 - fracY) + i2 * fracY;
}

/**
 * Generates a random sprite with symmetry
 * Perfect for creating pixel art characters/objects
 */
export function generateSymmetricSprite(ctx, width, height, palette) {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    const halfWidth = Math.floor(width / 2);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < halfWidth; x++) {
            // Random chance to draw a pixel
            if (Math.random() > 0.5) {
                const color = palette[Math.floor(Math.random() * palette.length)];
                
                // Left side
                const i1 = getIndex(x, y, width);
                data[i1] = color.r;
                data[i1 + 1] = color.g;
                data[i1 + 2] = color.b;
                data[i1 + 3] = 255;
                
                // Mirror to right side
                const mirrorX = width - 1 - x;
                const i2 = getIndex(mirrorX, y, width);
                data[i2] = color.r;
                data[i2 + 1] = color.g;
                data[i2 + 2] = color.b;
                data[i2 + 3] = 255;
            }
        }
    }
    
    return imageData;
}

/**
 * Generates a random pattern using noise
 */
export function generateNoisePattern(ctx, width, height, palette, seed = Math.random() * 1000) {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    const scale = 0.1; // Noise scale
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const noiseValue = smoothNoise(x * scale, y * scale, seed);
            const colorIndex = Math.floor(noiseValue * palette.length);
            const color = palette[Math.min(colorIndex, palette.length - 1)];
            
            const i = getIndex(x, y, width);
            data[i] = color.r;
            data[i + 1] = color.g;
            data[i + 2] = color.b;
            data[i + 3] = 255;
        }
    }
    
    return imageData;
}

/**
 * Generates a simple landscape using noise
 */
export function generateLandscape(ctx, width, height, palette) {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    const seed = Math.random() * 1000;
    
    // Generate height map
    const heightMap = [];
    for (let x = 0; x < width; x++) {
        const noiseValue = smoothNoise(x * 0.05, 0, seed);
        heightMap[x] = Math.floor(noiseValue * height * 0.5) + Math.floor(height * 0.25);
    }
    
    // Draw landscape
    for (let x = 0; x < width; x++) {
        const terrainHeight = heightMap[x];
        
        for (let y = 0; y < height; y++) {
            const i = getIndex(x, y, width);
            
            if (y < terrainHeight) {
                // Sky
                const skyColor = palette[0];
                data[i] = skyColor.r;
                data[i + 1] = skyColor.g;
                data[i + 2] = skyColor.b;
                data[i + 3] = 255;
            } else if (y < terrainHeight + 3) {
                // Grass/surface
                const grassColor = palette[1];
                data[i] = grassColor.r;
                data[i + 1] = grassColor.g;
                data[i + 2] = grassColor.b;
                data[i + 3] = 255;
            } else {
                // Ground
                const groundColor = palette[2];
                data[i] = groundColor.r;
                data[i + 1] = groundColor.g;
                data[i + 2] = groundColor.b;
                data[i + 3] = 255;
            }
        }
    }
    
    return imageData;
}

/**
 * Predefined color palettes for procedural generation
 */
export const palettes = {
    retro: [
        { r: 0, g: 0, b: 0 },
        { r: 255, g: 255, b: 255 },
        { r: 255, g: 0, b: 77 },
        { r: 41, g: 173, b: 255 },
        { r: 131, g: 118, b: 156 }
    ],
    nature: [
        { r: 135, g: 206, b: 235 }, // Sky blue
        { r: 34, g: 139, b: 34 },   // Forest green
        { r: 139, g: 69, b: 19 },   // Saddle brown
        { r: 255, g: 215, b: 0 },   // Gold
        { r: 0, g: 100, b: 0 }      // Dark green
    ],
    cyberpunk: [
        { r: 255, g: 0, b: 255 },   // Magenta
        { r: 0, g: 255, b: 255 },   // Cyan
        { r: 255, g: 255, b: 0 },   // Yellow
        { r: 138, g: 43, b: 226 },  // Blue violet
        { r: 0, g: 0, b: 0 }        // Black
    ],
    sunset: [
        { r: 255, g: 94, b: 77 },   // Coral
        { r: 255, g: 159, b: 64 },  // Orange
        { r: 255, g: 206, b: 84 },  // Yellow
        { r: 75, g: 0, b: 130 },    // Indigo
        { r: 138, g: 43, b: 226 }   // Purple
    ]
};

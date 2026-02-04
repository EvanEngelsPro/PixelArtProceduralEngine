import { copyImageData } from "./engine/utils.js";
import { pixelateImage, upscalePixelated } from "./effects/pixelate.js";
import { applyAllAdjustments } from "./effects/adjustments.js";

// Canvas setup
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

// Default canvas size
const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 300;
canvas.width = DEFAULT_WIDTH;
canvas.height = DEFAULT_HEIGHT;

// State management
let originalImage = null;  // The loaded Image object
let originalImageData = null;  // Original canvas ImageData
let currentSettings = {
    pixelSize: 8,
    brightness: 0,
    contrast: 0,
    saturation: 0
};

// === Image Loading ===

function loadImageFromFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            displayImage(img);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function loadImageFromUrl(url) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
        originalImage = img;
        displayImage(img);
    };
    img.onerror = () => {
        alert("Failed to load image. Make sure the URL is correct and allows CORS.");
    };
    img.src = url;
}

function displayImage(img) {
    // Resize canvas to fit image (max 800px)
    const maxSize = 800;
    let width = img.width;
    let height = img.height;
    
    if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
    }
    
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    originalImageData = ctx.getImageData(0, 0, width, height);
    
    // Apply initial pixelation
    applyEffects();
    
    console.log("Image loaded:", width, "x", height);
}

// === Core Processing ===

function applyEffects() {
    if (!originalImageData) return;
    
    // Start with original image
    let workingData = copyImageData(ctx, originalImageData);
    
    // Apply adjustments first
    applyAllAdjustments(workingData, {
        brightness: currentSettings.brightness,
        contrast: currentSettings.contrast,
        saturation: currentSettings.saturation
    });
    
    // Then pixelate
    if (currentSettings.pixelSize > 1) {
        const pixelated = pixelateImage(ctx, workingData, currentSettings.pixelSize);
        
        // Upscale back to original size for display
        const upscaled = upscalePixelated(ctx, pixelated, workingData.width, workingData.height);
        ctx.putImageData(upscaled, 0, 0);
    } else {
        ctx.putImageData(workingData, 0, 0);
    }
}

// === UI Controls - Upload ===

const fileInput = document.getElementById("fileInput");
document.getElementById("uploadBtn").onclick = () => {
    fileInput.click();
};

fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        loadImageFromFile(file);
    }
});

document.getElementById("loadUrl").onclick = () => {
    const url = document.getElementById("urlInput").value.trim();
    if (url) {
        loadImageFromUrl(url);
    }
};

document.getElementById("urlInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const url = e.target.value.trim();
        if (url) {
            loadImageFromUrl(url);
        }
    }
});

// === UI Controls - Sliders ===

document.getElementById("pixelSize").addEventListener("input", (e) => {
    const value = parseInt(e.target.value);
    document.getElementById("pixelSizeValue").textContent = value;
    currentSettings.pixelSize = value;
    applyEffects();
});

document.getElementById("brightness").addEventListener("input", (e) => {
    const value = parseInt(e.target.value);
    document.getElementById("brightnessValue").textContent = value;
    currentSettings.brightness = value;
    applyEffects();
});

document.getElementById("contrast").addEventListener("input", (e) => {
    const value = parseInt(e.target.value);
    document.getElementById("contrastValue").textContent = value;
    currentSettings.contrast = value;
    applyEffects();
});

document.getElementById("saturation").addEventListener("input", (e) => {
    const value = parseInt(e.target.value);
    document.getElementById("saturationValue").textContent = value;
    currentSettings.saturation = value;
    applyEffects();
});

// === Download Buttons ===

document.getElementById("downloadSmall").onclick = () => {
    if (!originalImageData) {
        alert("Please load an image first!");
        return;
    }
    
    // Create small version (pixelated size)
    let workingData = copyImageData(ctx, originalImageData);
    applyAllAdjustments(workingData, currentSettings);
    
    const pixelated = pixelateImage(ctx, workingData, currentSettings.pixelSize);
    
    // Create temporary canvas for download
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = pixelated.width;
    tempCanvas.height = pixelated.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(pixelated, 0, 0);
    
    const link = document.createElement('a');
    link.download = `pixel-art-small-${Date.now()}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
};

document.getElementById("downloadLarge").onclick = () => {
    if (!originalImageData) {
        alert("Please load an image first!");
        return;
    }
    
    // Download current canvas (upscaled version)
    const link = document.createElement('a');
    link.download = `pixel-art-large-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
};

// === Reset Button ===

document.getElementById("reset").onclick = () => {
    if (!originalImageData) return;
    
    // Reset all settings
    currentSettings = {
        pixelSize: 8,
        brightness: 0,
        contrast: 0,
        saturation: 0
    };
    
    // Reset UI
    document.getElementById("pixelSize").value = 8;
    document.getElementById("pixelSizeValue").textContent = 8;
    document.getElementById("brightness").value = 0;
    document.getElementById("brightnessValue").textContent = 0;
    document.getElementById("contrast").value = 0;
    document.getElementById("contrastValue").textContent = 0;
    document.getElementById("saturation").value = 0;
    document.getElementById("saturationValue").textContent = 0;
    
    // Reapply effects
    applyEffects();
};

// === Initial State ===

ctx.fillStyle = "#1e293b";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = "#64748b";
ctx.font = "bold 20px Inter, sans-serif";
ctx.textAlign = "center";
ctx.fillText("Upload an image to get started", canvas.width / 2, canvas.height / 2 - 10);
ctx.font = "14px Inter, sans-serif";
ctx.fillText("or paste an image URL above", canvas.width / 2, canvas.height / 2 + 20);
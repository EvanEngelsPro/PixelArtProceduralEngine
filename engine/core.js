import  { copyImageData } from './utils.js';

export function applyEffect(ctx, ImageData, effect, params = {}) {
    const workingCopy = copyImageData(ctx, ImageData);
    effect(workingCopy, params);
    return workingCopy;
}


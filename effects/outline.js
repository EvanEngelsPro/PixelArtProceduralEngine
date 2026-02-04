import { getIndex, clamp } from "../engine/utils.js";

export function outlineEffect(imageData, params) {
    const { width, height, data } = imageData;
    const thickness = params.thickness || 1;

    const original = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = getIndex(x, y, width);
            if (original[i + 3] !== 0) continue;
            let border = false;

            for (let oy = -thickness; oy <= thickness; oy++) {
                for (let ox = -thickness; ox <= thickness; ox++) {
                    const nx = clamp(x + ox, 0, width - 1);
                    const ny = clamp(y + oy, 0, height - 1);
                    const ni = getIndex(nx, ny, width);
                    if (original[ni + 3] > 0) border = true;
                }
            }
            if (border) {
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
                data[i + 3] = 255;
            }
        }
    }
}
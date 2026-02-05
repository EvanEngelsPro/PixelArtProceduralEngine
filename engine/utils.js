export function getIndex(x, y, width) {
    return (y * width + x) * 4;
}

export function copyImageData(ctx, src) {
    const copy = ctx.createImageData(src.width, src.height);
    copy.data.set(src.data);
    return copy;
}
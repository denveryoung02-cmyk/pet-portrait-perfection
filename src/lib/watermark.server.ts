/**
 * Server-only watermarking for preview images.
 *
 * Bakes a tiled, diagonal "PAWTOONS PREVIEW" watermark INTO the pixels so the
 * preview cannot be saved/right-clicked into a clean image. The clean original
 * is never watermarked — it lives in a private bucket and is released only via
 * a signed URL after payment (see fulfillment.functions.ts).
 *
 * Uses @cf-wasm/photon (WASM) which runs in the Cloudflare Workers runtime
 * (no native sharp/canvas). The same package resolves to the Node build under
 * Node, so this can be unit-checked locally.
 */
import { PhotonImage, draw_text, rotate, crop } from "@cf-wasm/photon";

const TEXT = "PAWTOONS PREVIEW";
const FONT_SIZE = 34;
const STEP_X = 235; // horizontal spacing between repeats
const STEP_Y = 92; // vertical spacing between rows
const ANGLE = -35; // degrees
const OPACITY = 0.3; // white text strength composited over the image

/**
 * Returns a PNG (as bytes) of the input image with the diagonal preview
 * watermark baked in. Input may be any format photon can decode (PNG/JPEG).
 */
export function bakeWatermark(imageBytes: Uint8Array): Uint8Array {
  const base = PhotonImage.new_from_byteslice(imageBytes);
  const w = base.get_width();
  const h = base.get_height();

  // Draw the tiled text onto an oversized transparent layer, rotate it, then
  // crop back to the image size — this gives a clean diagonal tiling that
  // covers the whole frame regardless of aspect ratio.
  const big = Math.ceil(Math.hypot(w, h)) + 80;
  const overlay = new PhotonImage(new Uint8Array(big * big * 4), big, big);
  let row = 0;
  for (let y = 0; y < big; y += STEP_Y, row += 1) {
    const offset = (row % 2) * (STEP_X / 2); // brick-stagger alternate rows
    for (let x = -STEP_X; x < big + STEP_X; x += STEP_X) {
      draw_text(overlay, TEXT, Math.round(x + offset), Math.round(y), FONT_SIZE);
    }
  }

  const rotated = rotate(overlay, ANGLE);
  const rw = rotated.get_width();
  const rh = rotated.get_height();
  const cx = Math.round((rw - w) / 2);
  const cy = Math.round((rh - h) / 2);
  const mask = crop(rotated, cx, cy, cx + w, cy + h).get_raw_pixels();

  // Alpha-composite white text over the base, keyed on text whiteness so the
  // rotate fill colour is irrelevant. Gives precise control over opacity.
  const out = base.get_raw_pixels();
  for (let i = 0; i < out.length; i += 4) {
    const strength = ((mask[i] + mask[i + 1] + mask[i + 2]) / 765) * OPACITY;
    out[i] = out[i] * (1 - strength) + 255 * strength;
    out[i + 1] = out[i + 1] * (1 - strength) + 255 * strength;
    out[i + 2] = out[i + 2] * (1 - strength) + 255 * strength;
  }

  return new PhotonImage(out, w, h).get_bytes();
}

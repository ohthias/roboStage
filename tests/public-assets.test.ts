import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { renderPublicAssets } from "../scripts/generate-public-assets.mjs";

const root = path.resolve(__dirname, "..");

describe("lib/assets-manifest.ts", () => {
  it("está em dia com public/ (rode npm run data:assets)", () => {
    const current = readFileSync(path.join(root, "lib/assets-manifest.ts"), "utf8");
    expect(current).toBe(renderPublicAssets());
  });
});

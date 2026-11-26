import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { readMissionCatalog, renderMissionImages } from "../scripts/generate-mission-images.mjs";
import { getTestImage } from "@/features/labtest/lib/catalog";

const root = path.resolve(__dirname, "..");

describe("features/labtest/lib/mission-images.ts", () => {
  it("está em dia com data/leagues/fll/seasons (rode npm run data:mission-images)", () => {
    const catalog = readMissionCatalog();
    const current = readFileSync(path.join(root, "features/labtest/lib/mission-images.ts"), "utf8");
    expect(current).toBe(renderMissionImages(catalog));
  });

  it("getTestImage usa as imagens das missões escolhidas", () => {
    const image = getTestImage({
      mode: "runs",
      season: "bioglow",
      config: { missions: ["EL", "M02", "M01"] },
    });
    expect(image).toEqual([
      "/images/missions/bioglow/thumb-mission-02.png",
      "/images/missions/bioglow/thumb-mission-01.png",
    ]);
  });
});

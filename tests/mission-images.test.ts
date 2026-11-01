import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { renderMissionImages } from "../scripts/generate-mission-images.mjs";
import { getTestImage } from "@/utils/labtest/catalog";

const root = path.resolve(__dirname, "..");

describe("utils/labtest/mission-images.ts", () => {
  it("está em dia com public/data/missions.json (rode npm run data:mission-images)", () => {
    const catalog = JSON.parse(readFileSync(path.join(root, "public/data/missions.json"), "utf8"));
    const current = readFileSync(path.join(root, "utils/labtest/mission-images.ts"), "utf8");
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

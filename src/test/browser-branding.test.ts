import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectFile = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("browser branding", () => {
  it("uses the Dein Digital-PHYSIO favicon and title", () => {
    const html = projectFile("index.html");

    expect(html).toContain('<link rel="icon" type="image/png" href="/favicon.png" />');
    expect(html).toContain("<title>Dein Digital-PHYSIO</title>");
  });
});

import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);

describe("next.config.js", () => {
  it("reuses a prefetched page for at most 30 seconds", () => {
    // Links prefetch pages in full so that clicks are instant; this bounds how
    // old such a page can be when shown (see components/prefetch-link.tsx).
    const config = require("../../../next.config.js") as {
      experimental?: { staleTimes?: { static?: number } };
    };
    expect(config.experimental?.staleTimes?.static).toBe(30);
  });
});

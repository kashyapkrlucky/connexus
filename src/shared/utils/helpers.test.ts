import { describe, expect, it } from "vitest";
import { appendUnique } from "./paginate";
import { toExcerpt } from "@/shared/constants/site";
import { isOptimizedImageHost } from "@/shared/constants/imageHosts";

describe("appendUnique", () => {
  it("appends a page and drops items already shown", () => {
    const page1 = [{ id: "a" }, { id: "b" }];
    const page2 = [{ id: "b" }, { id: "c" }];
    expect(appendUnique(page1, page2).map((x) => x.id)).toEqual(["a", "b", "c"]);
  });

  it("does not mutate its inputs", () => {
    const page1 = [{ id: "a" }];
    appendUnique(page1, [{ id: "b" }]);
    expect(page1).toHaveLength(1);
  });
});

describe("toExcerpt", () => {
  it("uses only the first paragraph and collapses whitespace", () => {
    expect(toExcerpt("First   line\nstill first.\n\nSecond paragraph.")).toBe("First line still first.");
  });

  it("truncates long text with an ellipsis", () => {
    const excerpt = toExcerpt("word ".repeat(100), 20)!;
    expect(excerpt.length).toBeLessThanOrEqual(20);
    expect(excerpt.endsWith("…")).toBe(true);
  });

  it("returns undefined for empty content", () => {
    expect(toExcerpt(null)).toBeUndefined();
    expect(toExcerpt("   ")).toBeUndefined();
  });
});

describe("isOptimizedImageHost", () => {
  it("optimizes our own storage and avatar hosts", () => {
    expect(isOptimizedImageHost("https://lh3.googleusercontent.com/a/photo.jpg")).toBe(true);
    expect(isOptimizedImageHost("https://api.dicebear.com/9.x/notionists/png?seed=x")).toBe(true);
  });

  it("loads publisher images directly", () => {
    expect(isOptimizedImageHost("https://media2.dev.to/dynamic/image/cover.png")).toBe(false);
  });

  it("treats local paths as optimizable", () => {
    expect(isOptimizedImageHost("/logo.png")).toBe(true);
  });
});

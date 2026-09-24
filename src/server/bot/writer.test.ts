import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FeedItem } from "./sources";

const create = vi.hoisted(() => vi.fn());
vi.mock("openai", () => ({
  default: class {
    chat = { completions: { create } };
  },
}));

const { composePost } = await import("./writer");

const community = { name: "JavaScript", description: "All things JS" };
const candidates: FeedItem[] = [
  { title: "Newest item", url: "https://a.example", summary: "A summary", source: "A", publishedAt: new Date() },
  { title: "Better item", url: "https://b.example", summary: "B summary", source: "B", publishedAt: new Date() },
];
const reply = (json: object) => ({ choices: [{ message: { content: JSON.stringify(json) } }] });

beforeEach(() => create.mockReset());
afterEach(() => vi.unstubAllEnvs());

describe("composePost", () => {
  it("returns null when there are no candidates", async () => {
    expect(await composePost(community, [])).toBeNull();
  });

  it("falls back to the newest item verbatim without an API key", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const post = await composePost(community, candidates);
    expect(post).toEqual({ item: candidates[0], title: "Newest item", body: "A summary" });
    expect(create).not.toHaveBeenCalled();
  });

  it("uses the model's chosen candidate and writing", async () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test");
    create.mockResolvedValue(reply({ choice: 1, title: "  Better title ", body: "Summary.\n\nWhy it matters: x" }));

    const post = await composePost(community, candidates);
    expect(post).toEqual({ item: candidates[1], title: "Better title", body: "Summary.\n\nWhy it matters: x" });

    const request = create.mock.calls[0][0];
    expect(request.response_format.json_schema.strict).toBe(true);
    expect(request.messages[1].content).toContain("[1] Better item");
  });

  it("posts nothing when the model finds nothing relevant or picks an invalid index", async () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test");
    create.mockResolvedValueOnce(reply({ choice: -1, title: "", body: "" }));
    expect(await composePost(community, candidates)).toBeNull();

    create.mockResolvedValueOnce(reply({ choice: 7, title: "x", body: "y" }));
    expect(await composePost(community, candidates)).toBeNull();
  });
});

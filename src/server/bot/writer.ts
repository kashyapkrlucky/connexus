import OpenAI from "openai";
import type { FeedItem } from "./sources";

export interface ComposedPost {
    item: FeedItem;
    title: string;
    body: string;
}

interface CommunityContext {
    name: string;
    description: string;
}

const DEFAULT_MODEL = "gpt-5.4-mini";

const RESPONSE_SCHEMA = {
    type: "object",
    additionalProperties: false,
    required: ["choice", "title", "body"],
    properties: {
        choice: { type: "integer", description: "Index of the chosen candidate, or -1 if none fit the community." },
        title: { type: "string", description: "Post title, max 120 characters." },
        body: { type: "string", description: "Post body in plain text." },
    },
} as const;

/**
 * Picks the best candidate for the community and writes the post. Uses OpenAI when
 * OPENAI_API_KEY is set, otherwise falls back to posting the newest item verbatim.
 */
export async function composePost(community: CommunityContext, candidates: FeedItem[]): Promise<ComposedPost | null> {
    if (candidates.length === 0) return null;
    if (!process.env.OPENAI_API_KEY) return fallbackPost(candidates);

    const client = new OpenAI();
    const completion = await client.chat.completions.create({
        model: process.env.BOT_MODEL || DEFAULT_MODEL,
        messages: [
            {
                role: "system",
                content: [
                    `You curate posts for the online community "${community.name}": ${community.description}`,
                    "From the numbered candidates, choose the ONE that members would find most relevant and worth discussing.",
                    "Prefer substantive news, releases and in-depth articles over listicles, promotions or beginner tutorials.",
                    "Use only facts stated in the candidate — never invent details, numbers or quotes.",
                    "title: clear and specific, no clickbait, no emojis, max 120 characters.",
                    'body: 2-3 sentence summary, then a blank line and "Why it matters: " with one sentence, then a blank line and one open question to start discussion.',
                    "If no candidate fits the community, return choice -1 with empty title and body.",
                ].join("\n"),
            },
            {
                role: "user",
                content: candidates
                    .map((c, i) => `[${i}] ${c.title}\nSource: ${c.source} (${c.publishedAt.toISOString().slice(0, 10)})\n${c.summary}`)
                    .join("\n\n"),
            },
        ],
        response_format: {
            type: "json_schema",
            json_schema: { name: "community_post", strict: true, schema: RESPONSE_SCHEMA },
        },
    });

    const raw = completion.choices[0]?.message.content;
    if (!raw) throw new Error("Model returned no content");

    const { choice, title, body }: { choice: number; title: string; body: string } = JSON.parse(raw);
    const item = candidates[choice];
    if (!item || !title.trim() || !body.trim()) return null;

    return { item, title: title.trim().slice(0, 300), body: body.trim() };
}

function fallbackPost(candidates: FeedItem[]): ComposedPost {
    const item = candidates[0];
    return { item, title: item.title.slice(0, 300), body: item.summary || item.title };
}

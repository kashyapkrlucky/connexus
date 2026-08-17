import Image from "next/image";
import Link from "next/link";
import { Post } from "../types";

interface PostCardProps {
    post: Post;
}

export function PostCard({ post }: PostCardProps) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <header>
                <h2>
                    <Link href={`/c/${post.community.slug}`}>{post.community.slug}</Link>{" "}
                    • <Link href={`/u/${post.author.id}`}>{post.author.name}</Link>
                    {" • "} {post.createdAt}
                </h2>
            </header>
            <section>
                <h3>{post.title}</h3>
                {post.tags && post.tags.length > 0 && (
                    <div>
                        {post.tags.map((tag) => (
                            <Link key={tag} href={`/t/${tag}`}>
                                #{tag}
                            </Link>
                        ))}
                    </div>
                )}
                {post.imageUrl && (
                    <Image src={post.imageUrl} alt={post.title} width={500} height={500} />
                )}
                <div className="mt-2">
                    <p>{post.content}</p>
                </div>
            </section>
        </div>
    );
}
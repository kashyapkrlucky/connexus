import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Popular",
  description: "The most popular posts across every public Connexus community.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

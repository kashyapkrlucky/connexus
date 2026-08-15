import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">

      <Image
        className="dark:invert h-6 w-28"
        src="/logo.jpg"
        alt="Next.js logo"
        width={120}
        height={30}
        priority
      />
    </div>
  );
}

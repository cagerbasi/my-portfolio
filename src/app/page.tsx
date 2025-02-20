
export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <iframe 
          style={{borderRadius: "12px"}}
          src="https://open.spotify.com/embed/playlist/1DiBGeJfqAulnREYJIhsKs?utm_source=generator" 
          width="100%" 
          height="352"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
        />
      </main>
    </div>
  );
}

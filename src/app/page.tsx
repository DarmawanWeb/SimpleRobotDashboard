import { ThemeToggle } from "@/components/theme";

export default function Page() {
  return (
    <main className="grid min-h-dvh place-items-center">
      <div className="card flex items-center gap-3 px-5 py-4">
        <h1 className="text-xl font-semibold tracking-tight">X30 Live View</h1>
        <ThemeToggle />
      </div>
    </main>
  );
}

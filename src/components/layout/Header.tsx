import { Github } from "lucide-react";

export default function Header() {
  return (
    <header className="relative z-10 bg-background/50 backdrop-blur-sm px-6 py-2 flex items-center justify-between border-b">
      <h1 className="text-xl font-bold">Graph Visualizer</h1>
      <nav className="flex items-center gap-2">
        <a href="https://github.com/csh1668/graph" target="_blank" rel="noreferrer">
          <Github className="h-5 w-5" />
        </a>
      </nav>
    </header>
  )
}
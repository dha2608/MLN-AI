import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"
import { clsx } from "clsx"

export function ModeToggle({ className }: { className?: string }) {
  const { setTheme, theme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={clsx(
        "p-2 rounded-lg transition-colors",
        theme === 'dark' 
          ? "text-yellow-400 hover:bg-white/10" 
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
        className
      )}
      title="Chuyển chế độ Sáng/Tối"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 top-2" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}

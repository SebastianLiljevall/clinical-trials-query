import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
  if (savedTheme) return savedTheme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)

  useEffect(() => {
    // Apply theme class to document on mount and when theme changes
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

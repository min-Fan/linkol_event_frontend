import React, { useEffect, useState } from 'react';
import { Zap, Menu, Wallet, Sun, Moon } from 'lucide-react';

export const Header: React.FC = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check initial preference
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove('dark');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <header className="border-theme bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-xl font-bold text-white italic shadow-md">
            L
          </div>
          <span className="text-textPrimary text-xl font-bold tracking-tight">Linkol</span>
        </div>

        <nav className="border-theme bg-surface/50 hidden items-center gap-1 rounded-full border p-1 md:flex">
          <button className="text-textSecondary hover:text-textPrimary rounded-full px-4 py-1.5 text-sm font-medium transition-colors">
            My Agent
          </button>
          <button className="bg-surfaceHighlight text-textPrimary ring-border rounded-full px-4 py-1.5 text-sm font-medium shadow-sm ring-1">
            Predict
          </button>
          <button className="text-textSecondary hover:text-textPrimary rounded-full px-4 py-1.5 text-sm font-medium transition-colors">
            Leaderboard
          </button>
        </nav>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="text-textSecondary hover:text-textPrimary hover:bg-surfaceHighlight rounded-full p-2 transition-all"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <div className="text-textSecondary hidden items-center gap-2 text-sm md:flex">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span>Link Twitter</span>
          </div>
          <button className="bg-textPrimary text-background flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90">
            <Wallet className="h-4 w-4" />
            Connect
          </button>
          <button className="text-textSecondary md:hidden">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shadcn-ui/dropdown-menu';
import { Button } from '@shadcn-ui/button';
import { useEffect, useState } from 'react';
import { usePathname } from '@libs/i18n/navigation';
import PagesRoute from '@constants/routes';

export default function UITheme() {
  const t = useTranslations('common');
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const handleChangeTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';

    setTheme(newTheme);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Button
      className={`size-6 md:size-8 ${pathname === PagesRoute.HOME && !scrolled ? 'text-white' : 'text-muted-foreground'}`}
      variant="ghost"
      size="icon"
      onClick={handleChangeTheme}
    >
      <Sun className="size-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

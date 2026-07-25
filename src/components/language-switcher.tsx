"use client";

import { useI18n } from "@/i18n/context";
import { type Locale } from "@/i18n/en";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="relative group">
      <Button variant="ghost" size="sm" className="h-8 gap-1.5">
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline text-xs">{LANGUAGES.find((l) => l.code === locale)?.flag}</span>
      </Button>
      <div className="absolute right-0 top-full mt-1 z-50 hidden group-hover:block">
        <div className="bg-popover border border-border rounded-lg shadow-lg p-1 min-w-[120px]">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLocale(lang.code)}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md transition-colors ${
                locale === lang.code
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

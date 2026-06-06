"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {Check, Languages} from "lucide-react";
import {localeNames, locales, type Locale} from "@/config/locales";
import {usePathname, useRouter} from "@/i18n/navigation";
import {cn} from "@/lib/utils";

type LocaleSwitcherProps = {
  locale: Locale;
  label: string;
};

export function LocaleSwitcher({locale, label}: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={label}
        className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyanAccent"
      >
        <Languages className="h-4 w-4" />
        <span className="hidden sm:inline">{localeNames[locale]}</span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="z-50 max-h-80 w-36 overflow-auto rounded-md border border-slate-200 bg-white p-1 text-sm text-slate-800 shadow-xl"
        >
          {locales.map((candidate) => (
            <DropdownMenu.Item
              key={candidate}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-2 rounded px-2 py-2 outline-none hover:bg-slate-100",
                candidate === locale && "font-semibold text-primary"
              )}
              onSelect={() => router.replace(pathname, {locale: candidate})}
            >
              <span className="min-w-0 truncate">{localeNames[candidate]}</span>
              {candidate === locale ? <Check className="h-4 w-4" /> : null}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

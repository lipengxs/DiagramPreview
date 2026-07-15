import {MessageSquareText} from "lucide-react";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/Button";
import {Locale, localeNames} from "@/config/locales";
import {siteConfig} from "@/config/site";
import {Link} from "@/i18n/navigation";
import {HeaderNav} from "./HeaderNav";
import {LocaleSwitcher} from "./LocaleSwitcher";

type SiteHeaderProps = {
  locale: Locale;
};

export function SiteHeader({locale}: SiteHeaderProps) {
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-ink text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-base font-bold tracking-normal">
          <img src={siteConfig.markPath} alt="" className="h-9 w-9 rounded-md" />
          <span>{t("common.brand")}</span>
        </Link>
        <HeaderNav />
        <div className="ml-auto flex items-center gap-2">
          <LocaleSwitcher locale={locale} label={`${t("common.locale.label")}: ${localeNames[locale]}`} />
          <a href={siteConfig.feedbackUrl} target="_blank" rel="noreferrer" aria-label={t("common.actions.feedback")}>
            <Button variant="ghost" className="border border-slate-700 px-2.5 lg:px-3">
              <MessageSquareText className="h-4 w-4" />
              <span className="hidden xl:inline">{t("common.actions.feedback")}</span>
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}

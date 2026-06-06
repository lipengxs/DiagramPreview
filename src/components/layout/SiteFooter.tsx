import {useTranslations} from "next-intl";
import type {ReactNode} from "react";
import {siteConfig} from "@/config/site";
import {tools} from "@/config/tools";
import {Link} from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations();
  const popularTools = tools.filter((tool) => tool.popular).slice(0, 8);

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_repeat(3,1fr)] lg:px-8">
        <div>
          <div className="text-base font-bold text-ink">{t("common.brand")}</div>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">{t("common.footer.summary")}</p>
        </div>
        <FooterColumn title={t("common.footer.popularTools")}>
          {popularTools.map((tool) => (
            <Link key={tool.slug} href={`/${tool.slug}`} className="text-sm text-slate-600 hover:text-primary">
              {t(`tools.${tool.slug}.name`)}
            </Link>
          ))}
        </FooterColumn>
        <FooterColumn title="Resources">
          <Link href="/blog" className="text-sm text-slate-600 hover:text-primary">
            Blog
          </Link>
          <Link href="/help-center" locale="en" className="text-sm text-slate-600 hover:text-primary">
            Help Center
          </Link>
          <Link href="/contact" locale="en" className="text-sm text-slate-600 hover:text-primary">
            Contact
          </Link>
          <a href={siteConfig.feedbackUrl} className="text-sm text-slate-600 hover:text-primary">
            Feedback
          </a>
        </FooterColumn>
        <FooterColumn title="Legal">
          <Link href="/about" locale="en" className="text-sm text-slate-600 hover:text-primary">
            About
          </Link>
          <Link href="/privacy-policy" locale="en" className="text-sm text-slate-600 hover:text-primary">
            Privacy Policy
          </Link>
          <Link href="/terms-of-use" locale="en" className="text-sm text-slate-600 hover:text-primary">
            Terms of Use
          </Link>
        </FooterColumn>
      </div>
    </footer>
  );
}

function FooterColumn({title, children}: {title: string; children: ReactNode}) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      {children}
    </div>
  );
}

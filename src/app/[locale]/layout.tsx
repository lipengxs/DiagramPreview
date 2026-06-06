import {NextIntlClientProvider, hasLocale} from "next-intl";
import {getMessages, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";
import type {ReactNode} from "react";
import "../globals.css";
import {SiteFooter} from "@/components/layout/SiteFooter";
import {SiteHeader} from "@/components/layout/SiteHeader";
import {routing} from "@/i18n/routing";
import type {Locale} from "@/config/locales";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{locale: string}>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({children, params}: LocaleLayoutProps) {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <SiteHeader locale={locale as Locale} />
          <main>{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

import {NextIntlClientProvider, hasLocale} from "next-intl";
import {getMessages, setRequestLocale} from "next-intl/server";
import type {Metadata} from "next";
import {notFound} from "next/navigation";
import Script from "next/script";
import type {ReactNode} from "react";
import "../globals.css";
import {SiteFooter} from "@/components/layout/SiteFooter";
import {SiteHeader} from "@/components/layout/SiteHeader";
import {tools} from "@/config/tools";
import {routing} from "@/i18n/routing";
import type {Locale} from "@/config/locales";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{locale: string}>;
};

export const metadata: Metadata = {
  other: {
    "msvalidate.01": "B362957FC36C5EDDD6079B6D78330424",
    "yandex-verification": "22f9962285cc97be",
    "baidu-site-verification": "codeva-H4REFzrHP4"
  }
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
  const clientMessages = pickClientMessages(messages);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={clientMessages}>
          <SiteHeader locale={locale as Locale} />
          <main>{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-ED9W50FK0X" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ED9W50FK0X');
          `}
        </Script>
      </body>
    </html>
  );
}

type LocaleMessages = Awaited<ReturnType<typeof getMessages>>;

function pickClientMessages(messages: LocaleMessages) {
  const source = messages as Record<string, unknown>;
  const toolMessages = source.tools as Record<string, Record<string, unknown>> | undefined;

  return {
    common: source.common,
    tools: Object.fromEntries(
      tools.map((tool) => [
        tool.slug,
        {
          name: toolMessages?.[tool.slug]?.name
        }
      ])
    )
  };
}

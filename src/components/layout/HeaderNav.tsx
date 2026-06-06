"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {ChevronDown, Grid2X2, PanelsTopLeft} from "lucide-react";
import {useTranslations} from "next-intl";
import {headerNavItems, toolHubs, type ToolHub} from "@/config/navigation";
import {sortedTools, type ToolConfig} from "@/config/tools";
import {Link} from "@/i18n/navigation";

export function HeaderNav() {
  const t = useTranslations();

  return (
    <nav className="order-3 flex w-full gap-1 overflow-x-auto text-sm text-slate-300 md:order-none md:ml-5 md:w-auto md:flex-1">
      {headerNavItems.map((item) => {
        if (item.href === "/tools") {
          return <ToolsMegaMenu key={item.href} label={t(item.labelKey)} />;
        }

        return (
          <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-md px-3 py-2 hover:bg-slate-800 hover:text-white">
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}

function ToolsMegaMenu({label}: {label: string}) {
  const t = useTranslations();
  const menuHubs = toolHubs.filter((hub) => hub.slug !== "tools");

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="inline-flex whitespace-nowrap rounded-md px-3 py-2 outline-none hover:bg-slate-800 hover:text-white data-[state=open]:bg-slate-800 data-[state=open]:text-white">
        <span>{label}</span>
        <ChevronDown className="ml-1 mt-0.5 h-4 w-4" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={10}
          className="z-50 w-[min(900px,calc(100vw-2rem))] rounded-lg border border-slate-200 bg-white p-3 text-slate-800 shadow-xl"
        >
          <div className="mb-2 flex items-start justify-between gap-4 rounded-md bg-surface p-3">
            <div>
              <div className="font-semibold text-ink">{t("hubs.tools.title")}</div>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{t("hubs.tools.description")}</p>
            </div>
            <Link href="/tools" className="inline-flex flex-none items-center gap-1 rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-primary ring-1 ring-blue-100 hover:bg-blue-50">
              <PanelsTopLeft className="h-3.5 w-3.5" />
              {t("common.nav.viewAll")}
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {menuHubs.map((hub) => (
              <ToolGroup key={hub.slug} hub={hub} />
            ))}
          </div>
          <DropdownMenu.Separator className="my-2 h-px bg-slate-200" />
          <DropdownMenu.Item asChild>
            <Link href="/tools" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 outline-none hover:bg-slate-100">
              <Grid2X2 className="h-4 w-4 text-primary" />
              {t("hubs.tools.title")}
            </Link>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function ToolGroup({hub}: {hub: ToolHub}) {
  const t = useTranslations();
  const hubTools = getHubTools(hub).slice(0, 4);

  return (
    <div className="rounded-md border border-slate-200 p-3">
      <Link href={hub.href} className="font-semibold text-ink hover:text-primary">
        {t(hub.titleKey)}
      </Link>
      <div className="mt-3 grid gap-1.5">
        {hubTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <DropdownMenu.Item key={tool.slug} asChild>
              <Link href={`/${tool.slug}`} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-blue-50">
                <Icon className="h-4 w-4 flex-none text-primary" />
                <span className="truncate text-slate-700">{t(`tools.${tool.slug}.name`)}</span>
              </Link>
            </DropdownMenu.Item>
          );
        })}
      </div>
      <Link href={hub.href} className="mt-2 inline-flex text-xs font-semibold text-primary hover:text-blue-700">
        {t("common.nav.viewAll")}
      </Link>
    </div>
  );
}

function getHubTools(hub: ToolHub): ToolConfig[] {
  if (hub.slug === "data-visualizers") {
    return sortedTools.filter((tool) => tool.category === "data");
  }

  if (!hub.navGroup) {
    return sortedTools;
  }

  return sortedTools.filter((tool) => tool.navGroup === hub.navGroup);
}

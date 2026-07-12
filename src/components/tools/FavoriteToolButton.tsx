"use client";

import {Star} from "lucide-react";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/Button";
import {isFavoriteTool, setFavoriteTool} from "@/lib/favorite-tools";
import type {FavoriteToolLabels} from "@/lib/favorite-labels";
import {trackEvent} from "@/lib/analytics";
import {cn} from "@/lib/utils";

type FavoriteToolButtonProps = {
  slug: string;
  labels: FavoriteToolLabels;
  onMessage?: (message: string) => void;
  className?: string;
  compact?: boolean;
};

export function FavoriteToolButton({slug, labels, onMessage, className, compact = false}: FavoriteToolButtonProps) {
  const [favorite, setFavorite] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    function refresh() {
      setFavorite(isFavoriteTool(window.localStorage, slug));
    }

    setMounted(true);
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("diagrampreview:favorites-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("diagrampreview:favorites-updated", refresh);
    };
  }, [slug]);

  return (
    <Button
      type="button"
      aria-label={favorite ? labels.favorited : labels.favorite}
      title={favorite ? labels.favorited : labels.favorite}
      className={cn(compact && "h-8 px-2", className)}
      onClick={() => {
        const nextFavorite = !favorite;
        setFavorite(nextFavorite);
        setFavoriteTool(window.localStorage, slug, nextFavorite);
        trackEvent(nextFavorite ? "tool_favorite_add" : "tool_favorite_remove", {tool_slug: slug});
        onMessage?.(nextFavorite ? labels.added : labels.removed);
      }}
    >
      <Star className={favorite ? "h-4 w-4 fill-amber-400 text-amber-500" : "h-4 w-4"} />
      {compact ? <span className="sr-only">{favorite ? labels.favorited : labels.favorite}</span> : favorite ? labels.favorited : labels.favorite}
      {!mounted ? <span className="sr-only">{labels.favorite}</span> : null}
    </Button>
  );
}

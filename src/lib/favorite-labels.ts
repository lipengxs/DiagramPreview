export type FavoriteToolLabels = {
  favorite: string;
  favorited: string;
  added: string;
  removed: string;
};

export function favoriteLabelsFromAction(actionLabel: string): FavoriteToolLabels {
  const zh = /[\u3400-\u9fff]/.test(actionLabel);

  return zh
    ? {
        favorite: "收藏",
        favorited: "已收藏",
        added: "已加入收藏",
        removed: "已取消收藏"
      }
    : {
        favorite: "Favorite",
        favorited: "Favorited",
        added: "Added to favorites",
        removed: "Removed from favorites"
      };
}

import type {TreeNode} from "./tree";

export type DrawioLabels = {
  pages: string;
  objects: string;
  pageNames: string;
  defaultPage: string;
  none: string;
};

export function parseDrawioSummary(source: string, labels: DrawioLabels): TreeNode {
  const parser = new DOMParser();
  const document = parser.parseFromString(source, "application/xml");
  const parseError = document.querySelector("parsererror");

  if (parseError) {
    throw new Error(parseError.textContent ?? "Invalid XML");
  }

  const diagrams = Array.from(document.querySelectorAll("diagram"));
  const cells = Array.from(document.querySelectorAll("mxCell"));
  const pageNames = diagrams.map((diagram) => diagram.getAttribute("name") || labels.defaultPage);

  return {
    key: "draw.io",
    value: "XML",
    children: [
      {key: labels.pages, value: String(diagrams.length)},
      {key: labels.objects, value: String(cells.length)},
      {
        key: labels.pageNames,
        value: pageNames.length ? `Array(${pageNames.length})` : labels.none,
        children: pageNames.map((name, index) => ({key: String(index + 1), value: name}))
      }
    ]
  };
}

import type {TreeNode} from "./tree";

export function parseXmlTree(source: string): TreeNode {
  const document = new DOMParser().parseFromString(source, "application/xml");
  const parseError = document.querySelector("parsererror");
  if (parseError) {
    throw new Error(parseError.textContent || "Invalid XML.");
  }

  return elementToTree(document.documentElement);
}

function elementToTree(element: Element): TreeNode {
  const attributes = Array.from(element.attributes).map((attribute) => ({
    key: `@${attribute.name}`,
    value: attribute.value
  }));

  const children = Array.from(element.children).map(elementToTree);
  const text = Array.from(element.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent?.trim())
    .filter(Boolean)
    .join(" ");

  return {
    key: element.tagName,
    value: text || `Element(${attributes.length + children.length})`,
    children: [...attributes, ...children]
  };
}

import yaml from "js-yaml";

export type TreeNode = {
  key: string;
  value?: string;
  children?: TreeNode[];
};

function valueLabel(value: unknown) {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return `Array(${value.length})`;
  }

  if (typeof value === "object") {
    return "Object";
  }

  return String(value);
}

export function toTree(value: unknown, key = "root"): TreeNode {
  if (Array.isArray(value)) {
    return {
      key,
      value: `Array(${value.length})`,
      children: value.map((item, index) => toTree(item, String(index)))
    };
  }

  if (value && typeof value === "object") {
    return {
      key,
      value: "Object",
      children: Object.entries(value as Record<string, unknown>).map(([childKey, childValue]) =>
        toTree(childValue, childKey)
      )
    };
  }

  return {
    key,
    value: valueLabel(value)
  };
}

export function parseJsonTree(source: string) {
  return toTree(JSON.parse(source));
}

export function parseYamlTree(source: string) {
  return toTree(yaml.load(source));
}

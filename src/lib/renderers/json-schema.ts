import {toTree, type TreeNode} from "./tree";

type JsonSchema = {
  title?: string;
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  enum?: unknown[];
  description?: string;
  oneOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  allOf?: JsonSchema[];
};

export function parseJsonSchemaTree(source: string) {
  const schema = JSON.parse(source) as JsonSchema;
  return schemaToTree(schema, schema.title || "schema", new Set(schema.required || []));
}

function schemaToTree(schema: JsonSchema, key: string, required: Set<string>): TreeNode {
  if (!schema || typeof schema !== "object") {
    return toTree(schema, key);
  }

  const type = Array.isArray(schema.type) ? schema.type.join(" | ") : schema.type || inferType(schema);
  const flags = [type, required.has(key) ? "required" : "", schema.enum ? `enum(${schema.enum.length})` : ""].filter(Boolean);
  const children: TreeNode[] = [];

  if (schema.properties) {
    const childRequired = new Set(schema.required || []);
    for (const [property, childSchema] of Object.entries(schema.properties)) {
      children.push(schemaToTree(childSchema, property, childRequired));
    }
  }

  if (schema.items) {
    children.push(schemaToTree(schema.items, "items", new Set(schema.items.required || [])));
  }

  for (const groupKey of ["oneOf", "anyOf", "allOf"] as const) {
    const group = schema[groupKey];
    if (group?.length) {
      children.push({
        key: groupKey,
        value: `Array(${group.length})`,
        children: group.map((item, index) => schemaToTree(item, String(index), new Set(item.required || [])))
      });
    }
  }

  return {
    key,
    value: flags.join(" · "),
    children: children.length ? children : undefined
  };
}

function inferType(schema: JsonSchema) {
  if (schema.properties) return "object";
  if (schema.items) return "array";
  if (schema.enum) return "enum";
  return "schema";
}

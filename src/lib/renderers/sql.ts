import {renderMermaid} from "./mermaid";

type SqlTable = {
  name: string;
  columns: Array<{name: string; type: string; flags: string[]}>;
  relations: Array<{column: string; targetTable: string; targetColumn: string}>;
};

export async function renderSqlErDiagram(source: string) {
  const tables = parseTables(source);
  if (!tables.length) {
    throw new Error("Add at least one CREATE TABLE statement.");
  }

  const lines = ["erDiagram"];

  for (const table of tables) {
    lines.push(`  ${safeId(table.name)} {`);
    for (const column of table.columns) {
      const flags = column.flags.length ? ` \"${column.flags.join(" ")}\"` : "";
      lines.push(`    ${safeType(column.type)} ${safeId(column.name)}${flags}`);
    }
    lines.push("  }");
  }

  for (const table of tables) {
    for (const relation of table.relations) {
      lines.push(
        `  ${safeId(relation.targetTable)} ||--o{ ${safeId(table.name)} : ${safeId(relation.column)}`
      );
    }
  }

  return renderMermaid(lines.join("\n"));
}

function parseTables(source: string): SqlTable[] {
  const tables: SqlTable[] = [];
  const createTablePattern = /create\s+table\s+(?:if\s+not\s+exists\s+)?[`"]?([\w.]+)[`"]?\s*\(([\s\S]*?)\)\s*;/gi;
  let match: RegExpExecArray | null;

  while ((match = createTablePattern.exec(source))) {
    const table: SqlTable = {name: match[1].split(".").pop() || match[1], columns: [], relations: []};
    const definitions = splitDefinitions(match[2]);

    for (const definition of definitions) {
      parseDefinition(definition, table);
    }

    tables.push(table);
  }

  return tables;
}

function parseDefinition(definition: string, table: SqlTable) {
  const trimmed = definition.trim();
  if (!trimmed) return;

  const tableForeignKey = trimmed.match(
    /foreign\s+key\s*\(\s*[`"]?(\w+)[`"]?\s*\)\s+references\s+[`"]?([\w.]+)[`"]?\s*\(\s*[`"]?(\w+)[`"]?\s*\)/i
  );
  if (tableForeignKey) {
    table.relations.push({
      column: tableForeignKey[1],
      targetTable: tableForeignKey[2].split(".").pop() || tableForeignKey[2],
      targetColumn: tableForeignKey[3]
    });
    return;
  }

  if (/^(primary|unique|constraint|key|index|foreign)\b/i.test(trimmed)) return;

  const column = trimmed.match(/^[`"]?(\w+)[`"]?\s+([a-zA-Z][\w]*(?:\s*\([^)]*\))?)/);
  if (!column) return;

  const flags: string[] = [];
  if (/\bprimary\s+key\b/i.test(trimmed)) flags.push("PK");
  if (/\bnot\s+null\b/i.test(trimmed)) flags.push("required");
  if (/\bunique\b/i.test(trimmed)) flags.push("unique");

  const inlineReference = trimmed.match(/references\s+[`"]?([\w.]+)[`"]?\s*\(\s*[`"]?(\w+)[`"]?\s*\)/i);
  if (inlineReference) {
    flags.push("FK");
    table.relations.push({
      column: column[1],
      targetTable: inlineReference[1].split(".").pop() || inlineReference[1],
      targetColumn: inlineReference[2]
    });
  }

  table.columns.push({name: column[1], type: column[2], flags});
}

function splitDefinitions(body: string) {
  const definitions: string[] = [];
  let depth = 0;
  let current = "";

  for (const char of body) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;

    if (char === "," && depth === 0) {
      definitions.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) definitions.push(current);
  return definitions;
}

function safeId(value: string) {
  return value.replace(/[^\w]/g, "_");
}

function safeType(value: string) {
  return value.replace(/\s+/g, "_").replace(/[^\w]/g, "_");
}

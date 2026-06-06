import type {TreeNode} from "./tree";

export function parseCsvTree(source: string): TreeNode {
  const rows = parseCsv(source).filter((row) => row.some((cell) => cell.trim()));
  if (!rows.length) {
    throw new Error("CSV input is empty.");
  }

  const headers = rows[0].map((header, index) => header.trim() || `column_${index + 1}`);
  const dataRows = rows.slice(1);

  return {
    key: "CSV",
    value: `${dataRows.length} rows · ${headers.length} columns`,
    children: dataRows.slice(0, 100).map((row, rowIndex) => ({
      key: `row ${rowIndex + 1}`,
      value: "Record",
      children: headers.map((header, columnIndex) => ({
        key: header,
        value: row[columnIndex] || ""
      }))
    }))
  };
}

function parseCsv(source: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (char === "\"" && quoted && next === "\"") {
      cell += "\"";
      index += 1;
      continue;
    }

    if (char === "\"") {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  rows.push(row);
  return rows;
}

import yaml from "js-yaml";
import {renderMermaid} from "./mermaid";

export async function renderGraphqlSchema(source: string) {
  const types = Array.from(source.matchAll(/\b(type|interface|input)\s+(\w+)[^{]*\{([\s\S]*?)\}/g)).map((match) => ({
    kind: match[1],
    name: match[2],
    fields: match[3]
      .split(/\r?\n/)
      .map((line) => line.trim().match(/^(\w+)\s*(?:\([^)]*\))?\s*:\s*([\w![\]]+)/))
      .filter((field): field is RegExpMatchArray => Boolean(field))
      .map((field) => ({name: field[1], type: field[2].replace(/[![\]]/g, "")}))
  }));
  if (!types.length) throw new Error("Add GraphQL type, interface, or input definitions.");
  const lines = ["classDiagram"];
  for (const type of types) {
    lines.push(`  class ${type.name} {`);
    type.fields.forEach((field) => lines.push(`    ${field.type} ${field.name}`));
    lines.push("  }");
    type.fields
      .filter((field) => types.some((typeItem) => typeItem.name === field.type))
      .forEach((field) => lines.push(`  ${type.name} --> ${field.type}`));
  }
  return renderMermaid(lines.join("\n"));
}

export async function renderProtobufSchema(source: string) {
  const messages = Array.from(source.matchAll(/\bmessage\s+(\w+)\s*\{([\s\S]*?)\}/g)).map((match) => ({
    name: match[1],
    fields: match[2]
      .split(/\r?\n/)
      .map((line) => line.trim().match(/^(?:repeated\s+)?(\w+)\s+(\w+)\s*=/))
      .filter((field): field is RegExpMatchArray => Boolean(field))
      .map((field) => ({type: field[1], name: field[2]}))
  }));
  if (!messages.length) throw new Error("Add at least one protobuf message definition.");
  const lines = ["classDiagram"];
  for (const message of messages) {
    lines.push(`  class ${message.name} {`);
    message.fields.forEach((field) => lines.push(`    ${field.type} ${field.name}`));
    lines.push("  }");
    message.fields
      .filter((field) => messages.some((item) => item.name === field.type))
      .forEach((field) => lines.push(`  ${message.name} --> ${field.type}`));
  }
  return renderMermaid(lines.join("\n"));
}

export async function renderAsyncApiEventFlow(source: string) {
  const doc = yaml.load(source) as {channels?: Record<string, unknown>; operations?: Record<string, unknown>};
  const channels = Object.entries(doc?.channels || {});
  if (!channels.length) throw new Error("AsyncAPI document must include channels.");
  const lines = ["flowchart LR"];
  channels.slice(0, 24).forEach(([channel, config], index) => {
    const channelId = `channel_${index}`;
    lines.push(`  ${channelId}["${label(channel)}"]`);
    const text = JSON.stringify(config || {});
    if (/publish|subscribe|send|receive/i.test(text)) {
      lines.push(`  Producer_${index}["Producer"] --> ${channelId} --> Consumer_${index}["Consumer"]`);
    }
  });
  return renderMermaid(lines.join("\n"));
}

export async function renderDbmlErDiagram(source: string) {
  const tables = Array.from(source.matchAll(/Table\s+([\w.]+)\s*\{([\s\S]*?)\}/g)).map((match) => ({
    name: match[1].split(".").pop() || match[1],
    fields: match[2]
      .split(/\r?\n/)
      .map((line) => line.trim().match(/^(\w+)\s+([\w()]+)/))
      .filter((field): field is RegExpMatchArray => Boolean(field))
      .map((field) => ({name: field[1], type: field[2]}))
  }));
  if (!tables.length) throw new Error("Add DBML Table blocks.");
  const lines = ["erDiagram"];
  tables.forEach((table) => {
    lines.push(`  ${id(table.name)} {`);
    table.fields.forEach((field) => lines.push(`    ${field.type.replace(/[^\w]/g, "_")} ${field.name}`));
    lines.push("  }");
  });
  Array.from(source.matchAll(/Ref:\s*([\w.]+)\.(\w+)\s*>\s*([\w.]+)\.(\w+)/g)).forEach((match) => {
    lines.push(`  ${id(match[3].split(".").pop() || match[3])} ||--o{ ${id(match[1].split(".").pop() || match[1])} : ${match[2]}`);
  });
  return renderMermaid(lines.join("\n"));
}

export async function renderPrismaSchema(source: string) {
  const models = Array.from(source.matchAll(/model\s+(\w+)\s*\{([\s\S]*?)\}/g)).map((match) => ({
    name: match[1],
    fields: match[2]
      .split(/\r?\n/)
      .map((line) => line.trim().match(/^(\w+)\s+([\w\[\]?]+)/))
      .filter((field): field is RegExpMatchArray => Boolean(field))
      .map((field) => ({name: field[1], type: field[2].replace(/[?\[\]]/g, "")}))
  }));
  if (!models.length) throw new Error("Add Prisma model blocks.");
  const lines = ["erDiagram"];
  models.forEach((model) => {
    lines.push(`  ${model.name} {`);
    model.fields.forEach((field) => lines.push(`    ${field.type.replace(/[^\w]/g, "_")} ${field.name}`));
    lines.push("  }");
  });
  models.forEach((model) => {
    model.fields
      .filter((field) => models.some((candidate) => candidate.name === field.type))
      .forEach((field) => lines.push(`  ${field.type} ||--o{ ${model.name} : ${field.name}`));
  });
  return renderMermaid(lines.join("\n"));
}

function id(value: string) {
  return value.replace(/[^\w]/g, "_");
}

function label(value: string) {
  return value.replace(/"/g, "'").slice(0, 90);
}

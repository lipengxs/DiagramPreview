export function renderRegexRailroad(source: string) {
  const tokens = tokenizeRegex(source.trim()).slice(0, 40);
  if (!tokens.length) {
    throw new Error("Regex input is empty.");
  }

  const boxWidth = 96;
  const gap = 28;
  const height = 150;
  const width = Math.max(360, 80 + tokens.length * (boxWidth + gap));
  const y = 74;
  const boxes = tokens
    .map((token, index) => {
      const x = 40 + index * (boxWidth + gap);
      const nextX = x + boxWidth + gap;
      const connector =
        index < tokens.length - 1
          ? `<path d="M ${x + boxWidth} ${y} H ${nextX}" stroke="#94a3b8" stroke-width="2" fill="none"/>`
          : "";
      return `${connector}<rect x="${x}" y="${y - 22}" width="${boxWidth}" height="44" rx="6" fill="#ffffff" stroke="#2563eb" stroke-width="1.5"/><text x="${x + boxWidth / 2}" y="${y + 5}" text-anchor="middle" font-size="13" font-family="Inter, ui-sans-serif, system-ui" fill="#0f172a">${escapeXml(token)}</text>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Regex railroad diagram">
    <rect width="${width}" height="${height}" fill="#f8fafc"/>
    <circle cx="24" cy="${y}" r="8" fill="#22c55e"/>
    <path d="M 32 ${y} H 40" stroke="#94a3b8" stroke-width="2"/>
    ${boxes}
    <path d="M ${40 + tokens.length * (boxWidth + gap) - gap} ${y} H ${width - 32}" stroke="#94a3b8" stroke-width="2"/>
    <circle cx="${width - 24}" cy="${y}" r="8" fill="#0f172a"/>
  </svg>`;
}

function tokenizeRegex(source: string) {
  const tokens: string[] = [];

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (char === "\\" && next) {
      tokens.push(`\\${next}`);
      index += 1;
      continue;
    }

    if (char === "[") {
      const end = source.indexOf("]", index + 1);
      if (end > index) {
        tokens.push(source.slice(index, end + 1));
        index = end;
        continue;
      }
    }

    if ("*+?".includes(char)) {
      tokens[tokens.length - 1] = `${tokens[tokens.length - 1] || ""}${char}`;
      continue;
    }

    if (char === "{") {
      const end = source.indexOf("}", index + 1);
      if (end > index) {
        tokens[tokens.length - 1] = `${tokens[tokens.length - 1] || ""}${source.slice(index, end + 1)}`;
        index = end;
        continue;
      }
    }

    if (char === "|") {
      tokens.push("or");
      continue;
    }

    if (!"^$()".includes(char)) {
      tokens.push(char);
    }
  }

  return tokens;
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

type ReviewRule = {id: string; patterns: RegExp[]};
export type ReviewLanguage = {rules: Array<{id: string; terms: string[][]}>; unresolvedTerms: string[]};

export const designSpecReviewRules: ReviewRule[] = [
  {
    id: "loading",
    patterns: [/\b(?:loading|saving|pending)\b|加载|保存中|请求中/i, /\b(?:label|message|spinner|skeleton|placeholder|show|disable|prevent)\b|文案|提示|占位|骨架|展示|显示|禁用|防止/i]
  },
  {
    id: "error",
    patterns: [/\b(?:error|failure|failed)\b|错误|失败|异常/i, /\b(?:retry|preserve|retain|recover)\b|重试|保留|恢复/i]
  },
  {
    id: "empty",
    patterns: [/\b(?:empty|no data|no results)\b|空状态|空数据|空名称|无数据|无结果/i, /\b(?:show|display|message|prompt|hide|disable)\b|展示|显示|提示|引导|隐藏|禁用/i]
  },
  {
    id: "tokens",
    patterns: [/(?:--[a-z][\w-]*|\$[a-z][\w.-]*|\b[a-z][\w-]*(?:\.[a-z][\w-]*){2,}\b)/i]
  },
  {
    id: "keyboard",
    patterns: [/\b(?:keyboard|tab|enter|escape)\b|键盘|回车/i, /\b(?:focus|order)\b|焦点|顺序/i]
  },
  {
    id: "responsive",
    patterns: [/\b\d+(?:\.\d+)?\s*(?:px|rem|em)\b/i, /\b(?:columns?|width|padding|scroll(?:ing)?|viewport|breakpoint)\b|列|宽度|边距|滚动|视口|断点/i]
  },
  {
    id: "acceptance",
    patterns: [/^\s*[-+*]\s+\[[ x]\]\s+/i, /\b(?:shows?|displays?|preserves?|retains?|announces?|prevents?|disables?|cannot|only one|no horizontal)\b|显示|展示|保留|宣告|防止|禁用|不能|只发起一次|不出现水平/i]
  }
];

const unresolvedPattern = /\b(?:todo|tbd|to confirm)\b|待确认|待补充/i;

// ponytail: line-based hints, not semantic validation. A Markdown AST with source
// positions is the next step if support for complex nested Markdown is needed.
export function reviewDesignSpec(source: string, language?: ReviewLanguage) {
  const isUnresolved = (text: string) => unresolvedPattern.test(text) || Boolean(language?.unresolvedTerms.some((term) => text.toLowerCase().includes(term.toLowerCase())));
  const original = source.split(/\r?\n/);
  const uncommented = source.replace(/<!--[\s\S]*?(?:-->|$)/g, (comment) => comment.replace(/[^\r\n]/g, " ")).split(/\r?\n/);
  let fence: {character: string; length: number} | undefined;
  const lines = uncommented.flatMap((raw, index) => {
    const text = raw.replace(/^(?: {0,3}>\s?)+/, "");
    const marker = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(text);
    if (fence) {
      if (marker && marker[1][0] === fence.character && marker[1].length >= fence.length && !marker[2].trim()) fence = undefined;
      return [];
    }
    if (marker) {
      fence = {character: marker[1][0], length: marker[1].length};
      return [];
    }
    if (!text.trim() || /^(?: {4}|\t| {0,3}#{1,6}(?:\s|$))/.test(text) || /^\s*(?:=+|-+)\s*$/.test(uncommented[index + 1] ?? "")) return [];
    return [{line: index + 1, text, original: original[index]}];
  });
  return {
    results: designSpecReviewRules.map((rule) => ({
      id: rule.id,
      evidence: lines.find(({text}) => !isUnresolved(text) && (rule.patterns.every((pattern) => pattern.test(text)) || localizedMatch(rule, text, language)))
    })),
    unresolved: lines.filter(({text}) => isUnresolved(text))
  };
}

function localizedMatch(rule: ReviewRule, text: string, language?: ReviewLanguage) {
  const terms = language?.rules.find(({id}) => id === rule.id)?.terms;
  if (!terms?.length) return false;
  // Keep structural requirements for lengths and Markdown checkboxes.
  if ((rule.id === "responsive" || rule.id === "acceptance") && !rule.patterns[0].test(text)) return false;
  const normalized = text.toLowerCase();
  return terms.every((group) => group.some((term) => normalized.includes(term.toLowerCase())));
}

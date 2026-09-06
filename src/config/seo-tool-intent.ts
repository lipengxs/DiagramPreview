import type {ToolSlug} from "./tools";
import type {WorkflowSlug} from "./workflows";

type LocalizedIntent = {
  intent: string;
  bestFor: string[];
  notFor: string[];
  failureModes: string[];
  workflow: string;
  workflowBody: string;
};

type SeoToolIntent = {
  workflowSlug: WorkflowSlug;
  en: LocalizedIntent;
  zh: LocalizedIntent;
  es?: LocalizedIntent;
  de?: LocalizedIntent;
  fr?: LocalizedIntent;
};

const toolIntent: Partial<Record<ToolSlug, SeoToolIntent>> = {
  "text-to-mermaid": {
    workflowSlug: "ai-generated-mermaid-workflow",
    en: {
      intent: "Turn rough notes, prompts, and incident text into Mermaid source that can be reviewed before publishing.",
      bestFor: ["AI-generated Mermaid drafts", "Incident timelines", "Architecture notes that need a first diagram"],
      notFor: ["Final architecture approval without human review", "Very large system maps in one prompt", "Private source or secrets in prompts"],
      failureModes: ["Vague prompts invent missing services", "Long labels make the diagram unreadable", "The wrong diagram type hides request order or data relationships"],
      workflow: "AI Mermaid review workflow",
      workflowBody: "Generate a small Mermaid draft, preview syntax, remove invented nodes, then export only after the source is readable."
    },
    zh: {
      intent: "把需求笔记、prompt 和故障描述转成可 review 的 Mermaid 源码，再进入发布流程。",
      bestFor: ["AI 生成 Mermaid 初稿", "故障时间线", "需要先画出结构的架构笔记"],
      notFor: ["未经人工确认的最终架构结论", "一次生成超大系统全景图", "包含私密源码或密钥的 prompt"],
      failureModes: ["prompt 太泛会让模型虚构服务", "label 过长导致图不可读", "图表类型选错会隐藏调用顺序或数据关系"],
      workflow: "AI Mermaid review 工作流",
      workflowBody: "先生成小 Mermaid 草稿，预览语法，删除虚构节点，再在源码可维护时导出。"
    }
  },
  "mermaid-preview": {
    workflowSlug: "ai-generated-mermaid-workflow",
    en: {
      intent: "Preview and validate Mermaid before it becomes README content, PR notes, or exported assets.",
      bestFor: ["README Mermaid blocks", "AI Mermaid output review", "Flowchart and sequence syntax checks"],
      notFor: ["Editing draw.io layout visually", "Replacing source-code review", "Publishing generated diagrams without checking labels"],
      failureModes: ["Missing diagram headers", "Markdown fences pasted with extra prose", "Oversized nodes and branches that should be split"],
      workflow: "Preview before fix and export",
      workflowBody: "Use Mermaid Preview as the review surface before fixing syntax, converting to draw.io, or exporting SVG/PNG."
    },
    zh: {
      intent: "在 Mermaid 进入 README、PR 说明或导出资产前，先预览并验证。",
      bestFor: ["README Mermaid 代码块", "AI Mermaid 输出 review", "流程图和时序图语法检查"],
      notFor: ["可视化编辑 draw.io 布局", "替代源码评审", "不检查 label 就发布生成图"],
      failureModes: ["缺少 diagram header", "复制了 Markdown 围栏和额外说明", "节点和分支过大，应拆成小图"],
      workflow: "Preview 后再修复和导出",
      workflowBody: "先把 Mermaid Preview 作为 review 界面，再修语法、转 draw.io 或导出 SVG/PNG。"
    }
  },
  "mermaid-to-drawio": {
    workflowSlug: "mermaid-to-drawio-documentation-workflow",
    en: {
      intent: "Move Mermaid diagrams from docs-as-code into editable draw.io / diagrams.net handoff files.",
      bestFor: ["README Mermaid migration", "AI Mermaid to editable diagrams", "Stakeholder handoff when visual editing matters"],
      notFor: ["Round-tripping draw.io back to Mermaid", "Advanced Mermaid syntax that needs exact visual parity", "Replacing the original Mermaid source"],
      failureModes: ["Unsupported Mermaid features may need manual cleanup", "Long labels become hard to edit visually", "Mixed diagram types should be converted separately"],
      workflow: "Mermaid to draw.io documentation workflow",
      workflowBody: "Preview Mermaid first, convert only stable diagrams, then inspect the draw.io XML before sharing."
    },
    zh: {
      intent: "把 docs-as-code 里的 Mermaid 转成可编辑的 draw.io / diagrams.net 交付文件。",
      bestFor: ["README Mermaid 迁移", "AI Mermaid 转可编辑图", "需要非开发同事可视化编辑的交接"],
      notFor: ["draw.io 可靠反转回 Mermaid", "要求高级 Mermaid 语法完全等价", "替代原始 Mermaid 源码"],
      failureModes: ["不支持的 Mermaid 特性需要手工整理", "长 label 会降低可视化编辑体验", "混合图表类型应拆开转换"],
      workflow: "Mermaid to draw.io 文档工作流",
      workflowBody: "先预览 Mermaid，只转换稳定图，再检查 draw.io XML 后分享。"
    }
  },
  "plantuml-to-drawio": {
    workflowSlug: "mermaid-to-drawio-documentation-workflow",
    en: {
      intent: "Convert PlantUML source into editable diagrams.net files for documentation handoff.",
      bestFor: ["Sequence diagrams that need visual editing", "PlantUML docs moving to draw.io", "Team handoff from text source to editable XML"],
      notFor: ["Remote include-heavy PlantUML files", "Large multi-page architecture packs in one source", "Exact round-trip conversion back to PlantUML"],
      failureModes: ["Includes and macros may not resolve locally", "Complex layout directives can differ after conversion", "Participant names should be checked after export"],
      workflow: "Editable diagram documentation workflow",
      workflowBody: "Keep PlantUML as source of record, convert focused diagrams, and review the generated draw.io file before publishing."
    },
    zh: {
      intent: "把 PlantUML 源码转成可编辑的 diagrams.net 文件，用于文档交接。",
      bestFor: ["需要可视化编辑的时序图", "PlantUML 文档迁移到 draw.io", "从文本源码交接到可编辑 XML"],
      notFor: ["大量远程 include 的 PlantUML 文件", "一个源码里塞进多页架构包", "可靠反向转换回 PlantUML"],
      failureModes: ["include 和宏可能无法本地解析", "复杂 layout 指令转换后可能有差异", "导出后要检查参与者名称"],
      workflow: "可编辑图表文档工作流",
      workflowBody: "保留 PlantUML 作为源码，只转换聚焦图，并在发布前 review 生成的 draw.io 文件。"
    }
  },
  "drawio-preview": {
    workflowSlug: "open-drawio-file-online",
    en: {
      intent: "Open draw.io XML online to inspect pages, objects, hidden content, and export readiness.",
      bestFor: ["Opening diagrams.net XML safely", "Checking pages and object counts", "Reviewing handoff files before sharing"],
      notFor: ["Full diagrams.net editing", "Trusting hidden pages without inspection", "Publishing unknown XML without checking embedded resources"],
      failureModes: ["Incomplete mxfile XML will not preview", "External images may not be portable", "Hidden draft pages can leak unfinished content"],
      workflow: "Draw.io inspect and export workflow",
      workflowBody: "Inspect draw.io structure first, then export SVG or route the file into conversion workflows only when it is clean."
    },
    zh: {
      intent: "在线打开 draw.io XML，检查页面、对象、隐藏内容和导出风险。",
      bestFor: ["安全打开 diagrams.net XML", "检查页面数和对象数", "分享前 review 交付文件"],
      notFor: ["完整替代 diagrams.net 编辑器", "不检查隐藏页面就信任文件", "未检查外链资源就发布未知 XML"],
      failureModes: ["不完整 mxfile XML 无法预览", "外链图片可能不可移植", "隐藏草稿页可能泄露未完成内容"],
      workflow: "Draw.io 检查与导出工作流",
      workflowBody: "先检查 draw.io 结构，确认干净后再导出 SVG 或进入转换流程。"
    },
    de: {
      intent: "Draw.io-XML online öffnen und vor der Übergabe Seiten, Objekte, ausgeblendete Inhalte und externe Ressourcen prüfen.",
      bestFor: ["Diagrams.net-Dateien ohne Installation prüfen", "Seiten- und Objektstruktur kontrollieren", "Übergabedateien vor dem Teilen untersuchen"],
      notFor: ["Vollständige Bearbeitung wie in diagrams.net", "Ungeprüfte versteckte Seiten übernehmen", "XML mit unbekannten externen Ressourcen veröffentlichen"],
      failureModes: ["Unvollständiges mxfile-XML kann nicht gerendert werden", "Externe Bilder sind beim Weitergeben eventuell nicht verfügbar", "Ausgeblendete Entwurfsseiten können unfertige Inhalte enthalten"],
      workflow: "Draw.io prüfen und exportieren",
      workflowBody: "Zuerst Seiten, Objekte und Ressourcen kontrollieren. Erst danach die Datei als SVG exportieren oder in einen Konvertierungsablauf übernehmen."
    }
  },
  "openapi-to-sequence": {
    workflowSlug: "api-debugging-sequence-diagram",
    en: {
      intent: "Turn focused OpenAPI paths into sequence diagrams for API review and debugging.",
      bestFor: ["One API journey per diagram", "4xx and 5xx response review", "Backend handoff from contract to sequence"],
      notFor: ["Rendering an entire large OpenAPI spec at once", "Replacing contract validation", "Ignoring auth, retry, timeout, and error responses"],
      failureModes: ["Huge specs create unreadable diagrams", "Missing operationId or tags reduce actor clarity", "No 4xx/5xx responses weakens debugging value"],
      workflow: "OpenAPI debugging sequence workflow",
      workflowBody: "Start from a narrow path group, include success and failure responses, then connect the output to API error flow review."
    },
    zh: {
      intent: "把聚焦的 OpenAPI path 转成时序图，用于 API 评审和排障。",
      bestFor: ["一个 API journey 一张图", "4xx/5xx 响应 review", "从接口契约交接到调用时序"],
      notFor: ["一次渲染超大 OpenAPI 全量文档", "替代契约校验", "忽略认证、重试、超时和错误响应"],
      failureModes: ["超大 spec 会生成不可读图", "缺少 operationId 或 tags 会降低参与者清晰度", "没有 4xx/5xx 会削弱排障价值"],
      workflow: "OpenAPI 排障时序图工作流",
      workflowBody: "从窄 path group 开始，包含成功和失败响应，再连接到 API error flow review。"
    },
    fr: {
      intent: "Transformer un parcours OpenAPI ciblé en diagramme de séquence pour examiner les appels, l'authentification et les erreurs d'une API.",
      bestFor: ["Un parcours API par diagramme", "Analyse des réponses 4xx et 5xx", "Revue des délais, nouvelles tentatives et dépendances"],
      notFor: ["Afficher une spécification OpenAPI entière sur un seul diagramme", "Remplacer la validation du contrat", "Masquer les erreurs et les règles d'authentification"],
      failureModes: ["Une spécification trop large produit un diagramme illisible", "Des operationId ou tags absents rendent les acteurs ambigus", "Sans réponses 4xx et 5xx, le diagramme aide peu au diagnostic"],
      workflow: "Diagnostic OpenAPI par diagramme de séquence",
      workflowBody: "Commencez par un petit groupe de chemins, conservez les réponses de succès et d'échec, puis reliez le résultat au flux d'erreur API."
    }
  },
  "api-error-flow-diagram": {
    workflowSlug: "api-debugging-sequence-diagram",
    en: {
      intent: "Document API failure paths so retries, validation errors, auth failures, and timeouts are visible.",
      bestFor: ["Incident notes", "Error response documentation", "Backend review of retry and timeout behavior"],
      notFor: ["Happy-path-only API docs", "Replacing logs or traces", "Hiding error ownership in generic boxes"],
      failureModes: ["No status codes makes the flow vague", "Missing owner systems hides escalation paths", "Retry loops need explicit stop conditions"],
      workflow: "API debugging and error flow workflow",
      workflowBody: "Pair sequence diagrams with error flow diagrams so reviewers see both request order and failure handling."
    },
    zh: {
      intent: "把 API 失败路径画出来，让重试、校验错误、认证失败和超时可见。",
      bestFor: ["故障复盘记录", "错误响应文档", "后端 review 重试和超时行为"],
      notFor: ["只有 happy path 的接口说明", "替代日志或 trace", "用泛化盒子隐藏错误归属"],
      failureModes: ["没有状态码会让流程含糊", "缺少 owner 系统会隐藏升级路径", "重试循环需要明确停止条件"],
      workflow: "API 排障与错误流程工作流",
      workflowBody: "把时序图和错误流程图配套使用，让评审者同时看到调用顺序和失败处理。"
    }
  },
  "json-schema-visualizer": {
    workflowSlug: "schema-visualization-workflow",
    en: {
      intent: "Visualize JSON Schema contracts before they become API docs, forms, or SDK handoff notes.",
      bestFor: ["Required field review", "Nested object and array inspection", "Enum/default/reference documentation"],
      notFor: ["Validating business rules not present in the schema", "Large unrelated schemas in one page", "Replacing contract tests"],
      failureModes: ["Missing required fields weakens docs", "Deep nesting may need focused sub-schemas", "References and additionalProperties should be reviewed explicitly"],
      workflow: "JSON Schema to form and docs workflow",
      workflowBody: "Preview the schema shape, open the form preview, then link the contract into API or SDK documentation."
    },
    zh: {
      intent: "在 JSON Schema 进入 API 文档、表单或 SDK 交接前，先可视化契约结构。",
      bestFor: ["required 字段 review", "嵌套 object 和 array 检查", "enum/default/reference 文档化"],
      notFor: ["校验 schema 外的业务规则", "一个页面塞入大量无关 schema", "替代契约测试"],
      failureModes: ["缺少 required 会削弱文档约束", "深层嵌套应拆子 schema 检查", "references 和 additionalProperties 需要明确 review"],
      workflow: "JSON Schema 到表单和文档工作流",
      workflowBody: "先预览 schema 结构，再打开表单预览，并把契约链接到 API 或 SDK 文档。"
    }
  },
  "json-schema-form-preview": {
    workflowSlug: "schema-visualization-workflow",
    en: {
      intent: "Preview the form experience generated from JSON Schema before handing it to docs or product teams.",
      bestFor: ["Required field UX checks", "Enum and default value review", "Nested object and array form previews"],
      notFor: ["Production form hosting", "Replacing design review", "Schemas with unresolved remote refs"],
      failureModes: ["Invalid JSON stops preview", "Missing titles/descriptions creates unclear fields", "Deep arrays may need smaller examples"],
      workflow: "Schema to form preview workflow",
      workflowBody: "Use the visualizer first for contract shape, then use form preview to inspect how fields behave for readers and product teams."
    },
    zh: {
      intent: "在 JSON Schema 交给文档或产品团队前，预览自动生成表单的体验。",
      bestFor: ["required 字段 UX 检查", "enum 和 default 值 review", "嵌套 object 和 array 表单预览"],
      notFor: ["生产表单托管", "替代设计评审", "包含未解析远程 refs 的 schema"],
      failureModes: ["非法 JSON 会停止预览", "缺少 title/description 会导致字段不清楚", "深层 array 应使用更小示例"],
      workflow: "Schema 到表单预览工作流",
      workflowBody: "先用 visualizer 看契约结构，再用 form preview 检查字段对读者和产品团队是否清晰。"
    }
  },
  "protobuf-schema-visualizer": {
    workflowSlug: "schema-visualization-workflow",
    en: {
      intent: "Inspect Protobuf messages, services, and field relationships before publishing API or SDK docs.",
      bestFor: ["Message and service review", "Field number and enum inspection", "API contract handoff for SDK teams"],
      notFor: ["Compiling .proto files", "Replacing compatibility checks", "Large repo-wide protobuf scans in one paste"],
      failureModes: ["Missing imports may hide context", "Field renames need compatibility review", "Services and messages should be documented together"],
      workflow: "Protobuf schema documentation workflow",
      workflowBody: "Visualize messages and services, compare breaking-change risk, then link the output into schema documentation."
    },
    zh: {
      intent: "在 API 或 SDK 文档发布前，检查 Protobuf messages、services 和字段关系。",
      bestFor: ["message 和 service review", "字段编号和 enum 检查", "面向 SDK 团队的 API 契约交接"],
      notFor: [".proto 编译", "替代兼容性检查", "一次粘贴全仓库 protobuf 扫描"],
      failureModes: ["缺少 imports 可能隐藏上下文", "字段重命名需要兼容性 review", "service 和 message 应配套文档化"],
      workflow: "Protobuf schema 文档工作流",
      workflowBody: "先可视化 message 和 service，比较破坏性变更风险，再链接到 schema 文档。"
    },
    es: {
      intent: "Revisar visualmente mensajes, servicios, enums y números de campo Protobuf antes de publicar documentación gRPC o entregar un contrato a un SDK.",
      bestFor: ["Revisión conjunta de messages y services", "Cambios de campos, enums y repeated", "Documentación de contratos gRPC para equipos SDK"],
      notFor: ["Compilar archivos .proto", "Sustituir pruebas de compatibilidad", "Pegar todo un repositorio Protobuf en una sola vista"],
      failureModes: ["Imports ausentes pueden ocultar tipos relacionados", "Renombrar o reutilizar números de campo puede romper compatibilidad", "Separar services de sus messages reduce el contexto de la revisión"],
      workflow: "Documentación visual de contratos Protobuf",
      workflowBody: "Visualiza messages y services juntos, revisa el riesgo de cambios incompatibles y enlaza el resultado desde la documentación de la API o del SDK."
    }
  }
};

export function getSeoToolIntent(slug: string, locale: string) {
  const intent = toolIntent[slug as ToolSlug];
  if (!intent) return undefined;
  const localizedKey = locale.startsWith("zh") ? "zh" : locale;
  const copy = localizedKey === "es" || localizedKey === "de" || localizedKey === "fr" ? intent[localizedKey] ?? intent.en : localizedKey === "zh" ? intent.zh : intent.en;
  return {...copy, workflowSlug: intent.workflowSlug};
}

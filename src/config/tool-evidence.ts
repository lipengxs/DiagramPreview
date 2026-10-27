import type {ToolSlug} from "./tools";

export type EvidenceLocale = "en" | "zh-CN" | "es";
type LocalText = {en: string; "zh-CN": string; es?: string};
export type EvidenceCase = {id: "minimal" | "business" | "failure"; source: string; description: LocalText};
type EvidenceFamily = {tool: ToolSlug; extension: string; limits: LocalText; cases: EvidenceCase[]; xmlResult?: boolean};

const drawio = (cells: string) => `<mxfile><diagram id="sample" name="Service review"><mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/>${cells}</root></mxGraphModel></diagram></mxfile>`;
const node = (id: string, label: string, x: number) => `<mxCell id="${id}" value="${label}" vertex="1" parent="1" style="rounded=1;whiteSpace=wrap;html=0;"><mxGeometry x="${x}" y="40" width="120" height="56" as="geometry"/></mxCell>`;
const edge = (id: string, source: string, target: string, label: string) => `<mxCell id="${id}" value="${label}" edge="1" parent="1" source="${source}" target="${target}" style="endArrow=block;html=0;"><mxGeometry relative="1" as="geometry"/></mxCell>`;

export const evidenceFamilies = {
  mermaid: {
    tool: "mermaid-to-drawio", extension: "mmd", xmlResult: true,
    limits: {
      en: "Flowcharts and sequence diagrams only, up to 36 nodes and 40 relationships. Subgraphs flatten; sequence diagrams become relationship graphs. Layout is regenerated and custom styles are simplified. Check the downloaded XML before handoff.",
      "zh-CN": "仅支持流程图和时序图，最多 36 节点、40 条关系。子图展开，时序图转为关系图，不保留消息顺序和生命线。布局重新生成，自定义样式会简化；交付前请检查下载的 XML。"
    },
    cases: [
      {id: "minimal", source: "flowchart LR\n A[Start] -->|Yes| B[Done]", description: {en: "Two nodes and one Yes-labelled edge. Inspect both the label and the endpoints in the editable file.", "zh-CN": "两个节点、一条标有 Yes 的连线；在可编辑文件中核对标签和端点。"}},
      {id: "business", source: "flowchart LR\n Client -->|HTTPS| Gateway\n Gateway -->|REST| Orders\n Orders -->|SQL| Database\n Orders -->|order.created| Queue\n Queue -->|consume| Worker", description: {en: "An order-service handoff: six nodes and five relationships, with synchronous calls and an asynchronous worker.", "zh-CN": "订单服务交接：六个节点、五条关系，包含同步调用和异步消费。"}},
      {id: "failure", source: "classDiagram\n class Customer", description: {en: "Valid Mermaid class syntax is outside this converter's scope. Expect an unsupported-type error and disabled downloads, not an empty or partial XML file.", "zh-CN": "合法的 Mermaid 类图超出此转换器范围，应提示类型不支持并禁用下载，不生成空文件或部分 XML。"}}
    ]
  },
  plantuml: {
    tool: "plantuml-preview", extension: "puml",
    limits: {
      en: "Source is sent through this site's API to the public PlantUML service. Use public examples. Requests are limited to 64 KiB including JSON, SVG to 2 MiB, and upstream rendering to 10 seconds. The original .puml remains downloadable when rendering fails.",
      "zh-CN": "源码经本站接口发送到公共 PlantUML 服务，请使用可公开示例。请求含 JSON 最多 64 KiB，SVG 最多 2 MiB，上游渲染超时 10 秒；渲染失败时仍可下载原始 .puml。"
    },
    cases: [
      {id: "minimal", source: "@startuml\nAlice -> Bob: ping\n@enduml", description: {en: "Two participants and one message. SVG and PNG preserve the rendered sequence; .puml preserves exact source.", "zh-CN": "两个参与者、一条消息。SVG/PNG 保留渲染后的时序图，.puml 保留原始源码。"}},
      {id: "business", source: "@startuml\nactor Customer\nparticipant Web\nparticipant API\ndatabase DB\nCustomer -> Web: Sign in\nWeb -> API: POST /session\nAPI -> DB: Find account\nDB --> API: Account\nAPI --> Web: Session token\nWeb --> Customer: Signed in\n@enduml", description: {en: "A sign-in sequence with four participants and six messages. Review request and reply directions before adding it to a runbook.", "zh-CN": "登录业务时序：四个参与者、六条消息。发布到操作手册前核对请求与回复方向。"}},
      {id: "failure", source: "@startuml\nAlice -> Bob: ping\nthis is invalid syntax ???\n@enduml", description: {en: "The extra line is invalid PlantUML syntax and should produce a rendering error. Retry or repair the source; SVG/PNG must stay unavailable until a successful render.", "zh-CN": "额外的一行不是合法 PlantUML 语法，应触发渲染错误。可修复源码或重试；成功渲染之前 SVG/PNG 保持禁用。"}}
    ]
  },
  drawio: {
    tool: "drawio-preview", extension: "drawio",
    limits: {
      en: "Files stay in this browser. The basic viewer supports compressed pages and flat rectangles, ellipses, diamonds, text and simple connectors. Groups, swimlanes, images and custom shapes are blocked per page. Maximum 2 MiB/file, 20 pages and 500 cells/page. Exported XML contains only the selected page; keep the original multi-page file.",
      "zh-CN": "文件仅在当前浏览器读取。基础查看器支持压缩页、平面矩形/椭圆/菱形、文本和简单连线；分组、泳道、图片与自定义形状按页阻止图片导出。最多 2 MiB/文件、20 页、每页 500 个 cell。XML 下载只含当前页，请保留原多页文件。",
      es: "Los archivos se leen en este navegador. El visor básico admite páginas comprimidas, rectángulos, elipses, rombos, texto y conectores simples. Bloquea grupos, carriles, imágenes y formas personalizadas por página. Límites: 2 MiB por archivo, 20 páginas y 500 celdas por página. El XML exportado solo contiene la página seleccionada; conserva el archivo original."
    },
    cases: [
      {id: "minimal", source: drawio(node("a", "Hello", 40)), description: {en: "One rounded rectangle. Open the file locally and compare its label with the SVG/PNG exports.", "zh-CN": "一个圆角矩形。本地打开文件后，将标签与 SVG/PNG 导出结果对照。", es: "Un rectángulo redondeado. Abre el archivo localmente y compara la etiqueta con las exportaciones SVG/PNG."}},
      {id: "business", source: drawio(node("web", "Web", 40) + node("api", "API", 240) + node("db", "Database", 440) + edge("https", "web", "api", "HTTPS") + edge("sql", "api", "db", "SQL")), description: {en: "A three-service map with HTTPS and SQL connectors. Check all three labels and both arrow endpoints.", "zh-CN": "三个服务的关系图，连线标有 HTTPS 和 SQL；核对三个标签及两条箭头的端点。", es: "Un mapa de tres servicios con conectores HTTPS y SQL. Comprueba las tres etiquetas y los extremos de ambas flechas."}},
      {id: "failure", source: drawio('<mxCell id="image" value="Unsupported image" vertex="1" parent="1" style="shape=image;"><mxGeometry x="0" y="0" width="120" height="60" as="geometry"/></mxCell>'), description: {en: "An image shape is outside the basic viewer. Expect a page-level warning and disabled SVG/PNG; the original page XML can still be saved.", "zh-CN": "图片形状超出基础查看器范围，应按页显示不支持说明、禁用 SVG/PNG；仍可保存原页 XML。", es: "La forma de imagen queda fuera del visor básico. Se muestra un error de página y se desactivan SVG/PNG; aún puedes guardar el XML de esa página."}}
    ]
  },
  d2: {
    tool: "d2-preview", extension: "d2",
    limits: {
      en: "This is a local subset parser, not the official D2 layout engine. It supports flat node identifiers, labels and -> chains, up to 100 nodes and 200 relationships. Labels above 22 characters are shortened in the image. Containers, attributes, styles and sequence diagrams require the official D2 renderer.",
      "zh-CN": "本页使用本地基础解析器，并非官方 D2 布局引擎。仅支持平面节点标识、标签和 -> 连续关系，最多 100 个节点、200 条关系；图中超过 22 字符的标签会显示省略。容器、属性、样式和时序图请使用官方 D2 渲染器。"
    },
    cases: [
      {id: "minimal", source: "web -> api: HTTPS", description: {en: "Two flat nodes and one labelled connection.", "zh-CN": "两个平面节点、一条带 HTTPS 标签的有向关系。"}},
      {id: "business", source: "web: Web app\napi: Order API\ndb: Database\nqueue: Event queue\nworker: Worker\nweb -> api: HTTPS\napi -> db: SQL\napi -> queue: publish\nqueue -> worker: consume", description: {en: "Five services and four dependencies. Labels and protocols are retained; layout follows this site's simple dependency view.", "zh-CN": "五个服务、四条依赖；保留标签和协议，布局由本站简易依赖视图生成。"}},
      {id: "failure", source: "prod: {\n web\n api\n}\nprod.web -> prod.api", description: {en: "Nested containers are intentionally rejected. Use the official D2 renderer instead of treating container syntax as ordinary nodes.", "zh-CN": "嵌套容器会被明确拒绝。请改用官方 D2 渲染器，避免将容器语法误当作普通节点。"}}
    ]
  },
  "plantuml-conversion": {
    tool: "plantuml-to-drawio", extension: "puml", xmlResult: true,
    limits: {
      en: "This lightweight converter extracts common declarations and relationships and lays them out again. It does not use the PlantUML rendering engine for conversion. Sequence timing, class members, themes and original positions are not preserved. Up to 36 nodes and 40 relationships are included, with warnings on larger inputs; split them before handoff.",
      "zh-CN": "此轻量转换器提取常见声明与关系后重新布局，转换过程不使用 PlantUML 渲染引擎。不保留时序、类成员、主题和原位置。最多包含 36 个节点、40 条关系，较大输入会提示裁剪；交付前应先拆图。"
    },
    cases: [
      {id: "minimal", source: "@startuml\nAlice -> Bob: ping\n@enduml", description: {en: "Two editable nodes and one ping relationship. It becomes a relationship graph, not a PlantUML lifeline diagram.", "zh-CN": "两个可编辑节点、一条 ping 关系；输出为关系图，不是 PlantUML 生命线时序图。"}},
      {id: "business", source: "@startuml\ncomponent Web\ncomponent API\ndatabase Database\nWeb -> API: HTTPS\nAPI -> Database: SQL\n@enduml", description: {en: "A deliberately small handoff with three components and two protocol-labelled relationships. The result is inspected in the local viewer and decoded with the diagrams.net engine during verification.", "zh-CN": "三个组件、两条带协议标签的关系，便于逐项核对。验收时在本地查看器回读，并使用 diagrams.net 引擎解码检查。"}},
      {id: "failure", source: "@startuml\n!theme plain\n@enduml", description: {en: "A theme-only document has no supported actors, components or arrows. Expect an error and no downloadable conversion.", "zh-CN": "仅有主题的文档没有可转换的参与者、组件或箭头，应报错并停止转换下载。"}}
    ]
  }
} satisfies Record<string, EvidenceFamily>;

export type EvidenceFamilyId = keyof typeof evidenceFamilies;
export const evidencePages = [
  {locale: "en", slug: "mermaid-to-drawio", family: "mermaid"},
  {locale: "zh-CN", slug: "mermaid-to-drawio", family: "mermaid"},
  {locale: "en", slug: "plantuml-preview", family: "plantuml"},
  {locale: "zh-CN", slug: "plantuml-preview", family: "plantuml"},
  {locale: "en", slug: "drawio-preview", family: "drawio"},
  {locale: "zh-CN", slug: "drawio-preview", family: "drawio"},
  {locale: "es", slug: "drawio-preview", family: "drawio"},
  {locale: "zh-CN", slug: "d2-preview", family: "d2"}
] as const;

export function evidenceForPage(slug: string, locale: string) {
  return evidencePages.find((entry) => entry.slug === slug && entry.locale === locale)?.family;
}

export function evidenceText(text: LocalText, locale: string) {
  return locale === "zh-CN" ? text["zh-CN"] : locale === "es" ? text.es ?? text.en : text.en;
}

export function evidenceAsset(family: EvidenceFamilyId, example: EvidenceCase, extension: string) {
  return `/examples/${family}/${example.id}.${extension}`;
}

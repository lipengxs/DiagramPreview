# DiagramPreview Google Search Console 数据 Review 报告

报告日期：2026-06-21  
站点：diagrampreview.com  
数据来源：

- `/Users/ugreen/Downloads/diagrampreview.com-Performance-on-Search-2026-06-21`
- `/Users/ugreen/Downloads/diagrampreview.com-Coverage-2026-06-21`
- 线上核对：`https://diagrampreview.com/robots.txt`、`https://diagrampreview.com/sitemap.xml`

## 1. 结论摘要

DiagramPreview 当前仍处在新站早期收录阶段。搜索表现已经开始出现有效信号，但样本量很小：按天汇总口径下，2026-06-03 至 2026-06-19 共有 51 次曝光、3 次点击，整体 CTR 为 5.88%，加权平均排名约 26.20。

索引侧是当前主要瓶颈。覆盖数据截至 2026-06-12 显示，Google 已知页面约 366 个，其中已编入索引 65 个，未编入索引 301 个，索引率约 17.8%。未收录原因高度集中在 `Discovered - currently not indexed`，共 283 页，占未收录页面约 94.0%。这通常表示 Google 已知道 URL，但还没有充分抓取，常见原因是新站抓取预算不足、站点一次性提交 URL 较多、页面相似度偏高或内部链接权重不足。

线上技术可访问性总体正常：`robots.txt` 允许全站抓取，仅屏蔽 `/api/`；`sitemap.xml` 可访问，包含 1,145 个 URL；抽查页面返回 200 且为 Vercel 预渲染页面。因此当前优化重点不是“解除阻塞”，而是提升 Google 对重点 URL 的抓取优先级、页面差异化质量和搜索结果点击吸引力。

## 2. 搜索表现 Review

### 2.1 总体数据

| 指标 | 数值 |
|---|---:|
| 数据范围 | 2026-06-03 至 2026-06-19 |
| 搜索类型 | Web |
| 点击 | 3 |
| 曝光 | 51 |
| CTR | 5.88% |
| 加权平均排名 | 26.20 |
| 有曝光天数 | 11 天 |
| 最高单日曝光 | 2026-06-10，13 次曝光、2 次点击 |

解读：

- 当前曝光基数很低，任何一天的波动都会显著影响 CTR 和排名，不宜过度解读短期涨跌。
- 2026-06-09 和 2026-06-10 产生了全部 3 次点击，说明已有页面可以被真实搜索用户点击。
- 2026-06-13 后曝光明显回落，可能与索引进度、排名测试、抓取节奏或关键词样本过小有关，需要连续观察 2-4 周。

### 2.2 页面表现

| 页面 | 点击 | 曝光 | CTR | 排名 |
|---|---:|---:|---:|---:|
| `/es/protobuf-schema-visualizer` | 2 | 5 | 40.00% | 17.20 |
| `/ru/d2-preview` | 1 | 5 | 20.00% | 6.80 |
| `/en` | 0 | 12 | 0.00% | 11.00 |
| `/zh-CN/drawio-preview` | 0 | 7 | 0.00% | 43.43 |
| `/en/text-to-mermaid` | 0 | 5 | 0.00% | 8.60 |
| `/` | 0 | 3 | 0.00% | 9.00 |
| `/en/converters` | 0 | 3 | 0.00% | 29.67 |

解读：

- 早期点击来自西语 `protobuf schema visualizer` 和俄语 `d2 preview`，说明非英文工具页有机会拿到长尾流量。
- `/en/text-to-mermaid`、`/`、`/en` 已经接近或进入第一页，但没有点击，优先检查标题和描述是否足够具体、有使用场景、有“free / online / no signup / preview / generator”等转化型信息。
- `/zh-CN/drawio-preview` 曝光较多但排名偏低，建议补强中文搜索意图，例如“drawio 在线预览”“draw.io 文件打开”“drawio 转 svg/png”等中文长尾。

注意：页面维度导出的曝光合计为 64，高于按天总曝光 51，这是 GSC 不同维度归因和导出方式中常见的差异。整体指标以按天、国家、设备维度的 51 次曝光为准，页面表用于相对排序。

### 2.3 查询表现

| 查询 | 点击 | 曝光 | CTR | 排名 |
|---|---:|---:|---:|---:|
| `protobuf visualizer` | 1 | 1 | 100.00% | 19.00 |
| `draw io öffnen` | 0 | 5 | 0.00% | 58.00 |
| `plantuml` | 0 | 2 | 0.00% | 97.50 |
| `chatgpt` | 0 | 1 | 0.00% | 8.00 |
| `d2 диаграммы` | 0 | 1 | 0.00% | 9.00 |
| `mermaid ia` | 0 | 1 | 0.00% | 18.00 |
| `protobuf schema visualization` | 0 | 1 | 0.00% | 50.00 |

解读：

- 查询数据样本过小，且 Top queries 只覆盖 18 次曝光、1 次点击，不能完整解释全部点击来源。
- 已出现典型长尾：`protobuf visualizer`、`d2 диаграммы`、`mermaid ia`、`draw io öffnen`。这类词比 `plantuml`、`chatgpt` 这类泛词更适合当前阶段。
- 德语 `draw io öffnen` 有 5 次曝光但排名 58，说明页面主题可能相关，但德语页面内容、标题或内链权重不足。

### 2.4 国家与设备

| 国家/地区 | 点击 | 曝光 | CTR | 排名 |
|---|---:|---:|---:|---:|
| United States | 0 | 10 | 0.00% | 24.90 |
| Germany | 0 | 5 | 0.00% | 58.00 |
| Russia | 2 | 4 | 50.00% | 5.50 |
| Netherlands | 0 | 4 | 0.00% | 8.75 |
| Indonesia | 0 | 4 | 0.00% | 28.50 |
| China | 1 | 3 | 33.33% | 15.67 |

| 设备 | 点击 | 曝光 | CTR | 排名 |
|---|---:|---:|---:|---:|
| Desktop | 3 | 48 | 6.25% | 24.29 |
| Mobile | 0 | 3 | 0.00% | 56.67 |

解读：

- 当前几乎全部搜索表现来自桌面端，符合开发者工具站的用户场景。
- 俄罗斯、中文地区已有点击信号，可以作为首批多语言优化重点。
- 美国曝光最多但无点击，英文首页和核心工具页的标题、描述、首屏价值表达需要优化。

## 3. 索引覆盖 Review

### 3.1 覆盖数据

| 日期 | 未编入索引 | 已编入索引 | 曝光 |
|---|---:|---:|---:|
| 2026-06-05 | 12 | 0 | 0 |
| 2026-06-06 | 314 | 34 | 0 |
| 2026-06-09 | 301 | 65 | 6 |
| 2026-06-12 | 301 | 65 | 3 |

截至 2026-06-12：

- Google 已知页面：约 366 个
- 已编入索引：65 个
- 未编入索引：301 个
- 已知页面索引率：17.8%
- 线上 sitemap URL 数：1,145 个
- sitemap URL 被 Google 识别为已知的比例：约 32.0%
- sitemap URL 已索引比例：约 5.7%

### 3.2 未收录原因

| 原因 | 来源 | 页面数 | 占未收录比例 |
|---|---|---:|---:|
| Discovered - currently not indexed | Google systems | 283 | 94.0% |
| Crawled - currently not indexed | Google systems | 13 | 4.3% |
| Page with redirect | Website | 4 | 1.3% |
| Alternate page with proper canonical tag | Website | 1 | 0.3% |

解读：

- `Discovered - currently not indexed` 是首要问题：Google 已看到 URL，但还没抓或还没安排抓取。对新站、多语言、URL 数较多的工具站很常见。
- `Crawled - currently not indexed` 只有 13 页，说明“抓了但觉得不值得收”的规模目前不大，但后续随着抓取扩大，可能会上升。
- `Page with redirect` 和 `Alternate page with proper canonical tag` 数量很小，不是当前主要风险。
- `Non-critical issues.csv` 为空，说明 GSC 当前没有额外的非关键覆盖问题导出。

## 4. 技术 SEO 现状

### 正向信号

- `robots.txt` 允许全站抓取，仅屏蔽 `/api/`，并正确声明 sitemap。
- `sitemap.xml` 可访问，包含 1,145 个 URL。
- 抽查 `/en`、`/es/protobuf-schema-visualizer`、`/ru/d2-preview` 均返回 HTTP 200。
- 页面由 Vercel 预渲染，搜索引擎可以直接获取 HTML。
- 本地代码已有 canonical、language alternates、SoftwareApplication JSON-LD、FAQ JSON-LD 等基础 SEO 结构。

### 主要风险

- sitemap 一次性暴露 1,145 个 URL，而 GSC 当前仅识别约 366 个，已索引 65 个。新站抓取预算明显跟不上 URL 规模。
- 多语言工具页数量多，如果每个语言页面内容结构高度相似，Google 可能优先延迟抓取或延迟索引。
- 部分页面 HTML 响应体较大，抽查页面约 596 KB 至 700 KB。虽然可以访问，但对抓取效率不友好，应关注是否有过多首屏外内容、重复翻译文案或客户端数据被静态输出。
- 工具页 sitemap 当前没有 `lastModified`。虽然 Google 不保证使用 `priority/changefreq`，但准确的 `lastmod` 对发现更新有帮助。
- 搜索外观数据为空，说明目前尚未形成可见的富结果/增强展示信号，或样本量太低尚未体现。

## 5. 优化建议

### P0：优先解决抓取与索引规模问题

1. 拆分 sitemap。
   - 建议拆为 `sitemap-core.xml`、`sitemap-tools.xml`、`sitemap-blog.xml`、`sitemap-locales.xml` 或 sitemap index。
   - 在 GSC 中先重点提交核心 sitemap，例如英文首页、核心工具页、已有搜索信号的语言页、核心博客页。
   - 这样不是为了隐藏页面，而是便于观察不同页面类型的收录效率。

2. 对 sitemap 做优先级治理。
   - 第一批重点：`/en`、`/en/text-to-mermaid`、`/es/protobuf-schema-visualizer`、`/ru/d2-preview`、`/zh-CN/drawio-preview`、核心 Hub 页、核心博客页。
   - 对低质量、内容未充分本地化或暂时没有内链支撑的语言页面，可以暂缓放入重点 sitemap。
   - 如果某些语言只是模板化翻译且没有真实使用价值，短期可以考虑从 sitemap 移除，或临时 noindex，等内容补强后再放开。

3. 给工具页补准确 `lastModified`。
   - 当前 sitemap 中博客和 Hub 有日期逻辑，工具页没有 `lastModified`。
   - 建议为工具配置增加 `updatedAt` 或统一内容更新时间，只有真实内容更新时才变更。

4. 强化内部链接权重。
   - 首页、`/tools`、各 Hub 页应显式链接到首批重点工具页。
   - 博客文章正文内应链接到对应工具页，而不仅依赖导航或卡片。
   - 对 `protobuf schema visualizer`、`d2 preview`、`text to mermaid`、`drawio preview`、`openapi to sequence` 等已有曝光页面，建立更多相关工具之间的上下文链接。

### P1：提高页面质量和差异化

1. 重点页面增加“真实使用场景”内容。
   - 每个核心工具页建议至少包含：输入示例、适用场景、输出说明、常见错误、与替代工具对比、FAQ。
   - 避免不同工具页只是把工具名替换一遍。工具站最容易被 Google 判定为相似页面。

2. 多语言页面做本地化搜索意图适配。
   - 俄语 `d2 preview` 已有排名和点击，可继续补充俄语关键词和示例。
   - 西语 `protobuf schema visualizer` 已有点击，建议扩展 `protobuf schema visualization online`、`visualizador protobuf` 等内容。
   - 中文 `drawio-preview` 排名偏低，建议加入“drawio 在线预览”“打开 drawio 文件”“drawio 转 svg/png”等中文自然表达。
   - 德语 `draw io öffnen` 有曝光但排名低，建议优化德语页面标题和正文，围绕“draw.io Datei öffnen / online ansehen / exportieren”。

3. 对博客进行“支持页 -> 工具页”的集群化。
   - 每个核心工具至少配 1-2 篇支持文章。
   - 支持文章不追求泛词，应追求强意图长尾，例如：
     - `Protobuf schema visualizer online: inspect messages and services`
     - `D2 diagram preview online for architecture docs`
     - `Open draw.io file online without installing diagrams.net`
     - `Text to Mermaid generator for README diagrams`

### P1：提升 CTR

1. 优化接近第一页但无点击的页面。
   - `/en/text-to-mermaid`：排名 8.6，0 点击。
   - `/`：排名 9，0 点击。
   - `/en`：排名 11，0 点击。
   - `/fr/openapi-to-sequence`：排名 2，但样本只有 2 次曝光，仍值得观察标题是否足够明确。

2. 标题建议模式。
   - 工具页标题尽量用“核心关键词 + Online/Free + 结果/场景 + 品牌”。
   - 示例：`Text to Mermaid Online - Generate Diagrams from Prompts | DiagramPreview`
   - 示例：`Protobuf Schema Visualizer Online - Preview Messages and Services`
   - 示例：`D2 Preview Online - Render D2 Diagrams in Browser`

3. 描述建议模式。
   - 描述里加入输入、输出、隐私/无登录、导出能力。
   - 示例：`Paste a Protobuf schema to visualize messages, fields, enums, and services in your browser. Free, no signup, export-ready.`

### P2：降低抓取成本

1. 检查静态 HTML 体积。
   - 抽查页面 HTML 约 596 KB 至 700 KB，建议确认是否输出了过多重复内容、全量多语言字典或不必要的 JSON。
   - 对搜索引擎来说，核心内容应尽量靠前，模板和长列表不要淹没主内容。

2. 避免一次性新增大量低权重 URL。
   - 后续新增工具或文章时，先从英文和 1-2 个重点语言发布，观察收录，再扩展到全部语言。
   - 对工具站来说，页面数量增长速度最好与内容质量、内链和外链增长同步。

3. 监控重定向和 canonical。
   - 当前 redirect/canonical 问题数量小，但每周仍应检查。
   - 确保 sitemap 只包含最终 200 且 self-canonical 的页面。

## 6. 2-4 周执行计划

### 第 1 周

- 拆分 sitemap，并在 GSC 分别提交。
- 选 20-50 个核心 URL 做重点索引观察。
- 优化 `/en/text-to-mermaid`、`/es/protobuf-schema-visualizer`、`/ru/d2-preview`、`/zh-CN/drawio-preview` 的 title、description、正文示例和 FAQ。
- 从首页、工具 Hub、博客页增加指向上述重点页面的内链。
- 用 URL Inspection 手动请求 10-20 个重点 URL 编入索引。

### 第 2 周

- 发布或补强 3-5 篇支持型博客，分别服务于 Protobuf、D2、Draw.io、Text to Mermaid、OpenAPI to Sequence。
- 检查 `Crawled - currently not indexed` 是否上升。如果上升，优先处理内容相似、低信息量页面。
- 检查移动端页面体验，但当前用户主要在桌面，不建议把移动优化作为最高优先级。

### 第 3-4 周

- 根据 GSC 页面维度筛选：有曝光但 CTR 低、排名 1-15 的页面，继续优化标题和描述。
- 根据 GSC 查询维度筛选：有曝光但排名 20-80 的长尾词，为对应语言页增加段落和示例。
- 评估是否需要暂时减少弱语言 sitemap 覆盖，集中抓取预算到英文、俄语、西语、中文和葡语等更有信号的页面。

## 7. 后续观察指标

建议每周固定记录：

| 指标 | 当前基线 | 2-4 周目标 |
|---|---:|---:|
| 已索引页面 | 65 | 150-250 |
| 未索引页面中 Discovered 占比 | 94.0% | 下降到 70% 以下 |
| 总曝光 | 51 | 周级别稳定超过 200-500 |
| 总点击 | 3 | 周级别稳定超过 10-30 |
| CTR | 5.88% | 保持 3%-8%，同时扩大曝光 |
| 平均排名 | 26.20 | 核心页面进入 10-20 区间 |
| 有曝光页面数 | 26 个页面导出 | 持续增加，并集中在核心工具页 |

## 8. 优先级清单

最高优先级：

- 拆分 sitemap，建立核心 URL 观察组。
- 给工具页增加准确 `lastModified`。
- 强化首页、Hub、博客到核心工具页的内链。
- 优化已有曝光页面的 title、description 和正文差异化。

次高优先级：

- 围绕 Protobuf、D2、Draw.io、Text to Mermaid、OpenAPI、Grafana、DBML 发布支持内容。
- 对俄语、西语、中文、德语页面做本地化关键词增强。
- 减少模板化页面的相似度，避免所有语言/工具页只是结构复用。

持续监控：

- `Discovered - currently not indexed` 是否下降。
- `Crawled - currently not indexed` 是否上升。
- sitemap 已知比例、已索引比例。
- 排名进入前 10 但无点击页面的 CTR。


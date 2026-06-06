# Recommended Launch Posts With Screenshots

These are the strongest copy versions to publish first. They are written to feel useful instead of advertisement-heavy, and they include product screenshots that can be uploaded with the post.

## Image Assets

Use these local screenshots when publishing:

![Header DevOps menu](https://diagrampreview.com/marketing/images/desktop-header-devops-menu.png)

![AI Draw.io Generator](https://diagrampreview.com/marketing/images/desktop-ai-drawio-generator.png)

![Mermaid Preview](https://diagrampreview.com/marketing/images/desktop-mermaid-preview.png)

![Grafana Dashboard Generator](https://diagrampreview.com/marketing/images/desktop-grafana-dashboard-generator.png)

## Chinese Recommended Post

### Title Options

- AI 把 Mermaid 写出来了，但我还得自己找地方预览
- 写 README/技术方案时被 Mermaid 预览折腾烦了，做了个小工具
- 大模型很会生成图表代码，但不会帮你确认能不能渲染
- 分享一个自用工具：AI 生成图表后，一键预览、修语法、导出
- 做了个给程序员写文档用的图表工具：粘贴、预览、导出

### Body

最近写 README、技术方案和接口文档时，我越来越常让 AI 生成图表：

- Mermaid 流程图、时序图、ER 图
- PlantUML 时序图、组件图、类图
- OpenAPI 接口调用流程
- SQL ER 图
- Docker Compose / Kubernetes / Terraform 架构关系
- Grafana dashboard JSON
- Prometheus alert rules
- draw.io / diagrams.net 可编辑图

但这里有一个很实际的问题：大模型通常只给代码，不提供稳定的预览、修复、导出和多格式转换工作流。很多时候是它写完 Mermaid，我复制到文档里才发现渲染不了。

比如 AI 可以写出 Mermaid，但你还要找地方渲染；它可以生成 PlantUML，但放进文档前还要确认图是否正确；它可以生成 Grafana JSON 或 Prometheus YAML，但你仍然要检查结构能不能用。

所以我做了 DiagramPreview：

https://diagrampreview.com

它解决的是 AI 输出和正式文档之间的这一段：

1. 让 AI 或自己先生成图表/配置文本。
2. 粘贴到 DiagramPreview。
3. 在线预览或结构化检查。
4. 修复语法问题。
5. 导出 SVG、PNG、PDF，或者下载 `.drawio`、`.json`、`.yaml` 等文件。

效果图：

![AI Draw.io Generator](https://diagrampreview.com/marketing/images/desktop-ai-drawio-generator.png)

![Mermaid Preview](https://diagrampreview.com/marketing/images/desktop-mermaid-preview.png)

目前工具按场景分成几类：

- AI：AI Diagram、AI Draw.io、Text to Mermaid、Mermaid Fixer、Architecture Diagram、AI PlantUML
- 预览：Mermaid、PlantUML、Markdown、Graphviz、D2、Sequence、Mind Map
- Draw.io：PlantUML to Draw.io、Mermaid to Draw.io、Draw.io to SVG
- DevOps：Grafana、Prometheus、Docker Compose、Kubernetes、Terraform、GitHub Actions、Dockerfile、Helm、Nginx、OpenTelemetry、Log to Sequence
- 数据：SQL ER、JSON Schema、JSON、YAML、XML、CSV、GraphQL、Protobuf、AsyncAPI、DBML、Prisma
- 代码：OpenAPI Sequence、package.json Dependencies、Regex Railroad

工具菜单效果：

![DevOps menu](https://diagrampreview.com/marketing/images/desktop-header-devops-menu.png)

我自己的使用场景主要是：

- 写 README、技术方案、PRD、接口文档前先验证图表。
- 用 AI 生成第一版 Mermaid / PlantUML / draw.io，再在浏览器里确认。
- 把 OpenAPI、SQL、K8s、Docker Compose、Terraform 等工程文本快速转成更容易讨论的图。
- 生成 Grafana dashboard JSON 或 Prometheus alert rules，再拿去继续调整。

DiagramPreview 不是想替代 AI，而是补上“AI 生成之后，正式文档之前”的预览、校验和导出步骤。

如果你也经常写技术文档、架构说明、接口方案、运维监控文档，可以试一下：

https://diagrampreview.com

也欢迎反馈还应该补哪些格式。下一步我会继续优化 draw.io 可编辑转换、Grafana/Prometheus 生成质量，以及更多工程配置可视化。

## English Recommended Post

### Title Options

- LLMs generate diagrams. They still do not preview them.
- I built the missing preview/export step for AI-generated diagrams
- From AI-generated Mermaid to something you can actually put in docs
- A no-signup toolbox for previewing Mermaid, PlantUML, OpenAPI, SQL, and DevOps diagrams
- Paste diagram text, preview it, fix it, export it

### Body

LLMs are very good at generating technical diagram source now:

- Mermaid flowcharts, sequence diagrams, and ER diagrams
- PlantUML sequence, component, and class diagrams
- OpenAPI request flows
- SQL ER diagrams
- Docker Compose, Kubernetes, Terraform, and GitHub Actions maps
- Grafana dashboard JSON
- Prometheus alert rules
- editable draw.io / diagrams.net XML

But there is still a practical gap: the model gives you text, not a reliable preview/export workflow. It can draft Mermaid quickly, but you still need to know whether that Mermaid actually renders before you put it in a README or design doc.

That means you still need to validate the diagram, fix syntax issues, and export something usable before adding it to a README, design doc, PRD, architecture proposal, or incident review.

I built DiagramPreview for that missing step:

https://diagrampreview.com

The workflow is:

1. Generate or write diagram/config source text.
2. Paste it into DiagramPreview.
3. Preview or inspect the output.
4. Fix syntax or structure issues.
5. Export SVG, PNG, PDF, or download source artifacts such as `.drawio`, `.json`, or `.yaml`.

Screenshots:

![AI Draw.io Generator](https://diagrampreview.com/marketing/images/desktop-ai-drawio-generator.png)

![Mermaid Preview](https://diagrampreview.com/marketing/images/desktop-mermaid-preview.png)

The current tools are grouped by use case:

- AI: AI Diagram, AI Draw.io, Text to Mermaid, Mermaid Fixer, Architecture Diagram, AI PlantUML
- Preview: Mermaid, PlantUML, Markdown, Graphviz, D2, Sequence, Mind Map
- Draw.io: PlantUML to Draw.io, Mermaid to Draw.io, Draw.io to SVG
- DevOps: Grafana, Prometheus, Docker Compose, Kubernetes, Terraform, GitHub Actions, Dockerfile, Helm, Nginx, OpenTelemetry, Log to Sequence
- Data: SQL ER, JSON Schema, JSON, YAML, XML, CSV, GraphQL, Protobuf, AsyncAPI, DBML, Prisma
- Code: OpenAPI Sequence, package.json Dependencies, Regex Railroad

Tool menu:

![DevOps menu](https://diagrampreview.com/marketing/images/desktop-header-devops-menu.png)

DiagramPreview is not meant to replace AI. It is the step after AI output and before production documentation: preview, validate, repair, and export.

I would love feedback from developers who write READMEs, architecture notes, API docs, platform docs, or monitoring runbooks.

https://diagrampreview.com

## Posting Notes

- V2EX: use the Chinese post, keep the tone as “做了个小工具，求反馈”.
- 掘金 / 博客园 / CSDN / SegmentFault: use the Chinese post and include 2-3 screenshots.
- Dev.to / Hashnode: use the English post as a tutorial-style article.
- Hacker News: shorten the English post and use only the product link plus 1-2 screenshots if allowed.
- Product Hunt: reuse the screenshots and tagline “Preview, fix, and export AI-generated diagrams.”

# Chinese Launch Posts

Recommended polished version with screenshots: [recommended-posts.md](./recommended-posts.md).

Suggested screenshots:

![AI Draw.io Generator](https://diagrampreview.com/marketing/images/desktop-ai-drawio-generator.png)

![DevOps menu](https://diagrampreview.com/marketing/images/desktop-header-devops-menu.png)

## V2EX

### Title Options

- AI 把 Mermaid 写出来了，但我还得自己找地方预览
- 写 README/技术方案时被 Mermaid 预览折腾烦了，做了个小工具
- 大模型很会生成图表代码，但不会帮你确认能不能渲染
- 分享一个自用小工具：AI 生成图表后，一键预览和导出
- 给经常写技术文档的同学做了个图表预览工具，求建议

### Post

大家好，最近我做了一个小工具 DiagramPreview：

https://diagrampreview.com

起因是我最近写 README、技术方案和接口文档时，经常让大模型生成 Mermaid、PlantUML、架构图、OpenAPI 流程、SQL ER 图之类的文本。

AI 生成初稿确实很快，但有个步骤一直很烦：它通常只给代码，不帮你确认能不能渲染。很多时候复制到文档里才发现 Mermaid 报错，或者 PlantUML 图看起来不对，还要再找工具预览、修语法、导出图片。

所以我把这个中间步骤做成了一个在线工具站：

- Mermaid / PlantUML / Graphviz / D2 / Markdown 预览
- AI Diagram Generator、Text to Mermaid、Mermaid AI Fixer
- OpenAPI to Sequence Diagram、SQL to ER Diagram
- JSON / YAML / JSON Schema / XML / CSV 结构可视化
- Docker Compose、Kubernetes Manifest、package.json 依赖图
- SVG / PNG / PDF 导出
- 不需要登录，浏览器里直接用

普通预览类工具主要在浏览器里处理。AI 生成类工具会调用后端接口，所以不要把私有代码、密钥、内部架构细节直接丢进去。

效果大概是这样：

![Mermaid Preview](https://diagrampreview.com/marketing/images/desktop-mermaid-preview.png)

![AI Draw.io Generator](https://diagrampreview.com/marketing/images/desktop-ai-drawio-generator.png)

我的主要使用场景是：

1. 让 AI 先生成图表代码。
2. 粘贴到 DiagramPreview 里看是否能渲染。
3. 如果语法坏了，修一下或让 AI 修复。
4. 导出 SVG/PNG 放到 README、PRD、技术方案或周报里。

目前还比较早期，想听听 V2EX 上大家的建议：

- 你们写技术文档时最常用 Mermaid、PlantUML 还是 draw.io？
- 还有哪些格式值得补，比如 DBML、Terraform、Protobuf、Grafana Dashboard、Prometheus Alert、Swagger 更深度可视化？
- 工具站这种形态，你会希望更偏“编辑器”，还是更偏“格式转换集合”？

欢迎拍砖，我会继续迭代。

## 掘金

### Title Options

- AI 生成 Mermaid 后怎么确认能渲染？我的预览和导出工作流
- 从 AI 生成 Mermaid 到放进 README：预览、修复、导出怎么做
- 大模型生成图表代码之后，还差一个在线预览和导出步骤

### Post

现在很多人写技术文档时，会先让 AI 生成 Mermaid、PlantUML、架构图说明、OpenAPI 调用流程、SQL ER 图，甚至 Docker Compose 和 Kubernetes 关系图。

这个流程很爽，但有一个问题一直存在：AI 给你的通常只是代码，不是可直接放进文档的图片或可编辑文件。

比如它可以生成一段 Mermaid：

- 你还要找地方预览。
- 语法错了要自己定位。
- 要放进 README 或设计文档时，还得导出 SVG/PNG。
- 多种格式之间切换时，工具比较零散。

所以我做了一个在线工具站 DiagramPreview：

https://diagrampreview.com

它的定位不是替代 AI，而是补上 AI 输出之后的“预览、校验、导出”环节。

先看两个实际页面效果：

![Mermaid Preview](https://diagrampreview.com/marketing/images/desktop-mermaid-preview.png)

![AI Draw.io Generator](https://diagrampreview.com/marketing/images/desktop-ai-drawio-generator.png)

目前支持：

- Mermaid Preview
- PlantUML Preview
- Graphviz Preview
- D2 Preview
- Markdown Preview with Mermaid
- AI Diagram Generator
- Text to Mermaid
- Mermaid AI Fixer
- OpenAPI to Sequence Diagram
- SQL to ER Diagram
- JSON / YAML / XML / CSV 可视化
- JSON Schema Visualizer
- Docker Compose Diagram
- Kubernetes Manifest Visualizer
- package.json Dependency Diagram
- Regex Railroad Diagram

我现在自己的工作流是：

1. 让 AI 根据需求生成 Mermaid 或 PlantUML。
2. 粘贴到 DiagramPreview 里预览。
3. 如果语法坏了，用修复工具或继续让 AI 改。
4. 导出 SVG/PNG/PDF，放到 README、技术方案、PRD 或博客里。

工具菜单按 AI、预览、Draw.io、DevOps、数据、代码分组，方便直接找对应场景：

![DevOps menu](https://diagrampreview.com/marketing/images/desktop-header-devops-menu.png)

如果你经常写技术文档、接口设计、架构说明，或者经常让 AI 生成图表，可以试试。也欢迎反馈还应该补哪些格式。

## 博客园 / CSDN / SegmentFault

### Title Options

- Mermaid 在线预览与导出：AI 生成流程图后的完整工作流
- AI 生成 Mermaid 后怎么预览？从图表代码到 SVG/PNG 导出
- PlantUML、Mermaid、SQL ER、OpenAPI 在线预览工具整理
- 技术文档图表怎么做：从 AI 生成到 README/方案文档

### Post

最近写技术文档时，我越来越频繁地让 AI 生成流程图、架构图、时序图和数据结构说明。

比如让它生成：

- Mermaid flowchart
- PlantUML sequence diagram
- OpenAPI 接口调用流程
- SQL ER 图
- Docker Compose 服务关系
- Kubernetes manifest 摘要
- package.json 依赖关系

问题是，大模型通常只给文本代码。它可以写 Mermaid，但不会稳定地帮你预览；它可以写 PlantUML，但你还要找地方渲染；它可以解释 OpenAPI 或 SQL，但你还是要手动整理成图。

于是我做了 DiagramPreview：

https://diagrampreview.com

下面是 Mermaid 预览和 AI Draw.io 生成页面的效果：

![Mermaid Preview](https://diagrampreview.com/marketing/images/desktop-mermaid-preview.png)

![AI Draw.io Generator](https://diagrampreview.com/marketing/images/desktop-ai-drawio-generator.png)

它想解决的是 AI 生成图表后的下一步：

1. 粘贴 AI 生成的图表代码。
2. 在线预览是否能渲染。
3. 如果 Mermaid 语法有问题，可以修复。
4. 生成 SVG/PNG/PDF，放进 README、技术方案、PRD 或博客。

这个工具站的定位不是替代 AI，而是补上 AI 输出和正式文档之间的“预览、校验、导出”环节。

如果是 DevOps / 监控类文档，也可以用 Grafana Dashboard Generator 生成 JSON 后继续编辑：

![Grafana Dashboard Generator](https://diagrampreview.com/marketing/images/desktop-grafana-dashboard-generator.png)

适合搜索关键词：

- Mermaid 在线预览
- PlantUML 在线预览
- Mermaid 导出 SVG
- PlantUML 导出 PNG
- SQL ER 图在线生成
- OpenAPI 时序图
- AI 生成流程图预览

## 知乎

### Question Angle

- AI 生成流程图后如何预览和导出？
- AI 生成的 Mermaid 经常渲染失败怎么办？
- 写技术文档时，Mermaid/PlantUML 图表怎么做比较省事？

### Answer

我自己的做法是把 AI 和预览工具拆开：

AI 负责生成第一版图表文本，比如 Mermaid、PlantUML、OpenAPI 调用流程、SQL 表结构关系等；预览工具负责把这段文本渲染出来，确认图是否正确，再导出 SVG/PNG 放进文档。

这个方式比完全依赖 AI 更稳，因为大模型生成的 Mermaid 经常会有一些小语法问题。如果直接复制到 README 或文档系统里，等到渲染失败才发现会比较麻烦。

我做了一个小工具 DiagramPreview：

https://diagrampreview.com

页面效果：

![Mermaid Preview](https://diagrampreview.com/marketing/images/desktop-mermaid-preview.png)

主要就是解决 paste -> preview -> fix -> export 这个流程。现在支持 Mermaid、PlantUML、Graphviz、D2、OpenAPI、SQL ER、JSON/YAML/XML/CSV 可视化、Docker Compose、Kubernetes Manifest、package.json 依赖图等。

如果你的场景是写技术方案、README、接口文档、架构设计，或者经常让 AI 生成图表代码，这种工具会比较省时间。

## 开源中国

### Title Options

- 分享一个面向开发者文档场景的在线图表预览工具
- AI 生成 Mermaid/PlantUML 后，用这个小工具先预览再导出
- 做了个开发者图表工具站，支持 Mermaid、PlantUML、OpenAPI、SQL ER 等
- 从 AI 生成图表代码到放进 README：预览、修复、导出完整工作流
- 写技术文档时，Mermaid/PlantUML/OpenAPI 在线预览与导出工具整理

### Post

最近写 README、技术方案、接口文档和运维说明时，我越来越常让 AI 生成各类图表和配置文本：

- Mermaid 流程图、时序图、ER 图
- PlantUML 时序图、组件图、类图
- OpenAPI 接口调用流程
- SQL ER 图
- Docker Compose / Kubernetes / Terraform 架构关系
- Grafana dashboard JSON
- draw.io / diagrams.net 可编辑图

大模型生成初稿确实很快，但有一个步骤一直很烦：它通常只给代码，不帮你确认能不能渲染。很多时候复制到文档里才发现 Mermaid 语法报错，或者 PlantUML 图看起来不对，还要再找工具预览、修语法、导出图片。

所以我做了一个在线工具站 DiagramPreview：

https://diagrampreview.com

它想解决的是 AI 输出和正式文档之间的这一段：

1. 让 AI 或自己先生成图表/配置文本。
2. 粘贴到 DiagramPreview 里在线预览。
3. 如果语法有问题，修复或继续让 AI 改。
4. 导出 SVG、PNG、PDF，或者下载 `.drawio`、`.json`、`.yaml` 等文件，放进 README、技术方案、PRD 或博客。

先看几个实际页面效果：

![Mermaid Preview](https://diagrampreview.com/marketing/images/desktop-mermaid-preview.png)

![AI Draw.io Generator](https://diagrampreview.com/marketing/images/desktop-ai-drawio-generator.png)

![DevOps menu](https://diagrampreview.com/marketing/images/desktop-header-devops-menu.png)

目前工具按场景分成几类：

- **AI**：AI Diagram Generator、AI Draw.io、Text to Mermaid、Mermaid AI Fixer、Architecture Diagram
- **预览**：Mermaid、PlantUML、Markdown、Graphviz、D2、Sequence、Mind Map
- **Draw.io**：PlantUML to Draw.io、Mermaid to Draw.io、Draw.io to SVG
- **DevOps**：Grafana Dashboard、Prometheus Alert、Docker Compose、Kubernetes、Terraform、GitHub Actions、Dockerfile、Helm、Nginx、OpenTelemetry
- **数据**：SQL ER、JSON Schema、JSON、YAML、XML、CSV、GraphQL、Protobuf、AsyncAPI、DBML、Prisma
- **代码**：OpenAPI Sequence、package.json Dependencies、Regex Railroad

如果是 DevOps / 监控类文档，也可以用 Grafana Dashboard Generator 生成 JSON 后继续编辑：

![Grafana Dashboard Generator](https://diagrampreview.com/marketing/images/desktop-grafana-dashboard-generator.png)

我自己的使用场景主要是：

- 写 README、技术方案、PRD、接口文档前先验证图表能否渲染。
- 用 AI 生成第一版 Mermaid / PlantUML / draw.io，再在浏览器里确认。
- 把 OpenAPI、SQL、K8s、Docker Compose、Terraform 等工程文本快速转成更容易讨论的图。
- 生成 Grafana dashboard JSON 或 Prometheus alert rules，再拿去继续调整。

DiagramPreview 不是想替代 AI，而是补上「AI 生成之后，正式文档之前」的预览、校验和导出步骤。

**使用方式**：不需要登录，浏览器里直接使用。普通预览类工具主要在浏览器本地处理；AI 生成类工具会调用后端接口，所以不要把私有代码、密钥、内部架构细节直接丢进去。

如果你也经常写技术文档、架构说明、接口方案、运维监控文档，可以试一下。也欢迎反馈还应该补哪些格式，比如 DBML、Terraform 更深度可视化、Grafana Dashboard 模板等。

适合搜索的关键词：

- Mermaid 在线预览
- PlantUML 在线预览
- Mermaid 导出 SVG
- PlantUML 导出 PNG
- SQL ER 图在线生成
- OpenAPI 时序图
- AI 生成流程图预览

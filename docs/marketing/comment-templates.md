# Comment Templates

Use comments only when the thread is already about AI coding, technical docs, Mermaid, PlantUML, architecture diagrams, README tooling, monitoring dashboards, or developer productivity. Do not paste the same comment repeatedly.

## V2EX Comments

### Comment 1

我最近也遇到类似问题：AI 生成 Mermaid/PlantUML 很方便，但真正要放进 README 或技术方案前，还是要找地方预览、修语法、导出 SVG/PNG。

我做了个小工具专门补这个环节：https://diagrampreview.com

不需要登录，主要就是 paste -> preview -> export。你这个场景里如果经常写图，可能能省一点来回折腾。

### Comment 2

现在大模型确实很适合先生成图表文本，但“可视化确认”这个步骤还挺缺的。尤其 Mermaid 一旦语法有点问题，直接放文档里才发现会很烦。

我这边做了一个在线预览工具，支持 Mermaid、PlantUML、OpenAPI、SQL ER、JSON/YAML/Schema、Docker Compose、K8s 等，欢迎试试：

https://diagrampreview.com

### Comment 3

如果你们团队已经在用 Mermaid 写架构/流程图，可以考虑把 AI 生成代码和预览工具拆开：AI 负责初稿，预览工具负责渲染、修错、导出。

我做了一个这类工具站：https://diagrampreview.com

目前想继续补 draw.io 生成、PlantUML 转 draw.io、Grafana Dashboard、Prometheus Alert、DBML / Terraform / Protobuf 这类开发者格式。

## 掘金 / SegmentFault Comments

### Comment 1

这个场景我也经常遇到，AI 生成 Mermaid 或 PlantUML 很快，但后面预览、修语法、导出图片还是要单独处理。我做了一个在线工具整理这个流程：https://diagrampreview.com

### Comment 2

如果是写技术方案或 README，可以试试把 AI 生成图表和在线预览分开：AI 负责生成初稿，预览工具负责确认和导出。我这边做了 DiagramPreview，支持 Mermaid、PlantUML、SQL ER、OpenAPI、Docker Compose、K8s 等：https://diagrampreview.com

## 知乎 Comments

### Comment 1

我的经验是不要完全依赖 AI 直接出最终图，而是让 AI 生成 Mermaid/PlantUML 初稿，再用预览工具检查和导出。我做了一个这类工具 DiagramPreview，主要解决 AI 生成图表后的预览、修复和导出问题：https://diagrampreview.com

### Comment 2

AI 适合生成第一版图表代码，但可视化确认还是需要单独做。尤其是 Mermaid 语法稍微错一点，放进文档系统后才发现会比较麻烦。可以用类似 DiagramPreview 这种工具先预览再导出：https://diagrampreview.com

## English Comments

### Comment 1

This is exactly the gap I kept seeing with AI-generated diagrams: the model can write Mermaid or PlantUML, but you still need a fast preview/export step before putting it into docs. I built a small browser-first tool for that workflow: https://diagrampreview.com

### Comment 2

For technical docs, I like using AI to draft Mermaid/PlantUML, then a separate preview tool to validate and export. I built DiagramPreview for that paste -> preview -> export loop: https://diagrampreview.com

### Comment 3

If you are using LLMs to generate architecture diagrams or README diagrams, the missing step is usually visual validation. DiagramPreview supports Mermaid, PlantUML, OpenAPI, SQL ER, Docker Compose, Kubernetes, JSON Schema, and a few more formats: https://diagrampreview.com

### Comment 4

I would treat AI-generated diagrams as drafts. Let the model create the Mermaid/PlantUML, then preview, fix, and export before adding it to docs. I built a small tool around that workflow: https://diagrampreview.com

## Comment Safety Rules

- Only comment when the discussion naturally matches the tool.
- Rewrite the first sentence for the exact thread.
- Avoid phrases like “best tool”, “must try”, “100% free forever”, or “please support”.
- Do not post the same URL repeatedly in the same community on the same day.
- In V2EX, ask for feedback and mention it is your own small tool.
- In Zhihu, answer the question first, then mention the link after explaining the workflow.

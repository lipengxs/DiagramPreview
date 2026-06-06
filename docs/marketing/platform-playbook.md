# Platform Playbook

## V2EX

Audience: programmers, indie builders, backend/frontend/devops engineers.

Tone:

- Sincere side project sharing.
- Ask for feedback.
- Do not sound like a marketing landing page.

Best angle:

- AI 生成 Mermaid / PlantUML 很常见。
- 大模型只给代码，不给稳定预览。
- 真正放进 README、PRD、技术方案前，还需要渲染、修语法、导出 SVG/PNG。

Suggested nodes:

- `分享创造`
- `程序员`
- `酷工作` is not suitable unless hiring.

Posting tips:

- Put the link near the beginning, but explain motivation first.
- Ask 2-3 concrete questions at the end.
- Be ready to respond to criticism about privacy, ads, login, and whether rendering runs locally.

## 掘金

Audience: frontend/backend developers and productivity-tool readers.

Best format:

- Practical article.
- Include one workflow example: AI prompt -> Mermaid output -> preview -> export.

Title:

- AI 生成 Mermaid 后，如何预览、修复并导出到技术文档？

Tips:

- Do not write only a product introduction.
- Add screenshots later when the site UI is more polished.

## 博客园 / CSDN / SegmentFault

Audience: search-driven developers.

Best format:

- SEO tutorial.
- Include keywords naturally.

Useful keywords:

- Mermaid 在线预览
- PlantUML 在线预览
- Mermaid 导出 SVG
- SQL ER 图
- OpenAPI 时序图
- AI 生成流程图

Tips:

- Keep the article useful even if readers do not click the product link.
- Put the link after explaining the workflow.

## 知乎

Audience: broad technical readers.

Best format:

- Answer a real question.
- Start with the workflow, not the product.

Good answer structure:

1. AI 负责生成图表初稿。
2. 预览工具负责渲染和校验。
3. 修复语法问题。
4. 导出 SVG/PNG/PDF 进入文档。
5. Briefly mention DiagramPreview.

## 开源中国

Audience: Chinese open-source and developer-tool users.

Best format:

- Tool sharing.
- Mention no login and browser-first.

Tips:

- If the project later becomes public, add GitHub link.
- Since this project is private now, avoid saying “open source”.

## Dev.to / Hashnode

Audience: developers who like tutorials.

Best format:

- Tutorial article.

Suggested structure:

1. Generate Mermaid with an LLM.
2. Preview and fix it.
3. Export SVG/PNG.
4. Add it to README.

Tips:

- Use simple English.
- Include code blocks and concrete examples later.

## Indie Hackers

Audience: builders and small SaaS/tool founders.

Best format:

- Build-in-public note.

Angle:

- Repeated workflow became a small tool.
- Ask which formats should be supported next.

Tips:

- Ask for feedback, not votes.
- Mention future plans like draw.io generation, Grafana dashboards, and Prometheus alerts.

## Hacker News

Audience: highly technical readers.

Best format:

- Show HN.

Tips:

- Keep it concise.
- Be ready for questions about privacy, client-side rendering, export quality, and why not use existing tools.
- Do not ask for votes.
- Post only when the site is stable and directly useful without login.

## Product Hunt

Audience: product/tool discovery.

Needs:

- Tagline.
- Screenshots.
- First comment.
- Clear use case.

Tagline:

Preview, fix, and export AI-generated diagrams.

## Comment Strategy

Good situations to comment:

- Someone asks how to preview Mermaid or PlantUML.
- Someone complains AI generated broken Mermaid.
- Someone discusses README diagrams or architecture documentation.
- Someone asks for developer documentation tools.
- Someone discusses Grafana, OpenAPI, SQL ER, Docker Compose, Kubernetes visualization.

Bad situations to comment:

- Generic AI news thread.
- Community meta discussion.
- Threads where self-promotion is explicitly discouraged.
- Multiple comments in the same site within a short time.

## Anti-Spam Checklist

Before posting a comment, ask:

- Does the thread already discuss a matching problem?
- Did I answer the question before linking?
- Did I customize the comment for this thread?
- Have I posted this same URL too many times today?
- Would this comment still be useful if the link were removed?

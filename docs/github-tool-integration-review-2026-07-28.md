# GitHub Tool Integration Review - 2026-07-28

## 结论

当前最值得集成的方向不是直接替换 DiagramPreview 的核心渲染链路，而是选择成熟、许可证清晰、能在浏览器端稳定运行的组件来补强特定工具质量。

推荐顺序：

1. P0：集成 `@rjsf/core` + `@rjsf/validator-ajv8`，升级 `json-schema-form-preview` 为真实表单预览。
2. P1：评估 `@stoplight/json-schema-viewer`，升级 `json-schema-visualizer` 的 Schema 阅读体验。
3. P1：参考 `doubleSlashde/plantuml2drawio` 的解析策略，增强 PlantUML to draw.io，但不要直接引入 Python 运行时。
4. P2：隔离验证 `convert2mermaid`，做“导入 draw.io / Visio -> Mermaid”的实验性转换入口。
5. P2：参考 `swagger_to_uml` / `openapi-to-plantuml` 的 API 建模思路，增强 OpenAPI sequence，但不直接引入 Python/Java。
6. 不建议：直接集成 GPL 项目或整个 diagrams.net 源码到主站 bundle。

## 候选项目

| 项目 | 方向 | License | 活跃度信号 | 集成判断 |
| --- | --- | --- | --- | --- |
| [rjsf-team/react-jsonschema-form](https://github.com/rjsf-team/react-jsonschema-form) | JSON Schema -> Form | Apache-2.0 | 高星标，2026-07 仍活跃 | 推荐 P0。React 组件生态成熟，适合替换当前静态 HTML form preview。 |
| [@rjsf/core npm](https://www.npmjs.com/package/@rjsf/core) / [@rjsf/validator-ajv8 npm](https://www.npmjs.com/package/@rjsf/validator-ajv8) | 表单渲染与校验 | Apache-2.0 | npm 最新版本 6.7.1 | 可直接依赖，React 18+ peer dependency 与当前 React 19 匹配。 |
| [stoplightio/json-schema-viewer](https://github.com/stoplightio/json-schema-viewer) | JSON Schema 阅读器 | Apache-2.0 | 2025 有更新 | 推荐 P1。功能很贴合，但依赖 `@stoplight/mosaic`，需要先评估 bundle 和样式隔离。 |
| [jgraph/drawio](https://github.com/jgraph/drawio) | diagrams.net / draw.io 核心 | Apache-2.0 | 高星标，持续更新 | 不建议直接集成整个项目。可参考 XML/mxGraph 结构，或后续做“打开到 diagrams.net”的外链交付。 |
| [doubleSlashde/plantuml2drawio](https://github.com/doubleSlashde/plantuml2drawio) | PlantUML -> draw.io | MIT | 2026 有更新 | 可参考算法，不建议直接运行 Python。适合抽样对比当前 `drawio-converters.ts` 的解析覆盖。 |
| [SantosVilanculos/plantuml-to-drawio](https://github.com/SantosVilanculos/plantuml-to-drawio) | PlantUML -> draw.io | Apache-2.0 | 小项目，2025 更新 | 参考价值有限，适合作为测试样例来源。 |
| [rglaue/plantuml_to_drawio](https://github.com/rglaue/plantuml_to_drawio) | PlantUML -> draw.io | 未声明 | 星标较高但 license 不清 | 不建议直接集成。只能人工阅读思路，不能复制代码。 |
| [jgreywolf/convert2mermaid](https://github.com/jgreywolf/convert2mermaid) | 多格式 -> Mermaid | MIT | 2026-07 更新 | P2 实验。依赖 `vsdx-js` 和 `xml2js`，更适合作为服务端/CLI 导入能力，不宜直接塞进首屏。 |
| [nlohmann/swagger_to_uml](https://github.com/nlohmann/swagger_to_uml) | Swagger/OpenAPI -> UML | MIT | 2025 更新 | 可参考 API 建模思路，不建议直接集成 Python。 |
| [davidmoten/openapi-to-plantuml](https://github.com/davidmoten/openapi-to-plantuml) | OpenAPI -> PlantUML | 未声明 | 2026 更新 | license 不清，不建议直接集成。 |
| [sindrel/excalidraw-converter](https://github.com/sindrel/excalidraw-converter) | Excalidraw 转换 | MIT | 2026 更新 | 暂不进入主线。除非新增 Excalidraw workflow，否则会分散产品定位。 |
| [nopeslide/drawio_mermaid_plugin](https://github.com/nopeslide/drawio_mermaid_plugin) | draw.io Mermaid 插件 | GPL-3.0 | 2023 更新 | 不建议直接集成。GPL 会带来许可证传染风险。 |

## 对当前代码的影响点

### JSON Schema / Form

当前实现：

- `src/lib/renderers/json-schema.ts`：把 JSON Schema 转为 TreeNode。
- `src/lib/renderers/growth-tools.ts`：`json-schema-form-preview` 当前更像 HTML 摘要。
- `src/components/tools/ToolShell.tsx`：通过 `renderer === "json-schema-form"` 返回 HTML artifact。

建议：

- 新增 React 组件型 preview 路径，不再只返回字符串 HTML。
- 第一阶段只改 `json-schema-form-preview`，用 `@rjsf/core` 渲染真实表单。
- 保留当前 tree preview，避免影响 `json-schema-visualizer` 的稳定 SEO 页面。

验收：

- JSON Schema required、enum、array、nested object 可以生成表单。
- schema 无效时显示可理解错误。
- 不上传 schema 到服务器。

### PlantUML / Mermaid to draw.io

当前实现：

- `src/lib/renderers/drawio-converters.ts` 是轻量正则解析。
- 对复杂 PlantUML class/component/sequence 支持有限。

建议：

- 不直接引入 Python 转换器。
- 建一个 fixture 对比集，参考 MIT/Apache 项目的输入样例扩展解析覆盖。
- 优先增强 participant、actor、database、component、class relation、note/group 这些常见结构。

验收：

- 7 个核心工具中的 `plantuml-to-drawio` 和 `mermaid-to-drawio` 每个至少增加 5 个真实转换 fixture。
- 转换失败时给出“当前支持范围”说明，而不是静默生成错误图。

### OpenAPI / API Sequence

当前实现：

- `src/lib/renderers/openapi.ts` 会遍历 `paths`，生成固定 Client/API/Handler/Store sequence。

建议：

- 不直接引入 Java/Python 项目。
- 参考 Swagger/OpenAPI -> UML 项目的建模思路，补强 tags、operationId、security、requestBody、responses、callbacks。
- 先增强 Mermaid source 生成，再复用已有 Mermaid renderer。

验收：

- 支持按 tag 聚合。
- 4xx/5xx response 能生成 error branch。
- requestBody / response schema 名称能进图。

## 下一步可执行批次

### Batch A：先集成 RJSF

目标：把 `json-schema-form-preview` 从“摘要预览”升级为“真实可交互表单预览”。

改动：

- 安装 `@rjsf/core`、`@rjsf/validator-ajv8`。
- 新增一个客户端 preview 组件，只在 `json-schema-form-preview` 使用。
- 保留现有 `json-schema-visualizer`，不改 SEO title/description/H1。

风险：

- bundle 增加，需要动态 import。
- 默认样式要和现有工具页一致，避免引入大 UI 主题包。

### Batch B：增强 draw.io 转换 fixture

目标：提高 Mermaid/PlantUML to draw.io 的真实输入覆盖。

改动：

- 增加 fixtures 和单元级转换样例。
- 扩展 `drawio-converters.ts` 的节点/边解析。
- 增加错误提示和支持范围说明。

风险：

- draw.io XML 格式需要继续保持可被 diagrams.net 打开。

### Batch C：增强 OpenAPI sequence

目标：让 OpenAPI 工具从“路径列表图”升级为“可解释 API 调试流”。

改动：

- operationId/tags/security/requestBody/responses 进入 Mermaid source。
- 4xx/5xx 生成 alt/error branch。
- 增加 Postman/HAR 与 OpenAPI 的 next-step 串联样例。

风险：

- 大 OpenAPI 文档需要限制路径数量和图复杂度。

## 来源

- https://github.com/rjsf-team/react-jsonschema-form
- https://www.npmjs.com/package/@rjsf/core
- https://www.npmjs.com/package/@rjsf/validator-ajv8
- https://github.com/stoplightio/json-schema-viewer
- https://www.npmjs.com/package/@stoplight/json-schema-viewer
- https://github.com/jgraph/drawio
- https://github.com/doubleSlashde/plantuml2drawio
- https://github.com/SantosVilanculos/plantuml-to-drawio
- https://github.com/rglaue/plantuml_to_drawio
- https://github.com/jgreywolf/convert2mermaid
- https://github.com/nlohmann/swagger_to_uml
- https://github.com/davidmoten/openapi-to-plantuml
- https://github.com/sindrel/excalidraw-converter
- https://github.com/nopeslide/drawio_mermaid_plugin

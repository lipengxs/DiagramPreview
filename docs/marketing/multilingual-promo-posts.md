# Multilingual Promo Posts + Auto-Publish Map

This file has two parts:

1. Which sites can be **legitimately scheduled or API-posted** (no ToS-breaking bots).
2. Ready-to-publish promo posts for each site locale: `zh-CN`, `en`, `ja`, `ko`, `de`, `fr`, `es`, `pt`, `ru`.

Core link: https://diagrampreview.com  
Screenshots (upload where the platform allows images):

- https://diagrampreview.com/marketing/images/desktop-mermaid-preview.png
- https://diagrampreview.com/marketing/images/desktop-ai-drawio-generator.png
- https://diagrampreview.com/marketing/images/desktop-header-devops-menu.png
- https://diagrampreview.com/marketing/images/desktop-grafana-dashboard-generator.png

---

## 1. What “auto-post” actually means

| Mode | Meaning | Safe? |
| --- | --- | --- |
| Official API / CMS publish | Dev.to, Hashnode, Ghost, WordPress, Bluesky, Mastodon, Telegram (own channel) | Yes, if you own the account |
| Scheduler (Buffer, Typefully, Later, Hootsuite) | LinkedIn, X, Bluesky, Mastodon, some blogs | Yes |
| Cross-post from RSS | Medium (limited), some newsletters | Partial |
| Browser automation / fake accounts / spam bots | V2EX, 知乎, Reddit mass posts, HN, etc. | **No — do not do this** |

I can help you **generate copy + a publish checklist**, and optionally scripts that use **official APIs you authenticate**. I will not build scrapers that bypass login walls or mass-spam communities.

### Platforms that support real automation

| Platform | How | Notes |
| --- | --- | --- |
| Dev.to | REST API `POST /articles` | Best EN auto-publish target |
| Hashnode | GraphQL API | Good EN/blog auto-publish |
| Ghost / WordPress | Admin API | If you self-host a blog |
| Bluesky | AT Protocol API | Easy for short posts |
| Mastodon | Statuses API | Good for FOSS-friendly tone |
| Telegram | Bot API to **your** channel | Only channels you own |
| LinkedIn | Official API or Buffer/Typefully | Company/personal page |
| X / Twitter | Paid API or Typefully/Buffer | Rate limits / cost |
| Medium | Import RSS / manual; API limited | Prefer manual or RSS |
| Notion → public web | Notion API | Publish page, not community post |
| Email newsletter | Buttondown / Beehiiv / Substack API | Soft launch notes |

### Platforms that are mostly manual (high signal, low automation)

V2EX, 掘金, 博客园, CSDN, 知乎, 开源中国, InfoQ, Hacker News, Product Hunt, Indie Hackers, Qiita, Zenn, Velog, Okky, GeekNews, TabNews, Habr, Developpez, Stack Overflow (answers only), Reddit (API exists but self-promo rules are strict — treat as manual).

**Practical auto stack for DiagramPreview:**

1. Write once → translate variants in this file.
2. Auto: Dev.to + Hashnode + Bluesky + Mastodon + (optional) LinkedIn via Buffer.
3. Manual same week: V2EX / 掘金 / Zenn / Qiita / Velog / TabNews / Habr.

---

## 2. Shared English skeleton (source of truth)

Use this meaning in every language:

- Problem: LLMs generate Mermaid/PlantUML/OpenAPI/SQL/DevOps text, not a reliable preview.
- Product: DiagramPreview fills paste → preview → fix → export.
- Link: locale homepage when available.
- CTA: try it, send format requests, no login required.
- Privacy: do not paste secrets into AI tools.

Locale URLs:

| Lang | URL |
| --- | --- |
| en | https://diagrampreview.com |
| zh-CN | https://diagrampreview.com/zh-CN |
| ja | https://diagrampreview.com/ja |
| ko | https://diagrampreview.com/ko |
| de | https://diagrampreview.com/de |
| fr | https://diagrampreview.com/fr |
| es | https://diagrampreview.com/es |
| pt | https://diagrampreview.com/pt |
| ru | https://diagrampreview.com/ru |

---

## 3. Promo posts by language

Each language has:

- **Short** — X / Bluesky / Mastodon / LinkedIn / 沸点
- **Medium** — Indie Hackers / TabNews / GeekNews / community share
- **Long** — Dev.to / Hashnode / Zenn / Qiita / Velog / Habr / 掘金-style article opener

---

### zh-CN · 中文

**Short**

AI 生成 Mermaid/PlantUML 很快，但放进 README 前还得预览、修语法、导出。

我做了个在线工具 DiagramPreview：粘贴 → 预览 → 修复 → 导出 SVG/PNG。

https://diagrampreview.com/zh-CN

免登录。欢迎反馈还缺哪些格式。

**Medium**

写技术方案时，我常让 AI 生成 Mermaid、PlantUML、OpenAPI 流程、SQL ER、Docker Compose / K8s 关系图。

问题是：模型通常只给代码，不保证能渲染。复制进文档才报错，很烦。

所以做了 DiagramPreview：

https://diagrampreview.com/zh-CN

支持 Mermaid / PlantUML / Graphviz / D2、OpenAPI 时序图、SQL ER、JSON/YAML、Docker Compose、Kubernetes、package.json 依赖图，以及 AI Draw.io / Grafana 等。

工作流：生成 → 粘贴预览 → 修复 → 导出。求拍砖和建议。

**Long title options**

- AI 把 Mermaid 写出来了，但我还得自己找地方预览
- 从 AI 生成图表到放进 README：预览、修复、导出工作流
- 大模型很会生成图表代码，但不会帮你确认能不能渲染

**Long body**

最近写 README、技术方案和接口文档时，我越来越常让 AI 生成图表文本：Mermaid、PlantUML、OpenAPI 调用流程、SQL ER、Docker Compose、Kubernetes 等。

生成很快，但中间缺一步：预览是否能渲染、修小语法问题、再导出 SVG/PNG/PDF。很多时候是复制到文档系统里才发现 Mermaid 挂了。

我把这一步做成了浏览器工具站 DiagramPreview：

https://diagrampreview.com/zh-CN

![Mermaid Preview](https://diagrampreview.com/marketing/images/desktop-mermaid-preview.png)

![AI Draw.io Generator](https://diagrampreview.com/marketing/images/desktop-ai-drawio-generator.png)

典型流程：

1. 让 AI 生成图表/配置文本  
2. 粘贴到 DiagramPreview  
3. 在线预览并修复  
4. 导出后放进 README / 方案 / PRD  

它不是要替代 AI，而是补上「AI 输出 → 正式文档」之间的预览与导出。

普通预览多在浏览器处理；AI 生成类会走后端，请勿粘贴密钥和私有架构细节。

欢迎试用，也欢迎告诉我还该支持哪些格式。

**Auto:** 微信（定时群发，若有公众号）、自己的博客 RSS。  
**Manual:** V2EX、掘金、知乎、开源中国、CSDN。

---

### en · English

**Short**

LLMs write Mermaid and PlantUML fast. They still do not preview them.

I built DiagramPreview: paste → preview → fix → export SVG/PNG.

https://diagrampreview.com

No signup. Feedback welcome.

**Medium**

I kept hitting the same gap: AI generates diagram text, but docs need a rendered, exportable asset.

DiagramPreview is a browser-first toolbox for that middle step — Mermaid, PlantUML, OpenAPI sequences, SQL ER, Docker Compose, Kubernetes, JSON/YAML, plus AI Draw.io and Grafana helpers.

https://diagrampreview.com

Would love feedback on which formats to add next.

**Long title options**

- LLMs generate diagrams. They still do not preview them.
- From AI-generated Mermaid to docs-ready SVG/PNG
- A no-signup toolbox for previewing AI-generated technical diagrams

**Long body**

LLMs are good at drafting Mermaid, PlantUML, OpenAPI flows, SQL schemas, and DevOps manifests. They usually stop at text.

Before that output belongs in a README or design doc, you still need to preview it, catch syntax issues, and export SVG/PNG/PDF.

That is the gap DiagramPreview targets:

https://diagrampreview.com

![Mermaid Preview](https://diagrampreview.com/marketing/images/desktop-mermaid-preview.png)

![AI Draw.io Generator](https://diagrampreview.com/marketing/images/desktop-ai-drawio-generator.png)

Workflow:

1. Generate or write diagram/source text  
2. Paste into DiagramPreview  
3. Preview and fix  
4. Export for documentation  

It is browser-first and does not require an account. Preview tools are mostly client-side; AI tools call a backend — do not paste secrets.

If you write technical docs with AI assistance, I would love your feedback.

**Auto:** Dev.to API, Hashnode API, Bluesky, Mastodon, Buffer→LinkedIn/X.  
**Manual:** HN Show HN, Product Hunt, Indie Hackers, Reddit SideProject.

---

### ja · 日本語

**Short**

LLM は Mermaid / PlantUML をすぐ書いてくれますが、プレビューまではしてくれません。

DiagramPreview を作りました。貼り付け → プレビュー → 修正 → SVG/PNG 書き出し。

https://diagrampreview.com/ja

ログイン不要。フィードバック歓迎です。

**Medium**

README や設計書で、AI に Mermaid・PlantUML・OpenAPI・SQL ER・Docker Compose / K8s 図を書かせることが増えました。

ただモデルはテキストを返すだけで、描画確認やエクスポートは別作業です。

その中間を埋めるために DiagramPreview を作りました：

https://diagrampreview.com/ja

対応: Mermaid / PlantUML / Graphviz / D2、OpenAPI シーケンス、SQL ER、JSON/YAML、Compose、Kubernetes など。

次に足すべき形式があれば教えてください。

**Long title options**

- AI が Mermaid を書いてくれても、プレビューは自分でやる問題
- 生成された図表コードをドキュメント向けにするワークフロー
- ログイン不要の開発者向け図表プレビューツールを公開しました

**Long body**

最近、技術文書では AI に図表コードを生成させることが普通になりました。一方で、そのコードが本当に描画できるか、README に貼る前に直す必要があるかは、モデル側では保証されません。

DiagramPreview はその抜けているステップ向けのブラウザツールです。

https://diagrampreview.com/ja

![Mermaid Preview](https://diagrampreview.com/marketing/images/desktop-mermaid-preview.png)

流れはシンプルです：

1. AI または手書きで図表テキストを用意  
2. DiagramPreview に貼る  
3. プレビューして修正  
4. SVG / PNG / PDF を書き出してドキュメントへ  

AI の代替ではなく、「生成 → 正式ドキュメント」の間を埋めるツールです。秘密情報は AI 系機能に貼らないでください。

ご意見・追加してほしい形式があればぜひ。

**Auto:** 自ブログ / Bluesky / X（スケジューラ）。  
**Manual:** Zenn、Qiita、teratail（回答時のみ）。

---

### ko · 한국어

**Short**

LLM은 Mermaid/PlantUML을 잘 만들어 주지만, 미리보기는 안 해 줍니다.

DiagramPreview: 붙여넣기 → 미리보기 → 수정 → SVG/PNG 내보내기

https://diagrampreview.com/ko

로그인 없음. 피드백 환영합니다.

**Medium**

README·설계 문서 쓸 때 AI로 다이어그램 코드를 자주 받습니다. 문제는 렌더 확인과보내기가 따로라는 점입니다.

그 중간 단계를 위해 DiagramPreview를 만들었습니다.

https://diagrampreview.com/ko

Mermaid, PlantUML, OpenAPI 시퀀스, SQL ER, Docker Compose, Kubernetes, JSON/YAML 등을 지원합니다. 다음에 추가할 포맷 제안 환영합니다.

**Long title options**

- AI가 Mermaid를 써 줘도, 문서 전에 미리보기가 필요하다
- AI 생성 다이어그램을 문서용으로 만드는 워크플로
- 로그인 없는 개발자용 다이어그램 미리보기 도구

**Long body**

AI는 Mermaid, PlantUML, OpenAPI, SQL, DevOps 매니페스트 초안을 빠르게 만듭니다. 하지만 보통 텍스트에서 멈추고, 문서에 넣기 전 미리보기·문법 수정·내보내기는 직접 해야 합니다.

DiagramPreview는 그 빈 구간을 위한 브라우저 도구입니다.

https://diagrampreview.com/ko

![Mermaid Preview](https://diagrampreview.com/marketing/images/desktop-mermaid-preview.png)

1. 다이어그램/설정 텍스트 생성  
2. 붙여넣기  
3. 미리보기 및 수정  
4. 문서용으로보내기  

AI를 대체하지 않고, 생성 결과를 문서에 넣기 쉽게 만드는 것이 목표입니다. AI 기능에는 비밀키를 붙여넣지 마세요.

시도해 보시고 필요한 포맷을 알려 주세요.

**Auto:** Bluesky / X 스케줄.  
**Manual:** Velog, GeekNews, Okky, Tistory.

---

### de · Deutsch

**Short**

LLMs schreiben Mermaid/PlantUML schnell — previewen tun sie es nicht.

DiagramPreview: einfügen → preview → fixen → SVG/PNG exportieren.

https://diagrampreview.com/de

Ohne Login. Feedback willkommen.

**Medium**

Für READMEs und Design-Docs lasse ich KI oft Diagramm-Text erzeugen. Fehlt danach: zuverlässiges Preview, kleine Syntaxfixes, Export.

Dafür gibt es DiagramPreview:

https://diagrampreview.com/de

Unterstützt Mermaid, PlantUML, OpenAPI-Sequenzen, SQL-ER, Compose, Kubernetes, JSON/YAML u. a. Welche Formate fehlen euch?

**Long title options**

- KI schreibt Mermaid — eure Docs brauchen trotzdem ein Preview
- Von generiertem Diagramm-Text zu SVG/PNG für die Doku
- Browser-Toolbox zum Preview von KI-generierten Diagrammen

**Long body**

KI-Modelle sind gut darin, Mermaid, PlantUML, OpenAPI-Flows und DevOps-Manifeste zu entwerfen. Meist endet es bei Text.

Bevor das in ein README oder Design-Doc wandert, braucht ihr Preview, Syntax-Check und Export.

Genau diesen Schritt deckt DiagramPreview ab:

https://diagrampreview.com/de

![Mermaid Preview](https://diagrampreview.com/marketing/images/desktop-mermaid-preview.png)

Ablauf: generieren → einfügen → preview/fix → exportieren.

Ohne Account. AI-Funktionen nicht mit Secrets füttern. Feedback zu weiteren Formaten ist willkommen.

**Auto:** LinkedIn/Buffer, Bluesky, Dev.to (EN oder DE Tag).  
**Manual:** SO-DE Antworten, Xing, DE Dev Discords (nur bei Relevanz).

---

### fr · Français

**Short**

Les LLM écrivent du Mermaid/PlantUML. Ils ne le prévisualisent pas.

DiagramPreview : coller → prévisualiser → corriger → exporter SVG/PNG.

https://diagrampreview.com/fr

Sans compte. Vos retours sont les bienvenus.

**Medium**

Pour les README et specs, je demande souvent à une IA de générer des diagrammes. Il manque ensuite la prévisualisation fiable et l’export.

J’ai créé DiagramPreview pour cette étape :

https://diagrampreview.com/fr

Mermaid, PlantUML, OpenAPI, SQL ER, Docker Compose, Kubernetes, JSON/YAML, etc. Quels formats ajouter ensuite ?

**Long title options**

- L’IA écrit du Mermaid. Il vous faut encore un aperçu
- Du texte généré au diagramme prêt pour la doc
- Une boîte à outils sans compte pour prévisualiser vos diagrammes

**Long body**

Les modèles génèrent vite du Mermaid, PlantUML, des flux OpenAPI ou des manifests DevOps. En général, ils s’arrêtent au texte.

Avant d’intégrer ça dans un README, il faut prévisualiser, corriger la syntaxe, puis exporter.

C’est le rôle de DiagramPreview :

https://diagrampreview.com/fr

![Mermaid Preview](https://diagrampreview.com/marketing/images/desktop-mermaid-preview.png)

Parcours : générer → coller → prévisualiser/corriger → exporter.

Sans inscription. Ne collez pas de secrets dans les outils IA. Dites-moi quels formats vous manquent.

**Auto:** Bluesky, LinkedIn, Dev.to `#french`.  
**Manual:** Developpez.com, LinuxFr, SO-FR.

---

### es · Español

**Short**

Los LLM escriben Mermaid/PlantUML rápido. No los previsualizan.

DiagramPreview: pegar → previsualizar → corregir → exportar SVG/PNG.

https://diagrampreview.com/es

Sin registro. Se agradece el feedback.

**Medium**

Al documentar, pedimos a la IA diagramas en texto. Falta validar el render y exportar.

DiagramPreview cubre ese paso intermedio:

https://diagrampreview.com/es

Soporta Mermaid, PlantUML, OpenAPI, SQL ER, Compose, Kubernetes, JSON/YAML, etc. ¿Qué formatos añadiréis?

**Long title options**

- La IA escribe Mermaid; tus docs aún necesitan vista previa
- Del texto generado al diagrama listo para el README
- Caja de herramientas sin cuenta para previsualizar diagramas

**Long body**

Los modelos generan bien Mermaid, PlantUML, flujos OpenAPI y manifests. Suelen quedarse en texto.

Antes del README hace falta previsualizar, corregir y exportar.

Eso es DiagramPreview:

https://diagrampreview.com/es

![Mermaid Preview](https://diagrampreview.com/marketing/images/desktop-mermaid-preview.png)

Flujo: generar → pegar → previsualizar/corregir → exportar.

Sin cuenta. No peguéis secretos en funciones de IA. Feedback de formatos bienvenido.

**Auto:** Bluesky, LinkedIn, Dev.to `#spanish`.  
**Manual:** SO-ES, r/programacion, Platzi (si aplica).

---

### pt · Português (Brasil)

**Short**

LLMs escrevem Mermaid/PlantUML rápido. Não fazem preview.

DiagramPreview: colar → preview → corrigir → exportar SVG/PNG.

https://diagrampreview.com/pt

Sem login. Feedback bem-vindo.

**Medium**

Em README e RFCs, peço diagramas à IA o tempo todo. O buraco é validar o render e exportar.

Criei o DiagramPreview pra essa etapa:

https://diagrampreview.com/pt

Mermaid, PlantUML, OpenAPI, SQL ER, Compose, Kubernetes, JSON/YAML e mais. Quais formatos vocês querem depois?

**Long title options**

- A IA escreve Mermaid; sua doc ainda precisa de preview
- Do texto gerado ao diagrama pronto para o README
- Ferramenta sem login para pré-visualizar diagramas técnicos

**Long body**

Modelos geram bem Mermaid, PlantUML, fluxos OpenAPI e manifests. Em geral param no texto.

Antes do README: preview, correção de sintaxe, export.

É isso que o DiagramPreview faz:

https://diagrampreview.com/pt

![Mermaid Preview](https://diagrampreview.com/marketing/images/desktop-mermaid-preview.png)

Fluxo: gerar → colar → preview/corrigir → exportar.

Sem conta. Não cole segredos nas funções de IA. Manda feedback dos formatos que faltam.

**Auto:** Bluesky, LinkedIn.  
**Manual:** TabNews, r/brdev, SO-PT, Velog-style blogs BR.

---

### ru · Русский

**Short**

LLM быстро пишет Mermaid/PlantUML, но не делает preview.

DiagramPreview: вставить → посмотреть → поправить → экспорт SVG/PNG.

https://diagrampreview.com/ru

Без регистрации. Буду рад фидбеку.

**Medium**

Для README и дизайн-доков ИИ часто отдаёт текст диаграмм. Дальше всё равно нужны проверка рендера и экспорт.

Для этого шага сделал DiagramPreview:

https://diagrampreview.com/ru

Mermaid, PlantUML, OpenAPI, SQL ER, Compose, Kubernetes, JSON/YAML и др. Какие форматы добавить дальше?

**Long title options**

- ИИ пишет Mermaid — документации всё ещё нужен preview
- От сгенерированного текста к SVG/PNG для README
- Браузерный инструмент для превью AI-диаграмм без регистрации

**Long body**

Модели хорошо черновикают Mermaid, PlantUML, OpenAPI-потоки и DevOps-манифесты. Обычно останавливаются на тексте.

Перед README нужны preview, правка синтаксиса и экспорт.

Этим занимается DiagramPreview:

https://diagrampreview.com/ru

![Mermaid Preview](https://diagrampreview.com/marketing/images/desktop-mermaid-preview.png)

Сценарий: сгенерировать → вставить → preview/fix → экспортировать.

Без аккаунта. Секреты в AI-функции не вставляйте. Напишите, каких форматов не хватает.

**Auto:** Telegram (свой канал), Bluesky.  
**Manual:** Habr (главный), SO-RU, VC.ru.

---

## 4. Suggested auto-publish order (safe)

| Day | Auto | Manual |
| --- | --- | --- |
| 1 | Dev.to (EN long) + Bluesky EN/ZH short | V2EX short/medium |
| 2 | Hashnode (EN long) + Mastodon | 掘金 long |
| 3 | LinkedIn EN via Buffer | Zenn JA long |
| 4 | Bluesky JA/KO shorts | Qiita JA medium |
| 5 | Dev.to DE or FR long (localized) | Velog KO long |
| 6 | Bluesky ES/PT/RU shorts | TabNews PT medium |
| 7 | Newsletter tip (if any) | Habr RU long |

---

## 5. Optional next step

If you want real automation next, the highest-ROI scripts are:

1. `scripts/publish-devto.mjs` — publish EN/ localized articles via Dev.to API  
2. `scripts/publish-bluesky.mjs` — post Short variants  
3. A Buffer/Typefully CSV export of all Short posts for scheduling  

Say which of these you want implemented, and provide API tokens only via env vars (never commit them).

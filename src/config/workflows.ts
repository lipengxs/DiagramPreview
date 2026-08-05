import type {ToolSlug} from "./tools";

export type WorkflowSlug =
  | "ai-generated-mermaid-workflow"
  | "open-drawio-file-online"
  | "api-debugging-sequence-diagram"
  | "schema-visualization-workflow"
  | "mermaid-to-drawio-documentation-workflow"
  | "devops-config-visualization-workflow"
  | "technical-publishing-preview-workflow";

export type WorkflowConfig = {
  slug: WorkflowSlug;
  title: string;
  description: string;
  keywords: string[];
  tools: ToolSlug[];
  example: {
    title: string;
    description: string;
    tool: ToolSlug;
    source: string;
  };
  steps: Array<{title: string; body: string}>;
  faq: Array<{question: string; answer: string}>;
};

export const workflows: WorkflowConfig[] = [
  {
    slug: "ai-generated-mermaid-workflow",
    title: "AI-generated Mermaid workflow",
    description: "Generate, preview, fix, and export Mermaid diagrams before they go into README files or architecture docs.",
    keywords: ["ai generated mermaid", "mermaid workflow", "preview mermaid from chatgpt"],
    tools: ["text-to-mermaid", "mermaid-preview", "mermaid-ai-fixer", "mermaid-to-drawio", "drawio-preview"],
    example: {
      title: "Next.js AI diagram prompt",
      description: "Use this prompt to generate a Mermaid architecture diagram for a browser, API route, AI provider, renderer, and export flow.",
      tool: "text-to-mermaid",
      source: "Browser sends diagram text to a Next.js API route. The API route calls an AI provider and returns Mermaid code. The browser renders the diagram as SVG, then lets the user export SVG, PNG, or Markdown source."
    },
    steps: [
      {title: "Generate a small first draft", body: "Start with a short prompt and ask for one Mermaid diagram type instead of a full system map."},
      {title: "Preview the Mermaid source", body: "Paste the generated code into Mermaid Preview and check syntax, labels, direction, and readability."},
      {title: "Fix and export", body: "Use Mermaid AI Fixer for broken syntax, then export SVG or PNG only after the source remains reviewable."}
    ],
    faq: [
      {
        question: "Should I start with AI or write Mermaid manually?",
        answer: "Start with AI when the flow is still rough, then review the Mermaid source manually before exporting. That keeps the diagram easy to edit later."
      },
      {
        question: "What makes an AI-generated Mermaid diagram publishable?",
        answer: "It should use one clear diagram type, short labels, stable node names, and Mermaid source that can be previewed without syntax fixes."
      }
    ]
  },
  {
    slug: "open-drawio-file-online",
    title: "Open draw.io file online",
    description: "Inspect diagrams.net XML, check pages and objects, then convert or export draw.io files for documentation.",
    keywords: ["open drawio file online", "draw.io viewer", "diagrams.net xml preview"],
    tools: ["drawio-preview", "mermaid-to-drawio", "plantuml-to-drawio", "drawio-to-svg", "ai-drawio-generator"],
    example: {
      title: "Minimal diagrams.net XML",
      description: "Open a tiny draw.io XML document first to confirm preview, page detection, and conversion behavior.",
      tool: "drawio-preview",
      source: "<mxfile host=\"DiagramPreview\"><diagram name=\"System\"><mxGraphModel><root><mxCell id=\"0\"/><mxCell id=\"1\" parent=\"0\"/></root></mxGraphModel></diagram></mxfile>"
    },
    steps: [
      {title: "Open the XML safely", body: "Paste .drawio XML first to check whether the file is complete and whether page names are meaningful."},
      {title: "Review portability", body: "Look for hidden draft content, external images, oversized labels, and pages that should be split before sharing."},
      {title: "Convert when needed", body: "Use PlantUML to draw.io or Draw.io to SVG when the diagram needs to move between editable and publishable formats."}
    ],
    faq: [
      {
        question: "Can I inspect draw.io XML before sharing it?",
        answer: "Yes. Preview the XML first to confirm the diagram opens, check page names, and catch hidden draft content before sending it to teammates."
      },
      {
        question: "When should I convert draw.io to SVG?",
        answer: "Convert to SVG when the diagram is ready for documentation, issue comments, or a README where an editable draw.io file is not needed."
      }
    ]
  },
  {
    slug: "mermaid-to-drawio-documentation-workflow",
    title: "Mermaid to draw.io documentation workflow",
    description: "Review Mermaid source from AI or docs, convert it to editable draw.io XML, then export stable assets for technical documentation.",
    keywords: ["mermaid to drawio workflow", "convert mermaid to draw.io documentation", "editable diagram docs"],
    tools: ["mermaid-preview", "mermaid-ai-fixer", "mermaid-to-drawio", "drawio-preview", "drawio-to-svg"],
    example: {
      title: "Editable architecture handoff",
      description: "Use a small Mermaid flow to check labels, convert to draw.io, then preview the editable XML before publishing.",
      tool: "mermaid-to-drawio",
      source: "flowchart LR\n  Product[Product spec] --> AI[AI Mermaid draft]\n  AI --> Preview[Preview and fix]\n  Preview --> Drawio[Editable draw.io]\n  Drawio --> Docs[README and architecture docs]"
    },
    steps: [
      {title: "Preview before converting", body: "Render Mermaid first so syntax errors, long labels, and unreadable layout are fixed while the source is still easy to edit."},
      {title: "Convert to editable draw.io", body: "Use Mermaid to draw.io when teammates need to adjust spacing, grouping, or annotations in diagrams.net."},
      {title: "Export the final asset", body: "Preview the draw.io XML, then export SVG or PNG for README files, PR descriptions, and design handoff notes."}
    ],
    faq: [
      {
        question: "Why not paste AI Mermaid directly into docs?",
        answer: "AI Mermaid often needs syntax cleanup and label review. Previewing first prevents broken diagrams from reaching a README or architecture page."
      },
      {
        question: "When is draw.io better than Mermaid?",
        answer: "Use draw.io when non-code teammates need editable diagrams, precise layout, or visual annotations beyond simple Mermaid source."
      }
    ]
  },
  {
    slug: "api-debugging-sequence-diagram",
    title: "API debugging to sequence diagram",
    description: "Turn OpenAPI paths, Postman collections, HAR traffic, and error notes into sequence diagrams for backend review.",
    keywords: ["api debugging sequence diagram", "openapi to sequence diagram", "har to sequence diagram"],
    tools: ["openapi-to-sequence", "postman-collection-sequence-diagram", "har-file-sequence-diagram", "api-error-flow-diagram"],
    example: {
      title: "Checkout OpenAPI path",
      description: "Start from a narrow OpenAPI path group so the sequence diagram explains one request path and its failure response.",
      tool: "openapi-to-sequence",
      source: "openapi: 3.0.0\npaths:\n  /checkout:\n    post:\n      summary: Create checkout session\n      responses:\n        \"201\":\n          description: Checkout created\n        \"402\":\n          description: Payment required\n  /checkout/{id}:\n    get:\n      summary: Read checkout status\n      responses:\n        \"200\":\n          description: Checkout status"
    },
    steps: [
      {title: "Start from the contract", body: "Use a focused OpenAPI path group so the diagram explains one workflow instead of the entire API."},
      {title: "Compare request order", body: "Preview Postman or HAR traffic to see whether runtime calls match the documented sequence."},
      {title: "Document the failure path", body: "Add error responses, retries, and timeout behavior so incident notes explain what actually happened."}
    ],
    faq: [
      {
        question: "Why use a sequence diagram for API debugging?",
        answer: "A sequence diagram makes request order, actors, retries, and failure responses visible, which is often faster than reading logs line by line."
      },
      {
        question: "Should the diagram include every endpoint?",
        answer: "No. Use one user journey, incident, or API path group per diagram so reviewers can see cause and effect clearly."
      }
    ]
  },
  {
    slug: "schema-visualization-workflow",
    title: "Schema visualization workflow",
    description: "Review JSON Schema, Protobuf, GraphQL, SQL, and DBML contracts visually before publishing API docs.",
    keywords: ["schema visualization workflow", "json schema visualizer", "protobuf schema visualizer"],
    tools: ["json-schema-visualizer", "json-schema-form-preview", "protobuf-schema-visualizer", "graphql-schema-visualizer", "sql-to-er-diagram", "dbml-to-er-diagram"],
    example: {
      title: "Plan contract JSON Schema",
      description: "Preview required fields, enum values, and flexible metadata before putting a JSON Schema into docs.",
      tool: "json-schema-visualizer",
      source: "{\n  \"type\": \"object\",\n  \"required\": [\"email\", \"plan\"],\n  \"properties\": {\n    \"email\": {\"type\": \"string\", \"format\": \"email\"},\n    \"plan\": {\"type\": \"string\", \"enum\": [\"free\", \"pro\"]},\n    \"metadata\": {\"type\": \"object\", \"additionalProperties\": true}\n  }\n}"
    },
    steps: [
      {title: "Preview the contract shape", body: "Use a visual map to inspect required fields, nested objects, enums, and references."},
      {title: "Check breaking-change risk", body: "Compare relationships, field numbers, nullable fields, and foreign keys before the schema becomes documentation."},
      {title: "Link the right tool", body: "Keep each workflow tied to its source format so future readers can edit the original contract."}
    ],
    faq: [
      {
        question: "Which schema formats are worth visualizing?",
        answer: "Visualize schemas with nested objects, references, relationships, enums, or database links. Flat request objects usually do not need a diagram."
      },
      {
        question: "How does schema visualization help SEO content?",
        answer: "It turns an abstract converter page into a concrete documentation workflow with examples, internal links, and intent-matched explanations."
      }
    ]
  },
  {
    slug: "devops-config-visualization-workflow",
    title: "DevOps config visualization workflow",
    description: "Preview Docker, Kubernetes, Nginx, GitHub Actions, Helm, and Terraform sources as reviewable infrastructure diagrams.",
    keywords: ["devops config visualization", "kubernetes manifest diagram", "github actions workflow diagram", "terraform architecture diagram"],
    tools: ["docker-compose-diagram", "kubernetes-manifest-visualizer", "github-actions-workflow-diagram", "helm-values-visualizer", "nginx-config-visualizer", "terraform-architecture-diagram"],
    example: {
      title: "Docker Compose service map",
      description: "Start from a Compose file to expose service dependencies, ports, and data stores before deployment review.",
      tool: "docker-compose-diagram",
      source: "services:\n  web:\n    image: app:latest\n    ports:\n      - \"3000:3000\"\n    depends_on:\n      - api\n  api:\n    image: api:latest\n    environment:\n      DATABASE_URL: postgres://db/app\n    depends_on:\n      - db\n  db:\n    image: postgres:16"
    },
    steps: [
      {title: "Visualize dependency shape", body: "Turn config files into a map that shows services, ports, jobs, ingress rules, and infrastructure links."},
      {title: "Review operational risk", body: "Check whether hidden dependencies, missing health checks, exposed ports, or routing rules need to be documented."},
      {title: "Publish the review artifact", body: "Export a diagram for PR review, runbooks, onboarding docs, or incident follow-up notes."}
    ],
    faq: [
      {
        question: "Which DevOps files should become diagrams?",
        answer: "Diagram configs with multiple services, jobs, routing rules, cloud resources, or deployment dependencies. Single-purpose snippets usually need only code review."
      },
      {
        question: "Does this replace infrastructure-as-code review?",
        answer: "No. It gives reviewers a visual map so they can ask better questions while still reviewing the original source."
      }
    ]
  },
  {
    slug: "technical-publishing-preview-workflow",
    title: "Technical publishing preview workflow",
    description: "Preview Markdown, SVG, Open Graph, draw.io, and generated diagrams before publishing technical content.",
    keywords: ["technical publishing preview", "markdown diagram preview", "readme diagram workflow", "open graph preview debugger"],
    tools: ["markdown-preview", "mermaid-preview", "drawio-preview", "svg-code-preview-editor", "open-graph-preview-debugger", "drawio-to-svg"],
    example: {
      title: "README release checklist",
      description: "Preview release notes with embedded diagrams and social metadata before publishing a technical page.",
      tool: "markdown-preview",
      source: "# Release architecture\n\n```mermaid\nsequenceDiagram\n  participant User\n  participant Web\n  participant API\n  User->>Web: Open preview\n  Web->>API: Load exported diagram\n  API-->>Web: SVG asset\n```\n\nShare the updated architecture in README, docs, and release notes."
    },
    steps: [
      {title: "Preview the document body", body: "Render Markdown and diagram snippets locally so headings, code fences, and embedded diagrams are readable."},
      {title: "Check visual assets", body: "Inspect SVG and draw.io exports before they are committed to documentation or attached to a PR."},
      {title: "Debug publishing metadata", body: "Use Open Graph preview checks so shared technical pages show the right title, description, and image."}
    ],
    faq: [
      {
        question: "What should be checked before publishing diagram-heavy docs?",
        answer: "Check rendered Markdown, diagram syntax, exported asset readability, file format portability, and social preview metadata."
      },
      {
        question: "Why keep preview tools in the publishing workflow?",
        answer: "They catch broken code fences, oversized diagrams, missing metadata, and unreadable exports before readers or reviewers see them."
      }
    ]
  }
];

export function getWorkflow(slug: string) {
  return workflows.find((workflow) => workflow.slug === slug);
}

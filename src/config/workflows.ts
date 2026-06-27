import type {ToolSlug} from "./tools";

export type WorkflowSlug =
  | "ai-generated-mermaid-workflow"
  | "open-drawio-file-online"
  | "api-debugging-sequence-diagram"
  | "schema-visualization-workflow";

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
    tools: ["text-to-mermaid", "mermaid-preview", "mermaid-ai-fixer"],
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
    tools: ["drawio-preview", "ai-drawio-generator", "plantuml-to-drawio", "drawio-to-svg"],
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
    tools: ["json-schema-visualizer", "protobuf-schema-visualizer", "graphql-schema-visualizer", "sql-to-er-diagram", "dbml-to-er-diagram"],
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
  }
];

export function getWorkflow(slug: string) {
  return workflows.find((workflow) => workflow.slug === slug);
}

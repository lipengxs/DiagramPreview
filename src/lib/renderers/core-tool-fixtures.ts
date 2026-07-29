import type {ToolSlug} from "@/config/tools";

export type CoreRendererFixture = {
  toolSlug: ToolSlug;
  name: string;
  source: string;
  expected: string[];
};

export const coreRendererFixtures: CoreRendererFixture[] = [
  {
    toolSlug: "mermaid-to-drawio",
    name: "AI workflow handoff",
    source: "flowchart LR\n  prompt[AI prompt] --> preview[Preview Mermaid]\n  preview --> fix[Fix syntax]\n  fix --> drawio[Editable draw.io]\n  drawio --> docs[Docs export]",
    expected: ["AI prompt", "Preview Mermaid", "Editable draw.io"]
  },
  {
    toolSlug: "mermaid-to-drawio",
    name: "Sequence handoff",
    source: "sequenceDiagram\n  participant User\n  participant Web\n  participant API\n  User->>Web: Open preview\n  Web->>API: Convert\n  API-->>Web: draw.io XML",
    expected: ["User", "Web", "API"]
  },
  {
    toolSlug: "plantuml-to-drawio",
    name: "API sequence",
    source: "@startuml\nactor User\nparticipant Web\nparticipant API\ndatabase DB\nUser -> Web: Submit order\nWeb -> API: POST /orders\nAPI -> DB: Insert order\nDB --> API: order id\nAPI --> Web: 201 Created\n@enduml",
    expected: ["User", "Web", "API", "DB"]
  },
  {
    toolSlug: "plantuml-to-drawio",
    name: "Component relation",
    source: "@startuml\ncomponent \"Web App\" as Web\ncomponent \"API Service\" as API\ndatabase \"Orders DB\" as DB\nWeb --> API: HTTPS\nAPI --> DB: SQL\n@enduml",
    expected: ["Web App", "API Service", "Orders DB"]
  },
  {
    toolSlug: "openapi-to-sequence",
    name: "Checkout success and errors",
    source: "openapi: 3.0.0\npaths:\n  /checkout:\n    post:\n      tags: [checkout]\n      operationId: createCheckout\n      security:\n        - bearerAuth: []\n      requestBody:\n        content:\n          application/json:\n            schema:\n              $ref: '#/components/schemas/CheckoutRequest'\n      responses:\n        '201':\n          description: Checkout created\n          content:\n            application/json:\n              schema:\n                $ref: '#/components/schemas/CheckoutResponse'\n        '402':\n          description: Payment required\n        '500':\n          description: Provider timeout\ncomponents:\n  schemas:\n    CheckoutRequest:\n      type: object\n    CheckoutResponse:\n      type: object",
    expected: ["createCheckout", "CheckoutRequest", "402", "500"]
  },
  {
    toolSlug: "json-schema-form-preview",
    name: "Nested checkout form",
    source: "{\n  \"title\": \"Checkout\",\n  \"type\": \"object\",\n  \"required\": [\"email\", \"billingAddress\"],\n  \"properties\": {\n    \"email\": {\"type\": \"string\", \"format\": \"email\"},\n    \"items\": {\"type\": \"array\", \"items\": {\"type\": \"object\", \"properties\": {\"sku\": {\"type\": \"string\"}, \"quantity\": {\"type\": \"integer\", \"default\": 1}}}},\n    \"billingAddress\": {\"type\": \"object\", \"properties\": {\"country\": {\"type\": \"string\", \"enum\": [\"US\", \"DE\"]}, \"postalCode\": {\"type\": \"string\"}}}\n  }\n}",
    expected: ["billingAddress", "items", "country"]
  }
];

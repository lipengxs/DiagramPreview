import type {ToolSlug} from "./tools";

export type TemplateCategory = "mermaid" | "drawio" | "api" | "schema" | "devops";

export type TemplateConfig = {
  slug: string;
  category: TemplateCategory;
  tool: ToolSlug;
  title: string;
  description: string;
  source: string;
};

export const templateCategories: Array<{id: TemplateCategory; title: string; description: string}> = [
  {
    id: "mermaid",
    title: "Mermaid documentation templates",
    description: "Paste-ready Mermaid diagrams for README, incidents, product flows, and architecture notes."
  },
  {
    id: "drawio",
    title: "Draw.io review templates",
    description: "Small diagrams.net XML examples for opening, checking, and converting draw.io files."
  },
  {
    id: "api",
    title: "API debugging templates",
    description: "OpenAPI, Postman, HAR, and error-flow inputs for sequence diagram review."
  },
  {
    id: "schema",
    title: "Schema visualization templates",
    description: "JSON Schema, Protobuf, GraphQL, SQL, and DBML examples for contract review."
  },
  {
    id: "devops",
    title: "DevOps diagram templates",
    description: "Docker Compose, Kubernetes, Terraform, and CI/CD examples for infrastructure docs."
  }
];

export const templates: TemplateConfig[] = [
  {
    slug: "readme-service-flow",
    category: "mermaid",
    tool: "mermaid-preview",
    title: "README service flow",
    description: "A compact service flow diagram for project README files.",
    source: "flowchart LR\n  user[User] --> web[Web app]\n  web --> api[API gateway]\n  api --> auth[Auth service]\n  api --> orders[Order service]\n  orders --> db[(PostgreSQL)]"
  },
  {
    slug: "incident-sequence",
    category: "mermaid",
    tool: "mermaid-preview",
    title: "Incident sequence diagram",
    description: "A sequence diagram for incident notes and recovery timelines.",
    source: "sequenceDiagram\n  participant User\n  participant Web\n  participant API\n  participant Worker\n  User->>Web: Submit checkout\n  Web->>API: POST /checkout\n  API->>Worker: enqueue order.created\n  API-->>Web: 503 timeout\n  Worker-->>API: recovered after scale out"
  },
  {
    slug: "text-to-mermaid-architecture-prompt",
    category: "mermaid",
    tool: "text-to-mermaid",
    title: "Text to Mermaid architecture prompt",
    description: "Plain text prompt for generating an architecture diagram.",
    source: "Browser sends diagram text to a Next.js API route. The API calls an AI provider, returns Mermaid code, and the browser renders SVG. Exports include SVG, PNG, and Markdown source."
  },
  {
    slug: "minimal-drawio-xml",
    category: "drawio",
    tool: "drawio-preview",
    title: "Minimal draw.io XML",
    description: "A tiny diagrams.net XML file for testing draw.io preview and portability.",
    source: "<mxfile host=\"DiagramPreview\"><diagram name=\"System\"><mxGraphModel><root><mxCell id=\"0\"/><mxCell id=\"1\" parent=\"0\"/></root></mxGraphModel></diagram></mxfile>"
  },
  {
    slug: "plantuml-to-drawio-login",
    category: "drawio",
    tool: "plantuml-to-drawio",
    title: "PlantUML login flow to draw.io",
    description: "Convert a small PlantUML login sequence into an editable draw.io file.",
    source: "@startuml\nactor User\nparticipant Web\nparticipant Auth\nUser -> Web: submit credentials\nWeb -> Auth: verify password\nAuth --> Web: token\nWeb --> User: signed in\n@enduml"
  },
  {
    slug: "openapi-checkout-flow",
    category: "api",
    tool: "openapi-to-sequence",
    title: "OpenAPI checkout flow",
    description: "Focused OpenAPI paths for turning checkout behavior into a sequence diagram.",
    source: "openapi: 3.0.0\npaths:\n  /checkout:\n    post:\n      summary: Create checkout session\n      responses:\n        \"201\":\n          description: Checkout created\n        \"402\":\n          description: Payment required"
  },
  {
    slug: "postman-request-order",
    category: "api",
    tool: "postman-collection-sequence-diagram",
    title: "Postman request order",
    description: "A small Postman collection for checking API request order.",
    source: "{\"item\":[{\"name\":\"Login\",\"request\":{\"method\":\"POST\",\"url\":\"https://api.example.com/auth/login\"}},{\"name\":\"Create order\",\"request\":{\"method\":\"POST\",\"url\":\"https://api.example.com/orders\"}}]}"
  },
  {
    slug: "json-schema-plan",
    category: "schema",
    tool: "json-schema-visualizer",
    title: "JSON Schema plan contract",
    description: "A request schema with required fields, enum values, and metadata.",
    source: "{\n  \"type\": \"object\",\n  \"required\": [\"email\", \"plan\"],\n  \"properties\": {\n    \"email\": {\"type\": \"string\", \"format\": \"email\"},\n    \"plan\": {\"type\": \"string\", \"enum\": [\"free\", \"pro\"]},\n    \"metadata\": {\"type\": \"object\", \"additionalProperties\": true}\n  }\n}"
  },
  {
    slug: "protobuf-order-schema",
    category: "schema",
    tool: "protobuf-schema-visualizer",
    title: "Protobuf order schema",
    description: "Protobuf messages with repeated references for schema visualization.",
    source: "syntax = \"proto3\";\nmessage Order {\n  string id = 1;\n  repeated OrderItem items = 2;\n  OrderStatus status = 3;\n}\nmessage OrderItem { string sku = 1; int32 qty = 2; }\nenum OrderStatus { ORDER_STATUS_UNKNOWN = 0; PAID = 1; }"
  },
  {
    slug: "sql-orders-er",
    category: "schema",
    tool: "sql-to-er-diagram",
    title: "SQL orders ER diagram",
    description: "CREATE TABLE statements for previewing an order relationship diagram.",
    source: "CREATE TABLE users (id INT PRIMARY KEY, email TEXT);\nCREATE TABLE orders (id INT PRIMARY KEY, user_id INT REFERENCES users(id), total DECIMAL);\nCREATE TABLE order_items (id INT PRIMARY KEY, order_id INT REFERENCES orders(id), sku TEXT, qty INT);"
  },
  {
    slug: "docker-compose-web-api",
    category: "devops",
    tool: "docker-compose-diagram",
    title: "Docker Compose web and API",
    description: "A service topology template for Docker Compose architecture docs.",
    source: "services:\n  web:\n    image: example/web:1.0\n    depends_on: [api]\n  api:\n    image: example/api:1.0\n    depends_on: [db, redis]\n  db:\n    image: postgres:16\n  redis:\n    image: redis:7"
  },
  {
    slug: "kubernetes-service",
    category: "devops",
    tool: "kubernetes-manifest-visualizer",
    title: "Kubernetes service manifest",
    description: "A small Kubernetes manifest for configuration review.",
    source: "apiVersion: v1\nkind: Service\nmetadata:\n  name: diagram-preview\nspec:\n  selector:\n    app: diagram-preview\n  ports:\n    - port: 80\n      targetPort: 3000"
  }
];

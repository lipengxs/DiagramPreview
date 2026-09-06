# Schema visualization workflow fixture

## Before

Open `input.json` in [JSON Schema Visualizer](https://diagrampreview.com/en/json-schema-visualizer), then use [JSON Schema Form Preview](https://diagrampreview.com/en/json-schema-form-preview) to inspect the generated field experience.

## Expected result

The visualizer should expose required fields, enums, the default plan, and the nested members array. The form preview should make required inputs and enum choices understandable without turning the schema into a production form.

## Failure cases

- Missing titles and descriptions that leave generated fields ambiguous.
- Deep unrelated objects forced into one diagram.
- Unresolved remote references.
- Assuming visual review replaces schema validation or contract tests.

## README handoff

Keep the JSON Schema as the source of truth. Export a diagram for API or SDK documentation and include a form screenshot only when it helps product reviewers understand field behavior.

Related contract view: [Protobuf Schema Visualizer](https://diagrampreview.com/en/protobuf-schema-visualizer).

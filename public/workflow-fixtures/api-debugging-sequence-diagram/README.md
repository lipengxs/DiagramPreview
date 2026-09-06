# API debugging sequence fixture

## Before

Open `input.yaml` with [OpenAPI to Sequence](https://diagrampreview.com/en/openapi-to-sequence). The fixture contains one operation, a request body, and success, authentication, business, and timeout responses.

## Expected result

The sequence should identify the checkout operation and keep the 201, 401, 402, and 504 outcomes visible. Continue in [API Error Flow Diagram](https://diagrampreview.com/en/api-error-flow-diagram) to document retry and stop conditions.

## Failure cases

- Passing an entire large specification instead of one user journey.
- Missing `operationId`, tags, or error responses.
- Treating 402 and 504 as the same retry decision.
- Publishing a contract diagram without comparing it to HAR data, logs, or traces.

## README handoff

Embed the exported sequence diagram beside the relevant OpenAPI path. Link the original specification and document whether each failure is retryable, user-actionable, or terminal.

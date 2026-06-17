import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("json-schema-form-preview");

export default function JsonSchemaFormPreviewPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="json-schema-form-preview" />;
}

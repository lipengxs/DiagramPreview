import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("json-schema-visualizer");

export default function JsonSchemaVisualizerPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="json-schema-visualizer" />;
}

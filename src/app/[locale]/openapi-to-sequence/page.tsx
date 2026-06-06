import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("openapi-to-sequence");

export default function OpenApiToSequencePage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="openapi-to-sequence" />;
}

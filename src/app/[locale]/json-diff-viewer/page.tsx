import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("json-diff-viewer");

export default function JsonDiffViewerPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="json-diff-viewer" />;
}

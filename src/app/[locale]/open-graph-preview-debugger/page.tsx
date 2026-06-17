import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("open-graph-preview-debugger");

export default function OpenGraphPreviewDebuggerPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="open-graph-preview-debugger" />;
}

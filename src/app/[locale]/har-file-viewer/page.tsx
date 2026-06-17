import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("har-file-viewer");

export default function HarFileViewerPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="har-file-viewer" />;
}

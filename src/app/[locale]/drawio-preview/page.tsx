import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("drawio-preview");

export default function DrawioPreviewPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="drawio-preview" />;
}

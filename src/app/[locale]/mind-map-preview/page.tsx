import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("mind-map-preview");

export default function MindMapPreviewPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="mind-map-preview" />;
}

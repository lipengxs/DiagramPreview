import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("graphviz-preview");

export default function GraphvizPreviewPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="graphviz-preview" />;
}

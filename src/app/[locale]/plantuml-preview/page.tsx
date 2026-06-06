import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("plantuml-preview");

export default function PlantumlPreviewPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="plantuml-preview" />;
}

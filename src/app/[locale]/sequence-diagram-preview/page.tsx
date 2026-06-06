import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("sequence-diagram-preview");

export default function SequenceDiagramPreviewPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="sequence-diagram-preview" />;
}

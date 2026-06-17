import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("svg-code-preview-editor");

export default function SvgCodePreviewEditorPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="svg-code-preview-editor" />;
}

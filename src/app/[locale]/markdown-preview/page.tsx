import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("markdown-preview");

export default function MarkdownPreviewPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="markdown-preview" />;
}

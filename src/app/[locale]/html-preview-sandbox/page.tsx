import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("html-preview-sandbox");

export default function HtmlPreviewSandboxPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="html-preview-sandbox" />;
}

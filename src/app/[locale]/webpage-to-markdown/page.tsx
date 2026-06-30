import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("webpage-to-markdown");

export default function WebpageToMarkdownPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="webpage-to-markdown" />;
}

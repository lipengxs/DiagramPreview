import {ToolPage, createToolMetadata, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("mermaid-to-drawio");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="mermaid-to-drawio" />;
}

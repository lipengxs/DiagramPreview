import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("api-error-flow-diagram");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="api-error-flow-diagram" />;
}

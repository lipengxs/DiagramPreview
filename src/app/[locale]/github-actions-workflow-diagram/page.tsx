import {ToolPage, createToolMetadata, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("github-actions-workflow-diagram");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="github-actions-workflow-diagram" />;
}

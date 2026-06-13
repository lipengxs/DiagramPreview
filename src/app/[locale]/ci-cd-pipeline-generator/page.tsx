import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("ci-cd-pipeline-generator");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="ci-cd-pipeline-generator" />;
}

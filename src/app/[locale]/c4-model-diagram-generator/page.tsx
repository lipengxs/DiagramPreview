import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("c4-model-diagram-generator");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="c4-model-diagram-generator" />;
}

import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("cloudformation-template-diagram");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="cloudformation-template-diagram" />;
}

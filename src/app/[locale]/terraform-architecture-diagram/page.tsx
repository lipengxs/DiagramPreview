import {ToolPage, createToolMetadata, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("terraform-architecture-diagram");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="terraform-architecture-diagram" />;
}

import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("jwt-decoder-diagram");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="jwt-decoder-diagram" />;
}

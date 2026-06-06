import {ToolPage, createToolMetadata, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("dbml-to-er-diagram");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="dbml-to-er-diagram" />;
}

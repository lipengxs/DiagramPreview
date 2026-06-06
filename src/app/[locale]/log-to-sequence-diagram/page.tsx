import {ToolPage, createToolMetadata, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("log-to-sequence-diagram");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="log-to-sequence-diagram" />;
}

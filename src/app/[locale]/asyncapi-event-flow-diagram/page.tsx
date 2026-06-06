import {ToolPage, createToolMetadata, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("asyncapi-event-flow-diagram");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="asyncapi-event-flow-diagram" />;
}

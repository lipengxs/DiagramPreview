import {ToolPage, createToolMetadata, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("graphql-schema-visualizer");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="graphql-schema-visualizer" />;
}

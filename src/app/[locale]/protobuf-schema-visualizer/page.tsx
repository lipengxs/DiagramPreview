import {ToolPage, createToolMetadata, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("protobuf-schema-visualizer");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="protobuf-schema-visualizer" />;
}

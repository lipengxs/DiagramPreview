import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("zod-schema-visualizer");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="zod-schema-visualizer" />;
}

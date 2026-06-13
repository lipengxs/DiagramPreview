import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("cron-expression-visualizer");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="cron-expression-visualizer" />;
}

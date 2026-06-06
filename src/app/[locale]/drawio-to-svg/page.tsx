import {ToolPage, createToolMetadata, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("drawio-to-svg");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="drawio-to-svg" />;
}

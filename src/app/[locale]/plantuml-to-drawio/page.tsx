import {ToolPage, createToolMetadata, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("plantuml-to-drawio");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="plantuml-to-drawio" />;
}

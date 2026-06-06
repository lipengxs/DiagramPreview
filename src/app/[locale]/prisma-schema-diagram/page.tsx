import {ToolPage, createToolMetadata, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("prisma-schema-diagram");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="prisma-schema-diagram" />;
}

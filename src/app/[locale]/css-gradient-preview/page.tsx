import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("css-gradient-preview");

export default function CssGradientPreviewPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="css-gradient-preview" />;
}

import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("css-box-shadow-preview");

export default function CssBoxShadowPreviewPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="css-box-shadow-preview" />;
}

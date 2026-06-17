import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("sitemap-xml-viewer");

export default function SitemapXmlViewerPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="sitemap-xml-viewer" />;
}

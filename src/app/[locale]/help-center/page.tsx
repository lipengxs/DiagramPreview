import {createStaticPageMetadata, StaticPage, type StaticRouteProps} from "../static-page";

export const generateMetadata = createStaticPageMetadata("help-center");

export default function HelpCenterPage(props: StaticRouteProps) {
  return <StaticPage {...props} slug="help-center" />;
}

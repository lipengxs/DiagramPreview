import {createStaticPageMetadata, StaticPage, type StaticRouteProps} from "../static-page";

export const generateMetadata = createStaticPageMetadata("about");

export default function AboutPage(props: StaticRouteProps) {
  return <StaticPage {...props} slug="about" />;
}

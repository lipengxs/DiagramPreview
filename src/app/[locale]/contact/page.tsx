import {createStaticPageMetadata, StaticPage, type StaticRouteProps} from "../static-page";

export const generateMetadata = createStaticPageMetadata("contact");

export default function ContactPage(props: StaticRouteProps) {
  return <StaticPage {...props} slug="contact" />;
}

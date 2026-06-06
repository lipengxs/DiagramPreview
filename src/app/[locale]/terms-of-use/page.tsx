import {createStaticPageMetadata, StaticPage, type StaticRouteProps} from "../static-page";

export const generateMetadata = createStaticPageMetadata("terms-of-use");

export default function TermsOfUsePage(props: StaticRouteProps) {
  return <StaticPage {...props} slug="terms-of-use" />;
}

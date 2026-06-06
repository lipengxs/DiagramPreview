import {createStaticPageMetadata, StaticPage, type StaticRouteProps} from "../static-page";

export const generateMetadata = createStaticPageMetadata("privacy-policy");

export default function PrivacyPolicyPage(props: StaticRouteProps) {
  return <StaticPage {...props} slug="privacy-policy" />;
}

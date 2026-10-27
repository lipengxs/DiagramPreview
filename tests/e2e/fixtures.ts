import {test as base} from "@playwright/test";

// Keep local regression runs out of the production analytics property.
// The application still writes its real gtag queue for event assertions.
export const test = base.extend({
  context: async ({context}, use) => {
    await context.route(/https:\/\/([^/]+\.)?(google-analytics\.com|googletagmanager\.com)\//, (route) => route.abort());
    await use(context);
  }
});
export {expect} from "@playwright/test";
export type {Page} from "@playwright/test";

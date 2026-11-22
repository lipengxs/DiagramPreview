import {getDesignSpecMessages} from "./design-spec-messages";

export function getDesignSpecGeneratorCopy(locale: string) {
  return getDesignSpecMessages(locale).generator;
}

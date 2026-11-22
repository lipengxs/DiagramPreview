import assert from "node:assert/strict";
import {test} from "node:test";
import {getDesignSpecMessages} from "../src/config/design-spec-messages";
import {locales} from "../src/config/locales";
import {readFileSync} from "node:fs";
import {designSpecSources} from "../src/config/design-spec-template";
import {createDesignSpecDraft, designSpecLanguage, generateDesignSpec} from "../src/lib/design-spec-generator";

test("specification drafts preserve the sample, apply edits, and keep missing rules unresolved", () => {
  for (const language of locales) {
    const copy = getDesignSpecMessages(language).generator;
    const draft = createDesignSpecDraft(designSpecSources[language]);
    assert.equal(draft.sections.length, 8);
    assert.equal(readFileSync(`public/templates/design-specs/workspace-settings.${language}.md`, "utf8"), designSpecSources[language]);
    assert.equal(generateDesignSpec(draft, copy), designSpecSources[language]);
    draft.title = " Billing\nsettings ";
    draft.sections[0].body = "Only owners may update billing.\nDo not store card numbers.";
    draft.sections[1].body = "  \n ";
    const result = generateDesignSpec(draft, copy);
    assert.ok(result.startsWith("# Billing settings\n"));
    assert.ok(result.includes(draft.sections[0].body));
    assert.ok(result.includes(copy.unresolved));
    assert.ok(!result.includes("#1D4ED8"));
    draft.title = " ";
    assert.ok(generateDesignSpec(draft, copy).startsWith(`# ${copy.untitled}\n`));
    assert.equal(generateDesignSpec(createDesignSpecDraft(designSpecSources[language]), copy), designSpecSources[language]);
  }
  assert.equal(designSpecLanguage("de"), "de");
  assert.equal(designSpecLanguage("unsupported"), "en");
});

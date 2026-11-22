import assert from "node:assert/strict";
import {test} from "node:test";
import {designSpecSources} from "../src/config/design-spec-template";
import {getDesignSpecMessages} from "../src/config/design-spec-messages";
import {locales} from "../src/config/locales";
import {reviewDesignSpec} from "../src/lib/design-spec-review";

test("spec review reports multilingual line evidence and gaps without treating examples or placeholders as requirements", () => {
  for (const language of locales) {
    const messages = getDesignSpecMessages(language);
    const sample = reviewDesignSpec(designSpecSources[language], messages);
    assert.deepEqual(sample.results.filter(({evidence}) => !evidence).map(({id}) => id), ["tokens"]);
    for (const {evidence} of sample.results) {
      if (evidence) assert.equal(evidence.original, designSpecSources[language].split("\n")[evidence.line - 1]);
    }
    for (const rule of messages.rules) {
      assert.ok(reviewDesignSpec(rule.suggestion, messages).results.find(({id}) => id === rule.id)?.evidence, `${language}: ${rule.id} suggestion must match`);
    }
    assert.ok(reviewDesignSpec(messages.generator.unresolved, messages).unresolved.length);
    for (const term of messages.unresolvedTerms) assert.ok(reviewDesignSpec(`${term}: ...`, messages).unresolved.length);
    const hints = messages.rules.map(({suggestion}) => suggestion).join("\n");
    assert.ok(reviewDesignSpec(`\`\`\`\n${hints}\n\`\`\``, messages).results.every(({evidence}) => !evidence));
  }
  const empty = reviewDesignSpec("# Loading: show a spinner\n\nLoading\nError\nEmpty\nKeyboard\n768px\n- [ ] Looks good\n- color: #fff");
  assert.ok(empty.results.every(({evidence}) => !evidence));
  const excluded = reviewDesignSpec([
    "<!-- Loading: show a spinner", "Error: retry -->", "```markdown", "Empty: show a message", "~~~", "```",
    "> ~~~text", "> Keyboard: visible focus", "> ~~~", "    Below 768px: one column",
    "Loading: show a spinner", "---", "TODO: loading must show a spinner", "待补充：失败时重试", "To confirm: use $primary", "TBD: empty data message"
  ].join("\r\n"));
  assert.ok(excluded.results.every(({evidence}) => !evidence));
  assert.deepEqual(excluded.unresolved.map(({line}) => line), [13, 14, 15, 16]);
  assert.equal(reviewDesignSpec("<!-- hidden\n-->\nLoading: show a spinner").results[0].evidence?.line, 3);
  assert.ok(reviewDesignSpec("```\nLoading: show a spinner").results.every(({evidence}) => !evidence));
  assert.ok(reviewDesignSpec("").results.every(({evidence}) => !evidence));
  // Text presence must not be advertised as semantic correctness: even negation matches.
  assert.ok(reviewDesignSpec("Never show a loading spinner.").results[0].evidence);
});

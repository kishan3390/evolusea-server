import { Ruleset } from '@stoplight/spectral-core';
import { oas } from '@stoplight/spectral-rulesets';
import { oas3 } from '@stoplight/spectral-formats';

oas.rules['no-$ref-siblings'].formats = [oas3];

export default new Ruleset({
  extends: oas,
  formats: [oas3],
});

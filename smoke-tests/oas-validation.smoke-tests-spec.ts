const { Spectral, Document } = spectralCore;
import spectralCore, { ISpectralDiagnostic } from '@stoplight/spectral-core';
import Parsers from '@stoplight/spectral-parsers';
import { TestApp } from './TestApp';
import ruleset from './default-oas-ruleset';

describe('Ruleset validation of generated OAS documentation', () => {
  const app = TestApp.fromEnv();
  let oasString: string;

  beforeAll(async () => {
    const res = await app.getSwagger().send();
    oasString = res.text;
  });

  it('OAS validation', async () => {
    const document = new Document(oasString, Parsers.Yaml, '');
    const spectral = new Spectral();
    spectral.setRuleset(ruleset);

    const issues: ISpectralDiagnostic[] = await spectral.run(document);
    const onlyErrors = issues.filter((issue) => issue.severity === 0);
    onlyErrors.forEach((issue) => {
      console.log(issue);
    });

    expect(oasString).toBeDefined();
    expect(onlyErrors.length).toBeLessThan(1);
  });
});

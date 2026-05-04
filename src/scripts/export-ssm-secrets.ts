import { GetParametersByPathCommand, SSMClient } from '@aws-sdk/client-ssm';
import * as fs from 'fs';

interface EnvVar {
  name: string;
  value: string;
}

class SsmSecretExporter {
  async run() {
    const prefix = process.env.SSM_PARAMETER_PREFIX;
    if (!prefix) {
      console.log(
        `SSM_PARAMETER_PREFIX is not set, skipping SSM parameter preload`,
      );
      process.exit(0);
    }

    const region =
      process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || '';
    if (!region) {
      console.log('AWS_REGION is not set, skipping SSM parameter preload');
      return;
    }

    const outputFile =
      process.argv[2] || process.env.SSM_EXPORT_FILE || '.env.ssm';
    const useSsm = process.env.USE_SSM === 'true';

    if (!useSsm) {
      console.log('USE_SSM is "false", skipping SSM parameter preload');
      return;
    }

    console.log('Preloading environment variables from AWS SSM');
    const secrets = await this.fetchSecretsByPrefix(region, prefix);
    this.writeExports(secrets, outputFile);
  }

  private async fetchSecretsByPrefix(region: string, prefix: string) {
    const client = new SSMClient({ region });
    const parameters: EnvVar[] = [];
    let nextToken: string | undefined;

    do {
      const command = new GetParametersByPathCommand({
        Path: prefix,
        MaxResults: 10,
        NextToken: nextToken,
        Recursive: true,
        WithDecryption: true,
      });

      const response = await client.send(command);
      const responseParameters = (response.Parameters ?? [])
        .map((parameter) => ({ name: parameter.Name, value: parameter.Value }))
        .filter((parameter): parameter is EnvVar =>
          Boolean(parameter.name && parameter.value),
        );

      parameters.push(...responseParameters);
      nextToken = response.NextToken;
    } while (nextToken);

    return parameters;
  }

  private writeExports(secrets: EnvVar[], outputFile: string) {
    if (!secrets.length) {
      console.log('No SSM parameters found for prefix, skipping export');
      return;
    }

    const statements = secrets.map((secret) => {
      const envVarName = this.extractEnvVarName(secret.name);
      console.log(`Setting ${envVarName} from SSM parameter ${secret.name}`);
      return `export ${envVarName}='${this.escapeSingleQuotes(secret.value)}'`;
    });

    try {
      fs.writeFileSync(outputFile, statements.join('\n'));
      console.log(`SSM secrets written to ${outputFile}`);
    } catch (error) {
      console.error(`Failed to write secrets to ${outputFile}`);
      throw error;
    }
  }

  private extractEnvVarName(parameterName: string) {
    const envVar = parameterName.split('/').pop();
    if (!envVar) {
      throw new Error(`Could not determine env var name from ${parameterName}`);
    }
    return envVar.toUpperCase();
  }

  private escapeSingleQuotes(value: string) {
    return value.replace(/'/g, "'\"'\"'");
  }
}

new SsmSecretExporter().run().catch((error) => {
  console.error(error);
  process.exit(1);
});

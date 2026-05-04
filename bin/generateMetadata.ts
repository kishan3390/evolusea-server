import { join } from 'path';
import { PluginMetadataGenerator } from '@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator';
import { ReadonlyVisitor } from '@nestjs/swagger/dist/plugin';

const generator = new PluginMetadataGenerator();
generator.generate({
  visitors: [
    new ReadonlyVisitor({
      introspectComments: true,
      dtoFileNameSuffix: ['.dto.ts'],
      pathToSource: join(__dirname, '..', '/src'),
    }),
  ],
  outputDir: join(__dirname, '..', '/src'),
  tsconfigPath: './tsconfig.swagger.json',
});

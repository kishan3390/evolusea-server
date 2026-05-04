import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  TemplateDelegate,
  TemplateService,
} from '../../../../lib/template/template.service';
import { PromptType } from '@domain/prompt/domain/enums/prompt.enum';
import { join } from 'path';
import { readFile } from 'node:fs/promises';
import { PromptRepository } from '@domain/prompt/domain/prompt.repository';
import { PromptFileName } from '../prompt-file-mapping.enum';

@Injectable()
export class FileSystemPromptRepository
  implements OnModuleInit, PromptRepository
{
  // When changing this value it needs to be updated in the nest-cli.json assets
  private promptsDirectory = 'prompts';
  private readonly registry: Record<PromptType, TemplateDelegate>;

  constructor(private readonly templateService: TemplateService) {
    this.registry = {} as Record<PromptType, TemplateDelegate>;
  }

  async onModuleInit() {
    for (const promptType of Object.values(PromptType)) {
      const rawTemplate = await this.readRawPromptTemplate(
        PromptFileName[promptType],
      );
      this.registry[promptType] = this.templateService.compileTemplate(
        rawTemplate.trim(),
      );
    }
  }

  getPrompt(
    promptType: PromptType,
    args: Record<string, any>,
    promptOverride?: string,
  ): string {
    if (promptOverride) {
      return this.getPromptRuntime(promptOverride, args);
    }

    return this.registry[promptType](args);
  }

  private getPromptRuntime(
    promptTemplate: string,
    args: Record<string, any>,
  ): string {
    return this.templateService.compileTemplate(promptTemplate.trim())(args);
  }

  private async readRawPromptTemplate(fileName: string): Promise<string> {
    const templatePath = join(process.cwd(), this.promptsDirectory, fileName);
    return readFile(templatePath, 'utf8');
  }
}

import { AiFacade, AiGenerateFacadeParams } from './ai.facade';
import { AiRoleEnum, AiGenerateData } from './base';
import { Injectable } from '@nestjs/common';

type GenerateImplementation = (
  params: AiGenerateFacadeParams,
) => Promise<AiGenerateData> | AiGenerateData;

@Injectable()
export class AiFakeFacade implements AiFacade {
  private readonly generateCalls: AiGenerateFacadeParams[] = [];
  private readonly generateImplementationsQueue: GenerateImplementation[] = [];
  private defaultGenerateImplementation?: GenerateImplementation;

  async generate(
    params: AiGenerateFacadeParams,
  ): Promise<AiGenerateData> {
    this.generateCalls.push(params);

    if (this.generateImplementationsQueue.length > 0) {
      const implementation = this.generateImplementationsQueue.shift()!;
      return implementation(params);
    }

    if (this.defaultGenerateImplementation) {
      return this.defaultGenerateImplementation(params);
    }

    return {
      message: {
        role: AiRoleEnum.Assistant,
        content: 'Test response',
      },
      actions: [],
    };
  }

  mockGenerateResolvedValue(value: AiGenerateData): this {
    this.defaultGenerateImplementation = async () => value;
    return this;
  }

  mockGenerateResolvedValueOnce(value: AiGenerateData): this {
    this.generateImplementationsQueue.push(async () => value);
    return this;
  }

  mockGenerateImplementation(implementation: GenerateImplementation): this {
    this.defaultGenerateImplementation = implementation;
    return this;
  }

  mockGenerateImplementationOnce(implementation: GenerateImplementation): this {
    this.generateImplementationsQueue.push(implementation);
    return this;
  }

  clearGenerateMocks(): void {
    this.defaultGenerateImplementation = undefined;
    this.generateImplementationsQueue.length = 0;
  }

  clearGenerateCalls(): void {
    this.generateCalls.length = 0;
  }

  reset(): void {
    this.clearGenerateCalls();
    this.clearGenerateMocks();
  }

  get generateCallsHistory(): AiGenerateFacadeParams[] {
    return [...this.generateCalls];
  }

  get lastGenerateCall(): AiGenerateFacadeParams | undefined {
    if (this.generateCalls.length === 0) {
      return undefined;
    }
    return this.generateCalls[this.generateCalls.length - 1];
  }

  get generateCallCount(): number {
    return this.generateCalls.length;
  }
}

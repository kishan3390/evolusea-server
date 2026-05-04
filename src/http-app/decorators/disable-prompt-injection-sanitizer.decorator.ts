import { SetMetadata } from '@nestjs/common';

export const DISABLE_BODY_PROMPT_INJECTION_SANITIZER =
  'disableBodyPromptInjectionSanitizer';
export const DisableBodyPromptInjectionSanitizer = () =>
  SetMetadata(DISABLE_BODY_PROMPT_INJECTION_SANITIZER, true);

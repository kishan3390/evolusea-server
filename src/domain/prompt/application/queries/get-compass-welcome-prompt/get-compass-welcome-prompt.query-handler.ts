import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { GetCompassWelcomePromptQuery } from './get-compass-welcome-prompt.query';
import { PromptRepository } from '@domain/prompt/domain/prompt.repository';
import { PromptType } from '@domain/prompt/domain';
import { LanguagesNames } from '@domain/user-profile/domain';

@Injectable()
export class GetCompassWelcomePromptQueryHandler
  implements QueryHandler<GetCompassWelcomePromptQuery, string>
{
  constructor(private readonly promptRepository: PromptRepository) {}

  handle(query: GetCompassWelcomePromptQuery): string {
    const promptArgs = {
      userProfile: {
        username: query.data.userProfile.getUsername(),
        countryCode: query.data.userProfile.getCountryCode(),
        belief: query.data.userProfile.getBelief(),
        language: query.data.userProfile.getLanguage(),
        languageName: LanguagesNames[query.data.userProfile.getLanguage()],
        biography: query.data.userProfile.getBiography(),
      },
      compassConfig: {
        goal: query.data.compassConfig.getGoal(),
        personality: query.data.compassConfig.getPersonality(),
      },
      compassChat: {
        topic: query.data.compassChat.getTopic(),
        intention: query.data.compassChat.getIntention(),
      },
    };

    return this.promptRepository.getPrompt(
      PromptType.CompassWelcome,
      promptArgs,
      query.promptOverride,
    );
  }
}

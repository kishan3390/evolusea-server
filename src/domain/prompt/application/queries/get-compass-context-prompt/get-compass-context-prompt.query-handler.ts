import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { PromptRepository } from '@domain/prompt/domain/prompt.repository';
import { PromptType } from '@domain/prompt/domain';
import { GetCompassContextPromptQuery } from './get-compass-context-prompt.query';
import { LanguagesNames } from '@domain/user-profile/domain';

@Injectable()
export class GetCompassContextPromptQueryHandler
  implements QueryHandler<GetCompassContextPromptQuery, string>
{
  constructor(private readonly promptRepository: PromptRepository) {}

  handle(query: GetCompassContextPromptQuery): string {
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
        intention: query.data.compassChat.getIntention(),
        lastChatsSummaries: query.data.compassChatsSummaries.map((summary) =>
          summary.getContent(),
        ),
      },
      journalNote: {
        lastNotesSummaries: query.data.notesSummaries.map((summary) =>
          summary.getContent(),
        ),
      },
      journalPath: {
        lastPaths: query.data.paths.map((path) => ({
          title: path.getTitle(),
          description: path.getDescription(),
          status: path.getStatus(),
          createdAt: path.getCreatedAt(),
          updatedAt: path.getUpdatedAt(),
        })),
      },
    };

    return this.promptRepository.getPrompt(
      PromptType.CompassContext,
      promptArgs,
      query.promptOverride,
    );
  }
}

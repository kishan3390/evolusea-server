import {
  CompassChatClosedEvent,
  CompassChatClosedEventPayload,
} from './compass-chat-closed.event';
import { EventEmitter } from '../../../../../event-emitter';
import { Injectable } from '@nestjs/common';
import { EventHandler } from '../../../../../event-emitter/event-handler';
import {
  CompassChatMessageRepository,
  CompassChatRepository,
} from '@domain/compass/domain';
import { Pagination, SortDirection } from '@building-blocks/application';
import { PromptFacade } from '@domain/prompt/prompt.facade';
import { CompassChatSummaryRepository } from '@domain/compass/domain/repositories/compass-chat-summary.repository';
import { CompassChatSummary } from '@domain/compass/domain/compass-chat-summary';
import { AiFacade, AiRoleEnum } from '../../../../../ai';
import { EntityIdGenerator } from '@building-blocks/domain';

@Injectable()
export class CompassChatClosedEventHandler extends EventHandler<CompassChatClosedEvent> {
  event = CompassChatClosedEvent;

  constructor(
    eventEmitter: EventEmitter,
    private readonly aiFacade: AiFacade,
    private readonly compassChatRepository: CompassChatRepository,
    private readonly compassChatMessageRepository: CompassChatMessageRepository,
    private readonly promptFacade: PromptFacade,
    private readonly compassChatSummaryRepository: CompassChatSummaryRepository,
    private readonly entityIdGenerator: EntityIdGenerator,
  ) {
    super(eventEmitter);
  }

  async handle({
    userProfileId,
    compassChatId,
  }: CompassChatClosedEventPayload): Promise<void> {
    const compassChat = await this.compassChatRepository.findOneBy({
      userProfileId: userProfileId,
      compassChatId: compassChatId,
    });
    if (!compassChat) {
      this.logger.log(`Compass chat '${compassChatId}' not found`);
      return;
    }

    const compassChatMessages = await this.compassChatMessageRepository.list(
      {
        compassChatId,
      },
      Pagination.unlimited(),
      [{ direction: SortDirection.ASC, field: 'createdAt' }],
    );

    const aiCompassChatMessages = compassChatMessages.items.map((message) => ({
      role: message.getRole(),
      content: message.getContent(),
    }));
    const summarizationPrompt = this.promptFacade.getCompassSummarizePrompt({
      data: {},
    });

    const aiChatResponse = await this.aiFacade.generate({
      maxTokens: 200,
      messages: [
        ...aiCompassChatMessages,
        { role: AiRoleEnum.User, content: summarizationPrompt },
      ],
    });

    if (!aiChatResponse.message) {
      this.logger.error('No message returned from AI', {
        userProfileId,
        compassChatId,
      });
      return;
    }

    const compassChatSummary = CompassChatSummary.create({
      compassChatId,
      content: aiChatResponse.message.content,
      entityIdGenerator: this.entityIdGenerator,
    });
    await this.compassChatSummaryRepository.create(compassChatSummary);
  }
}

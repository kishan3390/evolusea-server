import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DistributedLockService } from '../../../../distributed-lock';
import {
  AiFacade,
  AiProviders,
  AiReasoning,
  AiRoleEnum,
  AiToolTypes,
} from '../../../../ai';
import { PromptFacade } from '@domain/prompt/prompt.facade';
import { BeliefSystems, Languages } from '@domain/user-profile/domain';
import { CalendarEvent } from '@domain/calendar/domain/calendar-event';
import { EntityIdGenerator } from '@building-blocks/domain';
import { CalendarEventRepository } from '@domain/calendar/domain';

const LOCK_KEY = 'sync-calendar-events-task-lock';
const LOCK_EXPIRATION_TIME = 30_000; // 30 seconds

const CRON_AT_MIDNIGHT_DECEMBER_15 = '0 0 15 12 *';

export interface EventsData {
  events: {
    date: string;
    name: {
      en: string;
      th: string;
      id: string;
    };
    description: {
      en: string;
      th: string;
      id: string;
    };
  }[];
}

@Injectable()
export class SyncCalendarEvents {
  private readonly logger: Logger;

  constructor(
    private readonly distributedLock: DistributedLockService,
    private readonly aiFacade: AiFacade,
    private readonly promptFacade: PromptFacade,
    private readonly entityIdGenerator: EntityIdGenerator,
    private readonly calendarEventRepository: CalendarEventRepository,
  ) {
    this.logger = new Logger(SyncCalendarEvents.name);
  }

  @Cron(CRON_AT_MIDNIGHT_DECEMBER_15, { timeZone: 'UTC' })
  async execute(): Promise<void> {
    await this.distributedLock.executeWithLock(
      LOCK_KEY,
      LOCK_EXPIRATION_TIME,
      () => this.syncEvents(),
    );
  }

  private async syncEvents(): Promise<void> {
    this.logger.log('Syncing calendar events started');

    const languages = Object.values(Languages);
    const now = new Date();
    const year = now.getUTCFullYear();
    const nextYear = year + 1;
    const startOfYearUTC = new Date(Date.UTC(nextYear, 0, 1, 0, 0, 0, 0));
    const endOfYearUTC = new Date(Date.UTC(nextYear, 11, 31, 23, 59, 59, 999));

    if (year <= 2025) {
      this.logger.log(
        'Syncing calendar skipped - calendar events are already synchronized for the next year',
      );
      return;
    }

    for (const belief of Object.values(BeliefSystems)) {
      if (belief === BeliefSystems.Other) {
        this.logger.log(
          'Syncing calendar events skipped - other belief system',
        );
        continue;
      }

      await this.syncEventsForBelief(
        belief,
        languages,
        startOfYearUTC,
        endOfYearUTC,
      );
    }

    this.logger.log(`Syncing calendar events for all beliefs completed`);
  }

  private async syncEventsForBelief(
    belief: BeliefSystems,
    languages: Languages[],
    startOfYearUTC: Date,
    endOfYearUTC: Date,
  ) {
    this.logger.log(`Syncing calendar events for ${belief} belief`);

    const contextPrompt = this.promptFacade.getCalendarSyncContextPrompt({
      data: {},
    });
    const instructionPrompt =
      this.promptFacade.getCalendarSyncInstructionPrompt({
        data: {
          beliefSystem: belief,
          syncStartDate: startOfYearUTC,
          syncEndDate: endOfYearUTC,
        },
      });

    const data = await this.aiFacade.generate({
      model: 'gpt-5',
      provider: AiProviders.OpenAi,
      reasoning: AiReasoning.Low,
      maxTokens: 300,
      messages: [
        {
          role: AiRoleEnum.System,
          content: contextPrompt,
        },
        {
          role: AiRoleEnum.User,
          content: instructionPrompt,
        },
      ],
      tools: [
        {
          type: AiToolTypes.WebSearch,
          userLocation: {
            type: 'approximate',
            country: 'TH',
          },
        },
      ],
      responseFormat: {
        type: 'json_schema',
        name: 'calendar',
        schema: {
          type: 'object',
          properties: {
            events: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: {
                    type: 'string',
                    description:
                      'Dte of the event, in YYYY-MM-DD format (local timezone)',
                  },
                  name: {
                    type: 'object',
                    properties: {
                      en: {
                        type: 'string',
                        description:
                          'English translation for the event name, expressed as if it was an event name in Google Calendar',
                      },
                      th: {
                        type: 'string',
                        description:
                          'Thai translation for the event name, expressed as if it was an event name in Google Calendar',
                      },
                      id: {
                        type: 'string',
                        description:
                          'Indonesian translation for the event name, expressed as if it was an event name in Google Calendar',
                      },
                    },
                    required: languages,
                    additionalProperties: false,
                  },
                  description: {
                    type: 'object',
                    properties: {
                      en: {
                        type: 'string',
                        description:
                          'English translation for the event description, one to two sentences explaining what is it',
                      },
                      th: {
                        type: 'string',
                        description:
                          'Thai translation for the event description, one to two sentences explaining what is it',
                      },
                      id: {
                        type: 'string',
                        description:
                          'Indonesian translation for the event description, one to two sentences explaining what is it',
                      },
                    },
                    required: languages,
                    additionalProperties: false,
                  },
                },
                required: ['date', 'name', 'description'],
                additionalProperties: false,
              },
            },
          },
          required: ['events'],
          additionalProperties: false,
        },
      },
    });

    if (!data.message) {
      this.logger.warn(`No message received from AI for ${belief} belief`);
      return;
    }

    const eventsData = JSON.parse(data.message?.content) as EventsData;
    this.logger.log(
      `There are ${eventsData.events.length} events to sync for ${belief}`,
    );

    const events: CalendarEvent[] = [];
    for (const event of eventsData.events) {
      const translations = languages
        .map((language) => {
          if (!event.name[language] || !event.description[language]) {
            this.logger.warn(
              `There is no name or description for the event in the ${language} language for ${belief} belief`,
            );
            return null;
          }

          return {
            language,
            name: event.name[language],
            description: event.description[language],
          };
        })
        .filter((translation): translation is {
          language: Languages;
          name: string;
          description: string;
        } => translation !== null);

      if (!translations.length) {
        continue;
      }

      const calendarEvent = CalendarEvent.create({
        date: event.date,
        belief,
        translations,
        entityIdGenerator: this.entityIdGenerator,
      });
      events.push(calendarEvent);
    }

    this.logger.log(`Saving events to the db`);
    await this.calendarEventRepository.upsertMany(events);
    this.logger.log(`Sync completed for ${belief} belief`);
  }
}

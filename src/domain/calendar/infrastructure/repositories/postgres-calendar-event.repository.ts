import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Pagination, PaginatedList } from '@building-blocks/application';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import {
  Transaction,
  TransactionManager,
} from '@building-blocks/infrastructure';
import { CalendarEventMapper } from '@domain/calendar/infrastructure/mappers/calendar-event.mapper';
import {
  CalendarEvent,
  CalendarEventFilters,
  CalendarEventRepository,
  CalendarEventSort,
  FindCalendarEventByParams,
} from '@domain/calendar/domain';
import { CalendarEventEntity } from '@domain/calendar/infrastructure/entities/calendar-event.entity';
import { CalendarEventTranslationEntity } from '@domain/calendar/infrastructure/entities/calendar-event-translation.entity';
import { CalendarEventTranslationMapper } from '@domain/calendar/infrastructure/mappers/calendar-event-translation.mapper';
import { BeliefSystems } from '@domain/user-profile/domain';

@Injectable()
export class PostgresCalendarEventRepository
  implements CalendarEventRepository
{
  private readonly mapper = new CalendarEventMapper();
  private readonly translationMapper = new CalendarEventTranslationMapper();

  constructor(
    @InjectRepository(CalendarEventEntity)
    private readonly calendarEventRepository: Repository<CalendarEventEntity>,
    @InjectRepository(CalendarEventTranslationEntity)
    private readonly calendarEventTranslationRepository: Repository<CalendarEventTranslationEntity>,
    private readonly transactionManager: TransactionManager,
  ) {}

  private getCalendarEventKey(date: string, belief: BeliefSystems): string {
    return `${date}-${belief}`;
  }

  async upsert(entity: CalendarEvent, tx?: Transaction): Promise<void> {
    await this.upsertMany([entity], tx);
  }

  async upsertMany(entities: CalendarEvent[], tx?: Transaction): Promise<void> {
    if (!entities.length) {
      return;
    }

    const uniqueEntities = Array.from(
      entities
        .reduce((acc, event) => {
          const key = this.getCalendarEventKey(event.getDate(), event.getBelief());
          acc.set(key, event);
          return acc;
        }, new Map<string, CalendarEvent>())
        .values(),
    );

    await this.transactionManager.execute(async (internalTx) => {
      const calendarEventRepository = internalTx.getRepository(
        CalendarEventEntity,
      );
      const translationRepository = internalTx.getRepository(
        CalendarEventTranslationEntity,
      );

      const existingEntities = await calendarEventRepository.find({
        where: uniqueEntities.map((event) => ({
          date: event.getDate(),
          belief: event.getBelief(),
        })),
      });

      const existingByKey = new Map<string, CalendarEventEntity>();
      for (const existing of existingEntities) {
        existingByKey.set(
          this.getCalendarEventKey(existing.date, existing.belief),
          existing,
        );
      }

      const calendarEventEntities = uniqueEntities.map((event) => {
        const existing = existingByKey.get(
          this.getCalendarEventKey(event.getDate(), event.getBelief()),
        );
        const props = event.getProps();
        const entity: CalendarEventEntity = {
          id: existing?.id ?? props.id,
          date: event.getDate(),
          belief: event.getBelief(),
          createdAt: existing?.createdAt ?? props.createdAt,
          updatedAt: props.updatedAt,
        };
        if (!existing) {
          existingByKey.set(
            this.getCalendarEventKey(event.getDate(), event.getBelief()),
            entity,
          );
        }
        return entity;
      });

      await calendarEventRepository.upsert(calendarEventEntities, [
        'date',
        'belief',
      ]);

      const calendarEventIds = calendarEventEntities.map((entity) => entity.id);
      const existingTranslations = calendarEventIds.length
        ? await translationRepository.find({
            where: {
              calendarEventId: In(calendarEventIds),
            },
          })
        : [];

      const existingTranslationsMap = new Map<
        string,
        CalendarEventTranslationEntity
      >();
      for (const translation of existingTranslations) {
        existingTranslationsMap.set(
          `${translation.calendarEventId}-${translation.language}`,
          translation,
        );
      }

      const translationsToUpsert: CalendarEventTranslationEntity[] = [];
      for (const event of uniqueEntities) {
        const eventProps = event.getProps();
        const calendarEventId = existingByKey.get(
          this.getCalendarEventKey(event.getDate(), event.getBelief()),
        )?.id;
        const resolvedEventId = calendarEventId ?? eventProps.id;

        for (const translation of event.getTranslations()) {
          const props = translation.getProps();
          const key = `${resolvedEventId}-${props.language}`;
          const existingTranslation = existingTranslationsMap.get(key);
          translationsToUpsert.push({
            id: existingTranslation?.id ?? props.id,
            calendarEventId: resolvedEventId,
            language: props.language,
            name: props.name,
            description: props.description,
            createdAt: existingTranslation?.createdAt ?? props.createdAt,
            updatedAt: props.updatedAt,
          });
        }
      }

      if (translationsToUpsert.length) {
        await translationRepository.upsert(translationsToUpsert, [
          'calendarEventId',
          'language',
        ]);
      }
    }, tx);
  }

  async findOneBy(
    params: FindCalendarEventByParams,
  ): Promise<CalendarEvent | null> {
    const calendarEventEntity = await this.calendarEventRepository.findOne({
      where: {
        date: params.date,
        belief: params.belief,
      },
    });
    if (!calendarEventEntity) {
      return null;
    }

    const translationEntity =
      await this.calendarEventTranslationRepository.findOne({
        where: {
          calendarEventId: calendarEventEntity.id,
          language: params.language,
        },
      });
    if (!translationEntity) {
      return null;
    }

    const calendarEvent = this.mapper.toDomain(calendarEventEntity);
    calendarEvent.addTranslation(
      this.translationMapper.toDomain(translationEntity),
    );
    return calendarEvent;
  }

  async list(
    filters: CalendarEventFilters,
    pagination: Pagination,
    _sorts: CalendarEventSort[],
  ): Promise<PaginatedList<CalendarEvent>> {
    const query: FindOptionsWhere<CalendarEventEntity> = {
      belief: filters.belief,
    };

    const [entities, total] = await this.calendarEventRepository.findAndCount({
      where: query,
      skip: pagination.getOffset(),
      take: pagination.getPerPage(),
      order: { createdAt: 'DESC' },
    });

    const items = entities.map((entity) => this.mapper.toDomain(entity));
    return pagination.getPaginatedList(items, total);
  }

  async findManyByDate(date: string): Promise<CalendarEvent[]> {
    const events = await this.calendarEventRepository.find({
      where: { date },
    });
    if (!events.length) {
      return [];
    }

    const eventIds = events.map((event) => event.id);
    const translations = await this.calendarEventTranslationRepository.find({
      where: {
        calendarEventId: In(eventIds),
      },
    });

    const eventsById = new Map<string, CalendarEvent>();
    for (const event of events) {
      const domainEvent = this.mapper.toDomain(event);
      eventsById.set(event.id, domainEvent);
    }

    for (const translation of translations) {
      const event = eventsById.get(translation.calendarEventId);
      if (!event) {
        continue;
      }
      event.addTranslation(this.translationMapper.toDomain(translation));
    }

    return Array.from(eventsById.values());
  }

  async update(entity: CalendarEvent, tx?: Transaction): Promise<void> {
    const mappedEntity = this.mapper.toPersistence(entity);
    await this.transactionManager.execute(async (internalTx) => {
      await internalTx.getRepository(CalendarEventEntity).save(mappedEntity);
    }, tx);
  }

  async delete(id: string): Promise<void> {
    await this.calendarEventRepository.delete(id);
  }
}

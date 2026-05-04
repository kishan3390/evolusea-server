import { Mapper } from '@building-blocks/infrastructure';
import { NoteSummary } from '@domain/note/domain/note-summary';
import { NoteSummaryEntity } from '@domain/note/infrastructure/entities/note-summary.entity';

export class NoteSummaryMapper
  implements Mapper<NoteSummary, NoteSummaryEntity>
{
  toDomain(entity: NoteSummaryEntity): NoteSummary {
    return new NoteSummary({
      id: entity.id,
      noteId: entity.noteId,
      content: entity.content,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: NoteSummary): NoteSummaryEntity {
    const props = domain.getProps();
    return {
      id: props.id,
      noteId: props.noteId,
      content: props.content,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}

import { Languages } from '../../user-profile/domain';
import {
  Entity,
  EntityIdGenerator,
  EntityProps,
} from '../../../building-blocks/domain';

export interface WisdomStoryTranslationProps extends EntityProps {
  id: string;
  wisdomStoryId: string;
  language: Languages;
  title: string;
  content: string;
}

export interface WisdomStoryTranslationCreateArgs {
  wisdomStoryId: string;
  language: Languages;
  title: string;
  content: string;
  entityIdGenerator: EntityIdGenerator;
}

export type WisdomStoryTranslationUpdateProps = Pick<
  WisdomStoryTranslationProps,
  'title' | 'content' | 'language'
>;

export class WisdomStoryTranslation extends Entity<WisdomStoryTranslationProps> {
  private readonly id: string;
  private wisdomStoryId: string;
  private language: Languages;
  private title: string;
  private content: string;

  constructor(props: WisdomStoryTranslationProps) {
    super();
    this.id = props.id;
    this.wisdomStoryId = props.wisdomStoryId;
    this.language = props.language;
    this.title = props.title;
    this.content = props.content;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create({
    wisdomStoryId,
    language,
    title,
    content,
    entityIdGenerator,
  }: WisdomStoryTranslationCreateArgs): WisdomStoryTranslation {
    const id = entityIdGenerator.generate();
    return new WisdomStoryTranslation({
      id,
      wisdomStoryId,
      language,
      title,
      content: content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  update(data: WisdomStoryTranslationUpdateProps): boolean {
    let updated = false;

    if (data.title !== this.title) {
      this.title = data.title;
      updated = true;
    }

    if (data.content !== this.content) {
      this.content = data.content;
      updated = true;
    }

    if (updated) {
      this.entityUpdated();
    }

    return updated;
  }

  getId(): string {
    return this.id;
  }

  getLanguage(): Languages {
    return this.language;
  }

  getTitle(): string {
    return this.title;
  }

  getContent(): string {
    return this.content;
  }

  getProps(): WisdomStoryTranslationProps {
    return {
      id: this.id,
      wisdomStoryId: this.wisdomStoryId,
      language: this.language,
      title: this.title,
      content: this.content,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

import {
  Entity,
  EntityIdGenerator,
  EntityProps,
} from '../../../building-blocks/domain';
import { Moods } from '../../note/domain/enums';
import { Languages } from '../../user-profile/domain';
import {
  WisdomStoryBeliefSystems,
  WisdomStoryTimeToRead,
} from './enums';
import {
  WisdomStoryTranslation,
  WisdomStoryTranslationProps,
  WisdomStoryTranslationUpdateProps,
} from './wisdom-story-translation';

export interface WisdomStoryProps extends EntityProps {
  id: string;
  CMSId: string;
  imageUrl: string | null;
  mood: Moods;
  beliefSystem: WisdomStoryBeliefSystems;
  timeToRead: WisdomStoryTimeToRead;
  translations: WisdomStoryTranslationProps[];
  createdAtCMS: Date;
  isFree: boolean;
}

export interface WisdomStoryCreateArgs {
  imageUrl: string | null;
  CMSId: string;
  mood: Moods;
  beliefSystem: WisdomStoryBeliefSystems;
  timeToRead: WisdomStoryTimeToRead;
  createdAtCMS: Date;
  isFree: boolean;
  entityIdGenerator: EntityIdGenerator;
}

export type WisdomStoryUpdateProps = Partial<
  Pick<
    WisdomStoryProps,
    'imageUrl' | 'timeToRead' | 'isFree' | 'mood' | 'beliefSystem'
  >
>;

export class WisdomStory extends Entity<WisdomStoryProps> {
  private readonly id: string;
  private CMSId: string;
  private title: string;
  private content: string;
  private imageUrl: string | null;
  private timeToRead: WisdomStoryTimeToRead;
  private translations: WisdomStoryTranslation[] = [];
  private createdAtCMS: Date;
  private mood: Moods;
  private beliefSystem: WisdomStoryBeliefSystems;
  private isFree: boolean;

  constructor(props: WisdomStoryProps) {
    super();
    this.id = props.id;
    this.CMSId = props.CMSId;
    this.imageUrl = props.imageUrl;
    this.timeToRead = props.timeToRead;
    this.createdAtCMS = props.createdAtCMS;
    this.isFree = props.isFree;
    this.mood = props.mood;
    this.beliefSystem = props.beliefSystem;
    this.translations = props.translations.map(
      (translationProps) =>
        new WisdomStoryTranslation({
          id: translationProps.id,
          wisdomStoryId: translationProps.wisdomStoryId,
          title: translationProps.title,
          content: translationProps.content,
          language: translationProps.language,
          createdAt: translationProps.createdAt,
          updatedAt: translationProps.updatedAt,
        }),
    );
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create({
    imageUrl,
    CMSId,
    timeToRead,
    mood,
    beliefSystem,
    createdAtCMS,
    isFree,
    entityIdGenerator,
  }: WisdomStoryCreateArgs): WisdomStory {
    const now = new Date();

    return new WisdomStory({
      id: entityIdGenerator.generate(),
      CMSId,
      imageUrl,
      timeToRead,
      isFree,
      mood,
      beliefSystem,
      translations: [],
      createdAtCMS,
      createdAt: now,
      updatedAt: now,
    });
  }

  update(data: WisdomStoryUpdateProps): boolean {
    let updated = false;

    if (data.imageUrl !== undefined && data.imageUrl !== this.imageUrl) {
      this.imageUrl = data.imageUrl;
      updated = true;
    }

    if (data.timeToRead !== undefined && data.timeToRead !== this.timeToRead) {
      this.timeToRead = data.timeToRead;
      updated = true;
    }

    if (data.mood !== undefined && data.mood !== this.mood) {
      this.mood = data.mood;
      updated = true;
    }

    if (
      data.beliefSystem !== undefined &&
      data.beliefSystem !== this.beliefSystem
    ) {
      this.beliefSystem = data.beliefSystem;
      updated = true;
    }

    if (data.isFree !== undefined && data.isFree !== this.isFree) {
      this.isFree = data.isFree;
      updated = true;
    }

    if (updated) {
      this.entityUpdated();
    }

    return updated;
  }

  updateTranslations(
    translationsProps: WisdomStoryTranslationUpdateProps[],
    entityIdGenerator: EntityIdGenerator,
  ): boolean {
    let updated = false;

    for (const translationProps of translationsProps) {
      const existingTranslation = this.translations.find(
        (t) => t.getLanguage() === translationProps.language,
      );
      if (!existingTranslation) {
        const newTranslation = WisdomStoryTranslation.create({
          wisdomStoryId: this.getId(),
          language: translationProps.language,
          title: translationProps.title,
          content: translationProps.content,
          entityIdGenerator: entityIdGenerator,
        });
        this.translations.push(newTranslation);
        updated = true;
      } else {
        const wasUpdated = existingTranslation.update({
          title: translationProps.title,
          content: translationProps.content,
          language: translationProps.language,
        });
        if (wasUpdated) {
          updated = true;
        }
      }
    }

    if (updated) {
      this.entityUpdated();
    }
    return updated;
  }

  getId(): string {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getContent(): string {
    return this.content;
  }

  getImageUrl(): string | null {
    return this.imageUrl;
  }

  getTimeToRead(): WisdomStoryTimeToRead {
    return this.timeToRead;
  }

  getIsFree(): boolean {
    return this.isFree;
  }

  getMood(): Moods {
    return this.mood;
  }

  getBeliefSystem(): WisdomStoryBeliefSystems {
    return this.beliefSystem;
  }

  getTranslation(language: Languages): WisdomStoryTranslation | null {
    const translation = this.translations.find(
      (t) => t.getLanguage() === language,
    );
    return translation || null;
  }

  getTranslations(): WisdomStoryTranslation[] {
    return this.translations;
  }

  addTranslation(translation: WisdomStoryTranslation): void {
    this.translations.push(translation);
  }

  getProps(): WisdomStoryProps {
    return {
      id: this.id,
      imageUrl: this.imageUrl,
      timeToRead: this.timeToRead,
      isFree: this.isFree,
      CMSId: this.CMSId,
      mood: this.mood,
      beliefSystem: this.beliefSystem,
      createdAtCMS: this.createdAtCMS,
      translations: this.translations.map((translation) =>
        translation.getProps(),
      ),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

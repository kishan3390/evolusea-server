import { Entity, EntityProps } from '@building-blocks/domain';
import { BeliefSystems, Languages } from '@domain/user-profile/domain';
import { QuotePoolMoods } from './enums/quote-pool-moods.enum';

export interface QuotePoolItemProps extends EntityProps {
  id: string;
  content: string;
  attribution: string;
  source: string | null;
  mood: QuotePoolMoods;
  beliefSystem: BeliefSystems;
  language: Languages;
}

export class QuotePoolItem extends Entity<QuotePoolItemProps> {
  private readonly id: string;
  private readonly content: string;
  private readonly attribution: string;
  private readonly source: string | null;
  private readonly mood: QuotePoolMoods;
  private readonly beliefSystem: BeliefSystems;
  private readonly language: Languages;

  constructor(props: QuotePoolItemProps) {
    super();

    this.id = props.id;
    this.content = props.content;
    this.attribution = props.attribution;
    this.source = props.source;
    this.mood = props.mood;
    this.beliefSystem = props.beliefSystem;
    this.language = props.language;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  getId(): string {
    return this.id;
  }

  getContent(): string {
    return this.content;
  }

  getAttribution(): string {
    return this.attribution;
  }

  getSource(): string | null {
    return this.source;
  }

  getMood(): QuotePoolMoods {
    return this.mood;
  }

  getBeliefSystem(): BeliefSystems {
    return this.beliefSystem;
  }

  getLanguage(): Languages {
    return this.language;
  }

  getProps(): QuotePoolItemProps {
    return {
      id: this.id,
      content: this.content,
      attribution: this.attribution,
      source: this.source,
      mood: this.mood,
      beliefSystem: this.beliefSystem,
      language: this.language,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

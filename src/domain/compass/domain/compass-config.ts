import {
  Entity,
  EntityIdGenerator,
  EntityProps,
} from '@building-blocks/domain';
import { CompassPersonalities, Goals } from './enums';

export interface CompassConfigProps extends EntityProps {
  id: string;
  goal: Goals;
  personality: CompassPersonalities;
  userProfileId: string;
}

export interface CompassConfigCreateArgs {
  goal: Goals;
  personality: CompassPersonalities;
  userProfileId: string;
  entityIdGenerator: EntityIdGenerator;
}

export class CompassConfig extends Entity<CompassConfigProps> {
  private readonly id: string;
  private goal: Goals;
  private personality: CompassPersonalities;
  private userProfileId: string;

  constructor(props: CompassConfigProps) {
    super();

    this.id = props.id;
    this.goal = props.goal;
    this.personality = props.personality;
    this.userProfileId = props.userProfileId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create({
    goal,
    personality,
    userProfileId,
    entityIdGenerator,
  }: CompassConfigCreateArgs): CompassConfig {
    const now = new Date();

    return new CompassConfig({
      id: entityIdGenerator.generate(),
      goal,
      personality,
      userProfileId,
      createdAt: now,
      updatedAt: now,
    });
  }

  getId(): string {
    return this.id;
  }

  getGoal(): Goals {
    return this.goal;
  }

  setGoal(goal: Goals) {
    this.goal = goal;
    this.entityUpdated();
    return this;
  }

  getPersonality(): CompassPersonalities {
    return this.personality;
  }

  setPersonality(personal: CompassPersonalities) {
    this.personality = personal;
    this.entityUpdated();
    return this;
  }

  getUserProfileId(): string {
    return this.userProfileId;
  }

  getProps(): CompassConfigProps {
    return {
      id: this.id,
      goal: this.goal,
      personality: this.personality,
      userProfileId: this.userProfileId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

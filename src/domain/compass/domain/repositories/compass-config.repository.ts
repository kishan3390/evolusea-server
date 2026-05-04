import { CompassConfig } from '@domain/compass/domain/compass-config';

export interface FindCompassConfigByParams {
  userProfileId: string;
}

export abstract class CompassConfigRepository {
  abstract create(entity: CompassConfig): Promise<void>;
  abstract findOneBy(params: FindCompassConfigByParams): Promise<CompassConfig | null>;
  abstract update(entity: CompassConfig): Promise<void>;
}

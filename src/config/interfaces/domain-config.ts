export interface DomainConfig {
  compass: DomainConfigCompass;
  wisdomStory: DomainConfigWisdomStory;
}

export interface DomainConfigCompass {
  turnsCountSoftLimit: number;
  turnsCountHardLimit: number;
}

export interface DomainConfigWisdomStory {
  strapiSyncCron: string;
  strapiSyncTimezone: string;
}

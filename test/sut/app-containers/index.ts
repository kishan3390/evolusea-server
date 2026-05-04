export * from './app-containers-factory';
export * from './database-container';

// Provide a shared singleton for global shutdown of containers (prevent orphaned containers)
import { AppContainersFactory } from './app-containers-factory';
export const appContainersFactory = new AppContainersFactory();

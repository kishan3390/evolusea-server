import { DatabaseContainer } from './database-container';

export class AppContainersFactory {
  private readonly databaseContainers: DatabaseContainer[] = [];

  async createDatabaseContainer(): Promise<DatabaseContainer> {
    const container = await this.getAvailableDatabaseContainer();
    container.useContainer();

    return container;
  }

  async shutdown(): Promise<void> {
    const stops = this.databaseContainers.map(async (container) => {
      try {
        await container.stop();
      } catch (err) {
        console.log('Failed to stop container', err);
      }
    });

    await Promise.all(stops);
    this.databaseContainers.length = 0;
  }

  private async getAvailableDatabaseContainer(): Promise<DatabaseContainer> {
    const availableContainer = this.databaseContainers.find(
      (container) => !container.getIsInUse(),
    );

    if (availableContainer) {
      return availableContainer;
    }

    const newContainer = await DatabaseContainer.create();
    await newContainer.runMigrations();

    this.databaseContainers.push(newContainer);
    return newContainer;
  }
}

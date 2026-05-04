export interface UpdatePathCommand {
  userProfileId: string;
  pathId: string;
  title: string;
  description: string | null;
  date: string;
}

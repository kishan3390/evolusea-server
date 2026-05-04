export interface CreateVisionBoardCommand {
  userProfileId: string;
  title: string;
  description?: string;
  pathsIds: string[];
  notesIds: string[];
  wisdomStoriesIds: string[];
}

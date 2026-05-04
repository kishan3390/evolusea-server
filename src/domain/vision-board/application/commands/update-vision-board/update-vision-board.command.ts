export interface UpdateVisionBoardCommand {
  userProfileId: string;
  visionBoardId: string;
  title: string;
  description?: string | null;
  pathsIds: string[];
  notesIds: string[];
  wisdomStoriesIds: string[];
}

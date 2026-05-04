export interface TranscribeAudioCommand {
  audioBuffer: Buffer;
  mimeType: string;
  userLanguage: string;
  userId?: string;
}

export interface TranscribeAudioResult {
  text: string;
  language: string;
}

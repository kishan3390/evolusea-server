import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { CommandHandler } from '@building-blocks/application';
import {
  TranscribeAudioCommand,
  TranscribeAudioResult,
} from './transcribe-audio.command';
import { ConfigProvider } from '@config';
import { TokenUsageService } from '@domain/ai-usage/services/token-usage.service';

/** Map short language codes to full language names for better transcription accuracy */
const LANGUAGE_MAP: Record<string, string> = {
  af: 'Afrikaans',
  am: 'Amharic',
  ar: 'Arabic',
  az: 'Azerbaijani',
  be: 'Belarusian',
  bg: 'Bulgarian',
  bn: 'Bengali',
  bs: 'Bosnian',
  ca: 'Catalan',
  ceb: 'Cebuano',
  cs: 'Czech',
  cy: 'Welsh',
  da: 'Danish',
  de: 'German',
  el: 'Greek',
  en: 'English',
  eo: 'Esperanto',
  es: 'Spanish',
  et: 'Estonian',
  eu: 'Basque',
  fa: 'Persian',
  fi: 'Finnish',
  fil: 'Filipino',
  fr: 'French',
  ga: 'Irish',
  gl: 'Galician',
  gu: 'Gujarati',
  ha: 'Hausa',
  he: 'Hebrew',
  hi: 'Hindi',
  hmn: 'Hmong',
  hr: 'Croatian',
  ht: 'Haitian Creole',
  hu: 'Hungarian',
  hy: 'Armenian',
  id: 'Indonesian',
  ig: 'Igbo',
  is: 'Icelandic',
  it: 'Italian',
  ja: 'Japanese',
  jv: 'Javanese',
  ka: 'Georgian',
  kk: 'Kazakh',
  km: 'Khmer',
  kn: 'Kannada',
  ko: 'Korean',
  ku: 'Kurdish',
  ky: 'Kyrgyz',
  la: 'Latin',
  lo: 'Lao',
  lt: 'Lithuanian',
  lv: 'Latvian',
  mg: 'Malagasy',
  mi: 'Maori',
  mk: 'Macedonian',
  ml: 'Malayalam',
  mn: 'Mongolian',
  mr: 'Marathi',
  ms: 'Malay',
  mt: 'Maltese',
  my: 'Burmese',
  ne: 'Nepali',
  nl: 'Dutch',
  no: 'Norwegian',
  ny: 'Chichewa',
  pa: 'Punjabi',
  pl: 'Polish',
  ps: 'Pashto',
  pt: 'Portuguese',
  ro: 'Romanian',
  ru: 'Russian',
  rw: 'Kinyarwanda',
  sd: 'Sindhi',
  si: 'Sinhala',
  sk: 'Slovak',
  sl: 'Slovenian',
  sm: 'Samoan',
  sn: 'Shona',
  so: 'Somali',
  sq: 'Albanian',
  sr: 'Serbian',
  st: 'Sesotho',
  su: 'Sundanese',
  sv: 'Swedish',
  sw: 'Swahili',
  ta: 'Tamil',
  te: 'Telugu',
  tg: 'Tajik',
  th: 'Thai',
  tk: 'Turkmen',
  tl: 'Tagalog',
  tr: 'Turkish',
  tt: 'Tatar',
  ug: 'Uyghur',
  uk: 'Ukrainian',
  ur: 'Urdu',
  uz: 'Uzbek',
  vi: 'Vietnamese',
  xh: 'Xhosa',
  yi: 'Yiddish',
  yo: 'Yoruba',
  zh: 'Chinese',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  zu: 'Zulu',
};

@Injectable()
export class TranscribeAudioCommandHandler
  implements CommandHandler<TranscribeAudioCommand, TranscribeAudioResult>
{
  private readonly logger = new Logger(TranscribeAudioCommandHandler.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly tokenUsageService: TokenUsageService,
  ) {}

  async handle(command: TranscribeAudioCommand): Promise<TranscribeAudioResult> {
    const { audioBuffer, mimeType, userLanguage } = command;

    const base64Audio = audioBuffer.toString('base64');
    const prompt = this.buildTranscriptionPrompt(userLanguage);

    const apiKey = ConfigProvider.ai.geminiKey;
    const model = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Audio,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
      },
    };

    try {
      const response$ = this.httpService.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      const axiosResponse = await lastValueFrom(response$);

      // Track token usage asynchronously
      this.logTokenUsage(axiosResponse.data, model, command.userId);

      const candidates = axiosResponse.data?.candidates;
      if (!candidates || candidates.length === 0) {
        this.logger.warn('Gemini returned no candidates for audio transcription');
        throw new BadRequestException({
          statusCode: 400,
          error: 'AUDIO_UNCLEAR',
          message: 'Could not understand the audio. Please try again.',
        });
      }

      const parts = candidates[0]?.content?.parts;
      if (!parts || parts.length === 0) {
        this.logger.warn('Gemini returned no parts for audio transcription');
        throw new BadRequestException({
          statusCode: 400,
          error: 'AUDIO_UNCLEAR',
          message: 'Could not understand the audio. Please try again.',
        });
      }

      const transcribedText = parts
        .map((part: { text?: string }) => part.text || '')
        .join('')
        .trim();

      if (!transcribedText || transcribedText === '[UNCLEAR]') {
        throw new BadRequestException({
          statusCode: 400,
          error: 'AUDIO_UNCLEAR',
          message: 'Could not understand the audio. Please try again.',
        });
      }

      return { text: transcribedText, language: userLanguage };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Failed to transcribe audio: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private buildTranscriptionPrompt(userLanguage: string): string {
    const languageName =
      LANGUAGE_MAP[userLanguage] ??
      LANGUAGE_MAP[userLanguage.toLowerCase()];
    const languageInstruction = languageName
      ? `The user's preferred language is ${languageName}, but they may speak in any language. Transcribe in whichever language is actually spoken`
      : 'Detect the language automatically and transcribe in whichever language is actually spoken';

    return `You are a precise audio transcription assistant. Your task is to transcribe the spoken audio exactly as the speaker said it.

Rules:
- Transcribe exactly what is spoken, preserving the original language
- ${languageInstruction}
- Respect proper nouns, spiritual/religious terms, and names exactly as spoken (e.g. Buddha, Allah, Dharma, Karma, Sangha, Mindfulness)
- Do NOT translate — transcribe in the language spoken
- Do NOT add punctuation that changes meaning
- Do NOT add commentary, explanation, or notes
- If the audio is unclear, contains only silence, or is unintelligible, respond with exactly: [UNCLEAR]
- If the audio contains mixed languages, transcribe each part in its spoken language
- Output ONLY the transcribed text, nothing else`;
  }

  /**
   * Log token usage from the Gemini response (fire-and-forget).
   */
  private logTokenUsage(
    responseData: any,
    model: string,
    userId?: string,
  ): void {
    try {
      const usageMetadata = responseData?.usageMetadata;
      if (!usageMetadata || !userId) return;

      const inputTokens = usageMetadata.promptTokenCount ?? 0;
      const outputTokens = usageMetadata.candidatesTokenCount ?? 0;
      const totalTokens = usageMetadata.totalTokenCount ?? inputTokens + outputTokens;

      this.tokenUsageService
        .log({
          userId,
          chatId: null,
          provider: 'gemini',
          model,
          feature: 'voice_transcription',
          inputTokens,
          outputTokens,
          totalTokens,
        })
        .catch((err) =>
          this.logger.warn(`Failed to log voice transcription token usage: ${err.message}`),
        );
    } catch (err) {
      this.logger.warn(`Error extracting token usage metadata: ${err.message}`);
    }
  }
}

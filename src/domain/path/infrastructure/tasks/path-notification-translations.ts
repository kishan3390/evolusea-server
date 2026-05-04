import { Languages } from '../../../user-profile/domain';

export interface PathNotificationContent {
  title: string;
  body: string;
}

export class PathNotificationTranslations {
  private static readonly translations: Record<
    Languages,
    PathNotificationContent
  > = {
    [Languages.English]: {
      title: 'Missed this path?',
      body: 'It’s okay - complete it now, or pick it up later',
    },
    [Languages.Thai]: {
      title: 'พลาดเส้นทางนี้ไปเหรอ?',
      body: 'ไม่เป็นไร - ทำตอนนี้เลย หรือรับทีหลังก็ได้',
    },
    [Languages.Indonesian]: {
      title: 'Terlewatkan jalur ini?',
      body: 'Tidak apa-apa - selesaikan sekarang, atau lanjutkan nanti.',
    },
  };

  static getTranslation(language: Languages): PathNotificationContent {
    return this.translations[language];
  }
}

import { Languages } from '@domain/user-profile/domain';

export interface CalendarEventNotificationContent {
  title: string;
  body: string;
}

export class CalendarEventNotificationTranslations {
  private static readonly translations: Record<
    Languages,
    (name: string) => CalendarEventNotificationContent
  > = {
    [Languages.English]: (name) => ({
      title: `Don’t miss ${name}!`,
      body: `Learn more about today’s event and discover what’s waiting for you!`,
    }),
    [Languages.Thai]: (name) => ({
      title: `อย่าพลาด ${name}!`,
      body: `เรียนรู้เพิ่มเติมเกี่ยวกับกิจกรรมวันนี้และค้นพบสิ่งที่รอคุณอยู่!`,
    }),
    [Languages.Indonesian]: (name) => ({
      title: 'Jangan lewatkan ${name}!',
      body: `Pelajari lebih lanjut tentang acara hari ini dan temukan apa yang menantimu!`,
    }),
  };

  static getTranslation(
    language: Languages,
    name: string,
  ): CalendarEventNotificationContent {
    return this.translations[language](name);
  }
}

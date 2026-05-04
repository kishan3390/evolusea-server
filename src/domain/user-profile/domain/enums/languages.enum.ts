// ISO 639-1
export enum Languages {
  Thai = 'th',
  Indonesian = 'id',
  English = 'en',
}

/**
 * Reverse mapping of Languages enum
 *
 * @example
 * const name = LanguagesNames['en'];
 * const name = LanguagesNames[Languages.English];
 * const name = LanguagesNames.en;
 */
export const LanguagesNames = Object.fromEntries(
  Object.entries(Languages).map(([key, value]) => [value, key]),
) as LanguageKeyByCode;

type LanguageKeyByCode = {
  [K in keyof typeof Languages as (typeof Languages)[K]]: K;
};

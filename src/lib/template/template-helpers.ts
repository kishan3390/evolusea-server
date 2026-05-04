export interface TemplateHelper {
  name: string;
  body: (...args: any[]) => any;
}

export const concatHelper: TemplateHelper = {
  name: 'concat',
  body: (...args: any[]) => args.slice(0, -1).join(''),
};

/**
 * Truncate a string to a maximum length, appending "..." if truncated.
 * Usage in Handlebars: {{truncate someText 200}}
 */
export const truncateHelper: TemplateHelper = {
  name: 'truncate',
  body: (text: string, maxLength: number) => {
    if (typeof text !== 'string') return '';
    if (typeof maxLength !== 'number') maxLength = 200;
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trimEnd() + '...';
  },
};

/**
 * Less-than-or-equal comparison helper.
 * Usage in Handlebars: {{#if (lte turnsCount 3)}}...{{/if}}
 */
export const lteHelper: TemplateHelper = {
  name: 'lte',
  body: (a: number, b: number) => a <= b,
};

/**
 * Greater-than comparison helper.
 * Usage in Handlebars: {{#if (gt turnsCount 5)}}...{{/if}}
 */
export const gtHelper: TemplateHelper = {
  name: 'gt',
  body: (a: number, b: number) => a > b,
};

export const defaultTemplateHelpers: TemplateHelper[] = [
  concatHelper,
  truncateHelper,
  lteHelper,
  gtHelper,
];

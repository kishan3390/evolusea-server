import { z } from 'zod';
import { WisdomStoryBeliefSystems } from '@domain/wisdom-story/domain';
import { Moods } from '@domain/note/domain/enums';

const MoodsValues = Object.values(Moods) as [string, ...string[]];

// Strapi may return combined belief system values like "other/general" or "general/other".
// Accept those alongside the standard values so Zod validation passes; they are
// normalised to a single value in the mapping layer.
const StrapiBeliefSystemValues = [
  ...Object.values(WisdomStoryBeliefSystems),
  'other/general',
  'general/other',
] as unknown as [string, ...string[]];

export const StrapiWisdomStoryLocaleSchema = z.object({
  title: z.string(),
  content: z.string(),
  locale: z.string(),
});

export const StrapiWisdomStorySchema = z.object({
  id: z.string(),
  timeToRead: z.string(),
  free: z.boolean(),
  mood: z.enum(MoodsValues),
  beliefSystem: z.enum(StrapiBeliefSystemValues),
  image: z.string().nullable(),
  createdAt: z.string(),
  locales: z.array(StrapiWisdomStoryLocaleSchema),
});

export const StrapiWisdomStoryResponseSchema = z.object({
  wisdomStories: z.array(StrapiWisdomStorySchema),
  pagination: z.object({
    hasMore: z.boolean(),
  }),
});

export type StrapiWisdomStoryResponse = z.infer<
  typeof StrapiWisdomStoryResponseSchema
>;

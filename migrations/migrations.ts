import { AddUserProfileEntity1758714716141 } from './1758714716141-add_user_profile_entity';
import { AddAccountEntity1758899947054 } from './1758899947054-add_account_entity';
import { AddRelationForAccountAndUserProfile1759105930701 } from './1759105930701-add_relation_for_account_and_user_profile';
import { AddCompassConfigEntity1759759626007 } from './1759759626007-add_compass_config_entity';
import { AddNoteEntity1759330397184 } from './1759330397184-add_note_entity';
import { AddPathEntity1760015953734 } from './1760015953734-add_path_entity';
import { AddCompassChatEntity1760354192136 } from './1760354192136-add_compass_chat_entity';
import { AddCompassChatMessageEntity1760369526941 } from './1760369526941-add_compass_chat_message_entity';
import { AddDistributedLock1760521344847 } from './1760521344847-add_distributed_lock';
import { AddPathStatus1760521985618 } from './1760521985618-add_path_status';
import { AddLanguageToUserProfile1761048161673 } from './1761048161673-add_language_to_user_profile';
import { AddSpeakerColumnForChatMessage1761116329787 } from './1761116329787-add_speaker_column_for_chat_message';
import { CreateNotificationPushTokenEntity1761158281348 } from './1761158281348-create_notification_push_token_entity';
import { AddTurnsCountForChatEntity1761235664094 } from './1761235664094-add_turns_count_for_chat_entity';
import { AddCompassChatSummaryEntity1761593608963 } from './1761593608963-add_compass_chat_summary_entity';
import { AddTurnIndexForCompassChatMessage1761859421855 } from './1761859421855-add_turn_index_for_compass_chat_message';
import { AddNoteSummaryEntity1762099898527 } from './1762099898527-add_note_summary_entity';
import { AddCloseReasonToCompassChatEntity1762336321906 } from './1762336321906-add_close_reason_to_compass_chat_entity';
import { AddWisdomStoryWithTranslations1762432246867 } from './1762432246867-add_wisdom_story_with_translations';
import { MakeNoteDescNullable1762441459736 } from './1762441459736-make_note_desc_nullable';
import { MakePathDescNullable1762441569483 } from './1762441569483-make_path_desc_nullable';
import { AddCalendarEventEntity1762524590279 } from './1762524590279-add_calendar_event_entity';
import { AddUniqueIndexForCalendarEventEntity1762525607544 } from './1762525607544-add_unique_index_for_calendar_event_entity';
import { AddUniqueIndexForImageWisdomStory1762762027917 } from './1762762027917-add_unique_index_for_image_wisdom_story';
import { AddWisdomStoryMood1763131925862 } from './1763131925862-add_wisdom_story_mood';
import { AddQuoteEntity1763387804025 } from './1763387804025-add_quote_entity';
import { AddAccountEntitlementEntity1763935464470 } from './1763935464470-add_account_entitlement_entity';
import { AddVisionBoardEntity1765137137214 } from './1765137137214-add_vision_board_entity';
import { AddBeliefSystemToWisdomStoryEntity1765406787451 } from './1765406787451-add_belief_system_to_wisdom_story_entity';
import { SplitCalendarEventTranslations1765903957706 } from './1765903957706-split_calendar_event_translations';
import { LinkNotificationTokenToAccount1765903977706 } from './1765903977706-link_notification_token_to_account';
import { AddAccountCascadeDelete1767369616500 } from './1767369616500-add_account_cascade_delete';
import { AddAttributionToQuoteEntity1767890400000 } from './1767890400000-add_attribution_to_quote_entity';
import { AddAiGenerationToWisdomStory1767890500000 } from './1767890500000-add_ai_generation_to_wisdom_story';
import { AddAiTokenUsage1767890600000 } from './1767890600000-add_ai_token_usage';
import { RevertAiGenerationFromWisdomStory1767890700000 } from './1767890700000-revert_ai_generation_from_wisdom_story';
import { AddMetadataToCompassChatMessage1767890800000 } from './1767890800000-add_metadata_to_compass_chat_message';
import { CreateQuotePoolAndUserDailyQuotes1767890900000 } from './1767890900000-create_quote_pool_and_user_daily_quotes';
import { SeedQuotePool1767891000000 } from './1767891000000-seed_quote_pool';
import { AddMoodCheckinEntity1768000000000 } from './1768000000000-add_mood_checkin_entity';
import { MakeNoteMoodNullable1768000100000 } from './1768000100000-make_note_mood_nullable';
import { AddDailyEngagementEntity1768000200000 } from './1768000200000-add_daily_engagement_entity';

export const migrations = [
  AddUserProfileEntity1758714716141,
  AddAccountEntity1758899947054,
  AddRelationForAccountAndUserProfile1759105930701,
  AddNoteEntity1759330397184,
  AddCompassConfigEntity1759759626007,
  AddPathEntity1760015953734,
  AddCompassChatEntity1760354192136,
  AddCompassChatMessageEntity1760369526941,
  AddDistributedLock1760521344847,
  AddPathStatus1760521985618,
  AddLanguageToUserProfile1761048161673,
  AddSpeakerColumnForChatMessage1761116329787,
  CreateNotificationPushTokenEntity1761158281348,
  AddTurnsCountForChatEntity1761235664094,
  AddCompassChatSummaryEntity1761593608963,
  AddTurnIndexForCompassChatMessage1761859421855,
  AddNoteSummaryEntity1762099898527,
  AddCloseReasonToCompassChatEntity1762336321906,
  AddWisdomStoryWithTranslations1762432246867,
  MakeNoteDescNullable1762441459736,
  MakePathDescNullable1762441569483,
  AddCalendarEventEntity1762524590279,
  AddUniqueIndexForCalendarEventEntity1762525607544,
  AddUniqueIndexForImageWisdomStory1762762027917,
  AddWisdomStoryMood1763131925862,
  AddQuoteEntity1763387804025,
  AddAccountEntitlementEntity1763935464470,
  AddVisionBoardEntity1765137137214,
  AddBeliefSystemToWisdomStoryEntity1765406787451,
  SplitCalendarEventTranslations1765903957706,
  LinkNotificationTokenToAccount1765903977706,
  AddAccountCascadeDelete1767369616500,
  AddAttributionToQuoteEntity1767890400000,
  AddAiGenerationToWisdomStory1767890500000,
  AddAiTokenUsage1767890600000,
  RevertAiGenerationFromWisdomStory1767890700000,
  AddMetadataToCompassChatMessage1767890800000,
  CreateQuotePoolAndUserDailyQuotes1767890900000,
  SeedQuotePool1767891000000,
  AddMoodCheckinEntity1768000000000,
  MakeNoteMoodNullable1768000100000,
  AddDailyEngagementEntity1768000200000,
];

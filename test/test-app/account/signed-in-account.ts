import { accountApi, AccountAPI } from '../../helpers/apis/account-api';
import { noteApi, NoteAPI } from '../../helpers/apis/note-api';
import {
  userProfileApi,
  UserProfileAPI,
} from '../../helpers/apis/user-profile-api';
import { AuthenticatedRequest } from '../authenticated-request';
import {
  compassConfigApi,
  CompassConfigAPI,
} from '../../helpers/apis/compass-config-api';
import { pathApi, PathAPI } from '../../helpers/apis/path-api';
import {
  compassChatApi,
  CompassChatAPI,
} from '../../helpers/apis/compass-chat-api';
import {
  CompassChatMessageAPI,
  compassChatMessageApi,
} from '../../helpers/apis/compass-chat-message-api';
import {
  notificationApi,
  NotificationAPI,
} from '../../helpers/apis/notification-api';
import {
  wisdomStoryApi,
  WisdomStoryAPI,
} from '../../helpers/apis/wisdom-story-api';
import { CalendarAPI, calendarApi } from '../../helpers/apis/calendar-api';
import { QuoteAPI, quoteApi } from '../../helpers/apis/quote-api';
import {
  VisionBoardAPI,
  visionBoardApi,
} from '../../helpers/apis/vision-board-api';
import {
  AchievementAPI,
  achievementApi,
} from '../../helpers/apis/achievement-api';

export class SignedInAccount {
  private _id: string | undefined;
  private _firebaseId: string;
  private _email: string;
  private _authenticatedRequest: AuthenticatedRequest;

  constructor(
    firebaseId: string,
    email: string,
    authenticatedRequest: AuthenticatedRequest,
  ) {
    this._firebaseId = firebaseId;
    this._email = email;
    this._authenticatedRequest = authenticatedRequest;
    this.accountAPI = accountApi(this);
    this.userProfileApi = userProfileApi(this);
    this.noteAPI = noteApi(this);
    this.compassConfigAPI = compassConfigApi(this);
    this.compassChatAPI = compassChatApi(this);
    this.compassChatMessageAPI = compassChatMessageApi(this);
    this.pathAPI = pathApi(this);
    this.notificationAPI = notificationApi(this);
    this.wisdomStoryAPI = wisdomStoryApi(this);
    this.calendarAPI = calendarApi(this);
    this.quoteAPI = quoteApi(this);
    this.visionBoardAPI = visionBoardApi(this);
    this.achievementAPI = achievementApi(this);
  }

  accountAPI: AccountAPI;
  userProfileApi: UserProfileAPI;
  noteAPI: NoteAPI;
  compassConfigAPI: CompassConfigAPI;
  compassChatAPI: CompassChatAPI;
  compassChatMessageAPI: CompassChatMessageAPI;
  pathAPI: PathAPI;
  notificationAPI: NotificationAPI;
  wisdomStoryAPI: WisdomStoryAPI;
  calendarAPI: CalendarAPI;
  quoteAPI: QuoteAPI;
  visionBoardAPI: VisionBoardAPI;
  achievementAPI: AchievementAPI;

  get id(): string {
    return this._id ?? 'unknown';
  }

  get firebaseId(): string {
    return this._firebaseId;
  }

  get email(): string {
    return this._email;
  }

  get authenticatedRequest(): AuthenticatedRequest {
    return this._authenticatedRequest;
  }

  async syncAuth() {
    const result = await this.accountAPI.syncMyAuth();
    this._id = result.body.id;
    return result;
  }
}

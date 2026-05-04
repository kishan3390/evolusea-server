import {
  CreateNotePayloadDto,
  ListNotesResponseDto,
  NoteDto,
  NotesQuotaDto,
  UpdateNotePayloadDto,
} from '../../../src/http-app/note/dto';
import { SignedInAccount } from '../../test-app/account/signed-in-account';
import { ApiResponse } from '../api-response';
import { ListNotesQueryDto } from '../../../src/http-app/note/dto';

export function noteApi(user: SignedInAccount) {
  return {
    async createNote(dto: CreateNotePayloadDto): Promise<ApiResponse<NoteDto>> {
      return await user.authenticatedRequest.post('/users/me/notes').send(dto);
    },

    async getNote<ResponseBody = any>(
      noteId: string,
    ): Promise<ApiResponse<ResponseBody>> {
      return await user.authenticatedRequest.get(`/users/me/notes/${noteId}`);
    },

    async updateNote<ResponseBody = any>(
      noteId: string,
      dto: UpdateNotePayloadDto,
    ): Promise<ApiResponse<ResponseBody>> {
      return await user.authenticatedRequest
        .put(`/users/me/notes/${noteId}`)
        .send(dto);
    },

    async deleteNote<ResponseBody = any>(
      noteId: string,
    ): Promise<ApiResponse<ResponseBody>> {
      return await user.authenticatedRequest.delete(
        `/users/me/notes/${noteId}`,
      );
    },

    async listNotes(
      query?: ListNotesQueryDto,
    ): Promise<ApiResponse<ListNotesResponseDto>> {
      return await user.authenticatedRequest.get('/users/me/notes').query({
        ...(query ?? { page: 1, perPage: 10 }),
      });
    },

    async getNotesQuota(): Promise<ApiResponse<NotesQuotaDto>> {
      return await user.authenticatedRequest.get('/users/me/notes/quota');
    },
  };
}

export type NoteAPI = ReturnType<typeof noteApi>;

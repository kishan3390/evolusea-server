import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser, RequiredAuth, UuidParam } from '../decorators';
import { AuthUser } from '../authentication';
import { NoteFacade } from '@domain/note/note.facade';
import {
  CreateNotePayloadDto,
  ListNotesResponseDto,
  NoteDto,
  UpdateNotePayloadDto,
  NotesQuotaDto,
  ListNotesQueryDto,
} from './dto';
import { Pagination } from '@building-blocks/application';
import { ApiResponse } from '@nestjs/swagger';

@Controller('users/me/notes')
@RequiredAuth()
export class NoteController {
  constructor(private readonly noteFacade: NoteFacade) {}

  @Post()
  async createNote(
    @Body() payload: CreateNotePayloadDto,
    @CurrentUser() authUser: AuthUser,
  ): Promise<NoteDto> {
    const quota = await this.noteFacade.getNotesQuota({
      userProfileId: authUser.userProfileId,
      accountIsPremium: authUser.hasPremiumEntitlement,
    });
    if (!quota.create.isAllowed) {
      throw new ForbiddenException('Limit of notes reached');
    }

    const note = await this.noteFacade.createNote({
      ...payload,
      userProfileId: authUser.userProfileId,
    });
    return NoteDto.fromEntity(note);
  }

  // Has to be placed before the /:id route to avoid path conflict
  @Get('/quota')
  async getNoteQuota(
    @CurrentUser() authUser: AuthUser,
  ): Promise<NotesQuotaDto> {
    const data = await this.noteFacade.getNotesQuota({
      userProfileId: authUser.userProfileId,
      accountIsPremium: authUser.hasPremiumEntitlement,
    });
    return NotesQuotaDto.fromEntity(data);
  }

  @Get('/:id')
  async getNote(
    @UuidParam('id') id: string,
    @CurrentUser() authUser: AuthUser,
  ): Promise<NoteDto> {
    const note = await this.noteFacade.getNote({
      userProfileId: authUser.userProfileId,
      id,
    });
    if (!note) throw new NotFoundException();
    return NoteDto.fromEntity(note);
  }

  @Put('/:id')
  async updateNote(
    @UuidParam('id') id: string,
    @Body() payload: UpdateNotePayloadDto,
    @CurrentUser() authUser: AuthUser,
  ): Promise<NoteDto> {
    const note = await this.noteFacade.updateNote({
      userProfileId: authUser.userProfileId,
      noteId: id,
      ...payload,
    });
    return NoteDto.fromEntity(note);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNote(
    @UuidParam('id') id: string,
    @CurrentUser() authUser: AuthUser,
  ): Promise<void> {
    await this.noteFacade.deleteNote({
      userProfileId: authUser.userProfileId,
      noteId: id,
    });
  }

  @Get()
  @ApiResponse({ type: ListNotesResponseDto, status: HttpStatus.OK })
  async listMyNotes(
    @Query() query: ListNotesQueryDto,
    @CurrentUser() authUser: AuthUser,
  ): Promise<ListNotesResponseDto> {
    const results = await this.noteFacade.listNotes({
      userProfileId: authUser.userProfileId,
      createdFrom: query.createdFrom ? new Date(query.createdFrom) : undefined,
      createdTo: query.createdTo ? new Date(query.createdTo) : undefined,
      pagination: Pagination.from(query),
    });
    return ListNotesResponseDto.from(results, NoteDto.fromEntity);
  }
}

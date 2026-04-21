import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { TenantGuard } from '../auth/tenant.guard.js';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator.js';
import { MessagesService } from './messages.service.js';
import { SearchService } from '../search/search.service.js';
import { CreateMessageDto } from './dto/create-message.dto.js';
import { GetMessagesQueryDto } from './dto/get-messages-query.dto.js';
import { SearchMessagesQueryDto } from './dto/search-messages-query.dto.js';

@Controller()
@UseGuards(AuthGuard, TenantGuard)
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly searchService: SearchService,
  ) {}

  @Post('messages')
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.messagesService.create(tenantId, dto);
  }

  @Get('conversations/:conversationId/messages')
  async findByConversation(
    @CurrentTenant() tenantId: string,
    @Param('conversationId') conversationId: string,
    @Query() query: GetMessagesQueryDto,
  ) {
    return this.messagesService.findByConversation(
      tenantId,
      conversationId,
      query.limit,
      query.cursor,
    );
  }

  @Get('conversations/:conversationId/messages/search')
  async search(
    @CurrentTenant() tenantId: string,
    @Param('conversationId') conversationId: string,
    @Query() query: SearchMessagesQueryDto,
  ) {
    return this.searchService.search(
      tenantId,
      conversationId,
      query.q,
      query.limit,
    );
  }
}

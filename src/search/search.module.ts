import { Module } from '@nestjs/common';
import { SearchService } from './search.service.js';
import { SearchConsumer } from './search.consumer.js';

@Module({
  providers: [SearchService, SearchConsumer],
  exports: [SearchService],
})
export class SearchModule {}

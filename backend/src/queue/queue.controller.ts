import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { QueueService } from './queue.service';
import { CreateQueueItemDto } from './dto/create-queue-item.dto';
import { UpdateQueueItemDto } from './dto/update-queue-item.dto';
import { QueueStatus, Priority } from './entities/queue-item.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('queue')
@UseGuards(JwtAuthGuard)
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post()
  create(@Body() createQueueItemDto: CreateQueueItemDto) {
    return this.queueService.create(createQueueItemDto);
  }

  @Get()
  findAll() {
    return this.queueService.findAll();
  }

  @Get('active')
  findActive() {
    return this.queueService.findActive();
  }

  @Get('stats')
  getQueueStats() {
    return this.queueService.getQueueStats();
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: QueueStatus) {
    return this.queueService.findByStatus(status);
  }

  @Get('priority/:priority')
  findByPriority(@Param('priority') priority: Priority) {
    return this.queueService.findByPriority(priority);
  }

  @Post('call-next')
  callNext() {
    return this.queueService.callNext();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.queueService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQueueItemDto: UpdateQueueItemDto) {
    return this.queueService.update(+id, updateQueueItemDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: QueueStatus) {
    return this.queueService.updateStatus(+id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.queueService.remove(+id);
  }
}

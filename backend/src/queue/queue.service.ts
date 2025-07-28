import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThan } from 'typeorm';
import { QueueItem, QueueStatus, Priority } from './entities/queue-item.entity';
import { CreateQueueItemDto } from './dto/create-queue-item.dto';
import { UpdateQueueItemDto } from './dto/update-queue-item.dto';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(QueueItem)
    private queueRepository: Repository<QueueItem>,
  ) {}

  async create(createQueueItemDto: CreateQueueItemDto): Promise<QueueItem> {
    // Check if patient is already in queue
    const existingQueueItem = await this.queueRepository.findOne({
      where: {
        patientId: createQueueItemDto.patientId,
        status: QueueStatus.WAITING,
      },
    });

    if (existingQueueItem) {
      throw new BadRequestException('Patient is already in the queue');
    }

    // Generate next queue number
    const queueNumber = await this.generateQueueNumber();
    
    const queueItem = this.queueRepository.create({
      ...createQueueItemDto,
      queueNumber,
    });

    return await this.queueRepository.save(queueItem);
  }

  async findAll(): Promise<QueueItem[]> {
    return await this.queueRepository.find({
      relations: ['patient'],
      order: { 
        priority: 'DESC', // URGENT, HIGH, NORMAL, LOW
        queueNumber: 'ASC' 
      },
    });
  }

  async findActive(): Promise<QueueItem[]> {
    return await this.queueRepository.find({
      where: [
        { status: QueueStatus.WAITING },
        { status: QueueStatus.WITH_DOCTOR },
      ],
      relations: ['patient'],
      order: { 
        priority: 'DESC',
        queueNumber: 'ASC' 
      },
    });
  }

  async findOne(id: number): Promise<QueueItem> {
    const queueItem = await this.queueRepository.findOne({
      where: { id },
      relations: ['patient'],
    });
    
    if (!queueItem) {
      throw new NotFoundException(`Queue item with ID ${id} not found`);
    }
    
    return queueItem;
  }

  async update(id: number, updateQueueItemDto: UpdateQueueItemDto): Promise<QueueItem> {
    const queueItem = await this.findOne(id);
    
    // Handle status changes with proper typing
    const updateData: any = { ...updateQueueItemDto };
    
    if (updateQueueItemDto.status && updateQueueItemDto.status !== queueItem.status) {
      if (updateQueueItemDto.status === QueueStatus.WITH_DOCTOR && !queueItem.calledAt) {
        updateData.calledAt = new Date();
      } else if (updateQueueItemDto.status === QueueStatus.COMPLETED && !queueItem.completedAt) {
        updateData.completedAt = new Date();
      }
    }

    await this.queueRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.queueRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Queue item with ID ${id} not found`);
    }
  }

  async updateStatus(id: number, status: QueueStatus): Promise<QueueItem> {
    return this.update(id, { status });
  }

  async callNext(): Promise<QueueItem | null> {
    const nextQueueItem = await this.queueRepository.findOne({
      where: { status: QueueStatus.WAITING },
      relations: ['patient'],
      order: { 
        priority: 'DESC',
        queueNumber: 'ASC' 
      },
    });

    if (!nextQueueItem) {
      return null;
    }

    return this.updateStatus(nextQueueItem.id, QueueStatus.WITH_DOCTOR);
  }

  async getQueueStats(): Promise<{
    total: number;
    waiting: number;
    withDoctor: number;
    completed: number;
    averageWaitTime: number;
  }> {
    const [total, waiting, withDoctor, completed] = await Promise.all([
      this.queueRepository.count(),
      this.queueRepository.count({ where: { status: QueueStatus.WAITING } }),
      this.queueRepository.count({ where: { status: QueueStatus.WITH_DOCTOR } }),
      this.queueRepository.count({ where: { status: QueueStatus.COMPLETED } }),
    ]);

    // Calculate average wait time (simplified)
    const completedItems = await this.queueRepository.find({
      where: { status: QueueStatus.COMPLETED },
      select: ['createdAt', 'calledAt'],
    });

    let averageWaitTime = 0;
    if (completedItems.length > 0) {
      const totalWaitTime = completedItems.reduce((sum, item) => {
        if (item.calledAt) {
          return sum + (item.calledAt.getTime() - item.createdAt.getTime());
        }
        return sum;
      }, 0);
      averageWaitTime = totalWaitTime / completedItems.length / (1000 * 60); // Convert to minutes
    }

    return {
      total,
      waiting,
      withDoctor,
      completed,
      averageWaitTime: Math.round(averageWaitTime),
    };
  }

  async findByStatus(status: QueueStatus): Promise<QueueItem[]> {
    return await this.queueRepository.find({
      where: { status },
      relations: ['patient'],
      order: { 
        priority: 'DESC',
        queueNumber: 'ASC' 
      },
    });
  }

  async findByPriority(priority: Priority): Promise<QueueItem[]> {
    return await this.queueRepository.find({
      where: { priority },
      relations: ['patient'],
      order: { queueNumber: 'ASC' },
    });
  }

  private async generateQueueNumber(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lastQueueItem = await this.queueRepository.findOne({
      where: {
        createdAt: MoreThanOrEqual(today),
      },
      order: { queueNumber: 'DESC' },
    });

    return lastQueueItem ? lastQueueItem.queueNumber + 1 : 1;
  }
}

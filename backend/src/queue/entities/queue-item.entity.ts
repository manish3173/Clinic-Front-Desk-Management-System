import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';

export enum QueueStatus {
  WAITING = 'waiting',
  WITH_DOCTOR = 'with_doctor',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('queue_items')
export class QueueItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  queueNumber: number;

  @ManyToOne(() => Patient, patient => patient.queueItems)
  patient: Patient;

  @Column()
  patientId: number;

  @Column({
    type: 'enum',
    enum: QueueStatus,
    default: QueueStatus.WAITING,
  })
  status: QueueStatus;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.NORMAL,
  })
  priority: Priority;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'datetime', nullable: true })
  calledAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @Column({ default: 0 })
  estimatedWaitTime: number; // in minutes

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

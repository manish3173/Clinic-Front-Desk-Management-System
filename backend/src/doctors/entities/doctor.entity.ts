import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';

export enum DoctorSpecialization {
  GENERAL_PRACTITIONER = 'general_practitioner',
  CARDIOLOGIST = 'cardiologist',
  DERMATOLOGIST = 'dermatologist',
  PEDIATRICIAN = 'pediatrician',
  NEUROLOGIST = 'neurologist',
  ORTHOPEDIC = 'orthopedic',
  PSYCHIATRIST = 'psychiatrist',
  GYNECOLOGIST = 'gynecologist',
  UROLOGIST = 'urologist',
  OPHTHALMOLOGIST = 'ophthalmologist',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({
    type: 'enum',
    enum: DoctorSpecialization,
    default: DoctorSpecialization.GENERAL_PRACTITIONER,
  })
  specialization: DoctorSpecialization;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column()
  location: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ type: 'time', default: '09:00:00' })
  startTime: string;

  @Column({ type: 'time', default: '17:00:00' })
  endTime: string;

  @Column({ type: 'json', nullable: true })
  availableDays: string[]; // ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

  @OneToMany(() => Appointment, appointment => appointment.doctor)
  appointments: Appointment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

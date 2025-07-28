import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { DoctorsModule } from './doctors/doctors.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { QueueModule } from './queue/queue.module';
import { User } from './auth/entities/user.entity';
import { Doctor } from './doctors/entities/doctor.entity';
import { Patient } from './patients/entities/patient.entity';
import { Appointment } from './appointments/entities/appointment.entity';
import { QueueItem } from './queue/entities/queue-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Doctor, Patient, Appointment, QueueItem],
      synchronize: true, // Set to false in production
      logging: false,
    }),
    AuthModule,
    DoctorsModule,
    PatientsModule,
    AppointmentsModule,
    QueueModule,
  ],
})
export class AppModule {}

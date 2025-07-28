import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    // Check for conflicting appointments
    const conflictingAppointment = await this.checkForConflicts(
      createAppointmentDto.doctorId,
      createAppointmentDto.appointmentDate,
      createAppointmentDto.appointmentTime,
      createAppointmentDto.duration || 30,
    );

    if (conflictingAppointment) {
      throw new BadRequestException('Doctor is not available at this time');
    }

    const appointment = this.appointmentsRepository.create(createAppointmentDto);
    return await this.appointmentsRepository.save(appointment);
  }

  async findAll(): Promise<Appointment[]> {
    return await this.appointmentsRepository.find({
      relations: ['patient', 'doctor'],
      order: { appointmentDate: 'ASC', appointmentTime: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });
    
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    
    return appointment;
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);
    
    // If updating date/time, check for conflicts
    if (updateAppointmentDto.appointmentDate || updateAppointmentDto.appointmentTime) {
      const doctorId = updateAppointmentDto.doctorId || appointment.doctorId;
      const appointmentDate = updateAppointmentDto.appointmentDate || appointment.appointmentDate.toISOString().split('T')[0];
      const appointmentTime = updateAppointmentDto.appointmentTime || appointment.appointmentTime;
      const duration = updateAppointmentDto.duration || appointment.duration;

      const conflictingAppointment = await this.checkForConflicts(
        doctorId,
        appointmentDate,
        appointmentTime,
        duration,
        id, // Exclude current appointment from conflict check
      );

      if (conflictingAppointment) {
        throw new BadRequestException('Doctor is not available at this time');
      }
    }

    await this.appointmentsRepository.update(id, updateAppointmentDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.appointmentsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
  }

  async findByPatient(patientId: number): Promise<Appointment[]> {
    return await this.appointmentsRepository.find({
      where: { patientId },
      relations: ['patient', 'doctor'],
      order: { appointmentDate: 'ASC', appointmentTime: 'ASC' },
    });
  }

  async findByDoctor(doctorId: number): Promise<Appointment[]> {
    return await this.appointmentsRepository.find({
      where: { doctorId },
      relations: ['patient', 'doctor'],
      order: { appointmentDate: 'ASC', appointmentTime: 'ASC' },
    });
  }

  async findByStatus(status: AppointmentStatus): Promise<Appointment[]> {
    return await this.appointmentsRepository.find({
      where: { status },
      relations: ['patient', 'doctor'],
      order: { appointmentDate: 'ASC', appointmentTime: 'ASC' },
    });
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Appointment[]> {
    return await this.appointmentsRepository.find({
      where: {
        appointmentDate: Between(new Date(startDate), new Date(endDate)),
      },
      relations: ['patient', 'doctor'],
      order: { appointmentDate: 'ASC', appointmentTime: 'ASC' },
    });
  }

  async updateStatus(id: number, status: AppointmentStatus): Promise<Appointment> {
    await this.appointmentsRepository.update(id, { status });
    return this.findOne(id);
  }

  private async checkForConflicts(
    doctorId: number,
    appointmentDate: string,
    appointmentTime: string,
    duration: number,
    excludeAppointmentId?: number,
  ): Promise<boolean> {
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const startTime = new Date();
    startTime.setHours(hours, minutes, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);

    const queryBuilder = this.appointmentsRepository
      .createQueryBuilder('appointment')
      .where('appointment.doctorId = :doctorId', { doctorId })
      .andWhere('DATE(appointment.appointmentDate) = :appointmentDate', { appointmentDate })
      .andWhere('appointment.status != :cancelledStatus', { cancelledStatus: AppointmentStatus.CANCELLED });

    if (excludeAppointmentId) {
      queryBuilder.andWhere('appointment.id != :excludeAppointmentId', { excludeAppointmentId });
    }

    const existingAppointments = await queryBuilder.getMany();

    for (const existing of existingAppointments) {
      const [existingHours, existingMinutes] = existing.appointmentTime.split(':').map(Number);
      const existingStart = new Date();
      existingStart.setHours(existingHours, existingMinutes, 0, 0);
      
      const existingEnd = new Date(existingStart);
      existingEnd.setMinutes(existingEnd.getMinutes() + existing.duration);

      // Check for time overlap
      if (
        (startTime >= existingStart && startTime < existingEnd) ||
        (endTime > existingStart && endTime <= existingEnd) ||
        (startTime <= existingStart && endTime >= existingEnd)
      ) {
        return true; // Conflict found
      }
    }

    return false; // No conflict
  }
}

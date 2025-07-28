import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const patient = this.patientsRepository.create(createPatientDto);
    return await this.patientsRepository.save(patient);
  }

  async findAll(): Promise<Patient[]> {
    return await this.patientsRepository.find({
      relations: ['appointments', 'queueItems'],
    });
  }

  async findOne(id: number): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { id },
      relations: ['appointments', 'queueItems'],
    });
    
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    
    return patient;
  }

  async update(id: number, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    await this.patientsRepository.update(id, updatePatientDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const patient = await this.findOne(id);
    
    // Remove related queue items first
    if (patient.queueItems && patient.queueItems.length > 0) {
      await this.patientsRepository
        .createQueryBuilder()
        .delete()
        .from('queue_items')
        .where('patientId = :id', { id })
        .execute();
    }
    
    // Remove related appointments
    if (patient.appointments && patient.appointments.length > 0) {
      await this.patientsRepository
        .createQueryBuilder()
        .delete()
        .from('appointments')
        .where('patientId = :id', { id })
        .execute();
    }
    
    // Now remove the patient
    const result = await this.patientsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
  }

  async findByName(name: string): Promise<Patient[]> {
    return await this.patientsRepository.find({
      where: [
        { firstName: Like(`%${name}%`) },
        { lastName: Like(`%${name}%`) },
      ],
      relations: ['appointments', 'queueItems'],
    });
  }

  async findByEmail(email: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { email },
      relations: ['appointments', 'queueItems'],
    });
    
    if (!patient) {
      throw new NotFoundException(`Patient with email ${email} not found`);
    }
    
    return patient;
  }

  async findByPhone(phone: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { phone },
      relations: ['appointments', 'queueItems'],
    });
    
    if (!patient) {
      throw new NotFoundException(`Patient with phone ${phone} not found`);
    }
    
    return patient;
  }
}

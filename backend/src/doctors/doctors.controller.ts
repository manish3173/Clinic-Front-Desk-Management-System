import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { DoctorSpecialization } from './entities/doctor.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('doctors')
@UseGuards(JwtAuthGuard)
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorsService.create(createDoctorDto);
  }

  @Get()
  findAll() {
    return this.doctorsService.findAll();
  }

  @Get('search')
  searchDoctors(
    @Query('specialization') specialization?: DoctorSpecialization,
    @Query('location') location?: string,
    @Query('isAvailable') isAvailable?: boolean,
  ) {
    return this.doctorsService.searchDoctors({
      specialization,
      location,
      isAvailable,
    });
  }

  @Get('available')
  findAvailable() {
    return this.doctorsService.findAvailable();
  }

  @Get('specialization/:specialization')
  findBySpecialization(@Param('specialization') specialization: DoctorSpecialization) {
    return this.doctorsService.findBySpecialization(specialization);
  }

  @Get('location/:location')
  findByLocation(@Param('location') location: string) {
    return this.doctorsService.findByLocation(location);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorsService.update(+id, updateDoctorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doctorsService.remove(+id);
  }
}

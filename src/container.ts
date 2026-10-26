import { DataSource } from 'typeorm';
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { User } from './entities/user.entity';
import { BcryptPasswordHasher, JwtTokenProvider } from './infra/security';
import { TypeormUserRepository } from './repositories/typeorm-user.repository';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { PatientController } from './controllers/patient.controller';
import { Patient } from './entities/patient.entity';
import { TypeormPatientRepository } from './repositories/typeorm-patient.repository';
import { PatientService } from './services/patient.service';
import { DoctorController } from './controllers/doctor.controller';
import { TypeormDoctorRepository } from './repositories/typeorm-doctor.repository';
import { DoctorService } from './services/doctor.service';

export function buildControllers(ds: DataSource) {
  const hasher = new BcryptPasswordHasher();
  const tokens = new JwtTokenProvider();

  const userRepo = new TypeormUserRepository(ds.getRepository(User));
  const patientRepo = new TypeormPatientRepository(ds.getRepository(Patient));
  const doctorRepo = new TypeormDoctorRepository(ds);



  const authService = new AuthService(userRepo, hasher, tokens);
  const userService = new UserService(userRepo, hasher);
  const patientService = new PatientService(patientRepo);
  const doctorService = new DoctorService(userRepo, doctorRepo, hasher);



  return {
    auth: new AuthController(authService),
    users: new UserController(userService),
    patients: new PatientController(patientService),
    doctors: new DoctorController(doctorService),
  };
}

export type Controllers = ReturnType<typeof buildControllers>;
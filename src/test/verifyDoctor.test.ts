import { Request, Response } from 'express';
import { verifyDoctor } from '../controllers/auth.controller';
import { User } from '../models/auth.model';
import { Admin } from '../models/admin.model';
import * as notifications from '../utils/notifications';

describe('verifyDoctor endpoint', () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    req = {
      params: { id: 'doctorID' },
      user: { id: 'adminID' },
    } as any;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should update the doctor verification status to verified', async () => {
    const doctor = {
      id: 'doctorID',
      role: 'Doctor',
      status: 'pending',
      save: jest.fn(),
      email: 'doctor@example.com',
    } as any;
    jest.spyOn(User, 'findOne').mockResolvedValue(doctor);
    jest.spyOn(doctor, 'save').mockResolvedValue(doctor);
  
    const notificationsMock = { ...notifications };
    const sendVerificationEmailToDoctorMock = jest.fn();
    notificationsMock.sendVerificationEmailToDoctor = sendVerificationEmailToDoctorMock;
  
    jest.doMock('../utils/notifications', () => notificationsMock);
  
    await verifyDoctor(req, res);
  
    expect(doctor.status).toEqual('verified');
    expect(doctor.save).toHaveBeenCalled();
  });
  

  it('should update the doctor verification status to pending', async () => {
    const doctor = {
      id: 'doctorID',
      role: 'Doctor',
      status: 'verified',
      save: jest.fn(),
    } as any;
    jest.spyOn(User, 'findOne').mockResolvedValue(doctor);
    jest.spyOn(doctor, 'save').mockResolvedValue(doctor);

    await verifyDoctor(req, res);

    expect(doctor.status).toEqual('pending');
    expect(doctor.save).toHaveBeenCalled();
  });

  it('should associate an admin with the doctor if adminId is provided', async () => {
    const doctor = {
      id: 'doctorID',
      role: 'Doctor',
      status: 'pending',
      adminId: 'adminID',
      save: jest.fn(),
    } as any;
    const admin = { id: 'adminID' } as any;
    jest.spyOn(User, 'findOne').mockResolvedValue(doctor);
    jest.spyOn(doctor, 'save').mockResolvedValue(doctor);
    jest.spyOn(Admin, 'findByPk').mockResolvedValue(admin);

    await verifyDoctor(req, res);

    expect(doctor.adminId).toEqual('adminID');
    expect(doctor.save).toHaveBeenCalled();
  });

  it('should return a 404 error if doctor is not found', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);

    await verifyDoctor(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Doctor not found' });
  });

  it('should return a 500 error for internal server error', async () => {
    jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Some error occurred'));

    await verifyDoctor(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});

import { Request, Response } from 'express';
import { getAllDoctors } from '../controllers/auth.controller';
import { User } from '../models/auth.model';

describe('GET /doctors', () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    req = {} as Request;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should fetch all doctors', async () => {
    const allDoctors = [
      { id: '1', fullName: 'Doctor 1', role: 'Doctor' },
      { id: '2', fullName: 'Doctor 2', role: 'Doctor' },
      { id: '3', fullName: 'Doctor 3', role: 'Doctor' },
    ] as User[];

    jest.spyOn(User, 'findAll').mockResolvedValue(allDoctors);

    await getAllDoctors(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ allDoctors, message: 'All doctors found' });
  });
   
  it('should handle errors and return 500 status code', async () => {
    
    jest.spyOn(User, 'findAll').mockRejectedValue(new Error('error occurred'));

    await getAllDoctors(req, res);
    expect(res.status).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});

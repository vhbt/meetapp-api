import request from 'supertest';
import app from '../../src/app';
import truncate from '../util/truncate';

beforeAll(async () => {
  await truncate();
});

afterAll(async () => {
  await truncate();
});

describe('Session', () => {
  it('should return 400 if password is missing when signing in', async () => {
    const response = await request(app)
      .post('/sessions')
      .send({
        email: 'vhbarauna@gmail.com',
      });

    expect(response.statusCode).toBe(400);
  });

  it('should return 401 if user does not exist when signing in', async () => {
    const response = await request(app)
      .post('/sessions')
      .send({
        email: 'idontexist@gmail.com',
        password: '123456',
      });

    expect(response.statusCode).toBe(401);
  });

  it('should return 401 if user password does not match', async () => {
    const response = await request(app)
      .post('/sessions')
      .send({
        email: 'vhbarauna@gmail.com',
        password: '1234567',
      });

    expect(response.statusCode).toBe(401);
  });
});

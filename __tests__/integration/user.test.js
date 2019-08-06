import request from 'supertest';
import app from '../../src/app';
import truncate from '../util/truncate';

let user_raw;

beforeAll(async () => {
  await truncate();
});

afterAll(async () => {
  await truncate();
});

describe('User', () => {
  it('should be able to register and login', async () => {
    await request(app)
      .post('/users')
      .send({
        name: 'Vitor Hariel',
        email: 'vhbarauna@gmail.com',
        password: '123456',
      });

    await request(app)
      .post('/users')
      .send({
        name: 'Bob Lee',
        email: 'bob@gmail.com',
        password: '123456',
      });

    const login_response = await request(app)
      .post('/sessions')
      .send({
        email: 'vhbarauna@gmail.com',
        password: '123456',
      });

    user_raw = login_response.body;

    expect(user_raw.user).toHaveProperty('id');
  });

  it('should return 400 if registering user has missing fields', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        email: 'vhbarauna@gmail.com',
        password: '123456',
      });

    expect(response.statusCode).toBe(400);
  });

  it('should return 400 if registering with duplicate email', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        name: 'Vitor Hariel',
        email: 'vhbarauna@gmail.com',
        password: '123456',
      });

    expect(response.statusCode).toBe(400);
  });

  it('should be able to update the user name and email', async () => {
    const result = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${user_raw.token}`)
      .send({
        name: 'Vitor Hariel B. Tubino',
        email: 'hey@vitorhariel.com',
      });

    expect(result.body).toHaveProperty('id');
  });

  it('should return 400 if email is missing when updating user', async () => {
    const result = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${user_raw.token}`)
      .send({
        name: 'Vitor Hariel B. Tubino',
      });

    expect(result.statusCode).toBe(400);
  });

  it('should return 401 if user password does not match when updating password', async () => {
    const result = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${user_raw.token}`)
      .send({
        name: 'Vitor Hariel B. Tubino',
        email: 'vhbarauna@gmail.com',
        oldPassword: '1234567',
      });

    expect(result.statusCode).toBe(400);
  });

  it('should return 400 if user tries to update to an existent email', async () => {
    const result = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${user_raw.token}`)
      .send({
        name: 'Another Bob',
        email: 'bob@gmail.com',
        oldPassword: '123456',
      });

    expect(result.statusCode).toBe(400);
  });
});

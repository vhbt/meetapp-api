import request from 'supertest';
import path from 'path';
import app from '../../src/app';

import truncate from '../util/truncate';

describe('User', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to register', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        name: 'Vitor Hariel',
        email: 'vhbarauna@gmail.com',
        password: '123456',
      });

    expect(response.body).toHaveProperty('id');
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
    await request(app)
      .post('/users')
      .send({
        name: 'Vitor Hariel',
        email: 'vhbarauna@gmail.com',
        password: '123456',
      });

    const response = await request(app)
      .post('/users')
      .send({
        name: 'Vitor Hariel',
        email: 'vhbarauna@gmail.com',
        password: '123456',
      });

    expect(response.statusCode).toBe(400);
  });

  it('should be able to register, login and update the user name and email', async () => {
    // register
    await request(app)
      .post('/users')
      .send({
        name: 'Vitor Hariel',
        email: 'vhbarauna@gmail.com',
        password: '123456',
      });

    // get token
    const response = await request(app)
      .post('/sessions')
      .send({
        email: 'vhbarauna@gmail.com',
        password: '123456',
      });

    const { token } = response.body;

    // update
    const result = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Vitor Hariel B. Tubino',
        email: 'hey@vitorhariel.com',
      });

    expect(result.body).toHaveProperty('id');
  });

  it('should return 400 if email is missing when updating user', async () => {
    // register
    await request(app)
      .post('/users')
      .send({
        name: 'Vitor Hariel',
        email: 'vhbarauna@gmail.com',
        password: '123456',
      });

    // get token
    const response = await request(app)
      .post('/sessions')
      .send({
        email: 'vhbarauna@gmail.com',
        password: '123456',
      });

    const { token } = response.body;

    // update
    const result = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Vitor Hariel B. Tubino',
      });

    expect(result.statusCode).toBe(400);
  });

  it('should return 401 if user password does not match when updating password', async () => {
    // register
    await request(app)
      .post('/users')
      .send({
        name: 'Vitor Hariel',
        email: 'vhbarauna@gmail.com',
        password: '123456',
      });

    // get token
    const response = await request(app)
      .post('/sessions')
      .send({
        email: 'vhbarauna@gmail.com',
        password: '123456',
      });

    const { token } = response.body;

    // update
    const result = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Vitor Hariel B. Tubino',
        email: 'vhbarauna@gmail.com',
        oldPassword: '1234567',
      });

    expect(result.statusCode).toBe(400);
  });

  it('should return 400 if user tries to update to an existent email', async () => {
    // register
    await request(app)
      .post('/users')
      .send({
        name: 'Vitor Hariel',
        email: 'hey@vitorhariel.com',
        password: '123456',
      });

    // register
    await request(app)
      .post('/users')
      .send({
        name: 'Vitor Hariel',
        email: 'vhbarauna@gmail.com',
        password: '123456',
      });

    // get token
    const response = await request(app)
      .post('/sessions')
      .send({
        email: 'vhbarauna@gmail.com',
        password: '123456',
      });

    const { token } = response.body;

    // update
    const result = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Vitor Hariel B. Tubino',
        email: 'hey@vitorhariel.com',
        oldPassword: '123456',
      });

    expect(result.statusCode).toBe(400);
  });
});

describe('Session', () => {
  it('should return 400 if password is missing when signing in', async () => {
    // register
    await request(app)
      .post('/users')
      .send({
        name: 'Vitor Hariel',
        email: 'vhbarauna@gmail.com',
        password: '123456',
      });

    // get token
    const response = await request(app)
      .post('/sessions')
      .send({
        email: 'vhbarauna@gmail.com',
      });

    expect(response.statusCode).toBe(400);
  });

  it('should return 401 if user does not exist when signing in', async () => {
    // get token
    const response = await request(app)
      .post('/sessions')
      .send({
        email: 'idontexist@gmail.com',
        password: '123456',
      });

    expect(response.statusCode).toBe(401);
  });

  it('should return 401 if user password does not match', async () => {
    // register
    await request(app)
      .post('/users')
      .send({
        name: 'Vitor Hariel',
        email: 'vhbarauna@gmail.com',
        password: '123456',
      });

    // get token
    const response = await request(app)
      .post('/sessions')
      .send({
        email: 'vhbarauna@gmail.com',
        password: '1234567',
      });

    expect(response.statusCode).toBe(401);
  });
});

describe('Meetup', () => {
  it('should be able to create a meetup', async () => {
    // register
    await request(app)
      .post('/users')
      .send({
        name: 'Vitor Hariel',
        email: 'vhbarauna@gmail.com',
        password: '123456',
      });

    // get token
    const response = await request(app)
      .post('/sessions')
      .send({
        email: 'vhbarauna@gmail.com',
        password: '123456',
      });

    const { token } = response.body;

    // create file
    const file = await request(app)
      .post('/banner')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', path.resolve(__dirname, '..', 'banner.jpeg'));

    const { id } = file.body;

    // create meetup
    const result = await request(app)
      .post('/meetups')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'My first meetup!',
        description: 'This is my first meetup.',
        location: 'Mountains',
        date: '2030-08-20T03:00:00-03:00',
        banner_id: id,
      });

    expect(result.body).toHaveProperty('id');
  });
});

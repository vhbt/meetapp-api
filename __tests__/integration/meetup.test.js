import request from 'supertest';
import app from '../../src/app';
import truncate from '../util/truncate';
import File from '../../src/app/models/File';

let user_raw;

beforeAll(async () => {
  await truncate();
  await request(app)
    .post('/users')
    .send({
      name: 'Vitor Hariel',
      email: 'vhbarauna@gmail.com',
      password: '123456',
    });

  const login_response = await request(app)
    .post('/sessions')
    .send({
      email: 'vhbarauna@gmail.com',
      password: '123456',
    });

  user_raw = login_response.body;
});

afterAll(async () => {
  await truncate();
});

describe('Meetup', () => {
  it('should be able to create a meetup', async () => {
    const file = await File.create({
      id: 1,
      name: 'test.jpeg',
      path: '9c33796621d2cd66d51cbdd343cadc44.jpeg',
    });

    const { id } = file.dataValues;

    const result = await request(app)
      .post('/meetups')
      .set('Authorization', `Bearer ${user_raw.token}`)
      .send({
        title: 'My first meetup!',
        description: 'This is my first meetup.',
        location: 'Mountains',
        date: '2025-08-20T03:00:00-03:00',
        banner_id: id,
      });

    expect(result.body).toHaveProperty('id');
  });

  it('should return all meetups', async () => {
    const result = await request(app)
      .get('/meetups')
      .set('Authorization', `Bearer ${user_raw.token}`);

    expect(result.body).toBeTruthy();
  });
});

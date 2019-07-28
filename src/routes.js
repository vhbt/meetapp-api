import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import MeetupController from './app/controllers/MeetupController';
import OrganizingController from './app/controllers/OrganizingController';
import SubscriptionController from './app/controllers/SubscriptionController';
import BannerController from './app/controllers/BannerController';
import AvatarController from './app/controllers/AvatarController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.post('/banner', upload.single('file'), BannerController.store);
routes.post('/avatar', upload.single('file'), AvatarController.store);

routes.put('/users', UserController.update);

routes.get('/meetups', MeetupController.index);
routes.get('/meetups/:id', MeetupController.view);
routes.post('/meetups', MeetupController.store);
routes.put('/meetups/:id', MeetupController.update);
routes.delete('/meetups/:id', MeetupController.delete);

routes.get('/organizing', OrganizingController.index);
routes.get('/subscriptions', SubscriptionController.index);

routes.post('/meetups/:id/subscriptions', SubscriptionController.store);

export default routes;

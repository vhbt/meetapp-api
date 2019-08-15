import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';
import User from '../models/User';
import File from '../models/File';

import CreateSubscriptionService from '../services/CreateSubscriptionService';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },

          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name'],
              where: {
                id: {
                  [Op.not]: req.userId,
                },
              },
            },
            {
              model: File,
              as: 'banner',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
      order: [[Meetup, 'date']],
    });
    return res.json(subscriptions);
  }

  async store(req, res) {
    const { userId } = req;
    const { id } = req.params;

    const subscription = await CreateSubscriptionService.run({
      userId,
      meetup_id: id,
    });

    return res.json(subscription);
  }

  async delete(req, res) {
    const user = await User.findByPk(req.userId);
    const meetup = await Meetup.findByPk(req.params.id, {
      include: {
        model: User,
        as: 'user',
        attributes: ['name', 'email'],
      },
    });

    if (!meetup) {
      return res.status(401).json({ error: 'Meetup does not exist.' });
    }

    if (req.userId === meetup.user_id) {
      return res
        .status(401)
        .json({ error: 'You can not unsubscribe to a meetup you organize.' });
    }

    if (meetup.past) {
      return res.status(401).json({ error: 'This meetup already happened.' });
    }

    const subscribed = await Subscription.findOne({
      where: {
        user_id: user.id,
        meetup_id: meetup.id,
      },
    });

    if (!subscribed) {
      return res
        .status(401)
        .json({ error: 'You are not subscribed to this meetup.' });
    }

    subscribed.destroy();

    return res.json(subscribed);
  }
}

export default new SubscriptionController();

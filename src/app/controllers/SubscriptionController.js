import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';
import User from '../models/User';
import File from '../models/File';

import SubscriptionMail from '../jobs/SubscriptionMail';
import Queue from '../../lib/Queue';

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
        .json({ error: 'You can not subscribe to a meetup you organize.' });
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

    if (subscribed) {
      return res
        .status(401)
        .json({ error: 'You are already subscribed to this meetup.' });
    }

    const checkDate = await Subscription.findOne({
      where: {
        user_id: user.id,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (checkDate) {
      return res.status(400).json({
        error: "You can't subscribe to two meetups at the same time.",
      });
    }

    const subscription = await Subscription.create({
      user_id: user.id,
      meetup_id: meetup.id,
    });

    await Queue.add(SubscriptionMail.key, {
      meetup,
      user,
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

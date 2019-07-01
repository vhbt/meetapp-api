import { Op } from 'sequelize';
import { isBefore, parseISO } from 'date-fns';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';

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
        },
      ],
      order: [[Meetup, 'date']],
    });
    return res.json(subscriptions);
  }

  async store(req, res) {
    const { id } = req.params;
    const meetup = await Meetup.findOne({
      where: {
        id,
      },
    });

    if (!meetup) {
      return res.status(401).json({ error: 'Meetup doe  s not exist.' });
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
        user_id: req.userId,
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
        user_id: req.userId,
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
      user_id: req.userId,
      meetup_id: meetup.id,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();

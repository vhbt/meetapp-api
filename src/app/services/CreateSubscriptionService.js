import User from '../models/User';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';

import SubscriptionMail from '../jobs/SubscriptionMail';
import Queue from '../../lib/Queue';

import ServiceError from './ErrorService';

class CreateSubscriptionService {
  async run({ userId, meetup_id }) {
    const user = await User.findByPk(userId);
    const meetup = await Meetup.findByPk(meetup_id, {
      include: {
        model: User,
        as: 'user',
        attributes: ['name', 'email'],
      },
    });

    if (!meetup) {
      throw new ServiceError(401, 'Meetup does not exist.');
    }

    if (userId === meetup.user_id) {
      throw new ServiceError(
        401,
        'You can not subscribe to a meetup you organize.'
      );
    }

    if (meetup.past) {
      throw new ServiceError(401, 'This meetup already happened.');
    }

    const subscribed = await Subscription.findOne({
      where: {
        user_id: user.id,
        meetup_id: meetup.id,
      },
    });

    if (subscribed) {
      throw new ServiceError(401, 'You are already subscribed to this meetup.');
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
      throw new ServiceError(
        400,
        "You can't subscribe to two meetups at the same time."
      );
    }

    const subscription = await Subscription.create({
      user_id: user.id,
      meetup_id: meetup.id,
    });

    await Queue.add(SubscriptionMail.key, {
      meetup,
      user,
    });

    return subscription;
  }
}

export default new CreateSubscriptionService();

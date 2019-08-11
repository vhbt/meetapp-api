import { isBefore, startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';

import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';
import Subscription from '../models/Subscription';

class MeetupController {
  async index(req, res) {
    const where = {
      canceled_at: null,
    };
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    if (req.query.date) {
      const searchDate = parseISO(req.query.date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      limit,
      offset: (page - 1) * 10,
      order: ['date'],
      attributes: [
        'past',
        'id',
        'title',
        'description',
        'location',
        'date',
        'canceled_at',
        'canceled',
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(meetups);
  }

  async view(req, res) {
    const { id } = req.params;

    const meetup = await Meetup.findOne({
      where: {
        id,
      },
      attributes: [
        'past',
        'id',
        'title',
        'description',
        'location',
        'date',
        'user_id',
        'canceled_at',
        'canceled',
      ],
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url'],
        },
        {
          model: Subscription,
          attributes: ['user_id'],
          include: [
            {
              model: User,
              attributes: ['name'],
              include: [
                {
                  model: File,
                  as: 'avatar',
                },
              ],
            },
          ],
        },
      ],
    });

    if (!meetup) {
      return res.status(401).json({ error: 'Meetup does not exist.' });
    }

    return res.json(meetup);
  }

  async store(req, res) {
    const { title, description, location, date, banner_id } = req.body;

    if (isBefore(parseISO(date), new Date())) {
      return res
        .status(400)
        .json({ error: 'You can not create an meetup to a passed date.' });
    }

    const user_id = req.userId;

    const meetup = await Meetup.create({
      title,
      description,
      location,
      date,
      user_id,
      banner_id,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const { title, description, location, date, banner_id } = req.body;

    const meetup = await Meetup.findOne({
      where: {
        id: req.params.id,
        user_id: req.userId,
      },
    });

    if (!meetup) {
      return res.status(401).json({ error: 'You can not edit this meetup.' });
    }

    if (isBefore(parseISO(date), new Date())) {
      return res
        .status(401)
        .json({ error: 'You can not choose an date that has already passed.' });
    }

    meetup.update({
      title,
      description,
      location,
      date,
      banner_id,
    });

    return res.json(meetup);
  }

  async delete(req, res) {
    const meetup = await Meetup.findOne({
      where: {
        id: req.params.id,
        user_id: req.userId,
      },
    });

    if (!meetup) {
      return res.status(401).json({ error: 'You can not delete this meetup.' });
    }

    if (meetup.past) {
      return res
        .status(401)
        .json({ error: 'You can not delete meetups that already happened.' });
    }

    meetup.update({
      canceled_at: new Date(),
    });

    return res.json(meetup);
  }
}

export default new MeetupController();

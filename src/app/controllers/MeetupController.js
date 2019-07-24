import * as Yup from 'yup';
import { isBefore, startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupController {
  async index(req, res) {
    const where = {};
    const page = req.query.page || 1;

    if (req.query.date) {
      const searchDate = parseISO(req.query.date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      limit: 10,
      offset: (page - 1) * 10,
      order: ['date'],
      attributes: ['past', 'id', 'title', 'description', 'location', 'date'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const validationSchema = Yup.object().shape({
      title: Yup.string().required('Title can not be empty.'),
      description: Yup.string().required('Description can not be empty.'),
      location: Yup.string().required('Location can not be empty.'),
      date: Yup.date().required('Date can not be empty.'),
      banner: Yup.number(),
    });

    try {
      await validationSchema.validate(req.body, {
        abortEarly: false,
      });
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }

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

  async view(req, res) {
    const validationSchema = Yup.object().shape({
      id: Yup.number().required(),
    });

    try {
      await validationSchema.validate(req.params, {
        abortEarly: false,
      });
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }

    const { id } = req.params;

    const meetup = await Meetup.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!meetup) {
      return res.status(401).json({ error: 'Meetup does not exist.' });
    }

    return res.json(meetup)
  }

  async update(req, res) {
    const validationSchema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      banner: Yup.number(),
    });

    try {
      await validationSchema.validate(req.body, {
        abortEarly: false,
      });
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }

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

    meetup.destroy();

    return res.json(meetup);
  }
}

export default new MeetupController();

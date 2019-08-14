import { literal } from 'sequelize';
import Meetup from '../models/Meetup';
import File from '../models/File';

class OrganizingController {
  async index(req, res) {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;

    const meetups = await Meetup.findAll({
      offset: (page - 1) * limit,
      limit,
      where: {
        user_id: req.userId,
      },
      attributes: [
        'past',
        'id',
        'title',
        'description',
        'location',
        'date',
        'canceled',
        'canceled_at',
      ],
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['path', 'url'],
        },
      ],
      order: [
        [literal('date < NOW()')],
        ['canceled_at', 'DESC NULLS FIRST'],
        ['date', 'ASC'],
      ],
    });

    return res.json(meetups);
  }
}

export default new OrganizingController();

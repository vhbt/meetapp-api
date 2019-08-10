import sequelize from 'sequelize';
import Meetup from '../models/Meetup';
import File from '../models/File';

class OrganizingController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
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
        [sequelize.literal('date < NOW()')],
        ['canceled_at', 'DESC NULLS FIRST'],
        ['date', 'ASC'],
      ],
    });

    return res.json(meetups);
  }
}

export default new OrganizingController();

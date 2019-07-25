import Meetup from '../models/Meetup';
import File from '../models/File';

class OrganizingController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: {
        user_id: req.userId,
      },
      attributes: ['past', 'id', 'title', 'description', 'location', 'date'],
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['path', 'url'],
        },
      ],
      order: [['date', 'DESC']],
    });

    return res.json(meetups);
  }
}

export default new OrganizingController();

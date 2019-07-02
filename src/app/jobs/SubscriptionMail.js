import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, user } = data;
    await Mail.sendMail({
      to: `${meetup.user.name} <${meetup.user.email}>`,
      subject: 'Um usuário se inscreveu no seu meetup!',
      template: 'subscription',
      context: {
        organizer: meetup.user.name,
        title: meetup.title,
        user: user.name,
      },
    });
  }
}

export default new SubscriptionMail();

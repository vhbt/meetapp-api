import * as Yup from 'yup';

export default async (req, res, next) => {
  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title can not be empty.'),
    description: Yup.string().required('Description can not be empty.'),
    location: Yup.string().required('Location can not be empty.'),
    date: Yup.date().required('Date can not be empty.'),
    banner_id: Yup.number().required('You must set a banner for the meetup.'),
  });

  try {
    await validationSchema.validate(req.body, { abortEarly: false });
    return next();
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Validation fails.', messages: err.errors });
  }
};

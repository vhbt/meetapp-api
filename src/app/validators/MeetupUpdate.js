import * as Yup from 'yup';

export default async (req, res, next) => {
  const validationSchema = Yup.object().shape({
    title: Yup.string(),
    description: Yup.string(),
    location: Yup.string(),
    date: Yup.date(),
    banner_id: Yup.number(),
  });

  try {
    await validationSchema.validate(req.params, { abortEarly: false });
    return next();
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Validation fails.', messages: err.errors });
  }
};

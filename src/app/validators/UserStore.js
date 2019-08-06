import * as Yup from 'yup';

export default async (req, res, next) => {
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name not provided.'),
    email: Yup.string()
      .email('Email must be a valid email.')
      .required('Email not provided.'),
    password: Yup.string()
      .required('Password not provided.')
      .min(6, 'Password must > 6 characters.'),
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

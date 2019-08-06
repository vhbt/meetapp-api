import * as Yup from 'yup';

export default async (req, res, next) => {
  const validationSchema = Yup.object().shape({
    name: Yup.string().required(),
    email: Yup.string()
      .email('Email must be a valid email.')
      .required(),
    oldPassword: Yup.string()
      .min(6, 'Old password must be > 6 characters.')
      .when('password', (password, field) =>
        password ? field.required('Old password not provied') : field
      ),
    password: Yup.string().min(6, 'Password must be > 6 characters.'),
    confirmedPassword: Yup.string()
      .min(6, 'Confirmed password must be > 6 characters.')
      .when('password', (password, field) =>
        password
          ? field
              .required('Confirmed password not provided.')
              .oneOf(
                [Yup.ref('password')],
                'Confirmed password does not match.'
              )
          : field
      ),
    avatar_id: Yup.number(),
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

import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import * as Sentry from '@sentry/node';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(400).json({ error: 'Token not provided.' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    if (decoded.exp < Date.now() / 1000) throw new Error();

    req.userId = decoded.id;

    Sentry.configureScope(scope => {
      scope.setUser({ id: req.userId });
    });

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid.' });
  }
};

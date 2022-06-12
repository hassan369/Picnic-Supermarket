//function for server(router), data form api(req)

import jwt from 'jsonwebtoken';
import config from './config';

//generate new token pased on user information returned from databaseRouter
const getToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    config.JWT_SECRET,
    {
      expiresIn: '48h',
    }
  );
};

//for example isAuth to change user data
const isAuth = (req, res, next) => {
  //3 parameter from api
  const token = req.headers.authorization;
  if (token) {
    const onlyToken = token.slice(7, token.length);
    jwt.verify(onlyToken, config.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Invalid Token' });
      } else {
        req.user = decode; //set (email, name, isAdmin,...) in decode
        next(); //meaning everything is ok go to next handler
      }
    });
  } else {
    res.status(401).send({ message: 'Token is not supplied.' });
  }
};

//req.user in token from isAuth upthere
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return res.status(401).send({ message: 'Admin Token is not valid.' });
};

export { getToken, isAuth, isAdmin };

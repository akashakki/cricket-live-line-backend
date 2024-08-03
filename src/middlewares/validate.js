const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const CONSTANT=require('../config/constant')
const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' } })
    .validate(object);

  if (error) {
    var errorMessage = error.details.map((details) => details.message).join(', ');
    errorMessage = errorMessage.replace(/['"]+/g, '');
   return res.send({status:CONSTANT.BAD_REQUEST,message:errorMessage,data:{}});

  //  return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }
  Object.assign(req, value);
  return next();
};

module.exports = validate;

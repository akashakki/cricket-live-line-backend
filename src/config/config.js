const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3080),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    S3_BUCKET: Joi.string().description('the from field in the emails sent by the app'),
    AccessKeyID: Joi.string().description('the from field in the emails sent by the app'),
    SecretAccessKey: Joi.string().description('the from field in the emails sent by the app'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);
// console.log(envVars)

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  S3_BUCKET: envVars.S3_BUCKET,
  ACCESS_KEY: envVars.ACCESS_KEY,
  SECRET_KEY: envVars.SECRET_KEY,
  S3_REGION: envVars.S3_REGION,
  SITE_URL: envVars.SITE_URL,
  ADMIN_URL: envVars.ADMIN_URL,
  API_URL: envVars.API_URL,
  SENDGRID_API_KEY: envVars.SENDGRID_API_KEY,
  STRIPE_API_KEY: envVars.STRIPE_API_KEY,
  username: envVars.BASIC_AUTH_USERNAME,
  password: envVars.BASIC_AUTH_PASSWORD,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    ip : envVars.DB_IP,
    user : envVars.DB_USER,
    pass : envVars.DB_PASSWORD,
    options: {
      // useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: 120,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  linkedInCredentials:{
    clientId: envVars.CLIENT_ID,
    clientSecret: envVars.CLIENT_SECRET,
    redirectUrl: envVars.REDIRECT_URL
  }
};

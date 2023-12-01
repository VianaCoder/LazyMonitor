const Joi = require('joi');

const serverSchema = Joi.object({
  name: Joi.string().required(),
  hostname: Joi.string().required(),
  monitoringPing: Joi.boolean().required(),
  monitoringHTTP: Joi.boolean().required(),
  monitoringUri: Joi.string(),
  healthStatusHTTP: Joi.boolean(),
  healthStatusPing: Joi.boolean()
});

module.exports = serverSchema;
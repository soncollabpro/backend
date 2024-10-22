'use strict';

/**
 * my-connect service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::my-connect.my-connect');

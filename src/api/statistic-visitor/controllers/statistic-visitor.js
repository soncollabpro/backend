'use strict';
const axios = require("axios");



/**
 * statistic-visitor controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::statistic-visitor.statistic-visitor', ({ strapi }) =>  ({

  async create(ctx){

    const { data } = ctx.request.body;

    if (!data) {
      return ctx.badRequest('data is required');
    }

    if(!data.uniqueKey){
      return ctx.badRequest('uniqueKey is required');
    }


    if(!data.days){
      return ctx.badRequest('days is required');
    }

    if(!data.ip){
      return ctx.badRequest('ip is required');
    }

    if (!data.country) {
      return ctx.badRequest('country is required');
    }

    if (!data.countryCode){
      return ctx.badRequest('countryCode is required');
    }

    if (!data.city){
      return ctx.badRequest('city is required');
    }

    if (!data.regionName){
      return ctx.badRequest('regionName is required');
    }


    if (!data.continent){
      return ctx.badRequest('continent is required');
    }

    const musicLinkCheck = await strapi.query('api::music-link.music-link').findOne({
      where: {
        uniqueKey: data.uniqueKey
      },
      populate: true,
    })

    if(!musicLinkCheck){
      return ctx.badRequest('MusicLink not found');
    }

    data.ip = await strapi.service('api::statistic-visitor.statistic-visitor').encodeIP(data.ip);

    const statisticVisitor = await strapi.query('api::statistic-visitor.statistic-visitor').create({
      data: {
       ...data,
        musiclink: musicLinkCheck.id,
        publishedAt: new Date()
      }
    })

    return ctx.send(statisticVisitor);

  }

}));




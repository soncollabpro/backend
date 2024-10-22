'use strict';

/**
 * statistic-click controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::statistic-click.statistic-click', ({ strapi }) =>  ({

  async create(ctx){

    const { data } = ctx.request.body;

    if (!data) {
      return ctx.badRequest('data is required');
    }


    if(!data.uniqueKey){
      return ctx.badRequest('uniqueKey is required');
    }

    if(!data.ip){
      return ctx.badRequest('ipAddress is required');
    }

    if(!data.days){
      return ctx.badRequest('days is required');
    }

    if (!data.type){
      return ctx.badRequest('type is required');
    }

    if (data.type!=='social' && data.type!=='platform') {
      return ctx.badRequest('Invalid type');
    }

    if(!data.from){
      return ctx.badRequest('from is required');
    }

    if (!data.continent){
      return ctx.badRequest('continent is required')
    }

    if(!data.city){
      return ctx.badRequest('city is required');
    }

    if(!data.country){
      return ctx.badRequest('country is required');
    }

    if (!data.countryCode){
      return ctx.badRequest('countryCode is required');
    }

    if (!data.regionName){
      return ctx.badRequest('regionName is required');
    }


    const musicLinkCheck = await strapi.query('api::music-link.music-link').findOne({
      where:{
        uniqueKey: data.uniqueKey
      }
    });

    if (!musicLinkCheck) {
      return ctx.badRequest('Music link not found');
    }

    console.log(musicLinkCheck.id)

    let socialCheck;
    let platformCheck

    if(data.type === 'social') {
      socialCheck = await strapi.query('api::music-link-social.music-link-social').findOne({
        where: {
          libelle: data.from
        }
      });

      if (!socialCheck) {
        return ctx.badRequest('Social media not found');
      }
    }

    if(data.type === 'platform') {
      platformCheck = await strapi.query('api::music-link-platform.music-link-platform').findOne({
        where: {
          libelle: data.from
        }
      });

      if (!platformCheck) {
        return ctx.badRequest('Platform not found');
      }
    }

    data.ip = await strapi.service('api::statistic-visitor.statistic-visitor').encodeIP(data.ip);

    const createStatisticClick = await strapi.query('api::statistic-click.statistic-click').create({
      data: {
       ...data,
        musiclink: musicLinkCheck.id,
        musiclinksocial: socialCheck? socialCheck.id : null,
        musiclinkplatform: platformCheck? platformCheck.id : null,
        publishedAt: new Date()
      }
    })

    console.log(createStatisticClick)


    return ctx.send(createStatisticClick);

  }

}));

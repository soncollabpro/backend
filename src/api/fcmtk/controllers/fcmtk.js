'use strict';

/**
 * fcmtk controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::fcmtk.fcmtk', ({ strapi }) =>  ({

  async create(ctx){
    const { data } = ctx.request.body;

    if (!data) {
      return ctx.badRequest('data is required');
    }

    if(!data.fcmtk){
      return ctx.badRequest('fcmtk is required');
    }


    if(!data.from){
      return ctx.badRequest('from is required');
    }

    if (data.from !== 'music-link'){
      return ctx.badRequest('Invalid from');
    }

    if (!data.uniqueKey){
      return ctx.badRequest('uniqueKey is required');
    }

    if (!data.subscription){
      return ctx.badRequest('subscription is required');
    }

    if (data.from === 'music-link'){
      const musicLinkCheck = await strapi.query('api::music-link.music-link').findOne({
        where: {
          uniqueKey: data.uniqueKey
        },
        populate: true,
      });

      if (!musicLinkCheck) {
        return ctx.badRequest('Music link not found');
      }

      const creator = musicLinkCheck.creator.id;

      const myfanbase = await strapi.query('api::my-fanbase.my-fanbase').findOne({
        where: {
          creator: creator,
        },
        populate: true,
      })

      if (!myfanbase) {
        return ctx.badRequest('My fanbase not found');
      }

      const fcmtk = await strapi.query('api::fcmtk.fcmtk').create({
        data: {
          token: data.fcmtk,
          myfanbase: myfanbase.id,
          musiclink: musicLinkCheck.id,
          subscription: data.subscription,
          publishedAt: new Date(),
        }
      })

      return ctx.send(fcmtk);
    }else {
      return ctx.badRequest('Invalid from');
    }
  }


}));

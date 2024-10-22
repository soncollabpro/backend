'use strict';

const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

/**
 * music-link controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::music-link.music-link', ({ strapi }) =>  ({

  async create(ctx){
    const hasAcctype = await strapi.service('api::creator.creator').verifyIfUserHasAcctype(ctx);
    if (!hasAcctype) {
      return ctx.unauthorized();
    }

    const { data } = ctx.request.body;

    const website = await strapi.query('api::website.website').findMany({});

    if (website.length === 0) {
      return ctx.badRequest('Website not found');
    }


    const me = await strapi.query('plugin::users-permissions.user').findOne({
      where: {id: ctx.state.user.id},
      populate:{
        creators:{
          populate:{
            musiclinks: {
              populate:{
                typelink: true,
              },
            },
          }
        },
        subscription: {
          populate: {
            plan: true,
            addons: true
          },

        },
      }
    });

    if (!me) {
      return ctx.unauthorized();
    }

    const subscription = me.subscription;
    const plan = subscription.plan;
    const addons = subscription.addons;

    const musicLinkCheck = addons.find((addon) => addon.libelle === 'Music Link');
    if(!musicLinkCheck){
      return ctx.badRequest('This subscription does not have the Music Link addon');
    }

    if (subscription.status === 'init'){
      return ctx.badRequest('Your subscription is not active');
    }


    // si subscription.status === free, expired, cancelled, on limit
    if (subscription.status === 'free' || subscription.status === 'expired' || subscription.status === 'cancelled') {


      if (data.theme === 'full-image' || data.linkDisplay === 'stacked' || data.titlePrimaryFont === 'Soncollab'){
        return  ctx.badRequest('request plan pro');
      }


      const musicLinkLimit = website[0].createMusicLinkLimit;
      if (me.creators[0].musiclinks.length >= musicLinkLimit) {
        return ctx.badRequest('You reached your music link limit');
      }
    }


    const musicLinks = await strapi.query('api::music-link.music-link').findMany({
      where:{
        creator: {
          $eq: me.creators[0].id
        },
        idLinkSpotify: data.idLinkSpotify,
        hasDelete: false,
      },
      populate:true,
    })

    if(musicLinks.length > 0){
      return ctx.badRequest('This music link already exists');
    }
    await slugify(data.smartLink);
    data.url = data.smartLink;

    spotifyApi.setAccessToken(await strapi.service('api::creator.creator').generateSpotifyToken());
    let trackOrAlbum;
    if (data.typeLinkspotify === 'single'){
      trackOrAlbum = await spotifyApi.getTrack(data.idLinkSpotify);
    }

    if (data.typeLinkspotify === 'album'){
      trackOrAlbum = await spotifyApi.getAlbum(data.idLinkSpotify);
    }

    const artists = trackOrAlbum.body.artists;
    // verify si il y au moins un name d'artist qui est egale a

    let artistsName = artists.find(artist => artist.name === me.creators[0].creatorName);
    if (!artistsName){
      return ctx.badRequest('The creator name does not match the artist name in the Spotify data');
    }

    data.musicData = trackOrAlbum.body;


    let uniqueKey = '';
    let isUnique = false;

    while (!isUnique) {
      uniqueKey = await generateRandomCode(4); // Générer un nouveau code

      const checkUniqueKey = await strapi.query('api::music-link.music-link').findOne({
        where: {
          uniqueKey: uniqueKey
        },
      });

      if (!checkUniqueKey) {
        isUnique = true; // Si le code est unique, sortir de la boucle
      }
    }

    data.googlePixel;
    data.tiktokPixel;
    data.xPixel;

      const newMusicLink = await strapi.query('api::music-link.music-link').create({
        data: {
          ...data,
          uniqueKey: uniqueKey,
          creator: me.creators[0].id,
          publishedAt: new Date(),
        }
      });

      await strapi.query('api::type-link.type-link').create({
        data:{
          key: 'musiclink',
          musiclink: newMusicLink.id,
          publishedAt: new Date(),
        }
      })


      return ctx.send(newMusicLink);
    },

  async update(ctx){
    const hasAcctype = await strapi.service('api::creator.creator').verifyIfUserHasAcctype(ctx);
    if (!hasAcctype) {
      return ctx.unauthorized();
    }

    const { data } = ctx.request.body;
    const { id } = ctx.params;
    if (data.uniqueKey) {
      delete data.uniqueKey;
    }

    const musicLink = await strapi.query('api::music-link.music-link').findOne({
      where: { id },
      populate: true,
    });

    if (!musicLink) {
      return ctx.notFound();
    }

    const me = await strapi.query('plugin::users-permissions.user').findOne({
      where: {id: ctx.state.user.id},
      populate:{
        creators:{
          populate:{
            musiclinks: true,
          }
        },
        subscription: {
          populate: {
            plan: true,
            addons: true
          },

        },
      }
    });

    if (!me) {
      return ctx.unauthorized();
    }

    const subscription = me.subscription;
    const plan = subscription.plan;
    const addons = subscription.addons;
    const musicLinks = me.creators[0].musiclinks;

    const musicLinkCheck = addons.find((addon) => addon.libelle === 'Music Link');
    if(!musicLinkCheck){
      return ctx.badRequest('This subscription does not have the Music Link addon');
    }

    if (subscription.status === 'init'){
      return ctx.badRequest('Your subscription is not active');
    }

    if (subscription.status === 'free' || subscription.status === 'expired' || subscription.status === 'cancelled') {
      if (data.theme === 'full-image' || data.linkDisplay === 'stacked' || data.titlePrimaryFont === 'Soncollab'){
        return  ctx.badRequest('request plan pro');
      }

    }

    if (musicLink.creator.id !== me.creators[0].id){
      return ctx.forbidden('You are not the owner of this music link');
    }

    data.url = me.creators[0].creatorName.toLowerCase() + '/' + data.smartLink.toLowerCase();
    data.smartLink.trim();


    // verifie si dans la list de musicLinks il y a un musiclink qui smartLink egale a data.smartLink
    const smartLinkExists = musicLinks.find((musicLink) => musicLink.smartLink === data.smartLink)

    data.googlePixel;
    data.tiktokPixel;
    data.xPixel;

    if(smartLinkExists && smartLinkExists.id!== musicLink.id){
      return ctx.badRequest('This music link already exists');
    }

    const updateMusicLink = await strapi.query('api::music-link.music-link').update({
      where: { id },
      data: {
        ...data,
      }
    });

    return ctx.send(updateMusicLink);
  },

  async deleteMusicLink(ctx){
    const hasAcctype = await strapi.service('api::creator.creator').verifyIfUserHasAcctype(ctx);
    if (!hasAcctype) {
      return ctx.unauthorized();
    }

    const { uuid } = ctx.params;

    const musicLink = await strapi.query('api::music-link.music-link').findOne({
      where: { uuid },
      populate: true,
    });

    if (!musicLink) {
      return ctx.notFound();
    }

    const me = await strapi.query('plugin::users-permissions.user').findOne({
      where: {id: ctx.state.user.id},
      populate:{
        creators:{
          populate:{
            musiclinks: true,
          }
        },
        subscription: {
          populate: {
            plan: true,
            addons: true
          },

        },
      }
    });

    if (!me) {
      return ctx.unauthorized();
    }


    const campaignPush = await strapi.query('api::campagne-push-notification.campagne-push-notification').findMany({
      where:{
        link: musicLink.id,
        $or: [
          {
            status: {
              $eq: 'active',
            }
          },
          {
            status: {
              $eq: 'paused',
            },
          }
        ],
      }
    });


    if(campaignPush.length > 0){
      return ctx.badRequest('This music link is linked to a campaign push notification, you cannot delete it');
    }


    await strapi.query('api::music-link.music-link').update({
      where: { id: musicLink.id },
      data: {
        hasDelete: true,
      }
    })

    return ctx.send({ message: 'Music link deleted' });

  },

  async getMusicLinkByIdLinkSpotify(ctx){
    const hasAcctype = await strapi.service('api::creator.creator').verifyIfUserHasAcctype(ctx);
    if (!hasAcctype) {
      return ctx.unauthorized();
    }

    const me = await strapi.query('plugin::users-permissions.user').findOne({
      where: {id: ctx.state.user.id},
      populate:{
        creators:{
          populate:{
            musiclinks: true,
          }
        },
        subscription: {
          populate: {
            plan: true,
            addons: true
          },

        },
      }
    });

    if (!me) {
      return ctx.unauthorized();
    }

    const { idLinkSpotify } = ctx.params;

    const musicLink = await strapi.query('api::music-link.music-link').findOne({
      where: {
        idLinkSpotify: idLinkSpotify,
        creator: {
          id: me.creators[0].id
        },
      },
      populate: true,
    });

    if (!musicLink) {
      return ctx.send([]);
    }

    return ctx.send(musicLink);
  },

  async getMusicLinkByUniqueKey(ctx){
    const { smartlink , uniqueKey } = ctx.params;

    if (!smartlink ||!uniqueKey) {
      return ctx.badRequest('Missing parameters');
    }

    // si uniqueKey commence par ml
    if (uniqueKey.startsWith('ml')) {
      const musicLink = await strapi.query('api::music-link.music-link').findOne({
        where: {
          uniqueKey: uniqueKey,
          smartLink:smartlink,
          hasDelete: false
        },
        populate: true,
      });

      if (!musicLink) {
        return ctx.badRequest('not found');
      }

         /* await strapi.service('api::fcmtk.fcmtk').sendPushNotification(
       {
          "endpoint": "https://fcm.googleapis.com/fcm/send/eojpUIsQa-U:APA91bG8SoINMvgBfDaY9YupzXCbJCQ-uDp4HVnXVHytiTbEF2wmQ6t4gKXq3Y73sZz7ZZmiYHV17fYbkqie_Rmzt-WLSpR6y70gn2vUwg1AvlDvFKQv7TWdpIbHNi47S5ppqVuIQ8bs",
          "expirationTime": null,
          "keys": {
            "p256dh": "BPbWAWyRD9xMXCWsO4ecS-wZem6M2XT5yOAA33rQQIhs18djjaBuiQT46S807cK6qiRMo5FcKkh6E2V78_ltJSM",
            "auth": "knDx8l4HbPJbI7WtVhf4QQ"
          }
        },
       'Nouvelle notification enrichie de tony desr malde trnit igj i kjfkjir j nrn g rgj ro rgrg! malde trnit igj i kjfkjir j nrn g rgj ro rgrg!',
       'Cliquez ici pour plus de détails.',
       {
         icon: '', // URL de l'icône
         image: 'https://i.scdn.co/image/ab67616d0000b273bab6bd59d3cca93c68a6b62b', // URL de l'image (facultatif)
         actions: [
           { action: 'view', title: 'Voir', icon: '' },
           { action: 'ignore', title: 'Ignorer', icon: '' },
         ],
         url: 'https://example.com/details', // Lien de redirection

         onActionClick:{
           default: { operation: 'openWindow' , url : 'https://example.com/details' },
         }
       }
     );*/


      return ctx.send(musicLink);
    }


  }

}));

async function slugify(text){
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function generateRandomCode(length,) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return 'ml' + result;
}

'use strict';
const stringSimilarity = require('string-similarity');
const { errors } = require('@strapi/utils');
const SpotifyWebApi = require("spotify-web-api-node");
const axios = require("axios");
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});
const { ApplicationError } = errors;

/**
 * my-connect controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::my-connect.my-connect', ({ strapi }) =>  ({

  async create(ctx){
    const hasAcctype = await strapi.service('api::creator.creator').verifyIfUserHasAcctype(ctx);
    if (!hasAcctype) {
      return ctx.unauthorized();
    }

    const { data } = ctx.request.body;

    if (!data) {
      return ctx.badRequest('data is required');
    }

    const me = await strapi.query('plugin::users-permissions.user').findOne({
      where: {id: ctx.state.user.id},
      populate:{
        creators:{
          populate:{
            myconnects: true
          }
        },
      }
    });

    if (!me){
      return ctx.unauthorized();
    }

    const userMyconnects = me.creators[0].myconnects;

    const userMyconnectCheck = userMyconnects.find((myConnect) => myConnect.platforms === data.platforms);
    if(userMyconnectCheck){
      return ctx.badRequest('This user already has this platform');
    }

    console.log(data,'oee')

    spotifyApi.setAccessToken(await strapi.service('api::creator.creator').generateSpotifyToken());

    if(data.platforms === 'spotify'){
      const extract = await strapi.service('api::creator.creator').extractSpotifyId(data.url);

      const spotifyUser = await spotifyApi.getArtist(extract);

      if(me.creators[0].creatorName!== spotifyUser.body.name){
        return ctx.badRequest('The creator name does not match the artist name in the Spotify data');
      }
    }


    if (data.platforms === 'youtube') {
      const channel = data.url.split('/')[4];
      const youtubeUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channel}&key=${process.env.YOUTUBE_API_KEY}`;

      try {
        const response = await axios.get(youtubeUrl);
        console.log(response, 'response tested');

        // Check if items array exists and has at least one item
        if (!response.data.items || response.data.items.length === 0) {
          return ctx.badRequest('Aucune donnée de chaîne trouvée pour l\'URL fournie');
        }

        const youtubeChannelName = response.data.items[0].snippet.title;
        const creatorName = me.creators[0].creatorName;

        // Calculate the similarity score
        const similarityScore = stringSimilarity.compareTwoStrings(
          youtubeChannelName.toLowerCase(),
          creatorName.toLowerCase()
        );

        const similarityThreshold = 0.35; // Define the similarity threshold (35%)

        // Check similarity
        if (similarityScore < similarityThreshold) {
          return ctx.badRequest(`Le nom du créateur ne correspond pas au nom de la chaîne dans les données YouTube. Similarité : ${(similarityScore * 100).toFixed(2)}%`);
        }

      } catch (error) {
        console.error('Erreur lors de la récupération des données YouTube:', error);
        return ctx.badRequest('Une erreur est survenue lors de la récupération des données de la chaîne YouTube');
      }
    }


    const plaformCheck = await strapi.query('api::platforms-connect.platforms-connect').findOne({
      where:{
        libelle: data.platforms
      }
    })

    if (!plaformCheck) {
      return ctx.badRequest('Platform not found');
    }

    const createMyConnect = await strapi.query('api::my-connect.my-connect').create({
      data: {
       ...data,
        default:false,
        platformsconnect: plaformCheck.id,
        creator:  me.creators[0].id,
        publishedAt: new Date(),
      }
    })

    return ctx.send(createMyConnect);

  },

  async delete(ctx){
    const hasAcctype = await strapi.service('api::creator.creator').verifyIfUserHasAcctype(ctx);
    if (!hasAcctype) {
      return ctx.unauthorized();
    }

    const { id } = ctx.params;

    const me = await strapi.query('plugin::users-permissions.user').findOne({
      where: {id:ctx.state.user.id},
      populate:{
        creators: true,
      }
    });

    if (!me) {
      return ctx.unauthorized();
    }


    const myconnect = await strapi.query('api::my-connect.my-connect').findOne({
      where: {
        id,
        creator: me.creators[0].id,
        default: false,
      },
      populate: true,
    })

    if (!myconnect) {
      return ctx.notFound();
    }


    // recupere les tableau myconnect.statisticfolowersconnects et su

    const statisticfolowersconnects = myconnect.statisticfolowersconnects;

    for(let i = 0; i< statisticfolowersconnects.length; i++){
      await strapi.query('api::statistic-folowers-connect.statistic-folowers-connect').delete({
        where: {
          id: statisticfolowersconnects[i].id
        }
      });
    }

    const deleteMyconnect = await strapi.query('api::my-connect.my-connect').delete({
      where: {
        id
      }
    })

    return ctx.send(deleteMyconnect);
  }

}));


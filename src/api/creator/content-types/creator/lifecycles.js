'use strict';

const { errors } = require('@strapi/utils');
const SpotifyWebApi = require("spotify-web-api-node");
const axios = require("axios");
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});
const { ApplicationError } = errors;

module.exports = {

  async beforeCreate(event) {

    const { data , where } = event.params;

    if(data.type !== 'spotify' && data.type !== 'youtube') {
      throw new ApplicationError('Invalid type');
    }

    if(data.linkedAccount) {
      if(data.type === 'spotify') {
        try {
          new URL(data.linkedAccount);

          // voir si cest un lien spotify
          const spotifyUrlPattern = /^(https?:\/\/)?(www\.)?(open\.spotify\.com\/(intl-[a-z]{2}\/)?artist\/[a-zA-Z0-9]{22})(\?.*)?$/;
          if (!spotifyUrlPattern.test(data.linkedAccount)) {
            throw new ApplicationError('Le lien Spotify est invalide');
          }

          const extract = await strapi.service('api::creator.creator').extractSpotifyId(data.linkedAccount);
          data.linkedAccount = await strapi.service('api::creator.creator').constructSpotifyUrl(extract);

          // recupere le artist name

          spotifyApi.setAccessToken(await strapi.service('api::creator.creator').generateSpotifyToken());
          const spotifyUser = await spotifyApi.getArtist(extract);
          data.creatorName = spotifyUser.body.name;

        } catch (error) {
          throw new ApplicationError('Invalid linkedAccount');
        }
      } else {
        const regex = /(https?:\/\/)?(www\.)?youtube\.com\/(channel|user)\/[\w-]+/;
        if (!regex.test(data.linkedAccount)) {
          throw new ApplicationError('Le lien Youtube est invalide');
        }

        const channel = data.linkedAccount.split('/')[4];
        const youtubeUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channel}&key=${process.env.YOUTUBE_API_KEY}`;
        const response = await axios.get(youtubeUrl);
        data.creatorName = response.data.items[0].snippet.title

      }
    }


  }

};



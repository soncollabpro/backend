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

    const {data, where} = event.params;

    if (!data.platforms) {
      throw new ApplicationError('Platforms field is required', 400);
    }

    if(!data.url){
      throw new ApplicationError('URL field is required', 400);
    }


    if(data.url){
      if(data.platforms === 'spotify') {
        try {
          new URL(data.url);

          // voir si cest un lien spotify
          const spotifyUrlPattern = /^(https?:\/\/)?(www\.)?(open\.spotify\.com\/(intl-[a-z]{2}\/)?artist\/[a-zA-Z0-9]{22})(\?.*)?$/;
          if (!spotifyUrlPattern.test(data.url)) {
            throw new ApplicationError('Le lien Spotify est invalide');
          }

        } catch (error) {
          throw new ApplicationError('Invalid url');
        }
      } else {
        const regex = /(https?:\/\/)?(www\.)?youtube\.com\/(channel|user)\/[\w-]+/;
        if (!regex.test(data.url)) {
          throw new ApplicationError('Le lien Youtube est invalide');
        }
      }
    }



  }
}

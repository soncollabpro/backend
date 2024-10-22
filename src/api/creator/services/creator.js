'use strict';

const axios = require("axios");
const https = require('https');

/**
 * creator service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::creator.creator', ({ strapi }) =>  ({

  async generateSpotifyToken() {
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded' // Specify content type
      },
      data: {
        grant_type: 'client_credentials',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      },
      json: true
    };

    try {
      const response = await axios(authOptions);
      return response.data.access_token; // Extract and return the access token
    } catch (error) {
      console.error('Error generating Spotify token:', error);
      return null;
    }
  },



  async verifyIfUserHasAcctype(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    const id = user.id;
    const me = await strapi.query('plugin::users-permissions.user').findOne({
      where: {id},
      populate:{
        acctype:true,
      }
    });

    return me.acctype !== null;

  },


  async extractSpotifyId(url) {
    const match = url.match(/artist\/([a-zA-Z0-9]{22})/);
    return match ? match[1] : null;
  },


  async constructSpotifyUrl(id) {
    return `https://open.spotify.com/artist/${id}`;
  }

}));

'use strict';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require("axios");
/**
 * creator controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::creator.creator', ({ strapi }) =>  ({


  async create(ctx) {
    const hasAcctype = await strapi.service('api::creator.creator').verifyIfUserHasAcctype(ctx);
    if (!hasAcctype) {
      return ctx.unauthorized();
    }

    const { data } = ctx.request.body;


    if (!data) {
      return ctx.badRequest('data is required');
    }


    const website = await strapi.query('api::website.website').findMany({});

    if (website.length === 0) {
      return ctx.badRequest('Website not found');
    }

    const creatorAccountLimit = website[0].creatorAccountLimit;

    const me = await strapi.query('plugin::users-permissions.user').findOne({
      where: {id: ctx.state.user.id},
      populate:{
        creators:true,
        subscription: true,
      }
    });

    if (me.creators.length >= creatorAccountLimit) {
      return ctx.badRequest('Creator account limit reached');
    }

    if (me.isMyFirst === false) {
      await strapi.query('plugin::users-permissions.user').update({
        where: {id: me.id},
        data:{
          isMyFirst: true,
        }
      });

      // on mets a jour la subscription
      const planfree = await strapi.query('api::plan.plan').findOne({
        where: {
          type: 'free'
        },
        populate:{
          addons: true,
        }
      })

      await strapi.query('api::subscription.subscription').update({
        where: {
          id: me.subscription.id
        },
        data:{
          plan: planfree.id,
          addons: planfree.addons,
          status: 'free'
        }
      })
    }





    const biographie = await strapi.query('api::biographie.biographie').create({
      data: {
        publishedAt: new Date(),
      }
    });

    const defaultCurrency = await strapi.query('api::currency.currency').findOne({
      where: {
        libelle: 'Euro'
      },
    });

    if (!defaultCurrency) {
      return ctx.badRequest('Currency not found');
    }



    const plaformCheck = await strapi.query('api::platforms-connect.platforms-connect').findOne({
      where:{
        libelle: data.type
      }
    })

    if (!plaformCheck) {
      return ctx.badRequest('Platform not found');
    }

    const creator = await strapi.query('api::creator.creator').create({
      data: {
        ...data,
        user: ctx.state.user.id,
        biographie: biographie.id,
        currency: defaultCurrency.id,
        publishedAt: new Date(),
      }
    });



    // creation du myconnect
    await strapi.query('api::my-connect.my-connect').create({
      data: {
        url: data.linkedAccount,
        platforms: data.type,
        creator:  creator.id,
        default: true,
        platformsconnect: plaformCheck.id,
        publishedAt: new Date(),
      }
    })

    //creation de la fanbase
    await strapi.query('api::my-fanbase.my-fanbase').create({
      data: {
        creator: creator.id,
        publishedAt: new Date(),
      }
    })

    return ctx.send(creator);
  },

  async searchCreatorByYoutube(ctx) {
    const hasAcctype = await strapi.service('api::creator.creator').verifyIfUserHasAcctype(ctx);
    if (!hasAcctype) {
      return ctx.unauthorized();
    }

    const { youtubeUrl } = ctx.request.body;

    if (!youtubeUrl) {
      return ctx.badRequest('youtubeUrl is required');
    }


    // verifie si il est de ce type https://www.youtube.com/@iamnanteos ou https://www.youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA

    const regex = /(https?:\/\/)?(www\.)?youtube\.com\/(channel|user)\/[\w-]+/;

    if (!regex.test(youtubeUrl)) {
      return ctx.badRequest('Invalid youtubeUrl');
    }


    let creatorId = '';
    let urlReq = '';

    if (regex.test(youtubeUrl)) {
      creatorId = youtubeUrl.split('/')[4];
      console.log(creatorId);
      urlReq = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${creatorId}&key=${process.env.YOUTUBE_API_KEY}`;
    }

    const authOptions = {
      url: urlReq,
      method: 'get',
      json: true
    };

    try {
      const response = await axios(authOptions);
      if (response.data.items === undefined ){
        return ctx.send({
          items: [],
        });
      }else {
        return ctx.send({
          items: [
            {
              snippet: response.data.items[0].snippet,
              contentDetails: response.data.items[0].contentDetails,
              statistics: response.data.items[0].statistics
            }
          ],
        });
      }
    } catch (error) {
      console.error('Error generating Spotify token:', error);
      return null
    }


  },

  async searchCreatorBySpotify(ctx) {

    const hasAcctype = await strapi.service('api::creator.creator').verifyIfUserHasAcctype(ctx);
    if (!hasAcctype) {
      return ctx.unauthorized();
    }

    const { spotifyUrl, creatorName } = ctx.request.body;

    if (!spotifyUrl && !creatorName) {
      return ctx.badRequest('spotifyUrl or artistName is required');
    }

    if (spotifyUrl === '' && creatorName === '') {
      return ctx.badRequest('spotifyUrl or artistName is required');
    }

    if (spotifyUrl && creatorName) {
      return ctx.badRequest('spotifyUrl and artistName are mutually exclusive');
    }

    const spotifyToken = await strapi.service('api::creator.creator').generateSpotifyToken();

    if (spotifyUrl) {

      const regex = /^(https:\/\/open.spotify.com\/artist\/)([a-zA-Z0-9]+)$/;

      if (!regex.test(spotifyUrl)) {
        return ctx.badRequest('Invalid spotifyUrl');
      }

      const creatorId = spotifyUrl.split('/')[4];

      // lance la recherche de l'artiste par son id sur spotify et renvoie les informations de l'artiste
      const authOptions = {
        url: `https://api.spotify.com/v1/artists/${creatorId}`,
        method: 'get',
        headers: {
          'Authorization': `Bearer ${spotifyToken}`
        },
        json: true
      };

      try {
        const response = await axios(authOptions);

        console.log({
          items: [response.data],
        });

        return ctx.send({
          items: [response.data],
        });


      } catch (error) {
        console.error('Error generating Spotify token:', error);
        return null;
      }


    }

    if (creatorName) {
      // lance la recherche de l'artiste par son nom sur spotify et renvoie les informations de l'artiste
      const authOptions = {
        url: `https://api.spotify.com/v1/search?q=${creatorName}&type=artist&limit=10`,
        method: 'get',
        headers: {
          'Authorization': `Bearer ${spotifyToken}`
        },
        json: true
      };

      try {
        const response = await axios(authOptions);
        return ctx.send(response.data.artists);
      } catch (error) {
        console.error('Error generating Spotify token:', error);
        return null;
      }

    }

  },

  async changeCreatorCurrency(ctx) {
    const hasAcctype = await strapi.service('api::creator.creator').verifyIfUserHasAcctype(ctx);
    if (!hasAcctype) {
      return ctx.unauthorized();
    }

    const { currencyUuid , currentCreatorUuid   } = ctx.request.body;

    if (!currencyUuid) {
      return ctx.badRequest('currencyUuid is required');
    }

    if (!currentCreatorUuid) {
      return ctx.badRequest('currentCuratorUuid is required');
    }

    const currency = await strapi.query('api::currency.currency').findOne({
      where: {uuid: currencyUuid},
    });

    if (!currency) {
      return ctx.badRequest('Currency not found');
    }

    const currentCreator = await strapi.query('api::creator.creator').findOne({
      where: {uuid: currentCreatorUuid},
      populate:{
        user:true,
      }
    });


    if (!currentCreator) {
      return ctx.badRequest('currentCurator not found');
    }

    if (currentCreator.user.id !== ctx.state.user.id) {
      return ctx.unauthorized();
    }

    const me = await strapi.query('plugin::users-permissions.user').findOne({
      where: {id: ctx.state.user.id},
      populate:{
        creators:true,
        customer:true,
      }
    })

    if (!me) {
      return ctx.unauthorized();
    }

    const updatedCurator = await strapi.query('api::creator.creator').update({
      where: {id: currentCreator.id},
      data:{
        currency: currency.id,
      }
    });

    return ctx.send(updatedCurator);
  },

  async searchTrackOrAlbumSpotify(ctx) {
    const hasAcctype = await strapi.service('api::creator.creator').verifyIfUserHasAcctype(ctx);
    if (!hasAcctype) {
      return ctx.unauthorized();
    }

    const { query, artist } = ctx.request.body;

    if (!query) {
      return ctx.badRequest('query is required');
    }

    const spotifyToken = await strapi.service('api::creator.creator').generateSpotifyToken();

    try {
      const search = async (searchQuery) => {
        return await axios.get(
          `https://api.spotify.com/v1/search?q=${searchQuery}&type=track,album&limit=20`,
          {
            headers: {
              'Authorization': `Bearer ${spotifyToken}`
            }
          }
        );
      };

      // Initial search with artist filter if artist is provided
      let searchQuery = artist
        ? `${encodeURIComponent(query.trim())} artist:${encodeURIComponent(artist)}`
        : encodeURIComponent(query.trim());

      let searchResponse = await search(searchQuery);

      let tracks = searchResponse.data.tracks.items;
      let albums = searchResponse.data.albums.items;

      // If no results found for the specified artist (or if no artist provided), perform a general search
      if (tracks.length === 0 && albums.length === 0) {
        searchResponse = await search(encodeURIComponent(query.trim()));

        tracks = searchResponse.data.tracks.items;
        albums = searchResponse.data.albums.items;

        // If still no results, try searching with individual words from the query
        if (tracks.length === 0 && albums.length === 0) {
          const queryWords = query.trim().split(' ');

          for (let word of queryWords) {
            searchResponse = await search(encodeURIComponent(word));

            tracks = searchResponse.data.tracks.items;
            albums = searchResponse.data.albums.items;

            if (tracks.length > 0 || albums.length > 0) {
              return ctx.send(searchResponse.data);
            }
          }
        } else {
          return ctx.send(searchResponse.data);
        }
      } else {
        return ctx.send(searchResponse.data);
      }
    } catch (error) {
      console.error('Error searching Spotify:', error);
      return ctx.internalServerError('An error occurred while searching Spotify');
    }
  },


  async getCreatorTrackOrAlbum(ctx) {
    const hasAcctype = await strapi.service('api::creator.creator').verifyIfUserHasAcctype(ctx);
    if (!hasAcctype) {
      return ctx.unauthorized();
    }

    const { creatorName } = ctx.request.body;

    if (!creatorName) {
      return ctx.badRequest('creatorName is required');
    }

    const spotifyToken = await strapi.service('api::creator.creator').generateSpotifyToken();

    try {

      let artistResponse = await axios.get(`https://api.spotify.com/v1/search?q=${creatorName}&type=artist&limit=1`, {
        headers: {
          'Authorization': `Bearer ${spotifyToken}`
        }
      });

      const artistId = artistResponse.data.artists.items[0].id;

      let artistResponseTracks = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?country=FR`, {
        headers: {
          'Authorization': `Bearer ${spotifyToken}`
        }
      });

      let artistResponseAlbums = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/albums`, {
        headers: {
          'Authorization': `Bearer ${spotifyToken}`
        }
      });

      return ctx.send({
        tracks: artistResponseTracks.data.tracks,
        albums: artistResponseAlbums.data.items
      });

    }catch (error) {
      console.error('Error generating Spotify token:', error);
      return null;
    }

  },

  async getTrackOrAlbumById(ctx) {
    const hasAcctype = await strapi.service('api::creator.creator').verifyIfUserHasAcctype(ctx);
    if (!hasAcctype) {
      return ctx.unauthorized();
    }

    const { id, type } = ctx.request.body;

    if (!id) {
      return ctx.badRequest('id is required');
    }

    if (!type) {
      return ctx.badRequest('type is required');
    }

    if (type !== 'single' && type !== 'album') {
      return ctx.badRequest('Invalid type, must be single or album');
    }

    const spotifyToken = await strapi.service('api::creator.creator').generateSpotifyToken();

    try {
      const getSpotifyData = async (url) => {
        return await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${spotifyToken}`
          }
        });
      };

      const getYouTubeLinkForAlbum = async (albumName, artistName, trackCount) => {
        const query = encodeURIComponent(albumName + ' ' + artistName);
        const youtubeResponse = await axios.get(`https://www.googleapis.com/youtube/v3/search?q=${query}&part=snippet&maxResults=50&key=${process.env.YOUTUBE_API_KEY}`);

        if (youtubeResponse.data.items && youtubeResponse.data.items.length > 0) {
          if (trackCount > 1) {
            // Return the first playlist with playlistId and verify it belongs to the artist
            for (let item of youtubeResponse.data.items) {
              if (item.id.kind === 'youtube#playlist' && item.id.playlistId) {
                const playlistChannelTitle = item.snippet.channelTitle;
                if (playlistChannelTitle === "" || playlistChannelTitle.includes(artistName)) {
                  return `https://www.youtube.com/playlist?list=${item.id.playlistId}`;
                }
              }
            }
          } else {
            // Return the first video
            for (let item of youtubeResponse.data.items) {
              if (item.id.kind === 'youtube#video' && item.id.videoId) {
                return `https://www.youtube.com/watch?v=${item.id.videoId}`;
              }
            }
          }
        }
        return null;
      };

      const platforms = [];
      const socials = [];
      let idPlatform = 1;
      let idSocial = 1;
      let itemData, artistName, itemName, trackCount;

      const spotifyMl = await strapi.query('api::music-link-platform.music-link-platform').findOne({
        where:{
          libelle:'spotify',
        },
        populate:true
      })


      const youtubeMl = await strapi.query('api::music-link-platform.music-link-platform').findOne({
        where:{
          libelle:'youtube music',
        },
        populate:true
      })

      if (!spotifyMl) {
        return ctx.notFound('No Spotify platform found');
      }

      if (!youtubeMl) {
        return ctx.notFound('No YouTube music platform found');
      }


      if (type === 'single') {
        const trackSpotifyResponse = await getSpotifyData(`https://api.spotify.com/v1/tracks/${id}`);
        itemData = trackSpotifyResponse.data;
        artistName = itemData.artists[0].name;
        itemName = itemData.name;

        if (itemData.external_urls && spotifyMl.hasDefault) {
          platforms.push({
            id: idPlatform++,
            libelle: 'spotify',
            enabled: true,
            link: itemData.external_urls.spotify,
            imageLogo: process.env.BACKEND_URL + spotifyMl.imageLogo.url,
            imageBtnLight: process.env.BACKEND_URL + spotifyMl.imageBtnLight.url,
            imageBtnDark: process.env.BACKEND_URL + spotifyMl.imageBtnDark.url
          });
        }

        if (youtubeMl.hasDefault){
          const youtubeLink = await getYouTubeLinkForAlbum(itemName, artistName, 1); // Single track count is 1
          if (youtubeLink ) {
            platforms.push({
              id: idPlatform++,
              libelle: 'youtube music',
              enabled: true,
              link: youtubeLink,
              imageLogo: process.env.BACKEND_URL + youtubeMl.imageLogo.url,
              imageBtnLight: process.env.BACKEND_URL + youtubeMl.imageBtnLight.url,
              imageBtnDark: process.env.BACKEND_URL + youtubeMl.imageBtnDark.url
            });
          }
        }

      }

      if (type === 'album') {
        const albumSpotifyResponse = await getSpotifyData(`https://api.spotify.com/v1/albums/${id}`);
        itemData = albumSpotifyResponse.data;
        artistName = itemData.artists[0].name;
        itemName = itemData.name;
        trackCount = itemData.tracks.total;

        if (itemData.external_urls && spotifyMl.hasDefault) {
          platforms.push({
            id: idPlatform++,
            libelle: 'spotify',
            enabled: true,
            link: itemData.external_urls.spotify,
            imageLogo: process.env.BACKEND_URL + spotifyMl.imageLogo.url,
            imageBtnLight: process.env.BACKEND_URL + spotifyMl.imageBtnLight.url,
            imageBtnDark: process.env.BACKEND_URL + spotifyMl.imageBtnDark.url
          });
        }

        if (youtubeMl.hasDefault){
          const youtubeLink = await getYouTubeLinkForAlbum(itemName, artistName, trackCount);
          if (youtubeLink) {
            platforms.push({
              id: idPlatform++,
              libelle: 'youtube music',
              enabled: true,
              link: youtubeLink,
              imageLogo: process.env.BACKEND_URL + youtubeMl.imageLogo.url,
              imageBtnLight: process.env.BACKEND_URL + youtubeMl.imageBtnLight.url,
              imageBtnDark: process.env.BACKEND_URL + youtubeMl.imageBtnDark.url
            });
          }
        }
      }

      const musicLinkSocials = await strapi.query('api::music-link-social.music-link-social').findMany({
        where:{
          hasActivated: true,
          hasDefault: true,
        },
        populate:{
          imgLogo: true,
          imageSoLight: true,
          imageSoDark: true,
        },
      })

      for (let socialCheck of musicLinkSocials) {
        socials.push({
          id: idSocial++,
          libelle: socialCheck.libelle,
          enabled: true,
          link: socialCheck.link,
          imageLogo: process.env.BACKEND_URL + socialCheck.imgLogo.url,
          imageSoLight: process.env.BACKEND_URL + socialCheck.imageSoLight.url,
          imageSoDark: process.env.BACKEND_URL + socialCheck.imageSoDark.url,
        });
      }

      return ctx.send({
        trackOrAlbum: itemData,
        platforms: platforms,
        socials: socials,
      });

    } catch (error) {
      console.error('Error getting data from Spotify or YouTube:', error);
      return ctx.internalServerError('An error occurred while fetching data');
    }
  }





}));

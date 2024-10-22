'use strict';

module.exports = {
  routes:[
    {
      method: 'POST',
      path: '/creator/spotify/search',
      handler: 'creator.searchCreatorBySpotify',
      config: {
        policies: [],
        tags: ['creator'],
      }
    },

    {
      method: 'POST',
      path: '/creator/youtube/search',
      handler: 'creator.searchCreatorByYoutube',
      config: {
        policies: [],
        tags: ['creator'],
      }
    },
    {
      method: 'POST',
      path: '/creator/trackOrAlbum/search',
      handler: 'creator.searchTrackOrAlbumSpotify',
      config: {
        policies: [],
        tags: ['creator'],
      }
    },
    {
      method: 'PUT',
      path: '/creator/currency',
      handler: 'creator.changeCreatorCurrency',
      config: {
        policies: [],
        tags: ['creator'],
      }
    },
    {
      method: 'POST',
      path: '/creator/spotify/searchByName',
      handler: 'creator.getCreatorTrackOrAlbum',
      config: {
        policies: [],
        tags: ['creator'],
      }
    },

    {
      method: 'POST',
      path: '/creator/spotify/TrackOrAlbumById',
      handler: 'creator.getTrackOrAlbumById',
      config: {
        policies: [],
        tags: ['creator'],
      }
    }
  ]
}

'use strict';

module.exports = {
  routes:[
    {
      method: 'GET',
      path: '/musiclink/:idLinkSpotify',
      handler: 'music-link.getMusicLinkByIdLinkSpotify',
      config: {
        policies: [],
        tags: ['music-link'],
      }
    },

    {
      method: 'GET',
      path: '/musiclink-unique-key/:smartlink/:uniqueKey',
      handler: 'music-link.getMusicLinkByUniqueKey',
      config: {
        policies: [],
        tags: ['music-link'],
      }
    },

    {
      method: 'DELETE',
      path: '/musiclinks/:uuid',
      handler: 'music-link.deleteMusicLink',
      config: {
        policies: [],
        tags: ['music-link'],
      }
    }

  ]
}

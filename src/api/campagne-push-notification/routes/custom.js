'use strict';

module.exports = {
  routes:[
    {
      method: 'GET',
      path: '/campagne-push-notification/:uuid',
      handler: 'campagne-push-notification.getCampaignPushByUuid',
      config: {
        policies: [],
        tags: ['campagne-push-notification'],
      }
    },
    {
      method: 'PUT',
      path: '/campagne-push-notification/:uuid',
      handler: 'campagne-push-notification.updateCampaignPush',
      config: {
        policies: [],
        tags: ['campagne-push-notification'],
      }
    },
    {
      method: 'PUT',
      path: '/cpn/status/:uuid',
      handler: 'campagne-push-notification.changeStatusCPN',
      config: {
        policies: [],
        tags: ['campagne-push-notification'],
      }
    },
    {
      method: 'DELETE',
      path: '/cpn/delete/:uuid',
      handler: 'campagne-push-notification.deleteCPN',
      config: {
        policies: [],
        tags: ['campagne-push-notification'],
      }
    }
  ]
}

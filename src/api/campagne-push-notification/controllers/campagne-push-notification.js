'use strict';

const campaignDuration = [
  "unjour",
  "troisjours",
  "unesemaine",
  "deuxsemaines",
  "unmois"
];

const sendFrequency = [
  "unefoisparjour",
  "troisfoisparsemaine",
  "unefoisparsemaine",
  "unefoisparmois"
]

const timezonesValues = [
  "Pacific/Midway",
  "Pacific/Honolulu",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Halifax",
  "America/Argentina/Buenos_Aires",
  "America/St_Johns",
  "Atlantic/South_Georgia",
  "Atlantic/Azores",
  "Etc/UTC",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Kabul",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Yangon",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Adelaide",
  "Australia/Sydney",
  "Pacific/Noumea",
  "Pacific/Fiji",
  "Pacific/Tongatapu",
  "Africa/Algiers",
  "Africa/Bangui",
  "Africa/Brazzaville",
  "Africa/Casablanca",
  "Africa/Cotonou",
  "Africa/Abidjan",
  "Africa/Blantyre",
  "Africa/Bujumbura",
  "Africa/Cairo",
  "Africa/Gaborone",
  "Africa/Harare",
  "Africa/Addis_Ababa",
  "Africa/Nairobi",
  "Africa/Asmara",
  "Africa/Djibouti",
  "Africa/Khartoum",
  "Africa/Maputo",
  "Africa/Luanda",
  "Africa/Lubumbashi",
  "Africa/Mogadishu",
  "Africa/Tripoli",
  "Africa/Windhoek"
];

const validButtonChoices = [
  "ecoutez maintenant",
  "decouvrez plus",
  "voir la video",
  "voir la chanson",
  "voir le podcast"
];

/**
 * campagne-push-notification controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::campagne-push-notification.campagne-push-notification', ({ strapi }) =>  ({

  async create(ctx) {
    // Vérification du type de compte de l'utilisateur
    const hasAcctype = await strapi.service('api::creator.creator').verifyIfUserHasAcctype(ctx);
    if (!hasAcctype) {
      return ctx.unauthorized();
    }

    // Récupération des données du corps de la requête
    const { data } = ctx.request.body;

    if (!data) {
      return ctx.badRequest('data is required');
    }

    // Vérifications générales
    if (!data.creatorId) {
      return ctx.badRequest('creatorId is required');
    }
    if (!data.name) {
      return ctx.badRequest('name is required');
    }
    if (!data.typePush) {
      return ctx.badRequest('typePush is required');
    }

    // Vérification du type de campagne push
    if (data.typePush !== 'forBoostLink' && data.typePush !== 'forCustomType') {
      return ctx.badRequest('Invalid typePush');
    }

    // Gestion du type "forBoostLink"
    if (data.typePush === 'forBoostLink') {
      if (!data.link) {
        return ctx.badRequest('link is required');
      }
      if (!data.typeLink) {
        return ctx.badRequest('typeLink is required');
      }
      if (!data.buttonChoice) {
        return ctx.badRequest('buttonChoice is required');
      }

      // Vérification si les champs link et typeLink sont des nombres
      if (isNaN(data.link)) {
        return ctx.badRequest('link must be a number');
      }
      if (isNaN(data.typeLink)) {
        return ctx.badRequest('typeLink must be a number');
      }

      // Vérification du choix du bouton
      if (!validButtonChoices.includes(data.buttonChoice)) {
        return ctx.badRequest('Invalid buttonChoice');
      }

      // Réinitialisation des champs non pertinents
      data.customTitle = null;
      data.customDescription = null;
      data.customButtons = null;
    }

    // Gestion du type "forCustomType"
    if (data.typePush === 'forCustomType') {
      if (!data.customTitle) {
        return ctx.badRequest('customTitle is required');
      }
      if (!data.customDescription) {
        return ctx.badRequest('customDescription is required');
      }
      if (!data.customButtons) {
        return ctx.badRequest('customButtons is required');
      }
      if (data.customButtons.length < 1) {
        return ctx.badRequest('customButtons must contain at least one button');
      }
      if (data.customButtons.length > 1) {
        return ctx.badRequest('customButtons must contain only one button');
      }

      // Vérification de la structure du bouton
      const customButton = data.customButtons[0];
      if (!customButton.buttonText || typeof customButton.buttonText !== 'string' ||
        !customButton.buttonLink || typeof customButton.buttonLink !== 'string') {
        return ctx.badRequest('customButtons must contain valid buttonText and buttonLink');
      }

      // Vérification si le lien du bouton est une URL valide
      const urlPattern = new RegExp('^(https?:\\/\\/)?' + // protocole
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // nom de domaine
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // adresse IP
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port et chemin
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // paramètres de requête
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment de l'URL

      if (!urlPattern.test(customButton.buttonLink)) {
        return ctx.badRequest('customButtons buttonLink must be a valid URL');
      }

      // Réinitialisation des champs non pertinents pour ce type
      data.link = null;
      data.buttonChoice = null;
    }

    // Vérification des autres champs requis
    if (!data.sendDateTime) {
      return ctx.badRequest('sendDateTime is required');
    }
    if (!data.campaignDuration) {
      return ctx.badRequest('campaignDuration is required');
    }
    if (!campaignDuration.includes(data.campaignDuration)) {
      return ctx.badRequest('campaignDuration must be one of the following: unjour, troisjours, unesemaine, deuxsemaines, unmois');
    }
    if (!data.sendFrequency) {
      return ctx.badRequest('sendFrequency is required');
    }
    if (!sendFrequency.includes(data.sendFrequency)) {
      return ctx.badRequest('sendFrequency must be one of the following: unefoisparjour, troisfoisparsemaine, unefoisparsemaine, unefoisparmois');
    }
    if (!data.timezone) {
      return ctx.badRequest('timezone is required');
    }
    if (!timezonesValues.includes(data.timezone)) {
      return ctx.badRequest('timezone must be a valid value');
    }

    // Vérification des tokens push
    const meCheck = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: ctx.state.user.id },
      populate: {
        creators: {
          populate: {
            myfanbase: {
              populate: {
                contacts: { populate: true },
                fcmtks: { count: true }
              }
            }
          }
        },
        subscription: { populate: { plan: true } }
      }
    });

    if (!meCheck) {
      return ctx.unauthorized();
    }

    const creatorIdCheck = meCheck.creators[0].id;
    if (creatorIdCheck !== data.creatorId) {
      return ctx.unauthorized();
    }

    const subscription = meCheck.subscription;
    const plan = subscription.plan;
    const fanbase = meCheck.creators[0].myfanbase;
    const fcmtks = fanbase.fcmtks;

    if (fcmtks.length < 1) {
      return ctx.badRequest('You must have at least one push fan in your fanbase to send this campaign');
    }

    // Vérification du typeLink si applicable
    if (data.typePush === 'forBoostLink') {
      const typeLinkCheck = await strapi.query('api::type-link.type-link').findOne({
        where: { id: data.typeLink },
        populate: true
      });

      if (!typeLinkCheck) {
        return ctx.badRequest('Invalid typeLink');
      }

      if (typeLinkCheck.key === 'musiclink') {
        const musiclink = await strapi.query('api::music-link.music-link').findOne({
          where: { id: data.link },
          populate: true
        });

        if (!musiclink) {
          return ctx.badRequest('Invalid link');
        }

        if (typeLinkCheck.id !== musiclink.typelink.id) {
          return ctx.badRequest('Invalid link and typeLink combination');
        }
      }
    }

    // Vérification des abonnements pour les campagnes personnalisées
    if (data.typePush === 'forCustomType') {
      if (subscription.status !== 'active' && subscription.status !== 'trialing' && plan.type === 'free') {
        return ctx.badRequest('You must have an active or trialing subscription to send this custom type campaign');
      }
    }

    // evite les doublons de name
    const existingCampaign = await strapi.query('api::campagne-push-notification.campagne-push-notification').findOne({
      where: {
        name: data.name,
        creator: {
          id: creatorIdCheck
        },
        hasDelete: false
      },
      populate: true
    })


    if (existingCampaign) {
      return ctx.badRequest('A campaign with the same name already exists');
    }


    // Création de la campagne
    const newCampaign = await strapi.query('api::campagne-push-notification.campagne-push-notification').create({
      data: {
        ...data,
        status: 'pending',
        creator: creatorIdCheck,
        publishedAt: new Date()
      }
    });

    // Mise à jour du lien pour les campagnes BoostLink
    if (data.typePush === 'forBoostLink') {
      await strapi.query('api::music-link.music-link').update({
        where: { id: data.link },
        data: {
          campagnepushnotifications: newCampaign.id
        }
      });
    }


    await strapi.query('api::type-campaign.type-campaign').create({
      data: {
        key: 'push-notification',
        campagnepushnotification: newCampaign.id,
        publishedAt: new Date()
      }
    })

    const campagneService = await strapi.query('api::campagne-service.campagne-service').findOne({
      where:{
        libelle: 'push notification'
      },
      populate: true
    })

    if(campagneService){
      await strapi.query('api::campagne-service.campagne-service').update({
        where:{
          id: campagneService.id
        },
        data: {
          campagnepushnotifications: newCampaign.id
        }
      })
    }


    return ctx.send(newCampaign);
  },

  async updateCampaignPush(ctx) {
    const hasAcctype = await strapi.service('api::creator.creator').verifyIfUserHasAcctype(ctx);
    if (!hasAcctype) {
      return ctx.unauthorized();
    }

    // Récupération des données du corps de la requête
    const { data } = ctx.request.body;

    if (!data) {
      return ctx.badRequest('data is required');
    }


    const uuid = ctx.params.uuid;

    if (!uuid) {
      return ctx.badRequest('uuid is required');
    }

    const campaign = await strapi.query('api::campagne-push-notification.campagne-push-notification').findOne({
      where: { uuid },
      populate: {
        creator: true,
        typeLink: true,
        musiclinks: true,
        customImage: true
      }
    });

    if (!campaign) {
      return ctx.notFound();
    }

    if (campaign.status === 'finished' || campaign.status === 'suspended') {
      return ctx.badRequest('Cannot update a finished or suspended campaign');
    }

    // Vérifications générales
    if (!data.creatorId) {
      return ctx.badRequest('creatorId is required');
    }
    if (!data.name) {
      return ctx.badRequest('name is required');
    }
    if (!data.typePush) {
      return ctx.badRequest('typePush is required');
    }

    // Vérification du type de campagne push
    if (data.typePush !== 'forBoostLink' && data.typePush !== 'forCustomType') {
      return ctx.badRequest('Invalid typePush');
    }

    // Gestion du type "forBoostLink"
    if (data.typePush === 'forBoostLink') {
      if (!data.link) {
        return ctx.badRequest('link is required');
      }
      if (!data.typeLink) {
        return ctx.badRequest('typeLink is required');
      }
      if (!data.buttonChoice) {
        return ctx.badRequest('buttonChoice is required');
      }

      // Vérification si les champs link et typeLink sont des nombres
      if (isNaN(data.link)) {
        return ctx.badRequest('link must be a number');
      }
      if (isNaN(data.typeLink)) {
        return ctx.badRequest('typeLink must be a number');
      }

      // Vérification du choix du bouton
      if (!validButtonChoices.includes(data.buttonChoice)) {
        return ctx.badRequest('Invalid buttonChoice');
      }

      // Réinitialisation des champs non pertinents
      data.customTitle = null;
      data.customDescription = null;
      data.customButtons = null;
    }

    // Gestion du type "forCustomType"
    if (data.typePush === 'forCustomType') {
      if (!data.customTitle) {
        return ctx.badRequest('customTitle is required');
      }
      if (!data.customDescription) {
        return ctx.badRequest('customDescription is required');
      }
      if (!data.customButtons) {
        return ctx.badRequest('customButtons is required');
      }
      if (data.customButtons.length < 1) {
        return ctx.badRequest('customButtons must contain at least one button');
      }
      if (data.customButtons.length > 1) {
        return ctx.badRequest('customButtons must contain only one button');
      }

      // Vérification de la structure du bouton
      const customButton = data.customButtons[0];
      if (!customButton.buttonText || typeof customButton.buttonText !== 'string' ||
        !customButton.buttonLink || typeof customButton.buttonLink !== 'string') {
        return ctx.badRequest('customButtons must contain valid buttonText and buttonLink');
      }

      // Vérification si le lien du bouton est une URL valide
      const urlPattern = new RegExp('^(https?:\\/\\/)?' + // protocole
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // nom de domaine
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // adresse IP
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port et chemin
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // paramètres de requête
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment de l'URL

      if (!urlPattern.test(customButton.buttonLink)) {
        return ctx.badRequest('customButtons buttonLink must be a valid URL');
      }

      // Réinitialisation des champs non pertinents pour ce type
      data.link = null;
      data.buttonChoice = null;
    }

    // Vérification des autres champs requis
    if (!data.sendDateTime) {
      return ctx.badRequest('sendDateTime is required');
    }
    if (!data.campaignDuration) {
      return ctx.badRequest('campaignDuration is required');
    }
    if (!campaignDuration.includes(data.campaignDuration)) {
      return ctx.badRequest('campaignDuration must be one of the following: unjour, troisjours, unesemaine, deuxsemaines, unmois');
    }
    if (!data.sendFrequency) {
      return ctx.badRequest('sendFrequency is required');
    }
    if (!sendFrequency.includes(data.sendFrequency)) {
      return ctx.badRequest('sendFrequency must be one of the following: unefoisparjour, troisfoisparsemaine, unefoisparsemaine, unefoisparmois');
    }
    if (!data.timezone) {
      return ctx.badRequest('timezone is required');
    }
    if (!timezonesValues.includes(data.timezone)) {
      return ctx.badRequest('timezone must be a valid value');
    }

    // Vérification des tokens push
    const meCheck = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: ctx.state.user.id },
      populate: {
        creators: {
          populate: {
            myfanbase: {
              populate: {
                contacts: { populate: true },
                fcmtks: { count: true }
              }
            }
          }
        },
        subscription: { populate: { plan: true } }
      }
    });

    if (!meCheck) {
      return ctx.unauthorized();
    }

    const creatorIdCheck = meCheck.creators[0].id;
    if (creatorIdCheck !== data.creatorId) {
      return ctx.unauthorized();
    }

    const subscription = meCheck.subscription;
    const plan = subscription.plan;
    const fanbase = meCheck.creators[0].myfanbase;
    const fcmtks = fanbase.fcmtks;

    if (fcmtks.length < 1) {
      return ctx.badRequest('You must have at least one push fan in your fanbase to send this campaign');
    }

    // Vérification du typeLink si applicable
    if (data.typePush === 'forBoostLink') {
      const typeLinkCheck = await strapi.query('api::type-link.type-link').findOne({
        where: { id: data.typeLink },
        populate: true
      });

      if (!typeLinkCheck) {
        return ctx.badRequest('Invalid typeLink');
      }

      if (typeLinkCheck.key === 'musiclink') {
        const musiclink = await strapi.query('api::music-link.music-link').findOne({
          where: { id: data.link },
          populate: true
        });

        if (!musiclink) {
          return ctx.badRequest('Invalid link');
        }

        if (typeLinkCheck.id !== musiclink.typelink.id) {
          return ctx.badRequest('Invalid link and typeLink combination');
        }
      }
    }

    // Vérification des abonnements pour les campagnes personnalisées
    if (data.typePush === 'forCustomType') {
      if (subscription.status !== 'active' && subscription.status !== 'trialing' && plan.type === 'free') {
        return ctx.badRequest('You must have an active or trialing subscription to send this custom type campaign');
      }
    }

    const existingCampaign = await strapi.query('api::campagne-push-notification.campagne-push-notification').findOne({
      where: {
        name: data.name,
        id: {
          $not: campaign.id,
        },
        creator: {
          id: creatorIdCheck
        },
        hasDelete: false
      },
      populate: true
    })


    if (existingCampaign) {
      return ctx.badRequest('A campaign with the same name already exists');
    }


    // Création de la campagne
    const updateCampaign = await strapi.query('api::campagne-push-notification.campagne-push-notification').update({
      where: {
        id: campaign.id,
      },
      data: {
        ...data,
        publishedAt: new Date()
      }
    });

    return  ctx.send(updateCampaign);
  },


  async getCampaignPushByUuid(ctx){
    const hasAcctype = await strapi.service('api::creator.creator').verifyIfUserHasAcctype(ctx);
    if (!hasAcctype) {
      return ctx.unauthorized();
    }

    const uuid = ctx.params.uuid;

    if (!uuid) {
      return ctx.badRequest('uuid is required');
    }

    const campaign = await strapi.query('api::campagne-push-notification.campagne-push-notification').findOne({
      where: { uuid },
      populate: {
        creator: true,
        typeLink: true,
        musiclinks: true,
        customImage: true,
        statisticsendcpns:true,
        statisticclickcpns: true
      }
    });

    if (!campaign) {
      return ctx.notFound();
    }

    return ctx.send(campaign);
  },

  async changeStatusCPN(ctx){

    const hasAcctype = await strapi.service('api::creator.creator').verifyIfUserHasAcctype(ctx);
    if (!hasAcctype) {
      return ctx.unauthorized();
    }

    const { data } = ctx.request.body;

    if (!data) {
      return ctx.badRequest('data is required');
    }

    if (!data.status) {
      return ctx.badRequest('status is required');
    }

    const uuid = ctx.params.uuid;

    if (!uuid) {
      return ctx.badRequest('uuid is required');
    }

    if (data.status !== 'paused' && data.status !== 'active') {
      return ctx.badRequest('status must be one of the following: paused, active');
    }

    const campaign = await strapi.query('api::campagne-push-notification.campagne-push-notification').findOne({
      where: { uuid },
      populate: {
        creator: true,
        typeLink: true,
        musiclinks: true,
        customImage: true
      }
    });

    if (!campaign) {
      return ctx.notFound();
    }

    const updateCampaign = await strapi.query('api::campagne-push-notification.campagne-push-notification').update({
      where: {
        id: campaign.id,
      },
      data: {
        status: data.status
      }
    })

    return  ctx.send(updateCampaign);
  },


  async deleteCPN(ctx){

    const hasAcctype = await strapi.service('api::creator.creator').verifyIfUserHasAcctype(ctx);
    if (!hasAcctype) {
      return ctx.unauthorized();
    }

    const uuid = ctx.params.uuid;

    if (!uuid) {
      return ctx.badRequest('uuid is required');
    }

    const campaign = await strapi.query('api::campagne-push-notification.campagne-push-notification').findOne({
      where: { uuid },
      populate: {
        creator: true,
        typeLink: true,
        musiclinks: true,
        customImage: true
      }
    })

    if (!campaign) {
      return ctx.notFound();
    }

    if (campaign.hasDelete){
      return ctx.badRequest('This campaign has already been deleted');
    }

    await strapi.query('api::campagne-push-notification.campagne-push-notification').update({
      where: {
        id: campaign.id,
      },
      data: {
        hasDelete: true,
      }
    })

    return  ctx.send({
      message: 'Campaign deleted successfully'
    });

  }


}));

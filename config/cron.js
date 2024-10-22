'use strict';

const { DateTime } = require('luxon');

function calculateEndTime(sendTime, campaignDuration) {
  let campaignEndTime = sendTime;
  switch (campaignDuration) {
    case 'unjour':
      campaignEndTime = campaignEndTime.plus({ days: 1 });
      break;
    case 'troisjours':
      campaignEndTime = campaignEndTime.plus({ days: 3 });
      break;
    case 'unesemaine':
      campaignEndTime = campaignEndTime.plus({ weeks: 1 });
      break;
    case 'deuxsemaines':
      campaignEndTime = campaignEndTime.plus({ weeks: 2 });
      break;
    case 'unmois':
      campaignEndTime = campaignEndTime.plus({ months: 1 });
      break;
    default:
      console.warn(`Unknown campaign duration for campaign`);
      break;
  }
  return campaignEndTime;
}

module.exports = {


  processPushCampaigns: {
    task: async ({ strapi }) => {
      console.log('Bonjour, chaque minute');

      // Récupérer toutes les campagnes actives
      const campaignsPushNotification = await strapi.query('api::campagne-push-notification.campagne-push-notification').findMany({
        where: { status: 'active' },
        populate: true,
      });


      for (const campaign of campaignsPushNotification) {
        const { campaignDuration, sendFrequency, sendDateTime, timezone } = campaign;

        // Vérification des données nécessaires
        if (!sendDateTime || !timezone || !campaignDuration) {
          console.warn(`Campaign ${campaign.id} is missing required fields.`);
          continue; // Passe à la prochaine campagne
        }

        const sendTime = DateTime.fromISO(sendDateTime, { zone: timezone });
        const now = DateTime.now().setZone(timezone);
        const campaignEndTime = calculateEndTime(sendTime, campaignDuration);

        console.log(sendTime)
        console.log(now)
        console.log(campaignEndTime)

        // Si la campagne est encore en cours
        if (now < campaignEndTime) {
          await handleSendFrequency(sendFrequency, campaign, sendTime, now, timezone, strapi);
        }else {
          // Marquer la campagne comme terminée
          await strapi.query('api::campagne-push-notification.campagne-push-notification').update({
            where: { id: campaign.id },
            data: { status: 'finished' }, // Changer le statut de la campagne à "finished"
          });
          console.log(`Campaign ${campaign.id} has finished.`);
        }
      }
    },
    options: {
      rule: '* * * * *', // Exécution chaque minute
    },
  },
  processPendingCampaignsPushNotification: {
    task: async ({ strapi }) => {
      const pendingCampaignsPushNotification = await strapi.query('api::campagne-push-notification.campagne-push-notification').findMany({
        where:{
          status: 'pending',
          hasDelete: false,
        },
        populate:true,
      })

      // Traitement des campagnes en attente
      if (pendingCampaignsPushNotification.length > 0) {
        for (const campaign of pendingCampaignsPushNotification) {
          await strapi.query('api::campagne-push-notification.campagne-push-notification').update({
            where:{
              id: campaign.id,
            },
            data: {
              status: 'active',
            },
          })

        }
      } else {
        console.log('Aucune campagne en attente à traiter.');
      }
    },
    options: {
      rule: '* * * * *', // Exécution toutes les minutes
    },
  },
}


async function handleSendFrequency(sendFrequency, campaign, sendTime, now, timezone, strapi) {
  const creator = campaign.creator.id;
  const myfanbase = await strapi.query('api::my-fanbase.my-fanbase').findOne({
    where: { creator },
    populate: true,
  });

  if (!myfanbase) {
    console.warn(`My fanbase not found for creator ${creator}`);
    return; // Passe à la prochaine campagne
  }

  const fcmtks = myfanbase.fcmtks;

  switch (sendFrequency) {
    case 'unefoisparjour':
      await sendOncePerDay(campaign, sendTime, now, fcmtks, strapi);
      break;
    case 'troisfoisparsemaine':
      await sendThreeTimesPerWeek(campaign, sendTime, now, fcmtks, strapi);
      break;
    case 'unefoisparsemaine':
      await sendOncePerWeek(campaign, sendTime, now, fcmtks, strapi);
      break;
    case 'unefoisparmois':
      await sendOncePerMonth(campaign, sendTime, now, fcmtks, strapi);
      break;
    default:
      console.warn(`Unknown send frequency for campaign ${campaign.id}`);
  }
}

async function sendOncePerDay(campaign, sendTime, now, fcmtks, strapi) {
  console.log('je suis la maintenant')
  const lastSentDate = campaign.lastSentDate ? DateTime.fromISO(campaign.lastSentDate).setZone(campaign.timezone).toISODate() : null;
  if (lastSentDate !== now.toISODate() && now.hour === sendTime.hour && now.minute === sendTime.minute) {
    await sendNotifications(campaign, fcmtks, strapi);
    await updateLastSentDate(campaign.id, now, strapi);
  }
}

async function sendThreeTimesPerWeek(campaign, sendTime, now, fcmtks, strapi) {
  const lastSentWeekDate = campaign.lastSentDate ? DateTime.fromISO(campaign.lastSentDate).setZone(campaign.timezone) : null;
  const daysToSend = [1, 3, 5]; // Lundi, Mercredi, Vendredi
  if (!lastSentWeekDate || (lastSentWeekDate.weekNumber !== now.weekNumber) && daysToSend.includes(now.weekday)) {
    await sendNotifications(campaign, fcmtks, strapi);
    await updateLastSentDate(campaign.id, now, strapi);
  }
}

async function sendOncePerWeek(campaign, sendTime, now, fcmtks, strapi) {
  const lastSentWeek = campaign.lastSentDate ? DateTime.fromISO(campaign.lastSentDate).setZone(campaign.timezone) : null;
  if (!lastSentWeek || (lastSentWeek.weekNumber !== now.weekNumber) && now.hour === sendTime.hour && now.minute === sendTime.minute) {
    await sendNotifications(campaign, fcmtks, strapi);
    await updateLastSentDate(campaign.id, now, strapi);
  }
}

async function sendOncePerMonth(campaign, sendTime, now, fcmtks, strapi) {
  const lastSentMonth = campaign.lastSentDate ? DateTime.fromISO(campaign.lastSentDate).setZone(campaign.timezone) : null;
  if (!lastSentMonth || (lastSentMonth.month !== now.month || lastSentMonth.year !== now.year) && now.hour === sendTime.hour && now.minute === sendTime.minute) {
    await sendNotifications(campaign, fcmtks, strapi);
    await updateLastSentDate(campaign.id, now, strapi);
  }
}

async function sendNotifications(campaign, fcmtks, strapi) {
  let successfulSends = 0; // Compteur pour les envois réussis

  for (const fcm of fcmtks) {
    const subscription = fcm.subscription;
    const pushData = await getPushData(campaign, strapi);

    if (pushData) {
      try {
        await strapi.service('api::fcmtk.fcmtk').sendPushNotification(subscription, pushData.title, pushData.body, pushData.options);
        successfulSends++; // Incrémente le compteur si l'envoi réussit
      } catch (error) {
        console.error(`Failed to send notification to subscription ${subscription}:`, error);
      }
    }
  }

  // Met à jour le nombre d'envois réussis*

  await strapi.query('api::statistic-send-cpn.statistic-send-cpn').create({
    data:{
      sendDateTime: new Date(),
      count: successfulSends,
      campagnepushnotification: campaign.id,
      publishedAt: new Date()
    }
  })


  console.log(`Number of successful sends: ${successfulSends}`);
  return successfulSends;
}


async function getPushData(campaign, strapi) {
  if (campaign.typePush === 'forBoostLink') {
    const musicLink = await strapi.query('api::music-link.music-link').findOne({ where: { id: campaign.link }, populate: true });
    if (!musicLink) {
      console.warn(`Music link not found for campaign ${campaign.id}`);
      return null;
    }

    const buttonChoice = capitalize(campaign.buttonChoice);
    const body = getPushBody(musicLink);

    const image = musicLink.typeLinkspotify === 'single'
      ? musicLink.musicData.album.images[0].url
      : musicLink.musicData.images[0].url;

    const url = musicLink.typelink?.key === 'musiclink'
      ? `${process.env.SMARTLINK}/${musicLink.smartLink}/${musicLink.uniqueKey}`
      : undefined;

    return {
      title: musicLink.name,
      body,
      options: {
        image,
        icon: image,
        actions: [{ action: 'view', title: buttonChoice }],
        url,
        onActionClick: {
          default: { operation: 'openWindow', url },
          view: { operation: 'openWindow', url }
        },
      },
    };
  }

  if (campaign.typePush === 'forCustomType') {
    const customButton = campaign.customButtons[0];
    return {
      title: campaign.customTitle,
      body: campaign.customDescription,
      options: {
        image: campaign.customImage.url,
        actions: [{ action: 'view', title: customButton.buttonText }],
        url: customButton.buttonLink,
        onActionClick: { default: { operation: 'openWindow', url: customButton.buttonLink } },
      },
    };
  }

  return null; // Aucun type de notification valide
}

async function updateLastSentDate(campaignId, now, strapi) {
  await strapi.query('api::campagne-push-notification.campagne-push-notification').update({
    where: { id: campaignId },
    data: { lastSentDate: now.toISO() },
  });
}


function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}



function getArtistsString(artists) {
  const artistNames = artists.map(artist => artist.name);
  const lastArtist = artistNames.pop();
  return artistNames.length ? artistNames.join(', ') + ' et ' + lastArtist : lastArtist;
}

function getPushBody(musicLink) {
  const artistString = getArtistsString(musicLink.musicData.artists);
  const isSingle = musicLink.typeLinkspotify === 'single';

  const emoji = isSingle ? '🔥🎶' : '🎉🎶';
  return isSingle
    ? `${artistString} est prêt${musicLink.musicData.artists.length > 1 ? 's' : ''} à te faire vibrer avec leur nouveau single "${musicLink.name}" ${emoji}`
    : `${artistString} débarquent avec l'album "${musicLink.name}" pour enflammer tes playlists ${emoji}`;
}



//await updateMusicLinks();

// recupere tout les musicc links et

const updateMusicLinks = async () =>{

  const musicLinks = await strapi.query('api::music-link.music-link').findMany({});

  for(let musicLink of musicLinks){

    console.log(musicLink, 'musicLink')

    const btnMl = musicLink.btnMl;
    const socialsMl = musicLink.socialsMl;

    if(btnMl && btnMl.length > 0){
      btnMl.forEach(btn => {
        btn.imageLogo = btn.imageLogo.replace('http://10.30.1.38:1337', process.env.BACKEND_URL);
        btn.imageBtnLight = btn.imageBtnLight.replace('http://10.30.1.38:1337', process.env.BACKEND_URL);
        btn.imageBtnDark = btn.imageBtnDark.replace('http://10.30.1.38:1337', process.env.BACKEND_URL);
      });
    }

    if (socialsMl && socialsMl.length > 0) {
      socialsMl.forEach(social => {
        social.imageLogo = social.imageLogo.replace('http://10.30.1.38:1337', process.env.BACKEND_URL);
        social.imageSoLight = social.imageSoLight.replace('http://10.30.1.38:1337', process.env.BACKEND_URL);
        social.imageSoDark = social.imageSoDark.replace('http://10.30.1.38:1337', process.env.BACKEND_URL);
      });
    }

    // mets a jour

    await strapi.query('api::music-link.music-link').update({
      where: { id: musicLink.id },
      data: {
        btnMl: btnMl,
        socialsMl: socialsMl,
      }
    })


  }

}

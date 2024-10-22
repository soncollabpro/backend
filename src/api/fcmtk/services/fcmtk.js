'use strict';

const utils = require("@strapi/utils");
const { ApplicationError, ValidationError , ForbiddenError } = utils.errors;
const webPush = require('web-push');

const vapidKeys = {
  publicKey: process.env.PUBLIC_WEB_PUSH,
  privateKey: process.env.PRIVATE_WEB_PUSH
};

// Configurer les informations VAPID
webPush.setVapidDetails(
  'mailto:firebase-adminsdk-yn9nb@soncollab-91b91.iam.gserviceaccount.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

/**
 * fcmtk service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::fcmtk.fcmtk', ({ strapi }) =>  ({

  async sendPushNotification(subscription, title, body, options= {}) {
    try {
      // Création du payload avec des options enrichies
      const notificationPayload = {
        notification: {
          title: title,
          body: body,
          icon: options.icon, // Icône par défaut ou fournie
          image: options.image || '', // Image si elle est fournie
          vibrate: [100, 50, 100],
          requireInteraction: true, // Nécessite une action de l'utilisateur pour être fermée
          renotify: true, // Notifie à nouveau si une notification avec le même tag est déjà présente
          silent: false, // Son activé (pas silencieux)
          tag: 'high-priority', // Tag pour regrouper des notifications similaires
          urgency: 'high', // Priorité d'urgence élevée
          data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
            url: options.url || '', // URL de redirection sur clic
            onActionClick: options.onActionClick
          },
          actions: options.actions || [] // Liste des actions (boutons) si fournie

        },
        ttl: 0,
        priority: 'high'
      };

      await webPush.sendNotification(subscription, JSON.stringify(notificationPayload));
    } catch (error) {
      if (error instanceof webPush.WebPushError && error.statusCode === 410) {
        console.warn(`Notification non envoyée : La souscription a expiré ou s'est désinscrite pour l'abonnement ${subscription}.`);
      } else {
        console.error('Erreur lors de l\'envoi de la notification:', error);
        throw new ApplicationError("L'envoi de la notification a échoué");
      }
    }
  }




}));




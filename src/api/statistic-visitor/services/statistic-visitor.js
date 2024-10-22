'use strict';

const axios = require("axios");
const encodingMap = {
  '0': 'aagb',
  '1': 'gbol',
  '2': 'tpop',
  '3': 'hsit',
  '4': 'qtad',
  '5': 'yolk',
  '6': 'frix',
  '7': 'pwel',
  '8': 'duvn',
  '9': 'mnac',
  '.': 'pnt'  // Correspondance pour le point dans l'IP
};

const decodingMap = Object.fromEntries(Object.entries(encodingMap).map(([k, v]) => [v, k]));

/**
 * statistic-visitor service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::statistic-visitor.statistic-visitor', ({ strapi }) =>  ({

  async  getInfoByIp(ip){
    try {
      const response = await axios.get(`https://freeipapi.com/api/json/${ip}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching IP data: ${error.message}`);
      return null;
    }
  },

  async  encodeIP(ip) {
    return ip.split('').map(char => encodingMap[char] || char).join('');
  },

  // Fonction pour décoder une chaîne encodée en adresse IP
  async  decodeIP(encodedString) {
    let decodedIP = '';
    let buffer = '';

    // Parcourir la chaîne encodée
    for (let char of encodedString) {
      buffer += char; // Ajouter le caractère au buffer
      if (buffer.length === 4) { // Les séquences ont 4 caractères
        decodedIP += decodingMap[buffer] || ''; // Traduire la séquence
        buffer = ''; // Réinitialiser le buffer
      }
    }

    return decodedIP;
  }

}));

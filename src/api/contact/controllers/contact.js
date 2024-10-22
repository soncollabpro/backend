'use strict';

/**
 * contact controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::contact.contact', ({ strapi }) =>  ({

  async create(ctx){
    const hasAcctype = await strapi.service('api::creator.creator').verifyIfUserHasAcctype(ctx);
    if (!hasAcctype) {
      return ctx.unauthorized();
    }

    const { data } = ctx.request.body;

    if (!data) {
      return ctx.badRequest('data is required');
    }

    data.nom = data.nom || null;
    data.prenom = data.prenom || null;
    data.email = data.email || null;
    data.telephone = data.telephone || null;
    data.age  = data.age || null;
    data.anniversaire = data.anniversaire || null;
    data.sexe = data.sexe || null;
    data.country = data.country || null


    const myfanbase = data.myfanbase;
    if (!myfanbase) {
      return ctx.badRequest('myfanbase is required');
    }

    const checkMyFanbase = await strapi.query("api::my-fanbase.my-fanbase").findOne({
      where: {
        id: myfanbase
      },
      populate: true
    })

    if (!checkMyFanbase) {
      return ctx.badRequest('myfanbase not found');
    }

    const currentContactsInFanbase = checkMyFanbase.contacts;
    const currentContactsInFanbaseWithoutDelete = currentContactsInFanbase.filter((contact) => contact.hasDelete === false);


    const email = data.email;
    const telephone = data.telephone;
    let existingEmail, existingTelephone;

    if (email) {
      existingEmail = currentContactsInFanbaseWithoutDelete.find((contact) => contact.email === email);
    }

    if (telephone) {
      existingTelephone = currentContactsInFanbaseWithoutDelete.find((contact) => contact.telephone === telephone);
    }

    if (existingEmail || existingTelephone) {
      return ctx.badRequest('Contact already exists in this myfanbase');
    }


    const newContact = await strapi.query('api::contact.contact').create({
      data: {
        ...data,
        myfanbase: checkMyFanbase.id,
        publishedAt: new Date(),
      }
    });

    return ctx.send(newContact);
  },

  async update(ctx){
    const hasAcctype = await strapi.service('api::creator.creator').verifyIfUserHasAcctype(ctx);
    if (!hasAcctype) {
      return ctx.unauthorized();
    }

    const { data } = ctx.request.body;

    if (!data) {
      return ctx.badRequest('data is required');
    }

    data.nom = data.nom || null;
    data.prenom = data.prenom || null;
    data.email = data.email || null;
    data.telephone = data.telephone || null;
    data.age  = data.age || null;
    data.anniversaire = data.anniversaire || null;
    data.sexe = data.sexe || null;
    data.country = data.country || null

    if (data.email === ''){
      data.email = null;
    }

    if (data.telephone === ''){
      data.telephone = null;
    }

    const myfanbase = data.myfanbase;
    if (!myfanbase) {
      return ctx.badRequest('myfanbase is required');
    }

    const checkMyFanbase = await strapi.query("api::my-fanbase.my-fanbase").findOne({
      where: {
        id: myfanbase
      },
      populate: true
    })

    if (!checkMyFanbase) {
      return ctx.badRequest('myfanbase not found');
    }

    const currentContactsInFanbase = checkMyFanbase.contacts;

    const currentContactsInFanbaseWithoutDelete = currentContactsInFanbase.filter((contact) => contact.hasDelete === false);


    const email = data.email;
    const telephone = data.telephone;
    let existingEmail, existingTelephone;

    if (email) {
      existingEmail = currentContactsInFanbaseWithoutDelete.find((contact) => contact.email === email);
    }

    if (telephone) {
      existingTelephone = currentContactsInFanbaseWithoutDelete.find((contact) => contact.telephone === telephone);
    }

    if (existingEmail || existingTelephone) {
      delete data.telephone;
      delete data.email;
    }


    const contactCheck = await strapi.query('api::contact.contact').findOne({
      where: {
        id: ctx.params.id
      },
    })

    if (!contactCheck) {
      return ctx.notFound('Contact not found');
    }


    const updateContact = await strapi.query('api::contact.contact').update({
      where: {
        id: ctx.params.id
      },
      data: {
        ...data,
        myfanbase: checkMyFanbase.id,
        publishedAt: new Date(),
      }
    });

    return ctx.send(updateContact);

  },

  async deleteCustom(ctx){
    const hasAcctype = await strapi.service('api::creator.creator').verifyIfUserHasAcctype(ctx);
    if (!hasAcctype) {
      return ctx.unauthorized();
    }

    const { data } = ctx.request.body;

    if (!data) {
      return ctx.badRequest('data is required');
    }


    if (!Array.isArray(data.ids)) {
      return ctx.badRequest('Invalid data.ids');
    }

    if (data.ids.length === 0) {
      return ctx.badRequest('data.ids is empty');
    }


    // verifie l'existance de chaque id
    const contacts = await strapi.query('api::contact.contact').findMany({
      where: {
        id:{
          $in: data.ids
        }
      }
    });

    if (contacts.length!== data.ids.length) {
      return ctx.badRequest('One or more contact(s) does not exist');
    }


    // supprime les contacts
   const updateL =  await strapi.query('api::contact.contact').updateMany({
      where: {
        id:{
          $in: data.ids
        }
      },
      data:{
        hasDelete: true
      }
    })

    console.log(updateL)

    return ctx.send({
      success: true
    });

  }

}));

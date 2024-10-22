'use strict';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
/**
 * acctype controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::acctype.acctype', ({ strapi }) =>  ({

  async associate(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    const { acctype } = ctx.request.body.data;

    if (!acctype) {
      return ctx.badRequest('acctype is required');
    }

    const id = user.id;
    const me = await strapi.query('plugin::users-permissions.user').findOne({
      where: {id},
      populate:{
        acctype:true,
        customer: true
      }
    });

    if (me.acctype !== null) {
      return ctx.badRequest('Already associated');
    }

    const acctypeModel = await strapi.query('api::acctype.acctype').findOne({
      where: {uuid: acctype},
    });

    if (!acctypeModel) {
      return ctx.badRequest('acctype not found');
    }

    await strapi.query('plugin::users-permissions.user').update({
      where: {id},
      data:{
        acctype: acctypeModel.id,
      }
    });

    // si le acctype est Creator

    if(acctypeModel.libelle === 'Creator'){
      if (!me.customer.customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata:{
            user: user.id
          }
        });

        await strapi.query('api::customer.customer').update({
          where: {id: me.customer.id},
          data:{
            customerId: customer.id,
          }
        })
      }else {
        await stripe.customers.update(me.customer.customerId, {
          email: user.email,
          metadata:{
            user: user.id
          }
        });
      }
    }

    return ctx.send({
      message: 'Account associated',
    });
  }

}));

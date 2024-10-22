'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    strapi.db.lifecycles.subscribe({
      models: ['plugin::users-permissions.user'],

      async beforeCreate(event){
        const { data , where } = event.params;
      },
      // your lifecycle hooks
      async afterCreate(event){
        const { result, params } = event;


        // create subscription for the user
        const sub = await strapi.query('api::subscription.subscription').create({
          data: {
            user: result.id,
            publishedAt: new Date(),
          }
        })

        // create customer for the subscription
        await strapi.query('api::customer.customer').create({
          data: {
            user: result.id,
            publishedAt: new Date(),
          }
        });


        //trial check
        await strapi.query('api::trialcheck.trialcheck').create({
          data: {
            subscription: sub.id,
            publishedAt: new Date(),
          }
        });

      },

    })
  },
};

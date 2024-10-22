'use strict';
const _ = require('lodash');
const utils = require('@strapi/utils');
const axios = require('axios');
const cheerio = require('cheerio');
const {sanitize} = utils;
const { yup, validateYupSchema } = require('@strapi/utils');
const { ApplicationError, ValidationError , ForbiddenError } = utils.errors;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const querystring = require('querystring');

const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

const sanitizeUser = (user, ctx) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel('plugin::users-permissions.user');
  return sanitize.contentAPI.output(user, userSchema, { auth });
};

const sanitizeOutput = (user) => {
  const schema = strapi.getModel('plugin::users-permissions.user');
  return sanitize.contentAPI.output(user, schema);
};

const validateEmailConfirmationSchema = yup.object({
  confirmation: yup.string().required(),
});


const callbackSchema = yup.object({
  identifier: yup.string().required(),
  password: yup.string().required(),
});




const getService = (name) => {
  return strapi.plugin('users-permissions').service(name);
};

const validateEmailConfirmationBody = validateYupSchema(validateEmailConfirmationSchema);
const validateCallbackBody = validateYupSchema(callbackSchema);



module.exports = (plugin) =>  {


  plugin.controllers.user.me = async (ctx) => {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }
    const id = user.id;
    const me = await strapi.query('plugin::users-permissions.user').findOne({
      where: {id},
      populate:{
        acctype:true,
        creators: {
          populate:{
            biographie:true,
            currency:true,
            musiclinks: {
              populate:{
                statisticvisitors: true,
                statisticclicks:{
                  populate:{
                    musiclinkplatform:{
                      populate: {
                        imageLogo:true,
                        imageBtnLight:true,
                        imageBtnDark:true,
                      }
                    },
                    musiclinksocial:{
                      populate:{
                        imageLogo: true,
                        imageSoLight: true,
                        imageSoDark: true,
                      }
                    },
                  }
                },
                typelink: true,
              }
            },
            myconnects: {
              populate:{
                statisticfolowersconnects: true,
                platformsconnect: {
                  populate:{
                    image: {
                      populate: true
                    }
                  }
                },
              }
            },
            myfanbase:{
              populate:{
                contacts: {
                  populate:true,
                },
                fcmtks:{
                  count:true
                }
              },
            },
            campagnepushnotifications:{
              populate:{
                customImage: true,
                musiclinks: true,
                typecampaign:true,
                statisticsendcpns:true,
                statisticclickcpns: true
              }
            }
          }
        },
        subscription:{
          populate: {
            plan: true,
            customer: true,
            trialcheck: true,
          }
        }
      }
    });

    // on verifie si l'utilisateur a un acctype et si il a des creators
    let dataCharge = {};
    let myConnectsCheck = [];
    spotifyApi.setAccessToken(await strapi.service('api::creator.creator').generateSpotifyToken());
    if (me.acctype !== null && me.creators.length > 0) {
      const creator = me.creators[0];
      if (creator.type === 'spotify') {
        const linkedAccount = creator.linkedAccount;
        const extract = await strapi.service('api::creator.creator').extractSpotifyId(linkedAccount);
        if (extract) {
          const spotifyUser = await spotifyApi.getArtist(extract);
          dataCharge = {
            type: creator.type,
            creator: spotifyUser.body
          };
        }
      }

      if (creator.type === 'youtube') {
        const linkedAccount = creator.linkedAccount;
        const channel = linkedAccount.split('/')[4];
        const youtubeUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${channel}&key=${process.env.YOUTUBE_API_KEY}`;
        const response = await axios.get(youtubeUrl);
        dataCharge = {
          type: creator.type,
          snippet: response.data.items[0].snippet,
          contentDetails: response.data.items[0].contentDetails,
          statistics: response.data.items[0].statistics
        };
      }


      const myConnects = creator.myconnects;

      if (myConnects.length > 0) {
        // si il y a un myconnect qui a pour platforms spotify
        const spotifyConnect = myConnects.find((myConnect) => myConnect.platforms ==='spotify');
        if (spotifyConnect) {
          const linkedAccount = spotifyConnect.url;
          const extract = await strapi.service('api::creator.creator').extractSpotifyId(linkedAccount);
          const spotifyUser = await spotifyApi.getArtist(extract);
          if (extract) {
            myConnectsCheck.push({
              type: 'spotify',
              followers: spotifyUser.body.followers.total
            })
          }


          const lastMyconnect = await strapi.query('api::my-connect.my-connect').findMany({
            where: {
              creator: {
                $eq: me.creators[0].id
              },
              platforms: 'spotify',
            },

            orderBy:{
              createdAt: 'asc'
            },
            limit: 1,

          })


          if (lastMyconnect.length === 0) {
            const createFirstConnect =  await strapi.query('api::my-connect.my-connect').create({
              data:{
                creator: me.creators[0].id,
                platforms: 'spotify',
                publishedAt: new Date(),
              }
            })
            await strapi.query('api::statistic-folowers-connect.statistic-folowers-connect').create({
              data:{
                myconnect: createFirstConnect.id,
                currentFollowers: spotifyUser.body.followers.total,
                lastUpdate: new Date(),
                publishedAt: new Date(),
              }
            })
          }else{
            const lastStatisticsFolowersConnect = await strapi.query('api::statistic-folowers-connect.statistic-folowers-connect').findMany({
              where: {
                myconnect: {
                  $eq: lastMyconnect[0].id
                }
              },
              orderBy:{
                lastUpdate: 'desc'
              },
              limit: 1,
              populate: {
                myconnect: true,
              }
            })

            if(lastStatisticsFolowersConnect.length > 0 ) {
              if (spotifyUser.body.followers.total  > lastStatisticsFolowersConnect[0].currentFollowers ){
                await strapi.query('api::statistic-folowers-connect.statistic-folowers-connect').create({
                  data:{
                    myconnect: lastMyconnect,
                    currentFollowers: spotifyUser.body.followers.total,
                    lastUpdate: new Date(),
                    publishedAt: new Date(),
                  }
                })
              }
            }else {
              await strapi.query('api::statistic-folowers-connect.statistic-folowers-connect').create({
                data:{
                  myconnect: lastMyconnect[0],
                  currentFollowers: spotifyUser.body.followers.total,
                  lastUpdate: new Date(),
                  publishedAt: new Date(),
                }
              })
            }
          }

        }

        const youtubeConnect = myConnects.find((myConnect) => myConnect.platforms ==='youtube');

        if (youtubeConnect) {
          const linkedAccount = youtubeConnect.url;
          const channel = linkedAccount.split('/')[4];
          const youtubeUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channel}&key=${process.env.YOUTUBE_API_KEY}`;
          const response = await axios.get(youtubeUrl);
          myConnectsCheck.push({
            type: 'youtube',
            followers: Number(response.data.items[0].statistics.subscriberCount)
          })


          const lastMyconnect = await strapi.query('api::my-connect.my-connect').findMany({
            where: {
              creator: {
                $eq: me.creators[0].id
              },
              platforms: 'youtube',
            },

            orderBy:{
              createdAt: 'asc'
            },
            limit: 1,

          })

          if (lastMyconnect.length === 0) {
            const createFirstConnect =  await strapi.query('api::my-connect.my-connect').create({
              data:{
                creator: me.creators[0].id,
                platforms: 'youtube',
                publishedAt: new Date(),
              }
            })
            await strapi.query('api::statistic-folowers-connect.statistic-folowers-connect').create({
              data:{
                myconnect: createFirstConnect.id,
                currentFollowers: Number(response.data.items[0].statistics.subscriberCount),
                lastUpdate: new Date(),
                publishedAt: new Date(),
              }
            })
          }else {

            const lastStatisticsFolowersConnect = await strapi.query('api::statistic-folowers-connect.statistic-folowers-connect').findMany({
              where: {
                myconnect: {
                  $eq: lastMyconnect[0].id
                }
              },
              orderBy:{
                lastUpdate: 'desc'
              },
              limit: 1,
              populate: {
                myconnect: true,
              }
            })

            if(lastStatisticsFolowersConnect.length > 0 ) {
              if (Number(response.data.items[0].statistics.subscriberCount) > lastStatisticsFolowersConnect[0].currentFollowers) {
                await strapi.query('api::statistic-folowers-connect.statistic-folowers-connect').create({
                  data: {
                    myconnect: lastMyconnect,
                    currentFollowers: Number(response.data.items[0].statistics.subscriberCount),
                    lastUpdate: new Date(),
                    publishedAt: new Date(),
                  }
                })
              }
            }else {
              await strapi.query('api::statistic-folowers-connect.statistic-folowers-connect').create({
                data: {
                  myconnect: lastMyconnect[0],
                  currentFollowers: Number(response.data.items[0].statistics.subscriberCount),
                  lastUpdate: new Date(),
                  publishedAt: new Date(),
                }
              })
            }

          }


        }
      }



    }


    let current = {}
    current.user = await sanitizeOutput(me, ctx);

    // ajoute un current.creator_type si il a un creator de type spotify ou youtube = dataCharge

    if (!_.isEmpty(dataCharge)) {
      current.charges = dataCharge
    }
    current.myConnects = myConnectsCheck
    current.jwt = await strapi.plugins[
      'users-permissions'
      ].services.jwt.issue({id: me.id});
    ctx.send(current);
  };


  plugin.controllers.user.emailExist = async (ctx) => {
    const {email} = ctx.request.query;
    const user = await strapi.query('plugin::users-permissions.user').findOne({
      where: {email},
    });
    return !_.isEmpty(user);
  };


  plugin.controllers.auth.callback = async (ctx) => {
    const provider = ctx.params.provider || 'local';
    const params = ctx.request.body;

    const store = strapi.store({ type: 'plugin', name: 'users-permissions' });
    const grantSettings = await store.get({ key: 'grant' });

    const grantProvider = provider === 'local' ? 'email' : provider;

    if (!_.get(grantSettings, [grantProvider, 'enabled'])) {
      throw new ApplicationError('This provider is disabled');
    }

    if (provider === 'local') {
      await validateCallbackBody(params);

      const { identifier } = params;

      // Check if the user exists.
      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: {
          provider,
          $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
        },
      });

      if (!user) {
        return ctx.badRequest('Invalid identifier or password');
      }

      if (!user.password) {
        return ctx.badRequest('Invalid identifier or password');
      }

      const validPassword = await getService('user').validatePassword(
        params.password,
        user.password
      );

      if (!validPassword) {
        return ctx.badRequest('Invalid identifier or password');
      }

      const advancedSettings = await store.get({ key: 'advanced' });
      const requiresConfirmation = _.get(advancedSettings, 'email_confirmation');

      if (requiresConfirmation && user.confirmed !== true) {
        return ctx.badRequest('Your account email is not confirmed');
      }

      if (user.blocked === true) {
        return ctx.badRequest('Your account has been blocked by an administrator');
      }

      return ctx.send({
        jwt: getService('jwt').issue({ id: user.id }),
        user: await sanitizeUser(user, ctx),
      });
    }

    // Connect the user with the third-party provider.
    try {
      const user = await getService('providers').connect(provider, ctx.query);

      if (user.blocked) {
        throw new ForbiddenError('Your account has been blocked by an administrator');
      }

      // si user.hastwofa est true alors on retourne une erreur


      return ctx.send({
        jwt: getService('jwt').issue({ id: user.id }),
        user: await sanitizeUser(user, ctx),
      });
    } catch (error) {
      throw new ApplicationError(error.message);
    }
  };


  plugin.controllers.auth.emailConfirmation = async (ctx, next, returnUser) => {
    const { confirmation: confirmationToken } = await validateEmailConfirmationBody(ctx.query);

    const userService = getService('user');
    const jwtService = getService('jwt');

    const [user] = await userService.fetchAll({ filters: { confirmationToken } });

    if (!user) {
      return ctx.redirect(`${process.env.INVALID_CONFIRM_EMAIL_LINK}/auth/invalid-email-confirmation`);
    }


    await userService.edit(user.id, { confirmed: true, confirmationToken: null });

    if (returnUser) {
      ctx.send({
        jwt: jwtService.issue({ id: user.id }),
        user: await sanitizeUser(user, ctx),
      });
    } else {
      const settings = await strapi
        .store({ type: 'plugin', name: 'users-permissions', key: 'advanced' })
        .get();

      ctx.redirect(settings.email_confirmation_redirection || `${process.env.EMAIL_CONFIRMATION_LINK}/auth/confirmation`);
    }
  };

  plugin.controllers.user.webhookStripe =  async (ctx) => {
    const sig = ctx.request.headers['stripe-signature'];
    const raw = ctx.request.body?.[Symbol.for('unparsedBody')];
    let event;
    let eventType;

    try {
      event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
      eventType = event.type;
    } catch (err) {
      return ctx.badRequest('Webhook error: ' + err.message);
    }

    const session = event.data.object;

    switch (eventType) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(session,ctx);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(session,ctx);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(session,ctx);
        break;
      default:

    }
    return ctx.send('Webhook received');
  };

  plugin.controllers.user.subscriptionPlans =  async (ctx) => {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    const { planUuid , timeplan , origin , type , linkedAccount } = ctx.request.body;

    if (!planUuid) {
      return ctx.badRequest('Missing planUuid');
    }

    if (!timeplan) {
      return ctx.badRequest('Missing timeplan');
    }

    if (timeplan !== 'Month' && timeplan !== 'Year') {
      return ctx.badRequest('Invalid timeplan');
    }

    if (origin === 'in-creator-page') {
      if(!type){
        return ctx.badRequest('Missing type');
      }
      if(!linkedAccount){
        return ctx.badRequest('Missing linkedAccount');
      }
    }


    const plan = await strapi.query('api::plan.plan').findOne({
      where: {
        uuid: planUuid,
      },
      populate:{
        addons:true,
      }
    });

    if (!plan) {
      return ctx.notFound('Plan not found');
    }

    const checkUser = await strapi.query('plugin::users-permissions.user').findOne({
      where: {id: user.id},
      populate:{
        acctype:true,
        creators: {
          populate:true
        },
        subscription:{
          populate: {
            plan: true,
            trialcheck: {
              populate: {
                plans: true,
              }
            },
          }
        },
        customer:{
          populate: true,
        }
      }
    })

    if (!checkUser) {
      return ctx.badRequest('User not found');
    }

    // verify si le user est creators
    if (checkUser.acctype === null) {
      return ctx.badRequest('User has not associated a creator');
    }

    const currentSubscription = checkUser.subscription;

    if(currentSubscription && currentSubscription.plan !== null){
      if(currentSubscription.plan.id === plan.id){
        return ctx.badRequest('You already have an active subscription');
      }
    }


    const website = await strapi.query('api::website.website').findMany({});
    const websiteVersionEssai = website[0].trialDay;

    const startDate = new Date();
    let endDate = null;
    const currentDate = new Date();
    endDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));

    let currentPlanId;
    if(currentSubscription && currentSubscription.plan !== null){
      currentPlanId = currentSubscription.plan.id;
    }else {
      currentPlanId = null;
    }

    const newPlanId = plan.id;

    const plansCheckTrial = checkUser.subscription.trialcheck.plans;
    const planCheckTrial = plansCheckTrial.some((plan) => plan.id === newPlanId);
    const customerIdStripe = checkUser.customer.customerId;
    const customerIdStrapi = checkUser.customer.id;

    const acctype = checkUser.acctype.libelle;

    let priceCheck = (acctype === 'Creator') ?
      (timeplan === 'Month' ? plan.strIdMonth : plan.strIdYear) :
      undefined;

    const comparator = await comparePlan(newPlanId,currentPlanId);

    let session;

    switch (comparator) {
      case 'retrograde':
        const blg = await stripe.billingPortal.sessions.create({
          customer: customerIdStripe,
          return_url: `${process.env.FRONTEND_URL}/`,
        });

        return ctx.send({
          url:blg.url
        });
      case 'upgrade':
        const billing = await stripe.billingPortal.sessions.create({
          customer: customerIdStripe,
          return_url: `${process.env.FRONTEND_URL}/`,
        });

        return ctx.send({
          url:billing.url
        });
      case 'first_paid':
        if(planCheckTrial){
          session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card', 'link', 'paypal'],
            line_items: [
              {
                price: priceCheck,
                quantity: 1,
              },
            ],
            metadata: {
              type: 'subscription',
              plan: plan.id,
              planTime: timeplan,
              customer: customerIdStrapi,
              user: user.id,
              acctype: acctype,
              makeDataCreatorType: type || null,
              makeDataCreatorLinkedAccount: linkedAccount || null,
              getGrade: comparator,
              isTrial: false,
            },
            customer: customerIdStripe,
            success_url: `${process.env.FRONTEND_URL}/account/billing?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/account/billing?cancel=true`,
          });
        }else {
          session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card', 'link', 'paypal'],
            line_items: [
              {
                price: priceCheck,
                quantity: 1,
              },
            ],
            metadata: {
              type: 'subscription',
              plan: plan.id,
              planTime: timeplan,
              customer: customerIdStrapi,
              user: user.id,
              makeDataCreatorType: type || null,
              makeDataCreatorLinkedAccount: linkedAccount || null,
              acctype: acctype,
              getGrade: comparator,
              isTrial: true,
            },
            customer: customerIdStripe,
            subscription_data: {
              trial_period_days: websiteVersionEssai,
            },
            success_url: `${process.env.FRONTEND_URL}/account/billing?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/account/billing?cancel=true`,
          });
        }

        return ctx.send({
          url:session.url
        });
      case 'first_free':
        return true
      case 'upgrade_to_free':
        await stripe.subscriptions.cancel(currentSubscription.subId , {
          cancellation_details:{
            comment: 'Cancel subscription upgrade to free',
            feedback: 'other'
          },
          invoice_now: true,
          prorate: true,
          expand: ['latest_invoice.payment_intent'],
        })

        return ctx.send({
          message: 'Subscription canceled'
        });
      case 'retrograde_to_free':
        await stripe.subscriptions.cancel(currentSubscription.subId , {
          cancellation_details:{
            comment: 'Cancel subscription upgrade to free',
            feedback: 'other'
          },
          invoice_now: true,
          prorate: true,
          expand: ['latest_invoice.payment_intent'],
        })

        return ctx.send({
          message: 'Subscription canceled'
        });
      case 'same':
        return ctx.badRequest('You already have an active subscription');
      default:
        return ctx.badRequest('Invalid plan');
    }

  };

  plugin.controllers.user.goToBilling = async (ctx) => {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    const userCheck = await strapi.query('plugin::users-permissions.user').findOne({
      where: {id: user.id},
      populate: {
        acctype: true,
        subscription:true,
        customer: true,
      }
    });

    const customerId = userCheck.customer.customerId;

    let makePlanStr = [];

    const plans  = await strapi.query('api::plan.plan').findMany({
      where: {
        strIdMonth: {
          $ne: null
        },
        strIdYear:{
          $ne: null
        }
      }
    });

    for (const plan of plans) {
      const planStr = {
        product: plan.productId,
        prices: [plan.strIdMonth, plan.strIdYear]
      }
      makePlanStr.push(planStr);
    }

    let session;
    let config;

    config = await stripe.billingPortal.configurations.create({
      business_profile: {
        privacy_policy_url: `${process.env.FRONTEND_URL}/`,
        terms_of_service_url: `${process.env.FRONTEND_URL}/`,
        headline: "Soncollab - Facturation",
      },

      features: {
        customer_update: {
          allowed_updates: ['name'],
          enabled: true,
        },

        invoice_history:{
          enabled: true,
        },

        subscription_cancel:{
          cancellation_reason:{
            enabled: true,
            options: ['low_quality','missing_features','other','switched_service','too_complex','too_expensive','unused'],
          },
          mode: 'immediately',
          proration_behavior: 'create_prorations',
          enabled: true,
        },

        subscription_update: {
          enabled: true,
          proration_behavior: 'create_prorations',
          default_allowed_updates: ['price'],
          products: makePlanStr,
        },

        payment_method_update: {
          enabled: true,
        }

      },

      login_page: {
        enabled: true,
      },

    });

    session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      configuration: config.id,
      return_url: `${process.env.FRONTEND_URL}/account/billing?callback=inBillingPage`,
    });

    return ctx.send({
      url: session.url
    });

  };

  plugin.routes['content-api'].routes.unshift(
    {
      method: 'GET',
      path: '/users/me',
      handler: 'user.me',
      config: {
        prefix: '',
      },
    },
    {
      method: 'POST',
      path: '/auth/local',
      handler: 'auth.callback',
      config: {
        prefix: '',
      },
    },
    {
      path: '/users/email-exist',
      method: 'GET',
      handler: 'user.emailExist',
      config: {
        description: 'Check if email exists',
        prefix:'',
      }
    },

    {
      path: '/users/webhook-stripe-9110-beta',
      method: 'POST',
      handler: 'user.webhookStripe',
      config: {
        description: 'Webhook stripe',
        prefix:'',
      }
    },

    {
      path: '/users/subscription-plans',
      method: 'POST',
      handler: 'user.subscriptionPlans',
      config: {
        description: 'Subscription plans',
        prefix:'',
      }
    },

    {
      path:'/users/billing',
      method: 'GET',
      handler: 'user.goToBilling',
      config: {
        description: 'Go to billing',
        prefix:'',
      }
    },


  );


  return plugin;
}



async function comparePlan(newPlanId, currentPlanId) {

  const newPlan = await strapi.query('api::plan.plan').findOne({
    where: { id: newPlanId },
  });

  if (!newPlan) {
    throw new Error('New plan not found');
  }

  if (currentPlanId === null) {
    if (newPlan.type === 'free') {
      return 'first_free';
    } else {
      return 'first_paid';
    }
  }

  const currentPlan = await strapi.query('api::plan.plan').findOne({
    where: { id: currentPlanId },
  });

  if (!currentPlan) {
    throw new Error('Current plan not found');
  }

  if (currentPlan.type === 'free' && newPlan.type !== 'free') {
    return 'first_paid';
  } else if (newPlan.level > currentPlan.level) {
    return 'upgrade';
  } else if (newPlan.level < currentPlan.level) {
    if (newPlan.type === 'free') {
      return 'retrograde_to_free';
    }
    return 'retrograde';
  } else {
    return 'same';
  }

}

async function handleCheckoutCompleted(session , ctx) {
  if (session.metadata.type === 'subscription') {

    const plan = await strapi.query('api::plan.plan').findOne({
      where: {
        id: session.metadata.plan,
      },
      populate:{
        addons:true,
      }
    });

    const planCheckId  = plan.id;

    if (!plan) {
      return ctx.notFound('Plan not found');
    }

    const user = await strapi.query('plugin::users-permissions.user').findOne({
      where: {id: session.metadata.user,},
      populate:{
        acctype:true,
        creators: {
          populate:true
        },
        subscription:{
          populate: {
            plan: true,
            trialcheck: {
              populate: {
                plans: true,
              }
            },
          }
        },
        customer:{
          populate: true,
        }
      }
    })

    if (!user) {
      return ctx.notFound('User not found');
    }

    const currentSubscription = user.subscription;

    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    const customer = await stripe.customers.retrieve(session.customer);

    let trialStartDate = new Date(subscription.trial_start * 1000);
    let trialEndDate = new Date(subscription.trial_end * 1000);

    let checkDateTr = new Date(subscription.trial_end * 1000);
    let endDate = null;

    const timeplanTr = subscription.plan.interval;

    if (timeplanTr === 'month') {
      endDate = new Date(checkDateTr.setMonth(checkDateTr.getMonth() + 1));
    }

    if (timeplanTr === 'year') {
      endDate = new Date(checkDateTr.setFullYear(checkDateTr.getFullYear() + 1));
    }

    // for no trial subscription


    let checkDateNoTrial = new Date(subscription.current_period_end * 1000);
    let endDateNoTrial = null;

    const timeplanNoTrial = subscription.plan.interval;

    if (timeplanNoTrial === 'month') {
      endDateNoTrial = new Date(checkDateNoTrial.setMonth(checkDateNoTrial.getMonth() + 1));
    }

    if (timeplanNoTrial === 'year') {
      endDateNoTrial = new Date(checkDateNoTrial.setFullYear(checkDateNoTrial.getFullYear() + 1));
    }

    if( user.creators.length === 0){

      const biographie = await strapi.query('api::biographie.biographie').create({
        data: {
          publishedAt: new Date(),
        }
      })

      const defaultCurrency = await strapi.query('api::currency.currency').findOne({
        where: {
          libelle: 'Euro'
        },
      });

      await strapi.query('api::creator.creator').create({
        data:{
          type: session.metadata.makeDataCreatorType,
          linkedAccount: session.metadata.makeDataCreatorLinkedAccount,
          user:user.id,
          biographie:biographie.id,
          currency:defaultCurrency.id,
          publishedAt: new Date(),
        }
      })

    }

    if (user.isMyFirst === false) {
      await strapi.query('plugin::users-permissions.user').update({
        where: {
          id: user.id,
        },
        data: {
          isMyFirst: true,
          publishedAt: new Date(),
        }
      })
    }

    const addons = plan.addons.map((addon) => addon.id);

    const plansCheckTrial = user.subscription.trialcheck.plans;
    const planCheckTrial = plansCheckTrial.some((plan) => plan.id === planCheckId);

    if(planCheckTrial){
      await strapi.query('api::subscription.subscription').update({
        where: {
          id: currentSubscription.id,
        },
        data: {
          user: user.id,
          plan: plan.id,
          status: 'active',
          startDate: checkDateNoTrial,
          endDate: endDateNoTrial,
          data: subscription,
          hasTrial: false,
          timeplan: timeplanNoTrial,
          startTrial: null,
          endTrial: null,
          addons: addons,
          publishedAt: new Date(),
        }
      });
    }else{

      await addPlanToTrialPlans(planCheckId,user.subscription.trialcheck.id);

      await strapi.query('api::subscription.subscription').update({
        where: {
          id: currentSubscription.id,
        },
        data: {
          user: session.metadata.user,
          plan: session.metadata.plan,
          status: 'trialing',
          startDate: trialEndDate,
          endDate: endDate,
          data: subscription,
          timeplan: timeplanTr,
          startTrial: trialStartDate,
          endTrial: trialEndDate,
          addons: addons,
          alreadyTried: true,
          hasTrial: true,
          publishedAt: new Date(),
        }
      });
    }


  }
}

async function handleSubscriptionUpdated(session, ctx) {
  const customer  = await stripe.customers.retrieve(session.customer);

  const strapiCustomer = await  strapi.query('api::customer.customer').findOne({
    where: {
      customerId: customer.id,
    },
    populate: true
  });

  if(!strapiCustomer){
    return ctx.notFound('Customer str not found');
  }

  const subscription = await stripe.subscriptions.retrieve(session.id);

  if (!subscription) {
    return ctx.notFound('Subscription not found');
  }

  const timeplan = subscription.plan.interval;

  let plan = null;
  if (timeplan === 'month') {
    plan = await strapi.query('api::plan.plan').findOne({
      where: {
        strIdMonth: session.plan.id,
      },
    });
  }else if (timeplan === 'year') {
    plan = await strapi.query('api::plan.plan').findOne({
      where: {
        strIdYear: session.plan.id,
      },
    });
  }

  if (!plan) {
    return ctx.notFound('Plan not found');
  }

  const isOnTrial = session.status === 'trialing'
  let endDate = null;
  let hasTrial = false;
  let status = null;

  if(isOnTrial){
    endDate = new Date(session.current_period_end * 1000);
    hasTrial = true;
    status = 'trialing';
  }else if (session.status === 'active') {
    hasTrial = false
    endDate = new Date(session.current_period_end * 1000)
    status = 'active'
  }

  const userCheckCu = await strapi.query('plugin::users-permissions.user').findOne({
    where: {
      id: strapiCustomer.user.id,
    },
    populate: true
  });


  if (!userCheckCu) {
    return ctx.notFound('User not found');
  }


  if (session.status === 'active' || session.status === 'trialing') {
    await strapi.query('api::subscription.subscription').update({
      where: {
        id: userCheckCu.subscription.id,
      },
      data: {
        plan: plan ? plan.id : null,
        startDate: new Date(session.current_period_start * 1000),
        status: status,
        endDate: endDate,
        data: subscription,
        hasTrial: hasTrial,
        timeplan: timeplan,
        publishedAt: new Date(),
      }
    });

  }

  if (session.status === 'canceled') {


    const planFree = await strapi.query('api::plan.plan').findOne({
      where: {
        type: 'free',
      },
      populate:true
    });

    if (!plan) {
      return ctx.notFound('Plan not found');
    }

    const addons = planFree.addons.map((addon) => addon.id);

    await strapi.query('api::subscription.subscription').update({
      where: {
        id: userCheckCu.subscription.id,
      },
      data: {
        plan: planFree.id,
        startDate: null,
        endDate: null,
        status: 'free',
        data: {},
        startTrial: null,
        endTrial: null,
        addons: addons,
        hasTrial: false,
        timeplan: null,
        publishedAt: new Date(),
      }
    });
  }
}

async function handleSubscriptionDeleted(session, ctx) {
  const customer  = await stripe.customers.retrieve(session.customer);

  const strapiCustomer = await  strapi.query('api::customer.customer').findOne({
    where: {
      customerId: customer.id,
    },
    populate: true
  });

  if(!strapiCustomer){
    return ctx.notFound('Customer str not found');
  }

  const subscriptionStr = await stripe.subscriptions.retrieve(session.id);

  if (!subscriptionStr) {
    return ctx.notFound('Subscription not found');
  }


  const userCheckCu = await strapi.query('plugin::users-permissions.user').findOne({
    where: {
      id: strapiCustomer.user.id,
    },
    populate: true
  });

  const planFree = await strapi.query('api::plan.plan').findOne({
    where: {
      type: 'free',
    },
    populate:true
  });


  if (!userCheckCu) {
    return ctx.notFound('User not found');
  }

  if (!planFree) {
    return ctx.notFound('Plan not found');
  }

  const addonsStr = planFree.addons.map((addon) => addon.id);

  if (session.status === 'canceled') {

    await strapi.query('api::subscription.subscription').update({
      where: {
        id: userCheckCu.subscription.id,
      },
      data: {
        plan: planFree.id,
        startDate: null,
        endDate: null,
        status: 'free',
        data: {},
        startTrial: null,
        endTrial: null,
        addons: addonsStr,
        hasTrial: false,
        timeplan: null,
        publishedAt: new Date(),
      }
    });

  }


}

async function addPlanToTrialPlans(planId, trialId){

  const trial = await strapi.query('api::trialcheck.trialcheck').findOne({
    where: { id: trialId },
    populate: true
  });

  const trialPlans = trial.plans;

  // on verifie si dans trialPlans il y a deja le plan qu'on veut ajouter
  const planCheck = trialPlans.find((plan) => plan.id === planId);

  if(!planCheck){
    return await strapi.query('api::trialcheck.trialcheck').update({
      where: { id: trialId },
      data: {
        plans: [
          ...trialPlans,
          {
            id: planId,
          }
        ]
      }
    });
  }

}

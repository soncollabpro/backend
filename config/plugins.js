module.exports = ({ env }) => ({

  email: {
    config: {
      provider: "strapi-provider-email-mailjet",
      providerOptions: {
        publicApiKey: env("MAILJET_PUBLIC_KEY"),
        secretApiKey: env("MAILJET_SECRET_KEY"),
      },
      settings: {
        defaultFrom: "office@soncollab.fr",
        defaultFromName: "Soncollab",
        defaultTo: "office@soncollab.fr",
        defaultToName: "Soncollab",
      },
    },

  },

  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
    },
  },
});

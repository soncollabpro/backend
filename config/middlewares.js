module.exports = [
  'strapi::errors',
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'http://172.20.10.2:4200',
        'http://172.20.10.2:1337',
        'http://10.30.1.91:4200',
        'http://10.30.1.91:1337',
        'http://192.168.0.10:4200',
        'http://localhost:4200',
        "http://localhost:1337",
        "http://192.168.0.10:1337",
        "http://192.168.0.16:1337",
        "http://192.168.0.16:4200",

        "http://10.30.1.92:1337",
        "http://10.30.1.92:4200",

        "http://192.168.1.106:1337",
        "http://192.168.1.106:4200",

        "https://api.soncollab.fr",
        "https://soncollab.fr",
        "https://www.soncollab.fr",
        "https://app.soncollab.fr",

        "http://10.0.0.19:4200",
        "http://10.0.0.19:1337",

        "http://10.30.1.110:4200",
        "http://10.30.1.110:1337",

        "http://172.20.10.5:4200",
        "http://172.20.10.5:1337",

        "http://192.168.1.111:4200",
        "http://192.168.1.111:1337",

        "http://10.30.1.175:4200",
        "http://10.30.1.175:1337",

        "http://10.0.0.24:4200",
        "http://10.0.0.24:1337",

        "http://10.0.0.25:4200",
        "http://10.0.0.25:1337",

        "http://10.30.1.38:4200",
        "http://10.30.1.38:1337",

        "https://10.30.1.38:4200",
        "http://127.0.0.1:8080",
        "http://10.0.0.21:8080",

        "http://127.0.0.1:8080",
        "http://127.0.0.1:1337",
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      includeUnparsed: true,
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  'strapi::security',
];

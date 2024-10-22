'use strict';

module.exports = {
  routes:[
    {
      method: 'POST',
      path: '/acctype/associate',
      handler: 'acctype.associate',
      config: {
        policies: [],
        tags: ['acctype'],
      }
    }
  ]
}

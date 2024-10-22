'use strict';

module.exports = {
  routes:[
    {
      method: 'PUT',
      path: '/contact/custom',
      handler: 'contact.deleteCustom',
      config: {
        policies: [],
        tags: ['contact'],
      }
    },

  ]
}

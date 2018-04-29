/**
 * Link.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    link: {
      type: 'string'
    },
    team_id: {
      type: 'string'
    },
    team_domain: {
      type: 'string'
    }
  }
}

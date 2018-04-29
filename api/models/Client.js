/**
 * Client.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    team_id: {
      type: 'string',
      required: true
    },
    team_domain: {
      type: 'string',
      required: true
    },
    channel: {
      type: 'string',
      required: true
    }
  }
}

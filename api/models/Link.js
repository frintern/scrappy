/**
 * Link.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    link: {
      type: 'string',
      required: true
    },
    team_id: {
      type: 'string',
      required: true
    },
    channel: {
      type: 'string',
      required: true
    }
  }
}

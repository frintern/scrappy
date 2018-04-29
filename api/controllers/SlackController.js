/**
 * SlackController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

/**
 * Create or update a client with which channel to listen to when scrapping links
 * @param Object
 * @return Promise<Client>
 */
const createOrUpdateClient = ({team_id, ...rest}) => {
  return new Promise((resolve, reject) => {
    Client.findOrCreate({team_id}, {team_id, ...rest}).exec(async (err, client, wasCreated) => {
      if (err){
        return reject(err)
      }
      if(wasCreated){
        return resolve(client)
      }

      // means we need to update the client with the new channel since its not a new client using our system
      await Client.update({team_id}, {channel: rest.channel})
      resolve({...client, channel: rest.channel})
    })
  })
}

module.exports = {
  scrappy: async (req, res) => {
    const { text, team_id, team_domain, ...rest } = req.body;

    if (text && text !== '') { // means we want to update the channel of scrappy or create new client
      await createOrUpdateClient({ team_id, channel: text, team_id, team_domain });
      return res.ok(`watching *${text}* channel ✌ `)
    }

    // if no text or channel name was pass accross we just randomly throw something out

    console.log('you called me', req.body, action)
    res.ok('done')
  }
}

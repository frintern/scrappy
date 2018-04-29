const rp = require('request-promise')
const getUrls = require('get-urls')

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

const getChannelInfo = (channel, token) => rp({
  uri:'https://slack.com/api/channels.info',
  qs: {
    token,
    channel
  }})

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
  },

  // any message sent to a channel should be handled
  events:  async (req, res) => {
    const {team_id, token, event} = req.body
    const {type, text, channel}  = event

    if(type !== 'message'){
      return res.ok({})
    }

    // get the channel name from the channel id
    const {channel:{name}} = JSON.parse(await getChannelInfo(channel, process.env.SLACK_TOKEN))

    // check if the channel is the configured channel for scrapper
    const client = await Client.findOne({team_id})

    if(client.channel !== name){
      return res.ok({})
    }

    // use the name to save the link now
    const urls = getUrls(text).values()

    for(let url of urls){
      await Link.create({link: url, team_id, channel: name})
    }
    res.ok({}) // must return a challenge
  }


}

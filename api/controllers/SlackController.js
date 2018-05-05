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

/**
 * Get a random link using mongoDB's $sample: https://docs.mongodb.com/manual/reference/operator/aggregation/sample/
 * @param team_id
 * @return Promise.resolve(Link) or undefined if no link
 */
const getRandomLink = team_id => {
  return new Promise((resolve, reject) => {
    const db = Link.getDatastore().manager
    const rawCollection = db.collection(Link.tableName)

    rawCollection.aggregate([
      {'$match': {team_id}},
      {'$sample': {size: 1}}
    ], (err, data)=>{
      err ? reject (err) : resolve(data[0])
    })
  })
}

module.exports = {
  // Slack > Slash Commands
  scrappy: async (req, res) => {
    const { text, team_id, team_domain, ...rest } = req.body;

    if (text && text !== '') { // means we want to update the channel of scrappy or create new client
      await createOrUpdateClient({ team_id, channel: text, team_id, team_domain });
      return res.ok(`watching *${text}* channel ✌ `)
    }

    // if no text or channel name was pass accross we just randomly throw something out to caller
    const link = await getRandomLink(team_id)

    if(!link){
      return res.ok("No links found. Are you sure you've assigned me to a channel to watch  `/scrappy [channel name]` ")
    }

    res.ok(link.link)
  },

  // any message sent to a channel should be handled , Slack > Event Subscription
  events:  async (req, res) => {

    const {team_id, token, event} = req.body
    const {type, text, channel, hidden}  = event

    if(type !== 'message'){
      return res.ok({})
    }

    if(hidden){ // means you ve shared this message twice on same channel
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

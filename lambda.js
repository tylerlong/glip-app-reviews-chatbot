const createApp = require('ringcentral-chatbot/dist/apps').default
const { createAsyncProxy } = require('ringcentral-chatbot/dist/lambda')
const serverlessHTTP = require('serverless-http')
const axios = require('axios')
const { Service } = require('ringcentral-chatbot/dist/models')

const handle = async event => {
  const { type, text, group, bot } = event
  if (type === 'Message4Bot') {
    if (text === 'ping') {
      await bot.sendMessage(group.id, { text: 'pong' })
    } else if (text === 'enable') {
      const one = await Service.findOne({
        where: {
          name: 'RingCentral Apps Reviews',
          groupId: group.id,
          botId: bot.id
        }
      })
      if (one !== null) {
        await bot.sendMessage(group.id, { text: 'RingCentral Apps Reviews notification had been enabled for this team.' })
        return
      }
      await Service.create({
        name: 'RingCentral Apps Reviews',
        groupId: group.id,
        botId: bot.id
      })
      await bot.sendMessage(group.id, { text: 'RingCentral Apps Reviews notification has been enabled for this team.' })
    } else if (text === 'disable') {
      await Service.destroy({
        where: {
          name: 'RingCentral Apps Reviews',
          groupId: group.id,
          botId: bot.id
        }
      })
      await bot.sendMessage(group.id, { text: 'RingCentral Apps Reviews notification has been disabled for this team.' })
    }
  }
}
const app = createApp(handle)
module.exports.app = serverlessHTTP(app)
module.exports.proxy = createAsyncProxy('app')
module.exports.maintain = async () => axios.put(`${process.env.RINGCENTRAL_CHATBOT_SERVER}/admin/maintain`, undefined, {
  auth: {
    username: process.env.RINGCENTRAL_CHATBOT_ADMIN_USERNAME,
    password: process.env.RINGCENTRAL_CHATBOT_ADMIN_PASSWORD
  }
})

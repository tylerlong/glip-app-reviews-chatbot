const createApp = require('ringcentral-chatbot/dist/apps').default;
const {createAsyncProxy} = require('ringcentral-chatbot/dist/lambda');
const serverlessHTTP = require('serverless-http');
const axios = require('axios');
const {Service, Bot} = require('ringcentral-chatbot/dist/models');

const crontab = async () => {
  const services = await Service.findAll({
    where: {name: 'RingCentral Apps Reviews'},
  });
  if (!services || services === null || services.length === 0) {
    return;
  }
  const date = new Date();
  date.setDate(date.getDate() - 2);
  const r = await axios.post(
    `https://api.birdeye.com/resources/v1/review/businessId/${process.env.BIRDEYE_BUSINESS_ID}?api_key=${process.env.BIRDEYE_API_KEY}`,
    {
      fromDate: date.toLocaleDateString(),
      statuses: ['all'],
    }
  );
  const newReviews = r.data;
  for (const service of services) {
    const bot = await Bot.findByPk(service.botId);
    try {
      await bot.sendMessage(service.groupId, {
        text: `
**New app reviews posted for the past 48 hours**

${
  newReviews.length === 0
    ? '**None**'
    : newReviews
        .map(
          (review: any) =>
            `User ${review.reviewer.firstName} ${
              review.reviewer.lastName
            } posted review on ${
              review.sourceType === 'Our Website'
                ? 'BirdEye'
                : review.sourceType
            }:
          **Stars:** ${review.rating}
          **Content:** ${review.comments}
          **URL:** ${review.uniqueReviewUrl}`
        )
        .join('\n\n')
}

Click [here](https://birdeye.com/ringcentral-697928128?filter=Newest) to view all of them.
`,
      });
    } catch (e) {
      // catch the exception so that it won't break the for loop
      console.error(e);
    }
  }
};
module.exports.crontab = crontab;

const handle = async (event: any) => {
  const {type, text, group, bot} = event;
  if (type === 'Message4Bot') {
    if (text === 'ping') {
      await bot.sendMessage(group.id, {text: 'pong'});
    } else if (text === 'enable') {
      const one = await Service.findOne({
        where: {
          name: 'RingCentral Apps Reviews',
          groupId: group.id,
          botId: bot.id,
        },
      });
      if (one !== null) {
        await bot.sendMessage(group.id, {
          text: 'RingCentral Apps Reviews notification had been enabled for this team.',
        });
        return;
      }
      await Service.create({
        name: 'RingCentral Apps Reviews',
        groupId: group.id,
        botId: bot.id,
      });
      await bot.sendMessage(group.id, {
        text: 'RingCentral Apps Reviews notification has been enabled for this team.',
      });
    } else if (text === 'disable') {
      await Service.destroy({
        where: {
          name: 'RingCentral Apps Reviews',
          groupId: group.id,
          botId: bot.id,
        },
      });
      await bot.sendMessage(group.id, {
        text: 'RingCentral Apps Reviews notification has been disabled for this team.',
      });
    } else if (text === 'report') {
      await crontab();
    }
  }
};
const app = createApp(handle);
module.exports.app = serverlessHTTP(app);
module.exports.proxy = createAsyncProxy('app');
module.exports.maintain = async () =>
  axios.put(
    `${process.env.RINGCENTRAL_CHATBOT_SERVER}/admin/maintain`,
    undefined,
    {
      auth: {
        username: process.env.RINGCENTRAL_CHATBOT_ADMIN_USERNAME,
        password: process.env.RINGCENTRAL_CHATBOT_ADMIN_PASSWORD,
      },
    }
  );

const axios = require('axios')
const moment = require('moment-timezone')

axios.defaults.headers.common['X-Client-Key'] = process.env.APPFIGURES_CLIENT_KEY
axios.defaults.headers.common.Authorization = `Basic ${process.env.BASIC_AUTHORIZATION_KEY}`

;(async () => {
  const r = await axios.get('https://api.appfigures.com/v2/reviews')
  const oneDayAgo = moment().add(-3, 'day').utc().format()
  const newReviews = r.data.reviews.filter(review => moment(review.date).tz('EST').utc().format() > oneDayAgo)
  console.log(newReviews)
})()

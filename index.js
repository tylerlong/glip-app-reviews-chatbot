const axios = require('axios')

axios.defaults.headers.common['X-Client-Key'] = process.env.APPFIGURES_CLIENT_KEY
axios.defaults.headers.common.Authorization = `Basic ${process.env.BASIC_AUTHORIZATION_KEY}`

axios.get('https://api.appfigures.com/v2/reviews')
  .then(r => {
    console.log(r.data)
  }).catch(e => {
    console.log(e)
  })

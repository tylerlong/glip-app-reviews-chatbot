const axios = require('axios')

axios.defaults.headers.common['X-Client-Key'] = process.env.appfigures_client_key
axios.defaults.headers.common.Authorization = `Basic ${process.env.basic_authorization_key}`

axios.get('https://api.appfigures.com/v2/reviews')
  .then(r => {
    console.log(r.data)
  }).catch(e => {
    console.log(e)
  })

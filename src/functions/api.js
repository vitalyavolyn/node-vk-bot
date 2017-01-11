import unirest from 'unirest'

/**
 * Класс для обращения к API ВКонтакте
 */
export default function API (token, version = 5.62, lang = 0) {
  return function (method, params = {}) {
    params.lang = params.lang || lang
    params.v = params.v || version
    params.access_token = token
    return new Promise((resolve, reject) => {
      unirest.post('https://api.vk.com/method/' + method)
      .field(params)
      .end(res => {
        if (!res.body) {
          reject(res)
        } else if (res.body.error) {
          reject(res.body.error)
        } else {
          resolve(res.body.response)
        }
      })
    })
  }
}

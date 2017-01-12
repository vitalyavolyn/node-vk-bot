import rq from 'request-promise-native'

/**
 * Класс для обращения к API ВКонтакте
 */
export default function API (token, version = 5.62, lang = 0) {
  return function (method, params = {}) {
    params.lang = params.lang || lang
    params.v = params.v || version
    params.access_token = token
    return rq({
      baseUrl: 'https://api.vk.com',
      uri: '/method/' + method,
      form: params,
      method: 'POST',
      json: true,
      timeout: this.timeout
    }).then(res => {
      if (res.error) {
        throw res.error
      }
      return res.response
    })
  }
}

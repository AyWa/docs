// Packages
import NProgress from 'nprogress'
import Cookies from 'js-cookie'

// Helpers
import { getToken } from './authenticate'
import fetchAPI from './fetch-api'

export default async () => {
  const token = getToken()
  NProgress.start()
  try {
    const { tokens } = await fetchAPI('/api/user/tokens', token, {
      throwOnHTTPError: true
    })
    const tokenObj = tokens.find(t => token === t.token)
    await fetchAPI(
      `/api/user/tokens/${encodeURIComponent(tokenObj.id)}`,
      token,
      {
        method: 'DELETE',
        throwOnHTTPError: true
      }
    )
    Cookies.remove('token')
    Cookies.remove('_now_no_cache')
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err.stack)
    if (err.status === 403) {
      // we consider it already logged out
      // if the user doesn't have access to
      // own tokens
      Cookies.remove('token')
      Cookies.remove('_now_no_cache')
      return
    }
    if (err.code == null) {
      err.code = 'UNKNOWN'
    }
    throw err
  } finally {
    NProgress.done()
  }
}

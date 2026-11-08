function callFunction(name, data) {
  if (!wx.cloud || typeof wx.cloud.callFunction !== 'function') {
    return Promise.reject(new Error('云服务暂不可用，请稍后重试'))
  }
  return wx.cloud.callFunction({ name, data }).then(response => {
    const result = response && response.result ? response.result : {}
    if (!result.ok) {
      const error = new Error(result.message || '提交失败，请稍后重试')
      error.code = result.code || 'UNKNOWN_ERROR'
      throw error
    }
    return result
  })
}

function submitInquiry(data) {
  return callFunction('submitInquiry', data)
}

function getHomeModules() {
  return callFunction('getHomeModules', {})
}

module.exports = { callFunction, submitInquiry, getHomeModules }

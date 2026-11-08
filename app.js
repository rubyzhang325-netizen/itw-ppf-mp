App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('当前微信基础库不支持云开发')
      return
    }
    wx.cloud.init({
      env: 'miniprogram-2026-d7e2q4t739a5d49',
      traceUser: true
    })
  },
  globalData: {}
})

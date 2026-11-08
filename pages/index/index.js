const auth = require('../../utils/auth')
const cms = require('../../utils/cms')
const link = require('../../utils/link')

// Banner 仍使用本地配置；首页模块优先读取 CloudBase，失败时自动保留本地配置。
Page({
  data: { banners: [], modules: [], role: 'guest', lock: null },

  onShow() {
    const role = auth.getUser().role
    const applyModules = modules => {
      this.setData({
        modules: modules.map(m => Object.assign({}, m, {
          locked: !auth.can(m.access)
        }))
      })
    }

    // 先立即显示本地兜底数据，避免网络请求期间首页空白。
    this.setData({
      role, lock: null,
      banners: cms.HOME.banners,
      modules: []
    })

    applyModules(cms.homeModules())

    // 每次回到首页都重新读取后台，便于运营修改后立即验证。
    cms.loadHomeModules()
      .then(applyModules)
      .catch(error => {
        console.warn('首页模块读取失败，已使用本地配置', error)
      })
  },

  onBanner(e) { link.open(this.data.banners[e.currentTarget.dataset.i].link) },

  onModule(e) {
    const m = this.data.modules[e.currentTarget.dataset.i]
    // 两个内容库先进入对应页面，统一展示局部预览和居中注册卡片。
    if (['apps','products'].includes(m.key)) return link.open(m.link)
    if (m.locked) return this.setData({ lock: auth.lockFor(m.access) })
    link.open(m.link)
  },

  toRegister() { wx.navigateTo({ url: '/pages/register/register?role=member' }) },
  closeLock() { this.setData({ lock: null }) },
  onShareAppMessage() { return { title: 'ITW PPF', path: '/pages/index/index' } }
})


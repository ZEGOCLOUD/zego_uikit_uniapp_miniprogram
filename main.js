import App from './App'

import './common.scss'

// #ifndef VUE3
import Vue from 'vue'

// 针对小程序setData方法判断
Vue.prototype.setData = Vue.prototype.setData || function () {
  const data = arguments[0] || {}
  for(let key in data) {
    this[key] = null
    setTimeout(()=>{
      this[key] = data[key]
    console.log(111111, data[key])
    }, 0)
  }
}
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif 
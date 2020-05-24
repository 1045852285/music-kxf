import Vue from 'vue';
import Vuex from 'vuex';
import state from './state';
import mutations from './mutations';
import * as actions from './actions';
import * as getters from './getters';
// 我们在每次通过mutations方式修改state的时候，他会在我们控制台会打印一个logger
import createLogger from 'vuex/dist/logger'
Vue.use(Vuex);

// 调试工具
// 帮我们检测对state修改是不是通过mutations去修改，如果直接修改会报错
// 这个NODE_ENV在我们调用weboack编译的时候，我们如果是npm run dev的话，NODE_ENV就是一个
// dev环境，如果说我们是一个npm run build的的话，就是一个production环境
// 所以在我们线下调试的时候，debug就是一个true
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  // 在线下调试的时候我们要开启严格模式
  // 会检测state的修改是不是来源于mutations，否则的话就会报一个警告
  // 因为开启会有性能损耗，所以我们是不建议在线上使用的
  strict:debug,
  plugins:debug?[createLogger()]:[]
});

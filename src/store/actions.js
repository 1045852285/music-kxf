import * as types from "./mutations-types"

// 在music-list组件里面对vuex的mutation进行多地方的修改，所以封装一个action函数
// action的作用：异步，点击一处修改mutation多处
export const selectPlay = function ({ commit, state }, { list, i }) {
    commit(types.SET_SEQUENCE_LIST,list)
    commit(types.SET_PLAYLIST,list)
    commit(types.SET_CURRENT_INDEX,i)
    commit(types.SET_FULL_SCREEN,true)
    commit(types.SET_PLAYING_STATE,true)
}
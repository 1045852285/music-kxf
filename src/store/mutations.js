import * as types from "./mutations-types"

const mutations = {
    // 点击进入歌手详情页面时带入的参数
    [types.SET_SINGER](state, singer) {
        state.singer = singer;
    },

    // 播放暂停状态
    [types.SET_PLAYING_STATE](state, playing) {
        state.playing = playing;
    },

    // 播放器展开和收起状态
    [types.SET_FULL_SCREEN](state, fullScreen) {
        state.fullScreen = fullScreen;
    },

    // (播放可以前进后退)播放列表状态,可能是有序也可能是无序
    [types.SET_PLAYLIST](state, playList) {
        state.playList = playList;
    },

    // 歌曲列表，是有序列表
    [types.SET_SEQUENCE_LIST](state, sequenceList) {
        state.sequenceList = sequenceList;
    },

    // 播放顺序（顺序，随机播放）
    [types.SET_PLAY_MODE](state, mode) {
        state.mode = mode;
    },

    // 当前播放歌曲
    [types.SET_CURRENT_INDEX](state, currentIndex) {
        state.currentIndex = currentIndex;
    },
}
export default mutations;
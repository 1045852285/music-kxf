import * as types from "./mutations-types"
import { playMode } from "../common/js/config"
import { shuffle } from "../common/js/util"
import { saveSearch, clearSearch, deleteSearch, savePlay, saveFavorite, deleteFavorite } from '../common/js/cache'

function findIndex(list, song) {
    return list.findIndex((item) => {
        return item.id === song.id
    })
}

// 在music-list组件里面对vuex的mutation进行多地方的修改，所以封装一个action函数
// action的作用：异步，点击一处修改mutation多处
export const selectPlay = function ({ commit, state }, { list, i }) {
    commit(types.SET_SEQUENCE_LIST, list)
    if (state.mode === playMode.random) {
        let randomList = shuffle(list)
        commit(types.SET_PLAYLIST, randomList)
        i = findIndex(randomList, list[i])
    } else {
        commit(types.SET_PLAYLIST, list)
    }
    commit(types.SET_CURRENT_INDEX, i)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

// 随机播放按钮触发的 random随机播放
export const randomPlay = function ({ commit }, { list }) {
    commit(types.SET_PLAY_MODE, playMode.random)
    commit(types.SET_SEQUENCE_LIST, list)
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    // 从打乱数组的第一个开始播放
    commit(types.SET_CURRENT_INDEX, 0)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

export const insertSong = function ({ commit, state }, song) {
    let playList = state.playList.slice()
    let sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex
    // 记录当前歌曲
    let currentSong = playList[currentIndex]
    // console.log(currentIndex);当第一次添加歌曲时打印-1
    
    // 先查一下我们插入的歌曲在不在playList里面，并返回其索引
    let fpIndex = findIndex(playList, song)
    // 因为是插入歌曲，所以索引要加1
    currentIndex++
    // 插入这首歌到当前索引位置
    playList.splice(currentIndex, 0, song)
    // 如果已经包含了这首歌
    if (fpIndex > -1) {
        // 如果当前插入的序号，大于我们之前列表中的序号
        if (currentIndex > fpIndex) {
            playList.splice(fpIndex, 1)
            currentIndex--
        } else {
            playList.splice(fpIndex + 1, 1)
        }
    }

    // 当前播放的歌曲从我们的sequenceList里面找，返回下标
    // 这个currentIndex是我们将要插入的位置
    let currentSIndex = findIndex(sequenceList, currentSong) + 1;
    // 先查一下我们插入的歌曲在不在sequenceList里面，并返回其索引
    let fsIndex = findIndex(sequenceList, song)

    sequenceList.splice(currentSIndex, 0, song)

    if (fsIndex > -1) {
        if (currentSIndex > fsIndex) {
            sequenceList.splice(fpIndex, 1)
        } else {
            sequenceList.splice(fpIndex + 1, 1)
        }
    }

    commit(types.SET_PLAYLIST, playList)
    commit(types.SET_SEQUENCE_LIST, sequenceList)
    commit(types.SET_CURRENT_INDEX, currentIndex)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

// 播放历史
export const savePlayHistory = function ({ commit }, song) {
    commit(types.SET_PLAY_HISTORY, savePlay(song))
}

export const deleteFavoriteList = function ({ commit }, song) {
    commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}

// 添加   搜索历史
export const saveSelectHistory = function({commit}, query) {
    commit(types.SET_SEARCH_HOSTORY, saveSearch(query))
}

// 删除   指定搜索历史
export const deletSelectHistory = function({commit}, query) {
    commit(types.SET_SEARCH_HOSTORY, deleteSearch(query))
}

// 删除   全部搜索历史
export const clearSelectHistory = function({commit}) {
    commit(types.SET_SEARCH_HOSTORY, clearSearch())
}

// 删除播放列表中的某个
export const deleteSong = function({commit, state}, song) {
    let playList = state.playList.slice()
    let sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex

    let pIndex = findIndex(playList, song)
    playList.splice(pIndex, 1)

    let sIndex = findIndex(sequenceList, song)
    sequenceList.splice(sIndex, 1)

    if (currentIndex > pIndex || currentIndex === playList.length) {
        currentIndex--
    }
    
    commit(types.SET_PLAYLIST, playList)
    commit(types.SET_SEQUENCE_LIST, sequenceList)
    commit(types.SET_CURRENT_INDEX, currentIndex)

    // 如果说我们把这个列表删完了，也就是playList.length为空时
    // if (!playList.length) {
    //     commit(types.SET_PLAYING_STATE, false)
    // } else {
    //     commit(types.SET_PLAYING_STATE, true)
    // }

    // 等同于上面被注释的代码
    const playingState = playList.length > 0
    commit(types.SET_PLAYING_STATE, playingState)
}

// 清空整个播放列表
export const deleteSongList = function({commit}) {
    commit(types.SET_PLAYLIST, [])
    commit(types.SET_SEQUENCE_LIST, [])
    commit(types.SET_CURRENT_INDEX, -1)
    commit(types.SET_PLAYING_STATE, false)
}

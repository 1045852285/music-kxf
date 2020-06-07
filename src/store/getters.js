import Song from '../common/js/song'

// 点击进入歌手详情页面时带入的参数
export const singer = state => state.singer

// 播放暂停状态
export const playing = state => state.playing

// 播放器展开和收起状态
export const fullScreen = state => state.fullScreen

// (播放可以前进后退)播放列表状态,可能是有序也可能是无序
export const playList = state => state.playList

// 歌曲列表，是有序列表
export const sequenceList = state => state.sequenceList

// 播放顺序（顺序，随机播放）
export const mode = state => state.mode

// 当前播放的索引
export const currentIndex = state => state.currentIndex

// 当前播放歌曲
export const currentSong = (state) => {
    return state.playList[state.currentIndex] || {}
}

// 歌单对象
export const disc = state => state.disc

export const favoriteList = (state) => {
    return state.favoriteList.map((song) => {
        return new Song(song)
    })
}

// 搜索历史
export const searchHistory = (state) => state.searchHistory


// 歌曲排行传的对象
export const topList = state => state.topList
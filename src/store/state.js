import { playMode } from '../common/js/config'
import { loadSearch, loadPlay } from '../common/js/cache'

const state = {
    // 点击进入歌手详情页面时带入的参数
    singer: {},
    // 播放暂停状态
    playing: false,
    // 播放器展开和收起状态
    fullScreen: false,
    // (播放可以前进后退)播放列表状态,可能是有序也可能是无序
    playList: [],
    // 歌曲列表，是有序列表
    sequenceList: [],
    // 播放顺序（顺序，随机播放）
    mode: playMode.sequence,
    // 当前播放的索引
    currentIndex: -1,
    // 歌单对象
    disc: {},
    // 播放历史
    playHistory: loadPlay(),
    favoriteList: [],
    // 歌曲排行传的对象
    topList: {},
    // 搜索历史  loadSearch()从本地存储中读数据
    searchHistory: loadSearch()
    
}
export default state;
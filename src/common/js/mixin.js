import { mapGetters, mapMutations, mapActions } from 'vuex'
import { playMode } from '../../common/js/config'
import { shuffle } from '../../common/js/util'

export const playListMixin = {
    computed: {
        ...mapGetters([
            'playList'
        ])
    },
    mounted() {
        this.handlePlayList(this.playList)
    },
    activated() {
        this.handlePlayList(this.playList)
    },
    watch: {
        playList(newVal) {
            this.handlePlayList(newVal)
        }
    },
    methods: {
        handlePlayList() {
            throw new Error('mixin函数handlePlayList未实现')
        }
    },
}

// export const playlistMixin = {
//     computed: {
//         ...mapGetters([
//             'playlist'
//         ])
//     },
//     mounted() {
//         this.handlePlaylist(this.playlist)
//     },
//     activated() {
//         this.handlePlaylist(this.playlist)
//     },
//     watch: {
//         playlist(newVal) {
//             this.handlePlaylist(newVal)
//         }
//     },
//     methods: {
//         handlePlaylist() {
//             throw new Error('component must implement handlePlaylist method')
//         }
//     }
// }

export const playerMixin = {
    computed: {
        // 播放模式切换
        iconMode() {
            return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
        },
        ...mapGetters([
            'sequenceList',
            'playList',
            'currentSong',
            'mode',
            'favoriteList'
        ]),
        favoriteIcon() {
            return this.getFavoriteIcon(this.currentSong)
        }
    },
    methods: {
        // 切换播放状态
        changeMode() {
            // 很简单,1除以3的商是0,余数自然是1.那么2除以3的商也是0,
            // 余数是2也就是说,一个数除以另一个数,要是比另一个数小的话,余数就是它自己.
            const mode = (this.mode + 1) % 3
            this.setPlayMode(mode)
            let list = null
            if (mode === playMode.random) {
                list = shuffle(this.sequenceList)
            } else {
                list = this.sequenceList
            }
            this.resetCurrentIndex(list)
            this.setPlayList(list)
        },
        // 数组被打乱之后，还能确保下标是正在播放的这首歌
        resetCurrentIndex(list) {
            // 在打乱的数组里面找到正在播放的这首歌的下标，然后传入vuex里面
            let index = list.findIndex((item) => {
                return item.id === this.currentSong.id
            })
            this.setCurrentIndex(index)
        },
        toggleFavorite(song) {
            if (this.isFavorite(song)) {
                this.deleteFavoriteList(song)
            } else {
                this.saveFavoriteList(song)
            }
        },
        getFavoriteIcon(song) {
            if (this.isFavorite(song)) {
                return 'icon-favorite'
            }
            return 'icon-not-favorite'
        },
        isFavorite(song) {
            const index = this.favoriteList.findIndex((item) => {
                return item.id === song.id
            })
            return index > -1
        },
        ...mapMutations({
            // 播放顺序（顺序，随机播放）
            setPlayMode: 'SET_PLAY_MODE',
            // 歌曲列表，是无序列表
            setPlayList: 'SET_PLAYLIST',
            // 当前播放歌曲下标
            setCurrentIndex: 'SET_CURRENT_INDEX',
            // 播放暂停状态
            setPlayingState: 'SET_PLAYING_STATE'
        }),
        ...mapActions([
            'saveFavoriteList',
            'deleteFavoriteList'
        ])
    }
}


export const searchMixin = {
    data() {
        return {
            query: '',
            // scroll延迟重新计算高度的时间
            refreshDelay: 100
        }
    },
    computed: {
        ...mapGetters(["searchHistory"])
    },
    methods: {
        blurInput() {
            this.$refs.searchBox.blur();
        },
        saveSelect() {
            this.saveSelectHistory(this.query);
        },
        onQueryChange(query) {
            this.query = query.trim();
            // console.log(query);
        },
        addQuery(k) {
            this.$refs.searchBox.setQuery(k);
        },
        ...mapActions([
            "saveSelectHistory",
            "deletSelectHistory"
        ])
    }
}
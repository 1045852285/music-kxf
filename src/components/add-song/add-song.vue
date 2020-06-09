<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <div class="search-box-wrapper">
        <search-box ref="searchBox" @query="onQueryChange" placeholder="搜索歌曲"></search-box>
      </div>
      <div class="shortcut" v-show="!query">
        <switches @switch="switchItem" :switches="switches" :currentIndex="currentIndex"></switches>
        <div class="list-wrapper">
          <scroll ref="songlists" class="list-scroll" v-if="currentIndex === 0" :data="playHistory">
            <div class="list-inner">
              <song-list @select="selectSong" :songs="playHistory"></song-list>
            </div>
          </scroll>
          <scroll
            :refreshDelay="refreshDelay"
            ref="searchLists"
            class="list-scroll"
            v-if="currentIndex === 1"
            :data="searchHistory"
          >
            <div class="list-inner">
              <search-list
                :searches="searchHistory"
                @delete="deletSelectHistory"
                @select="addQuery"
              ></search-list>
            </div>
          </scroll>
        </div>
      </div>
      <div class="search-result" v-show="query">
        <suggest
          @listScroll="blurInput"
          :query="query"
          :showSinger="showSinger"
          @select="selectSuggest"
        ></suggest>
      </div>
      <top-tip ref="TopTip">
        <div class="tip-title">
          <i class="icon-ok">
            <span class="text">1首歌曲已经添加到播放队列</span>
          </i>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
import SearchBox from "../../base/search-box/search-box";
import Suggest from "../../components/suggest/suggest";
import { playListMixin, searchMixin } from "../../common/js/mixin";
import Switches from "../../base/switches/switches";
import Scroll from "../../base/scroll/scroll";
import { mapGetters, mapActions } from "vuex";
import SongList from "../../base/song-list/song-list";
import Song from "../../common/js/song";
import SearchList from "../../base/search-list/search-list";
import TopTip from "../../base/top-tip/top-tip";

export default {
  mixins: [searchMixin],
  data() {
    return {
      showFlag: false,
      // 搜索出来的结果不包含歌手
      showSinger: false,
      currentIndex: 0,
      switches: [
        {
          name: "最近播放"
        },
        {
          name: "搜索历史"
        }
      ]
    };
  },
  components: {
    SearchBox,
    Suggest,
    Switches,
    Scroll,
    SongList,
    SearchList,
    TopTip
  },
  methods: {
    show() {
      this.showFlag = true;

      // 解决了一个bug
      // 默认add-song组件display是为none，这个组件已经初始化了，里面的scroll就开渲染了，导致了计算结果不对
      // 加入这一个判断，使得当显示对应组件的时候，手动的重新计算一下高度，重新渲染
      setTimeout(() => {
        if (this.currentIndex === 0) {
          this.$refs.songlists.refresh();
        } else {
          this.$refs.searchLists.refresh();
        }
      }, 20);
    },
    hide() {
      this.showFlag = false;
    },
    // 记录搜索结果
    selectSuggest() {
      this.saveSelect();
      this.showTip();
    },
    switchItem(i) {
      this.currentIndex = i;
    },
    // 点击之后往播放列表里面插入
    selectSong(song, index) {
      if (index !== 0) {
        // 直接传入song是不行的，因为我们是直接从缓存里面取的，不是song的实例
        // 具有song的属性，但不是song的实例，所以需要转化成song的实例
        this.insertSong(new Song(song));
        this.showTip();
      }
    },
    // 添加完歌曲后。上面会弹出来一个提示
    showTip() {
      this.$refs.TopTip.show();
    },
    ...mapActions(["insertSong"])
  },
  computed: {
    ...mapGetters(["playHistory"])
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '../../common/stylus/variable';
@import '../../common/stylus/mixin';

.add-song {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100%;
  z-index: 200;
  background: $color-background;

  &.slide-enter-active, &.slide-leave-active {
    transition: all 0.3s;
  }

  &.slide-enter, &.slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }

  .header {
    position: relative;
    height: 44px;
    text-align: center;

    .title {
      line-height: 44px;
      font-size: $font-size-large;
      color: $color-text;
    }

    .close {
      position: absolute;
      top: 0;
      right: 8px;

      .icon-close {
        display: block;
        padding: 12px;
        font-size: 20px;
        color: $color-theme;
      }
    }
  }

  .search-box-wrapper {
    margin: 20px;
  }

  .shortcut {
    .list-wrapper {
      position: absolute;
      top: 165px;
      bottom: 0;
      width: 100%;

      .list-scroll {
        height: 100%;
        overflow: hidden;

        .list-inner {
          padding: 20px 30px;
        }
      }
    }
  }

  .search-result {
    position: fixed;
    top: 124px;
    bottom: 0;
    width: 100%;
  }

  .tip-title {
    text-align: center;
    padding: 18px 0;
    font-size: 0;

    .icon-ok {
      font-size: $font-size-medium;
      color: $color-theme;
      margin-right: 4px;
    }

    .text {
      font-size: $font-size-medium;
      color: $color-text;
    }
  }
}
</style>

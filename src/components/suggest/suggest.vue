<template>
  <scroll :beforeScroll="beforeScroll" @beforeScroll="listScroll" @scrollToEnd="searchMore" :pullup="pullup" ref="suggest" class="suggest" :data="result">
    <ul class="suggest-list">
      <li @click="selectItem(item)" class="suggest-item" v-for="(item, i) in result" :key="i">
        <div class="icon">
          <i :class="getIconClass(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title></loading>
    </ul>
    <div class="no-result-wrapper" v-show="!hasMore && !result.length">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
import { search } from "../../api/search";
import { ERR_OK } from "../../api/config";
import {
  createSong,
  isValidMusic,
  processSongsUrl
} from "../../common/js/song";
import Scroll from "../../base/scroll/scroll";
import Loading from "../../base/loading/loading";
import Singer from "../../common/js/singer";
import { mapMutations, mapActions } from "vuex";
import NoResult from "../../base/no-result/no-result"

const TYPE_SINGER = "singer";
const perpage = 20;

export default {
  props: {
    query: {
      type: String,
      default: ""
    },
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      page: 1,
      result: [],
      // 开启下拉加载
      pullup: true,
      // 判断list有没有被加载完
      hasMore: false,
      // 开启滚动后给input添加blue事件，取消input的焦点，作用，优化了在手机上滚动的时候取消input的焦点使手机能自己收起键盘
      beforeScroll:true
    };
  },
  components: {
    Scroll,
    Loading,
    NoResult
  },
  methods: {
    refresh() {
      this.$refs.suggest.refresh()
    },
    // 做我们的搜索
    search() {
      // 当我们第一次执行search的时候，需要把scroll组件的位置重置到顶部
      this.page = 1;
      this.$refs.suggest.scrollTo(0, 0);
      this.hasMore = true;
      search(this.query, this.page, this.showSinger, perpage).then(res => {
        if (res.code === ERR_OK) {
          this._getResult(res.data).then(result => {
            this.result = result;

            // console.log(result);
            setTimeout(() => {
              // 判断数据是否请求完毕
              this._checkMore(res.data);
            }, 20);
          });
        }
      });
    },
    // 下拉加载。当滚动到底部时触发
    searchMore() {
      if (!this.hasMore) {
        return;
      }
      this.page++;
      search(this.query, this.page, this.showSinger, perpage).then(res => {
        if (res.code === ERR_OK) {
          this._getResult(res.data).then(result => {
            this.result = this.result.concat(result);
            setTimeout(() => {
              // 判断数据是否请求完毕
              this._checkMore(res.data);
            }, 20);
          });
        }
      });
    },
    // 监听scroll的滚动事件，并向外派发一个事件
    listScroll() {
      // 当列表开始滚动的时候,给搜索框设置blur属性,使之失去焦点
      this.$emit('listScroll')
    },
    selectItem(item) {
      // 点击歌手,跳转到歌手页面
      if (item.type === TYPE_SINGER) {
        const singer = new Singer({
          id: item.singermid,
          name: item.singername
        });
        this.$router.push({
          path: `/search/${singer.id}`
        });
        this.setSinger(singer)
      } else {
        // 点击歌曲,跳转到播放内核
        this.insertSong(item)
      }

      // 派发一个事件，使得外部知道，我们可以把搜索保存在历史中了
      this.$emit('select')
    },
    _checkMore(data) {
      const song = data.song;

      // 判断已经请求的数据是否大于总数据的长度
      // song.curnum每页请求多少条数据  20条
      // song.curpage  当前是第几页数据
      // perpage 一页请求多少条  20条
      // song.totalnum 一共有多少条数据
      if (
        !song.list.length ||
        song.curnum + (song.curpage - 1) * perpage >= song.totalnum
      ) {
        this.hasMore = false;
      } else {
        // BS 中判断是否可以垂直方向滚动
        // 判断是不是可以滚动了，可以滚动的话下拉再次发起请求
        if (!this.$refs.suggest.scroll.hasVerticalScroll) {
          this.searchMore();
        }
      }
    },
    // 对数据进行处理，处理成我们需要的格式
    _getResult(data) {
      let ret = [];
      // 判断搜索里面有没有歌手，有的话就把歌手数据单独拿出来
      if (data.zhida && data.zhida.singerid && this.page === 1) {
        ret.push({
          ...data.zhida,
          ...{ type: TYPE_SINGER }
        });
      }
      // processSongsUrl把付费或者vip的音乐过滤出去
      return processSongsUrl(this._normalizeSongs(data.song.list)).then(
        songs => {
          // songs 处理后的音乐列表
          ret = ret.concat(songs);
          return ret;
        }
      );
    },
    // 把数据进行实例化处理  new Song
    _normalizeSongs(list) {
      let ret = [];
      list.forEach(musicData => {
        if (isValidMusic(musicData)) {
          ret.push(createSong(musicData));
        }
      });
      return ret;
    },
    getIconClass(item) {
      if (item.type === TYPE_SINGER) {
        return "icon-mine";
      } else {
        return "icon-music";
      }
    },
    getDisplayName(item) {
      if (item.type === TYPE_SINGER) {
        return item.singername;
      } else {
        return `${item.name}-${item.singer}`;
      }
    },
    ...mapMutations({
      setSinger: "SET_SINGER"
    }),
    ...mapActions([
      'insertSong'
    ])
  },
  watch: {
    query(newQuery) {
      if (!newQuery) {
        return;
      }
      this.search(newQuery);
    }
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '../../common/stylus/variable';
@import '../../common/stylus/mixin';

.suggest {
  height: 100%;
  overflow: hidden;

  .suggest-list {
    padding: 0 30px;

    .suggest-item {
      display: flex;
      align-items: center;
      padding-bottom: 20px;
    }

    .icon {
      flex: 0 0 30px;
      width: 30px;

      [class^='icon-'] {
        font-size: 14px;
        color: $color-text-d;
      }
    }

    .name {
      flex: 1;
      font-size: $font-size-medium;
      color: $color-text-d;
      overflow: hidden;

      .text {
        no-wrap();
      }
    }
  }

  .no-result-wrapper {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>

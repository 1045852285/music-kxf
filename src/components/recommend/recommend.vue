<template>
  <div class="recommend" ref="recommend">
    <scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <div class="slider-wrapper">
          <div class="slider-content" v-if="recommends.length">
            <slider>
              <div v-for="(item,i) in recommends" :key="i">
                <a :href="item.linkUrl">
                  <img class="needsclick" @load="loadImage" :src="item.picUrl" />
                </a>
              </div>
            </slider>
          </div>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li @click="selectItem(item)" class="item" v-for="(item,i) in discList" :key="i">
              <div class="icon">
                <img width="60" height="60" v-lazy="item.imgurl" />
              </div>
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container" v-show="!discList.length">
        <load-ing></load-ing>
      </div>
    </scroll>
    <!-- 首页二级路由的容器 -->
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
import { getRecommend, getDiscList } from "../../api/recommend";
import { ERR_OK } from "../../api/config";
import Slider from "../../base/slider/slider";
import Scroll from "../../base/scroll/scroll";
import loadIng from "../../base/loading/loading";
import { playListMixin } from "../../common/js/mixin";
import { mapMutations } from "vuex";

export default {
  mixins: [playListMixin],
  data() {
    return {
      recommends: [],
      discList: []
    };
  },
  components: {
    Slider,
    Scroll,
    loadIng
  },
  created() {
    this._getRecommend();
    this._getDiscList();
  },
  methods: {
    // mixin方法
    handlePlayList(playList) {
      const bottom = playList.length > 0 ? "60px" : "";
      this.$refs.recommend.style.bottom = bottom;
      this.$refs.scroll.refresh();
    },
    _getRecommend() {
      // 轮播图数据
      getRecommend().then(res => {
        if (res.code === ERR_OK) {
          this.recommends = res.data.slider;
        }
      });
    },
    _getDiscList() {
      // 列表数据
      getDiscList().then(res => {
        if (res.code === ERR_OK) {
          this.discList = res.data.list;
        }
      });
    },
    selectItem(item) {
      this.$router.push({
        path: `/recommend/${item.dissid}`
      });
      this.setDisc(item)
    },
    // @load 是在img的src加载完毕之后才会执行的
    // recommends和discList都是异步的，所以不知道他们两个谁会先拿到请求
    // 如果discList先拿到数据，渲染到页面上之后，那么better-scroll则不会再重新计算recommends轮播图的高，导致了better-scroll的滚动
    // 会少一个轮播图高的距离
    // @load 是在img的src加载完毕之后才会执行的，等recommends轮播图的图片渲染完之后
    // 在执行这个方法，重新计算整个better-scroll的高
    loadImage() {
      // 这里加了一个if是阻止loadImage的多次渲染，避免浪费资源
      if (!this.checakLoaded) {
        this.$refs.scroll.refresh();
        this.checakLoaded = true;
      }
    },
    ...mapMutations({
      "setDisc": "SET_DISC"
    })
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '../../common/stylus/variable';

.recommend {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;

  .recommend-content {
    height: 100%;
    overflow: hidden;

    .slider-wrapper {
      position: relative;
      width: 100%;
      height: 0;
      padding-top: 40%;
      overflow: hidden;

      .slider-content {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }

    .recommend-list {
      .list-title {
        height: 65px;
        line-height: 65px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-theme;
      }

      .item {
        display: flex;
        box-sizing: border-box;
        align-items: center;
        padding: 0 20px 20px 20px;

        .icon {
          flex: 0 0 60px;
          width: 60px;
          padding-right: 20px;
        }

        .text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          line-height: 20px;
          overflow: hidden;
          font-size: $font-size-medium;

          .name {
            margin-bottom: 10px;
            color: $color-text;
          }

          .desc {
            color: $color-text-d;
          }
        }
      }
    }

    .loading-container {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>

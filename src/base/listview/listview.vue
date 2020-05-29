<template>
  <scroll
    :listenScroll="listenScroll"
    :probeType="probeType"
    @scroll="scroll"
    ref="listview"
    class="listview"
    :data="data"
  >
    <ul>
      <li v-for="(group,i) in data" :key="i" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li @click="selectItem(item)" v-for="(item,j) in group.items" :key="j" class="list-group-item">
            <img class="avatar" v-lazy="item.avatar" />
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div
      class="list-shortcut"
      @touchmove.stop.prevent="onShortcutTouchMove"
      @touchstart.stop.prevent="onShortcutTouchStart"
    >
    <!-- touchstart事件：当手指触摸屏幕时候触发，即使已经有一个手指放在屏幕上也会触发
    touchmove事件：当手指在屏幕上滑动的时候连续地触发。在这个事件发生期间，调用preventDefault()事件可以阻止滚动。
     -->
      <ul>
        <li
          v-for="(item,i) in shortcutList"
          :class="{'current':currentIndex === i}"
          :key="i"
          class="item"
          :data-index="i"
        >{{item}}</li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
import Scroll from "../scroll/scroll";
import { getData } from "../../common/js/dom";
import Loading from "../loading/loading"

// 这个18是我们定义的样式的一个高度
// 字体高度+padding值算出来的
const ANCHOR_HEIGHT = 18;
const TITLE_HEIGHT = 30;
export default {
  props: {
    data: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      scrollY: -1,
      currentIndex: 0,
      diff: -1
    };
  },
  created() {
    this.touch = {};
    this.listenScroll = true;
    this.listHeight = [];
    this.probeType = 3;
  },
  components: {
    Scroll,
    Loading
  },
  methods: {
    selectItem(item){
      // console.log(item);
      this.$emit('select', item);
    },
    scroll(pos) {
      // 接收在scroll.vue里面传出来的值
      this.scrollY = pos.y;
    },
    // 暴露给singer组件的方法，调用refresh
    refresh () {
        this.$refs.listview.refresh()
      },
    onShortcutTouchStart(e) {
      // anchorIndex 获取自定义属性data-index的值
      let anchorIndex = getData(e.target, "index");
      let firstTouch = e.touches[0];
      // console.log(firstTouch);
      // 获取鼠标点击abcd的时候在Y轴上的位置
      this.touch.y1 = firstTouch.pageY;
      // 把点击的自定义属性的值存起来
      this.touch.anchorIndex = anchorIndex;

      this._scrollTo(anchorIndex);
      
    },
    onShortcutTouchMove(e) {
      let firstTouch = e.touches[0];
      // 鼠标在屏幕上滑动时，连续的获取在Y轴上的位置
      this.touch.y2 = firstTouch.pageY;
      // 当鼠标点击之后，又开始滑动，计算出滑动结束后到鼠标点击时的位置的距离，然后除以每个li占的高
      // 计算出一共走了几个li
      let delta = ((this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT) | 0;
      // 原本点击时的位置，加上滑动时走了几个li的位置，就是现在的li的位置
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta;
      
      this._scrollTo(anchorIndex);
    },
    // 
    _scrollTo(index) {
      // console.log(this.listHeight);
      // 点击时   如果index没有值且index不等于0（可能是nan） 则return出去
      if (!index && index !== 0) {
        return;
      }
      // 滑动时  当index小于0时，使index等于0，上面和这个判断是针对于边界优化
      if (index < 0) {
        index = 0;
      } else if (index > this.listHeight.length - 2) {
        index = this.listHeight.length - 2;
      }
  
      this.scrollY = -this.listHeight[index];
      // better-scroll已经做过边界处理了
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0);
    },
    _calculateHeight() {
      this.listHeight = [];
      // 拿到歌手列表的dom结构，是一个数组
      const list = this.$refs.listGroup;
      // console.log(list);
      let height = 0;
      this.listHeight.push(height);
      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        height += item.clientHeight;
        // 动态算出每个li的高，然后加入listHeight这个数组，并在外面保存起来
        this.listHeight.push(height);
      }
    }
  },
  computed: {
    // 处理旁边的热，a，b 滚动条，使只有一个字显示
    shortcutList() {
      return this.data.map(group => {
        return group.title.substr(0, 1);
      });
    },
    // 
    fixedTitle() {
      // 判断this.scrollY的值，如果是负值，则显示固定显示热门横条，如果是正值，则返回空
      if (this.scrollY > 0) {
        return "";
      }
      // 
      return this.data[this.currentIndex]
        ? this.data[this.currentIndex].title
        : "";
    }
  },
  watch: {
    // 监听这个data的数据，如果有变化，则重新计算整个列表中每个li的高度
    data() {
      setTimeout(() => {
        this._calculateHeight();
      }, 20);
    },
    // 监听scrollY这个属性
    scrollY(newY) {
      // console.log(newY);
      const listHeight = this.listHeight;
      // 当滚动到顶部，newY大于0
      if (newY > 0) {
        this.currentIndex = 0;
        return;
      }
      // 在中间部分滚动
      // listHeight.length - 1是因为在__calculateHeight的时候我们的listHeight
      // 实际上元素的个数是大于列表元素的个数的，多一个
      for (let i = 0; i < listHeight.length - 1; i++) {
        let height1 = listHeight[i];
        let height2 = listHeight[i + 1];
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i;
          this.diff = height2 + newY;
          return;
        }
      }
      // 当滚动到底部，且-nweY大于最后一个元素的上限
      // 为什么减2，因为listHeight的总个数是比dom列表的个数多一个，所以跑的最后一个应该减2
      // 减1是数组比列表多一个元素，减2是大于最后一个元素的上限时，在多减1，保证currentIndex在列表的值的范围内
      this.currentIndex = listHeight.length - 2;
      // console.log(this.currentIndex);
      
    },
    // 监听diff这个属性
    diff(newVal) {
      
      let fixedTop =(newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0;
        
      if (this.fixedTop === fixedTop) {
        return
      }
      this.fixedTop = fixedTop;
      this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
    }
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '../../common/stylus/variable';

.listview {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $color-background;

  .list-group {
    padding-bottom: 30px;

    .list-group-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }

    .list-group-item {
      display: flex;
      align-items: center;
      padding: 20px 0 0 30px;

      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }

      .name {
        margin-left: 20px;
        color: $color-text-l;
        font-size: $font-size-medium;
      }
    }
  }

  .list-shortcut {
    position: absolute;
    z-index: 30;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    padding: 20px 0;
    border-radius: 10px;
    text-align: center;
    background: $color-background-d;
    font-family: Helvetica;

    .item {
      padding: 3px;
      line-height: 1;
      color: $color-text-l;
      font-size: $font-size-small;

      &.current {
        color: $color-theme;
      }
    }
  }

  .list-fixed {
    position: absolute;
    top: -1px;
    left: 0;
    width: 100%;

    .fixed-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }
  }

  .loading-container {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>

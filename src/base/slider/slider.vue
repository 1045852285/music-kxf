<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot></slot>
    </div>
    <div class="dots">
      <span class="dota" v-for="(item,i) in dots" :key="i" :class="{active:currentPageIndex===i}"></span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import BScroll from "better-scroll";
import { addClass } from "../../common/js/dom";
export default {
  data() {
    return {
      dots: [],
      currentPageIndex: 0
    };
  },
  props: {
    // 循环轮播
    loop: {
      type: Boolean,
      default: true
    },
    // 自动轮播
    autoPlay: {
      type: Boolean,
      default: true
    },
    // 轮播间隔
    interval: {
      type: Number,
      default: 4000
    }
  },
  mounted() {
    setTimeout(() => {
      this._setSliderWidth();
      this._initDots();
      this._initSlider();

      if (this.autoPlay) {
        this._play();
      }
    // 浏览器默认是17毫秒刷新一次，所以这个20毫秒的延迟是合理的
    }, 20);

    // 当页面发生窗口大小变化时触发
    window.addEventListener("resize", () => {
        // better-scroll或者better-scroll还没有启动时，return出去
      if (!this.slider || !this.slider.enabled) {
        return;
      }
    // 先清除定时器
      clearTimeout(this.resizeTimer);
    // 设置定时器，60毫秒执行一次
      this.resizeTimer = setTimeout(() => {
        // isInTransition 判断当前 scroll 是否处于滚动动画过程中。
        if (this.slider.isInTransition) {
          this._onScrollEnd();
        } else {
          if (this.autoPlay) {
            this._play();
          }
        }
        // 调用refresh函数
        this.refresh();
      }, 60);
    });
  },
  // 在vue对象存活的情况下，进入当前存在activated()函数的页面时，一进入页面就触发；可用于初始化页面数据等
  activated() {
    // 当组件激活时，启动better-scroll
    this.slider.enable();
    // 获取横轴方向偏移的页面数
    let pageIndex = this.slider.getCurrentPage().pageX;
    // 当我们做 slide 组件的时候，slide 通常会分成多个页面。调用此（goToPage）方法可以滚动到指定的页面
    this.slider.goToPage(pageIndex, 0, 0);
    // 把获取的页面数赋值给currentPageIndex
    this.currentPageIndex = pageIndex;
    if (this.autoPlay) {
      this._play();
    }
  },
  // 退出时触发deactivated
  deactivated() {
    // 禁用 better-scroll，DOM 事件（如 touchstart、touchmove、touchend）的回调函数不再响应
    this.slider.disable();
    // 清除定时器
    clearTimeout(this.timer);
  },
//   组件销毁时调用
  beforeDestroy() {
    // 禁用 better-scroll，DOM 事件（如 touchstart、touchmove、touchend）的回调函数不再响应
    this.slider.disable();
    // 清除定时器
    clearTimeout(this.timer);
  },
  methods: {
    refresh() {
      if (this.slider) {
        this._setSliderWidth(true);
        // 触发时机：refresh 方法调用完成后
        // 重新计算 better-scroll，当 DOM 结构发生变化的时候务必要调用确保滚动的效果正常
        this.slider.refresh();
      }
    },
    _setSliderWidth(isResize) {
      this.children = this.$refs.sliderGroup.children;

      let width = 0;
      let sliderWidth = this.$refs.slider.clientWidth;
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i];
        addClass(child, "slider-item");

        child.style.width = sliderWidth + "px";
        width += sliderWidth;
        // console.log(child);
      }
      // better-scroll当loop为true的时候，实际上会左右各克隆一个dom，保证循环的切换，所以宽度需要加两倍的sliderWidth
      if (this.loop && !isResize) {
        width += 2 * sliderWidth;
      }
      this.$refs.sliderGroup.style.width = width + "px";
    },
    _initDots() {
      this.dots = new Array(this.children.length);
    },
    _initSlider() {
      this.slider = new BScroll(this.$refs.slider, {
        // 横向滚动
        scrollX: true,
        // 纵向滚动
        scrollY: false,
        // 惯性
        momentum: false,
        // 循环
        snap: {
          loop: this.loop,
          threshold: 0.3,
          speed: 400
        }
      });
    // 监听better-scroll滚动事件
      this.slider.on("scrollEnd", this._onScrollEnd);
    // touchend事件：当手指从屏幕上离开的时候触发。
      this.slider.on("touchend", () => {
        if (this.autoPlay) {
          this._play();
        }
      });
    // 监听beforeScrollStart 触发时机：滚动开始之前
      this.slider.on("beforeScrollStart", () => {
        if (this.autoPlay) {
          clearTimeout(this.timer);
        }
      });
    },
    _onScrollEnd() {
      let pageIndex = this.slider.getCurrentPage().pageX;
      this.currentPageIndex = pageIndex;

      if (this.autoPlay) {
        this._play();
      }
    },
    _play() {
      // let pageIndex = this.currenPagIndex + 1;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        // this.slider.goToPage(pageIndex,0,400);
        this.slider.next();
      }, this.interval);
    }
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '../../common/stylus/variable';

.slider {
  min-height: 1px;

  .slider-group {
    position: relative;
    overflow: hidden;
    white-space: nowrap;

    .slider-item {
      float: left;
      box-sizing: border-box;
      overflow: hidden;
      text-align: center;

      a {
        display: block;
        width: 100%;
        overflow: hidden;
        text-decoration: none;
      }

      img {
        display: block;
        width: 100%;
      }
    }
  }

  .dots {
    position: absolute;
    right: 0;
    left: 0;
    bottom: 12px;
    transform: translateZ(1px);
    text-align: center;
    font-size: 0;

    .dota {
      display: inline-block;
      margin: 0 4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: $color-text-l;

      &.active {
        width: 20px;
        border-radius: 5px;
        background: $color-text-ll;
      }
    }
  }
}
</style>

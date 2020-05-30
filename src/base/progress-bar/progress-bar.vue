<template>
  <div class="progress-bar" @click="progressClick" ref="progressBar">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div
        class="progress-btn-wrapper"
        ref="progressBtn"
        @touchstart.prevent="progressTouchStart"
        @touchmove.prevent="progressTouchMove"
        @touchend="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { prefixStyle } from "../../common/js/dom";

// 小球的宽度
const progressBtnWidth = 16;
const transform = prefixStyle("transform");

export default {
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  created() {
    this.touch = {};
  },
  methods: {
    // 手指点击
    progressTouchStart(e) {
      this.touch.initiated = true;
      // 横向坐标
      this.touch.startX = e.touches[0].pageX;
      // 当前按钮所在偏移位置(已经滚动的进度条的宽度)
      this.touch.left = this.$refs.progress.clientWidth;
    },
    // 手指拖动
    progressTouchMove(e) {
      if (!this.touch.initiated) {
        return;
      }
      const deltaX = e.touches[0].pageX - this.touch.startX;
      const offsetWidth = Math.min(
        this.$refs.progressBar.clientWidth - progressBtnWidth,
        Math.max(0, this.touch.left + deltaX)
      );
      this._offset(offsetWidth);
      this.$emit('percentChanging', this._getPercent())
    },
    // 手指离开
    progressTouchEnd() {
      this.touch.initiated = false
      // 往父组件派发事件
      this._triggerPercent()
    },
    _triggerPercent(){
      this.$emit("percentChange",this._getPercent())
    },
    // 进度条点击跳转
    progressClick(e){
      // getBoundingClientRect用于获取某个元素相对于视窗的位置集合
      const rect = this.$refs.progressBar.getBoundingClientRect()
      const offsetWidth = e.pageX - rect.left
      // 这里当我们点击 progressBtn的时候，e.offsetX获取不对
      // this._offset(e.offsetX)
      this._offset(offsetWidth)
      this._triggerPercent()
    },
    _getPercent(){
      // 进度条总长度
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      // 进度条已经拖动结束之后的长度 / 总长度
      return this.$refs.progress.clientWidth / barWidth
    },
    _offset(offsetWidth) {
      this.$refs.progress.style.width = `${offsetWidth}px`;
      this.$refs.progressBtn.style[
        transform
      ] = `translate3d(${offsetWidth}px,0,0)`;
    },
    setProgressOffset (percent) {
        if (percent >= 0 && !this.touch.initiated) {
          const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
          const offsetWidth = percent * barWidth
          this._offset(offsetWidth)
        }
      },
  },
  watch: {
    percent(newPercent) {
      if (newPercent >= 0 && !this.touch.initiated) {
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
        const offsetWidth = newPercent * barWidth;
        this._offset(offsetWidth);
      }
    }
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '../../common/stylus/variable';

.progress-bar {
  height: 30px;

  .bar-inner {
    position: relative;
    top: 13px;
    height: 4px;
    background: rgba(0, 0, 0, 0.3);

    .progress {
      position: absolute;
      height: 100%;
      background: $color-theme;
    }

    .progress-btn-wrapper {
      position: absolute;
      left: -8px;
      top: -13px;
      width: 30px;
      height: 30px;

      .progress-btn {
        position: relative;
        top: 7px;
        left: 7px;
        box-sizing: border-box;
        width: 16px;
        height: 16px;
        border: 3px solid $color-text;
        border-radius: 50%;
        background: $color-theme;
      }
    }
  }
}
</style>

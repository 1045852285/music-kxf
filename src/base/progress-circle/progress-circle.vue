<template>
  <!-- 内层圆 -->
  <div class="progress-circle">
    <!-- viewBox和半径是相对的   width height 是真正显示在屏幕上的，可以从外部传入，控制svg大小，组件通用性更强-->
    <svg
      :width="radius"
      :height="radius"
      viewBox="0 0 100 100"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- 外层圆 -->
      <!-- r半径 cx圆心坐标 直径100 -->
      <!-- stroke-dasharray描边。描边距离
      stroke-dashoffset 描边偏移
      -->
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent" />
      <circle
        class="progress-bar"
        r="50"
        cx="50"
        cy="50"
        fill="transparent"
        :stroke-dasharray="dashArray"
        :stroke-dashoffset="dsahOffset"
      />
    </svg>
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  props: {
    radius: {
      type: Number,
      default: 100
    },
    percent: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      // 计算出圆的周长 50半径  乘以2 就是100
      dashArray: Math.PI * 100
    };
  },
  computed: {
    dsahOffset() {
      return (1 - this.percent) * this.dashArray;
    }
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '../../common/stylus/variable';

.progress-circle {
  position: relative;

  circle {
    stroke-width: 8px;
    transform-origin: center;

    &.progress-background {
      transform: scale(0.9);
      stroke: $color-theme-d;
    }

    &.progress-bar {
      transform: scale(0.9) rotate(-90deg);
      stroke: $color-theme;
    }
  }
}
</style>
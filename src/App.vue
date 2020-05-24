<template>
  <div id="app">
    <m-header></m-header>
    <Tab></Tab>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
import MHeader from "./components/m-header/m-header";
import Tab from "./components/tab/tab";
export default {
  name: "App",
  components: {
    MHeader,
    Tab
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
#app {
  // 具体作用见
  // 为容器设置css属性touch-action，去除滑动时默认现象产生，但不影响事件触发
  // https://blog.csdn.net/lijingshan34/article/details/88350456
  // 应用 CSS 属性 touch-action: none; 这样任何触摸事件都不会产生默认行为，但是 touch 事件照样触发。
  touch-action: none;
}
</style>


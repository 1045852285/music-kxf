<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>
<script>
import BScroll from "better-scroll";

export default {
  props: {
    probeType: {
      type: Number,
      default: 1
    },
    click: {
      type: Boolean,
      default: true
    },
    data: {
      type: Array,
      default: null
    },
    listenScroll: {
      type: Boolean,
      default: false
    },
    pullup: {
      type: Boolean,
      default: false
    },
    beforeScroll: {
      type: Boolean,
      default: false
    },
    refreshDelay: {
      type: Number,
      default: 20
    }
  },
  mounted() {
    setTimeout(() => {
      this._initScroll();
    }, 20);
  },
  methods: {
    _initScroll() {
      if (!this.$refs.wrapper) {
        return;
      }
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: this.click
      });

      if (this.listenScroll) {
        let em = this;
        this.scroll.on("scroll", pos => {
          em.$emit("scroll", pos);
        });
      }

      if (this.pullup) {
        this.scroll.on('scrollEnd', ()=>{
          // scroll 最大纵向滚动位置。maxScrollY
          // console.log(this.scroll.y);
          // console.log(this.scroll.maxScrollY + 50);
            
          if (this.scroll.y <= this.scroll.maxScrollY + 50) {
            this.$emit('scrollToEnd')
          }
        })
      }

      if (this.beforeScroll) {
        this.scroll.on('beforeScrollStart', ()=>{
          this.$emit('beforeScroll')
        })
      }
    },
    enable() {
      this.scroll && this.scroll.enable();
    },
    disable() {
      this.scroll && this.scroll.disable();
    },
    refresh() {
      this.scroll && this.scroll.refresh();
    },
    scrollTo() {
      this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments);
    },
    scrollToElement() {
      // scrollToElement滚动到指定的目标元素
      this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments);
    }
  },
  watch: {
    data() {
      setTimeout(() => {
        this.refresh();
        // 这里做成一个变量是因为
        // 我们添加的歌曲的时候有个动画过渡100ms
        // 而这里渲染只是延迟20ms
        // 当这里监听到data的变化去重新计算scroll滚动高度，延迟20ms计算完了，页面上
        // 的动画还没执行完，等页面上动画执行完之后，这里早就已经把scroll的高度渲染完了
        // 所以滚动会有问题，最后一首歌曲，滚动不上来
        // 确保高度已经固定了，再去重新计算
      }, this.refreshDelay);
    }
  }
};
</script>
<style lang="stylus" scoped rel="stylesheet/stylus"></style>
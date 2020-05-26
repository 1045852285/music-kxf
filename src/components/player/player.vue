<template>
  <div class="player" v-show="playList.length>0">
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image" />
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle">
          <div class="middle-l">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd">
                <img class="image" :class="cdCls" :src="currentSong.image" />
              </div>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar @percentChange="onPercentChange" :percent="percent"></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i @click="togglePlay" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <div class="imgWrapper">
            <img :class="cdCls" width="40" height="40" :src="currentSong.image" />
          </div>
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <Progress-circle :radius="redius" :percent="percent">
            <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
          </Progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <!-- 播放功能  timeupdate执行时触发  canplay歌曲加载完毕执行 error发生错误时执行 ended歌曲播放完毕后触发-->
    <audio
      ref="audio"
      :src="currentSong.url"
      @timeupdate="updateTime"
      @canplay="ready"
      @error="err"
      @ended="end"
    ></audio>
  </div>
</template>


<script type="text/ecmascript-6">
import { mapGetters, mapMutations } from "vuex";
import animations from "create-keyframe-animation";
import { prefixStyle } from "../../common/js/dom";
import ProgressBar from "../../base/progress-bar/progress-bar";
import ProgressCircle from "../../base/progress-circle/progress-circle";
import { playMode } from "../../common/js/config";
import { shuffle } from "../../common/js/util";

const transform = prefixStyle["transform"];

export default {
  data() {
    return {
      songReady: false,
      currentTime: 0,
      redius: 32
    };
  },
  components: {
    ProgressBar,
    ProgressCircle
  },
  methods: {
    back() {
      this.setFullScreen(false);
    },
    open() {
      this.setFullScreen(true);
    },
    ...mapMutations({
      // 播放器展开和收起状态
      setFullScreen: "SET_FULL_SCREEN",
      // 播放暂停状态
      setPlayingState: "SET_PLAYING_STATE",
      //  // 当前播放歌曲下标
      setCurrentIndex: "SET_CURRENT_INDEX",
      // 播放顺序（顺序，随机播放）
      setPlayMode: "SET_PLAY_MODE",
      // 歌曲列表，是有序列表
      setPlayList: "SET_PLAYLIST"
    }),
    // 动画开始
    enter(el, done) {
     
      const { x, y, scale } = this._getPosAndScale();

      let animation = {
        0: {
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0,0,0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0,0,0) scale(1)`
        }
      };
      // 调用的create-keyframe-animation库
      animations.registerAnimation({
        // 名字
        name: "move",
        // 动画
        animation,
        // 设置动画间隔  400毫秒
        presets: 400,
        // 缓动 linear线性的
        easing: "linear"
      });

      // 运动animations 动画执行完以后就会调用done函数
      animations.runAnimation(this.$refs.cdWrapper, "move", done);
    },
    afterEnter() {
     
      // done函数执行以后，就会跳到afterEnter
      animations.unregisterAnimation("move");
      // 清空animation
      this.$refs.cdWrapper.style.animation = "";
    },
    leave(el, done) {
    
      this.$refs.cdWrapper.style.transition = `all 0.4s`;
      // 获取目标位置
      const { x, y, scale } = this._getPosAndScale();

      this.$refs.cdWrapper.style[
        transform
      ] = `translate3d(${x}px,${y}px,0) scale(${scale})`;
      
      const timer = setTimeout(done, 400)
      // 监听transitionend事件，当这个事件执行完之后就会调用done函数
      this.$refs.cdWrapper.addEventListener('transitionend', () => {
          clearTimeout(timer)
          done()
        })
    },
    afterLeave() {
      console.log("afterLeave");
      // 清空transition和transform
      this.$refs.cdWrapper.style.transition = "";
      this.$refs.cdWrapper.style[transform] = "";
    },
    _getPosAndScale() {
      // （小）下图标的宽度
      const targetWidth = 40;
      // 离左边40像素
      const paddingLeft = 40;
      // 底部30像素
      const paddingBottom = 30;
      // 大图片距离头部80像素
      const paddingTop = 80;
      // 大图片的宽是屏幕的80%
      const width = window.innerHeight * 0.8;
      // 一开始起始是多小,刚开始的缩放比例
      const scale = targetWidth / width;
      // 初始x坐标
      const x = -(window.innerWidth / 2 - paddingLeft);
      // 初始y坐标
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom;

      return {
        x,
        y,
        scale
      };
    },
    // 动画结束

    // 大图标 点击音乐暂停开始
    togglePlay() {
      // 在vuex里面改一下值  取反
      this.setPlayingState(!this.playing);
    },
    togglePlaying() {
      // 小图标 在vuex里面改一下值  取反
      this.setPlayingState(!this.playing);
    },
    // 下一首
    next() {
      // 解决连续快速点击发生的错误
      if (!this.songReady) {
        return;
      }
      let index = this.currentIndex + 1;
      if (index === this.playList.length) {
        index = 0;
      }
      this.setCurrentIndex(index);
      if (!this.playing) {
        this.togglePlaying();
      }
      this.songReady = false;
    },
    // 上一首
    prev() {
      // 解决连续快速点击发生的错误
      if (!this.songReady) {
        return;
      }
      let index = this.currentIndex - 1;
      if (index === -1) {
        index = this.playList.length - 1;
      }
      this.setCurrentIndex(index);
      if (!this.playing) {
        this.togglePlaying();
      }
      this.songReady = false;
    },
    // 歌曲播放完毕后触发
    end(){
      // loop单曲循环
      if (this.mode === playMode.loop) {
        this.loop();
      }else{
        this.next();
      }
    },
    // 实现循环播放
    loop(){
      this.$refs.audio.currentTime = 0;
      this.$refs.audio.play();
    },
    // audio 歌曲加载完毕执行
    ready() {
      this.songReady = true;
    },
    // audio 歌曲发生错误执行
    err() {
      // 如果网络发生错误，ready就不会被执行，prev和next都不能用了，功能会有问题，所以在这加一层保险
      this.songReady = true;
    },
    // 音频执行时触发
    updateTime(e) {
      // e.target.currentTime; 当前播放的时间，currentTime是一个可读写的属性
      this.currentTime = e.target.currentTime;
      // console.log(e.target);
    },
    // 歌曲计时函数
    format(interval) {
      // 向下取整 |0
      interval = interval | 0;
      const miute = (interval / 60) | 0;
      const second = this._pad(interval % 60);
      return `${miute}:${second}`;
    },
    // 歌曲计时函数补0函数
    _pad(num, n = 2) {
      let len = num.toString().length;
      while (len < n) {
        num = "0" + num;
        len++;
      }
      return num;
    },
    // 子组件progress-bar传递过来的数据
    onPercentChange(percent) {
      this.$refs.audio.currentTime = this.currentSong.duration * percent;
      if (!this.playing) {
        this.togglePlaying();
      }
    },
    // 切换播放状态
    changeMode() {
      // 很简单,1除以3的商是0,余数自然是1.那么2除以3的商也是0,
      // 余数是2也就是说,一个数除以另一个数,要是比另一个数小的话,余数就是它自己.
      const mode = (this.mode + 1) % 3;
      this.setPlayMode(mode);
      let list = null;
      console.log(this.currentSong.id);
      
      if (mode === playMode.random) {
        console.log(123);
        
        list = shuffle(this.sequenceList);
      } else {
        console.log(456);
        
        list = this.sequenceList;
      }
      this.resetCurrentIndex(list)
      this.setPlayList(list)
    },
    // 数组被打乱之后，还能确保下标是正在播放的这首歌
    resetCurrentIndex(list){
      console.log(list);
      console.log(this.playList)
      // 在打乱的数组里面找到正在播放的这首歌的下标，然后传入vuex里面
      let index = list.findIndex((item)=>{
        return item.id === this.currentSong.id;
      })
      console.log(index);
      console.log(this.currentSong);
      console.log(this.currentIndex);
      
      this.setCurrentIndex(index);
    }
  },
  computed: {
    // 播放开始暂停大图标改变
    playIcon() {
      return this.playing ? "icon-pause" : "icon-play";
    },
    // 播放开始暂停小图标改变
    miniIcon() {
      return this.playing ? "icon-pause-mini" : "icon-play-mini";
    },
    // 大image图转动效果
    cdCls() {
      return this.playing ? "play" : "pause";
    },
    // 当按钮不能点击时，添加样式
    disableCls() {
      return this.songReady ? "" : "disable";
    },
    // 传到progress-bar的百分比
    percent() {
      return this.currentTime / this.currentSong.duration;
    },
    // 播放模式切换
    iconMode() {
      return this.mode === playMode.sequence
        ? "icon-sequence"
        : this.mode === playMode.loop
        ? "icon-loop"
        : "icon-random";
    },
    ...mapGetters([
      "fullScreen",
      "playList",
      "currentSong",
      "playing",
      "currentIndex",
      "mode",
      "sequenceList"
    ])
  },
  watch: {
    // 当currentSong变化时调用
    currentSong(newSong,oldSong) {
      // 如果不加这个判断，list数组一被打乱，根据下标重新计算currentSong
      // 这个监听就会被执行，导致了暂停状态的时候也会播放歌曲
      if (newSong.id === oldSong.id) {
        return
      }
      this.$nextTick(() => {
        this.$refs.audio.play();
      });
    },
    // 监听playing的状态
    playing(newPlaying) {
      const audio = this.$refs.audio;
      this.$nextTick(() => {
        // play开始    pause暂停
        newPlaying ? audio.play() : audio.pause();
      });
    }
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '../../common/stylus/variable';
@import '../../common/stylus/mixin';

.player {
  .normal-player {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 150;
    background: $color-background;

    .background {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);
    }

    .top {
      position: relative;
      margin-bottom: 25px;

      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;

        .icon-back {
          display: block;
          padding: 9px;
          font-size: $font-size-large-x;
          color: $color-theme;
          transform: rotate(-90deg);
        }
      }

      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        no-wrap();
        font-size: $font-size-large;
        color: $color-text;
      }

      .subtitle {
        line-height: 20px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-text;
      }
    }

    .middle {
      position: fixed;
      width: 100%;
      top: 80px;
      bottom: 170px;
      white-space: nowrap;
      font-size: 0;

      .middle-l {
        display: inline-block;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;

        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          box-sizing: border-box;
          height: 100%;

          .cd {
            width: 100%;
            height: 100%;
            border-radius: 50%;

            .image {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border-radius: 50%;
              border: 10px solid rgba(255, 255, 255, 0.1);
            }

            .play {
              animation: rotate 20s linear infinite;
            }
          }
        }

        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          overflow: hidden;
          text-align: center;

          .playing-lyric {
            height: 20px;
            line-height: 20px;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
        }
      }

      .middle-r {
        display: inline-block;
        vertical-align: top;
        width: 100%;
        height: 100%;
        overflow: hidden;

        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;

          .text {
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;

            &.current {
              color: $color-text;
            }
          }

          .pure-music {
            padding-top: 50%;
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
          }
        }
      }
    }

    .bottom {
      position: absolute;
      bottom: 50px;
      width: 100%;

      .dot-wrapper {
        text-align: center;
        font-size: 0;

        .dot {
          display: inline-block;
          vertical-align: middle;
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

      .progress-wrapper {
        display: flex;
        align-items: center;
        width: 80%;
        margin: 0px auto;
        padding: 10px 0;

        .time {
          color: $color-text;
          font-size: $font-size-small;
          flex: 0 0 30px;
          line-height: 30px;
          width: 30px;

          &.time-l {
            text-align: left;
          }

          &.time-r {
            text-align: right;
          }
        }

        .progress-bar-wrapper {
          flex: 1;
        }
      }

      .operators {
        display: flex;
        align-items: center;

        .icon {
          flex: 1;
          color: $color-theme;

          &.disable {
            color: $color-theme-d;
          }

          i {
            font-size: 30px;
          }
        }

        .i-left {
          text-align: right;
        }

        .i-center {
          padding: 0 20px;
          text-align: center;

          i {
            font-size: 40px;
          }
        }

        .i-right {
          text-align: left;
        }

        .icon-favorite {
          color: $color-sub-theme;
        }
      }
    }

    &.normal-enter-active, &.normal-leave-active {
      transition: all 0.4s;

      .top, .bottom {
        transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
      }
    }

    &.normal-enter, &.normal-leave-to {
      opacity: 0;

      .top {
        transform: translate3d(0, -100px, 0);
      }

      .bottom {
        transform: translate3d(0, 100px, 0);
      }
    }
  }

  .mini-player {
    display: flex;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 180;
    width: 100%;
    height: 60px;
    background: $color-highlight-background;

    &.mini-enter-active, &.mini-leave-active {
      transition: all 0.4s;
    }

    &.mini-enter, &.mini-leave-to {
      opacity: 0;
    }

    .icon {
      flex: 0 0 40px;
      width: 40px;
      height: 40px;
      padding: 0 10px 0 20px;

      .imgWrapper {
        height: 100%;
        width: 100%;

        img {
          border-radius: 50%;

          &.play {
            animation: rotate 10s linear infinite;
          }

          &.pause {
            animation-play-state: paused;
          }
        }
      }
    }

    .text {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      line-height: 20px;
      overflow: hidden;

      .name {
        margin-bottom: 2px;
        no-wrap();
        font-size: $font-size-medium;
        color: $color-text;
      }

      .desc {
        no-wrap();
        font-size: $font-size-small;
        color: $color-text-d;
      }
    }

    .control {
      flex: 0 0 30px;
      width: 30px;
      padding: 0 10px;

      .icon-play-mini, .icon-pause-mini, .icon-playlist {
        font-size: 30px;
        color: $color-theme-d;
      }

      .icon-mini {
        font-size: 32px;
        position: absolute;
        left: 0;
        top: 0;
      }
    }
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>

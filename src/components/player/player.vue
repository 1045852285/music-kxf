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
        <div
          class="middle"
          @touchstart.prevent="middleTouchStart"
          @touchmove.prevent="middleTouchMove"
          @touchend="middleTouchEnd"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" ref="imageWrapper">
                <img ref="image" class="image" :class="cdCls" :src="currentSong.image" />
              </div>
            </div>
            <!-- 主页显示歌词的地方 -->
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <!-- currentLyri默认为null  加&& 是为了当currentLyric不为空的时候把currentLyric.lines传进去 -->
          <Scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p
                  ref="lyricLine"
                  class="text"
                  v-for="(line, index) in currentLyric.lines"
                  :key="index"
                  :class="{'current':currentLineNum === index}"
                >{{line.txt}}</p>
              </div>
            </div>
          </Scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow === 'cd'}"></span>
            <span class="dot" :class="{'active':currentShow === 'lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar @percentChange="onPercentChange" @percentChanging="onProgressBarChanging" :percent="percent"></progress-bar>
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
              <i class="needsclick" @click="togglePlaying" :class="playIcon"></i>
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
          <div class="imgWrapper" ref="miniWrapper">
            <img ref="miniImage" :class="cdCls" width="40" height="40" :src="currentSong.image" />
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
import Scroll from "../../base/scroll/scroll";
// 歌词自动滚动插件
import Lyric from "lyric-parser";

const transform = prefixStyle("transform");
const transitionDuration = prefixStyle("transitionDuration");

export default {
  data() {
    return {
      songReady: false,
      currentTime: 0,
      redius: 32,
      currentLyric: null,
      // 当前这个歌词所在的行，初始化是0
      currentLineNum: 0,
      // 默认选中第一个小点
      currentShow: "cd",
      // 歌曲播放显示一行歌词
      playingLyric: ""
    };
  },
  created() {
    this.touch = {};
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll
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
      // 歌曲列表，是无序列表
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

      const timer = setTimeout(done, 400);
      // 监听transitionend事件，当这个事件执行完之后就会调用done函数
      this.$refs.cdWrapper.addEventListener("transitionend", () => {
        clearTimeout(timer);
        done();
      });
    },
    afterLeave() {
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
    togglePlaying() {
      if (!this.songReady) {
        return;
      }
      // 小图标 在vuex里面改一下值  取反
      this.setPlayingState(!this.playing);
      if (this.currentLyric) {
        this.currentLyric.togglePlay();
      }
    },
    // 下一首
    next() {
      // 解决连续快速点击发生的错误
      if (!this.songReady) {
        return;
      }
      // 这个if处理边界条件，如果列表里面只有一首歌的情况下点击下一首index就会+1，
      // index === this.playList.length 使得index = 0
      // 传入vuex中setCurrentIndex就会为0，使得currentSong的id就不会有变化
      // 那么在watch里面的函数都不会被执行
      if (this.playList.length === 1) {
        this.loop();
      } else {
        let index = this.currentIndex + 1;
        if (index === this.playList.length) {
          index = 0;
        }
        this.setCurrentIndex(index);
        if (!this.playing) {
          this.togglePlaying();
        }
      }
      this.songReady = false;
    },
    // 上一首
    prev() {
      // 解决连续快速点击发生的错误
      if (!this.songReady) {
        return;
      }
      if (this.playList.length === 1) {
        this.loop();
      } else {
        let index = this.currentIndex - 1;
        if (index === -1) {
          index = this.playList.length - 1;
        }
        this.setCurrentIndex(index);
        if (!this.playing) {
          this.togglePlaying();
        }
      }
      this.songReady = false;
    },
    // 歌曲播放完毕后触发
    end() {
      // loop单曲循环
      if (this.mode === playMode.loop) {
        this.loop();
      } else {
        this.next();
      }
    },
    // 实现循环播放
    loop() {
      this.$refs.audio.currentTime = 0;
      this.$refs.audio.play();
      if (this.currentLyric) {
        // seek偏移到歌曲的一开始
        this.currentLyric.seek(0);
      }
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
      const currentTime = this.currentSong.duration * percent;
      this.$refs.audio.currentTime = currentTime;
      if (!this.playing) {
        this.togglePlaying();
      }
      // 拿到进度条传过来的时间百分比，然后改变歌曲歌词播放高亮显示的地方
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000);
      }
    },
    // 切换播放状态
    changeMode() {
      // 很简单,1除以3的商是0,余数自然是1.那么2除以3的商也是0,
      // 余数是2也就是说,一个数除以另一个数,要是比另一个数小的话,余数就是它自己.
      const mode = (this.mode + 1) % 3;
      this.setPlayMode(mode);
      let list = null;

      if (mode === playMode.random) {
        list = shuffle(this.sequenceList);
      } else {
        list = this.sequenceList;
      }
      this.resetCurrentIndex(list);
      this.setPlayList(list);
    },
    onProgressBarChanging (percent) {
        this.currentTime = this.currentSong.duration * percent
        if (this.currentLyric) {
          this.currentLyric.seek(this.currentTime * 1000)
        }
      },
    // 数组被打乱之后，还能确保下标是正在播放的这首歌
    resetCurrentIndex(list) {
      // 在打乱的数组里面找到正在播放的这首歌的下标，然后传入vuex里面
      let index = list.findIndex(item => {
        return item.id === this.currentSong.id;
      });
      this.setCurrentIndex(index);
    },
    //
    getLyric() {
      // currentLyric实现随着歌曲的播放，播放到响应的位置，是内部使用了一个计算器
      // currentLyric每次currentSong改变的时候，我们都会去重新new一个新的Lyricpase出来的对象，但是我们并没有做一个之前的清理操作，也就是之前的Lyricpase还会有一个计算器存在
      // 详见视频7-24   1分零5秒处，所以会造成歌词来回闪动的bug，所以在切currentSong之前，重新去this.getLyric之前，我们要把当前的currentLyric给stop掉
      this.currentSong
        .getLyric()
        .then(lyric => {
          // this.handleLyric这个回调函数就是当我们歌词每一行发生改变的时候就去回调一下
          this.currentLyric = new Lyric(lyric, this.handleLyric);
          // 当歌曲正在播放的时候我们歌曲也会播放
          if (this.playing) {
            this.currentLyric.play();
          }
          // console.log(this.currentLyric.lines);
          // 获取不到歌词的时候做一些清理操作
        })
        .catch(() => {
          this.currentLyric = null;
          this.playingLyric = "";
          this.currentLineNum = 0;
        });
    },
    // this.handleLyric这个回调函数就是当我们歌词每一行发生改变的时候就去回调一下
    handleLyric({ lineNum, txt }) {
      // lineNum 当前正在播放的歌词的行数
      this.currentLineNum = lineNum;

      if (lineNum > 5) {
        // 当前滚动如果大于5行的话，我们需要滚动lineNum-5的这个位置
        let lineEl = this.$refs.lyricLine[lineNum - 5];

        // 调用scroll组里的方法
        this.$refs.lyricList.scrollToElement(lineEl, 1000);
      } else {
        this.$refs.lyricList.scrollToElement(0, 0, 1000);
      }
      // 展示当前播放的歌词
      this.playingLyric = txt;
    },
    /**
     * 计算内层Image的transform，并同步到外层容器
     * @param wrapper
     * @param inner
     */
    syncWrapperTransform(wrapper, inner) {
      if (!this.$refs[wrapper]) {
        return;
      }
      let imageWrapper = this.$refs[wrapper];
      let image = this.$refs[inner];

      // 保存image的位置，赋值给image外面的div来记录位置
      let wTransform = getComputedStyle(imageWrapper)[transform];
      let iTransform = getComputedStyle(image)[transform];
      // console.log(iTransform);

      imageWrapper.style[transform] =
        wTransform === "none" ? iTransform : iTransform.concat(" ", wTransform);
    },
    // 鼠标点击时执行
    middleTouchStart(e) {
      this.touch.initiated = true;
      const touch = e.touches[0];
      this.touch.startX = touch.pageX;
      this.touch.startY = touch.pageY;
    },
    // 鼠标点击住移动时执行
    middleTouchMove(e) {
      if (!this.touch.initiated) {
        return;
      }
      const touch = e.touches[0];
      // 为什么我们这里维护一个横轴坐标还是需要去维护一个纵轴坐标
      // 因为滚动歌词的列表是用scroll去滚动的，是一个上下滚动的过程
      // 如果说纵轴的偏移大于横轴的偏移的话，我们就不应该左右移动
      const deltaX = touch.pageX - this.touch.startX;
      const deltaY = touch.pageY - this.touch.startY;
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return;
      }
      const left = this.currentShow === "cd" ? 0 : -window.innerWidth;
      // max() 方法可返回两个指定的数中带有较大的值的那个数。
      // min() 方法可返回两个指定的数中带有较小的值的那个数。
      // 左滑deltaX是一个负数，右滑是正向
      const offfsetWidth = Math.min(
        0,
        Math.max(-window.innerWidth, left + deltaX)
      );
      this.touch.percent = Math.abs(offfsetWidth / window.innerWidth);
      // console.log(offfsetWidth);
      // console.log(window.innerWidth);

      this.$refs.lyricList.$el.style[
        transform
      ] = `translate3d(${offfsetWidth}px,0,0)`;
      this.$refs.lyricList.$el.style[transitionDuration] = 0;
      // percent越大，透明度越小  反之
      this.$refs.middleL.style.opacity = 1 - this.touch.percent;
      this.$refs.middleL.style[transitionDuration] = 0;
    },
    // 鼠标松开时执行
    middleTouchEnd() {
      let offfsetWidth;
      let opacity;
      if (this.currentShow === "cd") {
        if (this.touch.percent > 0.1) {
          offfsetWidth = -window.innerWidth;
          opacity = 0;
          this.currentShow = "lyric";
        } else {
          offfsetWidth = 0;
          opacity = 1;
        }
      } else {
        // console.log(this.touch.percent);

        if (this.touch.percent < 0.9 && this.touch.percent !== 1) {
          offfsetWidth = 0;
          opacity = 1;
          this.currentShow = "cd";
        } else {
          opacity = 0;
          offfsetWidth = -window.innerWidth;
        }
      }
      const time = 300;
      this.$refs.lyricList.$el.style[
        transform
      ] = `translate3d(${offfsetWidth}px,0,0)`;
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`;
      this.$refs.middleL.style.opacity = opacity;
      this.$refs.middleL.style[transitionDuration] = `${time}ms`;
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
    currentSong(newSong, oldSong) {
      // 如果不加这个判断，list数组一被打乱，根据下标重新计算currentSong
      // 这个监听就会被执行，导致了暂停状态的时候也会播放歌曲
      if (newSong.id === oldSong.id) {
        return;
      }
      if (this.currentLyric) {
        this.currentLyric.stop();
      }
      // 这里不用$nextTick 的原因是
      // 当我们在微信里面播放的时候，如果说我们微信切到后台了，实际上js是不会的执行的，js不执行但他的audio
      // 是可以把当前这首歌播放完的，当歌曲播放完之后他就会去触发end函数，但是end不会被执行，我们再去打开的时候
      // songReady就永远不会设为true，如果songReady不为true的话，那我们就切换不了了
      // 所以这个时候，调用play这个方法，让他延迟的时间更长一点，所以我们在这里用setTimeout
      // 这样就可以解决了我们在手机浏览器去使用他从后台切到前台的时候，保证js会正常播放
      setTimeout(() => {
        this.$refs.audio.play();
        this.getLyric();
      },1000);
    },
    // 监听playing的状态
    playing(newPlaying) {
      const audio = this.$refs.audio;
      this.$nextTick(() => {
        // play开始    pause暂停
        newPlaying ? audio.play() : audio.pause();
      });

      // 当暂停的时候记录图片转动的当前位置
      if (!newPlaying) {
        // fullScreen播放器展开和收起状态
        if (this.fullScreen) {
          this.syncWrapperTransform("imageWrapper", "image");
        } else {
          this.syncWrapperTransform("miniWrapper", "miniImage");
        }
      }
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

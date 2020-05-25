<template>
  <transition appear name="slide">
    <music-list :songs="songs" :title="title" :bgimage="bgImage"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
import { mapGetters } from "vuex";
import { ERR_OK } from "api/config";
import { getSingerDetail } from "api/singer";
import { createSong } from "../../common/js/song";
import musicList from "../music-list/music-list"
import { processSongsUrl } from '../../common/js/song'


export default {
  data() {
    return {
      songs: []
    };
  },
  created() {
    // console.log(this.singer);
    this._getDetail();
  },
  components:{
    musicList
  },
  methods: {
    _getDetail() {
      if (!this.singer.id) {
        this.$router.push("/singer");
        return;
      }
      getSingerDetail(this.singer.id).then(res => {
        
        if (res.code === ERR_OK) {
          processSongsUrl(this._normalizeSongs(res.data.list)).then((songs) => {
            this.songs = songs;
            console.log(this.songs)
          });
          console.log(this.songs);
        }
      });
    },
    // 对在getSingerDetail拿到的数据进行处理
    _normalizeSongs(list) {
      let ret = [];
      list.forEach(item => {
        let { musicData } = item;
        if (musicData.songid && musicData.albummid) {
          ret.push(createSong(musicData));
        }
      });
      return ret;
    }
  },
  computed: {
    title(){
      return this.singer.name
    },
    bgImage(){
      return this.singer.avatar
    },
    ...mapGetters(["singer"])
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '../../common/stylus/variable';

.slide-enter-active, .slide-leave-active {
  transition: all 0.3s;
}

.slide-enter, .slide-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>

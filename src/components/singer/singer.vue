<template>
  <div class="singer" ref="singer">
    <list-view @select="selectSinger" ref="sing" :data="singers"></list-view>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
import { getSingerList } from "../../api/singer";
import { ERR_OK } from "../../api/config";
import Singer from "../../common/js/singer";
import listView from "../../base/listview/listview";
import { mapMutations } from "vuex";
import { playListMixin } from "../../common/js/mixin";

const HOT_SINGER_LEN = 10;
const HOT_NAME = "热门";

export default {
  mixins: [playListMixin],
  data() {
    return {
      singers: []
    };
  },
  created() {
    this._getSingerList();
  },
  components: {
    listView
  },
  methods: {
    selectSinger(singer) {
      // console.log(singer.id);
      this.$router.push({
        path: `/singer/${singer.id}`
      });
      this.setSinger(singer);
    },
    _getSingerList() {
      getSingerList().then(res => {
        if (res.code === ERR_OK) {
          this.singers = this._normalizeSinger(res.data.list);
        }
        // console.log(this.singers);
      });
    },
    _normalizeSinger(list) {
      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      };
      list.forEach((item, index) => {
        if (index < HOT_SINGER_LEN) {
          map.hot.items.push(
            new Singer({
              name: item.Fsinger_name,
              id: item.Fsinger_mid
            })
          );
        }
        const key = item.Findex;
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          };
        }
        map[key].items.push(
          new Singer({
            name: item.Fsinger_name,
            id: item.Fsinger_mid
          })
        );
      });
      // 因为对象的遍历是无序的
      // 为了得到有序列表，我们需要处理 map
      let ret = [];
      let hot = [];
      for (let key in map) {
        let val = map[key];
        if (val.title.match(/[a-zA-Z]/)) {
          ret.push(val);
        } else if (val.title === HOT_NAME) {
          hot.push(val);
        }
      }

      ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0);
      });
      // concat() 方法用于连接两个或多个数组。
      return hot.concat(ret);
    },
    // mixin方法
    handlePlayList(playList){
      const bottom = playList.length > 0 ? "60px" : "";
      this.$refs.singer.style.bottom = bottom;
      this.$refs.sing.refresh();
    },
    ...mapMutations({
      setSinger: "SET_SINGER"
    })
  }
};
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
.singer {
  position: fixed;
  top: 88px;
  bottom: 0;
  width: 100%;
}</style>

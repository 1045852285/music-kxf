import Vue from 'vue';
import VueRouter from 'vue-router';
import Recommend from '../components/recommend/recommend.vue';
import Rank from '../components/rank/rank.vue';
import Search from '../components/search/search.vue';
import Singer from '../components/singer/singer.vue';
import SingerDetail from '../components/singer-detail/singer-detail.vue';


Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/recommend',
  },
  {
    path: '/recommend',
    name: 'recommend',
    component: Recommend,
  },
  {
    path: '/singer',
    name: 'singer',
    component: Singer,
    children: [
      {
        path: ':id',
        name: 'SingerDetail',
        component: SingerDetail,
      }
    ]
  },
  {
    path: '/rank',
    name: 'rank',
    component: Rank,
  },
  {
    path: '/search',
    name: 'Search',
    component: Search,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});


// 添加这下面一段代码，就可以解决报错 
 
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
};

export default router;

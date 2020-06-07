import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const SEARCH_MAX_LEN = 15

const PLAY_KEY = '__play__'
const PLAY_MAX_LEN = 200

const FAVORITE_KEY = '__favorite__'
const FAVORITE_MAX_LEN = 200

function insertArray (arr, val, compare, maxLen) {
  // 数组的api，findIndex 查找当前数组中有没有某个元素
  const index = arr.findIndex(compare)
  if (index === 0) {
    return
  }
  if (index > 0) {
    arr.splice(index, 1)
  }
  arr.unshift(val)
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}

function deleteFromArray (arr, compare) {
  // 数组的api，findIndex 查找当前数组中有没有某个元素
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

export function saveSearch (query) {
  // 当前的列表是什么，如果没有，就是一个空数组
  let searches = storage.get(SEARCH_KEY, [])
  // 每个searches都是一个item
  insertArray(searches, query, (item) => {
    return item === query
  }, SEARCH_MAX_LEN)
  // 存到本地存储里面
  storage.set(SEARCH_KEY, searches)
  return searches
}

// 从本地删除某个指定的历史数据
export function deleteSearch (query) {
  let searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, (item) => {
    return item === query
  })
  storage.set(SEARCH_KEY, searches)
  return searches
}

// 删除全部本地以及vuex的搜索历史
export function clearSearch () {
  storage.remove(SEARCH_KEY)
  return []
}

// 从本地缓存读数据
export function loadSearch () {
  return storage.get(SEARCH_KEY, [])
}

export function savePlay (song) {
  let songs = storage.get(PLAY_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, PLAY_MAX_LEN)
  storage.set(PLAY_KEY, songs)
  return songs
}

export function loadPlay () {
  return storage.get(PLAY_KEY, [])
}

export function saveFavorite (song) {
  let songs = storage.get(FAVORITE_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, FAVORITE_MAX_LEN)
  storage.set(FAVORITE_KEY, songs)
  return songs
}

export function deleteFavorite (song) {
  let songs = storage.get(FAVORITE_KEY, [])
  deleteFromArray(songs, (item) => {
    return item.id === song.id
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}

export function loadFavorite () {
  return storage.get(FAVORITE_KEY, [])
}

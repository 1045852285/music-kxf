import originJSONP from 'jsonp'
// 我们通常传给服务端的是一个地址，url往往是带有一些参数的
// 这个库，是不支持传入一个data和一个option的，需要先把url拼好，然后再去调用这个库
// 我们实际上使用的时候是希望这个url就是一个比较纯粹的地址
// 他所有的query我们通过data去给他拼到这个url上，这样的话我们使用就会更加方便，所以我们第二个参数是data
export default function jsonp(url, data, option) {
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)
  return new Promise((resolve, reject) => {
    originJSONP(url, option, (err, data) => {
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })
}

export function param(data) {
  let url = ''
  for (var k in data) {
    let value = data[k] !== undefined ? data[k] : ''
    url += `&${k}=${encodeURIComponent(value)}`
  }
  return url ? url.substring(1) : ''
}

function getRandomInt(min, max) {
    // random返回0到1之间的一个小数包括1   加1是为了保证取到上限这个值
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export function shuffle(arr) {
    let _arr = arr.slice()
    for (let i = 0; i < _arr.length; i++) {
        let j = getRandomInt(0,i)
        let t = _arr[i]
        _arr[i] = _arr[j]
        _arr[j] = t
    }
    return _arr
}
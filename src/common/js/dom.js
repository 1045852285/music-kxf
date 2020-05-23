export function addClass(el,className){
    if(hasClass(el,className)){
        return
    }
    
    let newClass = el.className.split(' ')
    newClass.push(className)
    el.className = newClass.join(' ')
}

export function hasClass(el,className){
    let reg = new RegExp('(^|\\s)'+className+'(\\s|$)')
    return reg.test(el.className)
}

export function getData(el,name,val){
    const prefix = 'data-';
    if (val) {
        // setAttribute() 方法添加指定的属性，并为其赋指定的值
        return el.setAttribute(prefix + name,val);
    }else{
        // getAttribute() 方法返回指定属性名的属性值。
        return el.getAttribute(prefix + name);
    }
}
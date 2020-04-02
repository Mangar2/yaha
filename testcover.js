function toTest (parameter) {
    let result
    if (parameter) {
        result = 'hello'
    } else {
        result = 'world'
    }
    return result
}

console.log(toTest(true))
console.log(toTest(false))

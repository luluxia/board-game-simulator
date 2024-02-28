export const throttle = (fn: Function, delay: number) => {
  let last = 0
  return function (this: any) {
    const now = Date.now()
    if (now - last > delay) {
      fn.apply(this, arguments)
      last = now
    }
  }
}
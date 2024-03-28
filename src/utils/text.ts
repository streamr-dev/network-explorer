export function truncate(value: string) {
  return value.replace(/0x([a-f\d]{3})[a-f\d]{32,}([a-f\d]{5})/ig, '0x$1...$2').replace(/([a-f\d]{5})[a-f\d]{24,}([a-f\d]{5})/ig, '$1...$2')
}

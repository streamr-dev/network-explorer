export const truncate = (path: string) => {
  if (typeof path === 'string' && path.indexOf('0x') >= 0) {
    return path.replace(/0x([A-Fa-f0-9]{3})[A-Fa-f0-9]{32,}([A-Fa-f0-9]{5})/g, '0x$1...$2')
  }

  return path
}

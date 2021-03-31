// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect'
import 'core-js'

/* eslint-disable class-methods-use-this */
class ResizeObserver {
  observe() {
    // do nothing
  }

  unobserve() {
    // do nothing
  }
}
/* eslint-enable class-methods-use-this */

window.ResizeObserver = ResizeObserver
export default ResizeObserver

// LEARN (lesson 7): the old site ran on a tiny React-like runtime: a class with `state`,
// `setState` and `renderVals()`. This base class gives the original class exactly that API,
// so its 1,300 lines of logic run unchanged inside a normal React component (LegacyShell).
export default class BaseVM {
  constructor() {
    this._listeners = new Set();
    this.props = {}; // the old runtime passed props; nothing is configured here
  }

  setState(update, cb) {
    const patch = typeof update === 'function' ? update(this.state) : update;
    if (patch) this.state = { ...this.state, ...patch };
    this._listeners.forEach((fn) => fn());
    if (cb) setTimeout(cb, 0);
  }

  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  /** Set by LegacyShell: turns an old page id ('case-heatbud') into a real URL and navigates. */
  navigate() {}
}

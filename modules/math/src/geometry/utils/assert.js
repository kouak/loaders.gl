export function assert(condition, message) {
  if (!condition) {
    throw new Error(`math.gl assertion failed. ${message}`);
  }
}

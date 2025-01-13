/**
 * Traverse and find the object using the key path.
 * @param {Object} targetObject Target object to traverse into.
 * @param {string[]} path Path of keys to traverse deep into the object.
 * @return {Object|null} Resulting object or null if nothing found (or target entry is not an object.
 */
export function findDeepObject(targetObject, path) {
  let result = targetObject;

  for (let key of path) {
    if (!result || typeof result !== 'object') {
      return null;
    }

    result = result[key];
  }

  if (!result || typeof result !== "object") {
    return null;
  }

  return result;
}

/**
 * Matches all the characters needing replacement.
 *
 * Gathered from right here: https://stackoverflow.com/a/3561711/16048617. Because I don't want to introduce some
 * library for that.
 *
 * @type {RegExp}
 */
const unsafeRegExpCharacters = /[/\-\\^$*+?.()|[\]{}]/g;

/**
 * Escape all the RegExp syntax-related characters in the following value.
 * @param {string} value Original value.
 * @return {string} Resulting value with all needed characters escaped.
 */
export function escapeRegExp(value) {
  unsafeRegExpCharacters.lastIndex = 0;
  return value.replace(unsafeRegExpCharacters, "\\$&");
}

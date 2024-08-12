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

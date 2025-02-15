/**
 * Traverse and find the object using the key path.
 * @param targetObject Target object to traverse into.
 * @param path Path of keys to traverse deep into the object.
 * @return Resulting object or null if nothing found (or target entry is not an object).
 */
export function findDeepObject(targetObject: Record<string, any>, path: string[]): Object|null {
  let result = targetObject;

  for (const key of path) {
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
 */
const unsafeRegExpCharacters: RegExp = /[/\-\\^$*+?.()|[\]{}]/g;

/**
 * Escape all the RegExp syntax-related characters in the following value.
 * @param value Original value.
 * @return Resulting value with all needed characters escaped.
 */
export function escapeRegExp(value: string): string {
  unsafeRegExpCharacters.lastIndex = 0;
  return value.replace(unsafeRegExpCharacters, "\\$&");
}

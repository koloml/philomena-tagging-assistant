const instanceSymbol = Symbol('instance');

/**
 * @param {HTMLElement} element
 * @return {import('./BaseComponent').BaseComponent|null}
 */
export function getComponent(element) {
  return element[instanceSymbol] || null;
}

/**
 * Bind the component to the selected element.
 * @param {HTMLElement} element The element to bind the component to.
 * @param {import('./BaseComponent').BaseComponent} instance The component instance.
 */
export function bindComponent(element, instance) {
  if (element[instanceSymbol]) {
    throw new Error('The element is already bound to a component.');
  }

  element[instanceSymbol] = instance;
}

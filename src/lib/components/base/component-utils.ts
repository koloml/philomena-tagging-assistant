import type { BaseComponent } from "$lib/components/base/BaseComponent";

const instanceSymbol = Symbol('instance');

interface ElementWithComponent extends HTMLElement {
  [instanceSymbol]?: BaseComponent;
}

/**
 * Get the component from the element, if there is one.
 * @param {HTMLElement} element
 * @return
 */
export function getComponent(element: ElementWithComponent): BaseComponent | null {
  return element[instanceSymbol] || null;
}

/**
 * Bind the component to the selected element.
 * @param element The element to bind the component to.
 * @param instance The component instance.
 */
export function bindComponent(element: ElementWithComponent, instance: BaseComponent): void {
  if (element[instanceSymbol]) {
    throw new Error('The element is already bound to a component.');
  }

  element[instanceSymbol] = instance;
}

import {bindComponent} from "$lib/components/base/ComponentUtils.js";

/**
 * @abstract
 */
export class BaseComponent {
  /** @type {HTMLElement} */
  #container;

  /**
   * @param {HTMLElement} container
   */
  constructor(container) {
    this.#container = container;

    bindComponent(container, this);

    this.build();
    this.init();
  }

  /**
   * @protected
   */
  build() {
    // This method can be implemented by the component classes to modify or create the inner elements.
  }

  /**
   * @protected
   */
  init() {
    // This method can be implemented by the component classes to initialize the component.
  }

  /**
   * @return {HTMLElement}
   * @protected
   */
  get container() {
    return this.#container;
  }

  /**
   * Emit the custom event on the container element.
   * @param {keyof HTMLElementEventMap|string} event The event name.
   * @param {any} [detail] The event detail. Can be omitted.
   */
  emit(event, detail = undefined) {
    this.#container.dispatchEvent(new CustomEvent(event, {detail}));
  }

  /**
   * Subscribe to the DOM event on the container element.
   * @param {keyof HTMLElementEventMap|string} event The event name.
   * @param {function(Event): void} listener The event listener.
   * @param {AddEventListenerOptions|undefined} [options] The event listener options. Can be omitted.
   * @return {function(): void} The unsubscribe function.
   */
  on(event, listener, options = undefined) {
    this.#container.addEventListener(event, listener, options);

    return () => void this.#container.removeEventListener(event, listener, options);
  }

  /**
   * Subscribe to the DOM event on the container element. The event listener will be called only once.
   * @param {keyof HTMLElementEventMap|string} event The event name.
   * @param {function(Event): void} listener The event listener.
   * @param {AddEventListenerOptions|undefined} [options] The event listener options. Can be omitted.
   * @return {function(): void} The unsubscribe function.
   */
  once(event, listener, options = undefined) {
    options = options || {};
    options.once = true;

    return this.on(event, listener, options);
  }
}

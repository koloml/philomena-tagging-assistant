import { bindComponent } from "$content/components/base/component-utils";

type ComponentEventListener<EventName extends keyof HTMLElementEventMap> =
  (this: HTMLElement, event: HTMLElementEventMap[EventName]) => void;

export class BaseComponent<ContainerType extends HTMLElement = HTMLElement> {
  readonly #container: ContainerType;

  #isInitialized = false;

  constructor(container: ContainerType) {
    this.#container = container;

    bindComponent(container, this);
  }

  initialize() {
    if (this.#isInitialized) {
      throw new Error('The component is already initialized.');
    }

    this.#isInitialized = true;

    this.build();
    this.init();
  }

  protected build(): void {
    // This method can be implemented by the component classes to modify or create the inner elements.
  }

  protected init(): void {
    // This method can be implemented by the component classes to initialize the component.
  };

  get container(): ContainerType {
    return this.#container;
  }

  /**
   * Check if the component is initialized already. If not checked, subsequent calls to the `initialize` method will
   * throw an error.
   * @return
   */
  get isInitialized(): boolean {
    return this.#isInitialized;
  }

  /**
   * Emit the custom event on the container element.
   * @param event The event name.
   * @param [detail] The event detail. Can be omitted.
   */
  emit(event: keyof HTMLElementEventMap | string, detail: any = undefined): void {
    this.#container.dispatchEvent(
      new CustomEvent(
        event,
        {
          detail,
          bubbles: true
        }
      )
    );
  }

  /**
   * Subscribe to the DOM event on the container element.
   * @param event The event name.
   * @param listener The event listener.
   * @param [options] The event listener options. Can be omitted.
   * @return The unsubscribe function.
   */
  on<EventName extends keyof HTMLElementEventMap>(
    event: EventName,
    listener: ComponentEventListener<EventName>,
    options?: AddEventListenerOptions,
  ): () => void {
    this.#container.addEventListener(event, listener, options);

    return () => this.#container.removeEventListener(event, listener, options);
  }

  /**
   * Subscribe to the DOM event on the container element. The event listener will be called only once.
   * @param event The event name.
   * @param listener The event listener.
   * @param [options] The event listener options. Can be omitted.
   * @return The unsubscribe function.
   */
  once<EventName extends keyof HTMLElementEventMap>(
    event: EventName,
    listener: ComponentEventListener<EventName>,
    options?: AddEventListenerOptions,
  ): () => void {
    options = options || {};
    options.once = true;

    return this.on(event, listener, options);
  }
}

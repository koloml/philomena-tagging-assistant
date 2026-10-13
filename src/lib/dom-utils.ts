/**
 * Reusable function to create icons from FontAwesome. Usable only for website, since extension doesn't host its own
 * copy of FA styles. Extension should use imports of SVGs inside CSS instead.
 * @param iconSlug Slug of the icon to be added.
 * @param [subtype="solid"] Subtype of the icon. Some icons only exist in specific subtypes.
 * @return Element with classes for FontAwesome icon added.
 */
export function createFontAwesomeIcon(iconSlug: string, subtype: string = 'solid'): HTMLElement {
  const iconElement = document.createElement('i');
  iconElement.classList.add(`fa-${subtype}`, `fa-${iconSlug}`);
  return iconElement;
}

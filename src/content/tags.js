import {wrapTagDropdown} from "$lib/components/TagDropdownWrapper.js";

for (let tagDropdownElement of document.querySelectorAll('.tag.dropdown')) {
  wrapTagDropdown(tagDropdownElement);
}

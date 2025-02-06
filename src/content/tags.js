import { watchTagDropdownsInTagsEditor, wrapTagDropdown } from "$lib/components/TagDropdownWrapper";

for (let tagDropdownElement of document.querySelectorAll('.tag.dropdown')) {
  wrapTagDropdown(tagDropdownElement);
}

watchTagDropdownsInTagsEditor();

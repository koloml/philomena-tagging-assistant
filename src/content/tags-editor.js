import {initializeTagForm} from "$lib/components/TagsForm.js";

const tagsEditorContainer = document.querySelector('#tags-form');

if (tagsEditorContainer) {
  initializeTagForm(tagsEditorContainer);
}

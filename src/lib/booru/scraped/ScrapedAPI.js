import PostParser from "$lib/booru/scraped/parsing/PostParser";

export default class ScrapedAPI {
  /**
   * Update the tags of the image using callback.
   * @param {number} imageId ID of the image.
   * @param {function(Set<string>): Set<string>} callback Callback to call to change the content.
   * @return {Promise<Map<string,string>|null>} Updated tags and aliases list for updating internal cached state.
   */
  async updateImageTags(imageId, callback) {
    const postParser = new PostParser(imageId);
    const formData = await postParser.resolveTagEditorFormData();

    const tagsList = new Set(
      formData
        .get(PostParser.tagsInputName)
        .split(',')
        .map(tagName => tagName.trim())
    );

    const updateTagsList = callback(tagsList);

    if (!(updateTagsList instanceof Set)) {
      throw new Error("Return value is not a set!");
    }

    formData.set(
      PostParser.tagsInputName,
      Array.from(updateTagsList).join(', ')
    );

    await fetch(`/images/${imageId}/tags`, {
      method: 'POST',
      body: formData,
    });

    // We need to remove stored version of the document to request an updated version.
    postParser.clear();

    // Additional request to re-fetch the new list of tags and aliases. I couldn't find the way to request this list
    // using official API.
    // TODO Maybe it will be better to resolve aliases on the extension side somehow, maybe by requesting and caching
    //      aliases in storage.
    return await postParser.resolveTagsAndAliases();
  }
}

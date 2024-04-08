import PostParser from "$lib/booru/scraped/parsing/PostParser.js";

export default class ScrapedAPI {
  /**
   * Update the tags of the image using callback.
   * @param {number} imageId ID of the image.
   * @param {function(Set<string>): Set<string>} callback Callback to call to change the content.
   * @return {Promise<Map<string,string>|null>} Updated tags and aliases list for updating internal cached state.
   */
  async updateImageTags(imageId, callback) {
    const formData = await new PostParser(imageId)
      .resolveTagEditorFormData();

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

    const tagsSubmittedResponse = await fetch(`/images/${imageId}/tags`, {
      method: 'POST',
      body: formData,
    });

    return PostParser.resolveTagsAndAliasesFromPost(
      await PostParser.resolveFragmentFromResponse(tagsSubmittedResponse)
    );
  }
}

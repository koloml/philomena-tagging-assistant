import PostParser from "$lib/philomena/scraping/parsing/PostParser";

export type TagsUpdaterFunction = (tags: Set<string>) => Set<string>;

export default class ScrapedAPI {
  /**
   * Update the tags of the image using callback.
   * @param imageId ID of the image.
   * @param callback Callback to call to change the content.
   * @return Updated tags and aliases list for updating internal cached state.
   */
  async updateImageTags(imageId: number, callback: TagsUpdaterFunction): Promise<Map<string, string> | null> {
    const postParser = new PostParser(imageId);
    const formData = await postParser.resolveTagEditorFormData();
    const tagsFieldValue = formData.get(PostParser.tagsInputName);

    if (typeof tagsFieldValue !== 'string') {
      throw new Error('Missing tags field!');
    }

    const tagsList = new Set(
      tagsFieldValue
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

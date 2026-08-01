import slugify from "slugify";
export async function generateUniqueSlug(slugExistsFn, text, excludeId = null) {
  const base = slugify(text, { lower: true, strict: true });
  let slug = base;
  let counter = 1;
  
  while (true) {
    const exists = await slugExistsFn(slug, excludeId);
    if (!exists) return slug;
    slug = `${base}-${counter}`;
    counter += 1;
  }
}

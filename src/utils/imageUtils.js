/**
 * Image utility helpers for robust image loading across the app.
 * Handles CDN hotlink protection, fallbacks, and proxy patterns.
 */

// Placeholder images by context
export const PLACEHOLDERS = {
  anime: 'https://placehold.co/300x420/111111/444444?text=No+Image',
  animeLandscape: 'https://placehold.co/800x450/111111/444444?text=No+Image',
  character: 'https://placehold.co/200x300/111111/444444?text=?',
  news: 'https://placehold.co/600x400/100714/f43f5e?text=Nakama+News',
  avatar: 'https://placehold.co/100x100/111111/444444?text=U',
};

/**
 * Returns the best available image URL from a Jikan anime images object.
 * Prefers webp large → jpg large → webp medium → jpg medium → webp small → jpg small
 */
export const getAnimeImage = (images, size = 'large') => {
  if (!images) return PLACEHOLDERS.anime;
  const webp = images?.webp;
  const jpg = images?.jpg;

  if (size === 'large') {
    return webp?.large_image_url || jpg?.large_image_url ||
           webp?.image_url || jpg?.image_url ||
           webp?.small_image_url || jpg?.small_image_url ||
           PLACEHOLDERS.anime;
  }
  if (size === 'medium') {
    return webp?.image_url || jpg?.image_url ||
           webp?.large_image_url || jpg?.large_image_url ||
           PLACEHOLDERS.anime;
  }
  if (size === 'small') {
    return webp?.small_image_url || jpg?.small_image_url ||
           webp?.image_url || jpg?.image_url ||
           PLACEHOLDERS.anime;
  }
  return PLACEHOLDERS.anime;
};

/**
 * Returns the best available image URL from a Jikan character images object.
 */
export const getCharacterImage = (images) => {
  if (!images) return PLACEHOLDERS.character;
  return images?.webp?.image_url || images?.jpg?.image_url || PLACEHOLDERS.character;
};

/**
 * Generic onError handler for img elements.
 * Sets the src to a placeholder and prevents infinite error loops.
 */
export const handleImageError = (e, placeholder = PLACEHOLDERS.anime) => {
  if (e.target.src !== placeholder) {
    e.target.onerror = null; // prevent infinite loop
    e.target.src = placeholder;
  }
};

/**
 * Creates an onError handler bound to a specific placeholder.
 */
export const createImageErrorHandler = (placeholder = PLACEHOLDERS.anime) => (e) => {
  handleImageError(e, placeholder);
};

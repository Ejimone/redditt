/** Best-effort first-frame poster for Cloudinary video URLs (for `poster` on `<video>`). */
export function cloudinaryVideoPosterUrl(videoUrl: string): string | undefined {
  if (!videoUrl.includes("res.cloudinary.com") || !videoUrl.includes("/video/upload/")) {
    return undefined;
  }
  const withSeek = videoUrl.replace("/video/upload/", "/video/upload/so_0/");
  return withSeek.replace(/\.(mp4|webm|mov|m4v)(\?.*)?$/i, ".jpg$2");
}

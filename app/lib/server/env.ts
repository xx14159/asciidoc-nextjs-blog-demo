export const dev = !(
  process.env.NODE_ENV === "production" && process.env.BLOG_ENV === "production"
);

export const postChunkSize = isNaN(Number(process.env.CHUNK_SIZE))
  ? 25
  : Number(process.env.CHUNK_SIZE);

export const basePrefix =
  process.env.BASE_PREFIX ?? "https://others.blog/";
export const apiPrefix = process.env.API_PREFIX ?? "https://api.otherx.blog/";
export const imgPrefix = process.env.IMG_PREFIX ?? "https://otherx.blog/";
export const staticPrefix =
  process.env.STATIC_PREFIX ?? "https://others.blog/";

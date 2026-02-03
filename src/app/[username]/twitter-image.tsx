/**
 * Twitter card image - re-exports the same OG image
 *
 * Twitter cards use the same 1.91:1 aspect ratio as OG images,
 * so we can share the same ImageResponse implementation.
 */
export { default, alt, size, contentType, runtime } from './opengraph-image'

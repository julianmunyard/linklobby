import { FC } from 'react';

export interface CircularGalleryItem {
  image: string;
  text?: string;
  link?: string | null;
}

export interface CircularGalleryProps {
  items: CircularGalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
  spacing?: number;
  onTap?: ((link: string | null) => void) | null;
  showCaptions?: boolean;
}

declare const CircularGallery: FC<CircularGalleryProps>;
export default CircularGallery;

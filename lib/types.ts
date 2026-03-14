// ═══════════════════════════════════════════════════════════════
// 📋  TYPES
// ═══════════════════════════════════════════════════════════════

export interface Member {
  name: string;
  role: string;
  social: string;
  bio: string;
  photoUrl: string;
}

export interface Album {
  title: string;
  releaseDate: string;
  type: 'album' | 'single' | 'ep';
  label: string;
  tracks: string;
  formats: string;
  coverUrl: string;
  spotifyUrl: string;
  appleMusicUrl: string;
  youtubeUrl: string;
}

export interface Video {
  title: string;
  platform: 'youtube' | 'vimeo' | 'otro';
  url: string;
  caption: string;
}

export interface Event {
  title: string;
  dateTime: string;
  city: string;
  country: string;
  venueName: string;
  venueAddress: string;
  capacity: string;
  ticketPrice: string;
  ticketsLink: string;
  description: string;
}

export interface MerchItem {
  name: string;
  sku: string;
  price: string;
  stock: string;
  category: 'ropa' | 'accesorios' | 'musica' | 'otro' | '';
  sizes: string;
  colors: string;
  weight: string;
  description: string;
  imageUrl: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface FormData {
  // Branding
  brandName: string;
  domain: string;
  tagline: string;
  logo: File[];
  guia_marca: File[];
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  fonts: string;
  
  // Biography
  bioShort: string;
  bioLong: string;
  press_kit: File[];
  
  // Social Media
  spotify: string;
  appleMusic: string;
  youtube: string;
  instagram: string;
  tiktok: string;
  facebook: string;
  twitter: string;
  soundcloud: string;
  bandcamp: string;
  deezer: string;
  
  // Discography
  members: Member[];
  discography: Album[];
  
  // Photos & Videos
  fotos_hq: File[];
  fotos_live: File[];
  posters: File[];
  videos: Video[];
  
  // Events
  events: Event[];
  
  // Merch
  merch: MerchItem[];
  fotos_merch: File[];
  
  // Press
  pressName: string;
  pressEmail: string;
  pressPhone: string;
  docs_prensa: File[];
  
  // SEO
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
  
  // Notes
  references: string;
  ticketsInfo: string;
  aiNotes: string;
  extraNotes: string;
}

export interface FormSubmissionResult {
  success: boolean;
  message: string;
  data?: FormData;
  uploadedFiles?: Record<string, UploadedFile[]>;
}

export interface UploadZone {
  id: string;
  label: string;
  field: keyof FormData;
  multiple: boolean;
  accept: string;
}

export type SubmitMode = 'local' | 'web3forms' | 'formspree' | 'netlify';
export type UploadProvider = 'backblaze' | 'gofile' | 'local';

export interface AppConfig {
  submitMode: SubmitMode;
  web3formsKey: string;
  formspreeId: string;
  // Backblaze B2
  b2KeyId: string;
  b2ApplicationKey: string;
  b2BucketName: string;
  // GoFile (backup)
  gofileToken: string;
  gofileFolderId: string;
  // General
  emailDestino: string;
  maxFileSize: number;
  maxTotalSize: number;
  rateLimitMs: number;
  maxSubmissions: number;
}
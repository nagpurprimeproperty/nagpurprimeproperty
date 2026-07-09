/**
 * src/shared/theme/colors.ts
 *
 * Re-exports the color palette from its canonical location at @/theme/colors.
 * New code in src/features/* and src/shared/* should import from here.
 * The root theme/ folder is preserved so the 60+ existing consumers keep
 * working without a mass import update.
 */
export { default } from '@/theme/colors';
export { default as colors } from '@/theme/colors';

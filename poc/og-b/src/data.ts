// Data undangan: dibaca dari fixture bersama (poc/shared/fixture.json).
// TIDAK ada salinan per varian — satu sumber yang sama dengan varian A.
import fixture from "../../shared/fixture.json";

export interface InvitationDetail {
  title: string;
  time: string;
  description: string;
}

export interface GalleryItem {
  title: string;
  caption: string;
}

export interface Invitation {
  slug: string;
  names: string;
  title: string;
  description: string;
  date: string;
  dateDisplay: string;
  venue: string;
  city: string;
  details: InvitationDetail[];
  gallery: GalleryItem[];
  ogImage: string;
  coverImage: string;
}

export const invitations: Invitation[] = (
  fixture as { invitations: Invitation[] }
).invitations;

export function getInvitation(slug: string | undefined): Invitation | undefined {
  if (!slug) return undefined;
  return invitations.find((inv) => inv.slug === slug);
}

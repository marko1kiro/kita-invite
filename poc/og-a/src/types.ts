/** Tipe undangan fiktif — cerminan poc/shared/fixture.json. */
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
  /** ISO 8601 + offset, mis. "2027-02-20T08:00:00+07:00". */
  date: string;
  dateDisplay: string;
  venue: string;
  city: string;
  details: InvitationDetail[];
  gallery: GalleryItem[];
  ogImage: string;
  coverImage: string;
}

export interface DeckAndVideoInfo {
  deckId?: string;
  secNo?: string;
  titleAsHtml: string;

  clipId?: string;
  timestampSec?: number;
}

export interface ClipDetails {
  r360?: string;
  r720?: string;
  r1080?: string;
  sub?: string;
}

export interface DocumentDashInfo {
  archive: string;
  filepath: string;
  titleAsHtml: string;
  secId?: string;
  children: DocumentDashInfo[];
}

export interface CourseSection {
  sectionTitle: string;
  decks: DeckAndVideoInfo[];
}

export interface CourseInfo {
  courseId: string;
  sections: CourseSection[];
}

export enum SlideType {
  FRAME = 'FRAME',
  TEXT = 'TEXT',
}

export interface Slide {
  slideContent: string;
  slideType: SlideType;
  autoExpand: boolean;
  preNotes: string[];
  postNotes: string[];

  archive: string;
  filepath: string;
}

export interface SlideReturn {
  slides: Slide[];
  foundSection: boolean;
  sectionHasEnded: boolean;
}
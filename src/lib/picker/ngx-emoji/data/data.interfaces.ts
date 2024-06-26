import { Emoji } from '../emoji.component';

export interface EmojiCategory {
  id: string;
  name: string;
  emojis?: any[] | null;
  anchor?: boolean;
  first?: boolean;
  group?: number,
}

export interface CompressedEmojiData {
  label: string;
  hexcode: string;
  shortcode?: string;
  shortcodes?: string[];
  sheet?: [number, number];
  tags?: string[];
  hidden?: string[];
  emoticon?: string | string[];
  text?: string;
  skins?: EmojiVariation[];
  obsoletedBy?: string;
  obsoletes?: string;
}

export interface EmojiData {
  id: string;
  label: string;
  hexcode: string;
  shortcode: string;
  shortcodes: string[];
  sheet: [number, number];
  tags: string[];
  hidden: string[];
  emoticon: string | string[];
  text: string;
  set?: Emoji['set'];
  skins: EmojiVariation[];
  obsoletedBy?: string;
  obsoletes?: string;
  skinTone?: Emoji['skin'];
  custom?: boolean;
  native?: string;
  imageUrl?: string;
  colons?: string;
  skin?: Emoji['skin'];
  spriteUrl?: string;
  sheetRows?: string;
}

export interface EmojiVariation {
  hexcode: string;
  sheet?: [number, number];
  hidden?: string[];
}

export interface SkinData {
  name: string;
  unified: string;
  shortcode: string;
  sheet: [number, number];
}

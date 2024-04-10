import { Injectable } from '@angular/core';

import { CompressedEmojiData, EmojiCategory, EmojiData, EmojiVariation } from './data/data.interfaces';
import { emojis } from './data/emojis';
import { Emoji } from './emoji.component';

const COLONS_REGEX = /^(?:\:([^\:]+)\:)(?:\:skin-tone-(\d)\:)?$/;
const SKINS = ['1F3FA', '1F3FB', '1F3FC', '1F3FD', '1F3FE', '1F3FF'];
export const DEFAULT_BACKGROUNDFN = (set: string, sheetSize: number) =>
  `https://cdn.jsdelivr.net/npm/emoji-datasource-${set}@14.0.0/img/${set}/sheets-256/${sheetSize}.png`;

import {Emoji as EmojibaseEmoji} from 'emojibase/src/types'

@Injectable({ providedIn: 'root' })
export class EmojiService {
  uncompressed = false;
  names: { [key: string]: EmojiData } = {};
  emojis: EmojiData[] = [];
  emojibase: EmojibaseEmoji[] = [];

  constructor() {
    if (!this.uncompressed) {
      this.uncompress(emojis);
      this.uncompressed = true;
    }
  }

  uncompress(list: CompressedEmojiData[]) {
    this.emojis = list.map(emoji => {
      const data: any = { ...emoji };
      if (!data.shortNames) {
        data.shortNames = [];
      }
      data.shortNames.unshift(data.shortName);
      data.id = data.shortName;
      data.native = this.unifiedToNative(data.hexcode);

      if (!data.skinVariations) {
        data.skinVariations = [];
      }

      if (!data.tags) {
        data.tags = [];
      }

      if (!data.sheet) {
        data.sheet = [0, 0];
      }

      if (!data.emoticons) {
        data.emoticons = [];
      }

      if (!data.hidden) {
        data.hidden = [];
      }

      if (!data.text) {
        data.text = '';
      }

      if (data.obsoletes) {
        // get keywords from emoji that it obsoletes since that is shared
        const f = list.find(x => x.hexcode === data.obsoletes);
        if (f) {
          if (f.tags) {
            data.tags = [...data.tags, ...f.tags, f.shortName];
          } else {
            data.tags = [...data.tags, f.shortName];
          }
        }
      }

      this.names[data.hexcode] = data;
      for (const n of data.shortNames) {
        this.names[n] = data;
      }
      return data;
    });
  }

  setEmojibase(emojibase: EmojibaseEmoji[]) {
    this.emojibase = emojibase;
    this.uncompress(emojibase);
  }

  getData(emoji: EmojiData | string, skin?: Emoji['skin'], set?: Emoji['set']): EmojiData | null {
    let emojiData: any;
    // TODO investigate
    if (!emoji) {
      return null;
    }

    if (typeof emoji === 'string') {
      const matches = emoji.match(COLONS_REGEX);

      if (matches) {
        emoji = matches[1];

        if (matches[2]) {
          skin = parseInt(matches[2], 10) as Emoji['skin'];
        }
      }
      if (this.names.hasOwnProperty(emoji)) {
        emojiData = this.names[emoji];
      } else {
        return null;
      }
    } else if (emoji.id) {
      emojiData = this.names[emoji.id];
    } else if (emoji.hexcode) {
      emojiData = this.names[emoji.hexcode.toUpperCase()];
    }

    if (!emojiData) {
      emojiData = emoji;
      emojiData.custom = true;
    }

    const hasSkinVariations = emojiData.skinVariations && emojiData.skinVariations.length;
    if (hasSkinVariations && skin && skin > 1 && set) {
      emojiData = { ...emojiData };

      const skinKey = SKINS[skin - 1];
      const variationData = emojiData.skinVariations.find((n: EmojiVariation) =>
        n.hexcode.includes(skinKey),
      );

      if (!variationData.hidden || !variationData.hidden.includes(set)) {
        emojiData.skinTone = skin;
        emojiData = { ...emojiData, ...variationData };
      }
      emojiData.native = this.unifiedToNative(emojiData.hexcode);
    }

    emojiData.set = set || '';

    return emojiData as EmojiData;
  }

  unifiedToNative(unified: string) {
    const codePoints = unified.split('-').map(u => parseInt(`0x${u}`, 16));
    return String.fromCodePoint(...codePoints);
  }

  emojiSpriteStyles(
    sheet: EmojiData['sheet'],
    set: Emoji['set'] = 'apple',
    size: Emoji['size'] = 24,
    sheetSize: Emoji['sheetSize'] = 64,
    sheetRows: Emoji['sheetRows'] = 60,
    backgroundImageFn: Emoji['backgroundImageFn'] = DEFAULT_BACKGROUNDFN,
    sheetColumns = 61,
    url?: string,
  ) {
    const hasImageUrl = !!url;
    url = url || backgroundImageFn(set, sheetSize);
    return {
      width: `${size}px`,
      height: `${size}px`,
      display: 'inline-block',
      'background-image': `url(${url})`,
      'background-size': hasImageUrl ? '100% 100%' : `${100 * sheetColumns}% ${100 * sheetRows}%`,
      'background-position': hasImageUrl ? undefined : this.getSpritePosition(sheet, sheetColumns),
    };
  }

  getSpritePosition(sheet: EmojiData['sheet'], sheetColumns: number) {
    const [sheetX, sheetY] = sheet;
    const multiply = 100 / (sheetColumns - 1);
    return `${multiply * sheetX}% ${multiply * sheetY}%`;
  }

  sanitize(emoji: EmojiData | null): EmojiData | null {
    if (emoji === null) {
      return null;
    }
    const id = emoji.id || emoji.shortNames[0];
    let colons = `:${id}:`;
    if (emoji.skinTone) {
      colons += `:skin-tone-${emoji.skinTone}:`;
    }
    emoji.colons = colons;
    return { ...emoji };
  }

  getSanitizedData(emoji: string | EmojiData, skin?: Emoji['skin'], set?: Emoji['set']) {
    return this.sanitize(this.getData(emoji, skin, set));
  }

  populateCategories(categories: EmojiCategory[]) {
    for (const category of categories) {
      const list = this.emojibase.filter(emoji => emoji.group === category.group);
      category.emojis = list.map(emoji => emoji.hexcode);
    }

    return categories;
  }
}

import {
  generateSlugFromTitle,
  isValidTitle,
  sanitizeSlug,
  isValidSessionId,
  parseCookies,
  getWordCount,
} from '../lib/utils';

describe('generateSlugFromTitle', () => {
  it('converts title to lowercase', () => {
    expect(generateSlugFromTitle('Hello World')).toBe('hello-world');
  });

  it('replaces spaces with dashes', () => {
    expect(generateSlugFromTitle('my new document')).toBe('my-new-document');
  });

  it('handles multiple spaces', () => {
    expect(generateSlugFromTitle('hello    world')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(generateSlugFromTitle('Hello! World? @#$%')).toBe('hello-world');
  });

  it('collapses multiple dashes', () => {
    expect(generateSlugFromTitle('hello---world')).toBe('hello-world');
  });

  it('trims leading and trailing dashes', () => {
    expect(generateSlugFromTitle('  hello world  ')).toBe('hello-world');
  });

  it('handles empty string', () => {
    expect(generateSlugFromTitle('')).toBe('');
  });

  it('preserves numbers', () => {
    expect(generateSlugFromTitle('Chapter 1 Introduction')).toBe('chapter-1-introduction');
  });

  it('handles only special characters', () => {
    expect(generateSlugFromTitle('!@#$%')).toBe('');
  });

  it('handles unicode characters by removing them', () => {
    expect(generateSlugFromTitle('Café Résumé')).toBe('caf-rsum');
  });
});

describe('isValidTitle', () => {
  it('returns true for valid title', () => {
    expect(isValidTitle('My Document')).toBe(true);
  });

  it('returns true for single character', () => {
    expect(isValidTitle('A')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isValidTitle('')).toBe(false);
  });

  it('returns false for whitespace only', () => {
    expect(isValidTitle('   ')).toBe(false);
  });

  it('returns false for tabs and newlines only', () => {
    expect(isValidTitle('\t\n')).toBe(false);
  });

  it('returns true for title with leading/trailing whitespace', () => {
    expect(isValidTitle('  Valid Title  ')).toBe(true);
  });
});

describe('sanitizeSlug', () => {
  it('replaces spaces with dashes', () => {
    expect(sanitizeSlug('my new doc')).toBe('my-new-doc');
  });

  it('handles multiple spaces', () => {
    expect(sanitizeSlug('my   new   doc')).toBe('my-new-doc');
  });

  it('leaves existing dashes alone', () => {
    expect(sanitizeSlug('my-existing-slug')).toBe('my-existing-slug');
  });

  it('handles mixed spaces and dashes', () => {
    expect(sanitizeSlug('my new-doc')).toBe('my-new-doc');
  });

  it('handles empty string', () => {
    expect(sanitizeSlug('')).toBe('');
  });
});

describe('isValidSessionId', () => {
  it('returns true for valid session string', () => {
    expect(isValidSessionId('abc123xyz')).toBe(true);
  });

  it('returns false for undefined', () => {
    expect(isValidSessionId(undefined)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidSessionId('')).toBe(false);
  });

  it('returns true for any non-empty string', () => {
    expect(isValidSessionId('a')).toBe(true);
  });
});

describe('parseCookies', () => {
  it('parses single cookie', () => {
    expect(parseCookies('session=abc123')).toEqual({ session: 'abc123' });
  });

  it('parses multiple cookies', () => {
    expect(parseCookies('session=abc123; user=john')).toEqual({
      session: 'abc123',
      user: 'john',
    });
  });

  it('handles empty string', () => {
    expect(parseCookies('')).toEqual({});
  });

  it('handles URL encoded values', () => {
    expect(parseCookies('name=John%20Doe')).toEqual({ name: 'John Doe' });
  });

  it('handles whitespace around cookies', () => {
    expect(parseCookies('  session = abc123 ; user = john  ')).toEqual({
      session: 'abc123',
      user: 'john',
    });
  });

  it('ignores malformed cookies without value', () => {
    expect(parseCookies('session=')).toEqual({});
  });
});

describe('getWordCount', () => {
  it('counts words in a sentence', () => {
    expect(getWordCount('Hello world this is a test')).toBe(6);
  });

  it('handles multiple spaces between words', () => {
    expect(getWordCount('Hello    world')).toBe(2);
  });

  it('handles empty string', () => {
    expect(getWordCount('')).toBe(0);
  });

  it('handles whitespace only', () => {
    expect(getWordCount('   ')).toBe(0);
  });

  it('handles single word', () => {
    expect(getWordCount('Hello')).toBe(1);
  });

  it('handles newlines and tabs', () => {
    expect(getWordCount('Hello\nworld\ttest')).toBe(3);
  });

  it('trims leading and trailing whitespace', () => {
    expect(getWordCount('  Hello world  ')).toBe(2);
  });
});

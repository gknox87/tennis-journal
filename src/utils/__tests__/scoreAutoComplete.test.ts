import { describe, it, expect } from 'vitest';
import {
  autoCompleteTennisScore,
  autoCompleteTableTennisScore,
  autoCompleteBadmintonScore,
  autoCompleteSquashScore,
  autoCompletePickleballScore,
  autoCompleteTiebreakScore,
} from '../scoreAutoComplete';

describe('Tennis Auto-Complete', () => {
  it('should auto-complete losing scores (0-5)', () => {
    expect(autoCompleteTennisScore(0, null)).toBe(6);
    expect(autoCompleteTennisScore(1, null)).toBe(6);
    expect(autoCompleteTennisScore(2, null)).toBe(6);
    expect(autoCompleteTennisScore(3, null)).toBe(6);
    expect(autoCompleteTennisScore(4, null)).toBe(6);
  });

  it('should auto-complete 5 as 5-7', () => {
    expect(autoCompleteTennisScore(5, null)).toBe(7);
  });

  it('should auto-complete 6 as 6-4', () => {
    expect(autoCompleteTennisScore(6, null)).toBe(4);
  });

  it('should auto-complete 7 as 7-5', () => {
    expect(autoCompleteTennisScore(7, null)).toBe(5);
  });

  it('should handle 6-6 tiebreak scenario', () => {
    expect(autoCompleteTennisScore(6, 6)).toBe(6);
  });

  it('should not overwrite existing valid opponent score', () => {
    expect(autoCompleteTennisScore(6, 4)).toBe(4);
    expect(autoCompleteTennisScore(7, 5)).toBe(5);
  });
});

describe('Table Tennis Auto-Complete', () => {
  it('should auto-complete losing scores (0-9)', () => {
    expect(autoCompleteTableTennisScore(0, null)).toBe(11);
    expect(autoCompleteTableTennisScore(5, null)).toBe(11);
    expect(autoCompleteTableTennisScore(9, null)).toBe(11);
  });

  it('should auto-complete 10 as 10-12 (deuce loss)', () => {
    expect(autoCompleteTableTennisScore(10, null)).toBe(12);
  });

  it('should auto-complete 11 as 11-9 (standard win)', () => {
    expect(autoCompleteTableTennisScore(11, null)).toBe(9);
  });

  it('should auto-complete 12 as 12-10 (deuce win)', () => {
    expect(autoCompleteTableTennisScore(12, null)).toBe(10);
  });

  it('should handle extended deuce scenarios', () => {
    expect(autoCompleteTableTennisScore(13, null)).toBe(11);
    expect(autoCompleteTableTennisScore(14, null)).toBe(12);
    expect(autoCompleteTableTennisScore(15, null)).toBe(13);
  });

  it('should not overwrite existing opponent score', () => {
    expect(autoCompleteTableTennisScore(11, 8)).toBe(8);
  });
});

describe('Badminton Auto-Complete', () => {
  it('should auto-complete losing scores (0-19)', () => {
    expect(autoCompleteBadmintonScore(0, null)).toBe(21);
    expect(autoCompleteBadmintonScore(10, null)).toBe(21);
    expect(autoCompleteBadmintonScore(19, null)).toBe(21);
  });

  it('should auto-complete 20 as 20-22 (deuce loss)', () => {
    expect(autoCompleteBadmintonScore(20, null)).toBe(22);
  });

  it('should auto-complete 21 as 21-19 (standard win)', () => {
    expect(autoCompleteBadmintonScore(21, null)).toBe(19);
  });

  it('should auto-complete 22 as 22-20 (deuce win)', () => {
    expect(autoCompleteBadmintonScore(22, null)).toBe(20);
  });

  it('should handle extended deuce scenarios', () => {
    expect(autoCompleteBadmintonScore(23, null)).toBe(21);
    expect(autoCompleteBadmintonScore(25, null)).toBe(23);
    expect(autoCompleteBadmintonScore(28, null)).toBe(26);
  });

  it('should cap at 30 points', () => {
    expect(autoCompleteBadmintonScore(30, null)).toBe(29);
  });

  it('should not overwrite existing opponent score', () => {
    expect(autoCompleteBadmintonScore(21, 15)).toBe(15);
  });
});

describe('Squash Auto-Complete', () => {
  it('should use same logic as table tennis', () => {
    expect(autoCompleteSquashScore(0, null)).toBe(11);
    expect(autoCompleteSquashScore(9, null)).toBe(11);
    expect(autoCompleteSquashScore(10, null)).toBe(12);
    expect(autoCompleteSquashScore(11, null)).toBe(9);
    expect(autoCompleteSquashScore(12, null)).toBe(10);
  });
});

describe('Pickleball Auto-Complete', () => {
  describe('Games to 11', () => {
    it('should auto-complete losing scores (0-9)', () => {
      expect(autoCompletePickleballScore(0, null, 11)).toBe(11);
      expect(autoCompletePickleballScore(5, null, 11)).toBe(11);
      expect(autoCompletePickleballScore(9, null, 11)).toBe(11);
    });

    it('should auto-complete 10 as 10-12 (deuce loss)', () => {
      expect(autoCompletePickleballScore(10, null, 11)).toBe(12);
    });

    it('should auto-complete 11 as 11-9 (standard win)', () => {
      expect(autoCompletePickleballScore(11, null, 11)).toBe(9);
    });

    it('should auto-complete 12 as 12-10 (deuce win)', () => {
      expect(autoCompletePickleballScore(12, null, 11)).toBe(10);
    });
  });

  describe('Games to 15', () => {
    it('should auto-complete losing scores (0-13)', () => {
      expect(autoCompletePickleballScore(0, null, 15)).toBe(15);
      expect(autoCompletePickleballScore(13, null, 15)).toBe(15);
    });

    it('should auto-complete 14 as 14-16 (deuce loss)', () => {
      expect(autoCompletePickleballScore(14, null, 15)).toBe(16);
    });

    it('should auto-complete 15 as 15-13 (standard win)', () => {
      expect(autoCompletePickleballScore(15, null, 15)).toBe(13);
    });

    it('should auto-complete 16 as 16-14 (deuce win)', () => {
      expect(autoCompletePickleballScore(16, null, 15)).toBe(14);
    });
  });

  describe('Games to 21', () => {
    it('should auto-complete losing scores (0-19)', () => {
      expect(autoCompletePickleballScore(0, null, 21)).toBe(21);
      expect(autoCompletePickleballScore(19, null, 21)).toBe(21);
    });

    it('should auto-complete 20 as 20-22 (deuce loss)', () => {
      expect(autoCompletePickleballScore(20, null, 21)).toBe(22);
    });

    it('should auto-complete 21 as 21-19 (standard win)', () => {
      expect(autoCompletePickleballScore(21, null, 21)).toBe(19);
    });

    it('should auto-complete 22 as 22-20 (deuce win)', () => {
      expect(autoCompletePickleballScore(22, null, 21)).toBe(20);
    });
  });
});

describe('Tiebreak Auto-Complete', () => {
  describe('Standard Tiebreak (to 7)', () => {
    it('should auto-complete losing scores (0-5)', () => {
      expect(autoCompleteTiebreakScore(0, null, false)).toBe(7);
      expect(autoCompleteTiebreakScore(3, null, false)).toBe(7);
      expect(autoCompleteTiebreakScore(5, null, false)).toBe(7);
    });

    it('should auto-complete 6 as 6-8 (deuce loss)', () => {
      expect(autoCompleteTiebreakScore(6, null, false)).toBe(8);
    });

    it('should auto-complete 7 as 7-5 (standard win)', () => {
      expect(autoCompleteTiebreakScore(7, null, false)).toBe(5);
    });

    it('should auto-complete 8 as 8-6 (deuce win)', () => {
      expect(autoCompleteTiebreakScore(8, null, false)).toBe(6);
    });

    it('should handle extended deuce scenarios', () => {
      expect(autoCompleteTiebreakScore(10, null, false)).toBe(8);
      expect(autoCompleteTiebreakScore(12, null, false)).toBe(10);
    });
  });

  describe('Match Tiebreak (to 10)', () => {
    it('should auto-complete losing scores (0-8)', () => {
      expect(autoCompleteTiebreakScore(0, null, true)).toBe(10);
      expect(autoCompleteTiebreakScore(5, null, true)).toBe(10);
      expect(autoCompleteTiebreakScore(8, null, true)).toBe(10);
    });

    it('should auto-complete 9 as 9-11 (deuce loss)', () => {
      expect(autoCompleteTiebreakScore(9, null, true)).toBe(11);
    });

    it('should auto-complete 10 as 10-8 (standard win)', () => {
      expect(autoCompleteTiebreakScore(10, null, true)).toBe(8);
    });

    it('should auto-complete 11 as 11-9 (deuce win)', () => {
      expect(autoCompleteTiebreakScore(11, null, true)).toBe(9);
    });

    it('should handle extended deuce scenarios', () => {
      expect(autoCompleteTiebreakScore(13, null, true)).toBe(11);
      expect(autoCompleteTiebreakScore(15, null, true)).toBe(13);
    });
  });

  it('should not overwrite existing opponent score', () => {
    expect(autoCompleteTiebreakScore(7, 3, false)).toBe(3);
    expect(autoCompleteTiebreakScore(10, 5, true)).toBe(5);
  });
});

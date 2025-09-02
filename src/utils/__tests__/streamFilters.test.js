import { filterActiveRecentStreams, filterStreamsByDuration } from '../streamFilters';

// Mock console.log to avoid noise in tests
console.log = jest.fn();

describe('streamFilters', () => {
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - (2 * 60 * 60 * 1000));
  const fiveHoursAgo = new Date(now.getTime() - (5 * 60 * 60 * 1000));
  const sixHoursAgo = new Date(now.getTime() - (6 * 60 * 60 * 1000));

  const mockStreams = [
    {
      _id: '1',
      channelId: 'channel1',
      isLive: true,
      startedAt: twoHoursAgo.toISOString(),
      endedAt: null,
      astrologerId: { _id: 'astro1', name: 'Test Astrologer 1' }
    },
    {
      _id: '2',
      channelId: 'channel2',
      isLive: true,
      startedAt: fiveHoursAgo.toISOString(),
      endedAt: null,
      astrologerId: { _id: 'astro2', name: 'Test Astrologer 2' }
    },
    {
      _id: '3',
      channelId: 'channel3',
      isLive: false,
      startedAt: twoHoursAgo.toISOString(),
      endedAt: null,
      astrologerId: { _id: 'astro3', name: 'Test Astrologer 3' }
    },
    {
      _id: '4',
      channelId: 'channel4',
      isLive: true,
      startedAt: twoHoursAgo.toISOString(),
      endedAt: now.toISOString(),
      astrologerId: { _id: 'astro4', name: 'Test Astrologer 4' }
    },
    {
      _id: '5',
      channelId: 'channel5',
      isLive: true,
      startedAt: null, // No start time
      endedAt: null,
      astrologerId: { _id: 'astro5', name: 'Test Astrologer 5' }
    }
  ];

  describe('filterStreamsByDuration', () => {
    it('should return empty array for null/undefined input', () => {
      expect(filterStreamsByDuration(null)).toEqual([]);
      expect(filterStreamsByDuration(undefined)).toEqual([]);
      expect(filterStreamsByDuration([])).toEqual([]);
    });

    it('should filter streams within 4 hours', () => {
      const result = filterStreamsByDuration(mockStreams);
      expect(result).toHaveLength(3); // streams 1, 3, and 4 have startedAt within 4 hours
      expect(result.map(s => s._id)).toContain('1');
      expect(result.map(s => s._id)).toContain('3');
      expect(result.map(s => s._id)).toContain('4');
      expect(result.map(s => s._id)).not.toContain('2'); // 5 hours old
      expect(result.map(s => s._id)).not.toContain('5'); // no startedAt
    });

    it('should exclude streams without startedAt timestamp', () => {
      const streamsWithoutTimestamp = [
        {
          _id: '1',
          channelId: 'channel1',
          isLive: true,
          startedAt: null,
          astrologerId: { _id: 'astro1' }
        }
      ];

      const result = filterStreamsByDuration(streamsWithoutTimestamp);
      expect(result).toHaveLength(0);
    });
  });

  describe('filterActiveRecentStreams', () => {
    it('should return empty array for null/undefined input', () => {
      expect(filterActiveRecentStreams(null)).toEqual([]);
      expect(filterActiveRecentStreams(undefined)).toEqual([]);
      expect(filterActiveRecentStreams([])).toEqual([]);
    });

    it('should filter streams that are live, not ended, and within 4 hours', () => {
      const result = filterActiveRecentStreams(mockStreams);
      expect(result).toHaveLength(1); // Only stream 1 meets all criteria
      expect(result[0]._id).toBe('1');
    });

    it('should exclude streams that are not live', () => {
      const result = filterActiveRecentStreams(mockStreams);
      expect(result.map(s => s._id)).not.toContain('3'); // isLive: false
    });

    it('should exclude streams that are older than 4 hours', () => {
      const result = filterActiveRecentStreams(mockStreams);
      expect(result.map(s => s._id)).not.toContain('2'); // 5 hours old
    });

    it('should exclude streams that have ended', () => {
      const result = filterActiveRecentStreams(mockStreams);
      expect(result.map(s => s._id)).not.toContain('4'); // has endedAt
    });

    it('should exclude streams without startedAt timestamp', () => {
      const result = filterActiveRecentStreams(mockStreams);
      expect(result.map(s => s._id)).not.toContain('5'); // no startedAt
    });

    it('should handle streams with endedAt in the future', () => {
      const futureTime = new Date(now.getTime() + (1 * 60 * 60 * 1000)); // 1 hour from now
      const streamsWithFutureEnd = [
        {
          _id: '1',
          channelId: 'channel1',
          isLive: true,
          startedAt: twoHoursAgo.toISOString(),
          endedAt: futureTime.toISOString(),
          astrologerId: { _id: 'astro1' }
        }
      ];

      const result = filterActiveRecentStreams(streamsWithFutureEnd);
      expect(result).toHaveLength(1); // Should include stream with future endedAt
    });
  });

  describe('edge cases', () => {
    it('should handle streams with exactly 4 hours duration', () => {
      const fourHoursAgo = new Date(now.getTime() - (4 * 60 * 60 * 1000));
      const streamAtBoundary = [
        {
          _id: '1',
          channelId: 'channel1',
          isLive: true,
          startedAt: fourHoursAgo.toISOString(),
          endedAt: null,
          astrologerId: { _id: 'astro1' }
        }
      ];

      const result = filterActiveRecentStreams(streamAtBoundary);
      // The stream started exactly 4 hours ago should be excluded
      // since we're checking for > fourHoursAgo
      expect(result).toHaveLength(0);
    });

    it('should handle invalid date strings', () => {
      const streamsWithInvalidDates = [
        {
          _id: '1',
          channelId: 'channel1',
          isLive: true,
          startedAt: 'invalid-date',
          endedAt: null,
          astrologerId: { _id: 'astro1' }
        }
      ];

      const result = filterActiveRecentStreams(streamsWithInvalidDates);
      expect(result).toHaveLength(0); // Should exclude streams with invalid dates
    });
  });
});

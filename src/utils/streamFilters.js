/**
 * Utility functions for filtering streams
 */

/**
 * Filter streams that are less than 4 hours old
 * @param {Array} streams - Array of stream objects
 * @returns {Array} - Filtered array of streams less than 4 hours old
 */
export const filterStreamsByDuration = (streams) => {
  if (!streams || !Array.isArray(streams)) {
    return [];
  }

  const fourHoursAgo = new Date(Date.now() - (4 * 60 * 60 * 1000)); // 4 hours in milliseconds
  
  return streams.filter(stream => {
    // Check if stream has a startedAt timestamp
    if (!stream.startedAt) {
      // If no startedAt timestamp, we might want to include or exclude based on requirements
      // For safety, we'll exclude streams without timestamps
      console.log(`Stream ${stream.channelId || stream._id} has no startedAt timestamp, excluding from results`);
      return false;
    }
    
    const streamStartTime = new Date(stream.startedAt);
    const isWithinFourHours = streamStartTime > fourHoursAgo;
    
    if (!isWithinFourHours) {
      console.log(`Stream ${stream.channelId || stream._id} started at ${streamStartTime.toISOString()} (older than 4 hours), excluding from results`);
    }
    
    return isWithinFourHours;
  });
};

/**
 * Filter streams by active status and duration (less than 4 hours old)
 * @param {Array} streams - Array of stream objects
 * @returns {Array} - Filtered array of active streams less than 4 hours old
 */
export const filterActiveRecentStreams = (streams) => {
  if (!streams || !Array.isArray(streams)) {
    return [];
  }

  const currentTime = new Date();
  const fourHoursAgo = new Date(Date.now() - (4 * 60 * 60 * 1000)); // 4 hours in milliseconds
  
  return streams.filter(stream => {
    // Check if stream is active (live and not ended)
    const isLive = stream.isLive === true;
    const isNotEnded = !stream.endedAt || new Date(stream.endedAt) > currentTime;
    
    // Check if stream is within 4 hours
    const streamStartTime = stream.startedAt ? new Date(stream.startedAt) : null;
    const isWithinFourHours = streamStartTime ? streamStartTime > fourHoursAgo : false;
    
    const shouldInclude = isLive && isNotEnded && isWithinFourHours;
    
    if (!shouldInclude) {
      const reason = [];
      if (!isLive) reason.push('not live');
      if (!isNotEnded) reason.push('ended');
      if (!isWithinFourHours) reason.push('older than 4 hours');
      
      console.log(`Stream ${stream.channelId || stream._id} excluded: ${reason.join(', ')}`);
    }
    
    return shouldInclude;
  });
};

# LivePlayer Bug Analysis

## Issues Identified and Code Locations

### 1. LeaveChannel Error
**Location**: `src/screens/LivePlayer.jsx:148`
**Error**: `agoraClientRef.current.leaveChannel().catch is not a function (it is undefined)`
**Problem**: The `leaveChannel()` method might return undefined instead of a Promise
**Code Snippet**:
```javascript
agoraClientRef.current.leaveChannel().catch(err => console.error('Error leaving channel:', err));
```
**Root Cause**: Improper Promise handling on Agora SDK leaveChannel method

### 2. Scroll Bounce Issues
**Location**: `src/screens/LivePlayer.jsx:853-878`
**Problem**: Overscroll detection and bounce handling interferes with normal scrolling
**Code Snippets**:
```javascript
// Lines 858-865: Problematic scroll detection
if (currentScrollY <= 0 && scrollY.current > currentScrollY) {
  if (currentTime - lastScrollTime.current > 1000 && !isLoadingNewStream) {
    fetchNewLiveStreams();
  }
}

// Lines 874-877: Momentum scroll end causing issues
if (contentOffset.y < -50 && !isLoadingNewStream) {
  fetchNewLiveStreams();
}
```
**Root Cause**: Multiple scroll listeners triggering simultaneously

### 3. Second Stream Not Joining
**Location**: `src/screens/LivePlayer.jsx:206-310`
**Problem**: Agora client reuse without proper cleanup between streams
**Code Snippet**:
```javascript
// Lines 211-267: Client initialization without proper state management
if (!agoraClientRef.current) {
  const agoraEngine = createAgoraRtcEngine();
  // ... initialization
}
```
**Root Cause**: Shared client reference between multiple stream instances

### 4. Transition Lag
**Location**: `src/screens/LivePlayer.jsx:771-819`
**Problem**: Multiple async operations during stream switching
**Code Snippets**:
```javascript
// Lines 800-818: Heavy state updates during transition
setStreams(prevStreams => [...newStreams, ...prevStreams]);
setCurrentIndex(prevIndex => prevIndex + newStreams.length);
setTimeout(() => {
  flatListRef.current?.scrollToIndex({ index: 0, animated: true });
  setCurrentIndex(0);
}, 100);
```
**Root Cause**: Sequential state updates and setTimeout delays

## Fixes Applied

### 1. LeaveChannel Error Fix
**Fix**: Added proper Promise checking before calling `.catch()`
```javascript
// Before:
agoraClientRef.current.leaveChannel().catch(err => console.error('Error leaving channel:', err));

// After:
const leaveResult = agoraClientRef.current.leaveChannel();
if (leaveResult && typeof leaveResult.catch === 'function') {
  leaveResult.catch(err => console.error('Error leaving channel:', err));
}
```

### 2. Scroll Bounce Fix
**Fix**: Improved scroll detection logic with better debouncing
```javascript
// Removed conflicting scroll listeners and improved momentum detection
if (contentOffset.y < -100 && 
    velocity && velocity.y > 0 && 
    !isLoadingNewStream && 
    currentTime - lastScrollTime.current > 2000) {
  fetchNewLiveStreams();
}
```

### 3. Stream Joining Fix
**Fix**: Proper Agora client cleanup between stream switches
```javascript
// Always create fresh client to avoid conflicts
if (agoraClientRef.current) {
  const leaveResult = agoraClientRef.current.leaveChannel();
  if (leaveResult && typeof leaveResult.catch === 'function') {
    await leaveResult;
  }
  agoraClientRef.current = null;
}
```

### 4. Transition Lag Fix
**Fix**: Optimized state updates and scroll performance
```javascript
// Batch state updates and use requestAnimationFrame
requestAnimationFrame(() => {
  flatListRef.current?.scrollToIndex({ 
    index: 0, 
    animated: false, // Faster transition
    viewPosition: 0
  });
});
```

## Verification Tests Needed

1. **Test LeaveChannel**: Switch between multiple streams rapidly
2. **Test Scroll Bounce**: Pull down at top of stream list
3. **Test Stream Joining**: Join second stream after first one
4. **Test Transition**: Measure lag when switching streams

## Code Locations for Testing

- LeaveChannel: Lines 148-151, 214-217
- Scroll Logic: Lines 861-874
- Stream Initialization: Lines 211-233
- Transition Performance: Lines 817-841

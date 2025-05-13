/**
 * YouTube Video Tracking using YouTube IFrame API
 */

// Enable logging
const DEBUG = true;

// Helper function for logging
function logDebug(...args) {
  if (DEBUG) {
    console.log('[YouTube Tracking]', ...args);
  }
}

export function setupYouTubeTracking() {
  logDebug('Setting up YouTube tracking');
  
  // Initialize on page load
  if (document.readyState === 'complete') {
    initYouTubeTracking();
  } else {
    window.addEventListener('load', initYouTubeTracking);
  }
  
  // Re-initialize on client-side navigation
  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', () => {
      setTimeout(initYouTubeTracking, 500);
    });
  }
}

/**
 * Initialize tracking for all YouTube embedded videos
 */
async function initYouTubeTracking() {
  // Find all YouTube iframes
  const youtubeIframes = document.querySelectorAll('iframe[src*="youtube.com/embed/"]');
  logDebug(`Found ${youtubeIframes.length} YouTube iframes on the page`);
  
  if (!youtubeIframes.length) return;
  
  // Process each iframe
  for (const iframe of youtubeIframes) {
    // Skip if already processed
    if (iframe.hasAttribute('data-tracking-processed')) {
      continue;
    }
    
    // Get the video ID
    const videoId = getVideoIdFromIframe(iframe);
    if (!videoId) {
      logDebug(`Couldn't extract video ID from iframe, skipping`);
      continue;
    }
    
    logDebug(`Processing iframe for video ${videoId}`);
    
    try {
      // Fetch accurate title using oEmbed
      const videoTitle = await fetchVideoTitle(videoId);
      logDebug(`Fetched title for ${videoId}: "${videoTitle}"`);
      
      // Update iframe title attribute for accessibility
      if (!iframe.title || iframe.title === 'YouTube video player') {
        iframe.title = videoTitle;
      }
      
      // Ensure iframe has an ID for the YouTube API
      if (!iframe.id) {
        iframe.id = 'youtube-player-' + videoId;
      }
      
      // Store video metadata for use in event tracking
      iframe.dataset.videoId = videoId;
      iframe.dataset.videoTitle = videoTitle;
      
      // Modify the iframe src to enable the API
      let src = iframe.src;
      if (src.indexOf('enablejsapi=1') === -1) {
        src += (src.indexOf('?') === -1 ? '?' : '&') + 'enablejsapi=1&origin=' + window.location.origin;
        iframe.src = src;
      }
      
      // Mark as processed
      iframe.setAttribute('data-tracking-processed', 'true');
      
    } catch (error) {
      logDebug(`Error processing video ${videoId}:`, error);
    }
  }
  
  // Load the YouTube iframe API if not already loaded
  if (!window.YT && !document.querySelector('script[src*="youtube.com/iframe_api"]')) {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  // Setup the YouTube iframe API callback
  window.onYouTubeIframeAPIReady = setupYouTubePlayers;
  
  // If API is already loaded, set up players immediately
  if (window.YT && window.YT.Player) {
    setupYouTubePlayers();
  }
}

/**
 * Set up tracking for all YouTube players on the page
 */
function setupYouTubePlayers() {
  const youtubeIframes = document.querySelectorAll('iframe[src*="youtube.com/embed/"][data-tracking-processed="true"]');
  
  youtubeIframes.forEach((iframe) => {
    if (iframe.hasAttribute('data-player-initialized')) {
      return;
    }
    
    const videoId = iframe.dataset.videoId;
    const videoTitle = iframe.dataset.videoTitle;
    
    if (!videoId) return;
    
    // Track event helper function
    const trackEvent = function(eventName) {
      // Prepare the data object that will be sent
      const eventData = {
        videoId: videoId,
        videoTitle: videoTitle,
        pagePath: window.location.pathname,
        isTest: 'testing'
      };
      
      // Log the complete data being sent
      logDebug(`Attempting to track ${eventName} with data:`, {
        eventName: eventName,
        eventData: eventData,
        umamiAvailable: !!window.umami,
        umamiTrackFunction: window.umami ? typeof window.umami.track : 'undefined'
      });
      
      // Check if umami is available and has the track function
      if (window.umami && typeof window.umami.track === 'function') {
        try {
          // Track the event
          window.umami.track(eventName, { test: 'isTest' });
          logDebug(`✅ Successfully called umami.track() for ${eventName}`);
        } catch (error) {
          logDebug(`❌ Error tracking ${eventName}:`, error);
        }
      } else {
        logDebug(`❌ Umami not available or track function missing, can't track ${eventName}`);
      }
      
      // Also log the values individually for clarity
      logDebug(`Event values being sent:
        - Event name: ${eventName}
        - Video ID: ${videoId}
        - Video title: ${videoTitle}
        - Page path: ${window.location.pathname}
        - Section: ${getCurrentDocSection()}
      `);
    };
    
    // Store last state to avoid duplicate events
    let lastState = -1;
    
    // Mark as initialized to avoid duplicate players
    iframe.setAttribute('data-player-initialized', 'true');
    
    try {
      new window.YT.Player(iframe.id, {
        events: {
          'onReady': function() {
            logDebug(`Player ready for video: ${videoTitle}`);
          },
          'onStateChange': function(event) {
            // Avoid duplicating events if state hasn't changed
            if (event.data === lastState) return;
            lastState = event.data;
            
            // Track different player states
            if (event.data === window.YT.PlayerState.PLAYING) {
              trackEvent('video_play');
            } 
            else if (event.data === window.YT.PlayerState.PAUSED) {
              trackEvent('video_pause');
            }
            else if (event.data === window.YT.PlayerState.ENDED) {
              trackEvent('video_complete');
            }
            else if (event.data === window.YT.PlayerState.BUFFERING) {
              logDebug(`Video buffering: ${videoTitle}`);
            }
          },
          'onError': function(event) {
            logDebug(`Error playing video: ${videoTitle}`, event);
          }
        }
      });
    } catch (error) {
      logDebug(`Error initializing YouTube player:`, error);
    }
  });
}

/**
 * Fetch video title using oEmbed API (no API key required)
 */
async function fetchVideoTitle(videoId) {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(videoUrl)}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch title: ${response.status}`);
  }
  
  const data = await response.json();
  return data.title || `YouTube Video ${videoId}`;
}

/**
 * Get the video ID from a YouTube iframe
 */
function getVideoIdFromIframe(iframe) {
  const src = iframe.src;
  const match = src.match(/\/embed\/([^?/]+)/);
  return match ? match[1] : null;
}

/**
 * Helper to identify current documentation section
 */
function getCurrentDocSection() {
  const path = window.location.pathname;
  let section = 'documentation';
  
  // Match URL patterns for specific content sections
  if (path.includes('/tutorials/astro/')) section = 'tutorial-astro';
  else if (path.includes('/tutorials/snippets/')) section = 'tutorial-snippets';
  else if (path.includes('/tutorials/')) section = 'tutorial';
  else if (path.includes('/guide/')) section = 'guide';
  else if (path.includes('/reference/api/')) section = 'api';
  else if (path.includes('/reference/')) section = 'reference';
  
  return section;
}
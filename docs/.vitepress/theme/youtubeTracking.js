// Path: .vitepress/theme/youtube-tracking.js

/**
 * YouTube Video Tracking for VitePress with detailed logging
 */

// Enable detailed logging
const DEBUG = true;

// Helper function for logging
function logDebug(...args) {
  if (DEBUG) {
    console.log('[YouTube Tracking]', ...args);
  }
}

export function setupYouTubeTracking() {
  logDebug('Setting up YouTube tracking');
  
  // Wait for page to be fully loaded
  if (document.readyState === 'complete') {
    logDebug('Document already complete, delaying initialization');
    setTimeout(initYouTubeTracking, 1500);
  } else {
    logDebug('Waiting for document to load');
    window.addEventListener('load', () => {
      logDebug('Document loaded, delaying initialization');
      setTimeout(initYouTubeTracking, 1500);
    });
  }
  
  // For client-side navigation, setup tracking after route changes
  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', () => {
      logDebug('Navigation detected, reinitializing tracking');
      setTimeout(initYouTubeTracking, 1500);
    });
  }
}

// Store video metadata centrally
const videoMetadata = new Map();

/**
 * Initialize tracking for all YouTube embedded videos
 */
function initYouTubeTracking() {
  // Skip if no YouTube videos on the page
  const youtubeIframes = document.querySelectorAll('iframe[src*="youtube.com/embed/"]');
  logDebug(`Found ${youtubeIframes.length} YouTube iframes on the page`);
  
  if (!youtubeIframes.length) return;
  
  // Process all YouTube iframes to collect metadata
  youtubeIframes.forEach((iframe, index) => {
    // Skip if already processed
    if (iframe.hasAttribute('data-tracking-processed')) {
      logDebug(`Iframe #${index} already processed, skipping`);
      return;
    }
    
    // Get the video ID
    const videoId = getVideoIdFromIframe(iframe);
    if (!videoId) {
      logDebug(`Couldn't extract video ID from iframe #${index}, skipping`);
      return;
    }
    
    logDebug(`Processing iframe #${index} for video ${videoId}:`);
    logDebug(`- iframe HTML:`, iframe.outerHTML);
    
    // IMPORTANT: Directly log the title attribute to see its exact value
    const titleAttribute = iframe.getAttribute('title');
    logDebug(`- title attribute: "${titleAttribute}"`);
    
    // Store metadata using the raw title attribute value
    const videoTitle = titleAttribute || `Video ${videoId}`;
    logDebug(`- using title: "${videoTitle}"`);
    
    // Store metadata
    videoMetadata.set(videoId, { id: videoId, title: videoTitle });
    logDebug(`- metadata stored for video ${videoId}`);
    
    // Ensure iframe has an ID
    if (!iframe.id) {
      iframe.id = 'youtube-player-' + index;
      logDebug(`- added ID: ${iframe.id}`);
    }
    
    // Mark as processed
    iframe.setAttribute('data-tracking-processed', 'true');
    logDebug(`- marked as processed`);
    
    // Setup redirect tracking for this iframe
    setupWatchOnYouTubeTracking(iframe, videoId, videoTitle);
    
    // Modify the iframe src to enable the API if needed
    let src = iframe.src;
    if (src.indexOf('enablejsapi=1') === -1) {
      src += (src.indexOf('?') === -1 ? '?' : '&') + 'enablejsapi=1&origin=' + window.location.origin;
      iframe.src = src;
      logDebug(`- updated src to enable API: ${src}`);
    }
  });
  
  // Load the YouTube iframe API if not already loaded
  if (!window.YT && !document.querySelector('script[src*="youtube.com/iframe_api"]')) {
    logDebug('Loading YouTube iframe API script');
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  // Setup the YouTube iframe API callback
  if (typeof window.onYouTubeIframeAPIReady !== 'function') {
    logDebug('Setting up onYouTubeIframeAPIReady callback');
    window.onYouTubeIframeAPIReady = setupYouTubePlayers;
  } else {
    logDebug('Extending existing onYouTubeIframeAPIReady callback');
    const originalCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function() {
      originalCallback();
      setupYouTubePlayers();
    };
  }
  
  // If API is already loaded, set up players immediately
  if (window.YT && window.YT.Player) {
    logDebug('YouTube API already loaded, setting up players immediately');
    setupYouTubePlayers();
  }
}

/**
 * Set up tracking for "Watch on YouTube" button clicks
 */
function setupWatchOnYouTubeTracking(iframe, videoId, videoTitle) {
  logDebug(`Setting up "Watch on YouTube" tracking for video ${videoId}`);
  
  // Use an interval to check for the YouTube logo button
  const checkInterval = setInterval(() => {
    try {
      // Access the iframe's document
      const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDocument) {
        logDebug(`Cannot access iframe content for video ${videoId}, possibly due to security restrictions`);
        return;
      }

      // Look for the YouTube logo button (.ytp-youtube-button)
      const youtubeButton = iframeDocument.querySelector('.ytp-youtube-button');
      if (!youtubeButton) {
        logDebug(`YouTube button not found yet for video ${videoId}`);
        return;
      }

      // Add click event listener if not already added
      if (!youtubeButton.hasAttribute('data-tracking-added')) {
        youtubeButton.setAttribute('data-tracking-added', 'true');
        
        youtubeButton.addEventListener('click', () => {
          logDebug(`"Watch on YouTube" clicked for video ${videoId}`);
          // Track the redirect event
          if (window.umami) {
            logDebug(`Sending Umami event for "Watch on YouTube" with title: "${videoTitle}"`);
            window.umami.track('video_watch_on_youtube', {
              video_id: videoId,
              video_title: videoTitle,
              page_path: window.location.pathname,
              section: getCurrentDocSection()
            });
          } else {
            logDebug('Umami not available, event not tracked');
          }
        });
        
        logDebug(`"Watch on YouTube" tracking set up successfully for video ${videoId}`);
        clearInterval(checkInterval);
      }
    } catch (error) {
      // Security policies might prevent accessing iframe content
      logDebug(`Error setting up "Watch on YouTube" tracking:`, error);
      clearInterval(checkInterval);
    }
  }, 1000);
  
  // Clear interval after 10 seconds to prevent infinite checking
  setTimeout(() => clearInterval(checkInterval), 10000);
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
 * Set up tracking for all YouTube players on the page
 */
function setupYouTubePlayers() {
  logDebug('Setting up YouTube players');
  const youtubeIframes = document.querySelectorAll('iframe[src*="youtube.com/embed/"]');
  
  youtubeIframes.forEach((iframe, index) => {
    // Skip if player already set up
    if (iframe.hasAttribute('data-player-initialized')) {
      logDebug(`Player #${index} already initialized, skipping`);
      return;
    }
    
    // Get the video ID
    const videoId = getVideoIdFromIframe(iframe);
    if (!videoId) {
      logDebug(`Couldn't extract video ID from player #${index}, skipping`);
      return;
    }
    
    logDebug(`Initializing player #${index} for video ${videoId}`);
    
    // Double-check that we have the correct title in metadata
    if (videoMetadata.has(videoId)) {
      const storedTitle = videoMetadata.get(videoId).title;
      const currentTitle = iframe.getAttribute('title');
      
      logDebug(`Stored title for ${videoId}: "${storedTitle}"`);
      logDebug(`Current iframe title: "${currentTitle}"`);
      
      // If the iframe title has changed or is now available, update our metadata
      if (currentTitle && currentTitle !== 'YouTube video player' && currentTitle !== storedTitle) {
        logDebug(`Updating title for ${videoId} from "${storedTitle}" to "${currentTitle}"`);
        videoMetadata.set(videoId, { id: videoId, title: currentTitle });
      }
    } else {
      // If we don't have metadata yet, create it now
      const currentTitle = iframe.getAttribute('title') || `Video ${videoId}`;
      logDebug(`No metadata found for ${videoId}, creating with title: "${currentTitle}"`);
      videoMetadata.set(videoId, { id: videoId, title: currentTitle });
    }
    
    // Mark as initialized
    iframe.setAttribute('data-player-initialized', 'true');
    
    try {
      logDebug(`Creating YouTube player for ${videoId}`);
      // eslint-disable-next-line no-new
      new window.YT.Player(iframe.id, {
        events: {
          'onReady': function() {
            logDebug(`Player ready for video ${videoId}`);
          },
          'onStateChange': function(event) {
            // Get the stored metadata
            const metadata = videoMetadata.get(videoId);
            const videoTitle = metadata?.title || iframe.getAttribute('title') || `Video ${videoId}`;
            
            logDebug(`State change for ${videoId} to state ${event.data}`);
            logDebug(`Using title for event: "${videoTitle}"`);
            
            // Track play event
            if (event.data === window.YT.PlayerState.PLAYING) {
              trackYouTubeEvent('video_play', videoId, videoTitle);
            }
            // Track pause event
            else if (event.data === window.YT.PlayerState.PAUSED) {
              trackYouTubeEvent('video_pause', videoId, videoTitle);
            }
            // Track video end
            else if (event.data === window.YT.PlayerState.ENDED) {
              trackYouTubeEvent('video_complete', videoId, videoTitle);
            }
          }
        }
      });
    } catch (error) {
      logDebug(`Error initializing YouTube player:`, error);
    }
  });
}

/**
 * Tracks YouTube video events in Umami
 */
function trackYouTubeEvent(action, videoId, videoTitle) {
  logDebug(`Tracking ${action} for video ${videoId} with title: "${videoTitle}"`);
  
  if (window.umami) {
    logDebug(`Sending Umami event: ${action}`);
    window.umami.track(action, {
      video_id: videoId,
      video_title: videoTitle,
      page_path: window.location.pathname,
      section: getCurrentDocSection()
    });
  } else {
    logDebug('Umami not available, event not tracked');
  }
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
  
  logDebug(`Detected section: ${section} for path: ${path}`);
  return section;
}
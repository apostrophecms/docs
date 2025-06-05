/**
 * YouTube Video Tracking using YouTube IFrame API
 * Tracks video interactions including play, pause, progress,
 * completion, and "Watch on YouTube" clicks
 */

const shouldDebug = false; // Set to true for development debugging

// Helper function for logging
function logDebug(...args) {
  if (shouldDebug) {
    console.log('%c[YouTube Tracking]', 'color: #4285f4; font-weight: bold;', ...args);
  }
}

export function setupYouTubeTracking() {
  logDebug('Setting up YouTube tracking');

  // Initialize on page load
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
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

  if (!youtubeIframes.length) {
    return;
  }

  // Process each iframe
  for (const iframe of youtubeIframes) {
    // Skip if already processed
    if (iframe.hasAttribute('data-tracking-processed')) {
      continue;
    }

    // Get the video ID
    const videoId = getVideoIdFromIframe(iframe);
    if (!videoId) {
      logDebug('Could not extract video ID from iframe, skipping');
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
        iframe.id = `youtube-player-${videoId}-${Date.now()}`;
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
    loadYouTubeAPI();
  }

  // Setup the YouTube iframe API callback
  window.onYouTubeIframeAPIReady = setupYouTubePlayers;

  // If API is already loaded, set up players immediately
  if (window.YT && window.YT.Player) {
    setupYouTubePlayers();
  }
}

/**
 * Load the YouTube IFrame API
 */
function loadYouTubeAPI() {
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  logDebug('YouTube IFrame API script loaded');
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

    if (!videoId) {
      return;
    }

    // Setup watch on YouTube tracking
    setupWatchOnYouTubeTracking(iframe, videoId, videoTitle);

    // Track event helper function
    const trackEvent = function (eventName, additionalData = {}) {
      const eventData = {
        videoId,
        videoTitle,
        pagePath: window.location.pathname,
        section: getCurrentDocSection(),
        ...additionalData
      };

      logDebug(`Tracking ${eventName}:`, eventData);

      if (window.umami && typeof window.umami.track === 'function') {
        try {
          window.umami.track(eventName, eventData);
          logDebug(`✅ Successfully tracked ${eventName}`);
        } catch (error) {
          logDebug(`❌ Error tracking ${eventName}:`, error);
        }
      } else {
        logDebug(`❌ Umami not available, can't track ${eventName}`);
      }
    };

    // Store tracking state to avoid duplicate events
    const trackingState = {
      lastState: -1,
      videoLoaded: false,
      quartiles: {
        25: false,
        50: false,
        75: false
      }
    };

    // Mark as initialized to avoid duplicate players
    iframe.setAttribute('data-player-initialized', 'true');

    try {
      // Create player instance and store it
      const player = new window.YT.Player(iframe.id, {
        events: {
          onReady: function (event) {
            logDebug(`Player ready for video: ${videoTitle}`);
            trackingState.videoLoaded = true;
          },
          onStateChange: function (event) {
            const player = event.target;

            // Avoid duplicating events if state hasn't changed
            if (event.data === trackingState.lastState) {
              return;
            }
            trackingState.lastState = event.data;

            // Track different player states
            if (event.data === window.YT.PlayerState.PLAYING) {
              trackEvent('video_play', {
                duration: player.getDuration(),
                currentTime: player.getCurrentTime()
              });

              // Set up progress tracking
              trackingState.progressInterval = setInterval(() => {
                const isPlayerAvailable = !!player;
                const isCurrentlyPlaying = isPlayerAvailable &&
                  player.getPlayerState() === window.YT.PlayerState.PLAYING;

                if (!isCurrentlyPlaying) {
                  clearInterval(trackingState.progressInterval);
                  return;
                }

                const duration = player.getDuration();
                const currentTime = player.getCurrentTime();
                const percent = Math.floor((currentTime / duration) * 100);

                // Track quartiles
                if (percent >= 25 && !trackingState.quartiles[25]) {
                  trackingState.quartiles[25] = true;
                  trackEvent('video_progress', { percent: 25 });
                }
                if (percent >= 50 && !trackingState.quartiles[50]) {
                  trackingState.quartiles[50] = true;
                  trackEvent('video_progress', { percent: 50 });
                }
                if (percent >= 75 && !trackingState.quartiles[75]) {
                  trackingState.quartiles[75] = true;
                  trackEvent('video_progress', { percent: 75 });
                }
              }, 5000);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              // Clear any existing interval
              if (trackingState.progressInterval) {
                clearInterval(trackingState.progressInterval);
              }

              trackEvent('video_pause', {
                duration: player.getDuration(),
                currentTime: player.getCurrentTime(),
                percent: Math.floor(
                  (player.getCurrentTime() / player.getDuration()) * 100
                )
              });
            } else if (event.data === window.YT.PlayerState.ENDED) {
              // Clear any existing interval
              if (trackingState.progressInterval) {
                clearInterval(trackingState.progressInterval);
              }

              trackEvent('video_complete');
            }
          },
          onError: function (event) {
            logDebug(`Error playing video: ${videoTitle}`, event);
            trackEvent('video_error', { errorCode: event.data });
          }
        }
      });

      // Store player instance in iframe data for potential future reference
      iframe.ytPlayer = player;
    } catch (error) {
      logDebug('Error initializing YouTube player:', error);
    }
  });
}

/**
 * Setup tracking for "Watch on YouTube" clicks
 * Uses focus detection to identify when users click
 * the YouTube logo to navigate to YouTube
 */
function setupWatchOnYouTubeTracking(iframe, videoId, videoTitle) {
  logDebug('Setting up "Watch on YouTube" tracking');

  const trackYouTubeLogoClick = () => {
    if (window.umami && typeof window.umami.track === 'function') {
      try {
        window.umami.track('watch_on_youtube', {
          videoId,
          videoTitle,
          pagePath: window.location.pathname,
          section: getCurrentDocSection()
        });
        logDebug(`✅ Tracked watch_on_youtube for ${videoTitle}`);
      } catch (error) {
        logDebug('❌ Error tracking watch_on_youtube:', error);
      }
    }
  };

  const container = iframe.parentElement;
  let isHovered = false;

  // Track when mouse enters/leaves the YouTube container
  container.addEventListener('mouseenter', () => {
    isHovered = true;
    logDebug('Mouse entered YouTube container');
  });

  container.addEventListener('mouseleave', () => {
    isHovered = false;
    logDebug('Mouse left YouTube container');
  });

  // Detect focus loss while hovering (indicates YouTube logo click)
  window.addEventListener('blur', () => {
    if (isHovered) {
      logDebug('Window blur while YouTube hovered - tracking logo click');
      trackYouTubeLogoClick();
    }
  });

  // Detect page visibility change while hovering (alternative detection method)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && isHovered) {
      logDebug('Page hidden while YouTube hovered - tracking logo click');
      trackYouTubeLogoClick();
    }
  });
}

/**
 * Fetch video title using oEmbed API (no API key required)
 */
async function fetchVideoTitle(videoId) {
  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(videoUrl)}`, {
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch title: ${response.status}`);
    }

    const data = await response.json();
    return data.title || `YouTube Video ${videoId}`;
  } catch (error) {
    logDebug(`Error fetching video title: ${error.message}`);
    return `YouTube Video ${videoId}`;
  }
}

/**
 * Get the video ID from a YouTube iframe
 */
function getVideoIdFromIframe(iframe) {
  const src = iframe.src;
  // Handle both standard and shortened YouTube URLs
  const standardMatch = src.match(/\/embed\/([^?/]+)/);
  const shortMatch = src.match(/\/youtu\.be\/([^?/]+)/);

  return standardMatch ? standardMatch[1] : shortMatch ? shortMatch[1] : null;
}

/**
 * Helper to identify current documentation section
 */
function getCurrentDocSection() {
  const path = window.location.pathname;

  // Map of URL patterns to section names
  const sectionPatterns = [
    {
      pattern: /\/tutorials\/astro\//,
      section: 'tutorial-astro'
    },
    {
      pattern: /\/tutorials\/snippets\//,
      section: 'tutorial-snippets'
    },
    {
      pattern: /\/tutorials\//,
      section: 'tutorial'
    },
    {
      pattern: /\/guide\//,
      section: 'guide'
    },
    {
      pattern: /\/reference\/api\//,
      section: 'api'
    },
    {
      pattern: /\/reference\//,
      section: 'reference'
    }
  ];

  // Find matching section or return default
  const match = sectionPatterns.find(item => item.pattern.test(path));
  return match ? match.section : 'documentation';
};

/**
 * YouTube Video Tracking using YouTube IFrame API
 */

const shouldDebug = true;

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
      // Prepare the data object that will be sent
      const eventData = {
        videoId,
        videoTitle,
        pagePath: window.location.pathname,
        section: getCurrentDocSection(),
        ...additionalData
      };

      // Log the complete data being sent
      logDebug(`Tracking ${eventName}:`, eventData);

      // Check if umami is available and has the track function
      if (window.umami && typeof window.umami.track === 'function') {
        try {
          // Track the event
          window.umami.track(eventName, eventData);
          logDebug(`✅ Successfully tracked ${eventName}`);
        } catch (error) {
          logDebug(`❌ Error tracking ${eventName}:`, error);
        }
      } else {
        logDebug(`❌ Umami not available or track function missing, can't track ${eventName}`);
      }
    };

    // Store tracking state to avoid duplicate events
    const trackingState = {
      lastState: -1,
      videoLoaded: false,
      playedSeconds: 0,
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
                // eslint-disable-next-line max-len
                percent: Math.floor((player.getCurrentTime() / player.getDuration()) * 100)
              });
            }
            else if (event.data === window.YT.PlayerState.ENDED) {
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
 * This uses a MutationObserver to detect when YouTube adds the logo button
 */
function setupWatchOnYouTubeTracking(iframe, videoId, videoTitle) {
  // Get iframe parent container
  const container = iframe;
  logDebug('Setting up YouTube tracking for container:', container);

  if (!container) {
    logDebug('No container found for iframe, aborting setup');
    return;
  }

  // Create a function to track YouTube logo clicks
  const trackYouTubeLogoClick = () => {
    logDebug('trackYouTubeLogoClick function called');
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
    } else {
      logDebug('Umami tracking not available');
    }
  };

  // Helper to find YouTube button from click target
  function findYouTubeButton(element) {
    logDebug('Checking if element is a YouTube button:', element);
    // Check if element or any parent has the YouTube logo class
    let current = element;
    const maxDepth = 5; // Prevent infinite loop
    let depth = 0;

    while (current && depth < maxDepth) {
      // Log what we're checking
      logDebug(`Checking element at depth ${depth}:`, current);
      logDebug(`- classList:`, current.classList?.toString());
      logDebug(`- aria-label:`, current.getAttribute('aria-label'));
      logDebug(`- href:`, current.href);
      
      // Check for YouTube button classes
      if (
        current.classList?.contains('ytp-youtube-button') ||
        current.classList?.contains('ytp-title-link') ||
        current.getAttribute('aria-label') === 'YouTube' ||
        current.href?.includes('youtube.com/watch')
      ) {
        logDebug('Found YouTube button:', current);
        return current;
      }
      current = current.parentElement;
      depth++;
    }
    logDebug('No YouTube button found in path');
    return null;
  }

  // Setup click handler (existing approach)
  logDebug('Adding click event listener to container');
  container.addEventListener('click', (event) => {
    logDebug('Container click detected:', event.target);
    const target = event.target;
    const ytLogoButton = findYouTubeButton(target);

    if (ytLogoButton) {
      logDebug('YouTube logo button clicked via container event delegation');
      trackYouTubeLogoClick();
    } else {
      logDebug('Click was not on YouTube logo button');
    }
  });

  // Check if MutationObserver is available
  if (typeof MutationObserver === 'undefined') {
    logDebug('⚠️ MutationObserver is not defined in this environment');
    return; // Exit early if MutationObserver is not available
  }

  logDebug('MutationObserver is available, setting up observer');

  try {
    // Add MutationObserver to detect when YouTube adds the logo button
    const observer = new MutationObserver((mutations) => {
      logDebug(`Mutation observed: ${mutations.length} changes`, mutations);
      
      // Look for YouTube logo button in the container
      const logoButton = container.querySelector('.ytp-youtube-button');
      const titleLink = container.querySelector('.ytp-title-link');
      
      logDebug('Search results - Logo button:', logoButton, 'Title link:', titleLink);
    
      // If found, add direct click handlers and disconnect observer
      if (logoButton) {
        logDebug('Found YouTube logo button, adding direct click handler');
        logoButton.addEventListener('click', () => {
          logDebug('YouTube logo button clicked (direct handler)');
          trackYouTubeLogoClick();
        });
        observer.disconnect();
        logDebug('Observer disconnected after finding logo button');
      }
      
      if (titleLink) {
        logDebug('Found YouTube title link, adding direct click handler');
        titleLink.addEventListener('click', () => {
          logDebug('YouTube title link clicked (direct handler)');
          trackYouTubeLogoClick();
        });
        observer.disconnect();
        logDebug('Observer disconnected after finding title link');
      }
    });
    
    // Start observing with a configuration that watches for child nodes
    logDebug('Starting observation of container');
    observer.observe(container, { 
      childList: true,
      subtree: true 
    });
    logDebug('Observer setup complete');
  } catch (error) {
    logDebug('⚠️ Error setting up MutationObserver:', error);
  }
  
  // Also try to find buttons immediately (they might already be there)
  logDebug('Checking if YouTube buttons already exist');
  const existingLogoButton = container.querySelector('.ytp-youtube-button');
  const existingTitleLink = container.querySelector('.ytp-title-link');
  
  if (existingLogoButton) {
    logDebug('YouTube logo button already exists, adding click handler');
    existingLogoButton.addEventListener('click', () => {
      logDebug('Pre-existing YouTube logo button clicked');
      trackYouTubeLogoClick();
    });
  }
  
  if (existingTitleLink) {
    logDebug('YouTube title link already exists, adding click handler');
    existingTitleLink.addEventListener('click', () => {
      logDebug('Pre-existing YouTube ttitle link clicked');
      trackYouTubeLogoClick();
    });
  }
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

/**
 * YouTube Video Tracking for VitePress
 * This tracks play, pause, and completion events for embedded YouTube videos
 */
export function setupYouTubeTracking() {
  // Wait for page to be fully loaded
  if (document.readyState === 'complete') {
    initYouTubeTracking();
  } else {
    window.addEventListener('load', initYouTubeTracking);
  }

  // For client-side navigation, setup tracking after route changes
  if (typeof window !== 'undefined') {
    // This works for both Vue Router and the history API
    window.addEventListener('popstate', () => {
      // Small delay to ensure DOM is updated
      setTimeout(initYouTubeTracking, 300);
    });
  }
}

/**
 * Initialize tracking for all YouTube embedded videos on the page
 */
function initYouTubeTracking() {
  // Skip if no YouTube videos on the page
  if (!document.querySelector('iframe[src*="youtube.com/embed/"]')) {
    return;
  }

  // Load the YouTube iframe API if not already loaded
  if (!window.YT && !document.querySelector('script[src*="youtube.com/iframe_api"]')) {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  // Setup the onYouTubeIframeAPIReady callback if not already defined
  if (typeof window.onYouTubeIframeAPIReady !== 'function') {
    window.onYouTubeIframeAPIReady = setupYouTubePlayers;
  } else {
    // If already defined (perhaps by another library), call setup after API is ready
    const originalCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function() {
      originalCallback();
      setupYouTubePlayers();
    };
  }

  // If API is already loaded, set up players immediately
  if (window.YT && window.YT.Player) {
    setupYouTubePlayers();
  }
}

/**
 * Set up tracking for all YouTube players on the page
 */
function setupYouTubePlayers() {
  // Find all YouTube iframes
  const youtubeIframes = document.querySelectorAll('iframe[src*="youtube.com/embed/"]');

  youtubeIframes.forEach((iframe, index) => {
    // Skip if this iframe has already been processed
    if (iframe.getAttribute('data-tracking-initialized') === 'true') {
      return;
    }

    // Get the video ID from the iframe src
    let src = iframe.src;
    const videoId = src.match(/\/embed\/([^?]+)/)?.[1];

    if (!videoId) return;

    // If the iframe doesn't have an ID, give it one
    if (!iframe.id) {
      iframe.id = 'youtube-player-' + index;
    }

    // Get the video title from nearby context
    const nearestHeading = iframe.closest('div, section')?.querySelector('h1, h2, h3, h4, h5, h6')?.textContent;
    const videoTitle = iframe.getAttribute('title') ||
      nearestHeading ||
      iframe.closest('[aria-label]')?.getAttribute('aria-label') ||
      `Video ${videoId}`;

    // Mark this iframe as processed
    iframe.setAttribute('data-tracking-initialized', 'true');

    // Modify the iframe src to enable the API if needed
    if (src.indexOf('enablejsapi=1') === -1) {
      src += (src.indexOf('?') === -1 ? '?' : '&') + 'enablejsapi=1&origin=' + window.location.origin;
      iframe.src = src;
    }

    // Create a player instance to track events
    try {
      // eslint-disable-next-line no-new
      new window.YT.Player(iframe.id, {
        events: {
          onStateChange: function(event) {
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
      console.warn('YouTube tracking initialization error:', error);
    }
  });
}

/**
 * Tracks YouTube video events in Umami
 */
function trackYouTubeEvent(action, videoId, videoTitle) {
  if (window.umami) {
    window.umami.track(action, {
      video_id: videoId,
      video_title: videoTitle,
      page_path: window.location.pathname,
      section: getCurrentDocSection()
    });
  }
}

/**
 * Helper to identify current documentation section
 */
function getCurrentDocSection() {
  // This is a simple implementation - adjust based on your site structure
  const path = window.location.pathname;
  if (path.includes('/tutorial/')) return 'tutorial';
  if (path.includes('/guide/')) return 'guide';
  if (path.includes('/api/')) return 'api';
  if (path.includes('/reference/')) return 'reference';

  // Try to determine from page content
  const breadcrumbs = document.querySelector('.breadcrumbs, .vp-breadcrumb');
  if (breadcrumbs) {
    const text = breadcrumbs.textContent.toLowerCase();
    if (text.includes('tutorial')) return 'tutorial';
    if (text.includes('guide')) return 'guide';
    if (text.includes('api')) return 'api';
    if (text.includes('reference')) return 'reference';
  }

  return 'documentation';
};

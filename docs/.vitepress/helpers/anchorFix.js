/**
 * Fix anchor positioning for fixed header in VitePress
 * Automatically adjusts scroll position when navigating to anchor links
 */

export function setupAnchorFix() {
  if (typeof window === 'undefined') {
    return;
  }

  const HEADER_OFFSET = 110;

  function getActualHeaderHeight() {
    const navbar = document.querySelector('.VPNavBar');
    if (navbar) {
      return navbar.getBoundingClientRect().height + 10;
    }
    return HEADER_OFFSET;
  }

  // Adjust scroll position for the current hash in the URL
  function adjustScrollForAnchor() {
    if (!window.location.hash) {
      return;
    }
    const targetId = window.location.hash.substring(1);
    const targetElement = document.getElementById(targetId);
    if (!targetElement) {
      return;
    }
    const elementPosition = targetElement.getBoundingClientRect().top;
    const headerHeight = getActualHeaderHeight();
    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

    window.scrollTo({
      top: Math.max(0, offsetPosition),
      behavior: 'smooth'
    });
  }

  // Handle anchor links clicked on the current page
  function handleAnchorClick(event) {
    const link = event.target.closest('a');
    if (!link) {
      return;
    }

    const href = link.getAttribute('href');
    if (!href?.startsWith('#')) {
      return;
    }
    event.preventDefault();

    const targetId = href.slice(1);
    const targetElement = document.getElementById(targetId);

    if (!targetElement) {
      return;
    }
    window.history.pushState(null, null, href);
    const elementPosition = targetElement.getBoundingClientRect().top;
    const headerHeight = getActualHeaderHeight();
    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

    window.scrollTo({
      top: Math.max(0, offsetPosition),
      behavior: 'smooth'
    });
  }

  const handleLoad = () => {
    setTimeout(adjustScrollForAnchor, 200);
  };
  const handleHashChange = () => {
    setTimeout(adjustScrollForAnchor, 100);
  };
  const handleDOMContentLoaded = () => {
    setTimeout(adjustScrollForAnchor, 200);
  };

  document.addEventListener('click', handleAnchorClick);
  window.addEventListener('load', handleLoad);
  window.addEventListener('hashchange', handleHashChange);

  // Handle DOMContentLoaded for faster initial adjustment
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
  } else {
    setTimeout(adjustScrollForAnchor, 200);
  }

  // Return cleanup function
  return () => {
    document.removeEventListener('click', handleAnchorClick);
    window.removeEventListener('load', handleLoad);
    window.removeEventListener('hashchange', handleHashChange);
    document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
  };
}

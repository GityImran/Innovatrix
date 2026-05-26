export const slowScrollToId = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
  // Only override click behavior on the home page where these IDs actually exist
  if (window.location.pathname !== '/') {
    return;
  }
  
  const element = document.getElementById(id);
  if (!element) return;
  
  e.preventDefault();
  
  // We use 100px offset for the fixed header
  const headerOffset = 100;
  const targetPosition = element.getBoundingClientRect().top + window.scrollY - headerOffset;
  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  let startTime: number | null = null;
  
  // 1500ms = 1.5 seconds (slow, extremely smooth scroll effect)
  const duration = 1500; 
  
  // Easing function for smooth acceleration and deceleration
  function easeInOutQuint(t: number, b: number, c: number, d: number) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t * t * t * t + b;
    t -= 2;
    return c / 2 * (t * t * t * t * t + 2) + b;
  }
  
  function animation(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutQuint(timeElapsed, startPosition, distance, duration);
    
    window.scrollTo(0, run);
    
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    } else {
      window.scrollTo(0, targetPosition);
    }
  }
  
  requestAnimationFrame(animation);
};

(() => {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const dropdowns = Array.from(document.querySelectorAll('.dropdown'));
  const mobileMedia = window.matchMedia('(max-width: 768px)');

  const setMenuOpen = (isOpen) => {
    if (!navToggle || !navMenu) {
      return;
    }

    navToggle.classList.toggle('active', isOpen);
    navMenu.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('nav-open', isOpen);
  };

  const closeDropdown = (dropdown) => {
    const toggle = dropdown.querySelector('.dropdown-toggle');

    dropdown.classList.remove('open');

    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
    }
  };

  const closeAllDropdowns = () => {
    dropdowns.forEach(closeDropdown);
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') !== 'true';
      closeAllDropdowns();
      setMenuOpen(isOpen);
    });
  }

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector('.dropdown-toggle');

    if (!toggle) {
      return;
    }

    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const isOpen = toggle.getAttribute('aria-expanded') !== 'true';

      closeAllDropdowns();

      if (isOpen) {
        dropdown.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (dropdowns.some((dropdown) => dropdown.contains(event.target))) {
      return;
    }

    closeAllDropdowns();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllDropdowns();
      setMenuOpen(false);
      if (navToggle) {
        navToggle.focus();
      }
    }
  });

  const handleBreakpointChange = (event) => {
    if (!event.matches) {
      closeAllDropdowns();
      setMenuOpen(false);
    }
  };

  if (typeof mobileMedia.addEventListener === 'function') {
    mobileMedia.addEventListener('change', handleBreakpointChange);
  } else if (typeof mobileMedia.addListener === 'function') {
    mobileMedia.addListener(handleBreakpointChange);
  }
})();

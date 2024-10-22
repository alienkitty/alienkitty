export const isMobile = !!navigator.maxTouchPoints;
export const isTablet = isMobile && Math.max(window.innerWidth, window.innerHeight) > 1000;
export const isPhone = isMobile && !isTablet;
export const isHighQuality = navigator.hardwareConcurrency > 4 || (!navigator.hardwareConcurrency && !isTablet);
export const isOrbit = /[?&]orbit/.test(location.search);
export const isDebug = /[?&]debug/.test(location.search);

export const basePath = '';
export const assetPath = '/';
export const breakpoint = 1000;

export const layers = {
};

export const params = {
};

export const store = {
};

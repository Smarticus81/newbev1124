import { useEffect, useState } from 'react';

/**
 * useMediaQuery
 * Client-side hook that keeps track of a CSS media query.
 * Safely handles SSR by defaulting to false until mounted.
 */
export const useMediaQuery = (query: string): boolean => {
    const getMatches = () => {
        if (typeof window === 'undefined') {
            return false;
        }
        return window.matchMedia(query).matches;
    };

    const [matches, setMatches] = useState<boolean>(getMatches);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const mediaQueryList = window.matchMedia(query);
        const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches);

        // Set initial value
        setMatches(mediaQueryList.matches);

        mediaQueryList.addEventListener('change', handleChange);
        return () => mediaQueryList.removeEventListener('change', handleChange);
    }, [query]);

    return matches;
};



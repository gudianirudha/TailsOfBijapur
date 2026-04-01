import { useMemo } from 'react';
import { prepare, layout } from '@chenglou/pretext';

/**
 * High-performance text measurement hook using Pretext.
 * @param {string} text - The content to measure
 * @param {string} font - CSS font string (e.g., '16px sans-serif')
 * @param {number} containerWidth - The max width of the text box
 * @param {number} lineHeight - The line height in pixels
 * @returns {{ height: number, lines: number }}
 */
export function useTextLayout(text, font, containerWidth, lineHeight) {

    // PHASE 1: Measurement & Caching (Runs ONCE per text/font change)
    const preparedData = useMemo(() => {
        if (!text) return null;
        return prepare(text, font);
    }, [text, font]);

    // PHASE 2: Pure Math Layout (Runs instantly on window resize/width change)
    const metrics = useMemo(() => {
        if (!preparedData || !containerWidth) return { height: 0, lines: 0 };

        // Returns the exact pixel height and total line count mathematically
        return layout(preparedData, containerWidth, lineHeight);
    }, [preparedData, containerWidth, lineHeight]);

    return metrics;
}
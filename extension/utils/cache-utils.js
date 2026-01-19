// Cache utilities for Udemy AI Smart Overview
console.log('[Udemy AI Cache] Cache utilities loaded');

const CACHE_PREFIX = 'udemy_ai_cache_';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Generate a simple hash from a string
 */
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
}

/**
 * Generate cache key from URL and transcript
 */
function getCacheKey(url, transcript) {
    const urlHash = simpleHash(url);
    const transcriptHash = simpleHash(transcript);
    return `${CACHE_PREFIX}${urlHash}_${transcriptHash}`;
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid(timestamp, ttl = CACHE_TTL) {
    const now = Date.now();
    return (now - timestamp) < ttl;
}

/**
 * Get cached summary if valid
 */
function getCachedSummary(url, transcript) {
    try {
        const cacheKey = getCacheKey(url, transcript);
        const cached = localStorage.getItem(cacheKey);

        if (!cached) {
            console.log('[Cache] Miss - no cached data');
            return null;
        }

        const cacheData = JSON.parse(cached);

        if (!isCacheValid(cacheData.timestamp)) {
            console.log('[Cache] Miss - cache expired');
            localStorage.removeItem(cacheKey);
            return null;
        }

        console.log('[Cache] Hit - using cached data');
        return cacheData.data;
    } catch (error) {
        console.error('[Cache] Error reading cache:', error);
        return null;
    }
}

/**
 * Get cached summary by URL only (without transcript)
 * This allows checking cache before extracting transcript
 */
function getCachedSummaryByUrl(url) {
    try {
        const urlHash = simpleHash(url);
        const keys = Object.keys(localStorage);

        // Find any cache entry that matches the URL hash
        for (const key of keys) {
            if (key.startsWith(CACHE_PREFIX) && key.includes(urlHash)) {
                const cached = localStorage.getItem(key);
                if (!cached) continue;

                const cacheData = JSON.parse(cached);

                // Check if cache is still valid
                if (!isCacheValid(cacheData.timestamp)) {
                    console.log('[Cache] Miss - cache expired for URL');
                    localStorage.removeItem(key);
                    continue;
                }

                // Verify the URL matches exactly
                if (cacheData.url === url) {
                    console.log('[Cache] Hit - found cached data for URL (no transcript needed)');
                    return cacheData.data;
                }
            }
        }

        console.log('[Cache] Miss - no cached data for URL');
        return null;
    } catch (error) {
        console.error('[Cache] Error reading cache by URL:', error);
        return null;
    }
}

/**
 * Store summary in cache
 */
function setCachedSummary(url, transcript, data) {
    try {
        const cacheKey = getCacheKey(url, transcript);
        const cacheData = {
            data: data,
            timestamp: Date.now(),
            url: url,
            lectureTitle: document.title
        };

        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        console.log('[Cache] Stored summary in cache');
    } catch (error) {
        console.error('[Cache] Error storing cache:', error);
    }
}

/**
 * Clear all cached summaries
 */
function clearAllCache() {
    try {
        const keys = Object.keys(localStorage);
        let cleared = 0;

        keys.forEach(key => {
            if (key.startsWith(CACHE_PREFIX)) {
                localStorage.removeItem(key);
                cleared++;
            }
        });

        console.log(`[Cache] Cleared ${cleared} cached summaries`);
        return cleared;
    } catch (error) {
        console.error('[Cache] Error clearing cache:', error);
        return 0;
    }
}

/**
 * Get cache statistics
 */
function getCacheStats() {
    try {
        const keys = Object.keys(localStorage);
        let total = 0;
        let valid = 0;
        let expired = 0;

        keys.forEach(key => {
            if (key.startsWith(CACHE_PREFIX)) {
                total++;
                const cached = JSON.parse(localStorage.getItem(key));
                if (isCacheValid(cached.timestamp)) {
                    valid++;
                } else {
                    expired++;
                }
            }
        });

        return { total, valid, expired };
    } catch (error) {
        console.error('[Cache] Error getting stats:', error);
        return { total: 0, valid: 0, expired: 0 };
    }
}

// Export functions for use in inject-tab.js
window.UdemyAICache = {
    getCachedSummary,
    getCachedSummaryByUrl,
    setCachedSummary,
    clearAllCache,
    getCacheStats
};

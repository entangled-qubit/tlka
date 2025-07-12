// Google Form Integration for Dynamic Content
// This file handles fetching stories from Google Forms

class GoogleFormManager {
    constructor() {
        // Replace with your Google Apps Script web app URL
        this.scriptUrl = 'https://script.google.com/macros/s/AKfycbygfOQozTwfNzGRGxanOGSxed9Q1kixXN118COI3hfOcEfP7DSRLUMpd7xLlH1SeDVY/exec';
        this.cache = new Map();
        this.cacheTimeout = 15 * 60 * 1000; // 15 minutes (increased for better performance)
    }

    async fetchDriveData() {
        try {
            const response = await fetch(this.scriptUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data from Google Drive:', error);
            return null;
        }
    }

    async getStories() {
        const cacheKey = 'stories';
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        const data = await this.fetchDriveData();
        if (data && data.stories) {
            this.setCachedData(cacheKey, data.stories);
            return data.stories;
        }
        return [];
    }

    getCachedData(key) {
        try {
            // Try to get from localStorage first
            const cached = localStorage.getItem(`stories_cache_${key}`);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed.timestamp < this.cacheTimeout) {
                    console.log('Using cached data from localStorage');
                    return parsed.data;
                } else {
                    console.log('Cached data expired, removing from localStorage');
                    localStorage.removeItem(`stories_cache_${key}`);
                }
            }
            
            // Fallback to memory cache
            const memoryCached = this.cache.get(key);
            if (memoryCached && Date.now() - memoryCached.timestamp < this.cacheTimeout) {
                return memoryCached.data;
            }
            return null;
        } catch (error) {
            console.error('Error reading cache:', error);
            return null;
        }
    }

    setCachedData(key, data) {
        try {
            // Save to localStorage for persistence across page visits
            const cacheData = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(`stories_cache_${key}`, JSON.stringify(cacheData));
            console.log('Saved data to localStorage cache');
            
            // Also save to memory cache
            this.cache.set(key, cacheData);
        } catch (error) {
            console.error('Error saving cache:', error);
            // Fallback to memory cache only
            this.cache.set(key, {
                data: data,
                timestamp: Date.now()
            });
        }
    }

    // Auto-refresh data periodically (only if there are changes)
    startAutoRefresh(intervalMs = 300000) { // 5 minutes instead of 30 seconds
        setInterval(async () => {
            console.log('Checking for new stories from Google Drive...');
            await this.checkForUpdates();
        }, intervalMs);
    }

    async checkForUpdates() {
        try {
            const newData = await this.fetchDriveData();
            if (!newData || !newData.stories) return;

            const currentStories = this.getCachedData('stories');
            const newStories = newData.stories;

            // Only update if there are new stories
            if (!currentStories || newStories.length > currentStories.length) {
                console.log('New stories found! Updating...');
                await this.refreshAllData();
            } else {
                console.log('No new stories found.');
            }
        } catch (error) {
            console.error('Error checking for updates:', error);
        }
    }

    async refreshAllData() {
        // Clear cache to force fresh data
        this.cache.clear();
        
        // Also clear localStorage cache
        try {
            localStorage.removeItem('stories_cache_stories');
            console.log('Cleared localStorage cache');
        } catch (error) {
            console.error('Error clearing localStorage cache:', error);
        }
        
        // Check which page we're on and update accordingly
        const isStoriesPage = window.location.pathname.includes('stories.html');
        
        if (isStoriesPage) {
            await this.updateStoriesPage();
        } else {
            await this.updateCarousel();
        }
    }

    async updateCarousel() {
        const stories = await this.getStories();
        
        // Select 7 random stories for main page carousel
        let randomStories = [];
        if (stories.length > 0) {
            // Create array with original indices
            const storiesWithIndices = stories.map((story, index) => ({ ...story, originalIndex: index }));
            
            // Shuffle the array and take first 7
            for (let i = storiesWithIndices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [storiesWithIndices[i], storiesWithIndices[j]] = [storiesWithIndices[j], storiesWithIndices[i]];
            }
            
            // Take up to 7 random stories
            randomStories = storiesWithIndices.slice(0, 7);
        }
        
        // Update your existing carousel with new data
        if (window.updateCarouselWithData) {
            window.updateCarouselWithData(randomStories);
        }
    }

    async updateStoriesPage() {
        console.log('updateStoriesPage called');
        
        // Try to use cached data first for instant loading
        let stories = this.getCachedData('stories');
        
        if (!stories) {
            // If no cache, fetch fresh data
            console.log('No cached stories found, fetching fresh data...');
            stories = await this.getStories();
        } else {
            console.log('Using cached stories for instant loading');
        }
        
        // Update stories page with stories
        if (window.updateStoriesPageWithData) {
            console.log('Calling updateStoriesPageWithData with', stories.length, 'stories');
            window.updateStoriesPageWithData(stories);
        } else {
            console.error('updateStoriesPageWithData function not found');
        }
    }

    // Method to check if stories are already cached
    hasCachedStories() {
        const cached = this.getCachedData('stories');
        return cached !== null && cached.length > 0;
    }

    // Load carousel with cached data for fast loading
    async loadCarouselWithCache() {
        console.log('Loading carousel with cached data for fast loading...');
        
        // Try to use cached data first
        let stories = this.getCachedData('stories');
        
        if (!stories) {
            // If no cache, fetch fresh data
            console.log('No cached stories found, fetching fresh data...');
            stories = await this.getStories();
        } else {
            console.log('Using cached stories for fast carousel loading');
        }
        
        // Select 7 random stories for main page carousel
        let randomStories = [];
        if (stories.length > 0) {
            // Create array with original indices
            const storiesWithIndices = stories.map((story, index) => ({ ...story, originalIndex: index }));
            
            // Shuffle the array and take first 7
            for (let i = storiesWithIndices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [storiesWithIndices[i], storiesWithIndices[j]] = [storiesWithIndices[j], storiesWithIndices[i]];
            }
            
            // Take up to 7 random stories
            randomStories = storiesWithIndices.slice(0, 7);
        }
        
        // Update carousel with random stories
        if (window.updateCarouselWithData) {
            window.updateCarouselWithData(randomStories);
        }
        
        // Fetch fresh data in background for next time
        this.getStories();
    }

    // Force refresh carousel with new random stories (for manual refresh)
    async forceRefreshCarousel() {
        console.log('Force refreshing carousel with new random stories...');
        
        // Clear cache to force fresh data
        this.cache.clear();
        try {
            localStorage.removeItem('stories_cache_stories');
        } catch (error) {
            console.error('Error clearing localStorage cache:', error);
        }
        
        // Fetch fresh data and update carousel
        await this.updateCarousel();
    }

    async preloadAllStories() {
        // Preload all stories in background for stories page
        try {
            console.log('Preloading all stories for stories page...');
            const stories = await this.getStories();
            console.log('Preloaded', stories.length, 'stories');
        } catch (error) {
            console.error('Error preloading stories:', error);
        }
    }
}

// Initialize the manager
const formManager = new GoogleFormManager();

// Start auto-refresh when page loads (can be disabled)
document.addEventListener('DOMContentLoaded', () => {
    // Set to false to disable auto-refresh entirely
    const enableAutoRefresh = true;
    
    if (enableAutoRefresh) {
        formManager.startAutoRefresh();
    }
    
    // Initial load - check which page we're on
    const isStoriesPage = window.location.pathname.includes('stories.html');
    
    if (isStoriesPage) {
        // Don't call updateStoriesPage here - let the stories page handle it
        console.log('Stories page detected - waiting for page to load data');
    } else {
        // On main page: load carousel with cached data for fast loading AND preload all stories for stories page
        formManager.loadCarouselWithCache();
        formManager.preloadAllStories();
    }
});

// Export for use in other scripts
window.formManager = formManager; 
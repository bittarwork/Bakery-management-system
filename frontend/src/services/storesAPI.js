import apiClient from './apiClient';

/**
 * خدمة API للمتاجر
 */

// الحصول على جميع المتاجر
export const getStores = async (params = {}) => {
    try {
        const response = await apiClient.get('/stores', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching stores:', error);
        throw error;
    }
};

// الحصول على متجر واحد
export const getStore = async (id, params = {}) => {
    try {
        const response = await apiClient.get(`/stores/${id}`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching store:', error);
        throw error;
    }
};

// إنشاء متجر جديد
export const createStore = async (storeData) => {
    try {
        const response = await apiClient.post('/stores', storeData);
        return response.data;
    } catch (error) {
        console.error('Error creating store:', error);
        throw error;
    }
};

// تحديث متجر
export const updateStore = async (id, storeData) => {
    try {
        const response = await apiClient.put(`/stores/${id}`, storeData);
        return response.data;
    } catch (error) {
        console.error('Error updating store:', error);
        throw error;
    }
};

// حذف متجر
export const deleteStore = async (id) => {
    try {
        const response = await apiClient.delete(`/stores/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting store:', error);
        throw error;
    }
};

// Get nearby stores
export const getNearbyStores = async (lat, lng, radius = 10) => {
    try {
        const response = await apiClient.get('/stores/nearby', {
            params: { lat, lng, radius }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching nearby stores:', error);
        throw error;
    }
};

// Get store statistics
export const getStoreStatistics = async (params = {}) => {
    try {
        const response = await apiClient.get('/stores/statistics', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching store statistics:', error);
        throw error;
    }
};

// Get stores for map display
export const getStoresMap = async (params = {}) => {
    try {
        const response = await apiClient.get('/stores/map', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching stores map:', error);
        throw error;
    }
};

// Geocoding utilities (using a free service like Nominatim)
export const geocodeAddress = async (address) => {
    try {
        const encodedAddress = encodeURIComponent(`${address}, Belgium`);
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=5&countrycodes=be`
        );
        const data = await response.json();

        if (data && data.length > 0) {
            return data.map(item => ({
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                display_name: item.display_name
            }));
        }

        return [];
    } catch (error) {
        console.error('Error geocoding address:', error);
        return [];
    }
};

// Reverse geocoding
export const reverseGeocode = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();

        if (data && data.display_name) {
            return {
                display_name: data.display_name,
                address: data.address?.city || data.address?.town || data.address?.village,
                postcode: data.address?.postcode,
                country: data.address?.country
            };
        }

        return null;
    } catch (error) {
        console.error('Error reverse geocoding:', error);
        return null;
    }
};

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

// Get user's current location
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    });
};

// Belgium bounds for validation
export const BELGIUM_BOUNDS = {
    north: 51.5,
    south: 49.5,
    east: 6.4,
    west: 2.5
};

// Check if coordinates are within Belgium
export const isWithinBelgium = (lat, lng) => {
    return lat >= BELGIUM_BOUNDS.south &&
        lat <= BELGIUM_BOUNDS.north &&
        lng >= BELGIUM_BOUNDS.west &&
        lng <= BELGIUM_BOUNDS.east;
};

// Belgium center coordinates
export const BELGIUM_CENTER = {
    lat: 50.8503,
    lng: 4.3517
};

// Major Belgian cities for quick selection
export const BELGIAN_CITIES = [
    { name: 'Brussels', lat: 50.8503, lng: 4.3517 },
    { name: 'Antwerp', lat: 51.2194, lng: 4.4025 },
    { name: 'Ghent', lat: 51.0543, lng: 3.7174 },
    { name: 'Charleroi', lat: 50.4108, lng: 4.4446 },
    { name: 'Liège', lat: 50.6326, lng: 5.5797 },
    { name: 'Bruges', lat: 51.2093, lng: 3.2247 },
    { name: 'Namur', lat: 50.4674, lng: 4.8720 },
    { name: 'Leuven', lat: 50.8798, lng: 4.7005 },
    { name: 'Mons', lat: 50.4542, lng: 3.9564 },
    { name: 'Aalst', lat: 50.9368, lng: 4.0397 }
];

export default {
    getStores,
    getStore,
    createStore,
    updateStore,
    deleteStore,
    getNearbyStores,
    getStoreStatistics,
    getStoresMap,
    geocodeAddress,
    reverseGeocode,
    calculateDistance,
    getCurrentLocation,
    isWithinBelgium,
    BELGIUM_CENTER,
    BELGIAN_CITIES
}; 
import apiService from './apiService';

class PredictionService {
    /**
     * Generate predictions based on historical data
     */
    async generatePredictions({ type, period, includeHistorical = true, storeId = null }) {
        try {
            const response = await apiService.post('/predictions/generate', {
                type,
                period,
                includeHistorical,
                storeId
            });
            return response;
        } catch (error) {
            console.error('Error generating predictions:', error);
            throw error;
        }
    }

    /**
     * Get orders prediction
     */
    async getOrdersPrediction(period = 'week', storeId = null) {
        try {
            const params = new URLSearchParams({
                period,
                ...(storeId && { storeId })
            });

            const response = await apiService.get(`/predictions/orders?${params}`);
            return response;
        } catch (error) {
            console.error('Error fetching orders prediction:', error);
            throw error;
        }
    }

    /**
     * Get revenue prediction
     */
    async getRevenuePrediction(period = 'week', storeId = null) {
        try {
            const params = new URLSearchParams({
                period,
                ...(storeId && { storeId })
            });

            const response = await apiService.get(`/predictions/revenue?${params}`);
            return response;
        } catch (error) {
            console.error('Error fetching revenue prediction:', error);
            throw error;
        }
    }

    /**
     * Get product demand prediction
     */
    async getProductDemandPrediction(period = 'week', productId = null, storeId = null) {
        try {
            const params = new URLSearchParams({
                period,
                ...(productId && { productId }),
                ...(storeId && { storeId })
            });

            const response = await apiService.get(`/predictions/products?${params}`);
            return response;
        } catch (error) {
            console.error('Error fetching product demand prediction:', error);
            throw error;
        }
    }

    /**
     * Get peak times prediction
     */
    async getPeakTimesPrediction(period = 'week', storeId = null) {
        try {
            const params = new URLSearchParams({
                period,
                ...(storeId && { storeId })
            });

            const response = await apiService.get(`/predictions/peak-times?${params}`);
            return response;
        } catch (error) {
            console.error('Error fetching peak times prediction:', error);
            throw error;
        }
    }

    /**
     * Get inventory demand prediction
     */
    async getInventoryDemandPrediction(period = 'week', storeId = null) {
        try {
            const params = new URLSearchParams({
                period,
                ...(storeId && { storeId })
            });

            const response = await apiService.get(`/predictions/inventory?${params}`);
            return response;
        } catch (error) {
            console.error('Error fetching inventory demand prediction:', error);
            throw error;
        }
    }

    /**
     * Get seasonal trends prediction
     */
    async getSeasonalTrends(year = new Date().getFullYear()) {
        try {
            const params = new URLSearchParams({ year: year.toString() });
            const response = await apiService.get(`/predictions/seasonal?${params}`);
            return response;
        } catch (error) {
            console.error('Error fetching seasonal trends:', error);
            throw error;
        }
    }

    /**
     * Get prediction accuracy metrics
     */
    async getPredictionAccuracy(modelType = 'orders', period = '30d') {
        try {
            const params = new URLSearchParams({
                modelType,
                period
            });

            const response = await apiService.get(`/predictions/accuracy?${params}`);
            return response;
        } catch (error) {
            console.error('Error fetching prediction accuracy:', error);
            throw error;
        }
    }

    /**
     * Update prediction model parameters
     */
    async updateModelParameters(modelType, parameters) {
        try {
            const response = await apiService.put(`/predictions/models/${modelType}`, {
                parameters
            });
            return response;
        } catch (error) {
            console.error('Error updating model parameters:', error);
            throw error;
        }
    }

    /**
     * Get available prediction models
     */
    async getAvailableModels() {
        try {
            const response = await apiService.get('/predictions/models');
            return response;
        } catch (error) {
            console.error('Error fetching available models:', error);
            throw error;
        }
    }

    /**
     * Train new prediction model
     */
    async trainModel({ modelType, trainingData, parameters }) {
        try {
            const response = await apiService.post('/predictions/train', {
                modelType,
                trainingData,
                parameters
            });
            return response;
        } catch (error) {
            console.error('Error training model:', error);
            throw error;
        }
    }

    /**
     * Get model training status
     */
    async getTrainingStatus(jobId) {
        try {
            const response = await apiService.get(`/predictions/training/${jobId}/status`);
            return response;
        } catch (error) {
            console.error('Error fetching training status:', error);
            throw error;
        }
    }

    /**
     * Get demand forecast for specific product
     */
    async getProductDemandForecast(productId, period = 'month') {
        try {
            const params = new URLSearchParams({ period });
            const response = await apiService.get(`/predictions/products/${productId}/forecast?${params}`);
            return response;
        } catch (error) {
            console.error('Error fetching product demand forecast:', error);
            throw error;
        }
    }

    /**
     * Get risk analysis for predictions
     */
    async getRiskAnalysis(predictionType, period = 'week') {
        try {
            const params = new URLSearchParams({
                predictionType,
                period
            });

            const response = await apiService.get(`/predictions/risk-analysis?${params}`);
            return response;
        } catch (error) {
            console.error('Error fetching risk analysis:', error);
            throw error;
        }
    }

    /**
     * Get confidence intervals for predictions
     */
    async getConfidenceIntervals(predictionType, period = 'week', confidenceLevel = 95) {
        try {
            const params = new URLSearchParams({
                predictionType,
                period,
                confidenceLevel: confidenceLevel.toString()
            });

            const response = await apiService.get(`/predictions/confidence-intervals?${params}`);
            return response;
        } catch (error) {
            console.error('Error fetching confidence intervals:', error);
            throw error;
        }
    }

    /**
     * Get predictions comparison between different models
     */
    async getModelsComparison(predictionType, period = 'week') {
        try {
            const params = new URLSearchParams({
                predictionType,
                period
            });

            const response = await apiService.get(`/predictions/models-comparison?${params}`);
            return response;
        } catch (error) {
            console.error('Error fetching models comparison:', error);
            throw error;
        }
    }

    /**
     * Get anomaly detection in predictions
     */
    async getAnomalyDetection(predictionType, threshold = 2.0) {
        try {
            const params = new URLSearchParams({
                predictionType,
                threshold: threshold.toString()
            });

            const response = await apiService.get(`/predictions/anomaly-detection?${params}`);
            return response;
        } catch (error) {
            console.error('Error fetching anomaly detection:', error);
            throw error;
        }
    }

    /**
     * Export predictions data
     */
    async exportPredictions({ type, period, format = 'csv' }) {
        try {
            const response = await apiService.post('/predictions/export', {
                type,
                period,
                format
            }, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `predictions-${type}-${period}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            console.error('Error exporting predictions:', error);
            throw error;
        }
    }

    /**
     * Get prediction alerts and notifications
     */
    async getPredictionAlerts() {
        try {
            const response = await apiService.get('/predictions/alerts');
            return response;
        } catch (error) {
            console.error('Error fetching prediction alerts:', error);
            throw error;
        }
    }

    /**
     * Create prediction alert rule
     */
    async createAlertRule({ name, predictionType, condition, threshold, recipients }) {
        try {
            const response = await apiService.post('/predictions/alerts', {
                name,
                predictionType,
                condition,
                threshold,
                recipients
            });
            return response;
        } catch (error) {
            console.error('Error creating alert rule:', error);
            throw error;
        }
    }

    /**
     * Get historical prediction accuracy
     */
    async getHistoricalAccuracy(modelType, startDate, endDate) {
        try {
            const params = new URLSearchParams({
                modelType,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });

            const response = await apiService.get(`/predictions/historical-accuracy?${params}`);
            return response;
        } catch (error) {
            console.error('Error fetching historical accuracy:', error);
            throw error;
        }
    }

    /**
     * Get prediction insights and recommendations
     */
    async getPredictionInsights(predictionType, period = 'week') {
        try {
            const params = new URLSearchParams({
                predictionType,
                period
            });

            const response = await apiService.get(`/predictions/insights?${params}`);
            return response;
        } catch (error) {
            console.error('Error fetching prediction insights:', error);
            throw error;
        }
    }

    /**
     * Validate prediction model
     */
    async validateModel(modelType, validationData) {
        try {
            const response = await apiService.post(`/predictions/models/${modelType}/validate`, {
                validationData
            });
            return response;
        } catch (error) {
            console.error('Error validating model:', error);
            throw error;
        }
    }
}

export const predictionService = new PredictionService();
export default predictionService; 
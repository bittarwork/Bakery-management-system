import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Target,
  Brain,
  AlertTriangle,
  CheckCircle,
  Zap,
  Activity,
  Clock,
  Package,
  DollarSign,
  RefreshCw,
  Download,
  Eye,
  Settings,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardHeader, CardBody } from "../ui/Card";
import LoadingSpinner from "../ui/LoadingSpinner";
import EnhancedButton from "../ui/EnhancedButton";
import { aiChatService } from "../../services/aiChatService";
import { predictionService } from "../../services/predictionService";

const PredictionSystem = () => {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [predictionType, setPredictionType] = useState("orders");
  const [accuracy, setAccuracy] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);

  const predictionPeriods = [
    { value: "day", label: "اليوم القادم", days: 1 },
    { value: "week", label: "الأسبوع القادم", days: 7 },
    { value: "month", label: "الشهر القادم", days: 30 },
    { value: "quarter", label: "الربع القادم", days: 90 },
  ];

  const predictionTypes = [
    {
      value: "orders",
      label: "الطلبات",
      icon: BarChart3,
      description: "توقع عدد الطلبات",
      color: "text-blue-500",
    },
    {
      value: "revenue",
      label: "الإيرادات",
      icon: DollarSign,
      description: "توقع الإيرادات",
      color: "text-green-500",
    },
    {
      value: "products",
      label: "المنتجات",
      icon: Package,
      description: "توقع طلب المنتجات",
      color: "text-purple-500",
    },
    {
      value: "peak_times",
      label: "أوقات الذروة",
      icon: Clock,
      description: "توقع أوقات الذروة",
      color: "text-orange-500",
    },
  ];

  useEffect(() => {
    generatePredictions();
  }, [selectedPeriod, predictionType]);

  const generatePredictions = async () => {
    try {
      setLoading(true);

      // Generate predictions based on historical data
      const response = await predictionService.generatePredictions({
        type: predictionType,
        period: selectedPeriod,
        includeHistorical: true,
      });

      if (response.success) {
        setPredictions(response.data.predictions);
        setHistoricalData(response.data.historical);
        setAccuracy(response.data.accuracy);

        // Get AI recommendations based on predictions
        const aiPrompt = `بناءً على التنبؤات التالية: ${JSON.stringify(
          response.data.predictions
        )}, قدم توصيات استراتيجية لتحسين الأداء وتجنب المشاكل المحتملة`;
        const aiResponse = await aiChatService.sendMessage(aiPrompt);

        if (aiResponse && aiResponse.message) {
          setAiRecommendations(aiResponse.message);
        }
      }
    } catch (error) {
      console.error("خطأ في توليد التنبؤات:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 85) return "text-green-600";
    if (accuracy >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getAccuracyIcon = (accuracy) => {
    if (accuracy >= 85) return CheckCircle;
    if (accuracy >= 70) return AlertTriangle;
    return AlertTriangle;
  };

  const renderPredictionChart = () => {
    if (!predictions || !historicalData) return null;

    const combinedData = [
      ...historicalData.map((d) => ({ ...d, type: "historical" })),
      ...predictions.map((d) => ({ ...d, type: "prediction" })),
    ];

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              التنبؤ بـ
              {predictionTypes.find((t) => t.value === predictionType)?.label}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Brain className="w-4 h-4" />
              <span>دقة النموذج: {accuracy?.toFixed(1)}%</span>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={combinedData}>
                <defs>
                  <linearGradient
                    id="colorHistorical"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient
                    id="colorPrediction"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => `التاريخ: ${value}`}
                  formatter={(value, name) => [
                    value,
                    name === "historical" ? "البيانات التاريخية" : "التنبؤ",
                  ]}
                />
                <Legend />

                {/* Historical Data */}
                <Area
                  type="monotone"
                  dataKey="value"
                  data={historicalData}
                  stroke="#3B82F6"
                  fill="url(#colorHistorical)"
                  name="البيانات التاريخية"
                />

                {/* Predictions */}
                <Line
                  type="monotone"
                  dataKey="value"
                  data={predictions}
                  stroke="#10B981"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  name="التنبؤ"
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                />

                {/* Confidence Intervals */}
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="none"
                  fill="#10B981"
                  fillOpacity={0.1}
                  name="نطاق الثقة العلوي"
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="none"
                  fill="#10B981"
                  fillOpacity={0.1}
                  name="نطاق الثقة السفلي"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    );
  };

  const renderPredictionSummary = () => {
    if (!predictions) return null;

    const currentPeriod = predictions[0];
    const nextPeriod = predictions[1];
    const trend =
      nextPeriod && currentPeriod
        ? ((nextPeriod.value - currentPeriod.value) / currentPeriod.value) * 100
        : 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Prediction */}
        <Card className="bg-blue-50 border-blue-200">
          <CardBody className="p-6">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-blue-600">التنبؤ الحالي</p>
                <p className="text-2xl font-bold text-blue-800">
                  {currentPeriod?.value?.toFixed(0)}
                </p>
                <p className="text-xs text-blue-600">
                  {
                    predictionTypes.find((t) => t.value === predictionType)
                      ?.label
                  }
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Trend */}
        <Card
          className={`${
            trend >= 0
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <CardBody className="p-6">
            <div className="flex items-center gap-3">
              {trend >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-500" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-500" />
              )}
              <div>
                <p
                  className={`text-sm ${
                    trend >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  الاتجاه
                </p>
                <p
                  className={`text-2xl font-bold ${
                    trend >= 0 ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {Math.abs(trend).toFixed(1)}%
                </p>
                <p
                  className={`text-xs ${
                    trend >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend >= 0 ? "زيادة متوقعة" : "انخفاض متوقع"}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Accuracy */}
        <Card className="bg-purple-50 border-purple-200">
          <CardBody className="p-6">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-purple-600">دقة النموذج</p>
                <p className="text-2xl font-bold text-purple-800">
                  {accuracy?.toFixed(1)}%
                </p>
                <p className="text-xs text-purple-600">
                  {accuracy >= 85
                    ? "دقة عالية"
                    : accuracy >= 70
                    ? "دقة متوسطة"
                    : "دقة منخفضة"}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Confidence */}
        <Card className="bg-orange-50 border-orange-200">
          <CardBody className="p-6">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-orange-600">مستوى الثقة</p>
                <p className="text-2xl font-bold text-orange-800">
                  {currentPeriod?.confidence?.toFixed(0)}%
                </p>
                <p className="text-xs text-orange-600">في التنبؤ الحالي</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderTopPredictions = () => {
    if (!predictions) return null;

    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">التنبؤات التفصيلية</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {predictions.slice(0, 7).map((prediction, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{prediction.date}</p>
                    <p className="text-sm text-gray-600">
                      {
                        predictionTypes.find((t) => t.value === predictionType)
                          ?.label
                      }
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold">
                    {prediction.value?.toFixed(0)}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">ثقة:</span>
                    <span
                      className={`text-sm font-medium ${getAccuracyColor(
                        prediction.confidence
                      )}`}
                    >
                      {prediction.confidence?.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  };

  const renderRiskAnalysis = () => {
    if (!predictions) return null;

    const risks = predictions.filter((p) => p.risk && p.risk !== "low");

    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              تحليل المخاطر
            </h3>
          </div>
        </CardHeader>
        <CardBody>
          {risks.length > 0 ? (
            <div className="space-y-3">
              {risks.map((risk, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-yellow-200"
                >
                  <AlertTriangle
                    className={`w-5 h-5 ${
                      risk.risk === "high" ? "text-red-500" : "text-yellow-500"
                    }`}
                  />
                  <div>
                    <p className="font-medium">{risk.date}</p>
                    <p className="text-sm text-gray-600">
                      {risk.riskDescription}
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        risk.risk === "high"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      مخاطرة {risk.risk === "high" ? "عالية" : "متوسطة"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-green-600 font-medium">لا توجد مخاطر محتملة</p>
              <p className="text-sm text-gray-600">
                التنبؤات تشير إلى استقرار في الأداء
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-500" />
            نظام التنبؤ الذكي
          </h2>
          <p className="text-gray-600">
            تنبؤات مدعومة بالذكاء الاصطناعي للطلبات المستقبلية
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Prediction Type Selector */}
          <select
            value={predictionType}
            onChange={(e) => setPredictionType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {predictionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {predictionPeriods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>

          {/* Refresh Button */}
          <EnhancedButton
            onClick={generatePredictions}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            تحديث
          </EnhancedButton>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <LoadingSpinner className="mx-auto mb-4" />
            <p className="text-gray-600">جاري توليد التنبؤات...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Prediction Summary */}
          {renderPredictionSummary()}

          {/* Main Chart */}
          {renderPredictionChart()}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Detailed Predictions */}
            {renderTopPredictions()}

            {/* Risk Analysis */}
            {renderRiskAnalysis()}
          </div>

          {/* AI Recommendations */}
          {aiRecommendations && (
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    توصيات ذكية
                  </h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <div className="whitespace-pre-wrap">{aiRecommendations}</div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Model Performance */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">أداء النموذج</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-3 rounded-full ${
                      accuracy >= 85
                        ? "bg-green-100"
                        : accuracy >= 70
                        ? "bg-yellow-100"
                        : "bg-red-100"
                    } flex items-center justify-center`}
                  >
                    <span
                      className={`text-xl font-bold ${getAccuracyColor(
                        accuracy
                      )}`}
                    >
                      {accuracy?.toFixed(0)}%
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900">دقة التنبؤ</h4>
                  <p className="text-sm text-gray-600">
                    على البيانات التاريخية
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                    <Activity className="w-8 h-8 text-blue-500" />
                  </div>
                  <h4 className="font-semibold text-gray-900">
                    استقرار النموذج
                  </h4>
                  <p className="text-sm text-gray-600">
                    {accuracy >= 80 ? "مستقر" : "يحتاج تحسين"}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                    <Brain className="w-8 h-8 text-purple-500" />
                  </div>
                  <h4 className="font-semibold text-gray-900">نوع النموذج</h4>
                  <p className="text-sm text-gray-600">
                    ARIMA + Machine Learning
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
};

export default PredictionSystem;

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  X,
  Edit,
  Save,
  Copy,
  Search,
  Filter,
  Star,
  Clock,
  AlertTriangle,
  CheckCircle,
  Package,
  Truck,
  MapPin,
  Phone,
  Mail,
  User,
  Store,
  Tag,
  Bookmark,
  Flag,
  Heart,
  MessageSquare,
  Bell,
  Settings,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Zap,
  Target,
  Globe,
  Calendar,
  Coffee,
  Home,
  Shield,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { toast } from "react-hot-toast";

const SpecialInstructionsManager = ({
  orderId = null,
  initialInstructions = "",
  onInstructionsChange = null,
  showTemplates = true,
  compactMode = false,
  className = "",
}) => {
  // State
  const [instructions, setInstructions] = useState(initialInstructions);
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [customTemplate, setCustomTemplate] = useState({
    name: "",
    content: "",
    category: "",
    tags: [],
    priority: "normal",
    is_public: false,
  });

  // AI Suggestions
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Template Management
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [recentlyUsed, setRecentlyUsed] = useState([]);

  // Default categories and templates
  const defaultCategories = [
    {
      id: "delivery",
      name: "Delivery Instructions",
      icon: Truck,
      color: "blue",
      count: 8,
    },
    {
      id: "packaging",
      name: "Packaging Notes",
      icon: Package,
      color: "green",
      count: 5,
    },
    {
      id: "timing",
      name: "Timing Requirements",
      icon: Clock,
      color: "orange",
      count: 6,
    },
    {
      id: "special",
      name: "Special Handling",
      icon: Star,
      color: "purple",
      count: 4,
    },
    {
      id: "customer",
      name: "Customer Preferences",
      icon: User,
      color: "pink",
      count: 7,
    },
    {
      id: "contact",
      name: "Contact Information",
      icon: Phone,
      color: "gray",
      count: 3,
    },
  ];

  const defaultTemplates = [
    // Delivery Instructions
    {
      id: 1,
      name: "Doorstep Delivery",
      content:
        "Please leave the order at the doorstep and ring the bell. No signature required.",
      category: "delivery",
      tags: ["doorstep", "no-contact", "bell"],
      priority: "high",
      uses: 45,
      lastUsed: "2024-03-15",
    },
    {
      id: 2,
      name: "Office Delivery",
      content:
        "Deliver to office reception. Ask for [Contact Name] and mention the company name.",
      category: "delivery",
      tags: ["office", "reception", "business"],
      priority: "normal",
      uses: 32,
      lastUsed: "2024-03-14",
    },
    {
      id: 3,
      name: "Apartment Building",
      content:
        "Building entrance code: [CODE]. Apartment [NUMBER], Floor [FLOOR]. Ring intercom if needed.",
      category: "delivery",
      tags: ["apartment", "code", "intercom"],
      priority: "high",
      uses: 28,
      lastUsed: "2024-03-13",
    },
    {
      id: 4,
      name: "Fragile Items",
      content:
        "Contains fragile items. Handle with extra care. Use 'FRAGILE' stickers on all sides of packaging.",
      category: "packaging",
      tags: ["fragile", "careful", "stickers"],
      priority: "urgent",
      uses: 22,
      lastUsed: "2024-03-12",
    },

    // Packaging Notes
    {
      id: 5,
      name: "Gift Wrapping",
      content:
        "Please gift wrap this order with premium wrapping paper. Include a gift card with message: [MESSAGE]",
      category: "packaging",
      tags: ["gift", "wrapping", "card"],
      priority: "medium",
      uses: 18,
      lastUsed: "2024-03-11",
    },
    {
      id: 6,
      name: "Eco-Friendly Packaging",
      content:
        "Use only biodegradable and eco-friendly packaging materials. No plastic wrapping.",
      category: "packaging",
      tags: ["eco-friendly", "biodegradable", "no-plastic"],
      priority: "medium",
      uses: 15,
      lastUsed: "2024-03-10",
    },

    // Timing Requirements
    {
      id: 7,
      name: "Morning Delivery Only",
      content:
        "Deliver between 8:00 AM - 12:00 PM only. Customer not available after noon.",
      category: "timing",
      tags: ["morning", "8am-12pm", "unavailable-afternoon"],
      priority: "high",
      uses: 35,
      lastUsed: "2024-03-15",
    },
    {
      id: 8,
      name: "Weekend Delivery",
      content:
        "Customer prefers weekend delivery (Saturday or Sunday). Any time between 10:00 AM - 6:00 PM.",
      category: "timing",
      tags: ["weekend", "saturday", "sunday", "flexible"],
      priority: "medium",
      uses: 12,
      lastUsed: "2024-03-09",
    },
    {
      id: 9,
      name: "Rush Delivery",
      content:
        "URGENT: Customer needs this order ASAP. Contact customer immediately upon preparation completion.",
      category: "timing",
      tags: ["urgent", "rush", "asap", "contact"],
      priority: "urgent",
      uses: 8,
      lastUsed: "2024-03-14",
    },

    // Special Handling
    {
      id: 10,
      name: "Temperature Sensitive",
      content:
        "Keep at room temperature during transport. Do not refrigerate or expose to direct sunlight.",
      category: "special",
      tags: ["temperature", "room-temp", "no-fridge", "no-sun"],
      priority: "high",
      uses: 20,
      lastUsed: "2024-03-13",
    },
    {
      id: 11,
      name: "Allergy Alert",
      content:
        "ALLERGY ALERT: Customer has severe [ALLERGY TYPE] allergy. Ensure no cross-contamination.",
      category: "special",
      tags: ["allergy", "cross-contamination", "alert"],
      priority: "urgent",
      uses: 16,
      lastUsed: "2024-03-12",
    },

    // Customer Preferences
    {
      id: 12,
      name: "Regular Customer",
      content:
        "Valued regular customer. Provide exceptional service and include our premium thank you note.",
      category: "customer",
      tags: ["regular", "vip", "thank-you", "premium"],
      priority: "high",
      uses: 25,
      lastUsed: "2024-03-15",
    },
    {
      id: 13,
      name: "First Time Customer",
      content:
        "First-time customer! Include welcome brochure and 10% off next order coupon.",
      category: "customer",
      tags: ["first-time", "welcome", "brochure", "coupon"],
      priority: "medium",
      uses: 31,
      lastUsed: "2024-03-14",
    },

    // Contact Information
    {
      id: 14,
      name: "Alternative Contact",
      content:
        "Primary contact unavailable. Use alternative number: [ALT_PHONE]. Contact person: [ALT_NAME]",
      category: "contact",
      tags: ["alternative", "backup", "phone", "contact"],
      priority: "medium",
      uses: 11,
      lastUsed: "2024-03-11",
    },
    {
      id: 15,
      name: "No Phone Contact",
      content:
        "Customer prefers NO phone calls. Communicate only via SMS or email if needed.",
      category: "contact",
      tags: ["no-calls", "sms", "email", "preference"],
      priority: "medium",
      uses: 9,
      lastUsed: "2024-03-10",
    },
  ];

  // Initialize data
  useEffect(() => {
    setCategories(defaultCategories);
    setTemplates(defaultTemplates);
    loadRecentlyUsed();
  }, []);

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesCategory =
      activeCategory === "all" || template.category === activeCategory;
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  // Load recently used templates
  const loadRecentlyUsed = () => {
    const recent = templates
      .filter((t) => t.lastUsed)
      .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
      .slice(0, 5);
    setRecentlyUsed(recent);
  };

  // Handle template application
  const applyTemplate = (template) => {
    const newInstructions = instructions
      ? instructions + "\n\n" + template.content
      : template.content;

    setInstructions(newInstructions);

    // Update usage statistics
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === template.id
          ? {
              ...t,
              uses: t.uses + 1,
              lastUsed: new Date().toISOString().split("T")[0],
            }
          : t
      )
    );

    if (onInstructionsChange) {
      onInstructionsChange(newInstructions);
    }

    toast.success(`Applied template: ${template.name}`);
    loadRecentlyUsed();
  };

  // Handle instructions change
  const handleInstructionsChange = (value) => {
    setInstructions(value);
    if (onInstructionsChange) {
      onInstructionsChange(value);
    }
  };

  // Generate AI suggestions
  const generateAISuggestions = async () => {
    if (!instructions.trim()) {
      toast.error("Please enter some instructions first");
      return;
    }

    setIsGeneratingAI(true);
    setShowAISuggestions(true);

    try {
      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const suggestions = [
        {
          type: "improvement",
          title: "Add contact preference",
          content: "Consider adding customer's preferred contact method",
          action: "Add: Please contact via SMS only - no phone calls.",
        },
        {
          type: "clarification",
          title: "Specify timing",
          content: "Instructions could be more specific about timing",
          action: "Add: Deliver between 2:00 PM - 6:00 PM",
        },
        {
          type: "safety",
          title: "Add safety note",
          content: "Consider adding safety precautions",
          action: "Add: Ring doorbell and wait for customer",
        },
      ];

      setAiSuggestions(suggestions);
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      toast.error("Failed to generate suggestions");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Apply AI suggestion
  const applyAISuggestion = (suggestion) => {
    const newInstructions = instructions + "\n" + suggestion.action;
    handleInstructionsChange(newInstructions);
    toast.success("AI suggestion applied");
  };

  // Save custom template
  const saveCustomTemplate = () => {
    if (!customTemplate.name || !customTemplate.content) {
      toast.error("Please fill in template name and content");
      return;
    }

    const newTemplate = {
      id: Date.now(),
      ...customTemplate,
      tags: customTemplate.tags,
      uses: 0,
      lastUsed: null,
      isCustom: true,
    };

    setTemplates((prev) => [...prev, newTemplate]);
    setCustomTemplate({
      name: "",
      content: "",
      category: "",
      tags: [],
      priority: "medium",
      is_public: false,
    });
    setShowCreateTemplate(false);
    toast.success("Custom template saved successfully");
  };

  // Get category color
  const getCategoryColor = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      green: "bg-green-100 text-green-800 border-green-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      pink: "bg-pink-100 text-pink-800 border-pink-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[color] || colors.gray;
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return colors[priority] || colors.normal;
  };

  // Template Modal
  const TemplateModal = () => (
    <AnimatePresence>
      {showTemplateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTemplateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Instruction Templates</h2>
                    <p className="text-sm text-gray-600">
                      Choose from {filteredTemplates.length} available templates
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateTemplate(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowTemplateModal(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="mt-4 flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search className="w-4 h-4 text-gray-400" />}
                  />
                </div>
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map((template) => {
                  const category = categories.find(
                    (c) => c.id === template.category
                  );
                  const Icon = category?.icon || FileText;

                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                    >
                      {/* Template Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          <div className="p-1.5 bg-gray-100 rounded">
                            <Icon className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {template.name}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(
                                  category?.color
                                )}`}
                              >
                                {category?.name}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(
                                  template.priority
                                )}`}
                              >
                                {template.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Template Content */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {template.content}
                        </p>
                      </div>

                      {/* Template Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                        {template.tags.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            +{template.tags.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Template Stats and Action */}
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Used {template.uses} times
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            applyTemplate(template);
                            setShowTemplateModal(false);
                          }}
                        >
                          Apply
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No templates found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search or create a new template
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Create Template Modal
  const CreateTemplateModal = () => (
    <AnimatePresence>
      {showCreateTemplate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateTemplate(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Create Custom Template</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name
                </label>
                <Input
                  value={customTemplate.name}
                  onChange={(e) =>
                    setCustomTemplate((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter template name..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  value={customTemplate.content}
                  onChange={(e) =>
                    setCustomTemplate((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter template content..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={customTemplate.category}
                    onChange={(e) =>
                      setCustomTemplate((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={customTemplate.priority}
                    onChange={(e) =>
                      setCustomTemplate((prev) => ({
                        ...prev,
                        priority: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowCreateTemplate(false)}
              >
                Cancel
              </Button>
              <Button onClick={saveCustomTemplate}>
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (compactMode) {
    return (
      <Card className={className}>
        <CardBody>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Special Instructions
              </label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowTemplateModal(true)}
              >
                <FileText className="w-4 h-4 mr-1" />
                Templates
              </Button>
            </div>
            <textarea
              value={instructions}
              onChange={(e) => handleInstructionsChange(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Add any special instructions for this order..."
            />
          </div>
          <TemplateModal />
          <CreateTemplateModal />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <MessageSquare className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Special Instructions Manager
            </h2>
            <p className="text-gray-600">
              Manage order instructions with smart templates and AI suggestions
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={generateAISuggestions}
            disabled={isGeneratingAI}
          >
            {isGeneratingAI ? (
              <Zap className="w-4 h-4 animate-pulse mr-2" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            AI Suggestions
          </Button>
          <Button onClick={() => setShowTemplateModal(true)}>
            <FileText className="w-4 h-4 mr-2" />
            Browse Templates
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Instructions Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Instructions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Order Instructions</h3>
                <div className="text-sm text-gray-500">
                  {instructions.length} characters
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <textarea
                value={instructions}
                onChange={(e) => handleInstructionsChange(e.target.value)}
                rows="8"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Enter special instructions for this order. You can use templates or type custom instructions..."
              />
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTemplateModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Template
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInstructionsChange("")}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(instructions);
                      toast.success("Instructions copied to clipboard");
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="sm">
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* AI Suggestions */}
          <AnimatePresence>
            {showAISuggestions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-yellow-600" />
                      <h3 className="text-lg font-semibold">AI Suggestions</h3>
                    </div>
                  </CardHeader>
                  <CardBody>
                    {isGeneratingAI ? (
                      <div className="flex items-center justify-center py-8">
                        <Zap className="w-6 h-6 animate-pulse text-yellow-600 mr-2" />
                        <span>Generating intelligent suggestions...</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {aiSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="p-3 border border-gray-200 rounded-lg hover:border-yellow-300 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {suggestion.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {suggestion.content}
                                </p>
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 block">
                                  {suggestion.action}
                                </code>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => applyAISuggestion(suggestion)}
                              >
                                Apply
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column - Templates and Quick Actions */}
        <div className="space-y-6">
          {/* Recently Used */}
          {recentlyUsed.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold">Recently Used</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {recentlyUsed.map((template) => (
                    <div
                      key={template.id}
                      className="p-2 border border-gray-200 rounded hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => applyTemplate(template)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">
                            {template.name}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {template.content}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Categories */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Template Categories</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setActiveCategory(category.id);
                        setShowTemplateModal(true);
                      }}
                      className={`w-full p-3 rounded-lg border text-left transition-colors hover:border-blue-300 ${getCategoryColor(
                        category.color
                      )}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4" />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <span className="text-sm">{category.count}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Quick Actions</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowCreateTemplate(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Template
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    const today = new Date().toISOString().split("T")[0];
                    const timeTemplates = templates.filter(
                      (t) => t.category === "timing"
                    );
                    if (timeTemplates.length > 0) {
                      applyTemplate(timeTemplates[0]);
                    }
                  }}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Add Timing Note
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    const deliveryTemplates = templates.filter(
                      (t) => t.category === "delivery"
                    );
                    if (deliveryTemplates.length > 0) {
                      applyTemplate(deliveryTemplates[0]);
                    }
                  }}
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Add Delivery Note
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    const specialTemplates = templates.filter(
                      (t) => t.category === "special"
                    );
                    if (specialTemplates.length > 0) {
                      applyTemplate(specialTemplates[0]);
                    }
                  }}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Add Special Handling
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <TemplateModal />
      <CreateTemplateModal />
    </div>
  );
};

export default SpecialInstructionsManager;

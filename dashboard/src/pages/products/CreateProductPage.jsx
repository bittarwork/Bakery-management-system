import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Eye,
  EyeOff,
  DollarSign,
  Package,
  Tag,
  FileText,
  Image,
  AlertCircle,
  Loader2,
  Star,
  Scale,
  Calendar,
  Thermometer,
  Truck,
  Heart,
  AlertTriangle,
  Info,
  CheckCircle,
  ShoppingBag,
  Barcode,
  Layers,
  Calculator,
  Package2,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { productService } from "../../services/productService";

const CreateProductPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "other",
    unit: "piece",
    price_eur: "",
    price_syp: "",
    cost_eur: "",
    cost_syp: "",
    stock_quantity: "",
    minimum_stock: "",
    barcode: "",
    is_featured: false,
    status: "active",
    image_url: "",
    weight_grams: "",
    shelf_life_days: "",
    expiry_date: "",
    production_date: "",
    dimensions_length: "",
    dimensions_width: "",
    dimensions_height: "",
    storage_conditions: "",
    supplier_info: "",
    nutritional_info: "",
    allergen_info: "",
  });
  const [errors, setErrors] = useState({});

  // Handle duplicate product functionality
  useEffect(() => {
    const duplicateId = searchParams.get("duplicate");
    if (duplicateId) {
      loadProductForDuplication(duplicateId);
    }
  }, [searchParams]);

  const loadProductForDuplication = async (productId) => {
    try {
      const response = await productService.getProduct(productId);
      if (response.success) {
        const originalProduct = response.data;
        // Copy product data but remove ID and add "Copy" to name
        setFormData({
          ...originalProduct,
          id: undefined, // Remove ID for new product
          name: `${originalProduct.name} (Copy)`,
          stock_quantity: "0", // Reset stock for new product
          created_at: undefined,
          updated_at: undefined,
        });
        toast.success("Product data loaded for duplication");
      }
    } catch (error) {
      console.error("Error loading product for duplication:", error);
      toast.error("Failed to load product for duplication");
    }
  };

  // Categories with icons and colors
  const categories = [
    {
      value: "bread",
      label: "Bread & Baked Goods",
      icon: "🍞",
      color: "bg-amber-100 text-amber-800",
    },
    {
      value: "pastry",
      label: "Pastries",
      icon: "🥐",
      color: "bg-orange-100 text-orange-800",
    },
    {
      value: "cake",
      label: "Cakes & Desserts",
      icon: "🎂",
      color: "bg-pink-100 text-pink-800",
    },
    {
      value: "drink",
      label: "Beverages",
      icon: "☕",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "snack",
      label: "Snacks",
      icon: "🥨",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "seasonal",
      label: "Seasonal Items",
      icon: "🎄",
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "other",
      label: "Other",
      icon: "📦",
      color: "bg-gray-100 text-gray-800",
    },
  ];

  const units = [
    { value: "piece", label: "Piece", icon: "🔢" },
    { value: "kg", label: "Kilogram", icon: "⚖️" },
    { value: "gram", label: "Gram", icon: "📏" },
    { value: "liter", label: "Liter", icon: "🥤" },
    { value: "ml", label: "Milliliter", icon: "💧" },
    { value: "box", label: "Box", icon: "📦" },
    { value: "pack", label: "Pack", icon: "📦" },
  ];

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.unit) {
      newErrors.unit = "Unit is required";
    }

    // Validate price_eur - must be positive number
    if (
      !formData.price_eur ||
      formData.price_eur === "" ||
      parseFloat(formData.price_eur) <= 0
    ) {
      newErrors.price_eur =
        "Valid price in EUR is required (must be greater than 0)";
    }

    // Validate price_syp - if provided, must be positive
    if (
      formData.price_syp &&
      formData.price_syp !== "" &&
      parseFloat(formData.price_syp) <= 0
    ) {
      newErrors.price_syp = "Price in SYP must be positive";
    }

    // Validate cost_eur - if provided, must be positive
    if (
      formData.cost_eur &&
      formData.cost_eur !== "" &&
      parseFloat(formData.cost_eur) < 0
    ) {
      newErrors.cost_eur = "Cost in EUR cannot be negative";
    }

    // Validate cost_syp - if provided, must be positive
    if (
      formData.cost_syp &&
      formData.cost_syp !== "" &&
      parseFloat(formData.cost_syp) < 0
    ) {
      newErrors.cost_syp = "Cost in SYP cannot be negative";
    }

    // Validate stock_quantity - if provided, must be non-negative
    if (
      formData.stock_quantity &&
      formData.stock_quantity !== "" &&
      (isNaN(parseInt(formData.stock_quantity)) || parseInt(formData.stock_quantity) < 0)
    ) {
      newErrors.stock_quantity = "Stock quantity cannot be negative";
    }

    // Validate minimum_stock - if provided, must be non-negative
    if (
      formData.minimum_stock &&
      formData.minimum_stock !== "" &&
      parseInt(formData.minimum_stock) < 0
    ) {
      newErrors.minimum_stock = "Minimum stock cannot be negative";
    }

    // Validate weight_grams - if provided, must be positive
    if (
      formData.weight_grams &&
      formData.weight_grams !== "" &&
      parseFloat(formData.weight_grams) <= 0
    ) {
      newErrors.weight_grams = "Weight must be positive";
    }

    // Validate shelf_life_days - if provided, must be positive
    if (
      formData.shelf_life_days &&
      formData.shelf_life_days !== "" &&
      parseInt(formData.shelf_life_days) <= 0
    ) {
      newErrors.shelf_life_days = "Shelf life must be positive";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      // Log original form data for debugging
      console.log(
        "[FRONTEND] Original form data:",
        JSON.stringify(formData, null, 2)
      );

      // Helper function to safely parse JSON text fields
      const parseJsonField = (fieldValue, fieldType = 'basic') => {
        if (!fieldValue || fieldValue.trim() === '') {
          return null;
        }
        
        const trimmedValue = fieldValue.trim();
        
        // Try to parse as JSON first (in case user pasted JSON)
        try {
          const parsed = JSON.parse(trimmedValue);
          if (typeof parsed === 'object' && parsed !== null) {
            return parsed;
          }
        } catch (e) {
          // Not JSON, treat as plain text
        }
        
        // Convert plain text to appropriate JSON structure
        switch (fieldType) {
          case 'supplier':
            return {
              name: trimmedValue,
              contact: "",
              notes: ""
            };
          case 'nutritional':
            return {
              description: trimmedValue,
              calories: null,
              protein: null,
              carbs: null,
              fat: null
            };
          case 'allergen':
            return {
              description: trimmedValue,
              contains: [],
              may_contain: []
            };
          default:
            return { description: trimmedValue };
        }
      };

      // Prepare form data with proper data types and null handling
      const productData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        category: formData.category || 'other',
        unit: formData.unit || 'piece',
        barcode: formData.barcode?.trim() || null,
        is_featured: Boolean(formData.is_featured),
        status: formData.status || 'active',
        
        // Required price in EUR (minimum 0.01)
        price_eur: formData.price_eur && 
                   !isNaN(parseFloat(formData.price_eur)) &&
                   parseFloat(formData.price_eur) > 0
                     ? parseFloat(formData.price_eur)
                     : 0.01,
        
        // Optional price in SYP
        price_syp: formData.price_syp && 
                   !isNaN(parseFloat(formData.price_syp)) &&
                   parseFloat(formData.price_syp) > 0
                     ? parseFloat(formData.price_syp)
                     : null,
        
        // Optional cost prices
        cost_eur: formData.cost_eur && 
                  !isNaN(parseFloat(formData.cost_eur)) &&
                  parseFloat(formData.cost_eur) >= 0
                    ? parseFloat(formData.cost_eur)
                    : null,
        
        cost_syp: formData.cost_syp && 
                  !isNaN(parseFloat(formData.cost_syp)) &&
                  parseFloat(formData.cost_syp) >= 0
                    ? parseFloat(formData.cost_syp)
                    : null,
        
        // Optional stock quantities
        stock_quantity: formData.stock_quantity && 
                        !isNaN(parseInt(formData.stock_quantity)) &&
                        parseInt(formData.stock_quantity) >= 0
                          ? parseInt(formData.stock_quantity)
                          : null,
        
        minimum_stock: formData.minimum_stock && 
                       !isNaN(parseInt(formData.minimum_stock)) &&
                       parseInt(formData.minimum_stock) >= 0
                         ? parseInt(formData.minimum_stock)
                         : null,
        
        // Optional physical properties
        weight_grams: formData.weight_grams && 
                      !isNaN(parseFloat(formData.weight_grams)) &&
                      parseFloat(formData.weight_grams) > 0
                        ? parseFloat(formData.weight_grams)
                        : null,
        
        shelf_life_days: formData.shelf_life_days && 
                         !isNaN(parseInt(formData.shelf_life_days)) &&
                         parseInt(formData.shelf_life_days) > 0
                           ? parseInt(formData.shelf_life_days)
                           : null,
        
        // Optional dates
        expiry_date: formData.expiry_date ? formData.expiry_date : null,
        production_date: formData.production_date ? formData.production_date : null,
        
        // Optional text fields
        storage_conditions: formData.storage_conditions?.trim() || null,
        
        // JSON fields - properly structured
        supplier_info: parseJsonField(formData.supplier_info, 'supplier'),
        nutritional_info: parseJsonField(formData.nutritional_info, 'nutritional'),
        allergen_info: parseJsonField(formData.allergen_info, 'allergen'),
        
        // Dimensions as JSON
        dimensions: (formData.dimensions_length || formData.dimensions_width || formData.dimensions_height) ? {
          length: formData.dimensions_length ? parseFloat(formData.dimensions_length) : null,
          width: formData.dimensions_width ? parseFloat(formData.dimensions_width) : null,
          height: formData.dimensions_height ? parseFloat(formData.dimensions_height) : null,
          unit: "cm"
        } : null
      };

      // Log processed product data for debugging
      console.log(
        "[FRONTEND] Processed product data:",
        JSON.stringify(productData, null, 2)
      );

      // Create product
      const response = await productService.createProduct(productData);

      if (response.success) {
        const productId = response.data.id;
        console.log("[FRONTEND] Product created with ID:", productId);
        
        // Upload image if selected
        if (selectedImage && productId) {
          try {
            console.log("[FRONTEND] Starting image upload for product:", productId);
            const imageResponse = await productService.uploadProductImage(selectedImage, productId);
            
            if (imageResponse.success) {
              console.log("[FRONTEND] Image uploaded successfully:", imageResponse.data.image_url);
              toast.success("Product created successfully with image!");
            } else {
              console.error("[FRONTEND] Image upload failed:", imageResponse.message);
              toast.success("Product created successfully, but image upload failed");
            }
          } catch (imageError) {
            console.error("[FRONTEND] Image upload error:", imageError);
            toast.success("Product created successfully, but image upload failed");
          }
        } else {
          toast.success("Product created successfully!");
        }

        // Navigate to product list after a short delay to ensure all operations complete
        setTimeout(() => {
          navigate("/products");
        }, 1000);
        
      } else {
        throw new Error(response.message || "Failed to create product");
      }
    } catch (error) {
      console.error("[FRONTEND] Error creating product:", error);
      
      // More specific error messages
      let errorMessage = "Failed to create product";
      if (error.message.includes("already exists")) {
        errorMessage = "A product with this name or barcode already exists";
      } else if (error.message.includes("validation")) {
        errorMessage = "Please check your input data and try again";
      } else if (error.message.includes("network")) {
        errorMessage = "Network error - please check your connection";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/products"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create New Product
                </h1>
                <p className="text-gray-600 mt-1">
                  Add a new product to your bakery inventory
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                icon={
                  showAdvancedFields ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )
                }
              >
                {showAdvancedFields ? "Hide" : "Show"} Advanced Fields
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Basic Information
                    </h2>
                    <p className="text-sm text-gray-600">
                      Essential product details
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                {/* Product Name & Description */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-1">
                    <Input
                      label="Product Name *"
                      name="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      error={errors.name}
                      placeholder="e.g., Chocolate Croissant"
                      icon={<ShoppingBag className="w-4 h-4" />}
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <Input
                      label="Barcode (Optional)"
                      name="barcode"
                      value={formData.barcode}
                      onChange={(e) => handleChange("barcode", e.target.value)}
                      error={errors.barcode}
                      placeholder="e.g., 1234567890123"
                      icon={<Barcode className="w-4 h-4" />}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    error={errors.description}
                    placeholder="Describe your product..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Category & Unit */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Category *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() =>
                            handleChange("category", category.value)
                          }
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.category === category.value
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="text-center">
                            <span className="text-2xl mb-1 block">
                              {category.icon}
                            </span>
                            <span className="text-xs font-medium text-gray-700">
                              {category.label}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                    {errors.category && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Unit *
                    </label>
                    <div className="space-y-2">
                      {units.map((unit) => (
                        <button
                          key={unit.value}
                          type="button"
                          onClick={() => handleChange("unit", unit.value)}
                          className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                            formData.unit === unit.value
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-lg">{unit.icon}</span>
                          <span className="text-sm font-medium text-gray-700">
                            {unit.label}
                          </span>
                        </button>
                      ))}
                    </div>
                    {errors.unit && (
                      <p className="text-red-500 text-xs mt-1">{errors.unit}</p>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Pricing & Inventory Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Pricing & Inventory
                    </h2>
                    <p className="text-sm text-gray-600">
                      Set prices and manage stock
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                {/* Pricing */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900">
                        Selling Prices
                      </span>
                    </div>
                    <Input
                      label="Price in EUR *"
                      name="price_eur"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.price_eur}
                      onChange={(e) =>
                        handleChange("price_eur", e.target.value)
                      }
                      error={errors.price_eur}
                      placeholder="0.00"
                      icon={<span className="text-gray-500">€</span>}
                    />
                    <Input
                      label="Price in SYP (Optional)"
                      name="price_syp"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price_syp}
                      onChange={(e) =>
                        handleChange("price_syp", e.target.value)
                      }
                      error={errors.price_syp}
                      placeholder="0.00"
                      icon={<span className="text-gray-500">₽</span>}
                    />
                  </div>

                  {showAdvancedFields && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Calculator className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">
                          Cost Prices
                        </span>
                      </div>
                      <Input
                        label="Cost in EUR (Optional)"
                        name="cost_eur"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.cost_eur}
                        onChange={(e) =>
                          handleChange("cost_eur", e.target.value)
                        }
                        error={errors.cost_eur}
                        placeholder="0.00"
                        icon={<span className="text-gray-500">€</span>}
                      />
                      <Input
                        label="Cost in SYP (Optional)"
                        name="cost_syp"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.cost_syp}
                        onChange={(e) =>
                          handleChange("cost_syp", e.target.value)
                        }
                        error={errors.cost_syp}
                        placeholder="0.00"
                        icon={<span className="text-gray-500">₽</span>}
                      />
                    </div>
                  )}
                </div>

                {/* Stock Management */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Package2 className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-900">
                      Stock Management
                    </span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Input
                      label="Current Stock"
                      name="stock_quantity"
                      type="number"
                      min="0"
                      value={formData.stock_quantity}
                      onChange={(e) =>
                        handleChange("stock_quantity", e.target.value)
                      }
                      error={errors.stock_quantity}
                      placeholder="0"
                      icon={<Package className="w-4 h-4" />}
                    />
                    <Input
                      label="Minimum Stock Alert"
                      name="minimum_stock"
                      type="number"
                      min="0"
                      value={formData.minimum_stock}
                      onChange={(e) =>
                        handleChange("minimum_stock", e.target.value)
                      }
                      error={errors.minimum_stock}
                      placeholder="0"
                      icon={<AlertTriangle className="w-4 h-4" />}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Product Image Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Image className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Product Image
                    </h2>
                    <p className="text-sm text-gray-600">
                      Upload an image for your product
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="flex flex-col items-center justify-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-48 h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mb-4" />
                      <span className="text-sm font-medium text-gray-600">
                        Upload Image
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 5MB
                      </span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Advanced Fields */}
          {showAdvancedFields && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Advanced Details
                      </h2>
                      <p className="text-sm text-gray-600">
                        Additional product information
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="space-y-6">
                  {/* Physical Properties */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Input
                      label="Weight (grams)"
                      name="weight_grams"
                      type="number"
                      min="0"
                      value={formData.weight_grams}
                      onChange={(e) =>
                        handleChange("weight_grams", e.target.value)
                      }
                      error={errors.weight_grams}
                      placeholder="0"
                      icon={<Scale className="w-4 h-4" />}
                    />
                    <Input
                      label="Shelf Life (days)"
                      name="shelf_life_days"
                      type="number"
                      min="1"
                      value={formData.shelf_life_days}
                      onChange={(e) =>
                        handleChange("shelf_life_days", e.target.value)
                      }
                      error={errors.shelf_life_days}
                      placeholder="7"
                      icon={<Calendar className="w-4 h-4" />}
                    />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Input
                      label="Production Date"
                      name="production_date"
                      type="date"
                      value={formData.production_date}
                      onChange={(e) =>
                        handleChange("production_date", e.target.value)
                      }
                      error={errors.production_date}
                      icon={<Calendar className="w-4 h-4" />}
                    />
                    <Input
                      label="Expiry Date"
                      name="expiry_date"
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) =>
                        handleChange("expiry_date", e.target.value)
                      }
                      error={errors.expiry_date}
                      icon={<Calendar className="w-4 h-4" />}
                    />
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Storage Conditions
                      </label>
                      <textarea
                        name="storage_conditions"
                        value={formData.storage_conditions}
                        onChange={(e) =>
                          handleChange("storage_conditions", e.target.value)
                        }
                        placeholder="e.g., Store in cool, dry place"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Supplier Information
                      </label>
                      <textarea
                        name="supplier_info"
                        value={formData.supplier_info}
                        onChange={(e) =>
                          handleChange("supplier_info", e.target.value)
                        }
                        placeholder="Supplier name and contact details"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nutritional Information
                      </label>
                      <textarea
                        name="nutritional_info"
                        value={formData.nutritional_info}
                        onChange={(e) =>
                          handleChange("nutritional_info", e.target.value)
                        }
                        placeholder="Calories, ingredients, etc."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allergen Information
                      </label>
                      <textarea
                        name="allergen_info"
                        value={formData.allergen_info}
                        onChange={(e) =>
                          handleChange("allergen_info", e.target.value)
                        }
                        placeholder="Contains nuts, gluten, etc."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {/* Status & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardBody>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) =>
                          handleChange("is_featured", e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        Featured Product
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/products")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting}
                      icon={
                        isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )
                      }
                    >
                      {isSubmitting ? "Creating..." : "Create Product"}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductPage;

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Calculator,
  Store,
  Package,
  DollarSign,
  Euro,
  Gift,
  Percent,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  Minus,
  Eye,
  Search,
  ShoppingCart,
  Tag,
  Clock,
  CreditCard,
  MapPin,
  Phone,
  User,
  Building,
  TrendingUp,
  Settings,
  Globe,
  Zap,
  Target,
  Activity,
  Star,
  Heart,
  Award,
  Shield,
  Bookmark,
  Flag,
  Bell,
  Mail,
  MessageSquare,
  Camera,
  Image,
  Video,
  Music,
  Headphones,
  Mic,
  Speaker,
  Radio,
  Tv,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Printer,
  Keyboard,
  Mouse,
  Gamepad,
  Joystick,
  Dice,
  Crown,
  Diamond,
  Gem,
  Fire,
  Flame,
  Bolt,
  Thunder,
  Sun,
  Moon,
  Star as StarIcon,
  Cloud,
  Snowflake,
  Droplet,
  Umbrella,
  Wind,
  Thermometer,
  Compass,
  Map,
  Navigation,
  Anchor,
  Ship,
  Plane,
  Car,
  Bike,
  Bus,
  Train,
  Truck,
  Taxi,
  Fuel,
  Battery,
  Plug,
  Wifi,
  Bluetooth,
  Signal,
  Satellite,
  Radar,
  Rss,
  Hash,
  AtSign,
  Percent as PercentIcon,
  Currency,
  CurrencyDollar,
  CurrencyEuro,
  CurrencyPound,
  CurrencyYen,
  Coins,
  Wallet,
  CreditCard as CreditCardIcon,
  BankAccount,
  Receipt,
  Invoice,
  BarChart,
  LineChart,
  PieChart,
  TrendingDown,
  BarChart2,
  BarChart3,
  BarChart4,
  Activity as ActivityIcon,
  Analytics,
  ChartArea,
  ChartBar,
  ChartLine,
  ChartPie,
  ChartSpline,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpLeft,
  ArrowDownLeft,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
  Move,
  MoveUp,
  MoveDown,
  MoveLeft,
  MoveRight,
  RotateCw,
  RotateCcw,
  Repeat,
  Repeat1,
  Repeat2,
  Shuffle,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  Play,
  Pause,
  Stop,
  Record,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Edit,
  Edit2,
  Edit3,
  Pencil,
  PenTool,
  Eraser,
  Paintbrush,
  Paintbrush2,
  Palette,
  Pipette,
  Scissors,
  Ruler,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Pentagon,
  Polygon,
  Shapes,
  Box,
  Cube,
  Cylinder,
  Cone,
  Sphere,
  Pyramid,
  Torus,
  Dodecahedron,
  Icosahedron,
  Tetrahedron,
  Cuboid,
  Prism,
  Frustum,
  Ellipse,
  Oval,
  Rectangle,
  RoundedRect,
  Rhombus,
  Parallelogram,
  Trapezoid,
  Kite,
  Star5,
  Star6,
  Star8,
  Heart as HeartIcon,
  Diamond as DiamondIcon,
  Spade,
  Club,
  Flower,
  Leaf,
  Tree,
  Seedling,
  Sprout,
  Cactus,
  Flower2,
  Cherry,
  Apple,
  Banana,
  Orange,
  Grape,
  Watermelon,
  Strawberry,
  Lemon,
  Lime,
  Coconut,
  Peach,
  Pear,
  Pineapple,
  Mango,
  Avocado,
  Eggplant,
  Potato,
  Carrot,
  Corn,
  Pepper,
  Tomato,
  Cucumber,
  Lettuce,
  Onion,
  Garlic,
  Mushroom,
  Broccoli,
  Cabbage,
  Spinach,
  Kale,
  Celery,
  Asparagus,
  Artichoke,
  Beet,
  Radish,
  Turnip,
  Parsnip,
  Leek,
  Scallion,
  Shallot,
  Chive,
  Dill,
  Parsley,
  Cilantro,
  Basil,
  Oregano,
  Thyme,
  Rosemary,
  Sage,
  Mint,
  Lavender,
  Chamomile,
  Ginger,
  Turmeric,
  Cardamom,
  Cinnamon,
  Nutmeg,
  Clove,
  Vanilla,
  Saffron,
  Paprika,
  Cumin,
  Coriander,
  Fennel,
  Anise,
  Allspice,
  Peppercorn,
  ChiliPepper,
  Jalapeno,
  Habanero,
  Serrano,
  Poblano,
  Anaheim,
  Chipotle,
  Cayenne,
  Tabasco,
  Sriracha,
  Wasabi,
  Horseradish,
  Mustard,
  Ketchup,
  Mayo,
  Bbq,
  Soy,
  Teriyaki,
  Hoisin,
  Oyster,
  Fish,
  Worcestershire,
  Tabasco as TabascoIcon,
  HotSauce,
  Salsa,
  Guacamole,
  Hummus,
  Pesto,
  Alfredo,
  Marinara,
  Bolognese,
  Carbonara,
  Puttanesca,
  Arrabiata,
  Aglio,
  Cacio,
  Amatriciana,
  Napoletana,
  Pomodoro,
  Pesto as PestoIcon,
  Aioli,
  Chimichurri,
  Chermoula,
  Harissa,
  Tzatziki,
  Tahini,
  Baba,
  Falafel,
  Shawarma,
  Kebab,
  Gyros,
  Souvlaki,
  Moussaka,
  Spanakopita,
  Dolma,
  Baklava,
  Halva,
  Lokum,
  Kanafeh,
  Muhallabia,
  Basbousa,
  Qatayef,
  Maamoul,
  Ghraybeh,
  Nougat,
  Dragee,
  Bonbon,
  Truffle,
  Praline,
  Ganache,
  Fondant,
  Marzipan,
  Icing,
  Glaze,
  Frosting,
  Buttercream,
  Meringue,
  Custard,
  Pudding,
  Mousse,
  Soufflé,
  Flan,
  Crème,
  Brûlée,
  Tart,
  Pie,
  Cake,
  Cupcake,
  Muffin,
  Scone,
  Biscuit,
  Cookie,
  Macaroon,
  Macaron,
  Eclair,
  Profiterole,
  Choux,
  Pastry,
  Croissant,
  Brioche,
  Baguette,
  Sourdough,
  Rye,
  Wheat,
  Oat,
  Barley,
  Millet,
  Quinoa,
  Rice,
  Pasta,
  Noodle,
  Ramen,
  Soba,
  Udon,
  Pho,
  Pad,
  Thai,
  Curry,
  Masala,
  Biryani,
  Tandoori,
  Naan,
  Chapati,
  Roti,
  Paratha,
  Puri,
  Samosa,
  Pakora,
  Bhaji,
  Chutney,
  Raita,
  Lassi,
  Chai,
  Matcha,
  Latte,
  Cappuccino,
  Espresso,
  Americano,
  Mocha,
  Macchiato,
  Frappé,
  Smoothie,
  Milkshake,
  Juice,
  Soda,
  Beer,
  Wine,
  Champagne,
  Cocktail,
  Martini,
  Whiskey,
  Rum,
  Vodka,
  Gin,
  Tequila,
  Brandy,
  Cognac,
  Liqueur,
  Absinthe,
  Sake,
  Soju,
  Baijiu,
  Rakı,
  Ouzo,
  Grappa,
  Schnapps,
  Aquavit,
  Pastis,
  Sambuca,
  Amaretto,
  Baileys,
  Kahlua,
  Cointreau,
  Chambord,
  Drambuie,
  Frangelico,
  Galliano,
  Goldschläger,
  Hypnotiq,
  Jägermeister,
  Kahlúa,
  Limoncello,
  Midori,
  Pernod,
  Sambuca as SambucaIcon,
  Tia,
  Maria,
  Triple,
  Sec,
  Vermouth,
  Aperol,
  Campari,
  Cynar,
  Fernet,
  Amaro,
  Bitters,
  Angostura,
  Peychaud,
  Lemon as LemonIcon,
  Lime as LimeIcon,
  Grapefruit,
  Bitters as BittersIcon,
  Simple,
  Syrup,
  Honey,
  Agave,
  Maple,
  Molasses,
  Brown,
  Sugar,
  Stevia,
  Monk,
  Fruit,
  Coconut as CoconutIcon,
  Palm,
  Fig,
  Raisin,
  Cranberry,
  Blueberry,
  Raspberry,
  Blackberry,
  Elderberry,
  Gooseberry,
  Currant,
  Mulberry,
  Boysenberry,
  Huckleberry,
  Lingonberry,
  Cloudberry,
  Salmonberry,
  Thimbleberry,
  Dewberry,
  Loganberry,
  Tayberry,
  Marionberry,
  Olallieberry,
  Jostaberry,
  Honeyberry,
  Goji,
  Acai,
  Pomegranate,
  Passion,
  Kiwi,
  Persimmon,
  Jackfruit,
  Durian,
  Rambutan,
  Lychee,
  Longan,
  Mangosteen,
  Guava,
  Papaya,
  Starfruit,
  Dragonfruit,
  Pitaya,
  Custard as CustardIcon,
  Cherimoya,
  Atemoya,
  Soursop,
  Breadfruit,
  Plantain,
  Taro,
  Yam,
  Cassava,
  Jicama,
  Kohlrabi,
  Rutabaga,
  Daikon,
  Bok,
  Choy,
  Napa,
  Watercress,
  Arugula,
  Endive,
  Escarole,
  Radicchio,
  Frisée,
  Mache,
  Mizuna,
  Tatsoi,
  Komatsuna,
  Shungiku,
  Chrysanthemum,
  Dandelion,
  Nettle,
  Plantain as PlantainIcon,
  Purslane,
  Lamb,
  Quarters,
  Mallow,
  Chickweed,
  Clover,
  Violet,
  Nasturtium,
  Borage,
  Calendula,
  Elderflower,
  Hibiscus,
  Jasmine,
  Rose,
  Geranium,
  Carnation,
  Peony,
  Lily,
  Iris,
  Daffodil,
  Tulip,
  Hyacinth,
  Crocus,
  Snowdrop,
  Bluebell,
  Primrose,
  Poppy,
  Sunflower,
  Daisy,
  Marigold,
  Zinnia,
  Cosmos,
  Petunia,
  Impatiens,
  Begonia,
  Geranium as GeraniumIcon,
  Fuchsia,
  Lobelia,
  Salvia,
  Verbena,
  Vinca,
  Coleus,
  Caladium,
  Elephant,
  Ear,
  Hosta,
  Fern,
  Moss,
  Lichen,
  Algae,
  Seaweed,
  Kelp,
  Coral,
  Sponge,
  Starfish,
  Urchin,
  Anemone,
  Jellyfish,
  Octopus,
  Squid,
  Cuttlefish,
  Nautilus,
  Conch,
  Snail,
  Slug,
  Worm,
  Leech,
  Centipede,
  Millipede,
  Spider,
  Scorpion,
  Tick,
  Mite,
  Flea,
  Louse,
  Beetle,
  Ladybug,
  Firefly,
  Glowworm,
  Grasshopper,
  Cricket,
  Cicada,
  Locust,
  Mantis,
  Walkingstick,
  Earwig,
  Silverfish,
  Cockroach,
  Termite,
  Ant,
  Bee,
  Wasp,
  Hornet,
  Yellowjacket,
  Bumblebee,
  Honeybee,
  Carpenter,
  Mason,
  Leafcutter,
  Sweat,
  Mining,
  Plasterer,
  Nomad,
  Cuckoo,
  Orchid,
  Butterfly,
  Moth,
  Caterpillar,
  Chrysalis,
  Cocoon,
  Dragonfly,
  Damselfly,
  Mayfly,
  Stonefly,
  Caddisfly,
  Lacewing,
  Antlion,
  Dobsonfly,
  Fishfly,
  Alderfly,
  Snakefly,
  Scorpionfly,
  Hangingfly,
  Bittacus,
  Boreus,
  Panorpa,
  Mecoptera,
  Siphonaptera,
  Phthiraptera,
  Thysanura,
  Diplura,
  Protura,
  Collembola,
  Springtail,
  Thrips,
  Aphid,
  Whitefly,
  Scale,
  Mealybug,
  Psyllid,
  Adelgid,
  Phylloxera,
  Leafhopper,
  Planthopper,
  Treehopper,
  Spittlebug,
  Froghopper,
  Mirid,
  Lygus,
  Chinch,
  Squash,
  Stink,
  Pentatomid,
  Assassin,
  Ambush,
  Thread,
  Legged,
  Damsel,
  Nabid,
  Reduviid,
  Wheel,
  Corixid,
  Backswimmer,
  Water,
  Boatman,
  Strider,
  Gerrid,
  Pond,
  Skater,
  Broad,
  Shouldered,
  Nepid,
  Giant,
  Belostomatid,
  Toe,
  Biter,
  Creeping,
  Naucorid,
  Backswimmer as BackswimmerIcon,
  Notonectid,
  Pygmy,
  Pleomorphic,
  Hebrid,
  Velvet,
  Mesoveliid,
  Riffle,
  Veliid,
  Shouldered as ShoulderedIcon,
  Gelastocorid,
  Toad,
  Ochterid,
  Velvety,
  Shore,
  Saldid,
  Minute,
  Pirate,
  Anthocorid,
  Orius,
  Deraeocorid,
  Omnivorous,
  Dicyphus,
  Macrolophus,
  Nesidiocoris,
  Cyrtopeltis,
  Campylomma,
  Chlamydatus,
  Pilophorus,
  Plagiognathus,
  Psallus,
  Stenodema,
  Trigonotylus,
  Adelphocoris,
  Lygus as LygusIcon,
  Poecilocapsus,
  Pseudatomoscelis,
  Tropidosteptes,
  Neurocolpus,
  Phytocoris,
  Europiella,
  Reuteroscopus,
  Blepharidopterus,
  Atractotomus,
  Orthotylus,
  Strongylocoris,
  Heterotoma,
  Megalocoleus,
  Monosynamma,
  Halticus,
  Labops,
  Parthenicus,
  Slaterocoris,
  Calocoris,
  Closterotomus,
  Lygocoris,
  Miridius,
  Polymerus,
  Capsus,
  Rhyparochromus,
  Stygnocoris,
  Trapezonotus,
  Raglius,
  Peritrechus,
  Scolopostethus,
  Drymus,
  Ischnorhynchus,
  Kleidocerys,
  Cymus,
  Ischnodemus,
  Rhyparochromus as RhyparochromusIcon,
  Stygnocoris as StygnocorisIcon,
  Trapezonotus as TrapezonotusIcon,
  Raglius as RagliusIcon,
  Peritrechus as PeritrachusIcon,
  Scolopostethus as ScolopostethusIcon,
  Drymus as DrymusIcon,
  Ischnorhynchus as IschnorhynchusIcon,
  Kleidocerys as KleidocerysIcon,
  Cymus as CymusIcon,
  Ischnodemus as IschnodemusIcon,
  Ozophora,
  Pachygrontha,
  Eremocoris,
  Geocoris,
  Chilacis,
  Emblethis,
  Ligyrocoris,
  Heterogaster,
  Plinthisus,
  Pamera,
  Tempyra,
  Ninyas,
  Ortholomus,
  Eremoplanus,
  Heraeus,
  Leptoglossus,
  Acanthocephala,
  Chondrocera,
  Chelinidea,
  Narnia,
  Pachylis,
  Thasus,
  Mozena,
  Archimerus,
  Zicca,
  Prionosoma,
  Hypselonotus,
  Anisoscelis,
  Leptoscelis,
  Acanthocephala as AcanthocephalaIcon,
  Chondrocera as ChondroceraIcon,
  Chelinidea as ChelinideaIcon,
  Narnia as NarniaIcon,
  Pachylis as PachylisIcon,
  Thasus as ThasusIcon,
  Mozena as MozenaIcon,
  Archimerus as ArchimerusIcon,
  Zicca as ZiccaIcon,
  Prionosoma as PrionosomaIcon,
  Hypselonotus as HypselonotusIcon,
  Anisoscelis as AnisoscelisIcon,
  Leptoscelis as LeptoscelisIcon,
  Acanthocephala as AcanthocephalaIcon2,
  Chondrocera as ChondroceraIcon2,
  Chelinidea as ChelinideaIcon2,
  Narnia as NarniaIcon2,
  Pachylis as PachylisIcon2,
  Thasus as ThasusIcon2,
  Mozena as MozenaIcon2,
  Archimerus as ArchimerusIcon2,
  Zicca as ZiccaIcon2,
  Prionosoma as PrionosomaIcon2,
  Hypselonotus as HypselonotusIcon2,
  Anisoscelis as AnisoscelisIcon2,
  Leptoscelis as LeptoscelisIcon2,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { orderService } from "../../services/orderService";
import storeService from "../../services/storeService";
import { productService } from "../../services/productService";
import { toast } from "react-hot-toast";

const CreateOrderPage = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    store_id: "",
    order_date: new Date().toISOString().split("T")[0],
    delivery_date: "",
    currency: "EUR",
    exchange_rate: 2500, // Default EUR to SYP rate
    discount_amount: 0,
    notes: "",
    items: [],
  });

  // Supporting data
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Product selection modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Currency calculator
  const [showCurrencyCalculator, setShowCurrencyCalculator] = useState(false);
  const [calculatorAmount, setCalculatorAmount] = useState(0);
  const [calculatorFromCurrency, setCalculatorFromCurrency] = useState("EUR");

  // Load initial data
  useEffect(() => {
    fetchStores();
    fetchProducts();
  }, []);

  // Fetch stores
  const fetchStores = async () => {
    try {
      const response = await storeService.getStores({ limit: 1000 });
      if (response.success) {
        setStores(response.data.stores || []);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("Failed to load stores");
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await productService.getProducts({
        limit: 1000,
        status: "active",
      });
      if (response.success) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  };

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Add new item to order
  const addItem = (product = null) => {
    const newItem = {
      id: Date.now(),
      product_id: product?.id || "",
      product_name: product?.name || "",
      quantity: 1,
      unit_price_eur: product?.price_eur || 0,
      unit_price_syp: product?.price_syp || 0,
      discount_amount: 0,
      gift_quantity: 0,
      gift_reason: "",
      notes: "",
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    setShowProductModal(false);
    setSelectedProduct(null);
  };

  // Remove item from order
  const removeItem = (itemId) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  // Update item in order
  const updateItem = (itemId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
  };

  // Calculate item total
  const calculateItemTotal = (item) => {
    const currency = formData.currency;
    const unitPrice =
      currency === "EUR" ? item.unit_price_eur : item.unit_price_syp;
    const subtotal = item.quantity * unitPrice;
    const total = subtotal - (item.discount_amount || 0);
    return Math.max(0, total);
  };

  // Calculate order totals
  const calculateOrderTotals = () => {
    const itemsTotal = formData.items.reduce(
      (sum, item) => sum + calculateItemTotal(item),
      0
    );
    const finalTotal = itemsTotal - (formData.discount_amount || 0);

    return {
      itemsTotal: itemsTotal.toFixed(2),
      orderDiscount: (formData.discount_amount || 0).toFixed(2),
      finalTotal: Math.max(0, finalTotal).toFixed(2),
    };
  };

  // Convert currency
  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return amount;

    if (fromCurrency === "EUR" && toCurrency === "SYP") {
      return amount * formData.exchange_rate;
    } else if (fromCurrency === "SYP" && toCurrency === "EUR") {
      return amount / formData.exchange_rate;
    }

    return amount;
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.store_id) {
      newErrors.store_id = "Store is required";
    }

    if (!formData.order_date) {
      newErrors.order_date = "Order date is required";
    }

    if (formData.items.length === 0) {
      newErrors.items = "At least one item is required";
    }

    formData.items.forEach((item, index) => {
      if (!item.product_id) {
        newErrors[`items.${index}.product_id`] = "Product is required";
      }
      if (!item.quantity || item.quantity <= 0) {
        newErrors[`items.${index}.quantity`] =
          "Quantity must be greater than 0";
      }
    });

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

    setIsLoading(true);

    try {
      // Prepare order data
      const orderData = {
        store_id: parseInt(formData.store_id),
        order_date: formData.order_date,
        delivery_date: formData.delivery_date || null,
        currency: formData.currency,
        exchange_rate: formData.exchange_rate,
        discount_amount: formData.discount_amount || 0,
        notes: formData.notes || "",
        items: formData.items.map((item) => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
          unit_price:
            formData.currency === "EUR"
              ? item.unit_price_eur
              : item.unit_price_syp,
          discount_amount: item.discount_amount || 0,
          gift_quantity: item.gift_quantity || 0,
          gift_reason: item.gift_reason || "",
          notes: item.notes || "",
        })),
      };

      const response = await orderService.createOrder(orderData);

      if (response.success) {
        toast.success("Order created successfully!");
        navigate(`/orders/${response.data.id}`);
      } else {
        toast.error(response.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products for modal
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Product selection modal
  const ProductSelectionModal = () => (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        showProductModal ? "block" : "hidden"
      }`}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Select Product</h2>
            <Button variant="ghost" onClick={() => setShowProductModal(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <Input
            placeholder="Search products..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            icon={Search}
          />
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardBody onClick={() => addItem(product)}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {product.category}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm font-medium text-green-600">
                          €{product.price_eur}
                        </span>
                        <span className="text-xs text-gray-400">|</span>
                        <span className="text-sm font-medium text-purple-600">
                          {product.price_syp} SYP
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Currency calculator component
  const CurrencyCalculator = () => (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        showCurrencyCalculator ? "block" : "hidden"
      }`}
    >
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Currency Calculator</h2>
            <Button
              variant="ghost"
              onClick={() => setShowCurrencyCalculator(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <Input
              type="number"
              value={calculatorAmount}
              onChange={(e) =>
                setCalculatorAmount(parseFloat(e.target.value) || 0)
              }
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Currency
            </label>
            <select
              value={calculatorFromCurrency}
              onChange={(e) => setCalculatorFromCurrency(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="EUR">EUR</option>
              <option value="SYP">SYP</option>
            </select>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Exchange Rate: 1 EUR = {formData.exchange_rate} SYP
              </p>
              <div className="mt-2 text-lg font-bold">
                {calculatorFromCurrency === "EUR" ? (
                  <span className="text-purple-600">
                    {(calculatorAmount * formData.exchange_rate).toFixed(2)} SYP
                  </span>
                ) : (
                  <span className="text-green-600">
                    €{(calculatorAmount / formData.exchange_rate).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Update Exchange Rate
            </label>
            <Input
              type="number"
              value={formData.exchange_rate}
              onChange={(e) =>
                handleFieldChange(
                  "exchange_rate",
                  parseFloat(e.target.value) || 2500
                )
              }
              placeholder="Exchange rate"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Get totals
  const totals = calculateOrderTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/orders" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Order
            </h1>
            <p className="text-gray-600 mt-1">
              Add products and configure order details
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowCurrencyCalculator(true)}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculator
          </Button>
          <Button variant="outline" onClick={() => navigate("/orders")}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Order
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Information */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Order Information</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Store Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store *
                </label>
                <select
                  value={formData.store_id}
                  onChange={(e) =>
                    handleFieldChange("store_id", e.target.value)
                  }
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.store_id ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select a store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
                {errors.store_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.store_id}</p>
                )}
              </div>

              {/* Order Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Date *
                </label>
                <Input
                  type="date"
                  value={formData.order_date}
                  onChange={(e) =>
                    handleFieldChange("order_date", e.target.value)
                  }
                  error={errors.order_date}
                />
              </div>

              {/* Delivery Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Date
                </label>
                <Input
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) =>
                    handleFieldChange("delivery_date", e.target.value)
                  }
                  min={formData.order_date}
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    handleFieldChange("currency", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="SYP">SYP (ل.س)</option>
                </select>
              </div>

              {/* Order Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Discount ({formData.currency})
                </label>
                <Input
                  type="number"
                  value={formData.discount_amount}
                  onChange={(e) =>
                    handleFieldChange(
                      "discount_amount",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleFieldChange("notes", e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any special instructions or notes..."
              />
            </div>
          </CardBody>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Order Items</h2>
              <Button type="button" onClick={() => setShowProductModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            {errors.items && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.items}</p>
              </div>
            )}

            {formData.items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No items added yet</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowProductModal(true)}
                  className="mt-3"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Product
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                      {/* Product */}
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product
                        </label>
                        <select
                          value={item.product_id}
                          onChange={(e) => {
                            const product = products.find(
                              (p) => p.id === parseInt(e.target.value)
                            );
                            updateItem(item.id, "product_id", e.target.value);
                            updateItem(
                              item.id,
                              "product_name",
                              product?.name || ""
                            );
                            updateItem(
                              item.id,
                              "unit_price_eur",
                              product?.price_eur || 0
                            );
                            updateItem(
                              item.id,
                              "unit_price_syp",
                              product?.price_syp || 0
                            );
                          }}
                          className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`items.${index}.product_id`]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select product</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                        {errors[`items.${index}.product_id`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`items.${index}.product_id`]}
                          </p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "quantity",
                              parseInt(e.target.value) || 0
                            )
                          }
                          min="1"
                          error={errors[`items.${index}.quantity`]}
                        />
                      </div>

                      {/* Unit Price */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Price ({formData.currency})
                        </label>
                        <Input
                          type="number"
                          value={
                            formData.currency === "EUR"
                              ? item.unit_price_eur
                              : item.unit_price_syp
                          }
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              formData.currency === "EUR"
                                ? "unit_price_eur"
                                : "unit_price_syp",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          step="0.01"
                          min="0"
                        />
                      </div>

                      {/* Discount */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount ({formData.currency})
                        </label>
                        <Input
                          type="number"
                          value={item.discount_amount}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "discount_amount",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                        />
                      </div>

                      {/* Total & Actions */}
                      <div className="flex items-end justify-between">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total
                          </label>
                          <div className="text-lg font-bold text-green-600">
                            {formData.currency === "EUR" ? "€" : "ل.س"}
                            {calculateItemTotal(item).toFixed(2)}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Gift Section */}
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Gift className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">
                          Gift Items
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gift Quantity
                          </label>
                          <Input
                            type="number"
                            value={item.gift_quantity}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "gift_quantity",
                                parseInt(e.target.value) || 0
                              )
                            }
                            min="0"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gift Reason
                          </label>
                          <Input
                            value={item.gift_reason}
                            onChange={(e) =>
                              updateItem(item.id, "gift_reason", e.target.value)
                            }
                            placeholder="e.g., Loyal customer, Special occasion..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Item Notes */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Notes
                      </label>
                      <Input
                        value={item.notes}
                        onChange={(e) =>
                          updateItem(item.id, "notes", e.target.value)
                        }
                        placeholder="Special instructions for this item..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Order Summary */}
        {formData.items.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Order Summary</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Items Total:</span>
                  <span className="font-medium">
                    {formData.currency === "EUR" ? "€" : "ل.س"}
                    {totals.itemsTotal}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Order Discount:</span>
                  <span className="font-medium text-red-600">
                    -{formData.currency === "EUR" ? "€" : "ل.س"}
                    {totals.orderDiscount}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Final Total:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formData.currency === "EUR" ? "€" : "ل.س"}
                      {totals.finalTotal}
                    </span>
                  </div>
                </div>

                {/* Currency conversion display */}
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-600 text-center">
                    <p>Exchange Rate: 1 EUR = {formData.exchange_rate} SYP</p>
                    <p className="mt-1">
                      {formData.currency === "EUR" ? (
                        <span>
                          Equivalent:{" "}
                          <strong>
                            {(
                              parseFloat(totals.finalTotal) *
                              formData.exchange_rate
                            ).toFixed(2)}{" "}
                            SYP
                          </strong>
                        </span>
                      ) : (
                        <span>
                          Equivalent:{" "}
                          <strong>
                            €
                            {(
                              parseFloat(totals.finalTotal) /
                              formData.exchange_rate
                            ).toFixed(2)}
                          </strong>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </form>

      {/* Modals */}
      <ProductSelectionModal />
      <CurrencyCalculator />
    </div>
  );
};

export default CreateOrderPage;

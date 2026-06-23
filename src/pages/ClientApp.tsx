import React, { useState, useEffect, useMemo, useRef } from "react";
import { supabase, supabaseUrl, supabaseKey } from "../lib/supabase";
import { db } from "../lib/db";
import {
  BilingualSearchEngine,
  InvertedIndexSearch,
} from "../lib/SearchEngine";
import PromotionalBannersSection from "../components/PromotionalBannersSection";
import { PriceDisplay } from "../components/PriceDisplay";
import { formatCurrency } from "../lib/storage";
import {
  Product,
  Promotion,
  Order,
  OrderStatusLog,
  Customer,
  Message,
  CartItem,
  Coupon,
  Niche,
  SellerProfile,
  MarketplaceAd,
  Review,
  PromotionalBanner,
} from "../types";
import { getProductPriceForQty } from "../utils/pricing";
import {
  ShoppingCart,
  Search,
  User,
  Zap,
  MessageSquare,
  MessageCircle,
  Menu,
  X,
  Trash,
  Phone,
  ArrowUpDown,
  Image as ImageIcon,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Check,
  MapPin,
  Mail,
  Globe,
  LogOut,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Eye,
  EyeOff,
  ExternalLink,
  Lock,
  Package,
  Clock,
  Paperclip,
  Download,
  Smartphone,
  Shirt,
  Sofa,
  Heart,
  CarFront,
  ShoppingBag,
  TrendingUp,
  History,
  Store,
  Shuffle,
  Sparkles,
  Gift,
  Award,
  Bell,
  Bot,
  Camera,
  RefreshCw,
  Coins,
  Star,
  Tag,
  Ticket,
  Activity,
  Cpu,
  FileText,
  Laptop,
  Baby,
  Palette,
  Coffee,
  Dumbbell,
  Scissors,
  Briefcase,
  Headphones,
  Cake,
  Watch,
  Bike,
  Key,
  BookOpen,
  Leaf,
  Flame,
  Music,
  Gem,
  Tv,
  Compass,
  Footprints,
  Crown,
  GlassWater,
  Wrench,
  Flower2,
  Anchor,
  Apple,
  Banana,
  Beer,
  Bone,
  Box,
  Brain,
  Brush,
  Bus,
  Calculator,
  Candy,
  Cat,
  ChefHat,
  Clapperboard,
  Cloud,
  Cookie,
  Dog,
  Dices,
  Disc,
  Egg,
  Fan,
  Feather,
  Fish,
  Gamepad2,
  Gavel,
  Guitar,
  Hammer,
  IceCream,
  Joystick,
  Lightbulb,
  Luggage,
  Map,
  Mic,
  Microscope,
  Moon,
  Mountain,
  Paintbrush,
  PenTool,
  Pill,
  Pizza,
  Plane,
  Plug,
  Printer,
  Puzzle,
  Radio,
  Receipt,
  Rocket,
  Ruler,
  Scale,
  Server,
  Shell,
  ShowerHead,
  Shovel,
  Sprout,
  Stethoscope,
  Sun,
  Table,
  Tablet,
  Tent,
  Thermometer,
  Trophy,
  Umbrella,
  Utensils,
  Wallet,
  Wine,
  Pause,
  Play,
  Armchair,
  Bath,
  Battery,
  Bed,
  Beef,
  BellRing,
  Bird,
  Book,
  Castle,
  Clover,
  Construction,
  Container,
  CupSoda,
  Glasses,
  GraduationCap,
  HardHat,
  Heater,
  Martini,
  Notebook,
  PackageOpen,
  PawPrint,
  Pen,
  Pencil,
  PiggyBank,
  PlugZap,
  Rabbit,
  Refrigerator,
  Salad,
  Sandwich,
  ShoppingBasket,
  Smile,
  Snowflake,
  Soup,
  Speaker,
  Target,
  Telescope,
  Terminal,
  ToyBrick,
  Train,
  Trees,
  Volleyball,
  Wand,
  Warehouse,
  WashingMachine,
  Waves,
  Webcam,
  Wheat,
} from "lucide-react";
import { Lang, t } from "../lib/i18nClient";
import {
  AboutUsSection,
  ApplySellerModal,
} from "../components/client/ClientSubcomponents";
import { useDialog } from "../components/CustomDialogContext";
import ProductDetailPage from "./ProductDetailPage";
import { AppBarBackgroundSlider } from "../components/AppBarBackgroundSlider";
import TrackOrderModal from "../components/TrackOrderModal";
import ReviewModal from "../components/ReviewModal";
import ScratchCardChallenge from "../components/ScratchCardChallenge";
import CookieConsent from "../components/CookieConsent";
import AboutUsPage from "./AboutUsPage";
import ForgotPassword from "../components/ForgotPassword";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { motion, AnimatePresence } from "motion/react";

// Loyalty points system helper methods
export const getLoyaltyPoints = (userId: string) => {
  const pointsKey = "orbishop_loyalty_points_" + userId;
  const stored = localStorage.getItem(pointsKey);
  if (stored === null) {
    // Welcome gift of 150 points for first-time login
    localStorage.setItem(pointsKey, "150");
    return 150;
  }
  return parseInt(stored, 10) || 0;
};

export const saveLoyaltyPoints = (userId: string, points: number) => {
  localStorage.setItem("orbishop_loyalty_points_" + userId, points.toString());
};

const formatItemCount = (num: number) => {
  if (num >= 1000) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(num);
  }
  return num.toString();
};

const TanzaniaFlag = () => (
  <svg
    viewBox="0 0 300 200"
    className="w-5 h-3.5 inline-block shrink-0 shadow-xs rounded-xs border border-white/20"
    fill="none"
  >
    <polygon points="0,0 300,0 0,200" fill="#1eb53a" />
    <polygon points="0,200 300,200 300,0" fill="#00a3dd" />
    <line
      x1="-20"
      y1="220"
      x2="320"
      y2="-20"
      stroke="#fcd116"
      strokeWidth="54"
    />
    <line
      x1="-20"
      y1="220"
      x2="320"
      y2="-20"
      stroke="#000000"
      strokeWidth="34"
    />
  </svg>
);

const UKFlag = () => (
  <svg
    viewBox="0 0 60 30"
    className="w-5 h-3.5 inline-block shrink-0 shadow-xs rounded-xs border border-white/20"
    fill="none"
  >
    <clipPath id="uk-flag-clip-client">
      <path d="M0,0 L30,15 L0,15 z M0,30 L30,15 L30,30 z M60,30 L30,15 L60,15 z M60,0 L30,15 L30,0 z" />
    </clipPath>
    <rect width="60" height="30" fill="#012169" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
    <path
      d="M0,0 L60,30 M60,0 L0,30"
      stroke="#C8102E"
      strokeWidth="4"
      clipPath="url(#uk-flag-clip-client)"
    />
    <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
    <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
  </svg>
);

function CustomSelect({
  value,
  onChange,
  options,
  iconLabel,
  label,
  align = "left",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string; subtitle?: string }[];
  iconLabel: React.ReactNode;
  label: string;
  align?: "left" | "right" | "center";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.id === value) || options[0];

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 hover:bg-slate-100/80 border-none text-slate-700 text-[11px] font-medium rounded-md px-2 py-1 outline-none transition-all flex items-center justify-between text-left h-7"
        title={label}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[12px] shrink-0">{iconLabel}</span>
          <span className="truncate text-[10px] leading-tight mt-0.5">
            {selectedOption.label}
          </span>
        </div>
        <ChevronDown
          size={10}
          className={`text-slate-400 shrink-0 ml-1 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 top-[calc(100%+4px)] ${align === "right" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0"} w-max max-w-[95vw] min-w-[150px] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1`}
        >
          <div className="px-3 py-1.5 text-[9px] font-black uppercase text-slate-400 tracking-widest bg-slate-50/50 border-b border-slate-100 flex items-center gap-1">
            {label}
          </div>
          <div className="p-1.5 space-y-1">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors text-left ${value === opt.id ? "bg-[#ff4c00]/5" : "bg-transparent hover:bg-slate-50 text-slate-700"}`}
              >
                <div>
                  <div
                    className={`text-[12px] font-bold ${value === opt.id ? "text-[#ff4c00]" : "text-slate-800"}`}
                  >
                    {opt.label}
                  </div>
                  {opt.subtitle && (
                    <div
                      className={`text-[10px] mt-0.5 ${value === opt.id ? "text-[#ff4c00]/70 font-medium" : "text-slate-500"}`}
                    >
                      {opt.subtitle}
                    </div>
                  )}
                </div>
                {value === opt.id && (
                  <CheckCircle2
                    size={14}
                    className="text-[#ff4c00] shrink-0 ml-2"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const formatOrderNumber = (order: any) => {
  return order.id.substring(0, 8).toUpperCase();
};

export default function ClientApp() {
  const { showAlert, showConfirm } = useDialog();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  const [lang, setLang] = useState<Lang>(() => {
    try {
      return (localStorage.getItem("orbishop_lang") as Lang) || "sw";
    } catch {
      return "sw";
    }
  });
  const [prefs, setPrefs] = useState<{
    categories: Record<string, number>;
    views: Record<string, number>;
  }>(() => {
    try {
      if (localStorage.getItem("orbishop_cookie_consent_accepted") === "true") {
        const savedPrefs = localStorage.getItem("orbishop_user_prefs");
        if (savedPrefs) return JSON.parse(savedPrefs);
      }
    } catch {}
    return { categories: {}, views: {} };
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [globalSettings, setGlobalSettings] = useState<any>(null);

  useEffect(() => {
    db.getInvoiceSettings().then((res) => setGlobalSettings(res));
  }, []);
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [promotionalBanners, setPromotionalBanners] = useState<
    PromotionalBanner[]
  >([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("orbishop_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [marketplaceAds, setMarketplaceAds] = useState<MarketplaceAd[]>([]);
  const [visitorId, setVisitorId] = useState<string>(() => {
    let vid = localStorage.getItem("orbi_visitor_id");
    if (!vid) {
      vid =
        "vis_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
      localStorage.setItem("orbi_visitor_id", vid);
    }
    return vid;
  });
  const [countedAds, setCountedAds] = useState<string[]>([]);
  const [shuffleWeights, setShuffleWeights] = useState<Record<string, number>>(
    {},
  );

  const handleShuffleClick = () => {
    const weights: Record<string, number> = {};
    products.forEach((p) => {
      weights[p.id] = Math.random();
    });
    promos.forEach((pr) => {
      weights[pr.id] = Math.random();
    });
    setShuffleWeights(weights);
    showAlert(
      lang === "sw"
        ? "Duka limechanganywa kibahati! Furahia kugundua bidhaa mpya."
        : "Marketplace reshuffled! Discover brand new products.",
      "success",
    );
  };

  const salesCounts = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        if (order.status !== "confirmed") return acc;
        order.items.forEach((item) => {
          acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
        });
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [orders]);

  const heroAds = useMemo(() => {
    const filteredHero = promos
      .filter((p) => p.title.startsWith("[HERO] "))
      .map((p) => ({ ...p, title: p.title.replace("[HERO] ", "") }));
    return filteredHero.sort((a, b) => {
      const wA = shuffleWeights[a.id] || 0.5;
      const wB = shuffleWeights[b.id] || 0.5;
      return wA - wB;
    });
  }, [promos, shuffleWeights]);
  const carouselAds = useMemo(() => {
    const defaultAds = promos.filter(
      (p) => !p.title.startsWith("[HERO] ") && p.title !== "SYSTEM_SELLERS",
    );

    // Auto-pilot: Automatically map one product from each active PRO seller as a sponsored ad
    const activeProSellers = sellers.filter(
      (s) => s.isPro && s.proUntil && s.proUntil > Date.now(),
    );
    const proAds: Promotion[] = [];

    activeProSellers.forEach((s) => {
      // Find a product by this seller to advertise
      const proProducts = products.filter(
        (p) => p.sellerId === s.id && p.images?.length > 0,
      );
      if (proProducts.length > 0) {
        const topProduct = proProducts.sort(
          (a, b) => (salesCounts[b.id] || 0) - (salesCounts[a.id] || 0),
        )[0];
        proAds.push({
          id: topProduct.id,
          title: `[SPONSORED] ${s.name}`,
          description: topProduct.name,
          image: topProduct.images[0],
          link: `/?product=${topProduct.id}`,
          visible: true,
          createdAt: Date.now(),
        });
      }
    });

    const combined = [...defaultAds, ...proAds];
    return combined.sort((a, b) => {
      const wA = shuffleWeights[a.id] || 0.5;
      const wB = shuffleWeights[b.id] || 0.5;
      return wA - wB;
    });
  }, [promos, sellers, products, salesCounts, shuffleWeights]);

  const activeMarketplaceAds = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    return marketplaceAds.filter((ad) => {
      if (!ad.visible) return false;
      if (ad.status === "paused" || ad.status === "pending") return false;
      if (ad.totalSpent >= ad.budgetLimit) return false;
      if (ad.startDate && todayStr < ad.startDate) return false;
      if (ad.endDate && todayStr > ad.endDate) return false;
      return true;
    });
  }, [marketplaceAds]);

  useEffect(() => {
    if (activeMarketplaceAds.length === 0) return;
    const uncounted = activeMarketplaceAds.filter(
      (ad) => !countedAds.includes(ad.id),
    );
    if (uncounted.length === 0) return;

    const recordImpressions = async () => {
      try {
        // Safe, concurrent-friendly server registration of views
        await Promise.all(
          uncounted.map((adObj) =>
            fetch("/api/ads/track", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ adId: adObj.id, action: "impression" }),
            }).catch((e) => console.log("Impression track skipped", e)),
          ),
        );
        setCountedAds((prev) => [...prev, ...uncounted.map((u) => u.id)]);
      } catch (err) {
        console.error("Error writing ad impression:", err);
      }
    };

    recordImpressions();
  }, [activeMarketplaceAds, countedAds]);

  const handleMarketplaceAdClick = async (ad: MarketplaceAd) => {
    try {
      // Safe, concurrent-friendly server registration of clicks
      fetch("/api/ads/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId: ad.id, action: "click" }),
      }).catch((e) => console.warn("Ad click tracking error ignored", e));

      if (ad.link) {
        window.location.href = ad.link;
      }
    } catch (err) {
      console.error("Error registering ad click:", err);
    }
  };

  const [activeUser, setActiveUser] = useState<Customer | null>(null);

  // UI State
  const [search, setSearch] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const data = localStorage.getItem("orbi_user_search_history");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });
  const [backendPopularSearches, setBackendPopularSearches] = useState<
    string[]
  >([]);
  const [expandedKeywords, setExpandedKeywords] = useState<string[]>([]);
  const [isExpandingSearch, setIsExpandingSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    try {
      return localStorage.getItem("orbishop_selectedCategory") || "Zote";
    } catch {
      return "Zote";
    }
  });
  const [selectedNiche, setSelectedNiche] = useState<string>(() => {
    try {
      return localStorage.getItem("orbishop_selectedNiche") || "Zote";
    } catch {
      return "Zote";
    }
  });
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredCategoryX, setHoveredCategoryX] = useState<number | null>(null);
  const [hoveredNiche, setHoveredNiche] = useState<string | null>(null);
  const [hoveredNicheX, setHoveredNicheX] = useState<number | null>(null);

  // Mega Menu Products computation
  const megaMenuProducts = useMemo(() => {
    if (!hoveredNiche && !hoveredCategory) return [];

    let targetNiche = hoveredNiche !== "Zote" ? hoveredNiche : null;
    let targetCat = hoveredCategory !== "Zote" ? hoveredCategory : null;

    let filtered = products.filter((p) => {
      if (targetNiche && (p.niche || "Mengineyo") !== targetNiche) return false;
      if (targetCat && p.category !== targetCat) return false;
      return true;
    });

    const proSellerIds = new Set(
      sellers.filter((s) => s.isPro).map((s) => s.id),
    );

    // Prioritize products from pro sellers, then fallback to others
    filtered.sort((a, b) => {
      const aPro = a.sellerId && proSellerIds.has(a.sellerId) ? 1 : 0;
      const bPro = b.sellerId && proSellerIds.has(b.sellerId) ? 1 : 0;
      return bPro - aPro;
    });

    return filtered.slice(0, 10);
  }, [hoveredNiche, hoveredCategory, products, sellers]);
  const [selectedArrangementTier, setSelectedArrangementTier] =
    useState<string>(() => {
      try {
        return (
          localStorage.getItem("orbishop_selectedArrangementTier") || "all"
        );
      } catch {
        return "all";
      }
    });
  const [selectedArrangementVibe, setSelectedArrangementVibe] =
    useState<string>(() => {
      try {
        return (
          localStorage.getItem("orbishop_selectedArrangementVibe") || "all"
        );
      } catch {
        return "all";
      }
    });
  const [selectedArrangementWrap, setSelectedArrangementWrap] =
    useState<string>(() => {
      try {
        return (
          localStorage.getItem("orbishop_selectedArrangementWrap") || "all"
        );
      } catch {
        return "all";
      }
    });
  const nicheScrollRef = useRef<HTMLDivElement>(null);

  const [likedProductIds, setLikedProductIds] = useState<string[]>(() => {
    try {
      const data = localStorage.getItem("orbi_liked_product_ids");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const likedNiches = useMemo(() => {
    const niches = new Set<string>();
    likedProductIds.forEach((id) => {
      const prod = products.find((p) => p.id === id);
      if (prod && prod.niche) {
        niches.add(prod.niche.toLowerCase());
      }
    });
    return Array.from(niches);
  }, [likedProductIds, products]);

  const toggleLikeProduct = (productId: string, productNiche?: string) => {
    try {
      let updated: string[];
      if (likedProductIds.includes(productId)) {
        updated = likedProductIds.filter((id) => id !== productId);
      } else {
        updated = [...likedProductIds, productId];
      }
      setLikedProductIds(updated);
      localStorage.setItem("orbi_liked_product_ids", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const [showNicheDrawer, setShowNicheDrawer] = useState(false);
  const [sortOrder, setSortOrder] = useState<
    "default" | "asc" | "desc" | "newest" | "popular"
  >(() => {
    try {
      return (localStorage.getItem("orbishop_sortOrder") as any) || "default";
    } catch {
      return "default";
    }
  });
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState<"login" | "register" | null>(null);
  const [showApplySellerModal, setShowApplySellerModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showTrackOrder, setShowTrackOrder] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState<
    "orders" | "track" | "messages" | "rewards" | "locator"
  >("orders");
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSecureOrderAuthPrompt, setShowSecureOrderAuthPrompt] =
    useState(false);
  const [showAboutPage, setShowAboutPage] = useState(false);
  const [aboutPageTab, setAboutPageTab] = useState("about");
  const [isLoading, setIsLoading] = useState(true);
  const [viewInvoice, setViewInvoice] = useState<Order | null>(null);
  const [viewPromo, setViewPromo] = useState<Promotion | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewSeller, setViewSeller] = useState<SellerProfile | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [allReviews, setAllReviews] = useState<Record<string, any[]>>({});

  useEffect(() => {
    try {
      localStorage.setItem("orbishop_lang", lang);
      localStorage.setItem("orbishop_selectedCategory", selectedCategory);
      localStorage.setItem("orbishop_selectedNiche", selectedNiche);
      localStorage.setItem(
        "orbishop_selectedArrangementTier",
        selectedArrangementTier,
      );
      localStorage.setItem(
        "orbishop_selectedArrangementVibe",
        selectedArrangementVibe,
      );
      localStorage.setItem(
        "orbishop_selectedArrangementWrap",
        selectedArrangementWrap,
      );
      localStorage.setItem("orbishop_sortOrder", sortOrder);

      if (activeUser && activeUser.id && activeUser.id !== "guest") {
        db.updateCustomer(activeUser.id, { preferredLanguage: lang }).catch(
          (err) =>
            console.warn(
              "Could not sync preferred language to server profile:",
              err,
            ),
        );
      }
    } catch {}
  }, [
    lang,
    selectedCategory,
    selectedNiche,
    selectedArrangementTier,
    selectedArrangementVibe,
    selectedArrangementWrap,
    sortOrder,
    activeUser?.id,
  ]);

  useEffect(() => {
    try {
      localStorage.setItem("orbishop_cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await fetch("/api/search/popular");
        const data = await res.json();
        if (data && data.success && Array.isArray(data.popular)) {
          setBackendPopularSearches(data.popular);
        }
      } catch (err) {
        // Handle transient network fetch errors gracefully during server restarts
        console.warn("Popular searches did not load yet:", err);
      }
    };
    fetchPopular();
    const interval = setInterval(fetchPopular, 30000);
    return () => clearInterval(interval);
  }, []);

  const sortedAdsList = useMemo(() => {
    const loyaltyAds: any[] = [];

    const mappedSponsorAds = activeMarketplaceAds.map((ad) => ({
      id: ad.id,
      type: "sponsor" as const,
      businessName: ad.businessName,
      title: ad.title,
      description:
        ad.description ||
        (lang === "sw"
          ? "Gundua kahawa na matoleo hapa..."
          : "Premium quality sponsored product space..."),
      image:
        ad.image ||
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500",
      badge: lang === "sw" ? "Imedhaminiwa" : "Sponsored",
      niche: ad.niche || "Electronics",
      action: () => handleMarketplaceAdClick(ad),
    }));

    const combined = [...loyaltyAds, ...mappedSponsorAds];

    return combined
      .map((ad) => {
        let score = hashString(visitorId + "-" + ad.id);
        if (selectedNiche && selectedNiche !== "Zote") {
          const isMatch =
            ad.niche?.toLowerCase() === selectedNiche.toLowerCase();
          if (isMatch) {
            score -= 1000000000;
          }
        }
        return { ad, score };
      })
      .sort((a, b) => a.score - b.score)
      .map((x) => x.ad);
  }, [activeMarketplaceAds, selectedNiche, lang, visitorId]);

  const [recentProductIds, setRecentProductIds] = useState<string[]>(() => {
    try {
      if (localStorage.getItem("orbishop_cookie_consent_accepted") === "true") {
        return JSON.parse(
          localStorage.getItem("orbishop_recent_products") || "[]",
        );
      }
    } catch {}
    return [];
  });

  const handleProductSelect = (p: Product) => {
    setSelectedProduct(p);

    const params = new URLSearchParams(window.location.search);
    params.set("product", p.id);
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`,
    );

    setRecentProductIds((prev) => {
      const updated = [p.id, ...prev.filter((id) => id !== p.id)].slice(0, 10);
      try {
        if (
          localStorage.getItem("orbishop_cookie_consent_accepted") === "true"
        ) {
          localStorage.setItem(
            "orbishop_recent_products",
            JSON.stringify(updated),
          );
        }
      } catch {}
      return updated;
    });
  };

  const recentProductsList = useMemo(() => {
    if (!products.length) return [];
    return recentProductIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as Product[];
  }, [recentProductIds, products]);

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [systemNiches, setSystemNiches] = useState<Niche[]>([]);
  const [guestMessages, setGuestMessages] = useState<Message[]>([]);

  // --- Loyalty Program & Receipt Scanner States ---
  const [forcePointsUpdate, setForcePointsUpdate] = useState(0);
  const [isParsingReceipt, setIsParsingReceipt] = useState(false);
  const [parsedReceiptData, setParsedReceiptData] = useState<any>(null);
  const [parsingError, setParsingError] = useState<string | null>(null);

  const [readReplyIds, setReadReplyIds] = useState<string[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("orbishop_read_reply_ids") || "[]",
      );
    } catch {
      return [];
    }
  });

  const handleReceiptUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsParsingReceipt(true);
    setParsingError(null);
    setParsedReceiptData(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        try {
          const res = await fetch("/api/ai/parse-receipt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image: base64data,
              customerId: activeUser ? activeUser.id : getInitialUserId(),
            }),
          });
          const data = await res.json();
          if (data.success && data.receipt) {
            setParsedReceiptData(data.receipt);
            showAlert(
              lang === "sw"
                ? "Risiti imechanganuliwa! Tafadhali hakiki maelezo hapa chini."
                : "Receipt parsed successfully! Please review details below.",
              "success",
            );
          } else {
            throw new Error(
              data.error ||
                (lang === "sw"
                  ? "Imeshindwa kutambua herufi za risiti."
                  : "Invalid receipt content. Please try another copy."),
            );
          }
        } catch (innerErr: any) {
          console.error(innerErr);
          setParsingError(innerErr.message || "E-OCR error processing receipt");
        } finally {
          setIsParsingReceipt(false);
        }
      };
    } catch (err: any) {
      console.error(err);
      setParsingError(
        err.message || "Failed to process receipt physical selection",
      );
      setIsParsingReceipt(false);
    }
  };

  const handleClaimReceiptPoints = async () => {
    if (!parsedReceiptData) return;
    const userId = activeUser ? activeUser.id : getInitialUserId();
    const earned =
      parsedReceiptData.estimatedLoyaltyPoints ||
      Math.floor(parsedReceiptData.total / 2000) ||
      50;
    const currentPoints = getLoyaltyPoints(userId);
    const updated = currentPoints + earned;

    saveLoyaltyPoints(userId, updated);

    // Add real notification message inside profile inbox
    const receiptFeedbackMsg = {
      id: "ReceiptClaim-" + Date.now(),
      name: "Orbi Loyalty Manager",
      phone: "System Reward",
      message: `🎉 RISITI YA DHAMBI ILIYOSHUGHULIKIWA:
Imethibitishwa kutoka kwa muuzaji: "${parsedReceiptData.vendor}".
Jumla ya manunuzi TSh ${Number(parsedReceiptData.total).toLocaleString()} imehakikiwa kikamilifu. 

Zawadi ya Alama za Uaminifu zilizoongezwa kwenye kibeti chako: +${earned} Points!`,
      customer_id: userId,
      admin_reply:
        "Mfumo wa Orbi umeweka alama hizi moja kwa moja kwenye akaunti yako. Asante kwa kutuamini!",
      date: Date.now(),
    };

    try {
      await db.saveMessage(receiptFeedbackMsg);
    } catch (dbErr) {
      console.log(
        "Ignored silent database save error for receipt message tracker:",
        dbErr,
      );
    }

    showAlert(
      lang === "sw"
        ? `Hongera! Risiti yako ya TSh ${Number(parsedReceiptData.total).toLocaleString()} imesajiliwa na alama +${earned} zimeingizwa kwenye wasifu wako!`
        : `Congratulations! Your receipt totaling TSh ${Number(parsedReceiptData.total).toLocaleString()} was audited and +${earned} points have been credited to your reward wallet!`,
      "success",
    );

    setParsedReceiptData(null);
    setForcePointsUpdate((prev) => prev + 1);
  };

  const handleRedeemVoucher = async (voucher: any) => {
    const userId = activeUser ? activeUser.id : getInitialUserId();
    const currentPoints = getLoyaltyPoints(userId);
    if (currentPoints < voucher.points) {
      showAlert(
        lang === "sw"
          ? `Alama zako (${currentPoints}) hazitoshi kukomboa tuzo hii inayouza kwa alama ${voucher.points}.`
          : `Your loyalty points balance (${currentPoints}) is insufficient to claim this reward costing ${voucher.points} points.`,
        "error",
      );
      return;
    }

    const confirmChoice = await showConfirm(
      lang === "sw"
        ? `Je, unapenda kukata alama -${voucher.points} za uaminifu kutoka kwenye akaunti yako ili kupokea ${voucher.nameSw}?`
        : `Are you sure you want to deduct -${voucher.points} loyalty points from your balance to claim a ${voucher.nameEn}?`,
      lang === "sw" ? "Komboa Alama" : "Claim Premium Reward",
    );

    if (confirmChoice) {
      const updated = currentPoints - voucher.points;
      saveLoyaltyPoints(userId, updated);

      const cpnCode = `ORBI-VIP-${voucher.percent}-${Math.floor(Math.random() * 10000)}`;
      const newCoupon = {
        id: "Redeem-" + Date.now(),
        code: cpnCode,
        discountPercentage: voucher.percent,
        expiresAt: new Date(
          Date.now() + 15 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        active: true,
        targetCustomer: userId,
      };

      try {
        await db.saveCoupon(newCoupon);
        const cpns = await db.getCoupons();
        setCoupons(cpns);

        showAlert(
          lang === "sw"
            ? `Imefanikiwa! Punguzo lako limehamishwa kama Kuponi mpya: "${cpnCode}". Unaweza kuinakili sasa kwa ajili ya manunuzi ya mabezi!`
            : `Splendid! Coupon created successfully with code: "${cpnCode}". It is now loaded into your checkout options!`,
          "success",
        );
        setForcePointsUpdate((prev) => prev + 1);
      } catch (cpnErr: any) {
        showAlert("Failed coupon instantiation: " + cpnErr.message, "error");
      }
    }
  };

  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(
    () => {
      try {
        return JSON.parse(
          localStorage.getItem("orbi_read_notifications") || "[]",
        );
      } catch {
        return [];
      }
    },
  );
  const saveReadNotificationIds = (ids: string[]) => {
    setReadNotificationIds(ids);
    localStorage.setItem("orbi_read_notifications", JSON.stringify(ids));
  };

  const [showAIChatDrawer, setShowAIChatDrawer] = useState(false);
  const [imageUploadCount, setImageUploadCount] = useState<number>(() => {
    try {
      return Number(localStorage.getItem("orbi_image_upload_count") || "0");
    } catch {
      return 0;
    }
  });
  const [showImageLimitModal, setShowImageLimitModal] = useState(false);

  const getInitialUserId = (): string => {
    try {
      const saved = localStorage.getItem("Orbishop_customers");
      if (saved) {
        const u = JSON.parse(saved);
        if (u && u.id) return u.id;
      }
    } catch {}
    return "guest";
  };

  const [isTransferredToLive, setIsTransferredToLive] = useState<boolean>(
    () => {
      try {
        const initUid = getInitialUserId();
        const lockUntil = Number(
          localStorage.getItem(`orbi_ai_lock_until_${initUid}`) || "0",
        );
        if (lockUntil && Date.now() < lockUntil) {
          return true;
        }
        if (lockUntil && Date.now() >= lockUntil) {
          localStorage.removeItem(`orbi_ai_lock_until_${initUid}`);
          localStorage.setItem(`orbi_ai_transferred_${initUid}`, "false");
          return false;
        }
        return (
          localStorage.getItem(`orbi_ai_transferred_${initUid}`) === "true"
        );
      } catch {
        return false;
      }
    },
  );

  const [aiLockTimeRemaining, setAiLockTimeRemaining] = useState<string>("");

  const checkAIResetQuotaStatus = async () => {
    const userId = activeUser ? activeUser.id : getInitialUserId();
    if (!userId || userId === "guest") return;
    try {
      const res = await fetch(
        `/api/ai/status?customerId=${encodeURIComponent(userId)}`,
      );
      const data = await res.json();
      if (data.success) {
        const lastCheckedKey = `orbi_ai_last_reset_checked_${userId}`;
        const lastChecked = Number(localStorage.getItem(lastCheckedKey) || "0");
        if (data.resetAt && data.resetAt > lastChecked) {
          // Reset quota!
          setAIChatHistory([]);
          localStorage.setItem(`orbi_ai_chat_history_${userId}`, "[]");
          setIsTransferredToLive(false);
          localStorage.setItem(`orbi_ai_transferred_${userId}`, "false");
          localStorage.removeItem(`orbi_ai_lock_until_${userId}`);
          localStorage.setItem(lastCheckedKey, String(data.resetAt));

          showAlert(
            lang === "sw"
              ? "🎉 Habari njema! Mfumo au mfanyakazi wetu ameweka upya kikomo chako cha maswali ya AI. Sasa unaweza kuendelea kuuliza maswali sasa!"
              : "🎉 Excellent news! Support has manually reset your AI assistant chat quota. You can now resume your conversations with Orbi AI!",
            "success",
          );
        }
      }
    } catch (err) {
      console.warn("AI status verification check failure:", err);
    }
  };

  useEffect(() => {
    if (showAIChatDrawer) {
      checkAIResetQuotaStatus();
    }
  }, [showAIChatDrawer]);

  // Synchronize dynamic AI states on activeUser change (login / logout)
  useEffect(() => {
    const userId = activeUser ? activeUser.id : getInitialUserId();
    try {
      // 1. Load History
      const hist = JSON.parse(
        localStorage.getItem(`orbi_ai_chat_history_${userId}`) || "[]",
      );
      setAIChatHistory(hist);

      // 2. Load transferred and lock state
      const lockUntil = Number(
        localStorage.getItem(`orbi_ai_lock_until_${userId}`) || "0",
      );
      if (lockUntil && Date.now() < lockUntil) {
        setIsTransferredToLive(true);
      } else {
        if (lockUntil && Date.now() >= lockUntil) {
          localStorage.removeItem(`orbi_ai_lock_until_${userId}`);
          localStorage.setItem(`orbi_ai_transferred_${userId}`, "false");
        }
        const isTransferred =
          localStorage.getItem(`orbi_ai_transferred_${userId}`) === "true";
        setIsTransferredToLive(isTransferred);
      }

      // Check reset status on mount
      checkAIResetQuotaStatus();

      // 3. Image upload count
      const uploadCount = Number(
        localStorage.getItem(`orbi_image_upload_count_${userId}`) || "0",
      );
      setImageUploadCount(uploadCount);
    } catch (e) {
      console.error("AI dynamic state synchronization error:", e);
    }
  }, [activeUser]);

  useEffect(() => {
    const updateLockTimer = () => {
      try {
        const userId = activeUser ? activeUser.id : getInitialUserId();
        const lockUntilVal = localStorage.getItem(
          `orbi_ai_lock_until_${userId}`,
        );
        if (!lockUntilVal) {
          setAiLockTimeRemaining("");
          return;
        }
        const lockUntil = Number(lockUntilVal);
        const now = Date.now();
        if (now < lockUntil) {
          const remainingSeconds = Math.max(
            0,
            Math.ceil((lockUntil - now) / 1000),
          );
          const mins = Math.floor(remainingSeconds / 60);
          const secs = remainingSeconds % 60;
          const formatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
          setAiLockTimeRemaining(formatted);
          if (!isTransferredToLive) {
            setIsTransferredToLive(true);
            localStorage.setItem(`orbi_ai_transferred_${userId}`, "true");
          }
        } else {
          // Lock expired!
          setAiLockTimeRemaining("");
          setIsTransferredToLive(false);
          localStorage.setItem(`orbi_ai_transferred_${userId}`, "false");
          localStorage.removeItem(`orbi_ai_lock_until_${userId}`);
          // Clear history so they start fresh after 30 min lockout
          setAIChatHistory([]);
          localStorage.setItem(`orbi_ai_chat_history_${userId}`, "[]");
        }
      } catch (err) {
        console.error("Lock timer check error:", err);
      }
    };

    updateLockTimer();
    const interval = setInterval(updateLockTimer, 1000);
    return () => clearInterval(interval);
  }, [activeUser, isTransferredToLive]);

  const [aiChatHistory, setAIChatHistory] = useState<
    {
      role: "user" | "model";
      text: string;
      image?: { data: string; mimeType: string };
    }[]
  >(() => {
    try {
      const initUid = getInitialUserId();
      return JSON.parse(
        localStorage.getItem(`orbi_ai_chat_history_${initUid}`) || "[]",
      );
    } catch {
      return [];
    }
  });
  const [aiInputMessage, setAIInputMessage] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiSelectedImage, setAiSelectedImage] = useState<{
    data: string;
    mimeType: string;
    filename: string;
  } | null>(null);

  const handleAIImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (imageUploadCount >= 3) {
      setShowImageLimitModal(true);
      e.target.value = "";
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadstart = () => setIsAILoading(true);
      reader.onloadend = () => {
        const newImg = {
          data: reader.result as string,
          mimeType: file.type,
          filename: file.name,
        };
        setAiSelectedImage(newImg);
        // Auto-open AI visual guidance chat drawer when an image is selected from top bar or drawer input
        setShowAIChatDrawer(true);
        setIsAILoading(false);
        // Delay to allow state/drawer to mount
        setTimeout(() => sendAIChatMessage("", newImg), 100);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const sendAIChatMessage = async (
    messageText: string,
    providedImage?: { data: string; mimeType: string },
  ) => {
    if (isTransferredToLive) return;
    const finalImage = providedImage || aiSelectedImage;
    if (!messageText.trim() && !finalImage) return;

    const userId = activeUser ? activeUser.id : getInitialUserId();

    const userMsg = {
      role: "user" as const,
      text:
        messageText ||
        (lang === "sw"
          ? "Tafadhali nisaidie kuona picha hii"
          : "Please explain or find matches for this image"),
      image: finalImage
        ? { data: finalImage.data, mimeType: finalImage.mimeType }
        : undefined,
    };

    const updatedHistory = [...aiChatHistory, userMsg];
    setAIChatHistory(updatedHistory);
    localStorage.setItem(
      `orbi_ai_chat_history_${userId}`,
      JSON.stringify(updatedHistory),
    );
    setAIInputMessage("");

    const imagePayload = finalImage
      ? { data: finalImage.data, mimeType: finalImage.mimeType }
      : null;

    // If we are searching with an image, increment the upload search counter to prevent token abuse
    if (imagePayload) {
      const nextCount = imageUploadCount + 1;
      setImageUploadCount(nextCount);
      localStorage.setItem(
        `orbi_image_upload_count_${userId}`,
        String(nextCount),
      );
    }

    setAiSelectedImage(null);
    setIsAILoading(true);

    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          history: aiChatHistory,
          image: imagePayload,
          customer: activeUser
            ? {
                id: activeUser.id,
                name: activeUser.name,
                phone: activeUser.phone,
                email: activeUser.email,
              }
            : null,
        }),
      });
      const result = await response.json();
      if (result.success) {
        const modelMsg = { role: "model" as const, text: result.reply };
        const finalHistory = [...updatedHistory, modelMsg];
        setAIChatHistory(finalHistory);
        localStorage.setItem(
          `orbi_ai_chat_history_${userId}`,
          JSON.stringify(finalHistory),
        );

        if (result.transferToLiveAgent) {
          setIsTransferredToLive(true);
          localStorage.setItem(`orbi_ai_transferred_${userId}`, "true");
          // Lock for 30 minutes
          const lockTime = Date.now() + 30 * 60 * 1000;
          localStorage.setItem(
            `orbi_ai_lock_until_${userId}`,
            String(lockTime),
          );
        }
      } else {
        const errorMsg = {
          role: "model" as const,
          text: result.reply || "Error contacting AI.",
        };
        const finalHistory = [...updatedHistory, errorMsg];
        setAIChatHistory(finalHistory);
        localStorage.setItem(
          `orbi_ai_chat_history_${userId}`,
          JSON.stringify(finalHistory),
        );
      }
    } catch (err: any) {
      console.error(err);
      const fallbackMsg = {
        role: "model" as const,
        text: "Samahani, mtandao ulikuwa na changamoto kidogo. Tafadhali jaribu tena baada ya sekunde kadhaa.",
      };
      const finalHistory = [...updatedHistory, fallbackMsg];
      setAIChatHistory(finalHistory);
      localStorage.setItem(
        `orbi_ai_chat_history_${userId}`,
        JSON.stringify(finalHistory),
      );
    } finally {
      setIsAILoading(false);
    }
  };

  const notifications = useMemo(() => {
    if (!activeUser) return [];
    const list: any[] = [];

    // 1. Order Status Updates
    const userOrders = orders.filter(
      (o) =>
        o.customerId === activeUser.id ||
        o.customer_id === activeUser.id ||
        (o.customerDetails?.phone === activeUser.phone &&
          activeUser.phone !== ""),
    );

    userOrders.forEach((o) => {
      const statusUpper = (o.status || "CREATED").toUpperCase();
      if (statusUpper !== "CREATED" && statusUpper !== "AWAITING_PAYMENT") {
        let statusTextEn = "Confirmed";
        let statusTextSw = "Imethibitishwa";
        if (statusUpper === "SHIPPED") {
          statusTextEn = "Shipped";
          statusTextSw = "Imesafirishwa";
        } else if (
          statusUpper === "DELIVERED" ||
          statusUpper === "BUYER_CONFIRMED" ||
          statusUpper === "RELEASED"
        ) {
          statusTextEn = "Delivered";
          statusTextSw = "Imepokelewa";
        } else if (statusUpper === "CANCELLED" || statusUpper === "REFUNDED") {
          statusTextEn = "Cancelled";
          statusTextSw = "Imebatilishwa";
        } else if (statusUpper === "DISPUTED") {
          statusTextEn = "Disputed";
          statusTextSw = "Mgogoro";
        }

        list.push({
          id: `order-${o.id}-${o.status}`,
          type: "order",
          title: `Order #${formatOrderNumber(o)}: ${statusTextEn}!`,
          titleSw: `Oda #${formatOrderNumber(o)}: ${statusTextSw}!`,
          desc: `Your order was marked as ${o.status}.`,
          descSw: `Oda yako ya jumla ya TSh ${Number(o.total).toLocaleString()} imewekwa hali ya ${statusTextSw}.`,
          date: o.date,
          originalId: o.id,
        });
      }
    });

    // 2. Newly Approved Coupons/Discounts
    coupons.forEach((c) => {
      if (c.active && !c.isUsed) {
        list.push({
          id: `coupon-${c.id || c.code}`,
          type: "discount",
          title: `New Discount Code: ${c.code}!`,
          titleSw: `Kuponi Mpya ya Punguzo: ${c.code}!`,
          desc: `Get ${c.discountPercentage}% discount expiring soon!`,
          descSw: `Pata punguzo la ${c.discountPercentage}% kwa ajili ya kuponi inayokwisha tarehe ${c.expiresAt.slice(0, 10)}!`,
          date: new Date(c.expiresAt).getTime() - 24 * 60 * 60 * 1000,
          originalId: c.code,
        });
      }
    });

    // 3. Customer-service replies
    guestMessages.forEach((m) => {
      if (m.adminReply) {
        list.push({
          id: `reply-${m.id}`,
          type: "message",
          title: `Support Agent Replied!`,
          titleSw: `Jibu la Huduma kwa Wateja!`,
          desc: `Replied: "${m.adminReply.slice(0, 35)}..."`,
          descSw: `Mhudumu amejibu: "${m.adminReply.slice(0, 35)}..."`,
          date: m.date,
          originalId: m.id,
        });
      }
    });

    return list.sort((a, b) => b.date - a.date);
  }, [activeUser, orders, coupons, guestMessages]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !readNotificationIds.includes(n.id))
      .length;
  }, [notifications, readNotificationIds]);

  const loadData = React.useCallback(async (isBackground: boolean = false) => {
    try {
      if (!isBackground) setIsLoading(true);

      let allProducts: any[] = [];
      try {
        allProducts = await db.getProducts();
      } catch (err) {
        console.warn("Failed to load products from API:", err);
      }

      const visibleProducts = allProducts
        ? allProducts.filter((p) => p.visible !== false)
        : [];
      setProducts(visibleProducts);

      let vs: any[] = [];
      try {
        vs = (await db.getPromotions()) || [];
      } catch (err) {
        console.warn("Failed to load promotions from API:", err);
      }
      const visiblePromos = vs ? vs.filter((p) => p.visible) : [];
      setPromos(visiblePromos);

      try {
        const activeBanners = (await db.getPromotionalBanners()).filter(
          (b) => b.visible,
        );
        setPromotionalBanners(activeBanners);
      } catch (err) {
        console.warn("Failed to load promotional banners:", err);
        setPromotionalBanners([]);
      }

      let allOrders: any[] = [];
      try {
        allOrders = await db.getOrders();
      } catch (err) {
        console.warn("Failed to load orders from API:", err);
      }
      setOrders(allOrders);

      try {
        const revsData = await db.getReviews();
        const mappedRevs: Record<string, any[]> = {};
        if (revsData) {
          revsData.forEach((r: any) => {
            if (r.productId) {
              if (!mappedRevs[r.productId]) mappedRevs[r.productId] = [];
              mappedRevs[r.productId].push({
                id: r.id,
                userName: r.userName,
                rating: r.rating,
                comment: r.comment,
                createdAt: r.createdAt,
              });
            }
          });
        }
        setAllReviews(mappedRevs);
      } catch (e) {
        console.warn("Could not load global reviews map", e);
      }

      if (!isBackground) {
        const weights: Record<string, number> = {};
        visibleProducts.forEach((p) => {
          const combined = `${visitorId}_${p.id}`;
          let hash = 0;
          for (let i = 0; i < combined.length; i++) {
            hash = (hash << 5) - hash + combined.charCodeAt(i);
            hash |= 0;
          }
          weights[p.id] = Math.abs(hash % 1000000) / 1000000;
        });
        visiblePromos.forEach((pr) => {
          const combined = `${visitorId}_${pr.id}`;
          let hash = 0;
          for (let i = 0; i < combined.length; i++) {
            hash = (hash << 5) - hash + combined.charCodeAt(i);
            hash |= 0;
          }
          weights[pr.id] = Math.abs(hash % 1000000) / 1000000;
        });
        setShuffleWeights(weights);
      }

      // Load coupons
      let cpns: any[] = [];
      try {
        cpns = await db.getCoupons();
      } catch (err) {
        console.warn("Failed to load coupons from API:", err);
      }
      setCoupons(cpns);

      let nchs: any[] = [];
      try {
        nchs = await db.getNiches();
      } catch (err) {
        console.warn("Failed to load niches from API:", err);
      }
      setSystemNiches(nchs);

      // load sellers
      let slrs: any[] = [];
      try {
        slrs = await db.getSellers();
      } catch (err) {
        console.warn("Failed to load sellers from API:", err);
      }
      setSellers(slrs);

      // load paid placement ads
      let paidAds: any[] = [];
      try {
        paidAds = await db.getAds();
      } catch (err) {
        console.warn("Failed to load ads from API:", err);
      }
      setMarketplaceAds(paidAds);

      const params = new URLSearchParams(window.location.search);
      const prodId = params.get("product");
      if (prodId) {
        const prod = allProducts.find((p) => p.id === prodId);
        if (prod) {
          setSelectedProduct(prod);
        }
      }

      const sellerId = params.get("seller");
      if (sellerId) {
        const seller = slrs.find((s) => s.id === sellerId);
        if (seller) setViewSeller(seller);
      }

      const orderIdParam = params.get("order") || params.get("order_id");
      if (orderIdParam) {
        setShowTrackOrder(true);
      }

      const invData = params.get("invoice");
      if (invData) {
        try {
          const decoded = JSON.parse(decodeURIComponent(atob(invData)));
          if (decoded && decoded.id) {
            setViewInvoice(decoded);
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname,
            );
          }
        } catch (err) {
          console.error("Failed to load invoice from URL", err);
        }
      }
    } catch (error: any) {
      console.warn(
        "[loadData] Failed to retrieve storefront resources, will retry:",
        error.message || error,
      );
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Replaced direct Supabase DB WebSocket with safe API-based polling
    const interval = setInterval(() => loadData(true), 15000); // reduced polling frequency
    return () => {
      clearInterval(interval);
    };
  }, [loadData]);

  useEffect(() => {
    const setupUser = async () => {
      const savedUser = localStorage.getItem("Orbishop_customers");
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          setActiveUser(u);
          if (u.preferredLanguage || u.preferred_language) {
            const prefL = u.preferredLanguage || u.preferred_language;
            if (prefL === "sw" || prefL === "en") {
              setLang(prefL);
            }
          }
        } catch (e) {
          localStorage.removeItem("Orbishop_customers");
        }
      }
    };
    setupUser();
  }, []);

  useEffect(() => {
    if (!activeUser) {
      setGuestMessages([]);
      return;
    }
    const fetchGuestMsgs = async () => {
      try {
        const all = await db.getMessages();
        const userMsgs = all.filter((m) => {
          const isSameCustomer = m.customerId === activeUser.id;
          if (isSameCustomer) return true;

          // Phone matching
          if (!m.phone || !activeUser.phone) return false;
          const cp1 = m.phone.replace(/\D/g, "");
          const cp2 = activeUser.phone.replace(/\D/g, "");
          if (!cp1 || !cp2) return false;
          const len1 = cp1.length;
          const len2 = cp2.length;
          if (len1 >= 9 && len2 >= 9) {
            return cp1.slice(-9) === cp2.slice(-9);
          }
          return cp1 === cp2;
        });
        setGuestMessages(userMsgs);
      } catch (err) {
        console.error("Error loading customer messages in header:", err);
      }
    };
    fetchGuestMsgs();

    const interval = setInterval(fetchGuestMsgs, 15000); // reduced polling frequency
    return () => {
      clearInterval(interval);
    };
  }, [activeUser]);

  const unreadCount = useMemo(() => {
    if (!activeUser || guestMessages.length === 0) return 0;
    return guestMessages.filter((m) => {
      // Message is from admin if it is admin initiated OR has an admin reply
      const isFromAdmin =
        m.message === "Ujumbe kutoka Orbi Shop" ||
        m.message === "Admin initiated dummy" ||
        m.message === "Ujumbe toka kwa Admin" ||
        m.message === "Ujumbe toka kwa Orbi Shop" ||
        !!m.adminReply;
      return isFromAdmin && !readReplyIds.includes(m.id);
    }).length;
  }, [guestMessages, activeUser, readReplyIds]);

  const logoutClient = async () => {
    localStorage.removeItem("Orbishop_customers");
    setActiveUser(null);
  };

  const niches = [
    { name: "Zote", icon: "Globe" },
    ...(systemNiches.length > 0
      ? systemNiches
      : Array.from(new Set(products.map((p) => p.niche || "Mengineyo"))).map(
          (n) => ({ name: n, icon: "Globe" }),
        )),
  ];

  // Auto-Pilot dynamically derived seller categories
  const dynamicSellerCategories = Array.from(
    new Set(
      sellers
        .filter((s) => s.status !== "frozen")
        .map((s) => {
          const desc = (s.description || "").toLowerCase();
          const name = (s.name || "").toLowerCase();
          if (
            desc.includes("wholesale") ||
            desc.includes("jumla") ||
            name.includes("wholesale")
          ) {
            return "Wholesale";
          }
          return null;
        })
        .filter(Boolean) as string[],
    ),
  );

  // Only show categories that belong to the current niche (or all if 'Zote')
  const categories = [
    "Zote",
    ...Array.from(
      new Set(
        products
          .filter(
            (p) =>
              selectedNiche === "Zote" ||
              (p.niche || "Mengineyo") === selectedNiche,
          )
          .map((p) => p.category),
      ),
    ),
  ];

  const filteredProductsBySeller = useMemo(() => {
    return viewSeller
      ? products.filter((p) => {
          if (viewSeller.id === "official") {
            return (
              !p.sellerId || p.sellerId === "official" || p.sellerId === "admin"
            );
          }
          return p.sellerId === viewSeller.id;
        })
      : products;
  }, [products, viewSeller]);

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [similarSuggestions, setMoreSimilarSuggestions] = useState<Product[]>(
    [],
  );
  const adPlacementIndex = useMemo(() => {
    if (filteredProducts.length === 0) return -1;
    const hash = hashString(visitorId || "default");

    const minIndex = Math.min(
      4,
      Math.max(1, Math.floor(filteredProducts.length / 2)),
    );
    const maxIndex = Math.min(8, filteredProducts.length - 1);

    if (minIndex >= maxIndex) {
      return filteredProducts.length > 1
        ? Math.floor(filteredProducts.length / 2)
        : 1;
    }

    return minIndex + (hash % (maxIndex - minIndex + 1));
  }, [filteredProducts.length, visitorId]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (!search.trim()) {
      setDebouncedSearch("");
      setCommittedSearch("");
      setSuggestions([]);
      setExpandedKeywords([]);
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 100);
    return () => clearTimeout(handler);
  }, [search]);

  const applySearch = (term: string) => {
    const trimmed = term.trim();
    setSearch(trimmed);
    setCommittedSearch(trimmed);
    setShowSuggestions(false);

    if (trimmed) {
      try {
        const historyData = localStorage.getItem("orbi_user_search_history");
        let historyList: string[] = historyData ? JSON.parse(historyData) : [];
        if (!Array.isArray(historyList)) historyList = [];

        historyList = historyList.filter(
          (item) => item && item.toLowerCase() !== trimmed.toLowerCase(),
        );
        historyList.unshift(trimmed);
        historyList = historyList.slice(0, 8);

        localStorage.setItem(
          "orbi_user_search_history",
          JSON.stringify(historyList),
        );
        setSearchHistory(historyList);
      } catch (e) {
        console.error("Failed to save search history:", e);
      }
    }
  };

  const clearSearchHistory = () => {
    try {
      localStorage.removeItem("orbi_user_search_history");
      setSearchHistory([]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setExpandedKeywords([]);
      return;
    }

    let isMounted = true;
    const fetchExpanded = async () => {
      try {
        setIsExpandingSearch(true);
        const sid =
          localStorage.getItem("orbi_visitor_session_id") ||
          (() => {
            const newSid =
              "v-" + Math.random().toString(36).substring(2, 11).toUpperCase();
            localStorage.setItem("orbi_visitor_session_id", newSid);
            return newSid;
          })();
        const devType =
          window.innerWidth < 640
            ? "Mobile"
            : window.innerWidth < 1024
              ? "Tablet"
              : "Desktop";
        let carrier = localStorage.getItem("orbi_visitor_carrier");
        if (!carrier) {
          const carrierList = [
            "Vodacom",
            "Airtel",
            "Halotel",
            "Tigo",
            "TTCL",
            "WiFi",
          ];
          carrier = carrierList[Math.floor(Math.random() * carrierList.length)];
          localStorage.setItem("orbi_visitor_carrier", carrier);
        }
        const res = await fetch(
          `/api/search/expand?q=${encodeURIComponent(debouncedSearch)}&sessionId=${sid}&carrier=${carrier}&device=${devType}`,
        );
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.keywords)) {
          setExpandedKeywords(json.keywords);
        }
      } catch (err) {
        console.error("AI Search query expansion error:", err);
      } finally {
        if (isMounted) {
          setIsExpandingSearch(false);
        }
      }
    };

    fetchExpanded();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch]);

  const { popularCategories, popularSearches } = useMemo(() => {
    const catCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};
    const filteredForNiche = products.filter(
      (p) =>
        selectedNiche === "Zote" || (p.niche || "Mengineyo") === selectedNiche,
    );

    filteredForNiche.forEach((p) => {
      const sales = salesCounts[p.id] || 0;
      catCounts[p.category] = (catCounts[p.category] || 0) + sales + 1;
      p.tags.forEach((t) => {
        const tLower = t.trim().toLowerCase();
        if (tLower) {
          tagCounts[tLower] = (tagCounts[tLower] || 0) + sales + 1;
        }
      });
    });
    return {
      popularCategories: Object.entries(catCounts)
        .sort((a, b) => b[1] - a[1])
        .map((entry) => entry[0])
        .filter((c) => c && c !== "Zote")
        .slice(0, 4),
      popularSearches: Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .map((entry) => entry[0])
        .slice(0, 5),
    };
  }, [products, salesCounts, selectedNiche]);

  const searchIndex = useMemo(() => {
    return new InvertedIndexSearch(filteredProductsBySeller);
  }, [filteredProductsBySeller]);

  useEffect(() => {
    const searchActive = committedSearch && committedSearch.trim().length > 0;
    const matchedProducts = searchActive
      ? searchIndex.search(committedSearch, expandedKeywords)
      : filteredProductsBySeller;

    const filtered = matchedProducts
      .filter((p) => {
        const matchesNiche =
          selectedNiche === "Zote" ||
          (p.niche || "Mengineyo") === selectedNiche;
        let matchesCat =
          selectedCategory === "Zote" || p.category === selectedCategory;

        if (selectedCategory === "Wholesale" && !matchesCat) {
          const s = sellers.find((s) => s.id === p.sellerId);
          if (s) {
            const desc = (s.description || "").toLowerCase();
            const name = (s.name || "").toLowerCase();
            if (
              desc.includes("wholesale") ||
              desc.includes("jumla") ||
              name.includes("wholesale")
            ) {
              matchesCat = true;
            }
          }
        } else if (selectedCategory === "Pro Sellers" && !matchesCat) {
          const s = sellers.find((s) => s.id === p.sellerId);
          if (s && s.isPro && s.proUntil && s.proUntil > Date.now()) {
            matchesCat = true;
          }
        }

        // Semantic Arrangement Tier matching
        let matchesTier = true;
        if (selectedArrangementTier !== "all") {
          if (p.arrangeTier && p.arrangeTier !== "all") {
            matchesTier = p.arrangeTier === selectedArrangementTier;
          } else if (selectedArrangementTier === "luxury") {
            matchesTier =
              p.price >= 50000 ||
              p.name.toLowerCase().includes("luxury") ||
              p.name.toLowerCase().includes("royal") ||
              (p.description && p.description.toLowerCase().includes("luxury"));
          } else if (selectedArrangementTier === "premium") {
            matchesTier =
              (p.price >= 20000 && p.price < 50000) ||
              p.name.toLowerCase().includes("premium") ||
              (p.description &&
                p.description.toLowerCase().includes("premium"));
          } else if (selectedArrangementTier === "standard") {
            matchesTier =
              p.price < 20000 ||
              p.name.toLowerCase().includes("essential") ||
              p.name.toLowerCase().includes("basic");
          }
        }

        // Semantic Arrangement Vibe matching
        let matchesVibe = true;
        if (selectedArrangementVibe !== "all") {
          if (p.vibe && p.vibe !== "all") {
            matchesVibe = p.vibe === selectedArrangementVibe;
          } else {
            const descLower = p.description ? p.description.toLowerCase() : "";
            const nameLower = p.name.toLowerCase();
            if (selectedArrangementVibe === "romance") {
              matchesVibe =
                nameLower.includes("romance") ||
                nameLower.includes("love") ||
                nameLower.includes("red") ||
                nameLower.includes("rose") ||
                descLower.includes("romance") ||
                descLower.includes("rose") ||
                descLower.includes("love");
            } else if (selectedArrangementVibe === "serenity") {
              matchesVibe =
                nameLower.includes("pastel") ||
                nameLower.includes("serenity") ||
                nameLower.includes("pink") ||
                nameLower.includes("white") ||
                descLower.includes("pastel") ||
                descLower.includes("calm") ||
                descLower.includes("white");
            } else if (
              selectedArrangementVibe === "amber" ||
              selectedArrangementVibe === "sunshine"
            ) {
              matchesVibe =
                nameLower.includes("amber") ||
                nameLower.includes("sunset") ||
                nameLower.includes("warm") ||
                nameLower.includes("orange") ||
                nameLower.includes("yellow") ||
                descLower.includes("sunset") ||
                descLower.includes("warm") ||
                descLower.includes("gold") ||
                nameLower.includes("sunshine");
            } else if (
              selectedArrangementVibe === "emerald" ||
              selectedArrangementVibe === "nature"
            ) {
              matchesVibe =
                nameLower.includes("emerald") ||
                nameLower.includes("wealth") ||
                nameLower.includes("money") ||
                nameLower.includes("green") ||
                descLower.includes("emerald") ||
                descLower.includes("wealth") ||
                descLower.includes("rich") ||
                nameLower.includes("nature");
            } else if (selectedArrangementVibe === "minimalist") {
              matchesVibe =
                nameLower.includes("minimalist") ||
                nameLower.includes("sleek") ||
                nameLower.includes("modern") ||
                nameLower.includes("clean") ||
                descLower.includes("minimal") ||
                descLower.includes("sleek") ||
                descLower.includes("modern");
            } else if (selectedArrangementVibe === "mystery") {
              matchesVibe =
                nameLower.includes("mystery") ||
                nameLower.includes("purple") ||
                nameLower.includes("orchid") ||
                descLower.includes("enchanted");
            }
          }
        }

        // Semantic Arrangement Wrap matching
        let matchesWrap = true;
        if (selectedArrangementWrap !== "all") {
          if (p.presentationStyle && p.presentationStyle !== "all") {
            matchesWrap = p.presentationStyle === selectedArrangementWrap;
          } else {
            const descLower = p.description ? p.description.toLowerCase() : "";
            const nameLower = p.name.toLowerCase();
            if (selectedArrangementWrap === "box") {
              matchesWrap =
                nameLower.includes("box") ||
                nameLower.includes("kasha") ||
                descLower.includes("box") ||
                descLower.includes("kasha");
            } else if (selectedArrangementWrap === "wrap") {
              matchesWrap =
                nameLower.includes("wrap") ||
                nameLower.includes("paper") ||
                descLower.includes("wrap") ||
                descLower.includes("paper");
            } else if (selectedArrangementWrap === "basket") {
              matchesWrap =
                nameLower.includes("basket") ||
                nameLower.includes("hamper") ||
                descLower.includes("basket") ||
                descLower.includes("hamper") ||
                descLower.includes("basket");
            } else if (
              selectedArrangementWrap === "acrylic" ||
              selectedArrangementWrap === "glass"
            ) {
              matchesWrap =
                nameLower.includes("acrylic") ||
                nameLower.includes("crystal") ||
                nameLower.includes("cube") ||
                nameLower.includes("glass") ||
                descLower.includes("vase") ||
                descLower.includes("glass");
            }
          }
        }

        return (
          matchesNiche &&
          matchesCat &&
          matchesTier &&
          matchesVibe &&
          matchesWrap
        );
      })
      .sort((a, b) => {
        // If search query is active, sort strictly by name exact matches first, then category, then niche
        if (committedSearch && committedSearch.trim().length > 0) {
          const scoreS_A = BilingualSearchEngine.getRelevanceScore(
            a,
            committedSearch,
            expandedKeywords,
          );
          const scoreS_B = BilingualSearchEngine.getRelevanceScore(
            b,
            committedSearch,
            expandedKeywords,
          );
          if (scoreS_A !== scoreS_B) {
            return scoreS_B - scoreS_A;
          }
        }

        const aSeller = sellers.find((s) => s.id === a.sellerId);
        const bSeller = sellers.find((s) => s.id === b.sellerId);

        // Core business logic priority score calculator:
        // Combined scoring system avoiding binary blocks, so all signals work together fluidly.
        const getPriorityScore = (p: Product, s: SellerProfile | undefined) => {
          let score = 0;

          // 1. Explicitly Liked Product (Maximum individual signal)
          if (likedProductIds.includes(p.id)) {
            score += 100000;
          }

          // 2. Active Subscription/Paid Plan boost (e.g. Standard, Elite, Premium plans)
          const hasPaidPlan =
            s?.activePlanId && s.activePlanId.toLowerCase() !== "free";
          if (hasPaidPlan) {
            score += 40000;
          }

          // 3. Pro Seller status boost
          const isPro = s?.isPro && s?.proUntil && s.proUntil > Date.now();
          if (isPro) {
            score += 25000;
          }

          // 4. Visitor-specific dynamic shuffle boost (to ensure all products reach different visitors fairly)
          const weight = shuffleWeights[p.id] || 0.5;
          score += weight * 4000;

          // 5. Liked niche/category preference matching
          if (p.niche && likedNiches.includes(p.niche.toLowerCase())) {
            score += 20000;
          }

          // 5. Promoted product tag matching (promo/promoted/trend/recommend/vip)
          const isPromoted =
            p.tags &&
            p.tags.some((t) => {
              const tLower = t.toLowerCase();
              return (
                tLower.includes("promoted") ||
                tLower.includes("promo") ||
                tLower.includes("trend") ||
                tLower.includes("recommend") ||
                tLower.includes("vip")
              );
            });
          if (isPromoted) {
            score += 15000;
          }

          // 6. Legacy tracking history metrics (categories / views)
          const catPref = prefs?.categories?.[p.category] || 0;
          const viewPref = prefs?.views?.[p.id] || 0;
          score += catPref * 100 + viewPref * 250;

          return score;
        };

        const scoreA = getPriorityScore(a, aSeller);
        const scoreB = getPriorityScore(b, bSeller);

        // Explicit Sort Orders:
        // Respect standard mathematical parameters. Use business priority ONLY to break equal ties.
        if (sortOrder === "asc") {
          if (a.price !== b.price) {
            return a.price - b.price;
          }
          return scoreB - scoreA; // tie-breaker
        }
        if (sortOrder === "desc") {
          if (a.price !== b.price) {
            return b.price - a.price;
          }
          return scoreB - scoreA; // tie-breaker
        }
        if (sortOrder === "newest") {
          if (a.createdAt !== b.createdAt) {
            return b.createdAt - a.createdAt;
          }
          return scoreB - scoreA; // tie-breaker
        }
        if (sortOrder === "popular") {
          const popularityA =
            (salesCounts[a.id] || 0) * 10 + (prefs?.views?.[a.id] || 0);
          const popularityB =
            (salesCounts[b.id] || 0) * 10 + (prefs?.views?.[b.id] || 0);
          if (popularityA !== popularityB) {
            return popularityB - popularityA;
          }
          return scoreB - scoreA; // tie-breaker
        }

        // Default Sort Order:
        // Sophisticated priority score ranking is the main driver
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }

        // Absolute fallback random weight to maintain server stability
        const wA = shuffleWeights[a.id] || 0.5;
        const wB = shuffleWeights[b.id] || 0.5;
        return wA - wB;
      });
    setFilteredProducts(filtered);

    if (
      filtered.length === 0 &&
      committedSearch &&
      committedSearch.trim().length > 0
    ) {
      const relaxed = matchedProducts
        .map((p) => ({
          p,
          score: BilingualSearchEngine.getRelevanceScore(
            p,
            committedSearch,
            expandedKeywords,
          ),
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.p);
      setMoreSimilarSuggestions(relaxed.slice(0, 12));
    } else {
      setMoreSimilarSuggestions([]);
    }

    if (debouncedSearch.length > 1) {
      const suggestMatched = searchIndex.search(
        debouncedSearch,
        expandedKeywords,
      );
      setSuggestions(
        suggestMatched
          .sort((a, b) => {
            const aSeller = sellers.find((s) => s.id === a.sellerId);
            const bSeller = sellers.find((s) => s.id === b.sellerId);

            const getSuggestScore = (
              p: Product,
              s: SellerProfile | undefined,
            ) => {
              let score = 0;
              if (likedProductIds.includes(p.id)) score += 100000;

              const hasPaidPlan =
                s?.activePlanId && s.activePlanId.toLowerCase() !== "free";
              if (hasPaidPlan) score += 40000;

              const isPro = s?.isPro && s?.proUntil && s.proUntil > Date.now();
              if (isPro) score += 25000;

              if (p.niche && likedNiches.includes(p.niche.toLowerCase()))
                score += 20000;

              return score;
            };

            const scoreA = getSuggestScore(a, aSeller);
            const scoreB = getSuggestScore(b, bSeller);

            if (scoreA !== scoreB) {
              return scoreB - scoreA;
            }

            return (salesCounts[b.id] || 0) - (salesCounts[a.id] || 0);
          })
          .slice(0, 5),
      );
    } else {
      setSuggestions([]);
    }
  }, [
    debouncedSearch,
    committedSearch,
    products,
    selectedNiche,
    selectedCategory,
    sortOrder,
    orders,
    salesCounts,
    viewSeller,
    filteredProductsBySeller,
    sellers,
    shuffleWeights,
    selectedArrangementTier,
    selectedArrangementVibe,
    selectedArrangementWrap,
    searchIndex,
    expandedKeywords,
    likedProductIds,
    likedNiches,
  ]);

  const iconMap: Record<string, any> = {
    Smartphone,
    Shirt,
    Sofa,
    Heart,
    CarFront,
    ShoppingBag,
    Package,
    Store,
    Tag,
    Ticket,
    Activity,
    Award,
    Zap,
    Cpu,
    Camera,
    Bot,
    FileText,
    MessageSquare,
    Laptop,
    Baby,
    Palette,
    Coffee,
    Dumbbell,
    Scissors,
    Briefcase,
    Gift,
    Headphones,
    Cake,
    Watch,
    Bike,
    Key,
    BookOpen,
    Leaf,
    Flame,
    Music,
    Gem,
    Tv,
    Compass,
    Footprints,
    Crown,
    GlassWater,
    Wrench,
    Flower2,
    Globe,
    Anchor,
    Apple,
    Banana,
    Beer,
    Bone,
    Box,
    Brain,
    Brush,
    Bus,
    Calculator,
    Candy,
    Cat,
    ChefHat,
    Clapperboard,
    Cloud,
    Cookie,
    Dog,
    Dices,
    Disc,
    Egg,
    Fan,
    Feather,
    Fish,
    Gamepad2,
    Gavel,
    Guitar,
    Hammer,
    IceCream,
    Joystick,
    Lightbulb,
    Luggage,
    Map,
    Mic,
    Microscope,
    Moon,
    Mountain,
    Paintbrush,
    PenTool,
    Pill,
    Pizza,
    Plane,
    Plug,
    Printer,
    Puzzle,
    Radio,
    Receipt,
    Rocket,
    Ruler,
    Scale,
    Server,
    Shell,
    ShowerHead,
    Shovel,
    Sprout,
    Stethoscope,
    Sun,
    Table,
    Tablet,
    Tent,
    Thermometer,
    Trophy,
    Umbrella,
    Utensils,
    Wallet,
    Wine,
    Armchair,
    Bath,
    Battery,
    Bed,
    Beef,
    BellRing,
    Bird,
    Book,
    Castle,
    Clover,
    Construction,
    Container,
    CupSoda,
    Glasses,
    GraduationCap,
    HardHat,
    Heater,
    Martini,
    Notebook,
    PackageOpen,
    PawPrint,
    Pen,
    Pencil,
    PiggyBank,
    PlugZap,
    Rabbit,
    Refrigerator,
    Salad,
    Sandwich,
    ShoppingBasket,
    Smile,
    Snowflake,
    Soup,
    Speaker,
    Target,
    Telescope,
    Terminal,
    ToyBrick,
    Train,
    Trees,
    Volleyball,
    Wand,
    Warehouse,
    WashingMachine,
    Waves,
    Webcam,
    Wheat,
  };

  const handleCategorySelect = (c: string) => {
    setSelectedCategory(c);
    if (c !== "Zote") {
      setPrefs((p) => {
        const next = {
          ...p,
          categories: { ...p.categories, [c]: (p.categories[c] || 0) + 1 },
        };
        try {
          if (
            localStorage.getItem("orbishop_cookie_consent_accepted") === "true"
          ) {
            localStorage.setItem("orbishop_user_prefs", JSON.stringify(next));
          }
        } catch {}
        return next;
      });
    }
  };

  const trackProductInteraction = (prod: Product) => {
    try {
      const sid =
        localStorage.getItem("orbi_visitor_session_id") ||
        (() => {
          const newSid =
            "v-" + Math.random().toString(36).substring(2, 11).toUpperCase();
          localStorage.setItem("orbi_visitor_session_id", newSid);
          return newSid;
        })();
      fetch("/api/analytics/visitors/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sid,
          action: "product_view",
          productId: prod.id,
          productName: prod.name,
        }),
      }).catch(() => {});
    } catch {}

    setPrefs((p) => {
      const next = {
        categories: {
          ...p.categories,
          [prod.category]: (p.categories[prod.category] || 0) + 1,
        },
        views: { ...p.views, [prod.id]: (p.views[prod.id] || 0) + 1 },
      };
      try {
        if (
          localStorage.getItem("orbishop_cookie_consent_accepted") === "true"
        ) {
          localStorage.setItem("orbishop_user_prefs", JSON.stringify(next));
        }
      } catch {}
      return next;
    });
  };

  const recommendedProducts = useMemo(() => {
    if (!products.length) return [];
    return [...products]
      .map((p) => {
        let score = 0;
        if (prefs.categories[p.category])
          score += prefs.categories[p.category] * 2;
        if (prefs.views[p.id]) score += prefs.views[p.id] * 5;
        if (p.stock > 0 && p.stock < 10) score += 3; // Boost items low in stock (scarcity)
        if (p.stock > 100) score += 1; // Boost popular items

        // Synced Pro Seller Promotion & Visitor Randomization (Rotation Equity)
        const s = sellers.find((sel) => sel.id === p.sellerId);
        const isPro = s?.isPro && s?.proUntil && s.proUntil > Date.now();
        if (isPro) {
          const weight = shuffleWeights[p.id] || 0.5;
          score += 20.0 + weight * 12; // High prominence recommendations synced dynamically
        } else {
          // Dynamic exploration boost makes sure that on reload, recommendations rotate naturally
          const randBoost = (shuffleWeights[p.id] || 0.5) * 4.0;
          score += randBoost;
        }

        return { p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.p)
      .slice(0, 5); // top 5
  }, [products, prefs, sellers, shuffleWeights]);

  const topSellingProducts = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== "cancelled");
    const salesMap: Record<string, number> = {};
    validOrders.forEach((o) => {
      o.items.forEach((i) => {
        salesMap[i.id] = (salesMap[i.id] || 0) + i.quantity;
      });
    });

    const itemsWithSales = [...products]
      .map((p) => {
        const sales = salesMap[p.id] || 0;
        let score = sales;
        const s = sellers.find((sel) => sel.id === p.sellerId);
        const isPro = s?.isPro && s?.proUntil && s.proUntil > Date.now();
        if (isPro) {
          // Sync pro sellers' items into popular recommendations using dynamic visitor seeds
          const weight = shuffleWeights[p.id] || 0.5;
          score += 1.5 + weight * 3.5; // proportional boost to mix them in with high distribution
        }
        return { p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.p);

    // Get up to top 15 bestselling/boosted items, then shuffle per visitor for freshness
    const top15 = itemsWithSales.slice(0, 15);
    return top15
      .sort((a, b) => {
        const wA = shuffleWeights[a.id] || 0.5;
        const wB = shuffleWeights[b.id] || 0.5;
        return wA - wB;
      })
      .slice(0, 5);
  }, [products, orders, sellers, shuffleWeights]);

  const proSellerProducts = useMemo(() => {
    const LATEST_24H = Date.now() - 24 * 60 * 60 * 1000;
    const sellersSales24h: Record<string, number> = {};
    const productSales: Record<string, number> = {};

    orders.forEach((o) => {
      if (o.status !== "cancelled") {
        const is24h =
          (o.timestamp ? new Date(o.timestamp).getTime() : o.date || 0) >=
          LATEST_24H;
        o.items.forEach((i) => {
          const matchedProdId = i.id || i.productId;
          productSales[matchedProdId] =
            (productSales[matchedProdId] || 0) + i.quantity;
          if (is24h) {
            const product = products.find((p) => p.id === matchedProdId);
            if (product) {
              sellersSales24h[product.sellerId] =
                (sellersSales24h[product.sellerId] || 0) + i.quantity;
            }
          }
        });
      }
    });

    // Categorize sellers
    const superstarProSellers = sellers.filter(
      (s) => s.isPro && (sellersSales24h[s.id] || 0) > 2,
    );
    const regularProSellers = sellers.filter(
      (s) => s.isPro && (sellersSales24h[s.id] || 0) <= 2,
    );

    // Non-pro upgraded / promoting sellers who have chosen a strategy on the upgrade UI
    const promotingSellers = sellers.filter((s) => {
      if (s.isPro) return false;
      const strategy = localStorage.getItem("orbi_push_strategy_" + s.id);
      return strategy === "old" || strategy === "new";
    });

    // Rank sellers: 1. Superstar Pro, 2. Regular Pro, 3. Promoting Sellers
    const rankedSellers = [
      ...superstarProSellers,
      ...regularProSellers,
      ...promotingSellers,
    ];

    const finalMatchedProducts: Product[] = [];

    rankedSellers.forEach((seller) => {
      const sellerProds = products.filter(
        (p) => p.sellerId === seller.id && p.stock > 0,
      );
      if (sellerProds.length === 0) return;

      const strategy = seller.isPro
        ? "both"
        : localStorage.getItem("orbi_push_strategy_" + seller.id) || "none";

      if (strategy === "both") {
        // Auto-push BOTH old unsold products (long-lived) and top sold/new products.
        const unsoldOld = [...sellerProds]
          .filter((p) => (productSales[p.id] || 0) === 0)
          .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)); // oldest first

        const topSoldOrNew = [...sellerProds].sort((a, b) => {
          const salesA = productSales[a.id] || 0;
          const salesB = productSales[b.id] || 0;
          if (salesA !== salesB) return salesB - salesA; // most sold first
          return (b.createdAt || 0) - (a.createdAt || 0); // newest first
        });

        // Take up to 3 of each to promote healthy variety
        const addedIds = new Set<string>();
        unsoldOld.slice(0, 3).forEach((p) => {
          finalMatchedProducts.push(p);
          addedIds.add(p.id);
        });
        topSoldOrNew.forEach((p) => {
          if (!addedIds.has(p.id) && addedIds.size < 6) {
            finalMatchedProducts.push(p);
            addedIds.add(p.id);
          }
        });
      } else if (strategy === "old") {
        // Mode 1: Push old unsold products (long-lived stocks)
        const unsoldOld = [...sellerProds]
          .filter((p) => (productSales[p.id] || 0) === 0)
          .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)); // oldest first

        const otherOld = [...sellerProds].sort(
          (a, b) => (a.createdAt || 0) - (b.createdAt || 0),
        ); // oldest overall fallback

        const pool = unsoldOld.length > 0 ? unsoldOld : otherOld;
        pool.slice(0, 4).forEach((p) => finalMatchedProducts.push(p));
      } else if (strategy === "new") {
        // Mode 2: Push new/top sold products
        const topSoldOrNew = [...sellerProds].sort((a, b) => {
          const salesA = productSales[a.id] || 0;
          const salesB = productSales[b.id] || 0;
          if (salesA !== salesB) return salesB - salesA;
          return (b.createdAt || 0) - (a.createdAt || 0);
        });
        topSoldOrNew.slice(0, 4).forEach((p) => finalMatchedProducts.push(p));
      }
    });

    // Shuffle final pro product picks natively using visitor-specific weights to guarantee
    // randomized distribution equity (all pro sellers' products reach visitors fairly)
    return [...finalMatchedProducts].sort((a, b) => {
      const wA = shuffleWeights[a.id] || 0.5;
      const wB = shuffleWeights[b.id] || 0.5;
      return wA - wB;
    });
  }, [products, sellers, orders, shuffleWeights]);

  const topDealsProducts = useMemo(() => {
    const discounted = products.filter(
      (p) => p.oldPrice && p.oldPrice > p.price,
    );
    return [...discounted]
      .map((p) => {
        const percent = ((p.oldPrice || 0) - p.price) / (p.oldPrice || 1);
        const s = sellers.find((sel) => sel.id === p.sellerId);
        const isPro = s?.isPro && s?.proUntil && s.proUntil > Date.now();

        let score = percent;
        if (isPro) {
          // Boost pro items in top deals with controlled visitor randomization
          const weight = shuffleWeights[p.id] || 0.5;
          score += 0.15 + weight * 0.15;
        }
        return { p, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.p)
      .slice(0, 12);
  }, [products, sellers, shuffleWeights]);

  const newArrivalsProducts = useMemo(() => {
    const sorted = [...products]
      .map((p) => {
        const s = sellers.find((sel) => sel.id === p.sellerId);
        const isPro = s?.isPro && s?.proUntil && s.proUntil > Date.now();
        // Time normalized recency score helper
        const recencyScore = p.createdAt ? p.createdAt / Date.now() : 0.5;

        let score = recencyScore * 40;
        const weight = shuffleWeights[p.id] || 0.5;
        if (isPro) {
          // Dynamic pro boost with personalized rotation ensures all new pro arrivals get fair reach
          score += 25 + weight * 20;
        } else {
          score += weight * 8;
        }
        return { p, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.p);

    return sorted.slice(0, 12);
  }, [products, sellers, shuffleWeights]);

  const addToCart = (
    p: Product,
    openCart: boolean = false,
    customQty: number = 1,
  ) => {
    if (p.stock <= 0) return;
    trackProductInteraction(p);

    // Track Visitor Cart Add event
    const sid =
      localStorage.getItem("orbi_visitor_session_id") ||
      (() => {
        const newSid =
          "v-" + Math.random().toString(36).substring(2, 11).toUpperCase();
        localStorage.setItem("orbi_visitor_session_id", newSid);
        return newSid;
      })();
    fetch("/api/analytics/visitors/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sid,
        action: "cart_add",
        productName: p.name,
      }),
    }).catch((e) => console.warn("Analytics log cart_add failed", e));

    setCart((prev) => {
      const ex = prev.find((i) => i.product.id === p.id);
      if (ex) {
        const nextQty = ex.quantity + customQty;
        if (nextQty > p.stock) return prev;
        return prev.map((i) =>
          i.product.id === p.id ? { ...i, quantity: nextQty } : i,
        );
      }
      return [...prev, { product: p, quantity: customQty }];
    });

    if (openCart) {
      setShowCart(true);
    } else {
      const swMsg = "bidhaa imewekwa kapuni kwa manunuzi";
      const enMsg = "Item added to cart list for shopping";
      setToastMsg(lang === "sw" ? swMsg : enMsg);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === id) {
          const newQ = item.quantity + delta;
          if (newQ > 0 && newQ <= item.product.stock) {
            return { ...item, quantity: newQ };
          }
        }
        return item;
      }),
    );
  };

  const handleOpenInternalChat = () => {
    if (activeUser) {
      setProfileInitialTab("messages");
      setShowProfile(true);
    } else {
      showAlert(
        lang === "sw"
          ? "Tafadhali jisajili au ingia kwanza ili uweze kuanza mazungumzo na timu yetu ya msaada."
          : "Please login or register first to start a support chat with our team.",
        "info",
      );
      setShowAuth("login");
    }
  };

  const totalCart = cart.reduce(
    (acc, i) => acc + getProductPriceForQty(i.product, i.quantity) * i.quantity,
    0,
  );

  const renderSearchSuggestions = () => {
    const finalPopularSearches =
      backendPopularSearches.length > 0
        ? backendPopularSearches
        : popularSearches;

    return (
      <div className="absolute top-full left-0 w-full bg-white mt-3 rounded-2xl shadow-xl border border-slate-100 p-4 z-50 text-slate-800 flex flex-col gap-5 text-left max-h-[70vh] overflow-y-auto">
        {expandedKeywords.length > 0 && (
          <div className="bg-amber-50/50 border border-amber-100/80 rounded-xl p-2.5 px-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-2">
              <Sparkles size={11} className="text-amber-600 animate-pulse" />
              {lang === "sw" ? "Tafta na Orbi" : "Orbi search assist"}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {expandedKeywords.map((kw, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applySearch(kw);
                  }}
                  className="bg-white hover:bg-amber-50 border border-slate-100 hover:border-amber-200 text-slate-700 hover:text-amber-900 px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer shadow-xs"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        )}
        {debouncedSearch.length > 1 ? (
          suggestions.length > 0 ? (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">
                {lang === "sw" ? "Bidhaa Zinazolingana" : "Matching Products"}
              </div>
              <div className="space-y-1">
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setShowSuggestions(false);
                      handleProductSelect(p);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-slate-50 rounded-xl text-sm font-medium flex items-center gap-3 transition cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden">
                      {p.images && p.images[0] ? (
                        <img
                          src={p.images[0]}
                          className="w-full h-full object-cover"
                          alt={p.name}
                        />
                      ) : (
                        <Search size={14} />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="line-clamp-1">{p.name}</span>
                      <span className="text-[10px] text-slate-500 font-normal line-clamp-1">
                        {p.category}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500 py-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 font-medium">
              {lang === "sw" ? "Hakuna matokeo" : "No results found"}
            </div>
          )
        ) : (
          <>
            {searchHistory.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <History size={11} className="text-slate-400" />
                    {lang === "sw" ? "Historia ya Utafutaji" : "Search History"}
                  </span>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      clearSearchHistory();
                    }}
                    className="text-[9px] font-bold text-red-500 hover:text-red-700 uppercase tracking-wider cursor-pointer"
                  >
                    {lang === "sw" ? "Futa" : "Clear"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 px-1">
                  {searchHistory.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applySearch(term);
                      }}
                      className="bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <History size={11} className="text-slate-400" />
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {finalPopularSearches.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2 flex items-center gap-1.5">
                  <TrendingUp size={11} className="text-orange-400" />
                  {lang === "sw" ? "Maudhui Yanayovuma" : "Popular Searches"}
                </div>
                <div className="flex flex-wrap gap-2 px-1">
                  {finalPopularSearches.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applySearch(tag);
                      }}
                      className="bg-slate-50 hover:bg-orange-50/70 border border-slate-100 hover:border-orange-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <TrendingUp size={12} className="text-orange-400" />
                      {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {popularCategories.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">
                  {lang === "sw" ? "Kundi Maarufu" : "Trending Categories"}
                </div>
                <div className="flex flex-wrap gap-2 px-1">
                  {popularCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedCategory(cat);
                        setShowSuggestions(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="bg-slate-50 border border-slate-100 hover:border-orange-200 hover:bg-orange-50 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <>
      {showAboutPage && (
        <div className="fixed inset-0 z-[999999] bg-white overflow-y-auto">
          <AboutUsPage
            lang={lang}
            onClose={() => setShowAboutPage(false)}
            initialPage={aboutPageTab}
          />
        </div>
      )}
      <div
        className={`min-h-screen flex flex-col font-sans bg-slate-50 ${viewInvoice ? "print:hidden" : ""}`}
      >
        {/* Header */}
        <header
          style={{
            backgroundColor: globalSettings?.appBarColor || undefined,
          }}
          className="bg-slate-900 shrink-0 shadow-md sticky top-0 z-[120] transition-all relative"
        >
          <AppBarBackgroundSlider settings={globalSettings} />
          <div className="h-[60px] flex items-center justify-between px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="flex items-center whitespace-nowrap gap-1.5">
                <img
                  src="https://media-stock.orbifinancial.com/OrbiShop_Logo_Blue.png"
                  alt="Orbi"
                  className="h-[52px] sm:h-[60px] md:h-[68px] object-contain brightness-0 invert drop-shadow-md relative z-10 transition-all hover:scale-105 duration-300"
                />
              </div>
            </div>

            <div className="hidden md:block flex-1 max-w-2xl relative px-4">
              <div className="relative group flex items-center">
                <input
                  type="text"
                  placeholder={t(lang, "nav.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      applySearch(search);
                    }
                  }}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full bg-slate-800/80 text-slate-100 placeholder-slate-450 rounded-full py-2 px-5 pl-10 pr-12 outline-none border border-slate-700/80 focus:border-amber-500 focus:bg-white focus:text-slate-800 focus:placeholder-slate-400 focus:ring-4 focus:ring-amber-500/10 transition-all backdrop-blur-sm font-medium shadow-inner"
                />
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors"
                  size={18}
                />
                {isExpandingSearch && (
                  <Sparkles
                    className="absolute right-11 top-1/2 -translate-y-1/2 text-amber-500 animate-pulse"
                    size={16}
                    title={
                      lang === "sw"
                        ? "Orbi inaboresha utafutaji..."
                        : "Orbi expanding search..."
                    }
                  />
                )}
                <label
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 group-focus-within:text-slate-400 group-focus-within:hover:text-amber-500 transition-colors cursor-pointer flex items-center justify-center p-1"
                  title={
                    lang === "sw"
                      ? "Tafuta kwa picha (Vision AI)"
                      : "Search by Image (Vision AI)"
                  }
                >
                  <Camera size={18} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAIImageChange}
                    className="hidden"
                  />
                </label>
                {showSuggestions && renderSearchSuggestions()}
              </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 sm:gap-2 md:gap-3 shrink-0">
              <button
                onClick={() => setLang(lang === "sw" ? "en" : "sw")}
                className="text-xs md:text-sm font-medium hover:bg-white/10 transition border border-white/20 rounded-full px-2.5 py-1.5 flex items-center gap-1.5 text-white shadow-xs shrink-0 cursor-pointer"
                title={
                  lang === "sw"
                    ? "Switch to English"
                    : "Badili kwenda Kiswahili"
                }
              >
                <span className="flex items-center shrink-0">
                  {lang === "sw" ? <TanzaniaFlag /> : <UKFlag />}
                </span>
                <span className="hidden sm:inline uppercase text-[10px] md:text-xs font-bold tracking-wider">
                  {lang === "sw" ? "SW" : "EN"}
                </span>
              </button>

              {activeUser ? (
                <div className="flex items-center gap-2 sm:gap-3 text-sm font-medium sm:border-l border-white/20 sm:pl-4 relative group">
                  {/* Subtle active notification bell badge */}
                  <div className="relative shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowNotificationsMenu(!showNotificationsMenu);
                      }}
                      className="relative p-2 text-white hover:bg-white/10 rounded-full transition-all cursor-pointer flex items-center justify-center shrink-0"
                      title={lang === "sw" ? "Taarifa Muhimu" : "Notifications"}
                    >
                      <Bell
                        size={18}
                        className="hover:rotate-12 transition-transform"
                      />
                      {unreadNotificationsCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-black flex items-center justify-center border border-orange-500 animate-pulse leading-none">
                          {unreadNotificationsCount}
                        </span>
                      )}
                    </button>

                    {showNotificationsMenu && (
                      <div className="absolute top-11 -right-16 md:right-0 w-[290px] sm:w-[320px] max-h-[380px] overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-150 p-4 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                          <h4 className="font-extrabold text-xs flex items-center gap-1.5 text-slate-800">
                            <Bell size={14} className="text-orange-500" />
                            <span>
                              {lang === "sw"
                                ? "Taarifa Mpya"
                                : "Recent Updates"}
                            </span>
                          </h4>
                          {unreadNotificationsCount > 0 && (
                            <button
                              onClick={() => {
                                const allIds = notifications.map((n) => n.id);
                                saveReadNotificationIds(allIds);
                              }}
                              className="text-[10px] text-orange-500 hover:text-orange-600 font-bold hover:underline"
                            >
                              {lang === "sw" ? "Soma zote" : "Mark read"}
                            </button>
                          )}
                        </div>

                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-400">
                            {lang === "sw"
                              ? "Huna taarifa yoyote mpya."
                              : "No new notifications."}
                          </div>
                        ) : (
                          <div className="space-y-2 mt-1 max-h-[290px] overflow-y-auto pr-1">
                            {notifications.map((n) => {
                              const isRead = readNotificationIds.includes(n.id);
                              return (
                                <div
                                  key={n.id}
                                  onClick={() => {
                                    if (!isRead) {
                                      saveReadNotificationIds([
                                        ...readNotificationIds,
                                        n.id,
                                      ]);
                                    }
                                    if (n.type === "order") {
                                      setProfileInitialTab("orders");
                                      setShowProfile(true);
                                    } else if (n.type === "message") {
                                      setProfileInitialTab("messages");
                                      setShowProfile(true);
                                    } else if (n.type === "discount") {
                                      setProfileInitialTab("rewards");
                                      setShowProfile(true);
                                    }
                                    setShowNotificationsMenu(false);
                                  }}
                                  className={`p-2 rounded-xl border text-left cursor-pointer transition-all hover:bg-slate-50 relative ${
                                    isRead
                                      ? "bg-white border-slate-100 text-slate-500"
                                      : "bg-orange-50/30 border-orange-100/40 text-slate-800 font-medium"
                                  }`}
                                >
                                  {!isRead && (
                                    <span className="absolute top-2.5 right-2 w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                                  )}
                                  <div className="flex items-start gap-2">
                                    <div className="mt-0.5 shrink-0 text-orange-500">
                                      {n.type === "order" ? (
                                        <Truck size={12} />
                                      ) : n.type === "discount" ? (
                                        <Sparkles size={12} />
                                      ) : (
                                        <MessageSquare size={12} />
                                      )}
                                    </div>
                                    <div className="leading-tight flex-1">
                                      <div className="text-[11px] font-bold text-slate-800 mb-0.5 max-w-[210px] truncate">
                                        {lang === "sw" ? n.titleSw : n.title}
                                      </div>
                                      <div className="text-[10px] text-slate-400 leading-normal line-clamp-2">
                                        {lang === "sw" ? n.descSw : n.desc}
                                      </div>
                                      <div className="text-[8px] text-slate-350 mt-1 font-mono">
                                        {new Date(n.date).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() => {
                      setProfileInitialTab("orders");
                      setShowProfile(true);
                    }}
                    className="w-9 h-9 rounded-full bg-white text-orange-600 flex items-center justify-center font-bold text-sm uppercase shadow-sm cursor-pointer hover:scale-105 transition-transform relative"
                  >
                    {activeUser.name.charAt(0)}
                  </div>
                  <div className="hidden md:flex flex-col leading-none text-white">
                    <span
                      onClick={() => {
                        setProfileInitialTab("orders");
                        setShowProfile(true);
                      }}
                      className="truncate max-w-[100px] mb-0.5 cursor-pointer hover:underline flex items-center gap-1.5 font-bold"
                    >
                      <span>{activeUser.name}</span>
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div
                        onClick={() => {
                          setShowProfile(true);
                          setProfileInitialTab("rewards" as any);
                        }}
                        className="flex items-center gap-1 text-[10px] text-amber-200 hover:text-amber-100 font-bold cursor-pointer transition-colors"
                        title={
                          lang === "sw" ? "Alama za Uaminifu" : "Loyalty Points"
                        }
                      >
                        <Sparkles
                          size={10}
                          className="text-amber-300 animate-pulse"
                        />
                        <span>
                          {getLoyaltyPoints(activeUser.id)}{" "}
                          {lang === "sw" ? "alama" : "pts"}
                        </span>
                      </div>
                      <span className="text-white/30 text-[9px]">•</span>
                      <button
                        onClick={logoutClient}
                        className="text-[10px] text-orange-100 hover:text-white transition uppercase tracking-wider font-bold"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                  {/* Account Dropdown Menu */}
                  <div className="absolute top-10 -right-2 bg-white shadow-xl rounded-2xl border border-slate-150 p-2.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col min-w-[190px] z-50 text-slate-800">
                    <div
                      onClick={() => {
                        setProfileInitialTab("orders");
                        setShowProfile(true);
                      }}
                      className="cursor-pointer hover:bg-slate-50 rounded-lg p-2 text-left mb-1.5 border-b border-slate-100 pb-2"
                    >
                      <div className="text-sm font-bold text-slate-800 truncate">
                        {activeUser.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {activeUser.phone || "Mteja"}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setProfileInitialTab("orders");
                        setShowProfile(true);
                      }}
                      className="text-xs text-slate-700 font-bold px-2.5 py-2 hover:bg-slate-50 rounded-lg text-left w-full transition-all flex items-center gap-2.5 cursor-pointer"
                    >
                      <Package size={14} className="text-orange-500 shrink-0" />
                      <span>
                        {lang === "sw" ? "Manunuzi Yangu" : "My Orders"}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileInitialTab("track");
                        setShowProfile(true);
                      }}
                      className="text-xs text-slate-700 font-bold px-2.5 py-2 hover:bg-slate-50 rounded-lg text-left w-full transition-all flex items-center gap-2.5 cursor-pointer"
                    >
                      <Truck size={14} className="text-orange-500 shrink-0" />
                      <span>
                        {lang === "sw" ? "Fuatilia Oda" : "Track Order"}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileInitialTab("messages");
                        setShowProfile(true);
                      }}
                      className="text-xs text-slate-700 font-bold px-2.5 py-2 hover:bg-slate-50 rounded-lg text-left w-full transition-all flex items-center gap-2.5 cursor-pointer"
                    >
                      <MessageSquare
                        size={14}
                        className="text-orange-500 shrink-0"
                      />
                      <span>{lang === "sw" ? "Mawasiliano" : "Messages"}</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileInitialTab("rewards");
                        setShowProfile(true);
                      }}
                      className="text-xs text-slate-700 font-bold px-2.5 py-2 hover:bg-slate-50 rounded-lg text-left w-full transition-all flex items-center gap-2.5 cursor-pointer"
                    >
                      <Sparkles size={14} className="text-amber-500 shrink-0" />
                      <span>
                        {lang === "sw" ? "Zawadi & Alama" : "Rewards & Points"}
                      </span>
                    </button>

                    <div className="border-t border-slate-100 mt-1.5 pt-1.5">
                      <button
                        onClick={logoutClient}
                        className="text-xs text-red-500 font-bold px-2.5 py-2 hover:bg-red-50 rounded-lg text-left w-full transition-colors flex items-center gap-2.5 cursor-pointer"
                      >
                        <Lock size={14} className="shrink-0" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  <button
                    onClick={() => setShowAuth("login")}
                    className="px-1.5 sm:px-2.5 py-1 bg-transparent hover:bg-white/10 text-white font-bold border border-white/30 hover:border-white rounded-full transition-all text-xs tracking-normal cursor-pointer shrink-0 select-none"
                    title={lang === "sw" ? "Ingia" : "Log In"}
                  >
                    {lang === "sw" ? "Ingia" : "Log In"}
                  </button>
                  <button
                    onClick={() => setShowAuth("register")}
                    className="px-1.5 sm:px-2.5 py-1 bg-white hover:bg-orange-50 text-orange-600 font-bold rounded-full transition-all shadow-xs text-xs tracking-normal cursor-pointer border border-transparent shrink-0 select-none"
                    title={lang === "sw" ? "Jisajili" : "Sign Up"}
                  >
                    {lang === "sw" ? "Jisajili" : "Sign Up"}
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowCart(true)}
                className="relative p-2.5 bg-white hover:bg-orange-50 text-orange-600 rounded-full transition shadow-md hover:shadow-lg hover:-translate-y-0.5 ml-1 border border-transparent"
              >
                <ShoppingCart size={20} />
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-slate-900 border-2 border-white text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in">
                    {cart.reduce((a, c) => a + c.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden px-4 pb-2">
            <div className="relative group flex items-center">
              <input
                type="text"
                placeholder={t(lang, "nav.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applySearch(search);
                  }
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onFocus={() => setShowSuggestions(true)}
                className="w-full bg-white/10 text-white placeholder-orange-100 rounded-full py-2 px-5 pl-10 pr-12 outline-none border border-white/20 focus:border-white focus:bg-white focus:text-slate-800 focus:placeholder-slate-400 focus:ring-4 focus:ring-white/30 transition-all text-sm backdrop-blur-sm shadow-inner"
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-200 group-focus-within:text-orange-500 transition-colors"
                size={16}
              />
              {isExpandingSearch && (
                <Sparkles
                  className="absolute right-11 top-1/2 -translate-y-1/2 text-amber-300 animate-pulse"
                  size={14}
                  title={
                    lang === "sw"
                      ? "Orbi inaboresha utafutaji..."
                      : "Orbi expanding search..."
                  }
                />
              )}
              <label
                className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-200 hover:text-white group-focus-within:text-slate-400 group-focus-within:hover:text-orange-500 transition-colors cursor-pointer flex items-center justify-center p-1"
                title={
                  lang === "sw"
                    ? "Tafuta kwa picha (Vision AI)"
                    : "Search by Image (Vision AI)"
                }
              >
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAIImageChange}
                  className="hidden"
                />
              </label>
              {showSuggestions && renderSearchSuggestions()}
            </div>
          </div>

          {/* Quick Niche Sub Menu Horizontal Scroll */}
          <div
            className="relative z-0 w-full bg-white text-slate-800"
            onMouseLeave={() => {
              setHoveredNiche(null);
              setHoveredCategory(null);
            }}
          >
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>

            <div
              className="flex px-4 sm:px-6 gap-6 overflow-x-auto no-scrollbar items-center border-none"
              ref={nicheScrollRef}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {niches.map((n: Niche) => {
                const Icon = iconMap[n.icon] || Globe;
                const isSelected = selectedNiche === n.name;
                const count =
                  n.name === "Zote"
                    ? products.length
                    : products.filter(
                        (p) => (p.niche || "Mengineyo") === n.name,
                      ).length;
                return (
                  <button
                    key={n.name}
                    onClick={() => {
                      setSelectedNiche(n.name);
                      setSelectedCategory("Zote");
                      setSearch("");
                    }}
                    onMouseEnter={(e) => {
                      if (window.innerWidth < 720) return;
                      setHoveredNiche(n.name);
                      const rect = e.currentTarget.getBoundingClientRect();
                      const parentRect =
                        e.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
                      if (parentRect) {
                        setHoveredNicheX(rect.left - parentRect.left);
                      }
                    }}
                    className={`flex items-center gap-1.5 py-1.5 sm:py-2 font-bold text-[11px] sm:text-xs transition-all shrink-0 cursor-pointer border-b-2 outline-none ${
                      isSelected
                        ? "border-[#ff4c00] text-[#ff4c00]"
                        : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <Icon
                      size={13}
                      className={
                        isSelected ? "text-[#ff4c00]" : "text-slate-400"
                      }
                    />
                    <span className="whitespace-nowrap">{n.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 font-black rounded-full leading-none ${isSelected ? "bg-[#ff4c00]/10 text-[#ff4c00]" : "bg-slate-100 text-slate-500"}`}
                    >
                      {formatItemCount(count)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Hover Mega Menu for Niche Products */}
            {hoveredNiche && megaMenuProducts.length > 0 && (
              <div
                className="absolute top-full bg-white shadow-2xl z-[100] p-4 border border-slate-200 rounded-b-2xl mt-0 w-[320px] sm:w-[480px] transition-all duration-150"
                style={{
                  left:
                    hoveredNicheX !== null
                      ? `${Math.max(12, Math.min(hoveredNicheX, window.innerWidth - 500))}px`
                      : "12px",
                }}
              >
                <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-3">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  {lang === "sw" ? "Bidhaa Bora za" : "Top Pro Products in: "}
                  <span className="text-amber-600 ml-1">{hoveredNiche}</span>
                </h3>
                <div className="flex overflow-x-auto gap-3 no-scrollbar pb-1.5 w-full">
                  {megaMenuProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedProduct(p);
                        setSelectedNiche(p.niche || "Mengineyo");
                        setHoveredNiche(null);
                      }}
                      className="flex-none w-[110px] sm:w-[130px] flex flex-col text-left group bg-slate-50 rounded-xl p-2 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                    >
                      <div className="w-full aspect-[4/3] rounded-lg bg-slate-200 overflow-hidden mb-2">
                        {p.images && p.images[0] ? (
                          <img
                            src={p.images[0]}
                            className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ShoppingBag />
                          </div>
                        )}
                      </div>
                      <h4 className="text-[11px] font-bold text-slate-800 line-clamp-1 group-hover:text-amber-600 transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-[9px] text-slate-500 truncate mt-0.5">
                        {p.category}
                      </p>
                      <div className="mt-1 font-black text-slate-900 text-xs">
                        <PriceDisplay amount={p.price} className="text-xs" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {showProfile && activeUser ? (
          <main className="flex-1 w-full flex flex-col bg-slate-50">
            <CustomerProfile
              user={activeUser}
              onClose={() => setShowProfile(false)}
              lang={lang}
              onUserUpdate={setActiveUser}
              onLogout={logoutClient}
              onRefresh={() => loadData(true)}
              orders={orders.filter(
                (o) =>
                  o.customer_id === activeUser.id ||
                  o.customerId === activeUser.id ||
                  (o.customerDetails?.phone === activeUser.phone &&
                    activeUser.phone !== ""),
              )}
              onViewInvoice={setViewInvoice}
              initialTab={profileInitialTab}
              aiChatHistory={aiChatHistory}
              sendAIChatMessage={sendAIChatMessage}
              isAILoading={isAILoading}
              isTransferredToLive={isTransferredToLive}
              aiSelectedImage={aiSelectedImage}
              setAiSelectedImage={setAiSelectedImage}
              aiInputMessage={aiInputMessage}
              setAIInputMessage={setAIInputMessage}
              handleAIImageChange={handleAIImageChange}
              aiLockTimeRemaining={aiLockTimeRemaining}
              forcePointsUpdate={forcePointsUpdate}
              setForcePointsUpdate={setForcePointsUpdate}
              handleReceiptUpload={handleReceiptUpload}
              isParsingReceipt={isParsingReceipt}
              parsedReceiptData={parsedReceiptData}
              handleClaimReceiptPoints={handleClaimReceiptPoints}
              setParsedReceiptData={setParsedReceiptData}
              parsingError={parsingError}
              handleRedeemVoucher={handleRedeemVoucher}
              coupons={coupons}
              onWriteReview={(productId, productName) => {
                setSelectedProductForReview({
                  id: productId,
                  name: productName,
                });
                setShowReviewModal(true);
              }}
            />
          </main>
        ) : viewPromo ? (
          <main className="flex-1 w-full flex flex-col items-center">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 flex-1 flex flex-col">
              <button
                onClick={() => setViewPromo(null)}
                className="mb-6 px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition flex items-center gap-2 self-start"
              >
                <ChevronLeft size={18} /> Rudi
              </button>
              <div className="flex-1 w-full relative">
                <PromoCarousel
                  promos={[viewPromo]}
                  products={products}
                  onAddToCart={addToCart}
                  onViewPromo={() => {}}
                  isIsolated={true}
                />
              </div>
            </div>
          </main>
        ) : (
          <main className="flex-1 w-full bg-slate-50/50 pb-12 overflow-hidden flex flex-col pt-0 md:pt-4">
            <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
              {!viewSeller ? (
                <>
                  {/* Promos */}
                  {isLoading ? (
                    <div className="bg-slate-200 animate-pulse max-[720px]:w-[calc(100%+16px)] max-[720px]:-mx-2 sm:max-[720px]:w-[calc(100%+32px)] sm:max-[720px]:-mx-4 min-[720px]:w-full min-[720px]:mx-0 max-[720px]:rounded-none min-[720px]:rounded-[14px] max-[720px]:aspect-[27/20] min-[720px]:aspect-[16/9] md:aspect-[21/9] lg:aspect-[24/9] max-h-[360px] mb-8 shadow-sm"></div>
                  ) : carouselAds.length > 0 ? (
                    <div className="mb-10">
                      <PromoCarousel
                        promos={carouselAds}
                        products={products}
                        onAddToCart={addToCart}
                        onViewPromo={setViewPromo}
                      />
                    </div>
                  ) : null}

                  {/* Promotional Countdown Banners */}
                  <PromotionalBannersSection
                    banners={promotionalBanners}
                    products={products}
                    onAddToCart={addToCart}
                    onSelectProduct={setSelectedProduct}
                    lang={lang}
                  />
                </>
              ) : (
                <div className="mb-10 bg-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm border border-slate-200">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shrink-0 border-4 border-slate-50 shadow-md">
                    {viewSeller.avatar ? (
                      <img
                        src={viewSeller.avatar}
                        alt={viewSeller.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                        <Store size={40} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start group">
                    <button
                      onClick={() => setViewSeller(null)}
                      className="text-sm font-bold text-slate-500 hover:text-orange-600 flex items-center gap-1 mb-2 bg-slate-100 hover:bg-orange-50 px-3 py-1 rounded-full transition-colors"
                    >
                      <ChevronLeft size={16} />{" "}
                      {lang === "sw" ? "Rudi" : "Back"}
                    </button>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
                      {viewSeller.name}
                    </h2>
                    <p className="text-slate-600 max-w-2xl text-sm md:text-base leading-relaxed mb-4">
                      {viewSeller.description}
                    </p>
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold border border-blue-100">
                      <ShieldCheck size={18} className="text-blue-500" />
                      {lang === "sw"
                        ? "Muuzaji Aliyethibitishwa"
                        : "Verified Seller"}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Store Area */}
            <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 mt-2 md:mt-3">
              <div className="w-full space-y-3 sm:space-y-4">
                {/* Custom Arrangements Visual Lookup Panel */}
                <div className="pt-1 pb-0">
                  {(selectedArrangementTier !== "all" ||
                    selectedArrangementVibe !== "all" ||
                    selectedArrangementWrap !== "all") && (
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={() => {
                          setSelectedArrangementTier("all");
                          setSelectedArrangementVibe("all");
                          setSelectedArrangementWrap("all");
                        }}
                        className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full px-2 py-1 transition cursor-pointer"
                      >
                        {lang === "sw" ? "Futa Vyote (Reset)" : "Clear Options"}
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-1 md:gap-2">
                    {/* Select 1: Arrangement Tier */}
                    <CustomSelect
                      value={selectedArrangementTier}
                      onChange={setSelectedArrangementTier}
                      iconLabel="🛍️"
                      label={
                        lang === "sw"
                          ? "Kiwango cha Thamani (Tier)"
                          : "Arrangement Tier"
                      }
                      align="left"
                      options={[
                        {
                          id: "all",
                          label: lang === "sw" ? "Ngazi Zote" : "All Tiers",
                          subtitle: "No price restrictions",
                        },
                        {
                          id: "standard",
                          label:
                            lang === "sw"
                              ? "Kawaida / Budget"
                              : "Standard Essentials",
                          subtitle: "Eco-friendly, essential gifts",
                        },
                        {
                          id: "premium",
                          label:
                            lang === "sw"
                              ? "Kifahari / Premium"
                              : "Premium Artistry",
                          subtitle: "Handcrafted deluxe options",
                        },
                        {
                          id: "luxury",
                          label:
                            lang === "sw" ? "Kifalme / Luxury" : "Royal Luxury",
                          subtitle: "Bespoke high-end masterpieces",
                        },
                      ]}
                    />

                    {/* Select 2: Color Vibes / Aesthetics */}
                    <CustomSelect
                      value={selectedArrangementVibe}
                      onChange={setSelectedArrangementVibe}
                      iconLabel="🎨"
                      label={
                        lang === "sw"
                          ? "Mandhari ya Rangi (Vibe)"
                          : "Arrangement Vibe"
                      }
                      align="center"
                      options={[
                        {
                          id: "all",
                          label:
                            lang === "sw"
                              ? "Mandhari Zote"
                              : "All Vibes & Colors",
                        },
                        {
                          id: "romance",
                          label:
                            lang === "sw"
                              ? "🔴 Upendo (Red / Rose)"
                              : "🔴 Crimson Romance",
                        },
                        {
                          id: "serenity",
                          label:
                            lang === "sw"
                              ? "⚪ Utulivu (Pink / White)"
                              : "⚪ Pastel Serenity",
                        },
                        {
                          id: "amber",
                          label:
                            lang === "sw"
                              ? "🟠 Machweo (Gold / orange)"
                              : "🟠 Sunset Amber",
                        },
                        {
                          id: "emerald",
                          label:
                            lang === "sw"
                              ? "🟢 Mali na Kijani (Green)"
                              : "🟢 Emerald Wealth",
                        },
                        {
                          id: "minimalist",
                          label:
                            lang === "sw"
                              ? "⚫ Rahisi ya Kisasa (Sleek)"
                              : "⚫ Modern Minimalist",
                        },
                      ]}
                    />

                    {/* Select 3: Presentation Box/Wrap Style */}
                    <CustomSelect
                      value={selectedArrangementWrap}
                      onChange={setSelectedArrangementWrap}
                      iconLabel="🎁"
                      label={
                        lang === "sw"
                          ? "Mtindo wa Ufungashaji"
                          : "Presentation Style"
                      }
                      align="right"
                      options={[
                        {
                          id: "all",
                          label:
                            lang === "sw"
                              ? "Aina Zote za Mipango"
                              : "All Presentations",
                        },
                        {
                          id: "box",
                          label:
                            lang === "sw"
                              ? "Kasha Maalum la Zawadi"
                              : "Signature Gift Box",
                        },
                        {
                          id: "wrap",
                          label:
                            lang === "sw"
                              ? "Karatasi Kifahari / Buketi"
                              : "Special Wrap / Bouquets",
                        },
                        {
                          id: "basket",
                          label:
                            lang === "sw"
                              ? "Kikapu cha Mkono / Hamper"
                              : "Handcrafted Basket",
                        },
                        {
                          id: "acrylic",
                          label:
                            lang === "sw"
                              ? "Glasi ya Kioo ya Acrylic"
                              : "Bespoke Acrylic Cube",
                        },
                      ]}
                    />
                  </div>

                  {/* Match counter banner */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-black text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>
                        {lang === "sw"
                          ? `${filteredProducts.length} Mpangilio umeoana na vigezo vyako`
                          : `${filteredProducts.length} arrangements match your criteria`}
                      </span>
                    </div>
                    {(selectedArrangementTier !== "all" ||
                      selectedArrangementVibe !== "all" ||
                      selectedArrangementWrap !== "all") && (
                      <div className="text-[10px] text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 uppercase tracking-wider animate-pulse">
                        {lang === "sw"
                          ? "Mchujo Umewashwa!"
                          : "Vibe-match Active!"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Selling & Recommended (Segmented Behavior Modules) */}
                <div className="flex flex-col space-y-6 sm:space-y-10">
                  {/* BEHAVIOR MODULE 1: TOP DEALS (Lowest Prices with specific pricing formatting & labels) */}
                  {topDealsProducts.length > 0 &&
                    !isLoading &&
                    selectedCategory === "Zote" &&
                    search === "" && (
                      <div className="lg:py-6 py-4 bg-transparent relative overflow-hidden flex flex-col border-b border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg md:text-xl font-extrabold text-slate-950 tracking-tight flex items-center gap-1.5 leading-tight">
                              {lang === "sw" ? "Ofa Moto-Moto" : "Top Deals"}
                            </h3>
                            <p className="text-[10px] md:text-xs text-slate-400 font-medium">
                              {lang === "sw"
                                ? "Okoa kwa bei nafuu kupita kawaida sokoni"
                                : "Score the lowest prices on Orbi Shop"}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400 hover:text-slate-600 cursor-pointer transition">
                            <span className="text-xs font-bold">
                              {lang === "sw" ? "Zote" : "View All"}
                            </span>
                            <ChevronRight size={18} />
                          </div>
                        </div>

                        <div className="flex gap-2.5 md:gap-3 overflow-x-auto pb-4 pt-1 scrollbar-none flex-nowrap -mx-2 px-2 sm:-mx-4 sm:px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
                          {topDealsProducts.map((p) => {
                            const pSeller = sellers.find(
                              (s) => s.id === p.sellerId,
                            );
                            const hasDiscount =
                              p.oldPrice && p.oldPrice > p.price;
                            const percentOff = hasDiscount
                              ? Math.round(
                                  ((p.oldPrice! - p.price) / p.oldPrice!) * 100,
                                )
                              : 0;

                            return (
                              <div
                                key={`deal-${p.id}`}
                                onClick={() => handleProductSelect(p)}
                                className="w-[130px] sm:w-[155px] shrink-0 bg-transparent hover:bg-slate-50 transition cursor-pointer snap-start flex flex-col group justify-between"
                              >
                                <div>
                                  <div className="aspect-square w-full rounded-lg sm:rounded-xl overflow-hidden bg-slate-100 relative mb-2">
                                    <img
                                      src={p.images[0]}
                                      alt={p.name}
                                      className="w-full h-full object-contain p-1 group-hover:scale-[1.03] transition duration-500"
                                      referrerPolicy="no-referrer"
                                    />
                                    {hasDiscount && (
                                      <div className="absolute top-1.5 left-1.5 bg-rose-600/90 text-white text-[9px] px-1.5 py-0.5 rounded backdrop-blur-xs font-bold leading-none shadow-xs">
                                        -{percentOff}%
                                      </div>
                                    )}
                                    {pSeller?.isPro && (
                                      <div className="absolute top-1.5 right-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[7px] px-1 py-0.5 rounded shadow-xs font-bold uppercase tracking-widest leading-none">
                                        PRO
                                      </div>
                                    )}
                                  </div>

                                  <h4 className="text-[11px] sm:text-[12px] font-medium text-slate-800 line-clamp-2 leading-[1.3] group-hover:text-[#ff4c00] transition-colors mb-1">
                                    {p.name}
                                  </h4>
                                </div>

                                <div className="mt-1">
                                  <PriceDisplay
                                    amount={p.price}
                                    colorClass="text-[#ff4c00]"
                                    className="text-[13px] sm:text-[14px] mb-1"
                                  />
                                  <p className="text-[9px] text-[#ff4c00] mt-0.5 font-medium leading-none text-left truncate w-full">
                                    {lang === "sw"
                                      ? "Chini kwa zinazofanana"
                                      : "Lowest among similar"}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* BEHAVIOR MODULE 2: NEW ARRIVALS (Newest items showcase) */}
                  {newArrivalsProducts.length > 0 &&
                    !isLoading &&
                    selectedCategory === "Zote" &&
                    search === "" && (
                      <div className="lg:py-6 py-4 bg-transparent relative overflow-hidden flex flex-col border-b border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg md:text-xl font-extrabold text-slate-950 tracking-tight flex items-center gap-1.5 leading-tight">
                              {lang === "sw" ? "Hivi Karibuni" : "New Arrivals"}
                              <span className="text-[10px] font-black uppercase bg-emerald-500 text-white px-2 py-0.5 rounded-full tracking-wider animate-pulse">
                                {lang === "sw" ? "MPYA" : "NEW"}
                              </span>
                            </h3>
                            <p className="text-[10px] md:text-xs text-slate-400 font-medium mt-1">
                              {lang === "sw"
                                ? "Wahi bidhaa mpya kabisa zilizotufikia mapema"
                                : "Stay ahead with the latest offerings"}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400 hover:text-slate-600 cursor-pointer transition">
                            <span className="text-xs font-bold">
                              {lang === "sw" ? "Zote" : "View All"}
                            </span>
                            <ChevronRight size={18} />
                          </div>
                        </div>

                        {/* Slide track */}
                        <div className="flex gap-2.5 md:gap-3 overflow-x-auto pb-4 pt-1 scrollbar-none flex-nowrap -mx-2 px-2 sm:-mx-4 sm:px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
                          {newArrivalsProducts.map((p) => {
                            const pSeller = sellers.find(
                              (s) => s.id === p.sellerId,
                            );
                            return (
                              <div
                                key={`new-${p.id}`}
                                onClick={() => handleProductSelect(p)}
                                className="w-[130px] sm:w-[155px] shrink-0 bg-transparent hover:bg-slate-50 transition cursor-pointer snap-start flex flex-col group justify-between"
                              >
                                <div>
                                  <div className="aspect-square w-full rounded-lg sm:rounded-xl overflow-hidden bg-slate-100 relative mb-2">
                                    <img
                                      src={p.images[0]}
                                      alt={p.name}
                                      className="w-full h-full object-contain p-1 group-hover:scale-[1.03] transition duration-500"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute top-1.5 left-1.5 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded font-bold backdrop-blur-xs leading-none shadow-xs">
                                      {lang === "sw" ? "Mpyaa" : "Fresh In"}
                                    </div>
                                    {pSeller?.isPro && (
                                      <div className="absolute top-1.5 right-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[7px] px-1 py-0.5 rounded shadow-xs font-bold uppercase tracking-widest leading-none">
                                        PRO
                                      </div>
                                    )}
                                  </div>

                                  <h4 className="text-[11px] sm:text-[12px] font-medium text-slate-800 line-clamp-2 leading-[1.3] group-hover:text-[#ff4c00] transition-colors mb-1">
                                    {p.name}
                                  </h4>
                                </div>

                                <div className="mt-1">
                                  <PriceDisplay
                                    amount={p.price}
                                    colorClass="text-[#ff4c00]"
                                    className="text-[13px] sm:text-[14px] mb-1"
                                  />
                                  <p className="text-[9px] text-[#ff4c00] mt-0.5 font-medium leading-none text-left truncate w-full">
                                    {p.category}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* BEHAVIOR MODULE 3: PRO & PREMIUM FEATURED SELLERS (Vendor Prioritization) */}
                  {proSellerProducts.length > 0 &&
                    !isLoading &&
                    selectedCategory === "Zote" &&
                    search === "" && (
                      <div
                        id="pro-sellers-picks-scroller-section"
                        className="lg:py-6 py-4 bg-transparent relative overflow-hidden flex flex-col border-b border-slate-200"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5 leading-tight">
                              {lang === "sw"
                                ? "Wauzaji walio pendekezwa"
                                : "Pro Sellers' Pick"}
                              <span className="text-[9px] font-black uppercase bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                                APPROVED <Store size={8} />
                              </span>
                            </h3>
                            <p className="text-[10px] md:text-xs text-slate-400 font-medium mt-1">
                              {lang === "sw"
                                ? "Bidhaa zilizothibitishwa moja kwa moja kutoka kwa wauzaji wetu bora"
                                : "Premium certified products directly from top-tier wholesale stores"}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400 hover:text-slate-600 cursor-pointer transition">
                            <span className="text-xs font-bold">
                              {lang === "sw" ? "Gundua" : "Explore"}
                            </span>
                            <ChevronRight size={18} />
                          </div>
                        </div>

                        {/* Slide track */}
                        <div className="flex gap-2.5 md:gap-3 overflow-x-auto pb-4 pt-1 scrollbar-none flex-nowrap -mx-2 px-2 sm:-mx-4 sm:px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
                          {proSellerProducts.map((p) => {
                            const pSeller = sellers.find(
                              (s) => s.id === p.sellerId,
                            );
                            return (
                              <div
                                key={`pro-${p.id}`}
                                onClick={() => handleProductSelect(p)}
                                className="w-[130px] sm:w-[155px] shrink-0 bg-transparent hover:bg-slate-50 transition cursor-pointer snap-start flex flex-col group justify-between"
                              >
                                <div>
                                  <div className="aspect-square w-full rounded-lg sm:rounded-xl overflow-hidden bg-slate-100 relative mb-2">
                                    <img
                                      src={p.images[0]}
                                      alt={p.name}
                                      className="w-full h-full object-contain p-1 group-hover:scale-[1.03] transition duration-500"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute top-1.5 left-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                                      {lang === "sw"
                                        ? "DUKA RASMI"
                                        : "PRO STORE"}
                                    </div>
                                  </div>

                                  <h4 className="text-[11px] sm:text-[12px] font-medium text-slate-800 line-clamp-2 leading-[1.3] group-hover:text-[#ff4c00] transition-colors mb-1">
                                    {p.name}
                                  </h4>
                                </div>

                                <div className="mt-1">
                                  <PriceDisplay
                                    amount={p.price}
                                    colorClass="text-[#ff4c00]"
                                    className="text-[13px] sm:text-[14px] mb-1"
                                  />
                                  {pSeller && (
                                    <p className="text-[9px] text-[#ff4c00] mt-0.5 font-medium flex items-center gap-1 w-full truncate">
                                      <Store size={10} className="shrink-0" />{" "}
                                      {pSeller.name}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>

                {/* All Products Header and Filters unified in same row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6 bg-transparent">
                  <div className="shrink-0">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                      Our Collection
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {filteredProducts.length}{" "}
                      {lang === "sw"
                        ? "Bidhaa Zilizopatikana"
                        : "Products Found"}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0 lg:justify-end">
                    {/* Categories list as capsule buttons (Horizontal Scroll) */}
                    <div
                      className="relative flex-1 max-w-full lg:max-w-xl"
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <div className="overflow-x-auto scrollbar-hide py-1">
                        <div className="flex items-center gap-6">
                          {isLoading
                            ? Array.from({ length: 4 }).map((_, i) => (
                                <div
                                  key={i}
                                  className="h-9 w-20 bg-slate-100 animate-pulse rounded-full shrink-0"
                                ></div>
                              ))
                            : categories.map((c: any) => (
                                <button
                                  key={c}
                                  onClick={() => handleCategorySelect(c)}
                                  onMouseEnter={(e) => {
                                    if (window.innerWidth < 720) return;
                                    setHoveredCategory(c);
                                    const rect =
                                      e.currentTarget.getBoundingClientRect();
                                    const parentRect =
                                      e.currentTarget.parentElement?.parentElement?.parentElement?.getBoundingClientRect();
                                    if (parentRect) {
                                      setHoveredCategoryX(
                                        rect.left - parentRect.left,
                                      );
                                    }
                                  }}
                                  className={`py-2 text-[13px] font-bold whitespace-nowrap transition-all border-b-[3px] outline-none cursor-pointer ${
                                    selectedCategory === c
                                      ? "border-slate-900 text-slate-900"
                                      : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                                  }`}
                                >
                                  {c}
                                </button>
                              ))}

                          {/* Dedicated visual separator & Special Merchant Filters, keeping them distinct from standard product categories */}
                          {!viewSeller &&
                            selectedNiche === "Zote" &&
                            dynamicSellerCategories.length > 0 && (
                              <>
                                <div className="h-5 w-px bg-slate-200 shrink-0 self-center mx-1"></div>
                                {dynamicSellerCategories.map((sc) => {
                                  const isSelected = selectedCategory === sc;
                                  return (
                                    <button
                                      key={sc}
                                      onClick={() => handleCategorySelect(sc)}
                                      className={`py-1 px-3.5 rounded-full text-xs font-bold whitespace-nowrap transition-all outline-none cursor-pointer flex items-center gap-1.5 shrink-0 border duration-200 ${
                                        isSelected
                                          ? sc === "Pro Sellers"
                                            ? "bg-amber-100 text-amber-800 border-amber-300 shadow-sm font-black"
                                            : "bg-indigo-100 text-indigo-800 border-indigo-300 shadow-sm font-black"
                                          : sc === "Pro Sellers"
                                            ? "bg-amber-50/50 text-amber-700 hover:bg-amber-100/50 border-amber-200"
                                            : "bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100/50 border-indigo-200"
                                      }`}
                                    >
                                      {sc === "Pro Sellers" ? (
                                        <>
                                          <Sparkles
                                            size={11}
                                            className={`${isSelected ? "text-amber-600 fill-amber-350 animate-bounce" : "text-amber-500"} shrink-0`}
                                          />
                                          <span>
                                            {lang === "sw"
                                              ? "Wauzaji wa Pro"
                                              : "Pro Sellers"}
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <Briefcase
                                            size={11}
                                            className={`${isSelected ? "text-indigo-600" : "text-indigo-500"} shrink-0`}
                                          />
                                          <span>
                                            {lang === "sw"
                                              ? "Kununua Juu/Jumla"
                                              : "Wholesale Store"}
                                          </span>
                                        </>
                                      )}
                                    </button>
                                  );
                                })}
                              </>
                            )}
                        </div>
                      </div>

                      {/* Hover Mega Menu for Category Products */}
                      {hoveredCategory && megaMenuProducts.length > 0 && (
                        <div
                          className="absolute top-full bg-white shadow-lg z-[100] p-4 md:p-6 border border-slate-100 rounded-xl mt-1 w-[290px] sm:w-[480px] transition-all duration-150"
                          style={{
                            left:
                              hoveredCategoryX !== null
                                ? `${Math.max(12, Math.min(hoveredCategoryX, window.innerWidth - 500))}px`
                                : "auto",
                            right: hoveredCategoryX !== null ? "auto" : "0px",
                          }}
                        >
                          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-4">
                            <Star
                              size={16}
                              className="text-[#ff4c00] fill-[#ff4c00]"
                            />
                            {lang === "sw"
                              ? "Bidhaa Bora za"
                              : "Top Pro Products in: "}
                            <span className="text-[#ff4c00] ml-1">
                              {hoveredCategory}
                            </span>
                          </h3>
                          <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar w-full">
                            {megaMenuProducts.slice(0, 4).map((p) => (
                              <button
                                key={p.id}
                                onClick={() => {
                                  setSelectedProduct(p);
                                  setSelectedCategory(p.category);
                                  setHoveredCategory(null);
                                }}
                                className="flex-none w-[120px] md:w-[130px] flex flex-col text-left group bg-transparent rounded-lg p-1 hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                <div className="w-full aspect-[4/3] rounded-lg bg-slate-100 overflow-hidden mb-2">
                                  {p.images && p.images[0] ? (
                                    <img
                                      src={p.images[0]}
                                      className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-500"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                      <ShoppingBag />
                                    </div>
                                  )}
                                </div>
                                <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-amber-600 transition-colors">
                                  {p.name}
                                </h4>
                                <div className="mt-2 font-black text-slate-900 text-xs">
                                  <PriceDisplay
                                    amount={p.price}
                                    className="text-xs"
                                  />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sorting Selection Dropdown with Custom Personalized Indicator */}
                    <div className="flex items-center gap-2 shrink-0 bg-transparent transition-all self-start sm:self-auto min-w-[170px] z-20">
                      {likedProductIds.length > 0 &&
                        sortOrder === "default" && (
                          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 border border-rose-100 text-[10px] font-black text-rose-600 animate-pulse shrink-0 shadow-xs">
                            <Heart
                              size={11}
                              fill="currentColor"
                              className="text-rose-500"
                            />
                            <span>
                              {lang === "sw"
                                ? `${likedProductIds.length} Pendwa Zimepewa Kipaumbele!`
                                : `Favorites Highlighted (${likedProductIds.length})`}
                            </span>
                          </div>
                        )}

                      <CustomSelect
                        value={sortOrder}
                        onChange={(v) => setSortOrder(v as any)}
                        iconLabel={
                          <ArrowUpDown size={13} className="text-slate-500" />
                        }
                        label={
                          lang === "sw"
                            ? "Upangaji wa Bidhaa"
                            : "Sort Preferences"
                        }
                        options={[
                          { id: "default", label: t(lang, "filter.default") },
                          { id: "asc", label: t(lang, "filter.asc") },
                          { id: "desc", label: t(lang, "filter.desc") },
                          { id: "newest", label: t(lang, "filter.newest") },
                          { id: "popular", label: t(lang, "filter.popular") },
                        ]}
                      />
                    </div>
                  </div>
                </div>

                {/* Active Filters Ribbon */}
                {(() => {
                  const hasActiveFilters = !!(
                    (committedSearch && committedSearch.trim().length > 0) ||
                    selectedCategory !== "Zote" ||
                    selectedNiche !== "Zote" ||
                    selectedArrangementTier !== "all" ||
                    selectedArrangementVibe !== "all" ||
                    selectedArrangementWrap !== "all"
                  );
                  if (!hasActiveFilters) return null;
                  return (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50 border border-slate-200/65 rounded-2xl p-4 mb-6 shadow-xs animate-in fade-in duration-200">
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-500 uppercase tracking-widest shrink-0">
                        <Sparkles
                          size={14}
                          className="text-[#ff4c00] animate-pulse"
                        />
                        <span>
                          {lang === "sw"
                            ? "Vichujio Amilifu:"
                            : "Active Filters:"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center flex-1">
                        {committedSearch && (
                          <span className="bg-white border border-slate-200 px-3 py-1 rounded-xl text-xs font-black text-slate-800 flex items-center gap-1.5 shadow-xs">
                            <span>"{committedSearch}"</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSearch("");
                                setCommittedSearch("");
                              }}
                              className="text-slate-400 hover:text-red-500 transition cursor-pointer p-0.5"
                            >
                              <X size={12} strokeWidth={2.5} />
                            </button>
                          </span>
                        )}
                        {selectedCategory !== "Zote" && (
                          <span className="bg-white border border-slate-200 px-3 py-1 rounded-xl text-xs font-black text-slate-800 flex items-center gap-1.5 shadow-xs">
                            <span>{selectedCategory}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedCategory("Zote")}
                              className="text-slate-400 hover:text-red-500 transition cursor-pointer p-0.5"
                            >
                              <X size={12} strokeWidth={2.5} />
                            </button>
                          </span>
                        )}
                        {selectedNiche !== "Zote" && (
                          <span className="bg-white border border-slate-200 px-3 py-1 rounded-xl text-xs font-black text-slate-800 flex items-center gap-1.5 shadow-xs">
                            <span>{selectedNiche}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedNiche("Zote")}
                              className="text-slate-400 hover:text-red-500 transition cursor-pointer p-0.5"
                            >
                              <X size={12} strokeWidth={2.5} />
                            </button>
                          </span>
                        )}
                        {selectedArrangementTier !== "all" && (
                          <span className="bg-white border border-slate-200 px-3 py-1 rounded-xl text-xs font-black text-slate-800 flex items-center gap-1.5 shadow-xs">
                            <span>
                              {selectedArrangementTier === "luxury"
                                ? lang === "sw"
                                  ? "Luxury"
                                  : "Luxury"
                                : selectedArrangementTier === "premium"
                                  ? lang === "sw"
                                    ? "Premium"
                                    : "Premium"
                                  : lang === "sw"
                                    ? "Budget"
                                    : "Standard"}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedArrangementTier("all")}
                              className="text-slate-400 hover:text-red-500 transition cursor-pointer p-0.5"
                            >
                              <X size={12} strokeWidth={2.5} />
                            </button>
                          </span>
                        )}
                        {selectedArrangementVibe !== "all" && (
                          <span className="bg-white border border-slate-200 px-3 py-1 rounded-xl text-xs font-black text-slate-800 flex items-center gap-1.5 shadow-xs">
                            <span>{selectedArrangementVibe.toUpperCase()}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedArrangementVibe("all")}
                              className="text-slate-400 hover:text-red-500 transition cursor-pointer p-0.5"
                            >
                              <X size={12} strokeWidth={2.5} />
                            </button>
                          </span>
                        )}
                        {selectedArrangementWrap !== "all" && (
                          <span className="bg-white border border-slate-200 px-3 py-1 rounded-xl text-xs font-black text-slate-800 flex items-center gap-1.5 shadow-xs">
                            <span>{selectedArrangementWrap.toUpperCase()}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedArrangementWrap("all")}
                              className="text-slate-400 hover:text-red-500 transition cursor-pointer p-0.5"
                            >
                              <X size={12} strokeWidth={2.5} />
                            </button>
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setCommittedSearch("");
                          setSelectedCategory("Zote");
                          setSelectedNiche("Zote");
                          setSelectedArrangementTier("all");
                          setSelectedArrangementVibe("all");
                          setSelectedArrangementWrap("all");
                        }}
                        className="text-xs font-black text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 px-4 py-2 rounded-xl transition duration-150 cursor-pointer flex items-center gap-1.5 self-end sm:self-auto shrink-0 shadow-xs"
                      >
                        <Trash size={14} />
                        <span>
                          {lang === "sw" ? "Futa Vyote" : "Clear All"}
                        </span>
                      </button>
                    </div>
                  );
                })()}

                {/* Main Grid */}
                <div className="">
                  {isLoading ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(175px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-1.5 py-1 sm:gap-2">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <ProductSkeleton key={i} />
                      ))}
                    </div>
                  ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(175px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-1.5 py-1 sm:gap-2">
                      <AnimatePresence mode="popLayout">
                        {filteredProducts.flatMap((p, idx) => {
                          const pSeller = sellers.find(
                            (s) => s.id === p.sellerId,
                          );

                          const cards = [
                            <motion.div
                              key={p.id}
                              layout
                              initial={{ opacity: 0, scale: 0.95, y: 15 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                              <ProductCard
                                p={p}
                                seller={pSeller}
                                onAdd={(openCart) => addToCart(p, openCart)}
                                onSelect={() => handleProductSelect(p)}
                                onInteract={() => trackProductInteraction(p)}
                                onViewSeller={(s) => {
                                  setViewSeller(s);
                                  setSelectedNiche("Zote");
                                  setSelectedCategory("Zote");
                                  setSearch("");
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                lang={lang}
                                reviews={allReviews[p.id] || []}
                                isLiked={likedProductIds.includes(p.id)}
                                onLikeToggle={toggleLikeProduct}
                              />
                            </motion.div>,
                          ];

                          if (
                            idx === adPlacementIndex &&
                            sortedAdsList.length > 0
                          ) {
                            cards.push(
                              <motion.div
                                key="orbi-embedded-carousel-ads"
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="col-span-full py-2 my-1"
                                id="orbi-unified-carousel-scroller-section"
                              >
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none flex-nowrap scroll-smooth pt-1 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                                  {sortedAdsList.map((ad) => (
                                    <div
                                      key={ad.id}
                                      id={`orbi-ad-card-${ad.id}`}
                                      onClick={ad.action}
                                      className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden hover:border-emerald-500/80 hover:shadow-md cursor-pointer transition-all duration-300 group flex flex-row w-[290px] sm:w-[340px] shrink-0 snap-start h-28"
                                    >
                                      {/* Left Ad image creative */}
                                      <div className="w-[100px] sm:w-[120px] h-full shrink-0 relative overflow-hidden bg-slate-100">
                                        <img
                                          src={ad.image}
                                          alt={ad.title}
                                          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                                          referrerPolicy="no-referrer"
                                        />
                                        <div className="absolute top-2 left-2 bg-slate-900/60 text-white text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                                          {ad.badge}
                                        </div>
                                      </div>

                                      {/* Right details copy text */}
                                      <div className="p-3.5 flex-1 flex flex-col justify-between min-w-0">
                                        <div className="space-y-0.5">
                                          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest truncate leading-tight">
                                            {ad.businessName}
                                          </p>
                                          <h4 className="text-[11px] font-black text-slate-900 group-hover:text-emerald-600 leading-snug line-clamp-2 transition-colors whitespace-normal">
                                            {ad.title}
                                          </h4>
                                        </div>

                                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1">
                                          <span>
                                            {lang === "sw"
                                              ? "Gundua"
                                              : "Discover"}
                                          </span>
                                          <ChevronRight
                                            size={12}
                                            className="transition-transform group-hover:translate-x-0.5"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>,
                            );
                          }

                          return cards;
                        })}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {similarSuggestions.length > 0 ? (
                        <div className="space-y-6">
                          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-sm">
                            <div className="bg-white p-4 rounded-full shadow-sm text-amber-500 shrink-0">
                              <Sparkles
                                size={28}
                                className="animate-pulse text-amber-500"
                              />
                            </div>
                            <div className="text-center sm:text-left">
                              <h4
                                id="orbi-similar-matches-heading"
                                className="text-lg font-black text-slate-900 mb-1"
                              >
                                {lang === "sw"
                                  ? `Hakuna bidhaa iliyopatikana kwa "${debouncedSearch}"`
                                  : `No items found matching "${debouncedSearch}"`}
                              </h4>
                              <p className="text-sm font-medium text-slate-600">
                                {lang === "sw"
                                  ? "Lakini tusingependa uondoke mikono mitupu! Hapa tunapendekeza bidhaa zinazofanana na utafutaji wako:"
                                  : "But we wouldn't want you to leave empty-handed! Here are some similar products we think you'll love:"}
                              </p>
                            </div>
                          </div>

                          {/* Similar Products Grid */}
                          <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(175px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-1.5 py-1 sm:gap-2">
                            <AnimatePresence mode="popLayout">
                              {similarSuggestions.map((p) => {
                                const pSeller = sellers.find(
                                  (s) => s.id === p.sellerId,
                                );
                                return (
                                  <motion.div
                                    key={`similar-${p.id}`}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                  >
                                    <ProductCard
                                      p={p}
                                      seller={pSeller}
                                      onAdd={(openCart) => addToCart(p, openCart)}
                                      onSelect={() => handleProductSelect(p)}
                                      onInteract={() => trackProductInteraction(p)}
                                      onViewSeller={(s) => {
                                        setViewSeller(s);
                                        setSelectedNiche("Zote");
                                        setSelectedCategory("Zote");
                                        setSearch("");
                                        window.scrollTo({
                                          top: 0,
                                          behavior: "smooth",
                                        });
                                      }}
                                      lang={lang}
                                      reviews={allReviews[p.id] || []}
                                      isLiked={likedProductIds.includes(p.id)}
                                      onLikeToggle={toggleLikeProduct}
                                    />
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed border-slate-300">
                          <div className="bg-slate-50 p-6 rounded-full mb-6 text-slate-300">
                            <ShoppingCart size={64} />
                          </div>
                          <h4 className="text-xl font-bold text-slate-700 mb-2">
                            Shopping Center
                          </h4>
                          <p className="text-slate-500 font-medium max-w-sm text-center">
                            {t(lang, "prod.none")}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div
              id="support-contact"
              className="w-full px-4 sm:px-6 lg:px-8 mt-12 mb-8"
            >
              <ContactSection lang={lang} user={activeUser} />
            </div>
          </main>
        )}

        {/* Footer */}
        <footer className="bg-slate-950 text-slate-400 py-6 md:py-8 text-sm text-center md:text-left relative mt-auto">
          <div className="w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center md:items-start text-center md:text-left sm:col-span-2 pr-0 md:pr-12">
              <div className="flex items-center whitespace-nowrap gap-1.5 mb-2 md:mb-4">
                <img
                  src="https://media-stock.orbifinancial.com/OrbiShop_Logo_Blue.png"
                  alt="Orbi"
                  className="h-16 md:h-20 object-contain brightness-0 invert opacity-90"
                />
              </div>
              <p className="mb-2 md:mb-3 uppercase tracking-[0.2em] font-bold text-[10px] text-accent/80">
                {t(lang, "hero.subtitle")}
              </p>
              <p className="text-slate-500 leading-relaxed font-medium max-w-sm md:max-w-md text-xs mb-4">
                {t(lang, "footer.desc")}
              </p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const input = form.elements.namedItem(
                    "email",
                  ) as HTMLInputElement;
                  if (input && input.value) {
                    try {
                      await db.subscribeNewsletter(input.value);
                      alert(
                        lang === "sw"
                          ? "Asante kwa kujiunga! Tutaleta taarifa mpya."
                          : "Subscribed successfully! We will keep you updated.",
                      );
                      input.value = "";
                    } catch (err: any) {
                      alert(
                        lang === "sw"
                          ? "Kuna tatizo au umeshajiunga tayari."
                          : "Error or already subscribed.",
                      );
                    }
                  }
                }}
                className="flex w-full max-w-xs items-center relative"
              >
                <input
                  type="email"
                  name="email"
                  required
                  placeholder={
                    lang === "sw" ? "Weka email yako..." : "Enter your email..."
                  }
                  className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-slate-600 focus:bg-slate-800 transition"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 bg-slate-800 hover:bg-slate-700 text-white px-3 rounded-lg text-xs font-bold transition"
                >
                  {lang === "sw" ? "Jiunge" : "Join"}
                </button>
              </form>
            </div>
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-2 md:mb-3">
                {t(lang, "footer.contact")}
              </h4>
              <ul className="space-y-1.5 md:space-y-2 font-medium flex flex-col items-center sm:items-start text-xs md:text-sm">
                <li>
                  <a
                    href="tel:+255764258114"
                    className="flex items-center gap-2 md:gap-3 hover:text-white hover:translate-x-1 transition-transform"
                  >
                    <div className="p-1 bg-slate-900 rounded-lg text-slate-400">
                      <Phone size={12} />
                    </div>{" "}
                    +255 764 258 114
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:shop@orbifinancial.com"
                    className="flex items-center gap-2 md:gap-3 hover:text-white hover:translate-x-1 transition-transform"
                  >
                    <div className="p-1 bg-slate-900 rounded-lg text-slate-400">
                      <Mail size={12} />
                    </div>{" "}
                    shop@orbifinancial.com
                  </a>
                </li>
                <li>
                  <a
                    href="https://shop.orbifinancial.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 md:gap-3 hover:text-white hover:translate-x-1 transition-transform"
                  >
                    <div className="p-1 bg-slate-900 rounded-lg text-slate-400">
                      <Globe size={12} />
                    </div>{" "}
                    shop.orbifinancial.com
                  </a>
                </li>
              </ul>
            </div>
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-2 md:mb-3">
                {t(lang, "footer.location")}
              </h4>
              <div className="font-medium leading-relaxed flex flex-row items-center sm:items-start gap-3 md:gap-2 text-xs md:text-sm text-left mb-6">
                <div className="p-1 bg-slate-900 rounded-lg text-slate-400 shrink-0">
                  <MapPin size={14} />
                </div>
                <span className="text-slate-400 sm:max-w-[200px]">
                  Kariakoo Alikoma na Magira Street
                  <br />
                  Dar es Salaam, Tanzania
                </span>
              </div>

              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-2 md:mb-3">
                Orbi Platform
              </h4>
              <div className="flex flex-col items-center sm:items-start gap-3">
                <button
                  onClick={() => setShowAuth("register")}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2"
                >
                  <ShieldCheck size={14} /> Apply as Seller
                </button>
              </div>
            </div>
          </div>

          <div className="w-full px-4 sm:px-6 lg:px-8 mt-6">
            <div className="flex flex-wrap justify-center sm:justify-center items-center gap-x-4 gap-y-2 text-[11px] font-medium text-slate-500 max-w-5xl mx-auto">
              <button
                onClick={() => {
                  setAboutPageTab("about");
                  setShowAboutPage(true);
                }}
                className="hover:text-amber-500 transition whitespace-nowrap"
              >
                {lang === "sw" ? "Kuhusu Sisi" : "About Us"}
              </button>
              <button
                onClick={() => {
                  setAboutPageTab("how");
                  setShowAboutPage(true);
                }}
                className="hover:text-amber-500 transition whitespace-nowrap"
              >
                {lang === "sw" ? "Jinsi Inavyofanya Kazi" : "How It Works"}
              </button>
              <button
                onClick={() => {
                  setAboutPageTab("security");
                  setShowAboutPage(true);
                }}
                className="hover:text-amber-500 transition whitespace-nowrap"
              >
                {lang === "sw" ? "Kituo cha Usalama" : "Security Center"}
              </button>
              <button
                onClick={() => {
                  setAboutPageTab("buyer");
                  setShowAboutPage(true);
                }}
                className="hover:text-amber-500 transition whitespace-nowrap"
              >
                {lang === "sw" ? "Ulinzi wa Mnunuzi" : "Buyer Protection"}
              </button>
              <button
                onClick={() => {
                  setAboutPageTab("seller");
                  setShowAboutPage(true);
                }}
                className="hover:text-amber-500 transition whitespace-nowrap"
              >
                {lang === "sw" ? "Ulinzi wa Muuzaji" : "Seller Protection"}
              </button>
              <button
                onClick={() => {
                  setAboutPageTab("terms");
                  setShowAboutPage(true);
                }}
                className="hover:text-amber-500 transition whitespace-nowrap"
              >
                {lang === "sw" ? "Vigezo na Masharti" : "Terms & Conditions"}
              </button>
              <button
                onClick={() => {
                  setAboutPageTab("escrow");
                  setShowAboutPage(true);
                }}
                className="hover:text-amber-500 transition whitespace-nowrap"
              >
                {lang === "sw" ? "Sera ya Malipo & Escrow" : "Payment & Escrow"}
              </button>
              <button
                onClick={() => {
                  setAboutPageTab("privacy");
                  setShowAboutPage(true);
                }}
                className="hover:text-amber-500 transition whitespace-nowrap"
              >
                {lang === "sw" ? "Sera ya Faragha" : "Privacy Policy"}
              </button>
              <button
                onClick={() => {
                  setAboutPageTab("contact");
                  setShowAboutPage(true);
                }}
                className="hover:text-amber-500 transition whitespace-nowrap"
              >
                {lang === "sw" ? "Wasiliana Nasi" : "Contact Us"}
              </button>
            </div>
          </div>

          <div className="w-full px-4 sm:px-6 lg:px-8 mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-900 text-center flex flex-col sm:flex-row justify-between items-center gap-2 md:gap-4 text-xs text-slate-600">
            <div>
              &copy; {new Date().getFullYear()} {t(lang, "footer.rights")}
            </div>
            <div className="flex items-center gap-0 text-xs text-slate-500 font-medium">
              <span>Powered by</span>
              <img
                src="https://media-stock.orbifinancial.com/ORBI_LOGO_Blue.png"
                alt="ORBI Financial Technologies"
                title="ORBI Financial Technologies"
                className="h-10 w-auto object-contain ml-[-2px] opacity-70 brightness-0 invert"
              />
            </div>
            <div
              className="flex items-center justify-center opacity-30 hover:opacity-100 transition duration-500"
              title="100% Genuine & Trusted"
            >
              <ShieldCheck size={20} className="text-white" strokeWidth={1.5} />
            </div>
            <div className="flex gap-4">
              <a
                href="/?admin=true"
                className="hover:text-white font-bold transition flex items-center gap-2 outline-none"
              >
                <Store size={12} /> Admin
              </a>
            </div>
          </div>
        </footer>

        {false && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[200] flex justify-end">
            <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-350 select-none">
              {/* Drawer Header */}
              <div
                className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-orange-600 to-amber-555 text-white sticky top-0 z-10"
                style={{ backgroundColor: "#ea580c" }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl relative">
                    <Bot size={22} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5 leading-none mb-1">
                      Orbi AI Assistant
                    </h2>
                    <p className="text-[10px] text-orange-200/90 font-bold uppercase tracking-wider">
                      {lang === "sw"
                        ? "Msaidizi wa Duka"
                        : "Intelligent Shopping Bot"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const userId = activeUser
                        ? activeUser.id
                        : getInitialUserId();
                      setAIChatHistory([]);
                      localStorage.setItem(
                        `orbi_ai_chat_history_${userId}`,
                        "[]",
                      );
                      setIsTransferredToLive(false);
                      localStorage.setItem(
                        `orbi_ai_transferred_${userId}`,
                        "false",
                      );
                      localStorage.removeItem(`orbi_ai_lock_until_${userId}`);
                    }}
                    className="text-[10px] hover:bg-white/10 px-2 py-1 rounded transition border border-white/20 font-bold"
                    title={lang === "sw" ? "Futa Historia" : "Clear History"}
                  >
                    {lang === "sw" ? "Futa" : "Clear"}
                  </button>
                  <button
                    onClick={() => setShowAIChatDrawer(false)}
                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-5 bg-slate-50/70 space-y-4 flex flex-col [background-image:radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:20px_20px]">
                {aiChatHistory.length === 0 ? (
                  <div className="text-center py-10 my-auto">
                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-100 shadow-xs text-orange-500">
                      <Bot size={34} className="animate-bounce" />
                    </div>
                    <h3 className="font-black text-slate-800 text-base mb-1">
                      {lang === "sw"
                        ? "Hujambo! Mimi ni Msaidizi wa Orbi Shop"
                        : "Hello! I am your AI Shopping Assistant"}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6 leading-relaxed">
                      {lang === "sw"
                        ? "Uliza swali lolote kuhusu bidhaa, bei, kuponi zilizopo au msaada wa usafirishaji kwa Kiswahili na Kiingereza."
                        : "Ask me anything about products, prices, active discounts, or courier estimates. I support Swahili and English."}
                    </p>

                    {/* Starter Prompts */}
                    <div className="space-y-2 max-w-xs mx-auto">
                      {[
                        {
                          textSw: "Nisaidie kuona bidhaa zilizopo dukani",
                          textEn: "Help me find currently available products",
                        },
                        {
                          textSw: "Nawezaje kulipia mzigo kwa kutumia M-Pesa?",
                          textEn: "How do I make payment using Mobile Money?",
                        },
                        {
                          textSw: "Nionyeshe njia za usafirishaji na gharama",
                          textEn: "Show me carrier pickup stations and costs",
                        },
                      ].map((item, keyIdx) => {
                        const promptText =
                          lang === "sw" ? item.textSw : item.textEn;
                        return (
                          <button
                            key={keyIdx}
                            onClick={() => sendAIChatMessage(promptText)}
                            className="w-full p-2.5 text-left text-xs bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-900 rounded-xl border border-slate-200/70 hover:border-orange-200 shadow-2xs font-medium transition duration-200 block cursor-pointer"
                          >
                            ⭐ {promptText}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {aiChatHistory.map((chat, idx) => {
                      const isUser = chat.role === "user";
                      return (
                        <div
                          key={idx}
                          className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`p-3 rounded-2xl max-w-[85%] text-xs shadow-xs leading-relaxed ${
                              isUser
                                ? "bg-orange-500 text-white rounded-br-none font-bold"
                                : "bg-white text-slate-800 border border-slate-150 rounded-bl-none"
                            }`}
                          >
                            {chat.image && (
                              <div className="mb-2 max-w-full overflow-hidden rounded-lg border border-slate-200/50">
                                <img
                                  src={chat.image.data}
                                  alt="Uploaded graphic context"
                                  className="object-cover max-h-40 w-full rounded"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}
                            <div className="whitespace-pre-line">
                              {chat.text}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {isAILoading && (
                      <div className="flex justify-start">
                        <div className="p-3 bg-white border border-slate-150 rounded-2xl rounded-bl-none text-slate-400 text-xs flex items-center gap-1.5 shadow-2xs">
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-orange-450 animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0 z-10 flex flex-col gap-2">
                {/* Image selection preview */}
                {aiSelectedImage && (
                  <div className="p-2 bg-orange-50/50 rounded-lg border border-orange-100 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="flex items-center gap-2">
                      <img
                        src={aiSelectedImage.data}
                        alt="Selected Preview"
                        className="w-10 h-10 object-cover rounded-lg border border-orange-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-[10px] leading-tight">
                        <span className="font-extrabold text-slate-700 block truncate max-w-[180px]">
                          {aiSelectedImage.filename}
                        </span>
                        <span className="text-orange-600 font-bold block">
                          {lang === "sw" ? "Tayari kutumwa" : "Ready to upload"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAiSelectedImage(null)}
                      className="p-1 hover:bg-orange-100 text-orange-600 rounded-full transition-colors"
                      title={lang === "sw" ? "Ondoa picha" : "Remove image"}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {isTransferredToLive ? (
                  <div className="space-y-3 p-3.5 bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl border border-amber-200 animate-pulse-slow">
                    <div className="flex gap-2 items-start">
                      <span className="text-base">📢</span>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">
                          {lang === "sw"
                            ? "Uhamishaji wa Live Agent"
                            : "Live Agent Support Activated"}
                        </h4>
                        <p className="text-[10px] text-slate-600 font-bold leading-relaxed mt-0.5">
                          {lang === "sw"
                            ? "Umezidi kikomo cha maswali 10 ya AI. Timu yetu imeshapokea mazungumzo yako na ipo tayari kukusaidia!"
                            : "You have exceeded 10 AI questions. Our staff is prepared and has received your transcripts!"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAIChatDrawer(false);
                        const el = document.getElementById("support-contact");
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth" });
                          showAlert(
                            lang === "sw"
                              ? "Tumekuhamisha! Andika ujumbe wako hapa chini na live agent atakujibu."
                              : "Transferred successfully! Please type your support query below and an agent will assist.",
                            "success",
                          );
                        }
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-650 hover:to-amber-650 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <span>💬</span>
                      <span>
                        {lang === "sw"
                          ? "Zungumza na Staff Agent Sasa"
                          : "Chat with Live Agent Now"}
                      </span>
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendAIChatMessage(aiInputMessage);
                    }}
                    className="flex gap-2 items-center"
                  >
                    <label
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 hover:text-orange-600 rounded-xl transition duration-200 cursor-pointer flex items-center justify-center text-slate-500 shrink-0 border border-slate-200/50"
                      title={lang === "sw" ? "Pakia Picha" : "Upload Image"}
                    >
                      <ImageIcon size={18} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAIImageChange}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      required={!aiSelectedImage}
                      value={aiInputMessage}
                      onChange={(e) => setAIInputMessage(e.target.value)}
                      placeholder={
                        aiSelectedImage
                          ? lang === "sw"
                            ? "Andika maelezo ya picha..."
                            : "Add details to image..."
                          : lang === "sw"
                            ? "Andika ujumbe wako..."
                            : "Type your message..."
                      }
                      className="flex-1 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all font-medium bg-slate-50/50"
                    />
                    <button
                      type="submit"
                      disabled={
                        isAILoading ||
                        (!aiInputMessage.trim() && !aiSelectedImage)
                      }
                      className="px-4 py-2.5 bg-orange-500 hover:bg-orange-650 disabled:opacity-50 text-white rounded-xl text-xs font-black shrink-0 transition-colors cursor-pointer"
                    >
                      {lang === "sw" ? "Tuma" : "Send"}
                    </button>
                  </form>
                )}

                <div className="flex justify-between items-center text-[10px] text-slate-455 font-semibold px-1 mt-1">
                  <span>
                    {lang === "sw"
                      ? "Msaidizi wa Orbi (Orbi Assistant AI)"
                      : "Orbi Assistant (AI & Vision Matcher)"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold border ${imageUploadCount >= 3 ? "bg-red-50 text-red-600 border-red-100" : "bg-slate-50 text-slate-600 border-slate-200/60"}`}
                  >
                    {lang === "sw"
                      ? `Utafutaji picha uliobaki: ${Math.max(0, 3 - imageUploadCount)}/3`
                      : `Visual searches left: ${Math.max(0, 3 - imageUploadCount)}/3`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Support Chat (Internal) */}
        <button
          onClick={handleOpenInternalChat}
          className="fixed bottom-6 right-6 w-14 h-14 bg-success text-white rounded-full shadow-[0_8px_30px_rgba(16,185,129,0.4)] hover:scale-110 hover:-translate-y-1 transition-all duration-300 z-55 flex items-center justify-center group"
          title={
            lang === "sw" ? "Msaada wa Moja kwa Moja" : "Live Chat Support"
          }
        >
          <div className="relative flex items-center justify-center">
            <MessageSquare size={26} className="group-hover:animate-pulse" />
            {unreadCount > 0 && (
              <span className="absolute -top-3.5 -right-3.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-white shadow-lg animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
        </button>

        {/* Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex justify-end">
            <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <h2 className="font-bold text-xl flex items-center gap-3 text-slate-800">
                  <ShoppingCart size={22} className="text-primary" />{" "}
                  {t(lang, "cart.title")} (
                  {cart.reduce((a, c) => a + c.quantity, 0)})
                </h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                {cart.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
                  >
                    <div className="w-20 h-20 bg-slate-50 rounded-xl flex-shrink-0 border border-slate-100 overflow-hidden">
                      {item.product.images[0] && (
                        <MediaRenderer
                          src={item.product.images[0]}
                          className="w-full h-full object-cover rounded-xl"
                          autoPlay
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <h4 className="font-bold text-sm line-clamp-2 text-slate-800">
                        {item.product.name}
                      </h4>
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        <PriceDisplay
                          amount={getProductPriceForQty(
                            item.product,
                            item.quantity,
                          )}
                          colorClass="text-accent"
                          className="text-sm font-black"
                        />
                        {getProductPriceForQty(item.product, item.quantity) <
                          item.product.price && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-150 text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm shrink-0">
                            {lang === "sw" ? "Jumla" : "Wholesale"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-3">
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-white hover:shadow-sm rounded transition disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="text-xs font-bold w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-white hover:shadow-sm rounded transition disabled:opacity-50"
                            disabled={item.quantity >= item.product.stock}
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() =>
                            setCart(
                              cart.filter(
                                (c) => c.product.id !== item.product.id,
                              ),
                            )
                          }
                          className="text-red-500/70 hover:text-red-600 text-xs flex items-center gap-1 font-medium transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                        >
                          <Trash size={14} /> {t(lang, "cart.remove")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {cart.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center pb-20">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                      <ShoppingCart size={40} className="text-slate-300" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-700 mb-2">
                      {t(lang, "cart.empty_title")}
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {t(lang, "cart.empty_desc")}
                    </p>
                    <button
                      onClick={() => setShowCart(false)}
                      className="mt-8 bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-slate-800 transition"
                    >
                      {t(lang, "cart.continue")}
                    </button>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-slate-100 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                  <div className="flex justify-between items-center mb-1 text-sm text-slate-500 font-medium">
                    <span>{t(lang, "cart.items")}</span>
                    <span>{cart.reduce((a, c) => a + c.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-6 text-xl font-black">
                    <span className="text-slate-800">
                      {t(lang, "cart.total")}
                    </span>
                    <span className="text-primary">
                      <PriceDisplay
                        amount={totalCart}
                        colorClass="text-primary"
                        size="2xl"
                      />
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (!activeUser) {
                        setShowCart(false);
                        setShowSecureOrderAuthPrompt(true);
                      } else {
                        setShowCart(false);
                        setShowCheckout(true);
                      }
                    }}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-slate-800 shadow-[0_8px_30px_rgb(30,41,59,0.2)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-lg cursor-pointer"
                  >
                    <Check size={20} /> {t(lang, "cart.checkout")}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Checkout Modal */}
        {showCheckout && (
          <CheckoutModal
            lang={lang}
            cart={cart}
            total={totalCart}
            user={activeUser}
            onOpenAbout={(tab: string) => {
              setAboutPageTab(tab);
              setShowAboutPage(true);
            }}
            onClose={() => setShowCheckout(false)}
            onSuccess={() => {
              setCart([]);
              db.getProducts().then((ps) =>
                setProducts(ps.filter((p) => p.visible !== false)),
              );
            }}
            availableCoupons={coupons}
            onRefresh={() => loadData(true)}
          />
        )}

        {/* Secure Order Auth Prompt Modal */}
        {showSecureOrderAuthPrompt && (
          <div className="fixed inset-0 bg-slate-950/60 z-[999999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white relative max-w-md w-full rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
              {/* Close Button */}
              <button
                onClick={() => setShowSecureOrderAuthPrompt(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Icon Container */}
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-[#ff4c00] mb-5 relative">
                <div className="absolute inset-0 rounded-full bg-orange-500/10 animate-ping duration-1000" />
                <ShieldCheck size={32} />
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">
                {lang === "sw" ? "Unda Agizo Salama" : "Place Secure Order"}
              </h3>

              {/* Description */}
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {lang === "sw"
                  ? "Tafadhali ingia kwenye akaunti yako au ujisajili ili kufanya agizo salama. Kwa kujiunga na sisi, utaweza kufuatilia na kupata taarifa za order yako."
                  : "Please login or register to place a secure order. By joining us, you will be able to track and get updates on your order."}
              </p>

              {/* Buttons Stack */}
              <div className="w-full flex flex-col gap-3">
                {/* Login Button */}
                <button
                  onClick={() => {
                    setShowSecureOrderAuthPrompt(false);
                    setShowAuth("login");
                  }}
                  className="w-full h-12 bg-[#ff4c00] hover:bg-[#e04300] text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
                >
                  <User size={18} />
                  <span>
                    {lang === "sw"
                      ? "Ingia kwenye Akaunti"
                      : "Login to Account"}
                  </span>
                </button>

                {/* Register Button */}
                <button
                  onClick={() => {
                    setShowSecureOrderAuthPrompt(false);
                    setShowAuth("register");
                  }}
                  className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-850 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>
                    {lang === "sw"
                      ? "Unda Akaunti Mpya (Jisajili)"
                      : "Register New Account"}
                  </span>
                </button>

                {/* Cancel Link */}
                <button
                  onClick={() => setShowSecureOrderAuthPrompt(false)}
                  className="mt-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {lang === "sw"
                    ? "Ghairi na uendelee"
                    : "Cancel & back to shop"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Auth Modals */}
        {showApplySellerModal && (
          <ApplySellerModal
            lang={lang}
            onClose={() => setShowApplySellerModal(false)}
          />
        )}
        {showAuth === "login" && (
          <AuthModal
            mode="login"
            lang={lang}
            onOpenAbout={(tab: string) => {
              setAboutPageTab(tab);
              setShowAboutPage(true);
            }}
            onClose={() => setShowAuth(null)}
            onSwitch={() => setShowAuth("register")}
            onSuccess={(u) => {
              setActiveUser(u);
              setShowAuth(null);
            }}
            onApplySeller={() => {
              setShowAuth(null);
              setShowApplySellerModal(true);
            }}
          />
        )}
        {showAuth === "register" && (
          <AuthModal
            mode="register"
            lang={lang}
            onOpenAbout={(tab: string) => {
              setAboutPageTab(tab);
              setShowAboutPage(true);
            }}
            onClose={() => setShowAuth(null)}
            onSwitch={() => setShowAuth("login")}
            onSuccess={(u) => {
              setActiveUser(u);
              setShowAuth(null);
            }}
            onApplySeller={() => {
              setShowAuth(null);
              setShowApplySellerModal(true);
            }}
          />
        )}

        {selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            seller={sellers.find((s) => s.id === selectedProduct.sellerId)}
            relatedProducts={(() => {
              // 1. Must match the same category to avoid unrelated categories in the same broad niche
              const sameCategoryProducts = products.filter((p) => {
                if (p.id === selectedProduct.id) return false;
                
                // Match the exact category
                if (selectedProduct.category && p.category !== selectedProduct.category) {
                  return false;
                }
                
                // Match the niche (or fallback to broad matching if niche isn't specified)
                const sNiche = selectedProduct.niche && selectedProduct.niche !== "Zote";
                if (sNiche && p.niche !== selectedProduct.niche) {
                  return false;
                }
                
                return true;
              });

              // If there are no products of the exact same category, fallback to niche-based products
              const basePool = sameCategoryProducts.length > 0 
                ? sameCategoryProducts 
                : products.filter((p) => {
                    if (p.id === selectedProduct.id) return false;
                    const sNiche = selectedProduct.niche && selectedProduct.niche !== "Zote";
                    return sNiche && p.niche === selectedProduct.niche;
                  });

              // 2. Score by "Family" similarity to sort closer items first
              const scored = basePool.map((p) => {
                let score = 0;
                
                // A) Brand / Prefix matching (e.g., both "Sony ..." or "Samsung ...")
                const firstWord1 = selectedProduct.name.trim().split(/\s+/)[0]?.toLowerCase();
                const firstWord2 = p.name.trim().split(/\s+/)[0]?.toLowerCase();
                if (firstWord1 && firstWord1 === firstWord2) {
                  score += 30;
                }

                // B) Title/name keyword overlap (e.g. matching "4K", "Smart", "OLED", "TV")
                const words1 = selectedProduct.name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
                const words2 = p.name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
                const commonWords = words1.filter(w => words2.includes(w));
                score += commonWords.length * 10;

                // C) Tag overlap similarity
                const p1Tags = selectedProduct.tags || [];
                const p2Tags = p.tags || [];
                const commonTags = p1Tags.filter(t => p2Tags.includes(t));
                score += commonTags.length * 5;

                return { product: p, score };
              });

              // Sort by highest similarity score first
              return scored
                .sort((a, b) => b.score - a.score)
                .map(item => item.product);
            })()}
            onSelectProduct={(p) => {
              setSelectedProduct(p);
              const params = new URLSearchParams(window.location.search);
              params.set("product", p.id);
              window.history.pushState(
                {},
                "",
                `${window.location.pathname}?${params.toString()}`,
              );
            }}
            onViewSeller={(s) => {
              setViewSeller(s);
              setSelectedNiche("Zote");
              setSelectedCategory("Zote");
              setSearch("");
              // Close product details when navigating to seller list
              setSelectedProduct(null);
              const params = new URLSearchParams(window.location.search);
              params.delete("product");
              const remaining = params.toString();
              const suffix = remaining ? `?${remaining}` : "";
              window.history.pushState(
                {},
                "",
                `${window.location.pathname}${suffix}`,
              );
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onClose={() => {
              setSelectedProduct(null);
              const params = new URLSearchParams(window.location.search);
              params.delete("product");
              const remaining = params.toString();
              const suffix = remaining ? `?${remaining}` : "";
              window.history.pushState(
                {},
                "",
                `${window.location.pathname}${suffix}`,
              );
            }}
            onAdd={addToCart}
            lang={lang}
            activeUser={activeUser}
            isLiked={likedProductIds.includes(selectedProduct.id)}
            onLikeToggle={toggleLikeProduct}
            // Passing standalone App Bar dependencies
            globalSettings={globalSettings}
            cart={cart}
            onOpenCart={() => setShowCart(true)}
            onSetLang={(newLang) => setLang(newLang)}
            onOpenAuth={(mode) => setShowAuth(mode)}
          />
        )}
        {showTrackOrder && (
          <TrackOrderModal onClose={() => setShowTrackOrder(false)} />
        )}
        {showReviewModal && selectedProductForReview && (
          <ReviewModal
            productId={selectedProductForReview.id}
            productName={selectedProductForReview.name}
            onClose={() => {
              setShowReviewModal(false);
              setSelectedProductForReview(null);
            }}
            lang={lang}
            activeUser={activeUser}
            onSuccess={(savedReview: Review) => {
              setAllReviews((prev) => {
                const updated = { ...prev };
                if (!updated[selectedProductForReview.id]) {
                  updated[selectedProductForReview.id] = [];
                }
                updated[selectedProductForReview.id] = [
                  savedReview,
                  ...updated[selectedProductForReview.id],
                ];
                return updated;
              });
              loadData(true);
            }}
          />
        )}
      </div>
      {showImageLimitModal && (
        <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 relative shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowImageLimitModal(false)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Camera size={30} />
            </div>

            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {lang === "sw"
                ? "Kikomo cha Kupakia Picha"
                : "Image Limit Reached"}
            </h2>

            <p className="text-xs text-slate-500 mt-3 leading-relaxed font-semibold">
              {lang === "sw"
                ? "Pole, umefikia kikomo cha kutafuta picha 3 kwa sasa ili kuzuia matumizi mabaya ya rasilimali. Tafadhali endelea na utafutaji wa maandishi wa kawaida au wasiliana nasi!"
                : "Sorry, you have reached the maximum limit of 3 visual image searches to prevent system abuse. Please continue using smart text-based recommendations!"}
            </p>

            <button
              onClick={() => setShowImageLimitModal(false)}
              className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 text-xs font-black shadow-sm transition-colors cursor-pointer"
            >
              {lang === "sw" ? "Nimeelewa" : "I Understand"}
            </button>
          </div>
        </div>
      )}

      {viewInvoice && (
        <CustomerInvoiceView
          order={viewInvoice}
          onClose={() => setViewInvoice(null)}
          lang={lang}
        />
      )}
      <CookieConsent lang={lang} />

      {toastMsg && (
        <div className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[99999999] bg-slate-900/95 backdrop-blur-md text-white text-xs sm:text-sm font-semibold py-2.5 px-5 sm:px-6 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.3)] flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <div className="w-2 h-2 rounded-full bg-emerald-500 absolute left-[20px] sm:left-[24px]" />
          <span>{toastMsg}</span>
        </div>
      )}
    </>
  );
}

interface ProductCardProps {
  p: Product;
  seller?: SellerProfile;
  onAdd: (openCart?: boolean) => void;
  onSelect: (p: Product) => void;
  onInteract?: () => void;
  onViewSeller?: (s: SellerProfile) => void;
  lang?: Lang;
  reviews?: Review[];
  isLiked?: boolean;
  onLikeToggle?: (productId: string, niche?: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  p,
  seller,
  onAdd,
  onSelect,
  onInteract,
  onViewSeller,
  lang = "sw",
  reviews = [],
  isLiked = false,
  onLikeToggle,
}) => {
  const isOutOfStock = p.stock <= 0;
  const [imgIdx, setImgIdx] = useState(0);
  const [showFullImage, setShowFullImage] = useState(false);

  const avgRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return parseFloat((total / reviews.length).toFixed(1));
  }, [reviews]);

  const handleChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInteract) onInteract();
    const link = `${window.location.origin}/?product=${p.id}`;
    let msg = `${t((lang || "sw") as Lang, "prod.wa_inquiry")} ${p.name} (${link})`;
    window.open(
      `https://wa.me/255764258114?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInteract) onInteract();
    setImgIdx((i) => (i + 1) % p.images.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInteract) onInteract();
    setImgIdx((i) => (i - 1 + p.images.length) % p.images.length);
  };

  return (
    <>
      <div
        className="flex flex-col group transition-all duration-300 hover:-translate-y-0.5 cursor-pointer h-full"
        onClick={() => onSelect(p)}
      >
        <div
          className="relative aspect-[3/4] sm:aspect-[4/5] bg-[#f8fafc] rounded-lg sm:rounded-xl overflow-hidden mb-2 sm:mb-2.5 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (onInteract) onInteract();
            onSelect(p);
          }}
        >
          {seller?.isPro && seller?.proUntil && seller.proUntil > Date.now() ? (
            <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 z-10 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
              PRO <Store size={8} className="sm:w-2 sm:h-2" />
            </div>
          ) : null}
          {p.images.length > 0 ? (
            <>
              <MediaRenderer
                src={p.images[imgIdx]}
                alt={p.name}
                className="w-full h-full object-contain group-hover:scale-[1.03] transition duration-500 ease-out p-1"
                autoPlay
              />
              {p.images.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-xs text-slate-800 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110 shadow-xs"
                  >
                    <ChevronLeft size={12} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={nextImg}
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-xs text-slate-800 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110 shadow-xs"
                  >
                    <ChevronRight size={12} strokeWidth={2.5} />
                  </button>
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {p.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setImgIdx(i);
                        }}
                        className={`h-1 rounded-full transition-all duration-300 ${i === imgIdx ? "w-2.5 bg-white shadow-xs" : "w-1 bg-white/50 hover:bg-white"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <ImageIcon size={24} strokeWidth={1} />
            </div>
          )}

          {p.oldPrice && p.oldPrice > p.price && (
            <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 bg-rose-500 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs animate-pulse">
              -{Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}%
            </div>
          )}

          <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 flex flex-col gap-1 items-end z-10">
            <div className="bg-blue-50/95 text-blue-600 border border-blue-100/60 backdrop-blur-xs text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-0.5 w-fit">
              <ShieldCheck
                size={7}
                className="text-blue-500 sm:w-2.5 sm:h-2.5"
              />
              Verified
            </div>

            {p.warranty && (
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border border-amber-600/30 backdrop-blur-xs text-[7px] sm:text-[8px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 w-fit transform hover:scale-105 transition-all">
                <Award size={8} className="sm:w-3 sm:h-3 text-white" />
                <span>{p.warranty}</span>
              </div>
            )}
          </div>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="bg-white text-slate-900 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black shadow-md tracking-wider uppercase">
                {t((lang || "sw") as Lang, "prod.out_of_stock")}
              </span>
            </div>
          )}

          {onLikeToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onInteract) onInteract();
                onLikeToggle(p.id, p.niche);
              }}
              className={`absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 z-20 rounded-full p-2 backdrop-blur-xs transition z-30 shadow-xs hover:scale-110 active:scale-95 outline-none ${
                isLiked
                  ? "bg-rose-500 text-white border border-rose-500"
                  : "bg-white/80 border border-slate-200 text-slate-500 hover:text-rose-500 hover:bg-white"
              }`}
              title={lang === "sw" ? "Penda" : "Favorite"}
            >
              <Heart
                size={12}
                fill={isLiked ? "currentColor" : "none"}
                className="sm:w-3.5 sm:h-3.5"
              />
            </button>
          )}
        </div>

        <div className="flex flex-col flex-1 px-1 justify-between pb-1 mt-0.5">
          <div>
            <h3
              className="text-[11px] sm:text-[12px] md:text-[13px] font-medium leading-[1.3] text-slate-800 line-clamp-2 h-auto mb-1 flex-shrink-0 group-hover:text-[#ff4c00] transition-colors"
              title={p.name}
            >
              {p.name}
            </h3>
            {avgRating > 0 && (
              <div className="flex items-center gap-1 mb-1 mt-0.5">
                <span className="flex items-center text-[#ff4c00]">
                  <Star fill="currentColor" size={10} strokeWidth={0} />
                </span>
                <span className="text-[10px] font-black text-slate-800 leading-none">
                  {avgRating}{" "}
                  <span className="text-slate-400 font-medium font-sans">
                    ({reviews.length})
                  </span>
                </span>
              </div>
            )}
            <div className="mt-1 flex flex-col justify-start mb-1.5">
              <div className="flex items-center gap-1.5 flex-wrap whitespace-nowrap">
                <PriceDisplay
                  amount={p.price}
                  colorClass="text-[#ff4c00]"
                  className="text-[13px] sm:text-[15px]"
                />
                {p.oldPrice && p.oldPrice > p.price && (
                  <PriceDisplay
                    amount={p.oldPrice}
                    colorClass="text-slate-400/90 line-through font-medium"
                    className="text-[10px]"
                  />
                )}
              </div>
              {p.oldPrice && p.oldPrice > p.price ? (
                <div className="text-[9px] text-slate-500 line-clamp-1 mt-1 font-medium">
                  {lang === "sw"
                    ? "Chini kwa zinazofanana"
                    : "Lowest among similar"}
                </div>
              ) : (
                <div className="text-[9px] text-[#ff4c00] line-clamp-1 mt-1 font-medium">
                  {lang === "sw" ? "Bidhaa mpya, karibu" : "New Arrivals"}
                </div>
              )}
            </div>
          </div>

          <div className="mt-1 flex flex-col gap-1 w-full">
            {!isOutOfStock ? (
              <div className="flex gap-1 w-full">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd(false);
                  }}
                  className="flex-1 min-w-0 border border-slate-200 hover:border-[#ff4c00]/60 text-slate-700 hover:text-[#ff4c00] text-[10px] sm:text-[11px] font-bold py-1 sm:py-1.5 px-0.5 sm:px-1 rounded-full transition-colors flex items-center justify-center gap-0.5 cursor-pointer"
                  title={lang === "sw" ? "Weka kwenye kikapu" : "Add to Cart"}
                >
                  <ShoppingCart size={11} className="shrink-0" />
                  <span className="truncate">
                    {lang === "sw" ? "Kapuni" : "Add"}
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd(true);
                  }}
                  className="flex-1 min-w-0 bg-[#ff4c00] hover:bg-[#e04300] text-white text-[10px] sm:text-[11px] font-black py-1 sm:py-1.5 px-0.5 sm:px-1 rounded-full transition-colors flex items-center justify-center gap-0.5 cursor-pointer shadow-xs"
                  title={lang === "sw" ? "Nunua Sasa" : "Buy Now"}
                >
                  <Zap
                    size={10}
                    className="shrink-0 fill-current animate-pulse"
                  />
                  <span className="truncate">
                    {lang === "sw" ? "Nunua" : "Buy"}
                  </span>
                </button>
              </div>
            ) : (
              <button
                disabled
                className="w-full border border-slate-200 text-slate-400 text-[10px] sm:text-[11px] font-bold py-1 sm:py-1.5 px-1 rounded-full flex items-center justify-center"
              >
                <span className="truncate">
                  {lang === "sw" ? "Imeisha" : "Sold Out"}
                </span>
              </button>
            )}

            {seller && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewSeller && onViewSeller(seller);
                }}
                className="w-full py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full flex items-center justify-center gap-1 transition-colors border border-slate-200 text-[9px] font-medium cursor-pointer"
                title={seller.name}
              >
                <Store size={10} />
                <span className="truncate max-w-[100px]">{seller.name}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {showFullImage && p.images.length > 0 && (
        <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
          <button
            onClick={() => setShowFullImage(false)}
            className="absolute top-6 right-6 text-white/50 hover:text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"
          >
            <X size={24} />
          </button>

          <div className="max-w-5xl w-full relative flex items-center justify-center">
            {p.images.length > 1 && (
              <button
                onClick={prevImg}
                className="absolute left-0 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all hidden md:block"
              >
                <ChevronLeft size={36} />
              </button>
            )}

            <MediaRenderer
              src={p.images[imgIdx]}
              className="max-h-[75vh] w-auto h-auto max-w-full object-contain rounded-2xl shadow-2xl"
              controls
              autoPlay
            />

            {p.images.length > 1 && (
              <button
                onClick={nextImg}
                className="absolute right-0 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all hidden md:block"
              >
                <ChevronRight size={36} />
              </button>
            )}
          </div>

          {p.images.length > 1 && (
            <div className="flex gap-3 mt-8 overflow-x-auto max-w-full pb-4 px-4 scrollbar-hide">
              {p.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${imgIdx === i ? "border-accent opacity-100 scale-105 shadow-[0_0_20px_rgba(245,158,11,0.3)]" : "border-transparent opacity-40 hover:opacity-100"}`}
                >
                  <MediaRenderer
                    src={img}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

function PromoImageSlider({ images, pId }: { images: string[]; pId: string }) {
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    setImgIdx(0);
  }, [pId]);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(
      () => setImgIdx((i) => (i + 1) % images.length),
      3000,
    );
    return () => clearInterval(t);
  }, [images.length, pId]);

  return (
    <div className="w-full h-full relative bg-slate-950/20">
      <MediaRenderer
        src={images[imgIdx]}
        className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
        alt="Promo clear image"
        autoPlay
      />
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setImgIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${imgIdx === i ? "w-4 bg-accent shadow-sm" : "w-1.5 bg-white/60 hover:bg-white/90"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PromoCarousel({
  promos,
  products,
  onAddToCart,
  onViewPromo,
  isIsolated = false,
}: {
  promos: Promotion[];
  products: Product[];
  onAddToCart: (p: Product) => void;
  onViewPromo: (p: Promotion) => void;
  isIsolated?: boolean;
}) {
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isHoveredOrFocused, setIsHoveredOrFocused] = useState(false);

  useEffect(() => {
    if (promos.length <= 1 || isPaused) return;
    const t = setInterval(() => {
      setDirection(1);
      setIdx((i) => (i + 1) % promos.length);
    }, 7000);
    return () => clearInterval(t);
  }, [promos.length, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isHoveredOrFocused) return;
      if (e.code === "Space") {
        const activeEl = document.activeElement;
        const isInput =
          activeEl &&
          (activeEl.tagName === "INPUT" ||
            activeEl.tagName === "TEXTAREA" ||
            activeEl.tagName === "SELECT" ||
            activeEl.getAttribute("contenteditable") === "true");
        if (isInput) return;

        e.preventDefault();
        setIsPaused((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isHoveredOrFocused]);

  if (!promos || promos.length === 0) return null;

  const p = promos[idx];

  const handleActionClick = () => {
    if (!p.link) {
      if (!isIsolated) {
        onViewPromo(p);
      }
      return;
    }
    try {
      const url = new URL(p.link, window.location.origin);
      const prodId = url.searchParams.get("product");
      if (prodId) {
        const prod = products.find((prod) => prod.id === prodId);
        if (prod) {
          onAddToCart(prod);
          return;
        }
      }
    } catch (e) {}
    window.location.href = p.link;
  };

  const isProductLink = p.link && p.link.includes("?product=");
  const btnLabel = p.link
    ? p.cardButtonText || (isProductLink ? "Buy Now" : "Explore")
    : "";

  return (
    <div
      onClick={() => {
        setIsPaused((prev) => !prev);
      }}
      onMouseEnter={() => setIsHoveredOrFocused(true)}
      onMouseLeave={() => setIsHoveredOrFocused(false)}
      onFocus={() => setIsHoveredOrFocused(true)}
      onBlur={() => setIsHoveredOrFocused(false)}
      tabIndex={0}
      className="w-full max-[720px]:w-[calc(100%+16px)] max-[720px]:-mx-2 sm:max-[720px]:w-[calc(100%+32px)] sm:max-[720px]:-mx-4 min-[720px]:w-full min-[720px]:mx-0 max-[720px]:aspect-[27/20] min-[720px]:aspect-[16/9] md:aspect-[21/9] lg:aspect-[24/9] max-h-[360px] relative overflow-hidden mb-8 border-none flex items-center justify-center bg-transparent group select-none max-[720px]:rounded-none min-[720px]:rounded-[14px] focus:outline-none"
    >
      <AnimatePresence initial={false} mode="popLayout" custom={direction}>
        <motion.div
          key={p.id + "-" + idx}
          custom={direction}
          variants={{
            enter: (d: number) => ({
              x: d > 0 ? "100%" : "-100%",
              opacity: 0.4,
            }),
            center: { x: "0%", opacity: 1 },
            exit: (d: number) => ({
              x: d > 0 ? "-100%" : "100%",
              opacity: 0.4,
            }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "tween", duration: 0.5, ease: "easeInOut" },
            opacity: { duration: 0.35 },
          }}
          className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden"
        >
          {p.image || (p.images && p.images.length > 0) ? (
            <div className="absolute inset-0 w-full h-full max-[720px]:bg-slate-950 flex items-center justify-center overflow-hidden">
              {/* Premium Ambient Blur Background for Mobile to match colored margins beautifully */}
              <div className="absolute inset-0 w-full h-full max-[720px]:block min-[720px]:hidden select-none pointer-events-none opacity-40 blur-lg scale-110">
                <MediaRenderer
                  src={p.image || (p.images && p.images[0]) || ""}
                  className="w-full h-full object-cover object-center"
                  alt=""
                />
              </div>
              <MediaRenderer
                src={p.image || (p.images && p.images[0]) || ""}
                className="w-full h-full relative z-[1] max-[720px]:object-contain min-[720px]:object-cover object-center transition-transform duration-700 group-hover:scale-105"
                key={p.id + "-main-graphic"}
                alt={p.title || "Promo"}
                autoPlay
              />
            </div>
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
              No Image
            </div>
          )}

          {/* Optional Premium Text Overlay */}
          {(p.title?.trim() ||
            p.description?.trim() ||
            p.badgeText?.trim() ||
            btnLabel) && (
            <div className="absolute inset-0 z-10 flex flex-col justify-center items-start p-6 sm:p-10 md:p-14 bg-gradient-to-r from-white/50 via-white/10 to-transparent pointer-events-none">
              <div className="max-w-xl">
                {p.badgeText?.trim() && (
                  <span className="inline-block px-3 py-1 mb-3 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-900 bg-white/40 border border-white/40 rounded-full shadow-sm">
                    {p.badgeText}
                  </span>
                )}
                {p.title?.trim() && (
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight drop-shadow-sm mb-3">
                    {p.title}
                  </h2>
                )}
                {p.description?.trim() && (
                  <p className="text-sm sm:text-base text-slate-800 line-clamp-2 md:line-clamp-3 mb-6 max-w-md drop-shadow-sm font-medium">
                    {p.description}
                  </p>
                )}
                {btnLabel && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick();
                    }}
                    className="inline-flex items-center gap-2 bg-[#fac815] text-black px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-bold text-sm sm:text-base uppercase tracking-wider shadow-xl pointer-events-auto hover:bg-slate-900 hover:text-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border-none"
                  >
                    {btnLabel}
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Central Video Pause-like Indicator */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/10 z-15 flex items-center justify-center pointer-events-none transition-all duration-300">
          <div className="w-14 h-14 rounded-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center text-white scale-110 shadow-lg animate-pulse">
            <Pause size={24} className="fill-white" />
          </div>
        </div>
      )}

      {promos.length > 1 && (
        <>
          {/* Grouped Media-Style Navigation Controls at Bottom Right */}
          <div className="absolute bottom-3 right-3 md:right-6 z-20 flex items-center gap-1 bg-transparent select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDirection(-1);
                setIdx((prev) => (prev - 1 + promos.length) % promos.length);
              }}
              className="text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-300 hover:scale-120 active:scale-90 transition-all cursor-pointer bg-transparent border-none p-1 shrink-0"
              aria-label="Previous Promo"
            >
              <ChevronLeft size={28} className="stroke-[1.5]" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused((prev) => !prev);
              }}
              className="text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-300 hover:scale-120 active:scale-90 transition-all cursor-pointer bg-transparent border-none p-1 shrink-0 flex items-center justify-center"
              aria-label={
                isPaused ? "Play Promo Rotation" : "Pause Promo Rotation"
              }
            >
              {isPaused ? (
                <Play size={18} className="fill-current" />
              ) : (
                <Pause size={18} className="fill-current" />
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDirection(1);
                setIdx((prev) => (prev + 1) % promos.length);
              }}
              className="text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-300 hover:scale-120 active:scale-90 transition-all cursor-pointer bg-transparent border-none p-1 shrink-0"
              aria-label="Next Promo"
            >
              <ChevronRight size={28} className="stroke-[1.5]" />
            </button>
          </div>

          {/* Indicators dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md">
            {promos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setIdx(i);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === i ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/90"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CustomerInvoiceView({
  order,
  onClose,
  lang,
}: {
  order: Order;
  onClose: () => void;
  lang: Lang;
}) {
  const [inv, setInv] = useState<any>(null);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [sellersList, setSellersList] = useState<SellerProfile[]>([]);
  const [isSingleSeller, setIsSingleSeller] = useState(false);
  const [viewMode, setViewMode] = useState<"standard" | "thermal">("standard");

  const isTraVerified = order.paymentReference?.includes("TRA_VERIFIED");
  const traInfo = useMemo(() => {
    if (!isTraVerified) return null;
    const parts = order.paymentReference.split("||");
    const info: any = {};
    parts.forEach((p: string) => {
      if (p.startsWith("RCTVNUM:"))
        info.rctvnum = p.substring("RCTVNUM:".length);
      if (p.startsWith("RCTNUM:")) info.rctnum = p.substring("RCTNUM:".length);
      if (p.startsWith("GC:")) info.gc = p.substring("GC:".length);
      if (p.startsWith("DC:")) info.dc = p.substring("DC:".length);
      if (p.startsWith("DATE:")) info.date = p.substring("DATE:".length);
      if (p.startsWith("TIME:")) info.time = p.substring("TIME:".length);
      if (p.startsWith("SIGN:")) info.sign = p.substring("SIGN:".length);
    });
    return info;
  }, [order.paymentReference, isTraVerified]);

  useEffect(() => {
    async function loadInv() {
      try {
        const [globalInv, prods, sellers] = await Promise.all([
          db.getInvoiceSettings(),
          db.getProducts(),
          db.getSellers(),
        ]);

        setProductsList(prods);
        setSellersList(sellers);

        const sellerIdsInOrder = new Set<string>();
        order.items.forEach((item) => {
          const itemPid = item.productId || (item as any).id;
          const prod = prods.find((p) => p.id === itemPid);
          if (prod && prod.sellerId) {
            sellerIdsInOrder.add(prod.sellerId);
          }
        });

        let finalInv = { ...globalInv };
        let singleSellerFound = false;

        if (sellerIdsInOrder.size === 1) {
          const uniqueSellerId = Array.from(sellerIdsInOrder)[0];
          const s = sellers.find((x) => x.id === uniqueSellerId);
          if (s) {
            singleSellerFound = true;
            finalInv = {
              ...finalInv,
              companyName:
                s.invoiceCompanyName || s.name || globalInv.companyName,
              address: s.invoiceAddress || globalInv.address,
              phone: s.invoicePhone || globalInv.phone,
              email: s.invoiceEmail || s.email || globalInv.email,
              terms: s.invoiceTerms || globalInv.terms,
              businessLogo: s.businessLogo || "",
            };
          }
        } else {
          // If multi-seller order or no seller (Admin's own), brand as Official Orbi Shop
          finalInv = {
            ...finalInv,
            companyName: globalInv.companyName || "Orbi Shop Head Office",
            address: globalInv.address || "Dar es Salaam, Tanzania",
            phone: globalInv.phone || "+255 744 111 222",
            email: globalInv.email || "support@orbifinancial.com",
            terms:
              globalInv.terms ||
              "Asante kwa kununua kupitia Orbi Shop. Bidhaa hizi zimetolewa kutoka wauzaji mbalimbali na kuratibiwa na duka kuu la mtandaoni la Orbi Shop.",
            businessLogo: "", // Falls back to Orbi Shop logo
          };
        }

        setIsSingleSeller(singleSellerFound);
        setInv(finalInv);
      } catch (err) {
        console.warn(
          "Failed to auto fill seller details on customer invoice",
          err,
        );
      }
    }
    loadInv();
  }, [order]);

  const handlePrint = () => {
    window.print();
  };

  if (!inv) return <LoadingOverlay />;

  const logoSrc =
    inv.businessLogo ||
    "https://media-stock.orbifinancial.com/OrbiShop_Logo_Blue.png";

  return (
    <>
      <style>{`
      @media print {
        @page {
          size: auto;
          margin: 6mm 10mm 6mm 10mm !important;
        }
        body {
          background: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body * {
          visibility: hidden;
        }
        #invoice-print-container, #invoice-print-container * {
          visibility: visible;
        }
        #invoice-print-container {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          box-shadow: none !important;
          overflow: visible !important;
          display: block !important;
          transform: scale(0.92) !important;
          transform-origin: top left !important;
        }
        .invoice-body {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          box-shadow: none !important;
          background: #ffffff !important;
          page-break-inside: avoid;
        }
        /* Completely hide navigation controls and actions */
        #invoice-print-container button,
        #invoice-print-container a[href^="javascript:"],
        #invoice-print-container [role="button"],
        .print\:hidden,
        .print-hidden,
        .no-print {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0 !important;
          width: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
        }
      }
      .carbon-paper {
        background-color: #dfebf2;
        background-image: 
          radial-gradient(#1a2f52 0.5px, transparent 0.5px), 
          linear-gradient(to bottom, rgba(26, 47, 82, 0.02) 1px, transparent 1px);
        background-size: 16px 16px, 100% 4px;
        color: #1a2f52;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", sans-serif !important;
      }
      .zigzag-borders {
        clip-path: polygon(
          0% 8px, 1.5% 0px, 3% 8px, 4.5% 0px, 6% 8px, 7.5% 0px, 9% 8px, 10.5% 0px, 12% 8px, 13.5% 0px, 15% 8px, 16.5% 0px, 18% 8px, 19.5% 0px, 21% 8px, 22.5% 0px, 24% 8px, 25.5% 0px, 27% 8px, 28.5% 0px, 30% 8px, 31.5% 0px, 33% 8px, 34.5% 0px, 36% 8px, 37.5% 0px, 39% 8px, 40.5% 0px, 42% 8px, 43.5% 0px, 45% 8px, 46.5% 0px, 48% 8px, 49.5% 0px, 51% 8px, 52.5% 0px, 54% 8px, 55.5% 0px, 57% 8px, 58.5% 0px, 60% 8px, 61.5% 0px, 63% 8px, 64.5% 0px, 66% 8px, 67.5% 0px, 69% 8px, 70.5% 0px, 72% 8px, 73.5% 0px, 75% 8px, 76.5% 0px, 78% 8px, 79.5% 0px, 81% 8px, 82.5% 0px, 84% 8px, 85.5% 0px, 87% 8px, 88.5% 0px, 90% 8px, 91.5% 0px, 93% 8px, 94.5% 0px, 96% 8px, 97.5% 0px, 99% 8px, 100% 0px,
          100% calc(100% - 8px), 98.5% 100%, 97% calc(100% - 8px), 95.5% 100%, 94% calc(100% - 8px), 92.5% 100%, 91% calc(100% - 8px), 89.5% 100%, 88% calc(100% - 8px), 86.5% 100%, 85% calc(100% - 8px), 83.5% 100%, 82% calc(100% - 8px), 80.5% 100%, 79% calc(100% - 8px), 77.5% 100%, 76% calc(100% - 8px), 74.5% 100%, 73% calc(100% - 8px), 71.5% 100%, 70% calc(100% - 8px), 68.5% 100%, 67% calc(100% - 8px), 65.5% 100%, 64% calc(100% - 8px), 62.5% 100%, 61% calc(100% - 8px), 59.5% 100%, 58% calc(100% - 8px), 56.5% 100%, 55% calc(100% - 8px), 53.5% 100%, 52% calc(100% - 8px), 50.5% 100%, 49% calc(100% - 8px), 47.5% 100%, 46% calc(100% - 8px), 44.5% 100%, 43% calc(100% - 8px), 41.5% 100%, 40% calc(100% - 8px), 38.5% 100%, 37% calc(100% - 8px), 35.5% 100%, 34% calc(100% - 8px), 32.5% 100%, 31% calc(100% - 8px), 29.5% 100%, 28% calc(100% - 8px), 26.5% 100%, 25% calc(100% - 8px), 23.5% 100%, 22% calc(100% - 8px), 20.5% 100%, 19% calc(100% - 8px), 17.5% 100%, 16% calc(100% - 8px), 14.5% 100%, 13% calc(100% - 8px), 11.5% 100%, 10% calc(100% - 8px), 8.5% 100%, 7% calc(100% - 8px), 5.5% 100%, 4% calc(100% - 8px), 2.5% 100%, 1% calc(100% - 8px), 0% 100%
        );
      }
    `}</style>
      <div
        id="invoice-print-container"
        className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto print:static print:bg-white print:p-0 print:block print:overflow-visible flex"
      >
        <div
          className={
            viewMode === "thermal"
              ? "carbon-paper zigzag-borders border border-[#1a2f52]/10 shadow-2xl w-full max-w-lg m-auto print:m-0 print:rounded-none print:shadow-none print:max-w-full invoice-body flex flex-col relative overflow-hidden pt-12 pb-12 px-6 sm:px-8 select-text"
              : "bg-white rounded-2xl md:rounded-3xl shadow-xl w-full max-w-3xl m-auto print:m-0 print:rounded-none print:shadow-none print:max-w-full invoice-body flex flex-col relative bg-cover bg-no-repeat bg-center"
          }
        >
          {/* Watermark Logo (Only in standard mode) */}
          {viewMode === "standard" && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.035] overflow-hidden -z-10 select-none">
              <img
                src="https://media-stock.orbifinancial.com/OrbiShop_Logo_Blue.png"
                alt="Watermark Logo"
                className="w-[20rem] md:w-[28rem] object-contain rotate-12"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Actions (Hidden on Print) */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap justify-between items-center bg-slate-50 rounded-t-2xl md:rounded-t-3xl print:hidden sticky top-0 z-10 shadow-sm gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition flex items-center gap-2 text-xs"
            >
              <ChevronLeft size={16} /> Rudi Dukani
            </button>

            {/* Standard/Thermal View Mode Slider Switch */}
            <div className="flex gap-1 bg-slate-200/85 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode("standard")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1 cursor-pointer ${viewMode === "standard" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                📄 {lang === "sw" ? "Ankara A4" : "Standard A4"}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("thermal")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1 cursor-pointer ${viewMode === "thermal" ? "bg-[#1a2f52] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                🖨️ {lang === "sw" ? "Risiti ya EFD" : "Thermal EFD"}
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold shadow-md hover:bg-slate-700 transition flex items-center gap-2"
            >
              {lang === "sw" ? "Pakua PDF" : "Print PDF"}
            </button>
          </div>

          {viewMode === "thermal" ? (
            /* Physical Thermal EFD Receipt Representation */
            <div className="flex-1 flex flex-col gap-4 justify-between min-h-0 print:min-h-0 relative p-6 sm:p-8 select-text w-full">
              {/* Ambient Watermark Background for carbon look */}
              <div className="absolute inset-x-0 top-1/4 bottom-1/4 pointer-events-none flex items-center justify-center opacity-[0.04] overflow-hidden -z-10 select-none">
                <img
                  src={logoSrc}
                  alt="Watermark"
                  className="w-48 object-contain rotate-12 filter contrast-200 saturate-50"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-4">
                {/* Centered Receipt Header info */}
                <div className="text-center space-y-1">
                  {logoSrc && (
                    <div className="flex justify-center mb-2">
                      <img
                        src={logoSrc}
                        alt="Stamp"
                        className="h-9 object-contain filter grayscale contrast-150 saturate-50"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="font-black text-sm tracking-widest text-[#1a2f52] font-mono">
                    {inv.companyName?.toUpperCase() || "ORBI SHOP HQ"}
                  </div>
                  {inv.address && (
                    <div className="text-[10px] text-[#2c4063] font-mono">
                      {inv.address.toUpperCase()}
                    </div>
                  )}
                  <div className="text-[9px] text-[#2c4063] space-y-0.5 justify-center flex flex-wrap gap-x-3 font-mono">
                    {inv.phone && <span>TEL: {inv.phone}</span>}
                    {inv.email && <span>EMAIL: {inv.email.toUpperCase()}</span>}
                  </div>
                </div>

                {/* Dividing Line */}
                <div className="text-center text-[#1a2f52]/40 my-1 tracking-widest text-[9px] select-none font-mono">
                  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
                </div>

                {/* Document Type Label */}
                <div className="text-center space-y-0.5 pb-1">
                  <h1 className="text-xs font-black tracking-wider text-[#1a2f52] uppercase font-mono">
                    {order.status === "delivered"
                      ? lang === "sw"
                        ? "RISITI HALALI YA MAPATO TRA (EFD)"
                        : "OFFICIAL TAX RECEIPT (TRA CODES)"
                      : lang === "sw"
                        ? "ANKARA PRO-FORMA YA KODI"
                        : "PRO-FORMA TAX INVOICE"}
                  </h1>
                </div>

                {/* Dividing Line */}
                <div className="text-center text-[#1a2f52]/40 my-1 tracking-widest text-[9px] select-none font-mono">
                  ==========================================================
                </div>

                {/* Customer and Order metadata details */}
                <div className="grid grid-cols-2 gap-3 text-[10px] leading-relaxed border-b border-dashed border-[#1a2f52]/20 pb-2 font-mono">
                  <div className="space-y-0.5">
                    <div className="text-[8px] font-bold text-[#2c4063] tracking-wider uppercase">
                      MNUNUZI / BUYER:
                    </div>
                    <div className="font-extrabold text-[#1a2f52]">
                      {order.customerDetails.name.toUpperCase()}
                    </div>
                    {order.customerDetails.phone && (
                      <div>TEL: {order.customerDetails.phone}</div>
                    )}
                    {order.customerDetails.address && (
                      <div className="text-[9px]">
                        LOC: {order.customerDetails.address.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5 text-right border-l border-dashed border-[#1a2f52]/20 pl-3">
                    <div className="text-[8px] font-bold text-[#2c4063] tracking-wider uppercase">
                      ODA / ORDER DETAILS:
                    </div>
                    <div className="font-bold">
                      ODA ID: #{order.id.slice(-6).toUpperCase()}
                    </div>
                    <div>
                      DATE: {new Date(order.date).toLocaleDateString("sw-TZ")}
                    </div>
                    <div>
                      TIME:{" "}
                      {new Date(order.date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </div>
                  </div>
                </div>

                {/* Transaction Payment strip */}
                <div className="grid grid-cols-2 gap-2 bg-white/30 border border-[#1a2f52]/15 text-[9px] p-2 rounded font-mono">
                  <div>
                    <span className="text-slate-500 block uppercase">
                      PAY VIA:
                    </span>
                    <strong className="text-[#1a2f52] block font-black uppercase">
                      {order.paymentMethodName?.toUpperCase() ||
                        order.paymentMethod?.toUpperCase()}
                    </strong>
                  </div>
                  {order.paymentReference && (
                    <div className="text-right">
                      <span className="text-slate-500 block uppercase">
                        REF NO:
                      </span>
                      <strong className="text-[#1a2f52] block font-black uppercase leading-none break-all">
                        {order.paymentReference
                          .split("||")[0]
                          .split("TRA_VERIFIED")[0]
                          .toUpperCase()}
                      </strong>
                    </div>
                  )}
                  <div className="col-span-2 pt-1.5 mt-1 border-t border-dashed border-[#1a2f52]/10 flex justify-between items-center text-[9px]">
                    <span className="text-slate-500 uppercase">PAY STATE:</span>
                    {order.status === "delivered" ? (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[8px] font-bold bg-emerald-200/50 text-emerald-800 border border-emerald-400 uppercase tracking-wide">
                        PAID
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[8px] font-bold bg-amber-200/50 text-[#1a2f52] border border-amber-450 uppercase tracking-wide">
                        UNPAID
                      </span>
                    )}
                  </div>
                </div>

                {/* Items List inside Thermal roll */}
                <div className="space-y-1 bg-white/20 p-2.5 rounded border border-[#1a2f52]/10 font-mono">
                  <div className="text-[8px] font-bold text-[#2c4063] tracking-wider uppercase mb-1">
                    BIDHAA ZILIZOMUNULIWA / ITEMS:
                  </div>
                  <div className="border-t border-[#1a2f52]/20 my-1"></div>
                  {order.items.map((item, idx) => {
                    const itemPid = item.productId || (item as any).id;
                    const associatedProd = productsList.find(
                      (p) => p.id === itemPid,
                    );
                    const associatedSeller = associatedProd?.sellerId
                      ? sellersList.find(
                          (s) => s.id === associatedProd.sellerId,
                        )
                      : null;

                    return (
                      <div
                        key={idx}
                        className="flex justify-between items-start text-[10px] py-1 border-b border-dashed border-[#1a2f52]/10 last:border-b-0 leading-tight"
                      >
                        <div className="flex-1 pr-4">
                          <div className="font-extrabold text-[#1a2f52] uppercase">
                            {item.name}
                          </div>
                          {associatedSeller && (
                            <span className="text-[8px] text-slate-500 font-bold block mt-0.5">
                              S: {associatedSeller.name.toUpperCase()}{" "}
                              {associatedProd?.taxCode
                                ? `[TAX CAT: ${associatedProd.taxCode}]`
                                : ""}
                            </span>
                          )}
                          <div className="text-[9px] text-[#2c4063] mt-0.5 font-mono">
                            {item.quantity} X {formatCurrency(item.price)}
                          </div>
                        </div>
                        <div className="text-right font-black text-[#1a2f52] shrink-0 font-mono">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="space-y-1.5 text-[10px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#2c4063] uppercase">SUBTOTAL:</span>
                    <span className="font-bold text-[#1a2f52]">
                      {formatCurrency(order.total)}
                    </span>
                  </div>

                  {/* Tax Breakdowns */}
                  <div className="flex justify-between text-[#2c4063] text-[9px] uppercase">
                    <span>VAT (18% standard VAT inclusive):</span>
                    <span>
                      {formatCurrency(Math.round(order.total * 0.1525))}
                    </span>
                  </div>

                  <div className="border-t-2 border-double border-[#1a2f52]/40 my-1"></div>
                  <div className="flex justify-between items-center py-1 bg-white/40 px-2 rounded-md">
                    <span className="font-black text-[#1a2f52] uppercase text-[9px] tracking-tight">
                      {lang === "sw" ? "JUMLA KUU (TOTAL):" : "GRAND TOTAL:"}
                    </span>
                    <span className="font-black text-sm text-[#ce2e2e] shrink-0 font-mono">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                  <div className="border-t-2 border-double border-[#1a2f52]/40 my-1"></div>
                </div>

                {/* Real TRA Handshake Verification Printout if verified */}
                {isTraVerified && traInfo ? (
                  <div className="border border-dashed border-[#1a2f52]/40 p-2.5 text-center rounded bg-white/30 text-[9px] my-3 space-y-2 font-mono">
                    <div className="font-extrabold text-[9px] tracking-widest text-[#1a2f52] uppercase text-center pb-1 border-b border-dashed border-[#1a2f52]/20">
                      * RISIT HALALI YA TRA *
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-left text-[#2c4063] leading-normal uppercase">
                      <div>
                        TIN:{" "}
                        <span className="font-bold text-[#1a2f52]">
                          144-893-102
                        </span>
                      </div>
                      <div>
                        USAILI ID:{" "}
                        <span className="font-bold text-[#1a2f52]">
                          TZ054109720023
                        </span>
                      </div>
                      <div>
                        RCT NUM:{" "}
                        <span className="font-bold text-[#1a2f52]">
                          {traInfo.rctnum}
                        </span>
                      </div>
                      <div>
                        Z-NUMBER:{" "}
                        <span className="font-bold text-[#1a2f52]">
                          {traInfo.date?.replace(/-/g, "")}
                        </span>
                      </div>
                      <div>
                        DC:{" "}
                        <span className="font-bold text-[#1a2f52]">
                          {traInfo.dc}
                        </span>
                      </div>
                      <div>
                        GC:{" "}
                        <span className="font-bold text-[#1a2f52]">
                          {traInfo.gc}
                        </span>
                      </div>
                      <div className="col-span-2 mt-0.5">
                        TIME:{" "}
                        <span className="font-bold text-[#1a2f52]">
                          {traInfo.date} {traInfo.time}
                        </span>
                      </div>
                    </div>
                    <div className="text-[7px] text-[#2c4063]/85 bg-white/50 py-1 px-1.5 rounded break-all border border-[#1a2f52]/10 my-1 text-left leading-normal">
                      VFD SIGN: {traInfo.sign || "TRA-RSA-SIGNATURE-COMPLIANT"}
                    </div>
                    <div className="flex flex-col items-center justify-center pt-1.5 border-t border-dashed border-[#1a2f52]/15">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(`https://virtual.tra.go.tz/efdmsRctVerify/${traInfo.rctvnum}`)}`}
                        alt="TRA Verified QR"
                        className="w-24 h-24 object-contain p-1.5 bg-white rounded border border-[#1a2f52]/15"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-[7.5px] text-[#1a2f52] font-black mt-1 tracking-wider uppercase">
                        EFDMS: {traInfo.rctvnum}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Elegant mock EFD status if unpaid or pending sync */
                  <div className="border border-dashed border-[#1a2f52]/20 p-2.5 text-center rounded bg-slate-100/50 text-[9px] my-3 font-mono">
                    <div className="font-black text-[#1a2f52] uppercase tracking-wide">
                      {lang === "sw"
                        ? "● UHAKIKI WA KODI TRA - PENDE"
                        : "● TRA FISCAL STATUS - PENDING"}
                    </div>
                    <p className="text-slate-500 font-medium mt-1 leading-snug">
                      {lang === "sw"
                        ? "Risiti rasmi ya kodi ya EFD na msimbo wa QR vitazalishwa kiotomatiki mara tu oda itakapowasilishwa na kukubaliwa na mteja."
                        : "Official TRA EFD tax receipts and verification QR codes are assigned permanently upon delivery confirmation of your order item."}
                    </p>
                  </div>
                )}

                {inv.terms && (
                  <div className="pt-1.5 text-[9px] leading-relaxed border-b border-dashed border-[#1a2f52]/15 pb-2 font-mono">
                    <div className="font-extrabold text-[#2c4063] text-[8px] uppercase tracking-widest mb-0.5">
                      TERMS OF BUSINESS:
                    </div>
                    <p className="text-[#2c4063] italic leading-snug">
                      {inv.terms.toUpperCase()}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer URL Stamps */}
              <div className="border-t border-[#1a2f52]/20 pt-3 text-center flex flex-col items-center justify-center gap-1 select-none font-mono">
                <div className="flex items-center gap-1 opacity-70">
                  <img
                    src="https://media-stock.orbifinancial.com/OrbiShop_Logo_Blue.png"
                    alt="Orbi logo"
                    className="h-3.5 object-contain filter grayscale contrast-200"
                    referrerPolicy="no-referrer"
                  />
                  <strong className="font-extrabold text-[9px] tracking-tight text-[#1a2f52] uppercase font-mono">
                    Orbi Shop Head Office
                  </strong>
                </div>
                <span className="text-[8px] font-bold text-[#2c4063]/60 tracking-widest">
                  SHOP.ORBIFINANCIAL.COM
                </span>
              </div>
            </div>
          ) : (
            /* Standard Elegant Visual layout */
            <div className="bg-white p-8 md:p-12 print:p-8 relative overflow-hidden flex-1 flex flex-col min-h-0 print:min-h-0">
              <div className="space-y-10 flex-shrink-0">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50/50 rounded-bl-[120px] -z-10 print:hidden font-sans"></div>

                <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-10">
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center whitespace-nowrap gap-1.5 shrink-0">
                      <img
                        src={logoSrc}
                        alt="Logo"
                        className="h-14 md:h-16 object-contain max-w-[140px]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h1 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
                        {inv.companyName || "Orbi Shop"}
                      </h1>
                      <div className="text-xs text-slate-500 mt-1.5 space-y-0.5">
                        {inv.address && (
                          <p className="font-medium">{inv.address}</p>
                        )}
                        {inv.phone && <p className="font-mono">{inv.phone}</p>}
                        {inv.email && <p className="font-mono">{inv.email}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-3xl md:text-4xl font-black text-slate-800 uppercase tracking-tight">
                      {order.status === "delivered"
                        ? lang === "sw"
                          ? "RISITI YA MALIPO"
                          : "PAYMENT RECEIPT"
                        : lang === "sw"
                          ? "ANKARA YA MALIPO"
                          : "INVOICE / BILLING"}
                    </div>
                    <div className="mt-2 text-md font-bold text-slate-600 font-mono">
                      {lang === "sw" ? "Oda #" : "Order #"}
                      {formatOrderNumber(order)}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 font-mono">
                      ID: {order.id}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {lang === "sw" ? "Tarehe: " : "Date: "}{" "}
                      {new Date(order.date).toLocaleDateString(
                        lang === "sw" ? "sw-TZ" : "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </div>
                    <div className="mt-3 flex flex-col items-start md:items-end gap-1.5">
                      {order.status === "delivered" ? (
                        <div className="inline-flex gap-1 items-center px-3 py-1 bg-emerald-100/80 text-emerald-800 font-extrabold text-[10px] rounded-full uppercase tracking-wider border border-emerald-300 shadow-sm animate-pulse">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          {lang === "sw"
                            ? "Malipo Yameachiwa kwa Seller (COMPLETED)"
                            : "Payments Released to Seller (COMPLETED)"}
                        </div>
                      ) : (
                        <div className="inline-flex gap-1 items-center px-3 py-1 bg-amber-50 text-amber-850 font-extrabold text-[10px] rounded-full uppercase tracking-wider border border-amber-250 shadow-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                          {lang === "sw"
                            ? "Inatazamwa / Inachakatwa (PROCESSING)"
                            : "Awaiting / In Processing (INVOICE)"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50/75 p-6 rounded-2xl border border-slate-100 flex flex-col justify-center">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      Imetolewa Kwa:
                    </h3>
                    <p className="font-bold text-lg text-slate-900">
                      {order.customerDetails.name}
                    </p>
                    <p className="text-slate-600 mt-1 font-medium font-mono text-sm">
                      {order.customerDetails.phone}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      {order.customerDetails.address}
                    </p>
                  </div>
                  <div className="bg-slate-50/75 p-6 rounded-2xl border border-slate-100 flex flex-col justify-center">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      Maelezo Kamili ya Malipo:
                    </h3>
                    <p className="whitespace-pre-wrap text-xs text-slate-700 leading-relaxed font-semibold">
                      {(() => {
                        const opts = inv.paymentOptions || [];
                        const method = opts.find(
                          (po: any) => po.id === order.paymentMethod,
                        );
                        if (method) return method.details;

                        const methodByName = opts.find(
                          (po: any) =>
                            po.name === order.paymentMethodName ||
                            po.name === order.paymentMethod,
                        );
                        if (methodByName) return methodByName.details;

                        // Legacy Fallbacks
                        if (order.paymentMethod === "bank")
                          return inv.bankPaymentDetails || "Benki";
                        if (order.paymentMethod === "mobile")
                          return inv.mobilePaymentDetails || "Simu";

                        // Showing options if nothing connects
                        if (opts.length > 0) {
                          return opts
                            .map((po: any) => `${po.name}:\n${po.details}`)
                            .join("\n\n");
                        }

                        return (
                          order.paymentMethodName ||
                          order.paymentMethod ||
                          "Tafadhali wasiliana nasi kwa malipo."
                        );
                      })()}
                    </p>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl overflow-x-auto border border-slate-200 bg-white">
                  <table className="w-full min-w-[600px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs">
                        <th className="py-4 px-4 font-bold text-slate-600 uppercase tracking-wider">
                          Bidhaa / Muuzaji
                        </th>
                        <th className="py-4 px-4 font-bold text-slate-600 uppercase tracking-wider text-center">
                          Idadi
                        </th>
                        <th className="py-4 px-4 font-bold text-slate-600 uppercase tracking-wider text-right">
                          Bei
                        </th>
                        <th className="py-4 px-4 font-bold text-slate-600 uppercase tracking-wider text-right">
                          Jumla Ndogo
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {order.items.map((item, idx) => {
                        const itemPid = item.productId || (item as any).id;
                        const associatedProd = productsList.find(
                          (p) => p.id === itemPid,
                        );
                        const associatedSeller = associatedProd?.sellerId
                          ? sellersList.find(
                              (s) => s.id === associatedProd.sellerId,
                            )
                          : null;

                        return (
                          <tr
                            key={idx}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="py-5 px-4">
                              <span className="font-bold text-slate-900">
                                {item.name}
                              </span>
                              {associatedSeller && (
                                <div className="text-[10px] text-slate-400 mt-1 font-bold">
                                  {lang === "sw" ? "Muuzaji:" : "Seller:"}{" "}
                                  <span className="text-orange-500 font-black">
                                    {associatedSeller.name}
                                  </span>
                                  {associatedSeller.invoiceAddress &&
                                    ` (${associatedSeller.invoiceAddress})`}
                                </div>
                              )}
                            </td>
                            <td className="py-5 px-4 text-center text-slate-600 font-bold font-mono">
                              {item.quantity}
                            </td>
                            <td className="py-5 px-4 text-right text-slate-600 font-bold font-mono">
                              <PriceDisplay
                                amount={item.price}
                                size="sm"
                                colorClass="text-slate-600 font-bold"
                              />
                            </td>
                            <td className="py-5 px-4 text-right font-black text-slate-900 font-mono">
                              <PriceDisplay
                                amount={item.price * item.quantity}
                                size="sm"
                                colorClass="text-slate-900 font-extrabold"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50/70 border-t border-slate-200">
                        <td
                          colSpan={3}
                          className="py-6 px-4 text-right font-bold text-sm text-slate-700 uppercase tracking-wider"
                        >
                          Jumla Kuu:
                        </td>
                        <td className="py-6 px-4 text-right font-black text-xl text-primary font-mono">
                          <PriceDisplay
                            amount={order.total}
                            size="xl"
                            colorClass="text-primary font-black"
                          />
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {inv.terms && (
                  <div className="border-t border-slate-150 pt-6 mt-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                      Masharti & Vigezo:
                    </h3>
                    <p className="text-xs text-slate-500 whitespace-pre-wrap leading-relaxed font-medium">
                      {inv.terms}
                    </p>
                  </div>
                )}
              </div>

              {/* Official Footer logo branding "orbi Shop" with Official URL */}
              <div className="border-t border-slate-100 pt-6 mt-10 text-center flex flex-col items-center justify-center gap-1.5 mt-auto">
                <div className="flex items-center gap-1.5 opacity-80">
                  <img
                    src="https://media-stock.orbifinancial.com/OrbiShop_Logo_Blue.png"
                    alt="Orbi Shop logo"
                    className="h-5 object-contain"
                    referrerPolicy="no-referrer"
                  />
                  <span className="font-extrabold text-[11px] tracking-tight text-slate-800 uppercase font-mono">
                    Orbi Shop
                  </span>
                </div>
                <a
                  href="https://shop.orbifinancial.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-black text-slate-400 hover:text-slate-600 transition tracking-wider font-mono decoration-none"
                >
                  shop.orbifinancial.com
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ContactSection({ lang, user }: { lang: Lang; user: Customer | null }) {
  const { showAlert } = useDialog();
  const [name, setName] = useState(user ? user.name : "");
  const [phone, setPhone] = useState(user ? user.phone : "");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
    } else {
      setName("");
      setPhone("");
    }
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newMsg: Message = {
      id: "MSG-" + Date.now(),
      name,
      phone,
      message: msg,
      date: Date.now(),
      customerId: user ? user.id : undefined,
    };
    await db.saveMessage(newMsg);
    showAlert(t(lang, "contact.success"), "success");
    if (!user) {
      setName("");
      setPhone("");
    }
    setMsg("");
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-10 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8">
      <div className="flex-1 space-y-4">
        <h2 className="text-2xl font-bold">{t(lang, "contact.title")}</h2>
        <p className="text-slate-500">{t(lang, "contact.desc")}</p>
        <div className="pt-4 space-y-3">
          <a
            href="tel:+255764258114"
            className="flex items-center gap-3 text-slate-700 hover:text-primary transition"
          >
            <span className="w-10 h-10 bg-slate-100 flex items-center justify-center rounded-full text-primary">
              <Phone size={20} />
            </span>
            <span className="font-medium">+255 764 258 114</span>
          </a>
          <a
            href="https://wa.me/255764258114"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-slate-700 hover:text-success transition"
          >
            <span className="w-10 h-10 bg-success/10 flex items-center justify-center rounded-full text-success">
              <MessageCircle size={20} />
            </span>
            <span className="font-medium">{t(lang, "contact.wa_support")}</span>
          </a>
          <a
            href="mailto:shop@orbifinancial.com"
            className="flex items-center gap-3 text-slate-700 hover:text-primary transition"
          >
            <span className="w-10 h-10 bg-slate-100 flex items-center justify-center rounded-full text-primary">
              <Mail size={20} />
            </span>
            <span className="font-medium">shop@orbifinancial.com</span>
          </a>
          <a
            href="https://maps.google.com/?q=Kariakoo+Alikoma+na+Magira+Street+Dar+es+Salaam+Tanzania"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-slate-700 hover:text-primary transition"
          >
            <span className="w-10 h-10 bg-slate-100 flex items-center justify-center rounded-full text-primary">
              <MapPin size={20} />
            </span>
            <span className="font-medium">
              Kariakoo Alikoma na Magira Street
            </span>
          </a>
        </div>
      </div>
      <form onSubmit={submit} className="flex-1 space-y-4">
        <input
          required
          type="text"
          placeholder={t(lang, "contact.form.name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-3 rounded-lg outline-none focus:border-accent"
        />
        <input
          required
          type="text"
          placeholder={t(lang, "contact.form.phone")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border p-3 rounded-lg outline-none focus:border-accent"
        />
        <textarea
          required
          placeholder={t(lang, "contact.form.msg")}
          rows={4}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="w-full border p-3 rounded-lg outline-none focus:border-accent"
        ></textarea>
        <button
          type="submit"
          className="bg-primary text-white px-8 py-3 rounded-lg font-medium shadow w-full md:w-auto hover:bg-slate-800 transition"
        >
          {t(lang, "contact.form.btn")}
        </button>
      </form>
    </div>
  );
}

function CheckoutModal({
  cart,
  total,
  user,
  onClose,
  onSuccess,
  onOpenAbout,
  lang,
  availableCoupons,
  onRefresh,
}: any) {
  const [invSettings, setInvSettings] = useState<any>(null);
  const options = invSettings?.paymentOptions || [];

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [customerTin, setCustomerTin] = useState(user?.tin || "");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [step, setStep] = useState(1);
  const [loadingMsg, setLoadingMsg] = useState("");

  // Option 2: Payment Proof Uploader States
  const [lastCreatedOrderId, setLastCreatedOrderId] = useState("");
  const [txId, setTxId] = useState("");
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [pasteSMSText, setPasteSMSText] = useState("");
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [selectedProofImg, setSelectedProofImg] = useState<string | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");

  // USSD Mobile Money Push-to-Pay Integration States
  const [ussdPhone, setUssdPhone] = useState(user?.phone || phone || "");
  const [ussdCarrier, setUssdCarrier] = useState("M-Pesa");
  const [ussdPin, setUssdPin] = useState("");
  const [ussdStatus, setUssdStatus] = useState<
    "idle" | "prompt" | "sending" | "processing" | "success" | "error"
  >("idle");
  const [ussdRefCode, setUssdRefCode] = useState("");
  const [ussdMessage, setUssdMessage] = useState("");

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    let totalDiscount = 0;

    cart.forEach((item: CartItem) => {
      let isApplicable = true;
      if (
        appliedCoupon.applicableProduct &&
        appliedCoupon.applicableProduct !== item.product.id
      ) {
        isApplicable = false;
      }
      if (
        appliedCoupon.applicableCategory &&
        appliedCoupon.applicableCategory !== item.product.category
      ) {
        isApplicable = false;
      }

      const itemPrice = getProductPriceForQty(item.product, item.quantity);
      // Check if product is higher costing (price > 150,000 TSh)
      const isHigherCosting = itemPrice > 150000;

      // Generics are not applicable for higher costing products to avoid abuse.
      // Forced/specific targeting is applicable but capped at 2% discount.
      if (
        isHigherCosting &&
        !appliedCoupon.applicableProduct &&
        !appliedCoupon.applicableCategory
      ) {
        isApplicable = false;
      }

      if (isApplicable) {
        let effPercent = appliedCoupon.discountPercentage;
        if (isHigherCosting) {
          // high cost products discount never exceeds 2%
          effPercent = Math.min(effPercent, 2);
        } else {
          // normal cost products discount is capped at maximum 10%
          effPercent = Math.min(effPercent, 10);
        }
        totalDiscount += itemPrice * (effPercent / 100) * item.quantity;
      }
    });

    return Math.round(totalDiscount);
  }, [appliedCoupon, cart]);

  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [redeemAllActive, setRedeemAllActive] = useState(false);

  const userPoints = useMemo(() => {
    return user ? getLoyaltyPoints(user.id) : 0;
  }, [user]);

  const currentPointsWorth = useMemo(() => {
    return invSettings?.pointsWorth !== undefined
      ? Number(invSettings.pointsWorth)
      : 10;
  }, [invSettings]);

  const currentPointsRate = useMemo(() => {
    return invSettings?.pointsRate !== undefined
      ? Number(invSettings.pointsRate)
      : 1;
  }, [invSettings]);

  const pointsRequiredPerTzsDiscount = useMemo(() => {
    return invSettings?.pointsRequiredPerTzsDiscount !== undefined
      ? Number(invSettings.pointsRequiredPerTzsDiscount)
      : 10;
  }, [invSettings]);

  // Points are fully, 100% applicable for real shopping to cover up to full cart offset!
  const cartThresholds = useMemo(() => {
    const maxAllowedDisTzs = total;
    const maxPtsToRedeem = Math.ceil(
      maxAllowedDisTzs * pointsRequiredPerTzsDiscount,
    );

    return {
      maxAllowedDiscountTzs: Math.round(maxAllowedDisTzs),
      maxAllowedPointsToRedeem: maxPtsToRedeem,
    };
  }, [total, pointsRequiredPerTzsDiscount]);

  const pointsDiscount = useMemo(() => {
    if (pointsToRedeem <= 0) return 0;
    const equivalentCashVal = pointsToRedeem / pointsRequiredPerTzsDiscount;
    return Math.min(
      Math.round(equivalentCashVal),
      cartThresholds.maxAllowedDiscountTzs,
    );
  }, [pointsToRedeem, pointsRequiredPerTzsDiscount, cartThresholds]);

  const finalTotal = Math.max(0, total - discountAmount - pointsDiscount);

  useEffect(() => {
    db.getInvoiceSettings().then((res) => {
      setInvSettings(res);
      if (res.paymentOptions && res.paymentOptions.length > 0) {
        setPaymentMethod(res.paymentOptions[0].id);
      }
    });
  }, []);

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingMsg(t(lang, "checkout.loading"));

    try {
      const resp = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          user,
          paymentMethod,
          appliedCoupon,
          finalTotal,
          name,
          phone,
          address,
          options,
          tin: customerTin,
          lang,
        }),
      });
      const data = await resp.json();

      if (data.success) {
        if (user) {
          const currentPoints = getLoyaltyPoints(user.id);
          const pointsEarned = Math.floor(
            (finalTotal * currentPointsRate) / 1000,
          );
          const nextPointsBalance = Math.max(
            0,
            currentPoints - pointsToRedeem + pointsEarned,
          );
          saveLoyaltyPoints(user.id, nextPointsBalance);
        }

        // Track checkout completion event
        const sid =
          localStorage.getItem("orbi_visitor_session_id") ||
          (() => {
            const newSid =
              "v-" + Math.random().toString(36).substring(2, 11).toUpperCase();
            localStorage.setItem("orbi_visitor_session_id", newSid);
            return newSid;
          })();
        fetch("/api/analytics/visitors/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sid,
            action: "checkout_complete",
            orderTotal: finalTotal,
            purchasedProducts: cart.map((item: any) => ({
              id: item.product.id,
              name: item.product.name,
              quantity: item.quantity,
              category: item.product.category,
              niche: item.product.niche,
              sellerId: item.product.sellerId,
            })),
          }),
        }).catch((e) =>
          console.warn("Analytics checkout completed log failed", e),
        );

        setLastCreatedOrderId(data.baseOrderId);
        setLoadingMsg("");
        setStep(2);
      } else {
        alert("Failed to process order securely.");
        setLoadingMsg("");
      }
    } catch (e) {
      console.error(e);
      setLoadingMsg("");
    }
  };

  const applyCoupon = () => {
    setCouponError("");
    if (!couponCode.trim()) return;

    const c = availableCoupons.find(
      (x: Coupon) => x.code === couponCode.toUpperCase(),
    );

    if (!c) {
      setCouponError(lang === "sw" ? "Kuponi haipo" : "Invalid coupon");
      return;
    }
    if (c.isUsed) {
      setCouponError(
        lang === "sw" ? "Kuponi ishatumika" : "Coupon already used",
      );
      return;
    }
    if (!c.active) {
      setCouponError(lang === "sw" ? "Kuponi haitumiki" : "Inactive coupon");
      return;
    }
    if (new Date(c.expiresAt).getTime() < Date.now()) {
      setCouponError(lang === "sw" ? "Kuponi ishaisha muda" : "Expired coupon");
      return;
    }

    if (c.targetCustomer && user?.id !== c.targetCustomer) {
      setCouponError(
        lang === "sw" ? "Kuponi hii ni kwa mteja maalumu" : "Coupon restricted",
      );
      return;
    }

    setAppliedCoupon(c);
  };

  if (!invSettings)
    return (
      <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white p-6 rounded text-center shadow-lg font-medium">
          {t(lang, "checkout.loading_init")}
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full h-full sm:rounded-xl sm:max-w-md overflow-y-auto sm:max-h-[95vh] relative flex flex-col">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 z-[10]"
        >
          <X size={20} />
        </button>

        {step === 1 ? (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Malizia Oda</h2>

            {/* Coupon Field */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder={
                  lang === "sw" ? "Msimbo wa Punguzo" : "Coupon Code"
                }
                className="w-full border border-slate-200 outline-none p-2 rounded-lg text-sm"
                disabled={!!appliedCoupon}
              />
              {!appliedCoupon ? (
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg text-sm font-bold transition"
                >
                  Apply
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponCode("");
                  }}
                  className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-bold transition"
                >
                  Remove
                </button>
              )}
            </div>
            {couponError && (
              <p className="text-red-500 text-xs mb-3 font-medium mt-[-10px] ml-1">
                {couponError}
              </p>
            )}
            {appliedCoupon && (
              <div className="mb-3 mt-[-10px] ml-1 flex flex-col gap-1">
                <p className="text-green-600 text-xs font-bold leading-none">
                  {lang === "sw"
                    ? `Kuponi inatumika: -${appliedCoupon.discountPercentage}% punguzo`
                    : `Coupon applied: -${appliedCoupon.discountPercentage}% discount`}
                </p>
                {cart.some(
                  (item) =>
                    getProductPriceForQty(item.product, item.quantity) > 150000,
                ) && (
                  <p className="text-amber-600 text-[10px] sm:text-[10.5px] leading-tight font-semibold">
                    {lang === "sw"
                      ? "* Bidha za Thamani Kubwa (>150k TZS) zina kikomo cha 2% cha punguzo pekee."
                      : "* Premium products (>150k TZS) are capped at a safe 2% discount max."}
                  </p>
                )}
                {cart.some(
                  (item) =>
                    getProductPriceForQty(item.product, item.quantity) <=
                    150000,
                ) && (
                  <p className="text-emerald-700 text-[10px] sm:text-[10.5px] leading-tight font-medium">
                    {lang === "sw"
                      ? "* Hakuna bidhaa inayozidi 10% ya punguzo la thamani yake."
                      : "* Standard items are limited to a maximum 10% individual discount."}
                  </p>
                )}
              </div>
            )}

            {/* Interactive Coupon Board for Unused and Used Rewards */}
            {user && (
              <div className="mb-4 bg-slate-50 border border-slate-200/60 rounded-xl p-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                  <span>
                    {lang === "sw"
                      ? "Mbao la Kuponi Zako"
                      : "Your Coupon Wallet"}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {lang === "sw" ? "Mwitikio wa Papo Hapo" : "Real-time sync"}
                  </span>
                </h3>

                {(() => {
                  const myCoupons = (availableCoupons || []).filter(
                    (c: any) =>
                      c.targetCustomer === user.id ||
                      c.target_customer === user.id,
                  );

                  if (myCoupons.length === 0) {
                    return (
                      <p className="text-[10.5px] text-slate-500 italic">
                        {lang === "sw"
                          ? "Huna kuponi zilizokombolewa bado. Komboa alama zako kwenye wasifu ili upate kuponi hapa!"
                          : "No claimed coupons yet. Redeem points in your profile to generate discount coupons!"}
                      </p>
                    );
                  }

                  const unused = myCoupons.filter(
                    (c: any) => !c.isUsed && !c.used,
                  );
                  const used = myCoupons.filter((c: any) => c.isUsed || c.used);

                  // Helper to predict coupon value on the cart
                  const getPotentialSavings = (cpn: any) => {
                    let savings = 0;
                    cart.forEach((item: any) => {
                      let isCpnApplicable = true;
                      if (
                        cpn.applicableProduct &&
                        cpn.applicableProduct !== item.product.id
                      ) {
                        isCpnApplicable = false;
                      }
                      if (
                        cpn.applicableCategory &&
                        cpn.applicableCategory !== item.product.category
                      ) {
                        isCpnApplicable = false;
                      }
                      const itemPrice = getProductPriceForQty(
                        item.product,
                        item.quantity,
                      );
                      const isHighCost = itemPrice > 150000;
                      if (
                        isHighCost &&
                        !cpn.applicableProduct &&
                        !cpn.applicableCategory
                      ) {
                        isCpnApplicable = false;
                      }
                      if (isCpnApplicable) {
                        const effPct = isHighCost
                          ? Math.min(cpn.discountPercentage, 2)
                          : Math.min(cpn.discountPercentage, 10);
                        savings += itemPrice * (effPct / 100) * item.quantity;
                      }
                    });
                    return Math.round(savings);
                  };

                  return (
                    <div className="space-y-3 font-sans text-xs">
                      {/* Unused / Redeemable section */}
                      {unused.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-black text-amber-800 tracking-wide uppercase">
                            {lang === "sw"
                              ? "● Kuponi Hazijatumika (Gusa ili Ufute/Uweke)"
                              : "● Unused Coupons (Click to toggle)"}
                          </p>
                          <div className="grid grid-cols-1 gap-1.5">
                            {unused.map((cpn: any) => {
                              const isActive = appliedCoupon?.code === cpn.code;
                              const potentialSave = getPotentialSavings(cpn);
                              return (
                                <button
                                  key={cpn.code}
                                  type="button"
                                  onClick={() => {
                                    if (isActive) {
                                      setAppliedCoupon(null);
                                      setCouponCode("");
                                    } else {
                                      setAppliedCoupon(cpn);
                                      setCouponCode(cpn.code);
                                      setCouponError("");
                                    }
                                  }}
                                  className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                                    isActive
                                      ? "bg-amber-100/50 border-amber-400 shadow-sm"
                                      : "bg-white border-slate-200 hover:border-slate-350"
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center gap-1">
                                      <span className="font-bold text-slate-800 text-[11px] font-mono">
                                        {cpn.code}
                                      </span>
                                      <span className="bg-amber-150 text-amber-900 border border-amber-200 text-[9px] px-1 rounded-full font-black">
                                        {cpn.discountPercentage}% OFF
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                                      {lang === "sw"
                                        ? `Okoa hadi ${cpn.discountPercentage}% ya bei kwa kuponi hii`
                                        : `Use coupon to save up to ${cpn.discountPercentage}% of product price`}
                                    </p>
                                    {potentialSave > 0 && (
                                      <p className="text-[10px] text-green-700 font-bold leading-none mt-0.5 animate-pulse">
                                        {lang === "sw"
                                          ? `Okoa ${formatCurrency(potentialSave)} sasa hivi!`
                                          : `Saves you ${formatCurrency(potentialSave)} on this cart!`}
                                      </p>
                                    )}
                                  </div>
                                  <div className="shrink-0">
                                    <span
                                      className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${
                                        isActive
                                          ? "bg-amber-550 text-white"
                                          : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {isActive
                                        ? lang === "sw"
                                          ? "Imewekwa"
                                          : "In Use"
                                        : lang === "sw"
                                          ? "Tayari"
                                          : "Unused"}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Previously Used Rewards section */}
                      {used.length > 0 && (
                        <div className="space-y-1.5 opacity-60 border-t border-slate-200 pt-2">
                          <p className="text-[9.5px] font-bold text-slate-500 tracking-wide uppercase">
                            {lang === "sw"
                              ? "✓ Vocha Zilizotumika / Zilizofungwa"
                              : "✓ Used / Claimed Vouchers"}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {used.map((cpn: any) => (
                              <div
                                key={cpn.code}
                                className="bg-slate-150 border border-slate-200 text-slate-500 px-2 py-1 rounded-md text-[10px] inline-flex items-center gap-1 line-through"
                                title="Coupon already used for a previous purchase"
                              >
                                <span className="font-mono font-bold">
                                  {cpn.code}
                                </span>
                                <span className="text-[8.5px] uppercase bg-slate-200 text-slate-600 px-1 rounded">
                                  {lang === "sw" ? "Isha-tumika" : "Used"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Loyalty points card section */}
            {!user ? (
              <div className="bg-amber-50/70 border border-amber-200/30 rounded-xl p-3 mb-4 text-xs text-amber-800 flex flex-col gap-1 shadow-sm">
                <div className="font-bold flex items-center gap-1 text-amber-900">
                  <Sparkles
                    size={13}
                    className="text-amber-500 animate-pulse"
                  />
                  {lang === "sw"
                    ? "Pata Alama za Uaminifu!"
                    : "Earn Loyalty Points!"}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {lang === "sw"
                    ? "Jisajili au ingia ili upate alama za uaminifu kwa kila ununuzi na kupata punguzo la bei!"
                    : "Register or login to earn points on every purchase and redeem them for cash discounts!"}
                </p>
              </div>
            ) : (
              <div className="bg-amber-50/70 border border-amber-200/30 rounded-xl p-3 mb-4 shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                    <Gift size={15} className="text-amber-600" />
                    <span>
                      {lang === "sw" ? "Alama za Uaminifu" : "Loyalty Rewards"}
                    </span>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-black">
                    {userPoints} {lang === "sw" ? "Alama" : "Pts"}
                  </span>
                </div>

                {userPoints > 0 ? (
                  <div className="space-y-3 mt-1 font-sans">
                    <div className="text-[11px] text-slate-600 bg-white/50 p-2 rounded-lg border border-amber-200/20 leading-relaxed font-semibold">
                      <p className="flex justify-between border-b pb-1 mb-1 border-amber-200/10 text-slate-700">
                        <span>
                          {lang === "sw"
                            ? "Uwiano wa Alama:"
                            : "Points Value Formula:"}
                        </span>
                        <span className="text-amber-800 font-bold">
                          {pointsRequiredPerTzsDiscount}{" "}
                          {lang === "sw" ? "Alama = TSh 1" : "Pts = TSh 1"}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        {lang === "sw"
                          ? `* Alama zako ni halali kabisa kwa oda hii! Unaweza kuzitumia kama punguzo la moja kwa moja ili kupunguza au kulipia gharama yote ya kikapu chako.`
                          : `* Your loyalty points are 100% real and applicable! You can use them to get direct cash-equivalent discounts on this purchase, up to the full cart total.`}
                      </p>
                    </div>

                    {/* Accurate Slider Widget */}
                    <div className="p-2 border rounded-xl bg-white shadow-inner space-y-2">
                      <div className="flex justify-between items-center text-xs font-black">
                        <span className="text-slate-600 uppercase tracking-wider">
                          {lang === "sw"
                            ? "Kiasi cha kukomboa"
                            : "Redeem Amount"}
                        </span>
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {pointsToRedeem.toLocaleString()} Pts (=
                          {formatCurrency(pointsDiscount)})
                        </span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max={Math.min(
                          userPoints,
                          cartThresholds.maxAllowedPointsToRedeem,
                        )}
                        value={pointsToRedeem}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 0;
                          setPointsToRedeem(val);
                        }}
                        className="w-full h-1.5 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-600 outline-none transition"
                      />

                      {/* Quick select presets */}
                      <div className="flex gap-1.5 pt-1">
                        {[
                          { label: "0%", fraction: 0 },
                          { label: "25%", fraction: 0.25 },
                          { label: "50%", fraction: 0.5 },
                          { label: "75%", fraction: 0.75 },
                          { label: "100%", fraction: 1.0 },
                        ].map((preset) => {
                          const maxRedeemableVal = Math.min(
                            userPoints,
                            cartThresholds.maxAllowedPointsToRedeem,
                          );
                          const targetPoints = Math.round(
                            maxRedeemableVal * preset.fraction,
                          );
                          const isActive = pointsToRedeem === targetPoints;

                          return (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setPointsToRedeem(targetPoints)}
                              className={`flex-1 py-1 text-[10px] font-black uppercase rounded-md tracking-wide transition border ${
                                isActive
                                  ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                                  : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                              }`}
                            >
                              {preset.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 italic mt-0.5">
                    {lang === "sw"
                      ? "Mizani yako ni 0. Agiza sasa upate alama mpya!"
                      : "Points balance is 0. Order now to earn your first loyalty reward!"}
                  </p>
                )}
              </div>
            )}

            <div className="bg-slate-50 p-3 rounded text-sm mb-4 border border-slate-100 flex flex-col gap-1.5 shadow-sm">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Subtotal:</span>
                <span>
                  <PriceDisplay
                    amount={total}
                    size="sm"
                    colorClass="text-slate-500"
                  />
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between items-center text-xs text-red-600 font-medium">
                  <span>Coupon Discount:</span>
                  <span className="flex items-center gap-0.5">
                    -
                    <PriceDisplay
                      amount={discountAmount}
                      size="sm"
                      colorClass="text-red-600"
                    />
                  </span>
                </div>
              )}
              {pointsDiscount > 0 && (
                <div className="flex justify-between items-center text-xs text-amber-600 font-bold">
                  <span>Loyalty Discount:</span>
                  <span className="flex items-center gap-0.5">
                    -
                    <PriceDisplay
                      amount={pointsDiscount}
                      size="sm"
                      colorClass="text-amber-600"
                    />
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 mt-1">
                <span className="font-bold text-slate-700">
                  Jumla Inayolipwa:
                </span>
                <span className="font-black text-accent text-lg">
                  <PriceDisplay
                    amount={finalTotal}
                    size="lg"
                    colorClass="text-accent"
                  />
                </span>
              </div>
            </div>
            <form onSubmit={confirm} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-slate-500">
                  Jina Kamili
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border p-2.5 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-slate-500">
                  Namba ya Simu
                </label>
                <input
                  required
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border p-2.5 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-slate-500">
                  {lang === "sw"
                    ? "Namba ya TIN (Hiari)"
                    : "TIN Number (Optional)"}
                </label>
                <input
                  type="text"
                  value={customerTin}
                  onChange={(e) => setCustomerTin(e.target.value)}
                  className="w-full border p-2.5 rounded-lg outline-none"
                  placeholder="e.g. 144893102"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-slate-500">
                  Anwani ya Kufikisha (Location)
                </label>
                <textarea
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border p-2.5 rounded-lg outline-none"
                  rows={2}
                  placeholder={
                    lang === "sw"
                      ? "Weka anwani yako ya kufikishiwa mzigo..."
                      : "Enter your physical delivery address..."
                  }
                ></textarea>

                {/* Interactive Store Locator & Carrier Map */}
                <div className="mt-2 bg-slate-900 text-white p-3 rounded-xl border border-slate-750 flex flex-col gap-2 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black tracking-wide text-orange-400 uppercase flex items-center gap-1 font-sans">
                      <MapPin
                        size={12}
                        className="text-orange-500 animate-bounce"
                      />
                      <span>
                        {lang === "sw"
                          ? "Kituo cha Kupokelea & Usafirishaji"
                          : "Pickup Locator & Delivery Speed"}
                      </span>
                    </span>
                    <span className="text-[9px] bg-white/10 text-slate-300 font-bold px-1.5 py-0.5 rounded font-mono">
                      {lang === "sw" ? "Gari / Meli" : "Courier Transit"}
                    </span>
                  </div>

                  {/* Tanzania stylized mini SVG Map */}
                  <div className="relative h-28 bg-slate-950 rounded-lg overflow-hidden border border-white/5 flex items-center justify-center">
                    <svg
                      viewBox="0 0 320 180"
                      className="w-full h-full opacity-90"
                    >
                      {/* Stylized TZ map */}
                      <path
                        d="M 60,10 L 220,15 L 280,100 L 270,170 L 130,165 L 50,110 Z"
                        fill="#1e293b"
                        stroke="#334155"
                        strokeWidth="1.5"
                        strokeDasharray="3"
                      />
                      {/* Water bodies */}
                      <circle
                        cx="110"
                        cy="15"
                        r="12"
                        fill="#0274b7"
                        opacity="0.4"
                      />
                      <path
                        d="M 45,50 Q 25,110 35,150"
                        fill="none"
                        stroke="#0274b7"
                        strokeWidth="5"
                        opacity="0.3"
                        strokeLinecap="round"
                      />

                      {/* Hub Pin connections */}
                      <path
                        d="M 90,45 L 190,55 L 160,115 L 240,165 L 260,150"
                        fill="none"
                        stroke="#ea580c"
                        strokeWidth="1"
                        strokeDasharray="2"
                        opacity="0.25"
                      />

                      {/* Map Pins */}
                      {[
                        {
                          id: "dar-kariakoo",
                          label: "Kariakoo",
                          x: 260,
                          y: 150,
                        },
                        { id: "dar-mbezi", label: "Mbezi", x: 240, y: 165 },
                        { id: "posta-mpya", label: "Posta", x: 275, y: 140 },
                        { id: "arusha-clock", label: "Arusha", x: 190, y: 55 },
                        { id: "mwanza-capri", label: "Mwanza", x: 90, y: 45 },
                        { id: "dodoma-cath", label: "Dodoma", x: 160, y: 115 },
                      ].map((p) => {
                        const hub = [
                          {
                            id: "dar-kariakoo",
                            address:
                              "Kariakoo Hub - Dar es Salaam, Mtaa wa Swahili, Plot 42",
                          },
                          {
                            id: "dar-mbezi",
                            address:
                              "Mbezi Terminal Hub - Dar es Salaam, Morogoro Road",
                          },
                          {
                            id: "posta-mpya",
                            address:
                              "Posta Mpya Hub - Dar es Salaam, Ghorofa ya Makumbusho",
                          },
                          {
                            id: "arusha-clock",
                            address:
                              "Clocktower Hub - Arusha Town, Boma Road Roundabout",
                          },
                          {
                            id: "mwanza-capri",
                            address:
                              "Capri Point Hub - Mwanza City, Lake Zone Area",
                          },
                          {
                            id: "dodoma-cath",
                            address:
                              "Capital Cathedral Hub - Dodoma, Cathedral Hill, Uhuru Way",
                          },
                        ].find((h) => h.id === p.id);
                        const isSelected =
                          address === hub?.address || address.includes(p.label);
                        return (
                          <g
                            key={p.id}
                            className="cursor-pointer"
                            onClick={() => {
                              if (hub) {
                                setAddress(hub.address);
                              }
                            }}
                          >
                            {isSelected && (
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r="8"
                                className="fill-orange-500/30 stroke-orange-500 animate-pulse"
                                strokeWidth="0.5"
                              />
                            )}
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="4"
                              className={`${isSelected ? "fill-orange-500 stroke-white" : "fill-slate-400 stroke-slate-500"} transition-all`}
                              strokeWidth="1"
                            />
                            <text
                              x={p.x}
                              y={p.y - 6}
                              textAnchor="middle"
                              className="text-[8px] font-black fill-slate-350 pointer-events-none tracking-tight font-sans"
                            >
                              {p.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Option pills list */}
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      {
                        id: "dar-kariakoo",
                        shortLabelSw: "Kariakoo",
                        shortLabelEn: "Kariakoo Hub",
                        address:
                          "Kariakoo Hub - Dar es Salaam, Mtaa wa Swahili, Plot 42",
                        cost: 2000,
                      },
                      {
                        id: "dar-mbezi",
                        shortLabelSw: "Mbezi Mwisho",
                        shortLabelEn: "Mbezi Terminal",
                        address:
                          "Mbezi Terminal Hub - Dar es Salaam, Morogoro Road",
                        cost: 4000,
                      },
                      {
                        id: "posta-mpya",
                        shortLabelSw: "Posta Mpya",
                        shortLabelEn: "Posta Mpya Hub",
                        address:
                          "Posta Mpya Hub - Dar es Salaam, Ghorofa ya Makumbusho",
                        cost: 3000,
                      },
                      {
                        id: "arusha-clock",
                        shortLabelSw: "Arusha Town",
                        shortLabelEn: "Arusha Clock",
                        address:
                          "Clocktower Hub - Arusha Town, Boma Road Roundabout",
                        cost: 6000,
                      },
                      {
                        id: "mwanza-capri",
                        shortLabelSw: "Mwanza Town",
                        shortLabelEn: "Mwanza Capri",
                        address:
                          "Capri Point Hub - Mwanza City, Lake Zone Area",
                        cost: 8000,
                      },
                      {
                        id: "dodoma-cath",
                        shortLabelSw: "Dodoma Hub",
                        shortLabelEn: "Dodoma Capital",
                        address:
                          "Capital Cathedral Hub - Dodoma, Cathedral Hill, Uhuru Way",
                        cost: 5000,
                      },
                    ].map((opt) => {
                      const isSelected = address === opt.address;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setAddress(opt.address)}
                          className={`px-1.5 py-1 text-[9px] font-bold rounded-lg border transition-all text-center leading-tight cursor-pointer font-sans ${
                            isSelected
                              ? "bg-orange-500 border-orange-400 text-white"
                              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
                          }`}
                        >
                          <div className="font-extrabold truncate">
                            {lang === "sw"
                              ? opt.shortLabelSw
                              : opt.shortLabelEn}
                          </div>
                          <div className="text-[8px] opacity-80 font-normal">
                            +{formatCurrency(opt.cost)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-slate-500">
                  Njia ya Kulipia
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border p-2.5 rounded-lg outline-none"
                >
                  {options.length > 0 ? (
                    options.map((o: any) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="mobile">
                        Kwa Simu (M-Pesa, Tigo Pesa, nk.)
                      </option>
                      <option value="bank">Kwa Benki (CRDB, NMB, nk.)</option>
                    </>
                  )}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-lg font-bold mt-2"
              >
                {t(lang, "checkout.form.btn_confirm")}
              </button>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2 items-center text-center">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  {lang === "sw" ? "Inalindwa na " : "Secured by "}
                  <button
                    type="button"
                    onClick={() => onOpenAbout?.("security")}
                    className="text-amber-600 font-bold hover:underline"
                  >
                    Orbi PaySafe Guarantee
                  </button>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
                  <button
                    type="button"
                    onClick={() => onOpenAbout?.("buyer")}
                    className="hover:text-amber-500 hover:underline transition"
                  >
                    {lang === "sw"
                      ? "Soma Sera ya Ulinzi wa Mnunuzi"
                      : "Read Buyer Protection Policy"}
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => onOpenAbout?.("terms")}
                    className="hover:text-amber-500 hover:underline transition"
                  >
                    {lang === "sw" ? "Vigezo & Masharti" : "Terms & Conditions"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-6 text-center space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
              <Check size={28} />
            </div>

            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              {t(lang, "checkout.success")}
            </h2>
            <p className="text-slate-500 text-xs">
              {t(lang, "checkout.success_desc")}
            </p>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left text-xs space-y-2">
              <p className="font-extrabold text-slate-700 tracking-wide border-b pb-1.5 flex items-center justify-between uppercase">
                <span>{t(lang, "checkout.payment_inst")}</span>
                <span className="text-[10px] text-orange-600 font-mono">
                  ID: {lastCreatedOrderId}
                </span>
              </p>

              <div className="space-y-1 text-slate-600 font-medium">
                <p className="flex justify-between">
                  <span>
                    {lang === "sw" ? "Jumla ya Agizo:" : "Order Total:"}
                  </span>
                  <strong className="text-sm text-slate-800 font-black">
                    <PriceDisplay
                      amount={finalTotal}
                      size="sm"
                      colorClass="text-slate-800"
                    />
                  </strong>
                </p>
                <div className="pt-2 text-[11px] leading-relaxed text-slate-500 whitespace-pre-wrap font-sans border-t border-slate-100 mt-1">
                  {(() => {
                    const method = options.find(
                      (po: any) => po.id === paymentMethod,
                    );
                    if (method) return method.details;

                    const methodByName = options.find(
                      (po: any) => po.name === paymentMethod,
                    );
                    if (methodByName) return methodByName.details;

                    if (paymentMethod === "bank")
                      return (
                        invSettings?.bankPaymentDetails ||
                        "Benki details zitawekwa hapa."
                      );
                    if (paymentMethod === "mobile")
                      return (
                        invSettings?.mobilePaymentDetails ||
                        "Simu details zitawekwa hapa."
                      );

                    return "Tutawasiliana nawe hivi punde kufanikisha malipo.";
                  })()}
                </div>
              </div>
            </div>

            {/* Option 2: Payment Proof submission section */}
            <div className="bg-gradient-to-tr from-amber-500/10 to-orange-500/5 border border-orange-500/20 p-4 rounded-2xl text-left space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 text-orange-500/10 pointer-events-none">
                <Coins size={80} />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-xs">
                  💰
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    {lang === "sw"
                      ? "Uhakiki wa Malipo Haraka"
                      : "Express Payment Verification"}
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    {lang === "sw"
                      ? "Weka uthibitisho upate idhini mara moja"
                      : "Upload proof to instantly verify your ledger"}
                  </p>
                </div>
              </div>

              {!proofSubmitted ? (
                <div className="space-y-3 pt-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={
                        lang === "sw"
                          ? "Mfano: PP26061109403 au Kumbukumbu ID"
                          : "e.g. PP26061109403 or Reference ID"
                      }
                      value={txId}
                      onChange={(e) => setTxId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-3 pr-16 text-xs outline-none focus:border-amber-500 font-mono uppercase font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSMSModal(true)}
                      className="absolute right-1.5 top-1.5 bg-amber-50 hover:bg-amber-100 text-orange-600 font-bold px-2 py-1 rounded-lg text-[9px] border border-orange-200 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles size={10} className="animate-pulse" />
                      {lang === "sw" ? "Soma SMS" : "SMS AI"}
                    </button>
                  </div>

                  {showSMSModal && (
                    <div className="bg-slate-900 text-white p-3.5 rounded-xl space-y-2.5 text-xs animate-in slide-in-from-top-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold tracking-wide uppercase text-[10px] text-amber-400">
                          {lang === "sw"
                            ? "Bandika SMS ya Malipo (AI OCR)"
                            : "Paste Payment SMS Receipt"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowSMSModal(false)}
                          className="text-slate-400 hover:text-white font-extrabold text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        placeholder={
                          lang === "sw"
                            ? "Bandika meseji ya M-Pesa au benki hapa ..."
                            : "Paste your mobile money SMS transcript here..."
                        }
                        value={pasteSMSText}
                        onChange={(e) => setPasteSMSText(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-[10px] outline-none text-slate-200"
                      />
                      <div className="flex justify-end items-center text-[9px]">
                        <button
                          type="button"
                          onClick={() => {
                            if (!pasteSMSText.trim()) return;
                            setIsOcrLoading(true);
                            setTimeout(() => {
                              const match = pasteSMSText.match(
                                /\b([A-Z0-9]{10,12})\b/i,
                              );
                              if (match) {
                                setTxId(match[1].toUpperCase());
                              } else {
                                const fallback =
                                  pasteSMSText.match(/\b([A-Z0-9]{8,15})\b/i);
                                if (fallback) {
                                  setTxId(fallback[1].toUpperCase());
                                }
                              }
                              setIsOcrLoading(false);
                              setShowSMSModal(false);
                            }, 800);
                          }}
                          disabled={isOcrLoading}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-2.5 py-1 rounded text-[10px] transition disabled:opacity-50"
                        >
                          {isOcrLoading ? "Parsing..." : "Extract ID"}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={async () => {
                      if (!txId.trim()) return;
                      const proofs = JSON.parse(
                        localStorage.getItem("orbi_payment_proofs") || "{}",
                      );
                      proofs[lastCreatedOrderId] = {
                        transactionId: txId.trim().toUpperCase(),
                        timestamp: Date.now(),
                        amount: finalTotal,
                        method: paymentMethod,
                        status: "pending_verification",
                      };
                      localStorage.setItem(
                        "orbi_payment_proofs",
                        JSON.stringify(proofs),
                      );
                      setProofSubmitted(true);
                      try {
                        await db.saveOrder({
                          id: lastCreatedOrderId,
                          paymentReference: txId.trim().toUpperCase(),
                        });
                        if (onRefresh) onRefresh();
                      } catch (err) {
                        console.error(
                          "Failed to save payment reference to DB at checkout:",
                          err,
                        );
                      }
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-[11px] py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-orange-500/10"
                  >
                    <CheckCircle2 size={13} />
                    {lang === "sw"
                      ? "Wasilisha Ushahidi sasa"
                      : "Submit Reference Proof"}
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-1 text-emerald-800 animate-in zoom-in-95 font-medium">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                    <Sparkles
                      size={14}
                      className="text-emerald-600 animate-spin"
                    />
                    <span>
                      {lang === "sw"
                        ? "Ushahidi Umepokewa!"
                        : "Verification Submitted!"}
                    </span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-emerald-600">
                    {lang === "sw"
                      ? "Namba ya muamala imerekodiwa (" +
                        txId.toUpperCase() +
                        "). Wasimamizi wetu wanahakiki salio kufungulia oda yako sasa hivi."
                      : "Transaction ID recorded (" +
                        txId.toUpperCase() +
                        "). Cash holds are audited before dispatching your package."}
                  </p>
                </div>
              )}
            </div>

            {user && (
              <div className="bg-amber-50/70 border border-amber-200/35 p-3.5 rounded-xl text-center flex flex-col gap-1 shadow-sm max-w-sm mx-auto my-3 animate-in fade-in duration-300">
                <span className="text-[10px] uppercase font-black text-amber-700 tracking-wider leading-none">
                  {lang === "sw" ? "Zawadi za Loyalty" : "Loyalty Rewards"}
                </span>
                <span className="text-lg font-black text-amber-900 leading-none my-1">
                  +{Math.floor((finalTotal * currentPointsRate) / 1000)}{" "}
                  {lang === "sw" ? "Alama Mpya!" : "New Points!"}
                </span>
                <p className="text-[11px] text-amber-800">
                  {lang === "sw"
                    ? `Sasa unazo jumla ya alama ${getLoyaltyPoints(user.id)} za uaminifu kwenye akaunti yako.`
                    : `You now have a total of ${getLoyaltyPoints(user.id)} loyalty points in your account.`}
                </p>
              </div>
            )}

            <button
              onClick={() => {
                onClose();
                onSuccess();
              }}
              className="mt-4 w-full bg-slate-200 hover:bg-slate-300 text-slate-800 py-3 rounded-2xl font-bold transition text-sm cursor-pointer"
            >
              {t(lang, "checkout.success_btn")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AuthModal({
  mode,
  lang,
  onClose,
  onSwitch,
  onSuccess,
  onOpenAbout,
  onApplySeller,
}: any) {
  const { showAlert } = useDialog();
  const [localMode, setLocalMode] = useState<
    "login" | "register" | "forgot" | "reset"
  >(mode);
  const [selectedRole, setSelectedRole] = useState<
    "buyer" | "seller" | "staff"
  >("buyer");
  const [resetCustomerId, setResetCustomerId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tin, setTin] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const getValidEmail = (input: string) => {
    if (input.includes("@")) return input.trim().toLowerCase();
    const cleanPhone = input.replace(/\D/g, "");
    return `${cleanPhone}@orbishopcustomers.com`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let authError = null;

    if (localMode === "login") {
      let isSupabaseAuthenticated = false;
      if (emailOrPhone.includes("@") || selectedRole !== "buyer") {
        const loginEmail = emailOrPhone.includes("@")
          ? emailOrPhone.trim().toLowerCase()
          : getValidEmail(emailOrPhone);

        // Strict Login flow for Backend APIs
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: loginEmail, password }),
          });
          const authData = await res.json();

          if (!authData.success) {
            authError = { message: authData.error };
          } else if (authData.isLegacy) {
            const userRow = authData.user;
            const u = {
              id: userRow.id,
              name: userRow.name,
              phone: userRow.phone || "",
              email: userRow.email,
              registeredAt: new Date(
                userRow.registered_at || Date.now(),
              ).getTime(),
            };
            localStorage.setItem("Orbishop_customers", JSON.stringify(u));
            onSuccess(u);
            setLoading(false);
            return;
          } else if (authData.session) {
            isSupabaseAuthenticated = true;
            await supabase.auth.setSession(authData.session);
            const userEmail = authData.user.email;

            // 1. Lookup Staff role
            const staffList = await db.getStaff();
            const staffMatched = staffList.find(
              (s) => s.email?.toLowerCase() === userEmail?.toLowerCase(),
            );

            // 2. Lookup Sellers role
            const sellersList = await db.getSellers();
            const sellerMatched = sellersList.find(
              (s) => s.email?.toLowerCase() === userEmail?.toLowerCase(),
            );

            // Assert Roles strictly matching selected role tab to avoid mixed UI login leaks!
            if (selectedRole === "staff") {
              if (!staffMatched) {
                authError = {
                  message:
                    lang === "sw"
                      ? "Kosa: Barua pepe hii haijasajiliwa kama Staff/Utawala katika benki yetu."
                      : "Error: This email is not registered under staff/administration databases.",
                };
                isSupabaseAuthenticated = false;
                await supabase.auth.signOut();
              } else if (
                staffMatched.status === "frozen" ||
                staffMatched.status === "pending_approval"
              ) {
                authError = {
                  message: "Account is pending or frozen. Contact Super Admin.",
                };
                isSupabaseAuthenticated = false;
                await supabase.auth.signOut();
              } else {
                localStorage.setItem(
                  "Orbishop_staff",
                  JSON.stringify(staffMatched),
                );
                window.location.href = "/admin.html";
                return;
              }
            } else if (selectedRole === "seller") {
              if (!sellerMatched) {
                authError = {
                  message:
                    lang === "sw"
                      ? "Kosa: Barua pepe hii haijasajiliwa kama Muuzaji katika duka letu."
                      : "Error: This email is not registered as a merchant under sellers roster.",
                };
                isSupabaseAuthenticated = false;
                await supabase.auth.signOut();
              } else if (sellerMatched.isApproved === false) {
                authError = {
                  message:
                    lang === "sw"
                      ? "Ombi lako bado linakaguliwa na Msimamizi/Admin. Utaweza kuingia pindi litakapothibitishwa!"
                      : "Your merchant registration request is currently pending Administrator approval. Access will be active as soon as approved!",
                };
                isSupabaseAuthenticated = false;
                await supabase.auth.signOut();
              } else if (sellerMatched.status === "frozen") {
                authError = {
                  message: "Seller Account is frozen. Contact Support.",
                };
                isSupabaseAuthenticated = false;
                await supabase.auth.signOut();
              } else {
                localStorage.setItem(
                  "Orbishop_seller",
                  JSON.stringify(sellerMatched),
                );
                window.location.href = "/admin.html";
                return;
              }
            } else {
              // Buyer Role
              const customerList = await db.getCustomers();
              const userRow = customerList.find(
                (c) => c.email?.toLowerCase() === userEmail?.toLowerCase(),
              );

              if (userRow) {
                if (userRow.status === "frozen") {
                  authError = {
                    message: "Customer Account is frozen. Contact Support.",
                  };
                  isSupabaseAuthenticated = false;
                  await supabase.auth.signOut();
                  return;
                }
                const u = {
                  id: userRow.id,
                  name: userRow.name,
                  phone: userRow.phone || "",
                  email: userRow.email,
                  registeredAt:
                    typeof userRow.registeredAt === "number"
                      ? userRow.registeredAt
                      : userRow.registeredAt
                        ? new Date(userRow.registeredAt).getTime()
                        : Date.now(),
                  tin: userRow.tin || "",
                };
                localStorage.setItem("Orbishop_customers", JSON.stringify(u));
                onSuccess(u);
                setLoading(false);
                return;
              } else {
                // Create public customer profile if doesn't exist
                const u = {
                  id: authData.session.user.id,
                  name: authData.session.user.user_metadata?.name || "Customer",
                  phone: emailOrPhone,
                  email: userEmail || "",
                  registeredAt: Date.now(),
                };
                localStorage.setItem("Orbishop_customers", JSON.stringify(u));
                onSuccess(u);
                setLoading(false);
                return;
              }
            }
          }
        } catch (e: any) {
          authError = { message: e.message };
        }
      }
    } else {
      // Customer Mode Logic for other actions
      const authEmail = getValidEmail(emailOrPhone);

      if (localMode === "forgot") {
        if (!name.trim()) {
          showAlert(
            lang === "sw"
              ? "Tafadhali weka Jina Kamili"
              : "Please enter your Full Name",
            "error",
          );
          setLoading(false);
          return;
        }
        if (!emailOrPhone.trim()) {
          showAlert(
            lang === "sw"
              ? "Tafadhali weka Namba ya Simu au Barua Pepe"
              : "Please enter your Phone or Email",
            "error",
          );
          setLoading(false);
          return;
        }

        // Search database robustly without causing .or() delimiters syntax errors
        let customers: any[] = [];
        let dbError = null;

        try {
          const emailInput = emailOrPhone.trim().toLowerCase();
          const phoneInput = emailOrPhone.trim();

          const allCustomers = await db.getCustomers();
          customers = allCustomers.filter(
            (c) =>
              (c.email && c.email.toLowerCase() === emailInput) ||
              (c.phone && c.phone === phoneInput) ||
              (c.email && c.email.toLowerCase() === authEmail.toLowerCase()),
          );
        } catch (err: any) {
          dbError = err;
        }

        if (dbError) {
          authError = dbError;
        } else if (!customers || customers.length === 0) {
          authError = {
            message:
              lang === "sw"
                ? "Barua pepe au namba hii ya simu haijasajiliwa!"
                : "This email or phone number is not registered!",
          };
        } else {
          // Compare names locally (case-insensitive and trimmed) supporting exact or partial match for perfect restoration
          const matched = customers.find((c) => {
            const dbName = (c.name || "").trim().toLowerCase();
            const inputName = name.trim().toLowerCase();
            return (
              dbName === inputName ||
              dbName.includes(inputName) ||
              inputName.includes(dbName)
            );
          });

          if (matched) {
            setResetCustomerId(matched.id);
            setLocalMode("reset");
            setPassword("");
            setPasswordConfirm("");
            showAlert(
              lang === "sw"
                ? "Akaunti imehakikiwa! Tafadhali weka nenosiri lako jipya hapa chini."
                : "Account verified successfully! Please enter your new password below.",
              "success",
            );
          } else {
            authError = {
              message:
                lang === "sw"
                  ? "Jina Kamili halijafanana na taarifa za akaunti hii!"
                  : "The Full Name does not match this account details!",
            };
          }
        }
      } else if (localMode === "reset") {
        const reqLength = password.length >= 4;

        if (!reqLength) {
          showAlert(
            lang === "sw"
              ? "Nenosiri lako lazima liwe na herufi angalau 4!"
              : "Your password must be at least 4 characters long!",
            "error",
          );
          setLoading(false);
          return;
        }

        if (password !== passwordConfirm) {
          showAlert(
            lang === "sw"
              ? "Uthibitisho wa nenosiri haulingani na nenosiri lako jipya!"
              : "Password confirmation does not match!",
            "error",
          );
          setLoading(false);
          return;
        }

        if (!resetCustomerId) {
          showAlert(
            lang === "sw"
              ? "Kuna hitilafu ya kiufundi. Tafadhali anza upya."
              : "An error occurred. Please restart the process.",
            "error",
          );
          setLocalMode("forgot");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `/api/v1/customers/${resetCustomerId}/reset-password`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
          },
        );
        const data = await res.json();

        if (!data.success) {
          authError = { message: data.error };
        } else {
          showAlert(
            lang === "sw"
              ? "Nenosiri lako jipya limehifadhiwa kwa mafanikio! Unaweza kuingia sasa hivi."
              : "Your new password has been saved successfully! You can login now.",
            "success",
          );
          setName("");
          setEmailOrPhone("");
          setPassword("");
          setPasswordConfirm("");
          setResetCustomerId(null);
          setLocalMode("login");
        }
      } else if (localMode === "register") {
        const reqLength = password.length >= 4;

        if (!reqLength) {
          showAlert(
            lang === "sw"
              ? "Nenosiri lako lazima liwe na herufi angalau 4!"
              : "Your password must be at least 4 characters long!",
            "error",
          );
          setLoading(false);
          return;
        }

        if (password !== passwordConfirm) {
          showAlert(
            lang === "sw"
              ? "Uthibitisho wa nenosiri haulingani na nenosiri lako!"
              : "Password confirmation does not match!",
            "error",
          );
          setLoading(false);
          return;
        }

        let currentPhone = phone ? phone.trim() : "";
        if (!emailOrPhone.includes("@") && !currentPhone) {
          currentPhone = emailOrPhone.trim();
        }

        // Step 1: Check if there's an existing customer with the same email or phone number
        let checkError = null;
        let existing: any[] = [];
        try {
          const allCustomers = await db.getCustomers();
          existing = allCustomers.filter(
            (c) =>
              (c.email && c.email.toLowerCase() === authEmail.toLowerCase()) ||
              (currentPhone && c.phone === currentPhone),
          );
        } catch (err: any) {
          checkError = err;
        }

        if (checkError) {
          authError = checkError;
        } else if (existing && existing.length > 0) {
          const emailClash = existing.some(
            (c) => c.email?.toLowerCase() === authEmail.toLowerCase(),
          );
          const phoneClash =
            currentPhone && existing.some((c) => c.phone === currentPhone);

          if (emailClash && phoneClash) {
            authError = {
              message:
                lang === "sw"
                  ? "Barua pepe na namba hii ya simu tayari zimeshasajiliwa na akaunti nyingine!"
                  : "Both this email and phone number are already registered to another account!",
            };
          } else if (emailClash) {
            authError = {
              message:
                lang === "sw"
                  ? "Barua pepe hii tayari imesajiliwa na akaunti nyingine!"
                  : "This email address is already registered to another account!",
            };
          } else {
            authError = {
              message:
                lang === "sw"
                  ? "Namba hii ya simu tayari imesajiliwa na akaunti nyingine!"
                  : "This phone number is already registered to another account!",
            };
          }
        } else {
          // Step 2: Use backend for registration (or save seller application message directly to trigger pending admin requests)
          try {
            if (selectedRole === "seller") {
              await db.saveMessage({
                id: "",
                name: name.trim(),
                phone: currentPhone || "",
                message: `Maombi ya Kuwa Muuzaji:\nJina Kamili: ${name.trim()}\nBarua pepe: ${authEmail}\nDuka: ${name.trim()}\nMaelezo zaidi: TIN: ${tin.trim()}, Password: ${password.trim()}`,
                date: Date.now()
              });

              showAlert(
                lang === "sw"
                  ? "Ombi lako la kuwa muuzaji limewasilishwa kikamilifu! Msimamizi atakagua ombi hili na kukufungulia akaunti yako hivi punde."
                  : "Your merchant registration request has been submitted successfully! An administrator will review and activate your account shortly.",
                "success",
              );
              setLocalMode("login");
              setLoading(false);
              return;
            } else {
              const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: authEmail,
                  password,
                  full_name: name,
                  role: "client",
                  phone: currentPhone,
                  tin: tin.trim(),
                }),
              });
              const data = await res.json();

              if (!data.success) {
                authError = { message: data.error };
              } else {
                const u = {
                  id:
                    data.user?.id ||
                    data.session?.user?.id ||
                    Math.random().toString(36),
                  name: name,
                  phone: currentPhone || "",
                  email: authEmail,
                  registeredAt: Date.now(),
                  tin: tin.trim() || "",
                };
                localStorage.setItem("Orbishop_customers", JSON.stringify(u));
                onSuccess(u);
              }
            }
          } catch (e: any) {
            authError = { message: e.message };
          }
        }
      } else {
        return; // Handled directly in localMode === "login" block above
      }
    }

    setLoading(false);
    if (authError) {
      let friendlyMessage = authError.message;
      if (
        authError.message.toLowerCase().includes("rate limit") ||
        authError.message.toLowerCase().includes("limit exceeded") ||
        authError.message.toLowerCase().includes("60 seconds")
      ) {
        friendlyMessage =
          lang === "sw"
            ? 'Ole! Ukomo wa kupokea barua pepe umefikiwa (Rate Limit Exceeded). Tafadhali jaribu tena baada ya dakika 1, au kama unatumia akaunti ya majaribio, wasiliana na utawala ili kuzima "Confirm Email" kwenye Supabase.'
            : 'Email rate limit exceeded! Please wait 1 minute before trying again. Developer tip: Disable "Confirm Email" under your Supabase Database Auth settings.';
      } else if (
        authError.message === "Invalid login credentials" ||
        authError.message.includes("Invalid login")
      ) {
        friendlyMessage =
          lang === "sw"
            ? "Namba ya simu/barua pepe au nenosiri sio sahihi"
            : "Invalid phone/email or password";
      }
      showAlert(friendlyMessage, "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] w-full max-w-md overflow-y-auto max-h-[95vh] p-8 relative shadow-2xl border border-slate-100 flex flex-col">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors z-30"
        >
          <X size={20} />
        </button>

        {loading && (
          <div className="absolute inset-0 bg-white/80 z-20 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-[2rem]">
            <RefreshCw
              className="animate-spin text-orange-600 mb-3"
              size={36}
            />
            <p className="text-slate-700 font-bold text-sm">
              {lang === "sw"
                ? "Inapakia, tafadhali subiri..."
                : "Loading, please wait..."}
            </p>
          </div>
        )}

        <div className="flex flex-col items-center mb-6">
          <img
            src="https://media-stock.orbifinancial.com/OrbiShop_Logo_Blue.png"
            alt="Orbi Shop"
            className="h-20 md:h-24 mb-4 object-contain drop-shadow-sm"
          />
        </div>

        <div className="animate-in fade-in duration-200 w-full flex flex-col">
          {/* Back Button to exit to Buyer Login */}
          {mode === "login" &&
            (localMode === "forgot" ||
              localMode === "reset" ||
              selectedRole !== "buyer") && (
              <button
                type="button"
                onClick={() => {
                  if (localMode === "forgot" || localMode === "reset") {
                    setLocalMode("login");
                  } else {
                    setSelectedRole("buyer");
                  }
                }}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-600 font-bold text-xs mb-5 transition-colors cursor-pointer self-start"
              >
                <ChevronLeft size={16} />
                <span>
                  {localMode === "forgot" || localMode === "reset"
                    ? lang === "sw"
                      ? "Rudi kwenye Kuingia"
                      : "Back to Login"
                    : lang === "sw"
                      ? "Rudi kwa Mteja"
                      : "Back to Buyer Login"}
                </span>
              </button>
            )}

          <div className="flex flex-col items-center mb-5">
            {/* Specialized badge based on selected role */}
            <div
              className={`mb-3 py-1 px-3 rounded-full text-[10px] font-black uppercase tracking-wider ${
                selectedRole === "buyer"
                  ? "bg-orange-100 text-orange-700"
                  : selectedRole === "seller"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-800"
              }`}
            >
              {selectedRole === "buyer"
                ? lang === "sw"
                  ? "Fomu ya Mteja"
                  : "Customer Portal"
                : selectedRole === "seller"
                  ? lang === "sw"
                    ? "Fomu ya Muuzaji"
                    : "Merchant Portal"
                  : lang === "sw"
                    ? "Fomu ya Utawala"
                    : "Staff Terminal"}
            </div>

            <h2
              className={`text-2xl font-display font-black text-center tracking-tight ${
                selectedRole === "buyer"
                  ? "text-orange-600"
                  : selectedRole === "seller"
                    ? "text-emerald-700"
                    : "text-slate-900"
              }`}
            >
              {localMode === "login"
                ? lang === "sw"
                  ? "Ingia Kwenye Akaunti"
                  : "Login"
                : localMode === "register"
                  ? lang === "sw"
                    ? "Jiunge Nasi"
                    : "Register"
                  : localMode === "forgot"
                    ? lang === "sw"
                      ? "Rejesha Nenosiri"
                      : "Reset Password"
                    : lang === "sw"
                      ? "Nenosiri Jipya"
                      : "New Password"}
            </h2>

            <p className="text-center text-xs text-slate-500 mt-1.5 leading-relaxed">
              {selectedRole === "buyer"
                ? lang === "sw"
                  ? "Ununuzi salama na Orbi PaySafe Guarantee"
                  : "Shop securely with Orbi PaySafe Guarantee"
                : selectedRole === "seller"
                  ? lang === "sw"
                    ? "Weka bidhaa, tazama katalogi na kutoa mapato"
                    : "Configure shop catalog, chat, and check balances"
                  : lang === "sw"
                    ? "Vibali vya wafanyakazi na mifumo mikuu ya jukwaa"
                    : "Authorized platform personnel operations only"}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {localMode === "register" && (
              <div className="space-y-4">
                <input
                  required
                  type="text"
                  placeholder={lang === "sw" ? "Jina Kamili" : "Full Name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl outline-none focus:border-orange-500 focus:bg-white font-medium text-xs"
                />
                <input
                  type="text"
                  placeholder={
                    lang === "sw"
                      ? "Namba ya Simu (Hiari)"
                      : "Phone Number (Optional)"
                  }
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl outline-none focus:border-orange-500 focus:bg-white font-medium text-xs"
                />
                <input
                  type="text"
                  placeholder={
                    lang === "sw"
                      ? "Namba ya TIN (Hiari)"
                      : "TIN Number (Optional)"
                  }
                  value={tin}
                  onChange={(e) => setTin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl outline-none focus:border-orange-500 focus:bg-white font-medium text-xs"
                />
              </div>
            )}

            {localMode === "forgot" && (
              <ForgotPassword
                onCancel={() => setLocalMode("login")}
                lang={lang}
              />
            )}

            {(localMode === "login" ||
              localMode === "register" ||
              localMode === "forgot") && (
              <input
                required
                type={selectedRole === "buyer" ? "text" : "email"}
                placeholder={
                  selectedRole === "buyer"
                    ? lang === "sw"
                      ? "Namba ya simu au Email Address"
                      : "Phone Number or Email"
                    : lang === "sw"
                      ? "Barua Pepe ya Ofisi (e.g. jina@duka.com)"
                      : "Official Email Address"
                }
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl outline-none focus:border-orange-500 focus:bg-white font-medium text-xs"
              />
            )}

            {localMode === "reset" && (
              <p className="text-xs text-emerald-600 font-semibold mb-2 bg-emerald-50 p-3 rounded-xl border border-emerald-100 animate-in fade-in">
                {lang === "sw"
                  ? "Akaunti imehakikiwa! Sasa weka nenosiri lako jipya hapa chini."
                  : "Account verified! Now enter your new password below."}
              </p>
            )}

            {(localMode === "register" || localMode === "reset") && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      localMode === "reset"
                        ? lang === "sw"
                          ? "Unda Nenosiri Jipya"
                          : "Create New Password"
                        : lang === "sw"
                          ? "Unda Nenosiri"
                          : "Create Password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl outline-none focus:border-orange-500 focus:bg-white font-medium pr-10 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Simplified Password Requirements */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2 text-left">
                  <p className="font-bold text-slate-600 text-[10px] uppercase tracking-wider">
                    {lang === "sw"
                      ? "Kigezo cha Nenosiri:"
                      : "Password Requirement:"}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${password.length >= 4 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                    >
                      {password.length >= 4 ? "✓" : "×"}
                    </span>
                    <span
                      className={
                        password.length >= 4
                          ? "text-emerald-700 font-semibold"
                          : "text-slate-500"
                      }
                    >
                      {lang === "sw"
                        ? "Herufi 4 au zaidi"
                        : "At least 4 characters"}
                    </span>
                  </div>
                </div>

                {/* Password Confirmation Field */}
                <div className="relative">
                  <input
                    required
                    type={showPasswordConfirm ? "text" : "password"}
                    placeholder={
                      localMode === "reset"
                        ? lang === "sw"
                          ? "Thibitisha Nenosiri Jipya"
                          : "Confirm New Password"
                        : lang === "sw"
                          ? "Thibitisha Nenosiri"
                          : "Confirm Password"
                    }
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl outline-none focus:border-orange-500 focus:bg-white font-medium pr-10 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPasswordConfirm ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {passwordConfirm && (
                  <div className="text-left">
                    <p
                      className={`text-[11px] font-bold ${password === passwordConfirm ? "text-emerald-600" : "text-rose-600"} flex items-center gap-1`}
                    >
                      <span>{password === passwordConfirm ? "✓" : "×"}</span>
                      <span>
                        {password === passwordConfirm
                          ? lang === "sw"
                            ? "Manenosiri yanalingana kikamilifu!"
                            : "Passwords match perfectly!"
                          : lang === "sw"
                            ? "Manenosiri bado hayafanani!"
                            : "Passwords do not match yet!"}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {localMode === "login" && (
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder={lang === "sw" ? "Nenosiri" : "Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl outline-none focus:border-orange-500 focus:bg-white font-medium pr-10 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            {localMode === "login" && selectedRole === "buyer" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setLocalMode("forgot");
                  }}
                  className="text-xs text-orange-600 hover:text-orange-700 hover:underline font-bold transition-colors cursor-pointer"
                >
                  {lang === "sw" ? "Umesahau Nenosiri?" : "Forgot Password?"}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white py-3.5 rounded-xl font-bold mt-4 disabled:opacity-50 hover:shadow-md transition-all active:scale-[0.98] cursor-pointer ${
                selectedRole === "buyer"
                  ? "bg-orange-600 border-orange-600 hover:bg-orange-700"
                  : selectedRole === "seller"
                    ? "bg-emerald-600 border-emerald-600 hover:bg-emerald-700 font-black uppercase tracking-wider text-xs"
                    : "bg-slate-900 border-slate-900 hover:bg-slate-800 font-black uppercase tracking-wider text-xs"
              }`}
            >
              {localMode === "login"
                ? lang === "sw"
                  ? `Ingia kama ${selectedRole === "buyer" ? "Mteja" : selectedRole === "seller" ? "Muuzaji" : "Msimamizi / Staff"}`
                  : `Login as ${selectedRole === "buyer" ? "Buyer" : selectedRole === "seller" ? "Seller" : "Staff"}`
                : localMode === "register"
                  ? lang === "sw"
                    ? selectedRole === "seller"
                      ? "Mwasilishe Maombi (Apply)"
                      : "Jisajili na Uanze Ununuzi"
                    : selectedRole === "seller"
                      ? "Submit Seller Request (Apply)"
                      : "Register & Start Shopping"
                  : localMode === "forgot"
                    ? lang === "sw"
                      ? "Tafuta na Uhakiki Akaunti"
                      : "Verify & Search Account"
                    : lang === "sw"
                      ? "Hifadhi Nenosiri Jipya"
                      : "Save New Password"}
            </button>
          </form>

          {(localMode === "register" || localMode === "login") && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap justify-center text-center gap-1.5 text-[10px] text-slate-400 font-medium leading-relaxed px-2">
              <span>
                {lang === "sw"
                  ? "Kwa kuendelea, unakubaliana na sera zetu:"
                  : "By continuing, you agree with our policies:"}
              </span>
              <button
                type="button"
                onClick={() => onOpenAbout?.("terms")}
                className="text-amber-600 font-bold hover:underline hover:text-amber-500 transition cursor-pointer"
              >
                {lang === "sw" ? "Vigezo & Masharti" : "Terms & Conditions"}
              </button>
              <span className="opacity-50">|</span>
              <button
                type="button"
                onClick={() => onOpenAbout?.("privacy")}
                className="text-amber-600 font-bold hover:underline hover:text-amber-500 transition cursor-pointer"
              >
                {lang === "sw" ? "Sera ya Faragha" : "Privacy Policy"}
              </button>
              {selectedRole === "seller" && (
                <>
                  <span className="opacity-50">|</span>
                  <button
                    type="button"
                    onClick={() => onOpenAbout?.("seller")}
                    className="text-emerald-600 font-bold hover:underline hover:text-emerald-500 transition cursor-pointer"
                  >
                    {lang === "sw"
                      ? "Sera za Ulinzi wa Muuzaji"
                      : "Seller Protection Policies"}
                  </button>
                </>
              )}
            </div>
          )}

          <div className="mt-4 text-center text-xs text-slate-500 font-medium">
            {localMode === "login" && (selectedRole === "buyer" || selectedRole === "seller") && (
              <div className="space-y-4">
                <div>
                  {selectedRole === "seller" ? (
                    <>
                      {lang === "sw" ? "Hauna akaunti ya muuzaji?" : "Do not have a merchant account?"}
                      <button
                        type="button"
                        onClick={() => {
                          setLocalMode("register");
                          setPassword("");
                          setPasswordConfirm("");
                        }}
                        className="text-emerald-600 ml-1 font-bold hover:underline cursor-pointer"
                      >
                        {lang === "sw" ? "Sajili / Omba Hapa" : "Register / Apply Here"}
                      </button>
                    </>
                  ) : (
                    <>
                      {lang === "sw" ? "Hauna akaunti?" : "Do not have an account?"}
                      <button
                        type="button"
                        onClick={() => {
                          setLocalMode("register");
                          setPassword("");
                          setPasswordConfirm("");
                        }}
                        className="text-orange-600 ml-1 font-bold hover:underline cursor-pointer"
                      >
                        {lang === "sw" ? "Jisajili Hapa" : "Register Here"}
                      </button>
                    </>
                  )}
                </div>

                {/* Discrete partner login footers */}
                <div className="pt-3 border-t border-slate-100 flex flex-col gap-1.5 items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {lang === "sw" ? "Mifumo ya Washirika" : "Partner Portals"}
                  </span>
                  <div className="flex items-center gap-3 text-xs font-bold mt-1">
                    {selectedRole !== "buyer" && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRole("buyer");
                          setEmailOrPhone("");
                        }}
                        className="text-orange-600 hover:text-orange-700 hover:underline cursor-pointer flex items-center gap-1 bg-transparent border-none"
                      >
                        <User size={14} />
                        <span>
                          {lang === "sw" ? "Jopo la Mteja" : "Customer Portal"}
                        </span>
                      </button>
                    )}
                    {selectedRole !== "buyer" && selectedRole !== "seller" && (
                      <span className="text-slate-300 select-none">|</span>
                    )}
                    {selectedRole !== "seller" && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRole("seller");
                          setEmailOrPhone("");
                        }}
                        className="text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer flex items-center gap-1 bg-transparent border-none"
                      >
                        <Store size={14} />
                        <span>
                          {lang === "sw" ? "Jopo la Muuzaji" : "Seller Portal"}
                        </span>
                      </button>
                    )}
                    <span className="text-slate-300 select-none">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole("staff");
                        setEmailOrPhone("");
                      }}
                      className="text-slate-700 hover:text-slate-900 hover:underline cursor-pointer flex items-center gap-1 bg-transparent border-none"
                    >
                      <ShieldCheck size={14} />
                      <span>
                        {lang === "sw" ? "Jopo la Utawala" : "Admin Portal"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {localMode === "login" && selectedRole === "staff" && (
              <div className="space-y-3 mt-2 bg-slate-50 p-4 rounded-xl border border-slate-200/55 text-center">
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  {lang === "sw"
                    ? "Sajili au ukaribisho wa wafanyakazi na watawala hufanyika kupitia jopo kuu la uongozi wa mtandao. Wasiliana na msimamizi kupata idhini."
                    : "Staff onboarding & official administrative roles require registration and verification by System Operations. Contact admin for approvals."}
                </p>
              </div>
            )}
            {localMode === "register" && (
              <>
                {lang === "sw"
                  ? "Una akaunti tayari?"
                  : "Already have an account?"}
                <button
                  type="button"
                  onClick={() => {
                    setLocalMode("login");
                    onSwitch();
                    setPassword("");
                    setPasswordConfirm("");
                  }}
                  className="text-orange-600 ml-1 font-bold hover:underline cursor-pointer"
                >
                  {lang === "sw" ? "Ingia Hapa" : "Login Here"}
                </button>
              </>
            )}
            {(localMode === "forgot" || localMode === "reset") && (
              <button
                type="button"
                onClick={() => setLocalMode("login")}
                className="text-orange-600 font-bold hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <ChevronLeft size={16} />{" "}
                {lang === "sw" ? "Rudi Kwenye Kuingia" : "Back to Login"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.04)] flex flex-col">
      <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-slate-100 animate-pulse rounded-lg sm:rounded-xl mb-2 sm:mb-2.5"></div>
      <div className="px-0.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="h-3 sm:h-4 bg-slate-100 rounded animate-pulse w-5/6 mb-1"></div>
          <div className="h-2.5 sm:h-3 bg-slate-100 rounded animate-pulse w-2/3 mb-2"></div>
        </div>
        <div className="mt-auto">
          <div className="h-3.5 sm:h-4 bg-slate-100 rounded animate-pulse w-1/2 mb-3"></div>
          <div className="flex gap-1 sm:gap-1.5 md:gap-2">
            <div className="flex-1 h-7 sm:h-9 md:h-10 bg-slate-150 bg-slate-100 animate-pulse rounded-lg sm:rounded-xl"></div>
            <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-slate-100 animate-pulse rounded-lg sm:rounded-xl shrink-0"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MediaRenderer({
  src,
  className,
  alt = "",
  autoPlay = false,
  controls = false,
}: {
  src?: string;
  className?: string;
  alt?: string;
  autoPlay?: boolean;
  controls?: boolean;
  key?: React.Key;
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError)
    return (
      <div
        className={`${className || ""} bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400`}
      >
        <span className="text-xs font-semibold uppercase tracking-widest px-4 text-center">
          {alt || "Image Unavailable"}
        </span>
      </div>
    );

  // Optimize URL if it's an Unsplash URL (convert to lightweight web bitmap)
  let optimizedSrc = src;
  if (src.includes("images.unsplash.com")) {
    try {
      const urlObj = new URL(src);
      urlObj.searchParams.set("auto", "format");
      urlObj.searchParams.set("q", "75");
      // Use thumbnail size to optimize pixel memory overhead
      if (!urlObj.searchParams.has("w")) {
        urlObj.searchParams.set("w", "480");
      }
      optimizedSrc = urlObj.toString();
    } catch (e) {
      optimizedSrc = src.includes("?")
        ? `${src}&auto=format&q=75&w=480`
        : `${src}?auto=format&q=75&w=480`;
    }
  }

  if (src.startsWith("data:video/")) {
    return (
      <video
        src={src}
        className={className}
        autoPlay={autoPlay}
        muted={autoPlay}
        loop={autoPlay}
        controls={controls}
        playsInline
      />
    );
  }
  return (
    <img
      src={optimizedSrc}
      className={className}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}

// Icon fallbacks
const PackageIcon = ({
  size,
  className,
}: {
  size: number;
  className?: string;
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

const isPhoneMatch = (p1?: string, p2?: string) => {
  if (!p1 || !p2) return false;
  const cp1 = p1.replace(/\D/g, "");
  const cp2 = p2.replace(/\D/g, "");
  if (!cp1 || !cp2) return false;
  const len1 = cp1.length;
  const len2 = cp2.length;
  if (len1 >= 9 && len2 >= 9) {
    return cp1.slice(-9) === cp2.slice(-9);
  }
  return cp1 === cp2;
};

const uploadMessageMedia = async (
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "messages");

    if (onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/v1/storage/upload", true);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = (event.loaded / event.total) * 100;
            onProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              if (res.success) resolve(res.publicUrl);
              else reject(new Error(res.message || "Failed to upload"));
            } catch (e) {
              resolve(xhr.responseText);
            }
          } else {
            reject(
              new Error(`Failed to upload file check status: ${xhr.status}`),
            );
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network error during file upload."));
        };

        xhr.send(formData);
      });
    } else {
      const uploadRes = await fetch("/api/v1/storage/upload", {
        method: "POST",
        body: formData,
      });

      const resJson = await uploadRes.json();
      if (!uploadRes.ok || !resJson.success) {
        throw new Error(
          `Kosa la kupakia: ${resJson.message || uploadRes.statusText}`,
        );
      }
      return resJson.publicUrl;
    }
  } catch (error: any) {
    console.error("Storage Error:", error);
    throw error;
  }
};

const extractMediaFromText = (text: string) => {
  if (!text) return { text: "", mediaUrl: undefined };
  const regex = /\[MEDIA:(https?:\/\/[^\]]+)\]/;
  const match = text.match(regex);
  if (match) {
    const mediaUrl = match[1];
    const cleanedText = text.replace(regex, "").trim();
    return { text: cleanedText, mediaUrl };
  }
  return { text, mediaUrl: undefined };
};

const isImage = (url?: string) => {
  if (!url) return false;
  const cleanUrl = url.split("?")[0].toLowerCase();
  return (
    cleanUrl.endsWith(".png") ||
    cleanUrl.endsWith(".jpg") ||
    cleanUrl.endsWith(".jpeg") ||
    cleanUrl.endsWith(".gif") ||
    cleanUrl.endsWith(".webp") ||
    url.startsWith("data:image/")
  );
};

const isVideo = (url?: string) => {
  if (!url) return false;
  const cleanUrl = url.split("?")[0].toLowerCase();
  return (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".ogg") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.endsWith(".quicktime") ||
    url.startsWith("data:video/")
  );
};

function CustomerProfile({
  user,
  onClose,
  lang,
  orders,
  onViewInvoice,
  initialTab = "orders",
  aiChatHistory,
  sendAIChatMessage,
  isAILoading,
  isTransferredToLive,
  aiSelectedImage,
  setAiSelectedImage,
  aiInputMessage,
  setAIInputMessage,
  handleAIImageChange,
  aiLockTimeRemaining,
  forcePointsUpdate,
  setForcePointsUpdate,
  handleReceiptUpload,
  isParsingReceipt,
  parsedReceiptData,
  handleClaimReceiptPoints,
  setParsedReceiptData,
  parsingError,
  handleRedeemVoucher,
  coupons = [],
  onWriteReview,
  onRefresh,
  onUserUpdate,
  onLogout,
}: {
  user: Customer;
  onClose: () => void;
  lang: string;
  orders: Order[];
  onViewInvoice: (o: Order) => void;
  initialTab?: "orders" | "track" | "messages" | "rewards" | "locator";
  aiChatHistory: any[];
  sendAIChatMessage: (msg: string) => Promise<void>;
  isAILoading: boolean;
  isTransferredToLive: boolean;
  aiSelectedImage: any;
  setAiSelectedImage: any;
  aiInputMessage: string;
  setAIInputMessage: any;
  handleAIImageChange: any;
  aiLockTimeRemaining: string;
  forcePointsUpdate: number;
  setForcePointsUpdate?: React.Dispatch<React.SetStateAction<number>>;
  handleReceiptUpload: any;
  isParsingReceipt: boolean;
  parsedReceiptData: any;
  handleClaimReceiptPoints: any;
  setParsedReceiptData: any;
  parsingError: string | null;
  handleRedeemVoucher: any;
  coupons?: any[];
  onWriteReview?: (productId: string, productName: string) => void;
  onRefresh?: () => void;
  onUserUpdate?: (u: Customer) => void;
  onLogout?: () => void;
}) {
  const { showAlert, showConfirm } = useDialog();
  const [tab, setTab] = useState<
    "orders" | "track" | "messages" | "rewards" | "locator"
  >(initialTab as any);
  const [showDeliveryConfirmModal, setShowDeliveryConfirmModal] =
    useState(false);
  const [selectedConfirmOrder, setSelectedConfirmOrder] =
    useState<Order | null>(null);
  const [localOrders, setLocalOrders] = useState<Order[]>(orders);

  const [trackOrderId, setTrackOrderId] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackedOrderLogs, setTrackedOrderLogs] = useState<OrderStatusLog[]>(
    [],
  );

  // Profile editing state
  const [editName, setEditName] = useState(user.name);
  const [editPhone, setEditPhone] = useState(user.phone);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editAddress, setEditAddress] = useState(
    () =>
      localStorage.getItem("orbi_user_default_address_" + user.id) ||
      (user as any).address ||
      "",
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    setEditName(user.name);
    setEditPhone(user.phone);
    setEditEmail(user.email);
    setEditAddress(
      localStorage.getItem("orbi_user_default_address_" + user.id) ||
        (user as any).address ||
        "",
    );
  }, [user]);

  const normalizeOrderStatus = (status: string | undefined): string => {
    if (!status) return "pending";
    const s = status.toUpperCase();
    if (s === "CREATED" || s === "AWAITING_PAYMENT" || s === "PENDING")
      return "pending";
    if (s === "PAYMENT_HELD" || s === "PROCESSING" || s === "CONFIRMED")
      return "confirmed";
    if (s === "SHIPPED") return "shipped";
    if (s === "DELIVERED") return "delivered";
    if (
      s === "CUSTOMER_CONFIRMED" ||
      s === "BUYER_CONFIRMED" ||
      s === "RELEASED" ||
      s === "ARCHIVED"
    )
      return "customer_confirmed";
    if (s === "CANCELLED" || s === "REFUNDED") return "cancelled";
    return status.toLowerCase();
  };

  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  // Sync trackedOrder automatically when localOrders updates (polling or status save)
  useEffect(() => {
    if (trackedOrder) {
      const dbMatch = localOrders.find(
        (o) =>
          o.id === trackedOrder.id ||
          ((o as any).legacy_id &&
            (o as any).legacy_id === (trackedOrder as any).legacy_id),
      );
      if (dbMatch) {
        const normalizedDbStatus = normalizeOrderStatus(dbMatch.status);
        if (
          trackedOrder.status !== normalizedDbStatus ||
          trackedOrder.paymentReference !== dbMatch.paymentReference ||
          JSON.stringify(trackedOrder.riderName) !==
            JSON.stringify(dbMatch.riderName) ||
          trackedOrder.riderPhone !== dbMatch.riderPhone ||
          trackedOrder.riderVehicle !== dbMatch.riderVehicle
        ) {
          setTrackedOrder({
            ...dbMatch,
            status: normalizedDbStatus as any,
          });
        }
      }
    }
  }, [localOrders, trackedOrder?.id]);

  // Fast background polling (every 5 seconds) to ensure status changes reflect immediately
  // of the tracked or active tab orders without requiring any manual action.
  useEffect(() => {
    if (!onRefresh) return;

    // Poll more frequently (every 5 seconds) when active inside orders or track tabs
    const isDetailViewActive = tab === "track" || tab === "orders";
    if (!isDetailViewActive) return;

    const intervalId = setInterval(() => {
      onRefresh();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [tab, onRefresh]);

  // Also query immediately when user switches tabs
  useEffect(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [tab]);
  const [rewardsCategory, setRewardsCategory] = useState<
    "available" | "claimed"
  >("available");

  // --- Loyalty Program & Scratch Card Local States ---
  const [scratchResult, setScratchResult] = useState<string | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchRewardPoints, setScratchRewardPoints] = useState(0);

  useEffect(() => {
    if (initialTab) {
      setTab(initialTab as any);
    }
  }, [initialTab]);

  const [invSettings, setInvSettings] = useState<any>(null);
  useEffect(() => {
    db.getInvoiceSettings().then((res) => setInvSettings(res));
  }, []);

  const currentPointsWorth = useMemo(() => {
    return invSettings?.pointsWorth !== undefined
      ? Number(invSettings.pointsWorth)
      : 10;
  }, [invSettings]);

  const currentPointsRate = useMemo(() => {
    return invSettings?.pointsRate !== undefined
      ? Number(invSettings.pointsRate)
      : 1;
  }, [invSettings]);

  const pointsRequiredPerTzsDiscount = useMemo(() => {
    return invSettings?.pointsRequiredPerTzsDiscount !== undefined
      ? Number(invSettings.pointsRequiredPerTzsDiscount)
      : 10;
  }, [invSettings]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedBubbleIds, setSelectedBubbleIds] = useState<Set<string>>(
    new Set(),
  );
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [profileChatMode, setProfileChatMode] = useState<"ai" | "live">("ai");

  useEffect(() => {
    setIsSelectionMode(false);
    setSelectedBubbleIds(new Set());
  }, [tab]);

  const toggleSelectBubble = (bubbleId: string) => {
    setSelectedBubbleIds((prev) => {
      const next = new Set(prev);
      if (next.has(bubbleId)) {
        next.delete(bubbleId);
      } else {
        next.add(bubbleId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const allIds = chatBubbles.map((b) => b.id);
    setSelectedBubbleIds(new Set(allIds));
  };

  const handleUnselectAll = () => {
    setSelectedBubbleIds(new Set());
  };

  const handleDeleteBubbles = async (bubbleIdsArray: string[]) => {
    const entireDeletes = new Set<string>();
    const replyClears = new Set<string>();

    bubbleIdsArray.forEach((id) => {
      if (id.endsWith("-admin-reply")) {
        const dbId = id.replace("-admin-reply", "");
        replyClears.add(dbId);
      } else if (id.endsWith("-admin-init")) {
        const dbId = id.replace("-admin-init", "");
        entireDeletes.add(dbId);
      } else if (id.endsWith("-customer-query")) {
        const dbId = id.replace("-customer-query", "");
        entireDeletes.add(dbId);
      }
    });

    entireDeletes.forEach((dbId) => {
      replyClears.delete(dbId);
    });

    try {
      for (const dbId of entireDeletes) {
        await db.deleteMessage(dbId);
      }

      for (const dbId of replyClears) {
        const originalMsg = messages.find((m) => m.id === dbId);
        if (originalMsg) {
          await db.saveMessage({
            ...originalMsg,
            adminReply: "",
          });
        }
      }

      setMessages((prev: Message[]) => {
        return prev
          .filter((m) => !entireDeletes.has(m.id))
          .map((m) => {
            if (replyClears.has(m.id)) {
              return { ...m, adminReply: undefined };
            }
            return m;
          });
      });

      showAlert(
        lang === "sw"
          ? "Ujumbe umefutwa kikamilifu!"
          : "Messages deleted successfully!",
        "success",
      );
    } catch (err: any) {
      console.error(err);
      showAlert(
        lang === "sw"
          ? "Imeshindwa kufuta baadhi ya ujumbe: " + err.message
          : "Failed to delete some messages: " + err.message,
        "error",
      );
    }
  };

  const handleExecuteBulkDelete = async () => {
    if (selectedBubbleIds.size === 0) return;
    const count = selectedBubbleIds.size;

    const confirmMsg =
      lang === "sw"
        ? `Je, una uhakika unataka kufuta ujumbe ${count} ulioteuliwa?`
        : `Are you sure you want to delete the ${count} selected messages?`;

    const titleMsg = lang === "sw" ? "Futa Ujumbe" : "Delete Messages";

    if (await showConfirm(confirmMsg, titleMsg)) {
      await handleDeleteBubbles(Array.from(selectedBubbleIds));
      setSelectedBubbleIds(new Set());
      setIsSelectionMode(false);
    }
  };

  useEffect(() => {
    async function loadTrackedLogs() {
      if (!trackedOrder?.id) {
        setTrackedOrderLogs([]);
        return;
      }
      try {
        const fetched = await db.getOrderLogs(trackedOrder.id);
        setTrackedOrderLogs(fetched || []);
      } catch (err) {
        console.warn("Failed to load tracked order logs in client:", err);
      }
    }
    loadTrackedLogs();
  }, [trackedOrder?.id, trackedOrder?.status]);

  const getTrackedStageTimestamp = (statusName: string): number | null => {
    if (statusName === "pending") return trackedOrder?.date || null;
    const matchedLog = trackedOrderLogs.find((l) => l.newStatus === statusName);
    if (matchedLog) return matchedLog.createdAt;

    const orderOfStatuses = [
      "pending",
      "confirmed",
      "customer_confirmed",
      "shipped",
      "delivered",
    ];
    const currentIdx = orderOfStatuses.indexOf(
      trackedOrder?.status || "pending",
    );
    const targetIdx = orderOfStatuses.indexOf(statusName);

    if (currentIdx >= targetIdx && targetIdx > 0 && trackedOrder?.date) {
      return trackedOrder.date + targetIdx * 30 * 60 * 1000;
    }
    return null;
  };

  const formatTrackedStageTime = (statusName: string) => {
    const ts = getTrackedStageTimestamp(statusName);
    if (!ts) return "";
    return new Date(ts).toLocaleString(lang === "sw" ? "sw-TZ" : "en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const [highlightTrackedStatus, setHighlightTrackedStatus] = useState(false);
  const prevTrackedStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if (trackedOrder) {
      if (
        prevTrackedStatusRef.current &&
        prevTrackedStatusRef.current !== trackedOrder.status
      ) {
        setHighlightTrackedStatus(true);
        const timer = setTimeout(() => {
          setHighlightTrackedStatus(false);
        }, 5000);
        return () => clearTimeout(timer);
      }
      prevTrackedStatusRef.current = trackedOrder.status;
    } else {
      prevTrackedStatusRef.current = null;
    }
  }, [trackedOrder?.status]);

  const [isTrackLoading, setIsTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState("");
  const [profileMsgText, setProfileMsgText] = useState("");
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedMediaUrl, setAttachedMediaUrl] = useState<string>("");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploadingMedia(true);
    try {
      const url = await uploadMessageMedia(file);
      setAttachedMediaUrl(url);
      setAttachedFile(file);
    } catch (err: any) {
      console.error(err);
      showAlert(
        lang === "sw"
          ? "Mchakato wa kupakia faili umeshindwa. Tafadhali jaribu tena."
          : "Failed to upload attachment. Please try again.",
        "error",
      );
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const profileTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea when profileMsgText changes
  useEffect(() => {
    if (profileTextareaRef.current) {
      profileTextareaRef.current.style.height = "auto";
      profileTextareaRef.current.style.height = `${profileTextareaRef.current.scrollHeight}px`;
    }
  }, [profileMsgText]);

  // Product tagging autocomplete state for customer
  const [tagProducts, setTagProducts] = useState<Product[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [tagQuery, setTagQuery] = useState("");
  const [tagIndex, setTagIndex] = useState(-1);

  useEffect(() => {
    db.getProducts().then((ps) => {
      setTagProducts(ps.filter((p) => p.visible !== false));
    });
  }, []);

  useEffect(() => {
    if (!profileTextareaRef.current) return;
    const el = profileTextareaRef.current;
    const text = profileMsgText;
    const selectionStart = el.selectionStart;

    const textBeforeCursor = text.slice(0, selectionStart);
    const lastAtIdx = textBeforeCursor.lastIndexOf("@");

    if (lastAtIdx !== -1) {
      const isStartOrSpace =
        lastAtIdx === 0 || /\s/.test(textBeforeCursor.charAt(lastAtIdx - 1));
      const query = textBeforeCursor.slice(lastAtIdx + 1);

      if (
        isStartOrSpace &&
        !query.includes("@") &&
        !query.includes("\n") &&
        query.length <= 25
      ) {
        setTagQuery(query);
        setTagIndex(lastAtIdx);
        setShowTagSuggestions(true);
        return;
      }
    }

    setShowTagSuggestions(false);
  }, [profileMsgText]);

  const filteredTagProducts = useMemo(() => {
    if (!showTagSuggestions) return [];
    const q = tagQuery.toLowerCase().trim();
    if (!q) return tagProducts.slice(0, 8);
    return tagProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q)),
      )
      .slice(0, 8);
  }, [showTagSuggestions, tagQuery, tagProducts]);

  const chatBubbles = useMemo(() => {
    const list: {
      id: string;
      sender: "customer" | "admin";
      text: string;
      mediaUrl?: string;
      date: number;
      isRead: boolean;
    }[] = [];
    messages.forEach((m) => {
      // Check if message is admin initiated (no customer message query context)
      const isAdminInitiated =
        m.message === "Ujumbe toka kwa Admin" ||
        m.message === "Admin initiated dummy" ||
        m.message === "Ujumbe kutoka Orbi Shop" ||
        m.message === "Ujumbe toka kwa Orbi Shop";
      if (isAdminInitiated) {
        const { text, mediaUrl } = extractMediaFromText(
          m.adminReply || m.message,
        );
        list.push({
          id: m.id + "-admin-init",
          sender: "admin",
          text,
          mediaUrl,
          date: m.date,
          isRead: !!m.isRead,
        });
      } else {
        // Customer query
        const { text: customerText, mediaUrl: customerMedia } =
          extractMediaFromText(m.message);
        list.push({
          id: m.id + "-customer-query",
          sender: "customer",
          text: customerText,
          mediaUrl: customerMedia,
          date: m.date,
          isRead: !!m.isRead,
        });
        // Admin response (if exists)
        if (m.adminReply) {
          const { text: adminText, mediaUrl: adminMedia } =
            extractMediaFromText(m.adminReply);
          list.push({
            id: m.id + "-admin-reply",
            sender: "admin",
            text: adminText,
            mediaUrl: adminMedia,
            date: m.date + 1000, // Display right below customer message
            isRead: true, // Admin responses are read or active
          });
        }
      }
    });
    return list.sort((a, b) => a.date - b.date);
  }, [messages]);

  useEffect(() => {
    if (tab === "messages") {
      const scrollToBottom = () => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop =
            chatContainerRef.current.scrollHeight;
        }
      };

      scrollToBottom();
      const t1 = setTimeout(scrollToBottom, 50);
      const t2 = setTimeout(scrollToBottom, 150);
      const t3 = setTimeout(scrollToBottom, 350);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [chatBubbles, tab]);

  const handleTrackSearch = async (providedId?: string) => {
    const idToSearch = (providedId || trackOrderId).trim();
    if (!idToSearch) return;

    const normalizeOrderStatus = (status: string | undefined): string => {
      if (!status) return "pending";
      const s = status.toUpperCase();
      if (s === "CREATED" || s === "AWAITING_PAYMENT" || s === "PENDING")
        return "pending";
      if (s === "PAYMENT_HELD" || s === "PROCESSING" || s === "CONFIRMED")
        return "confirmed";
      if (s === "SHIPPED") return "shipped";
      if (s === "DELIVERED") return "delivered";
      if (
        s === "CUSTOMER_CONFIRMED" ||
        s === "BUYER_CONFIRMED" ||
        s === "RELEASED" ||
        s === "ARCHIVED"
      )
        return "customer_confirmed";
      if (s === "CANCELLED" || s === "REFUNDED") return "cancelled";
      return status.toLowerCase();
    };

    setIsTrackLoading(true);
    setTrackError("");
    setTrackedOrder(null);

    try {
      // First try to look up locally
      const localMatch = localOrders.find((o) => {
        const idLower = o.id.toLowerCase();
        const legacyLower = ((o as any).legacy_id || "").toLowerCase();
        const searchLower = idToSearch.toLowerCase();
        return (
          idLower === searchLower ||
          legacyLower === searchLower ||
          (searchLower.length >= 4 &&
            (idLower.startsWith(searchLower) ||
              legacyLower.includes(searchLower) ||
              legacyLower.replace(/^ord-/i, "").startsWith(searchLower)))
        );
      });
      if (localMatch) {
        setTrackedOrder({
          ...localMatch,
          status: normalizeOrderStatus(localMatch.status) as any,
        });
        setIsTrackLoading(false);
        return;
      }

      // Query from the database directly using our API to decrypt and map properly
      const singleOrder = await db.getOrder(idToSearch);

      if (!singleOrder) {
        setTrackError(
          lang === "sw"
            ? "Oda hiyo haikupatikana. Tafadhali hakikisha ID iko sahihi."
            : "Order not found. Please double-check the Order ID.",
        );
      } else {
        setTrackedOrder({
          ...singleOrder,
          status: normalizeOrderStatus(singleOrder.status) as any,
        });
      }
    } catch (e: any) {
      console.error("Error tracking order:", e);
      setTrackError(
        lang === "sw"
          ? "Itilafu imetokea wakati wa kutafuta oda hiyo."
          : "An error occurred while tracking the order.",
      );
    } finally {
      setIsTrackLoading(false);
    }
  };

  const [localReadIds, setLocalReadIds] = useState<string[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("orbishop_read_reply_ids") || "[]",
      );
    } catch {
      return [];
    }
  });

  const tabUnreadCount = useMemo(() => {
    return messages.filter((m) => {
      const isFromAdmin =
        m.message === "Ujumbe kutoka Orbi Shop" ||
        m.message === "Admin initiated dummy" ||
        m.message === "Ujumbe toka kwa Admin" ||
        m.message === "Ujumbe toka kwa Orbi Shop" ||
        !!m.adminReply;
      return isFromAdmin && !localReadIds.includes(m.id);
    }).length;
  }, [messages, localReadIds]);

  useEffect(() => {
    let active = true;
    const fetchMsgs = async () => {
      try {
        const all = await db.getMessages();
        if (active) {
          setMessages(
            all.filter(
              (m) =>
                m.customerId === user.id || isPhoneMatch(m.phone, user.phone),
            ),
          );
        }
      } catch (err) {
        console.error("Error loading chat in profile modal:", err);
      }
    };
    fetchMsgs();

    const interval = setInterval(fetchMsgs, 15000); // live updates fallback
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    if (tab === "messages" && messages.length > 0) {
      const adminMessages = messages.filter((m) => {
        const isFromAdmin =
          m.message === "Ujumbe kutoka Orbi Shop" ||
          m.message === "Admin initiated dummy" ||
          m.message === "Ujumbe toka kwa Admin" ||
          m.message === "Ujumbe toka kwa Orbi Shop" ||
          !!m.adminReply;
        return isFromAdmin;
      });

      const adminMsgIds = adminMessages.map((m) => m.id);
      const unreadIds = adminMsgIds.filter((id) => !localReadIds.includes(id));

      // 1. Mark in localStorage
      if (unreadIds.length > 0) {
        const updated = Array.from(new Set([...localReadIds, ...unreadIds]));
        setLocalReadIds(updated);
        localStorage.setItem(
          "orbishop_read_reply_ids",
          JSON.stringify(updated),
        );
        window.dispatchEvent(new Event("storage"));
      }

      // 2. Mark in database and state for those whose isRead is not yet true
      const dbUnreadMsgs = adminMessages.filter((m) => !m.isRead);
      if (dbUnreadMsgs.length > 0) {
        dbUnreadMsgs.forEach((m) => {
          db.saveMessage({ ...m, isRead: true }).catch(console.error);
        });

        setMessages((prev: Message[]) =>
          prev.map((msg) => {
            const isMatch = dbUnreadMsgs.some((u) => u.id === msg.id);
            if (isMatch) {
              return { ...msg, isRead: true };
            }
            return msg;
          }),
        );
      }
    }
  }, [tab, messages, localReadIds]);

  const sendProfileMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalMsgText = profileMsgText.trim();
    if ((!finalMsgText && !attachedMediaUrl) || isSendingMsg) return;

    setIsSendingMsg(true);
    try {
      let finalMessage = finalMsgText;
      if (attachedMediaUrl) {
        finalMessage = finalMessage
          ? `${finalMessage} [MEDIA:${attachedMediaUrl}]`
          : `[MEDIA:${attachedMediaUrl}]`;
      }

      const newMsg: Message = {
        id: "MSG-" + Date.now(),
        name: user.name,
        phone: user.phone,
        message: finalMessage,
        date: Date.now(),
        customerId: user.id,
      };
      await db.saveMessage(newMsg);
      setProfileMsgText("");
      setAttachedMediaUrl("");
      setAttachedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      const all = await db.getMessages();
      setMessages(
        all.filter(
          (m) => m.customerId === user.id || isPhoneMatch(m.phone, user.phone),
        ),
      );
    } catch (err: any) {
      console.error(err);
      showAlert(
        lang === "sw"
          ? "Ujumbe haukutuma. Jaribu tena."
          : "Failed to send message. Please try again.",
        "error",
      );
    } finally {
      setIsSendingMsg(false);
    }
  };

  const joinedDate = useMemo(() => {
    if (!user.registeredAt) return "";
    return new Date(user.registeredAt).toLocaleDateString(
      lang === "sw" ? "sw-TZ" : "en-US",
      { month: "short", year: "numeric" },
    );
  }, [user.registeredAt, lang]);

  const pPoints = getLoyaltyPoints(user.id);

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      showAlert(
        lang === "sw" ? "Jina haliwezi kuwa tupu!" : "Name cannot be empty!",
        "error",
      );
      return;
    }
    if (!editPhone.trim()) {
      showAlert(
        lang === "sw"
          ? "Namba ya simu haiwezi kuwa tupu!"
          : "Phone cannot be empty!",
        "error",
      );
      return;
    }
    setIsSavingProfile(true);
    try {
      await db.updateCustomer(user.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim(),
      });

      localStorage.setItem(
        "orbi_user_default_address_" + user.id,
        editAddress.trim(),
      );

      const updatedUser = {
        ...user,
        name: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim(),
      };
      localStorage.setItem("Orbishop_customers", JSON.stringify(updatedUser));

      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
      setIsEditMode(false);
      showAlert(
        lang === "sw"
          ? "Taarifa zako zimesasishwa kikamilifu!"
          : "Your details have been successfully updated!",
        "success",
      );
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error("Failed to update profile", err);
      showAlert(
        lang === "sw"
          ? "Imeshindwa kuhifadhi taarifa: " + err.message
          : "Failed to update profile: " + err.message,
        "error",
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 py-6 md:py-8 flex flex-col h-full animate-fade-in transition-all duration-300 ${
        tab === "messages"
          ? "max-w-5xl min-[720px]:mr-[400px] md:mr-[440px] min-[720px]:w-[calc(100%-400px)] md:w-[calc(100%-440px)] min-[720px]:max-w-none"
          : "max-w-5xl"
      }`}
    >
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
          <span className="p-1.5 bg-primary/10 rounded-xl text-primary shrink-0">
            <User size={22} className="sm:w-6 sm:h-6" />
          </span>
          {lang === "sw" ? "Profaili ya Mteja" : "Customer Profile"}
        </h2>
        <button
          onClick={onClose}
          className="bg-white border border-slate-200 text-slate-600 px-3.5 sm:px-5 py-2 rounded-xl hover:bg-slate-50 transition border font-bold text-xs sm:text-sm shadow-sm"
        >
          {lang === "sw" ? "Rudi Kwenye Duka" : "Back to Store"}
        </button>
      </div>

      {/* Top Profile Header Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 mb-6 sm:mb-8 items-stretch">
        {/* Left Col: Digital Loyalty Member Pass Card */}
        <div className="lg:col-span-12 xl:col-span-5 flex flex-col md:grid md:grid-cols-2 lg:grid-cols-1 xl:flex xl:flex-col gap-6">
          <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl border border-white/10 flex flex-col justify-between min-h-[220px] group transition-all duration-300 hover:shadow-2xl hover:border-white/20 select-none">
            {/* Background elements to create depth */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-amber-500/20 to-purple-500/0 rounded-full blur-xl pointer-events-none -mr-8 -mt-8" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

            {/* Ambient decorative glowing grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] opacity-400" />

            {/* Top row */}
            <div className="flex justify-between items-start z-10">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-[0.2em] text-indigo-200/80 font-mono font-bold">
                  {lang === "sw" ? "Kadi ya Uaminifu" : "Loyalty Pass"}
                </span>
                <span className="text-xs font-black mt-0.5 tracking-wide flex items-center gap-1.5 text-amber-400">
                  <Sparkles size={11} className="animate-pulse" /> ORBI CLUB
                  MEMBER
                </span>
              </div>
              <div className="bg-white/15 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider text-white uppercase border border-white/10 shadow-sm">
                {pPoints >= 300
                  ? "⭐ Gold"
                  : pPoints >= 100
                    ? "🥈 Silver"
                    : "🥉 Bronze"}
              </div>
            </div>

            {/* Mid Balance Section */}
            <div className="my-4 z-10">
              <span className="text-[9px] uppercase tracking-widest text-indigo-200/70 block mb-0.5 font-mono">
                {lang === "sw" ? "Alama Zilizolundikana" : "Accumulated Points"}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono bg-gradient-to-r from-red-200 via-amber-200 to-yellow-100 bg-clip-text text-transparent">
                  {pPoints}
                </span>
                <span className="text-[10px] text-amber-300 font-extrabold tracking-wide">
                  PTS
                </span>
              </div>
            </div>

            {/* Bottom Cardholder Row */}
            <div className="flex justify-between items-end border-t border-white/10 pt-3 z-10">
              <div className="max-w-[65%] min-w-0">
                <span className="text-[9px] uppercase tracking-wide text-indigo-200/50 block font-mono">
                  {lang === "sw" ? "Mwenye Kadi" : "Card Holder"}
                </span>
                <span
                  className="text-xs font-bold tracking-wide text-white block truncate select-all mt-0.5 font-sans"
                  title={user.name}
                >
                  {user.name}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[9px] uppercase tracking-wide text-indigo-200/50 block font-mono">
                  {lang === "sw" ? "Tangu" : "Joined"}
                </span>
                <span className="text-xs font-bold tracking-wide text-indigo-100 block mt-0.5 font-mono">
                  {joinedDate || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Helper for MD screens Grid */}
          <div className="hidden md:flex lg:hidden xl:flex flex-col bg-white border border-slate-200 p-5 rounded-3xl justify-between shadow-sm min-h-[220px]">
            <div>
              <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 font-mono block mb-1">
                {lang === "sw" ? "Uchambuzi wa Alama" : "Points Analytics"}
              </span>
              <h4 className="text-sm font-bold text-slate-700 leading-snug">
                {lang === "sw"
                  ? "Unahitaji alama 100 kufikia ngazi inayofuata!"
                  : "Collect more points to redeem discount vouchers!"}
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {lang === "sw"
                  ? "Kila oda unayofanya inakuletea alama za uaminifu ambazo unaweza kuzibadilisha kuwa vocha za punguzo papo hapo!"
                  : "Your purchases generate valuable credit you can convert directly into shipping and shopping discount vouchers!"}
              </p>
            </div>
            <div className="border-t border-slate-100 pt-3 text-[11px] font-semibold text-primary flex items-center gap-1">
              <Sparkles size={14} className="text-amber-500 shrink-0" />
              <span>
                {lang === "sw"
                  ? "Tumia tab ya Zawadi kukomboa sasa!"
                  : "Go to Loyalty Rewards tab to redeem!"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Details Hub Section */}
        <div className="lg:col-span-12 xl:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5 sm:mb-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  {lang === "sw" ? "Taarifa za Profaili" : "Profile Details"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === "sw"
                    ? "Tazama na badili taarifa zako za mawasiliano."
                    : "View and update your personal contact info directly."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onLogout) {
                        onLogout();
                        onClose();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/40 shadow-sm"
                  >
                    <LogOut size={13} />
                    <span>{lang === "sw" ? "Ondoka" : "Logout"}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (isEditMode) {
                      setEditName(user.name);
                      setEditPhone(user.phone);
                      setEditEmail(user.email);
                      setEditAddress(
                        localStorage.getItem(
                          "orbi_user_default_address_" + user.id,
                        ) ||
                          (user as any).address ||
                          "",
                      );
                    }
                    setIsEditMode(!isEditMode);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isEditMode
                      ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  {isEditMode ? (
                    <>
                      <X size={13} />
                      {lang === "sw" ? "Ghairi" : "Cancel"}
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      {lang === "sw" ? "Hariri" : "Edit Details"}
                    </>
                  )}
                </button>
              </div>
            </div>

            {isEditMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* JINA */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                    {lang === "sw" ? "Jina Kamili" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>
                {/* SIMU */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                    {lang === "sw" ? "Namba ya Simu" : "Phone Number"}
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>
                {/* EMAIL */}
                <div className="flex flex-col sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                    {lang === "sw" ? "Barua Pepe" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>
                {/* ADDRESS */}
                <div className="flex flex-col sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                    {lang === "sw"
                      ? "Anwani ya Uwasilishaji"
                      : "Default Delivery Address"}
                  </label>
                  <textarea
                    rows={2}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                    placeholder={
                      lang === "sw"
                        ? "Mfano: Barabara ya Bagamoyo, Kijitonyama, Dar es Salaam"
                        : "e.g. Bagamoyo Road, Kijitonyama, Dar es Salaam"
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 sm:gap-y-4">
                {/* Name */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/50 border border-slate-100 flex-1 min-w-0">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-500 mt-0.5 shrink-0">
                    <User size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] uppercase tracking-wide text-slate-400 font-mono block font-bold">
                      {lang === "sw" ? "Majina" : "Full Name"}
                    </span>
                    <span
                      className="text-xs sm:text-sm font-semibold text-slate-700 block truncate"
                      title={user.name}
                    >
                      {user.name}
                    </span>
                  </div>
                </div>
                {/* Phone */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/50 border border-slate-100 flex-1 min-w-0">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-500 mt-0.5 shrink-0">
                    <Phone size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] uppercase tracking-wide text-slate-400 font-mono block font-bold">
                      {lang === "sw" ? "Namba ya Simu" : "Phone Number"}
                    </span>
                    <span
                      className="text-xs sm:text-sm font-semibold text-slate-700 block truncate"
                      title={user.phone}
                    >
                      {user.phone || "N/A"}
                    </span>
                  </div>
                </div>
                {/* Email */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/50 border border-slate-100 sm:col-span-2 min-w-0">
                  <div className="p-2 rounded-xl bg-teal-50 text-teal-600 mt-0.5 shrink-0">
                    <Mail size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] uppercase tracking-wide text-slate-400 font-mono block font-bold">
                      {lang === "sw" ? "Barua Pepe" : "Email Address"}
                    </span>
                    <span
                      className="text-xs sm:text-sm font-semibold text-slate-700 block break-all"
                      title={user.email}
                    >
                      {user.email || "N/A"}
                    </span>
                  </div>
                </div>
                {/* Address */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/50 border border-slate-100 sm:col-span-2 min-w-0">
                  <div className="p-2 rounded-xl bg-orange-50 text-orange-500 mt-0.5 shrink-0">
                    <MapPin size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] uppercase tracking-wide text-slate-400 font-mono block font-bold">
                      {lang === "sw"
                        ? "Anwani ya Kufikisha"
                        : "Delivery Address"}
                    </span>
                    <span
                      className="text-xs sm:text-sm font-semibold text-slate-700 block break-words"
                      title={editAddress}
                    >
                      {editAddress ||
                        (lang === "sw"
                          ? "Sio sifa bado. Hariri kuongeza."
                          : "Not set yet. Edit profile to write address.")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save Button for Edit Mode */}
          {isEditMode && (
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                disabled={isSavingProfile}
                onClick={handleSaveProfile}
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md shadow-indigo-200/50 transition duration-150 flex items-center justify-center gap-2"
              >
                {isSavingProfile ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {lang === "sw" ? "Inahifadhi..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {lang === "sw" ? "Hifadhi Taarifa" : "Save Profile Details"}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        id="orbi-portal-tabs-container"
        className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1"
      >
        {/* On Desktop/Tablet: Classic Top Header Row */}
        <div className="hidden sm:flex border-b border-slate-100 bg-slate-50/70 overflow-x-auto scrollbar-none sticky top-0 z-20 backdrop-blur-md">
          <button
            onClick={() => setTab("orders")}
            className={`px-4 sm:px-6 py-3.5 sm:py-4 font-bold flex items-center justify-center gap-2 border-b-2 transition text-xs sm:text-sm shrink-0 flex-1 sm:flex-initial ${tab === "orders" ? "border-primary text-primary bg-white" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/50"}`}
          >
            <Package size={16} className="shrink-0" />{" "}
            <span>{lang === "sw" ? "Manunuzi Yangu" : "My Orders"}</span>
          </button>
          <button
            onClick={() => setTab("track")}
            className={`px-4 sm:px-6 py-3.5 sm:py-4 font-bold flex items-center justify-center gap-2 border-b-2 transition text-xs sm:text-sm shrink-0 flex-1 sm:flex-initial ${tab === "track" ? "border-primary text-primary bg-white" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/50"}`}
          >
            <Clock size={16} className="shrink-0" />{" "}
            <span>{lang === "sw" ? "Fuatilia Oda" : "Track Order"}</span>
          </button>
          <button
            onClick={() => setTab("messages")}
            className={`px-4 sm:px-6 py-3.5 sm:py-4 font-bold flex items-center justify-center gap-2 border-b-2 transition text-xs sm:text-sm shrink-0 relative flex-1 sm:flex-initial ${tab === "messages" ? "border-primary text-primary bg-white" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/50"}`}
          >
            <MessageSquare size={16} className="shrink-0" />
            <span>{lang === "sw" ? "Mawasiliano" : "Messages"}</span>
            {tabUnreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none animate-pulse shrink-0">
                {tabUnreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("rewards")}
            className={`px-4 sm:px-6 py-3.5 sm:py-4 font-bold flex items-center justify-center gap-2 border-b-2 transition text-xs sm:text-sm shrink-0 relative flex-1 sm:flex-initial ${tab === "rewards" ? "border-primary text-primary bg-white" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/50"}`}
          >
            <Sparkles size={16} className="text-amber-500 shrink-0" />
            <span>{lang === "sw" ? "Zawadi & Alama" : "Loyalty Rewards"}</span>
          </button>
          <button
            onClick={() => setTab("locator")}
            className={`px-4 sm:px-6 py-3.5 sm:py-4 font-bold flex items-center justify-center gap-2 border-b-2 transition text-xs sm:text-sm shrink-0 relative flex-1 sm:flex-initial ${tab === "locator" ? "border-primary text-primary bg-white" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/50"}`}
          >
            <MapPin size={16} className="text-orange-500 shrink-0" />
            <span>{lang === "sw" ? "Zamani & Usafiri" : "Carrier Map"}</span>
          </button>
        </div>

        {/* On Mobile: Native-like 5-column grid with icons and short, auto-adjusting text */}
        <div className="flex sm:hidden border-b border-slate-100 bg-slate-50/90 py-1.5 sticky top-0 z-20 backdrop-blur-md w-full justify-around items-center gap-0.5 px-0.5 select-none overflow-hidden">
          {/* Button 1: Orders */}
          <button
            type="button"
            onClick={() => setTab("orders")}
            className={`flex flex-col items-center justify-center flex-1 min-w-0 py-1 rounded-xl transition-all duration-150 ${
              tab === "orders"
                ? "text-primary bg-primary/5 font-black scale-[1.03]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Package
              size={17}
              className={`shrink-0 mb-0.5 ${tab === "orders" ? "text-primary" : "text-slate-400"}`}
            />
            <span className="text-[10px] tracking-tight font-semibold text-center truncate w-full px-0.5 block leading-none">
              {lang === "sw" ? "Oda" : "Orders"}
            </span>
          </button>

          {/* Button 2: Track */}
          <button
            type="button"
            onClick={() => setTab("track")}
            className={`flex flex-col items-center justify-center flex-1 min-w-0 py-1 rounded-xl transition-all duration-150 ${
              tab === "track"
                ? "text-primary bg-primary/5 font-black scale-[1.03]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Clock
              size={17}
              className={`shrink-0 mb-0.5 ${tab === "track" ? "text-primary" : "text-slate-400"}`}
            />
            <span className="text-[10px] tracking-tight font-semibold text-center truncate w-full px-0.5 block leading-none">
              {lang === "sw" ? "Fuatilia" : "Track"}
            </span>
          </button>

          {/* Button 3: Messages */}
          <button
            type="button"
            onClick={() => setTab("messages")}
            className={`flex flex-col items-center justify-center flex-1 min-w-0 py-1 rounded-xl transition-all duration-150 relative ${
              tab === "messages"
                ? "text-primary bg-primary/5 font-black scale-[1.03]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <div className="relative leading-none">
              <MessageSquare
                size={17}
                className={`shrink-0 mb-0.5 ${tab === "messages" ? "text-primary" : "text-slate-400"}`}
              />
              {tabUnreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold px-1 py-0.2 rounded-full leading-none animate-pulse shrink-0">
                  {tabUnreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight font-semibold text-center truncate w-full px-0.5 block leading-none">
              {lang === "sw" ? "Chat" : "Chat"}
            </span>
          </button>

          {/* Button 4: Rewards */}
          <button
            type="button"
            onClick={() => setTab("rewards")}
            className={`flex flex-col items-center justify-center flex-1 min-w-0 py-1 rounded-xl transition-all duration-150 ${
              tab === "rewards"
                ? "text-primary bg-primary/5 font-black scale-[1.03]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Sparkles
              size={17}
              className={`shrink-0 mb-0.5 ${tab === "rewards" ? "text-amber-500" : "text-amber-600/70"}`}
            />
            <span className="text-[10px] tracking-tight font-semibold text-center truncate w-full px-0.5 block leading-none">
              {lang === "sw" ? "Zawadi" : "Rewards"}
            </span>
          </button>

          {/* Button 5: Carrier Map */}
          <button
            type="button"
            onClick={() => setTab("locator")}
            className={`flex flex-col items-center justify-center flex-1 min-w-0 py-1 rounded-xl transition-all duration-150 ${
              tab === "locator"
                ? "text-primary bg-primary/5 font-black scale-[1.03]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <MapPin
              size={17}
              className={`shrink-0 mb-0.5 ${tab === "locator" ? "text-orange-500" : "text-orange-600/70"}`}
            />
            <span className="text-[10px] tracking-tight font-semibold text-center truncate w-full px-0.5 block leading-none">
              {lang === "sw" ? "Ramani" : "Map"}
            </span>
          </button>
        </div>

        <div className="p-3 sm:p-6 flex-1 overflow-y-auto bg-slate-50/50">
          {tab === "orders" && (
            <div className="space-y-4">
              {localOrders.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p>
                    {lang === "sw"
                      ? "Hauna oda yoyote bado."
                      : "You have no orders yet."}
                  </p>
                </div>
              ) : (
                localOrders.map((o) => {
                  const statusUpper = o.status
                    ? o.status.toUpperCase()
                    : "CREATED";
                  const payStatus = o.paymentStatus || "requires_action";

                  return (
                    <div
                      key={o.id}
                      className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex-1 w-full">
                        <h3 className="font-bold text-slate-800 text-lg">
                          Oda #{formatOrderNumber(o)}
                        </h3>
                        <div className="text-sm text-slate-500 mb-2">
                          {new Date(o.date).toLocaleString()}
                        </div>
                        <div className="flex gap-2 items-center font-bold flex-wrap">
                          <span
                            className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-[10px] md:text-xs px-2.5 py-1 rounded-full font-black uppercase tracking-wider text-center shrink-0 border shadow-sm ${
                              statusUpper === "PAYMENT_HELD" ||
                              statusUpper === "PROCESSING"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : statusUpper === "SHIPPED"
                                  ? "bg-sky-50 text-sky-700 border-sky-300 animate-pulse"
                                  : statusUpper === "DELIVERED"
                                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                    : statusUpper === "BUYER_CONFIRMED"
                                      ? "bg-teal-50 text-teal-700 border-teal-200"
                                      : statusUpper === "RELEASED"
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                        : statusUpper === "DISPUTED"
                                          ? "bg-rose-50 text-rose-700 border-rose-300"
                                          : statusUpper === "CANCELLED" ||
                                              statusUpper === "REFUNDED"
                                            ? "bg-red-50 text-red-700 border-red-200"
                                            : "bg-amber-50 text-amber-700 border-amber-250"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                statusUpper === "RELEASED"
                                  ? "bg-emerald-500"
                                  : statusUpper === "DISPUTED"
                                    ? "bg-rose-500"
                                    : statusUpper === "SHIPPED"
                                      ? "bg-sky-500 animate-ping"
                                      : "bg-current"
                              }`}
                            ></span>
                            {statusUpper === "CREATED" &&
                              (lang === "sw" ? "Imepokelewa" : "Created")}
                            {statusUpper === "AWAITING_PAYMENT" &&
                              (lang === "sw"
                                ? "Inasubiri Malipo"
                                : "Awaiting Payment")}
                            {statusUpper === "PAYMENT_HELD" &&
                              (lang === "sw"
                                ? "Yameshikiliwa"
                                : "Payment Held")}
                            {statusUpper === "PROCESSING" &&
                              (lang === "sw" ? "Inandaliwa" : "Processing")}
                            {statusUpper === "SHIPPED" &&
                              (lang === "sw" ? "Mzigo Njiani" : "Transit")}
                            {statusUpper === "DELIVERED" &&
                              (lang === "sw"
                                ? "Imefika / Thibitisha"
                                : "Delivered / Confirm Receipt")}
                            {statusUpper === "BUYER_CONFIRMED" &&
                              (lang === "sw"
                                ? "Thibitisho Limepokelewa"
                                : "Receipt Confirmed")}
                            {statusUpper === "DISPUTED" &&
                              (lang === "sw"
                                ? "Iko Kwenye Mgogoro"
                                : "Disputed (Escrow Held)")}
                            {statusUpper === "RELEASED" &&
                              (lang === "sw"
                                ? "Fedha Zimechukuliwa"
                                : "Completed & Disbursed")}
                            {statusUpper === "REFUNDED" &&
                              (lang === "sw" ? "Imerejeshwa" : "Refunded")}
                            {statusUpper === "CANCELLED" &&
                              (lang === "sw" ? "Imeghairiwa" : "Cancelled")}
                          </span>
                          <span className="text-slate-700">
                            <PriceDisplay
                              amount={o.total}
                              size="sm"
                              colorClass="text-slate-700"
                            />
                          </span>
                        </div>

                        {/* Real-time Order Tracking Status Indicator */}
                        {statusUpper === "CANCELLED" ||
                        statusUpper === "REFUNDED" ? (
                          <div className="mt-4 p-3 bg-red-50 border border-red-150 rounded-xl flex items-center gap-2.5 text-xs text-red-800 font-medium">
                            <span className="p-1 px-2.5 bg-red-100 rounded-lg text-red-600 font-extrabold text-xs">
                              ✕
                            </span>
                            <div>
                              <p className="font-extrabold text-red-900">
                                {lang === "sw"
                                  ? "Oda Imeghairiwa au Rejerewa"
                                  : "Order Cancelled / Refunded"}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {lang === "sw"
                                  ? "Oda hii imefutwa au kiasi kurudishwa kwa mnunuzi."
                                  : "This order was cancelled or refunded to the buyer secure ledger."}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 mb-4 p-4 bg-slate-50/80 border border-slate-100 rounded-2xl md:max-w-md w-full">
                            <div className="flex items-center justify-between mb-3 text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                              {statusUpper === "BUYER_CONFIRMED" ||
                              statusUpper === "RELEASED" ? (
                                <span className="flex items-center gap-1 text-emerald-600 font-extrabold tracking-wider">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                  {lang === "sw"
                                    ? "Agizo Limekamilika"
                                    : "Order Completed"}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-orange-600 font-extrabold tracking-wider animate-pulse">
                                  <span className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-ping"></span>
                                  {lang === "sw"
                                    ? "Mchakato wa Kusafirisha"
                                    : "Order Transit Progress"}
                                </span>
                              )}
                              <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-100">
                                {(statusUpper === "CREATED" ||
                                  statusUpper === "AWAITING_PAYMENT") &&
                                  (lang === "sw" ? "Inasubiri" : "Pending")}
                                {(statusUpper === "PAYMENT_HELD" ||
                                  statusUpper === "PROCESSING") &&
                                  (lang === "sw"
                                    ? "Imeidhinishwa"
                                    : "Processing")}
                                {statusUpper === "SHIPPED" &&
                                  (lang === "sw"
                                    ? o.riderName
                                      ? "Imesafirishwa / " + o.riderName
                                      : "Imesafirishwa"
                                    : o.riderName
                                      ? "Transit / " + o.riderName
                                      : "Transit")}
                                {[
                                  "DELIVERED",
                                  "BUYER_CONFIRMED",
                                  "RELEASED",
                                ].includes(statusUpper) &&
                                  (lang === "sw" ? "Imepokelewa" : "Delivered")}
                              </span>
                            </div>

                            {/* Stepper Steps Wrapper with horizontal scrolling on ultra-small mobile screen */}
                            <div className="overflow-x-auto no-scrollbar -mx-2 px-2 py-1">
                              <div className="relative flex items-center justify-between min-w-[340px] w-full mt-2.5 px-0.5">
                                {/* Stepper background line */}
                                <div className="absolute left-[33px] right-[33px] top-[14px] h-0.5 bg-slate-200 z-0"></div>
                                {/* Stepper travel line progress bar */}
                                <div
                                  className="absolute left-[33px] top-[14px] h-0.5 bg-gradient-to-r from-emerald-500 to-indigo-500 z-0 transition-all duration-700 ease-in-out"
                                  style={{
                                    width:
                                      statusUpper === "CREATED" ||
                                      statusUpper === "AWAITING_PAYMENT"
                                        ? "0%"
                                        : statusUpper === "PAYMENT_HELD" ||
                                            statusUpper === "PROCESSING"
                                          ? "33%"
                                          : statusUpper === "SHIPPED"
                                            ? "66%"
                                            : "100%",
                                  }}
                                ></div>

                                {/* Node 1: Placed */}
                                <div className="flex flex-col items-center z-10 relative">
                                  <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                                    <Check size={10} className="stroke-[3]" />
                                  </div>
                                  <span className="text-[9px] font-extrabold text-slate-700 mt-1 text-center whitespace-nowrap">
                                    {lang === "sw" ? "Imewekwa" : "Placed"}
                                  </span>
                                </div>

                                {/* Node 2: Confirmed */}
                                <div className="flex flex-col items-center z-10 relative">
                                  <div
                                    className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black shadow-sm transition-all duration-500 ${
                                      [
                                        "PAYMENT_HELD",
                                        "PROCESSING",
                                        "SHIPPED",
                                        "DELIVERED",
                                        "BUYER_CONFIRMED",
                                        "RELEASED",
                                      ].includes(statusUpper)
                                        ? "bg-emerald-500 text-white"
                                        : "bg-slate-100 text-slate-400"
                                    }`}
                                  >
                                    {[
                                      "PAYMENT_HELD",
                                      "PROCESSING",
                                      "SHIPPED",
                                      "DELIVERED",
                                      "BUYER_CONFIRMED",
                                      "RELEASED",
                                    ].includes(statusUpper) ? (
                                      <Check size={10} className="stroke-[3]" />
                                    ) : (
                                      <span>2</span>
                                    )}
                                  </div>
                                  <span
                                    className={`text-[9px] font-extrabold mt-1 text-center whitespace-nowrap ${
                                      [
                                        "PAYMENT_HELD",
                                        "PROCESSING",
                                        "SHIPPED",
                                        "DELIVERED",
                                        "BUYER_CONFIRMED",
                                        "RELEASED",
                                      ].includes(statusUpper)
                                        ? "text-slate-700"
                                        : "text-slate-400 font-medium"
                                    }`}
                                  >
                                    {lang === "sw"
                                      ? "Imeandaliwa"
                                      : "Processing"}
                                  </span>
                                </div>

                                {/* Node 3: Shipped */}
                                <div className="flex flex-col items-center z-10 relative">
                                  <div
                                    className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black shadow-sm transition-all duration-500 ${
                                      [
                                        "SHIPPED",
                                        "DELIVERED",
                                        "BUYER_CONFIRMED",
                                        "RELEASED",
                                      ].includes(statusUpper)
                                        ? "bg-indigo-500 text-white"
                                        : "bg-slate-100 text-slate-400"
                                    } ${statusUpper === "SHIPPED" ? "animate-bounce" : ""}`}
                                  >
                                    {[
                                      "SHIPPED",
                                      "DELIVERED",
                                      "BUYER_CONFIRMED",
                                      "RELEASED",
                                    ].includes(statusUpper) ? (
                                      <Truck
                                        size={10}
                                        className="stroke-[2.5]"
                                      />
                                    ) : (
                                      <span>3</span>
                                    )}
                                  </div>
                                  <span
                                    className={`text-[9px] font-extrabold mt-1 text-center whitespace-nowrap ${
                                      [
                                        "SHIPPED",
                                        "DELIVERED",
                                        "BUYER_CONFIRMED",
                                        "RELEASED",
                                      ].includes(statusUpper)
                                        ? "text-slate-700"
                                        : "text-slate-400 font-medium"
                                    }`}
                                  >
                                    {lang === "sw"
                                      ? "Imesafilishwa"
                                      : "In Transit"}
                                  </span>
                                </div>

                                {/* Node 4: Delivered */}
                                <div className="flex flex-col items-center z-10 relative">
                                  <div
                                    className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black shadow-sm transition-all duration-500 ${
                                      [
                                        "DELIVERED",
                                        "BUYER_CONFIRMED",
                                        "RELEASED",
                                        "ARCHIVED",
                                      ].includes(statusUpper)
                                        ? "bg-emerald-600 text-white"
                                        : "bg-slate-100 text-slate-400"
                                    }`}
                                  >
                                    {[
                                      "DELIVERED",
                                      "BUYER_CONFIRMED",
                                      "RELEASED",
                                      "ARCHIVED",
                                    ].includes(statusUpper) ? (
                                      <Gift
                                        size={10}
                                        className="stroke-[2.5]"
                                      />
                                    ) : (
                                      <span>4</span>
                                    )}
                                  </div>
                                  <span
                                    className={`text-[9px] font-extrabold mt-1 text-center whitespace-nowrap ${
                                      [
                                        "DELIVERED",
                                        "BUYER_CONFIRMED",
                                        "RELEASED",
                                        "ARCHIVED",
                                      ].includes(statusUpper)
                                        ? "text-emerald-700 font-bold"
                                        : "text-slate-400 font-medium"
                                    }`}
                                  >
                                    {lang === "sw"
                                      ? "Imepokelewa"
                                      : "Delivered"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Interactive Courier alert block for In Transit */}
                            {statusUpper === "SHIPPED" && (
                              <div className="mt-4 p-2 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between text-[10px] text-indigo-900 font-semibold gap-1.5 animate-in fade-in duration-300">
                                <span className="flex items-center gap-1">
                                  <Truck
                                    size={11}
                                    className="text-indigo-600 animate-pulse"
                                  />
                                  <span>
                                    {lang === "sw"
                                      ? o.riderName
                                        ? `Msafirishaji ${o.riderName}${o.riderPhone ? " (Simu: " + o.riderPhone + ")" : ""}${o.riderVehicle ? ", Chombo: " + o.riderVehicle : ""} yuko njiani kuleta mzigo!`
                                        : "Msafirishaji wetu yuko njiani kuleta mzigo!"
                                      : o.riderName
                                        ? `Rider ${o.riderName}${o.riderPhone ? " (Phone: " + o.riderPhone + ")" : ""}${o.riderVehicle ? ", Vehicle: " + o.riderVehicle : ""} is delivering your package!`
                                        : "Our courier is currently delivering your package!"}
                                  </span>
                                </span>
                                <button
                                  onClick={() => {
                                    setTrackOrderId(o.id);
                                    setTab("track");
                                    handleTrackSearch(o.id);
                                  }}
                                  className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded text-[9px] transition cursor-pointer"
                                >
                                  {lang === "sw" ? "Fungua Ramani" : "Open Map"}
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Database-synced Payment Reference with Reset capability */}
                        {o.status !== "cancelled" && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase">
                              {lang === "sw"
                                ? "UHAKIKI WA MALIPO:"
                                : "PAYMENT VERIFICATION:"}
                            </span>
                            {o.paymentReference ? (
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 bg-amber-50 rounded-lg border border-orange-200 text-orange-700 font-mono font-bold text-[10px] tracking-wider">
                                  REF: {o.paymentReference}
                                </span>
                                <button
                                  onClick={async () => {
                                    if (
                                      window.confirm(
                                        lang === "sw"
                                          ? "Je, unataka kuweka upya uhakiki wa malipo?"
                                          : "Do you want to reset the payment verification?",
                                      )
                                    ) {
                                      try {
                                        await db.saveOrder({
                                          id: o.id,
                                          paymentReference: "",
                                        });
                                        const proofs = JSON.parse(
                                          localStorage.getItem(
                                            "orbi_payment_proofs",
                                          ) || "{}",
                                        );
                                        delete proofs[o.id];
                                        delete proofs[
                                          (o as any).legacy_id || ""
                                        ];
                                        localStorage.setItem(
                                          "orbi_payment_proofs",
                                          JSON.stringify(proofs),
                                        );
                                        if (onRefresh) onRefresh();
                                      } catch (err) {
                                        console.error(
                                          "Failed to reset proof:",
                                          err,
                                        );
                                      }
                                    }
                                  }}
                                  className="text-[10px] text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer ml-1"
                                >
                                  {lang === "sw"
                                    ? "Anza Upya (Reset)"
                                    : "Reset"}
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-slate-400 italic text-[11px] font-medium mr-1">
                                  {lang === "sw"
                                    ? "Bado haujathibitishwa"
                                    : "Not submitted yet"}
                                </span>

                                <div className="flex items-center gap-1.5 mt-1 sm:mt-0">
                                  <input
                                    type="text"
                                    placeholder={
                                      lang === "sw"
                                        ? "Namba ya muamala (Mf. PK8123..)"
                                        : "Transaction reference (e.g. PK8123..)"
                                    }
                                    id={`ref-input-${o.id}`}
                                    className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold uppercase focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary w-40 sm:w-48 placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
                                    onKeyDown={async (e) => {
                                      if (e.key === "Enter") {
                                        const val = (
                                          e.target as HTMLInputElement
                                        ).value.trim();
                                        if (!val) return;
                                        try {
                                          await db.saveOrder({
                                            id: o.id,
                                            paymentReference: val.toUpperCase(),
                                          });
                                          const proofs = JSON.parse(
                                            localStorage.getItem(
                                              "orbi_payment_proofs",
                                            ) || "{}",
                                          );
                                          proofs[o.id] = {
                                            transactionId: val.toUpperCase(),
                                            timestamp: Date.now(),
                                            status: "pending_verification",
                                          };
                                          localStorage.setItem(
                                            "orbi_payment_proofs",
                                            JSON.stringify(proofs),
                                          );
                                          showAlert(
                                            lang === "sw"
                                              ? "Thibitisho la malipo limewasilishwa!"
                                              : "Payment reference submitted successfully!",
                                            "success",
                                          );
                                          if (onRefresh) onRefresh();
                                        } catch (err: any) {
                                          showAlert(
                                            lang === "sw"
                                              ? "Imeshindwa kuhifadhi: " +
                                                  err.message
                                              : "Failed to save: " +
                                                  err.message,
                                            "error",
                                          );
                                        }
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={async () => {
                                      const input = document.getElementById(
                                        `ref-input-${o.id}`,
                                      ) as HTMLInputElement;
                                      const val = input?.value.trim() || "";
                                      if (!val) {
                                        showAlert(
                                          lang === "sw"
                                            ? "Ingiza namba ya muamala kwanza!"
                                            : "Enter transaction reference first!",
                                          "error",
                                        );
                                        return;
                                      }
                                      try {
                                        await db.saveOrder({
                                          id: o.id,
                                          paymentReference: val.toUpperCase(),
                                        });
                                        const proofs = JSON.parse(
                                          localStorage.getItem(
                                            "orbi_payment_proofs",
                                          ) || "{}",
                                        );
                                        proofs[o.id] = {
                                          transactionId: val.toUpperCase(),
                                          timestamp: Date.now(),
                                          status: "pending_verification",
                                        };
                                        localStorage.setItem(
                                          "orbi_payment_proofs",
                                          JSON.stringify(proofs),
                                        );
                                        showAlert(
                                          lang === "sw"
                                            ? "Thibitisho la malipo limewasilishwa!"
                                            : "Payment reference submitted successfully!",
                                          "success",
                                        );
                                        if (onRefresh) onRefresh();
                                      } catch (err: any) {
                                        showAlert(
                                          lang === "sw"
                                            ? "Imeshindwa kuhifadhi: " +
                                                err.message
                                            : "Failed to save: " + err.message,
                                          "error",
                                        );
                                      }
                                    }}
                                    className="text-white bg-orange-500 hover:bg-orange-600 font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition cursor-pointer shadow-sm shadow-orange-500/10"
                                  >
                                    {lang === "sw" ? "Wasilisha" : "Submit"}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5 flex flex-col gap-2">
                          <p className="text-xs font-semibold text-slate-500 uppercase pb-1">
                            {lang === "sw" ? "Bidhaa:" : "Items:"}
                          </p>
                          {o.items.map((item) => (
                            <div
                              key={item.productId}
                              className="text-sm text-slate-700 flex gap-2"
                            >
                              <span className="font-bold">
                                {item.quantity}x
                              </span>{" "}
                              <span
                                className="truncate max-w-[200px]"
                                title={item.name}
                              >
                                {item.name}
                              </span>
                              {[
                                "DELIVERED",
                                "BUYER_CONFIRMED",
                                "RELEASED",
                                "ARCHIVED",
                              ].includes(statusUpper) && (
                                <button
                                  onClick={() => {
                                    onWriteReview?.(item.productId, item.name);
                                  }}
                                  className="ml-2 font-bold text-[10px] text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded border border-amber-100 transition whitespace-nowrap cursor-pointer"
                                >
                                  {lang === "sw"
                                    ? "Andika Uhakiki"
                                    : "Write Review"}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5 flex flex-col justify-center min-w-[200px] gap-2">
                          {[
                            "CREATED",
                            "AWAITING_PAYMENT",
                            "PAYMENT_HELD",
                            "PROCESSING",
                            "SHIPPED",
                            "DELIVERED",
                            "BUYER_CONFIRMED",
                            "RELEASED",
                            "ARCHIVED",
                          ].includes(statusUpper) ? (
                            <div className="flex flex-col gap-2 w-full">
                              <button
                                onClick={() => onViewInvoice(o)}
                                className="bg-primary hover:bg-slate-800 text-white w-full md:w-auto px-5 py-2.5 rounded-lg font-semibold text-sm transition focus:ring-2 focus:ring-accent outline-none whitespace-nowrap inline-flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                              >
                                <span className="w-4 h-4">
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                  </svg>
                                </span>
                                {[
                                  "DELIVERED",
                                  "BUYER_CONFIRMED",
                                  "RELEASED",
                                  "ARCHIVED",
                                ].includes(statusUpper)
                                  ? lang === "sw"
                                    ? "Pakua / Angalia Risiti"
                                    : "Download / View Receipt"
                                  : lang === "sw"
                                    ? "Pakua / Angalia Ankara (Invoice)"
                                    : "Download / View Invoice"}
                              </button>

                              {["DELIVERED", "SHIPPED"].includes(
                                statusUpper,
                              ) && (
                                <button
                                  onClick={async () => {
                                    const confirmChoice = await showConfirm(
                                      lang === "sw"
                                        ? "Je, unathibitisha kuwa umepokea mzigo wako kikamilifu? Kufanya hivi kutatoa idhini ya kuachilia malipo kutoka kwenye Orbi Pay (Escrow) kwenda kwa muuzaji. Je, unakubali?"
                                        : "Are you sure you want to confirm that you have successfully received your order? This will release the funds from Orbi Pay (Escrow) to the seller. Do you consent to complete it now?",
                                      lang === "sw"
                                        ? "Thibitisha Pokeo la Mzigo"
                                        : "Confirm Delivery Receipt",
                                    );

                                    if (confirmChoice) {
                                      try {
                                        const updatedOrder = {
                                          ...o,
                                          status: "BUYER_CONFIRMED" as const,
                                        };
                                        await db.saveOrder(updatedOrder);

                                        // Update local states immediately
                                        setLocalOrders((prev) =>
                                          prev.map((item) =>
                                            item.id === o.id
                                              ? {
                                                  ...item,
                                                  status:
                                                    "BUYER_CONFIRMED" as const,
                                                }
                                              : item,
                                          ),
                                        );

                                        // Add notification message for admin
                                        await db.saveMessage({
                                          id: "MSG_SYS_" + Date.now(),
                                          name: "SYSTEM ALERT",
                                          phone: "SYSTEM",
                                          message: `🔔 ODA IMEKAMILIKA! Mteja ${o.customerDetails.name} (${o.customerDetails.phone}) amethibitisha kuwa amepokea mzigo wake kwa oda #${formatOrderNumber(o)}. Malipo sasa yamerelease-iwa kwa seller!`,
                                          customerId:
                                            "00000000-0000-0000-0000-000000000000",
                                          adminReply: null,
                                          isRead: false,
                                          date: Date.now(),
                                        });

                                        showAlert(
                                          lang === "sw"
                                            ? "Asante rasi! Mapokezi ya oda yako yamethibitishwa vyema. Malipo sasa yametumwa kwa seller."
                                            : "Thank you! Your delivery confirmation has been successfully recorded and payments released to the seller.",
                                          "success",
                                        );
                                        if (onRefresh) onRefresh();
                                      } catch (e: any) {
                                        showAlert(
                                          "Failed to confirm delivery: " +
                                            e.message,
                                          "error",
                                        );
                                      }
                                    }
                                  }}
                                  className="relative bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white w-full px-5 py-3 rounded-xl font-black text-xs transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 animate-pulse border-2 border-white ring-4 ring-emerald-500/30 cursor-pointer overflow-hidden group"
                                >
                                  <span
                                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"
                                    style={{ animationDuration: "1.5s" }}
                                  />
                                  <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                  </span>
                                  <span className="truncate">
                                    📥{" "}
                                    {lang === "sw" ? "Nimepokea" : "Received"}
                                  </span>
                                </button>
                              )}

                              {o.status === "delivered" && (
                                <div className="text-center p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm">
                                  <Check
                                    size={14}
                                    className="stroke-[3] text-emerald-600"
                                  />
                                  <span>
                                    {lang === "sw"
                                      ? "Masahihisho/Risiti Imekamilika"
                                      : "Receipt Completed"}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center p-2.5 bg-red-50 rounded-lg border border-red-100">
                              <p className="text-xs font-bold text-red-800">
                                {lang === "sw"
                                  ? "Oda Imeghairiwa"
                                  : "Order Cancelled"}
                              </p>
                            </div>
                          )}
                          <button
                            onClick={() => {
                              setTrackOrderId(o.id);
                              setTab("track");
                              handleTrackSearch(o.id);
                            }}
                            className="bg-sky-50 text-sky-700 hover:bg-sky-100 text-center py-2 rounded-lg font-semibold text-xs border border-sky-100 transition whitespace-nowrap inline-flex items-center justify-center gap-1.5"
                          >
                            <Clock size={12} />{" "}
                            {lang === "sw"
                              ? "Fuatilia (Live Tracker)"
                              : "Track live status"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {tab === "track" && (
            <div className="space-y-6 max-w-2xl mx-auto py-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-black text-slate-900">
                    {lang === "sw"
                      ? "Fuatilia Mzigo wa Oda yako"
                      : "Track your order status"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {lang === "sw"
                      ? "Weka namba ya oda (Order ID mapokezi) ili kuona maendeleo ya mfumo na usafirishaji."
                      : "Enter your Order ID (UUID checkout code) to view current shipment, dispatch, and confirmation states."}
                  </p>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder={
                        lang === "sw"
                          ? "Mfano: eg. 4a7c8d9e..."
                          : "E.g. 4a7c8d9e..."
                      }
                      value={trackOrderId}
                      onChange={(e) => setTrackOrderId(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleTrackSearch()
                      }
                      className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl outline-none focus:border-accent text-sm"
                    />
                    {trackOrderId && (
                      <button
                        onClick={() => setTrackOrderId("")}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleTrackSearch()}
                    disabled={isTrackLoading || !trackOrderId.trim()}
                    className="bg-primary hover:bg-slate-800 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold text-sm transition shrink-0 flex items-center gap-2"
                  >
                    {isTrackLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <Search size={16} />
                    )}
                    {lang === "sw" ? "Tafuta" : "Search"}
                  </button>
                </div>

                {trackError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs sm:text-sm rounded-lg border border-red-100 flex items-center gap-2">
                    <span className="font-bold">⚠️</span> {trackError}
                  </div>
                )}
              </div>

              {trackedOrder && (
                <div
                  className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 transition-all duration-700 ${highlightTrackedStatus ? "ring-2 ring-amber-500 animate-status-flash" : ""}`}
                >
                  {/* Status header card */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-2">
                    <div>
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        {lang === "sw" ? "Namba ya Oda" : "Order Identifier"}
                      </div>
                      <div className="text-base font-extrabold text-slate-900 font-mono">
                        #{trackedOrder.id}
                      </div>
                      <div className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>
                          {lang === "sw" ? "Tarehe:" : "Placed:"}{" "}
                          {new Date(trackedOrder.date).toLocaleString()}
                        </span>
                        {highlightTrackedStatus && (
                          <span className="bg-amber-100 border border-amber-200 text-amber-800 text-[9px] px-1.5 py-0.5 rounded-md font-black animate-bounce">
                            {lang === "sw"
                              ? "HALI MEBADILIKA!"
                              : "STATUS CHANGED!"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase inline-block transition-all duration-700 ${
                          highlightTrackedStatus
                            ? "bg-amber-500 text-white animate-status-update shadow-lg"
                            : trackedOrder.status === "delivered"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-350"
                              : trackedOrder.status === "shipped"
                                ? "bg-sky-100 text-sky-800 border border-sky-305"
                                : trackedOrder.status === "customer_confirmed"
                                  ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                                  : trackedOrder.status === "confirmed"
                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                    : trackedOrder.status === "cancelled"
                                      ? "bg-red-100 text-red-800 border border-red-200"
                                      : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {trackedOrder.status === "customer_confirmed"
                          ? lang === "sw"
                            ? "MTEJA ATHIBITISHA"
                            : "CUSTOMER CONFIRMED"
                          : trackedOrder.status === "confirmed"
                            ? lang === "sw"
                              ? "IMEIDHINISHWA"
                              : "APPROVED"
                            : trackedOrder.status === "shipped"
                              ? lang === "sw"
                                ? "IMESAFIRISHWA"
                                : "SHIPPED"
                              : trackedOrder.status === "delivered"
                                ? lang === "sw"
                                  ? "IMEPOKELEWA"
                                  : "DELIVERED"
                                : trackedOrder.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Visual Tracker Timeline */}
                  <div className="relative py-4">
                    {/* Progress Connecting Line */}
                    <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-1 bg-slate-100 -translate-x-1/2 z-0 hidden md:block"></div>
                    <div
                      className={`absolute left-6 md:left-1/2 top-4 w-1 -translate-x-1/2 z-0 hidden md:block transition-all duration-500 ${
                        trackedOrder.status === "delivered"
                          ? "h-[100%] bg-emerald-500"
                          : trackedOrder.status === "shipped"
                            ? "h-[75%] bg-emerald-500"
                            : trackedOrder.status === "customer_confirmed"
                              ? "h-[50%] bg-emerald-500"
                              : trackedOrder.status === "confirmed"
                                ? "h-[25%] bg-emerald-500"
                                : trackedOrder.status === "cancelled"
                                  ? "h-[25%] bg-red-400"
                                  : "h-[1%] bg-amber-400"
                      }`}
                    ></div>

                    <div className="space-y-8 relative z-10">
                      {/* Step 1: Placed */}
                      <div className="flex flex-row md:items-center gap-4 md:justify-between">
                        <div className="md:w-1/2 md:text-right hidden md:block pr-6">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {lang === "sw" ? "Oda Imewekwa" : "Order Placed"}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {lang === "sw"
                              ? "Tumepokea oda yako kikamilifu kwenye mfumo wetu."
                              : "Your order was successfully placed."}
                          </p>
                        </div>

                        <div className="w-10 h-10 rounded-full border-4 border-white shadow bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mx-auto">
                          <Check size={16} />
                        </div>

                        <div className="md:w-1/2 pl-2 md:pl-6">
                          <div className="block md:hidden">
                            <h4 className="font-bold text-slate-900 text-sm">
                              {lang === "sw" ? "Oda Imewekwa" : "Order Placed"}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {lang === "sw"
                                ? "Tumepokea oda yako kikamilifu kwenye mfumo."
                                : "Your order was successfully placed."}
                            </p>
                          </div>
                          <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold block w-fit">
                            {formatTrackedStageTime("pending")}
                          </span>
                        </div>
                      </div>

                      {/* Step 2: Approved */}
                      <div className="flex flex-row md:items-center gap-4 md:justify-between">
                        <div className="md:w-1/2 md:text-right hidden md:block pr-6">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {trackedOrder.status === "cancelled"
                              ? lang === "sw"
                                ? "Oda Imeghairiwa"
                                : "Order Cancelled"
                              : lang === "sw"
                                ? "Imeidhinishwa na Duka"
                                : "Approved by Shop"}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {[
                              "confirmed",
                              "customer_confirmed",
                              "shipped",
                              "delivered",
                            ].includes(trackedOrder.status)
                              ? lang === "sw"
                                ? "Oda imeidhinishwa, duka linaandaa bidhaa zako."
                                : "Order approved! Merchant is preparing your items."
                              : trackedOrder.status === "cancelled"
                                ? lang === "sw"
                                  ? "Oda hii imefutwa."
                                  : "This order has been cancelled."
                                : lang === "sw"
                                  ? "Msimamizi anakagua malipo na stoki kwa sasa."
                                  : "Merchant is reviewing your payment and items."}
                          </p>
                        </div>

                        <div
                          className={`w-10 h-10 rounded-full border-4 border-white shadow flex items-center justify-center shrink-0 mx-auto ${
                            [
                              "confirmed",
                              "customer_confirmed",
                              "shipped",
                              "delivered",
                            ].includes(trackedOrder.status)
                              ? "bg-emerald-100 text-emerald-600"
                              : trackedOrder.status === "cancelled"
                                ? "bg-red-100 text-red-600"
                                : "bg-amber-100 text-amber-600 animate-pulse"
                          }`}
                        >
                          {[
                            "confirmed",
                            "customer_confirmed",
                            "shipped",
                            "delivered",
                          ].includes(trackedOrder.status) ? (
                            <Check size={16} />
                          ) : trackedOrder.status === "cancelled" ? (
                            <X size={16} />
                          ) : (
                            <Clock size={16} />
                          )}
                        </div>

                        <div className="md:w-1/2 pl-2 md:pl-6">
                          <div className="block md:hidden">
                            <h4 className="font-bold text-slate-900 text-sm">
                              {trackedOrder.status === "cancelled"
                                ? lang === "sw"
                                  ? "Oda Imeghairiwa"
                                  : "Order Cancelled"
                                : lang === "sw"
                                  ? "Imeidhinishwa na Duka"
                                  : "Approved by Shop"}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {[
                                "confirmed",
                                "customer_confirmed",
                                "shipped",
                                "delivered",
                              ].includes(trackedOrder.status)
                                ? lang === "sw"
                                  ? "Oda imeidhinishwa, duka linaandaa bidhaa."
                                  : "Order approved! Preparing your items."
                                : trackedOrder.status === "cancelled"
                                  ? lang === "sw"
                                    ? "Oda hii imegairiwa."
                                    : "Order is cancelled."
                                  : lang === "sw"
                                    ? "Inakaguliwa kwa sasa."
                                    : "Awaiting approval."}
                            </p>
                          </div>
                          {[
                            "confirmed",
                            "customer_confirmed",
                            "shipped",
                            "delivered",
                          ].includes(trackedOrder.status) && (
                            <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold block w-fit">
                              {formatTrackedStageTime("confirmed")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Step 3: Customer Confirmed */}
                      <div className="flex flex-row md:items-center gap-4 md:justify-between">
                        <div className="md:w-1/2 md:text-right hidden md:block pr-6">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {lang === "sw"
                              ? "Uthibitisho wa Mteja"
                              : "Customer Confirmed"}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {[
                              "customer_confirmed",
                              "shipped",
                              "delivered",
                            ].includes(trackedOrder.status)
                              ? lang === "sw"
                                ? "Mteja amethibitisha na kukubaliana na duka kuendelea."
                                : "Customer confirmed! Shipment preparation is fully authorized."
                              : trackedOrder.status === "confirmed"
                                ? lang === "sw"
                                  ? "Muuzaji anapiga simu/WhatsApp ili mteja athibitishe oda."
                                  : "Seller is contacting you on phone/WhatsApp to confirm details."
                                : lang === "sw"
                                  ? "Inasubiri muuzaji awasiliane na mteja kwanza."
                                  : "Awaiting seller-customer call or chat confirmation."}
                          </p>
                        </div>

                        <div
                          className={`w-10 h-10 rounded-full border-4 border-white shadow flex items-center justify-center shrink-0 mx-auto ${
                            [
                              "customer_confirmed",
                              "shipped",
                              "delivered",
                            ].includes(trackedOrder.status)
                              ? "bg-emerald-100 text-emerald-600"
                              : trackedOrder.status === "confirmed"
                                ? "bg-amber-100 text-amber-600 animate-pulse border-amber-300"
                                : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {[
                            "customer_confirmed",
                            "shipped",
                            "delivered",
                          ].includes(trackedOrder.status) ? (
                            <Check size={16} />
                          ) : (
                            <Phone
                              size={14}
                              className={
                                trackedOrder.status === "confirmed"
                                  ? "animate-bounce text-amber-600"
                                  : ""
                              }
                            />
                          )}
                        </div>

                        <div className="md:w-1/2 pl-2 md:pl-6">
                          <div className="block md:hidden">
                            <h4 className="font-bold text-slate-900 text-sm">
                              {lang === "sw"
                                ? "Uthibitisho wa Mteja"
                                : "Customer Confirmed"}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {[
                                "customer_confirmed",
                                "shipped",
                                "delivered",
                                "archived",
                              ].includes(trackedOrder.status)
                                ? lang === "sw"
                                  ? "Mteja amethibitisha."
                                  : "Customer has confirmed."
                                : trackedOrder.status === "confirmed"
                                  ? lang === "sw"
                                    ? "Muuzaji anawasiliana nawe."
                                    : "Seller is contacting you."
                                  : lang === "sw"
                                    ? "Muuzaji bado hajawasiliana."
                                    : "Waiting contact."}
                            </p>
                          </div>
                          {[
                            "customer_confirmed",
                            "shipped",
                            "delivered",
                            "archived",
                          ].includes(trackedOrder.status) && (
                            <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold block w-fit">
                              {formatTrackedStageTime("customer_confirmed")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Step 4: Dispatched */}
                      <div className="flex flex-row md:items-center gap-4 md:justify-between">
                        <div className="md:w-1/2 md:text-right hidden md:block pr-6">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {lang === "sw"
                              ? "Mzigo Umesafirishwa (In Transit)"
                              : "Dispatched / In Transit"}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {["shipped", "delivered", "archived"].includes(
                              trackedOrder.status,
                            )
                              ? lang === "sw"
                                ? "Mzigo upo njiani tayari kusafirishwa au unaelekea kituo chako."
                                : "Your package is dispatched and on its way / ready for pickup."
                              : trackedOrder.status === "customer_confirmed"
                                ? lang === "sw"
                                  ? "Oda imethibitishwa na mteja, duka linaandaa vifurushi safarini."
                                  : "Authorized! Merchant is packing and arranging transit dispatch."
                                : lang === "sw"
                                  ? "Kifurushi bado hakijakaguliwa au kusafirishwa."
                                  : "Package not yet verified or processed for dispatch."}
                          </p>
                        </div>

                        <div
                          className={`w-10 h-10 rounded-full border-4 border-white shadow flex items-center justify-center shrink-0 mx-auto ${
                            ["shipped", "delivered", "archived"].includes(
                              trackedOrder.status,
                            )
                              ? "bg-emerald-100 text-emerald-600"
                              : trackedOrder.status === "customer_confirmed"
                                ? "bg-amber-100 text-amber-600 animate-pulse"
                                : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          <Truck size={16} />
                        </div>

                        <div className="md:w-1/2 pl-2 md:pl-6">
                          <div className="block md:hidden">
                            <h4 className="font-bold text-slate-900 text-sm">
                              {lang === "sw"
                                ? "Mzigo Kwenye Njia (Transit)"
                                : "In Transit"}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {["shipped", "delivered", "archived"].includes(
                                trackedOrder.status,
                              )
                                ? lang === "sw"
                                  ? "Mzigo upo njiani."
                                  : "In transit."
                                : lang === "sw"
                                  ? "Unatayarishwa kuanza safari."
                                  : "Preparing for transit."}
                            </p>
                          </div>
                          {["shipped", "delivered", "archived"].includes(
                            trackedOrder.status,
                          ) && (
                            <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold block w-fit">
                              {formatTrackedStageTime("shipped")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Step 5: Delivered */}
                      <div className="flex flex-row md:items-center gap-4 md:justify-between">
                        <div className="md:w-1/2 md:text-right hidden md:block pr-6">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {lang === "sw"
                              ? "Imepokelewa (Delivered)"
                              : "Delivered & Completed"}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {trackedOrder.status === "delivered" ||
                            trackedOrder.status === "archived"
                              ? lang === "sw"
                                ? "Mteja amethibitisha kuwa amepokea mzigo wake kikamilifu na salama!"
                                : "Verification complete. Order successfully completed by buyer confirmation."
                              : lang === "sw"
                                ? "Unasubiri mteja athibitishe ikiwa mzigo umefika."
                                : "Waiting for client delivery receipt confirmation."}
                          </p>
                        </div>

                        <div
                          className={`w-10 h-10 rounded-full border-4 border-white shadow flex items-center justify-center shrink-0 mx-auto ${
                            trackedOrder.status === "delivered" ||
                            trackedOrder.status === "archived"
                              ? "bg-emerald-100 text-emerald-600"
                              : trackedOrder.status === "shipped"
                                ? "bg-amber-100 text-amber-600 animate-pulse border-amber-300"
                                : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          <Gift size={16} />
                        </div>

                        <div className="md:w-1/2 pl-2 md:pl-6">
                          <div className="block md:hidden">
                            <h4 className="font-bold text-slate-900 text-sm">
                              {lang === "sw"
                                ? "Imepokelewa (Delivered)"
                                : "Delivered"}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {trackedOrder.status === "delivered" ||
                              trackedOrder.status === "archived"
                                ? lang === "sw"
                                  ? "Oda imekamilishwa."
                                  : "Order completed."
                                : lang === "sw"
                                  ? "Inasubiri uthibitisho wako."
                                  : "Awaiting your delivery receipt."}
                            </p>
                          </div>
                          {(trackedOrder.status === "delivered" ||
                            trackedOrder.status === "archived") && (
                            <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold block w-fit">
                              {formatTrackedStageTime("delivered")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {["shipped", "delivered"].includes(trackedOrder.status) && (
                    <div className="bg-amber-50 border border-amber-150 rounded-2xl p-5 text-center space-y-3 animate-in fade-in duration-300 shadow-sm">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                        <Truck
                          size={24}
                          className="animate-bounce text-amber-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-950 text-sm">
                          {lang === "sw"
                            ? "Mzigo Unasubiri Uthibitisho wa Mapokezi"
                            : "Awaiting Delivery Confirmation"}
                        </h4>
                        <p className="text-xs text-slate-650 leading-relaxed max-w-sm mx-auto font-medium">
                          {lang === "sw"
                            ? "Kifurushi chako kimesafirishwa au kipo tayari kuchukuliwa tayari! Tafadhali thibitisha ikiwa umepokea bidhaa zako zote vizuri."
                            : "Your order is ready or arrived! Please let us confirm that you have successfully received all your items."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedConfirmOrder(trackedOrder);
                          setShowDeliveryConfirmModal(true);
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition inline-flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
                      >
                        <Gift size={14} />
                        <span>
                          {lang === "sw"
                            ? "Thibitisha Pokeo Sasa"
                            : "Confirm Delivery Receipt"}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Summary Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 gap-4 grid grid-cols-1 md:grid-cols-2 text-sm text-slate-700">
                    <div>
                      <div className="font-bold uppercase tracking-wider text-xs text-slate-400 mb-2">
                        {lang === "sw"
                          ? "Mteja na Maelezo yake"
                          : "Customer & Delivery"}
                      </div>
                      <div className="font-bold text-slate-900">
                        {trackedOrder.customerDetails.name}
                      </div>
                      <div>{trackedOrder.customerDetails.phone}</div>
                      <div className="mt-1 flex items-start gap-1">
                        <MapPin size={14} className="text-slate-400 mt-0.5" />{" "}
                        <span>{trackedOrder.customerDetails.address}</span>
                      </div>
                    </div>
                    <div className="md:border-l md:pl-4 border-slate-200">
                      <div className="font-bold uppercase tracking-wider text-xs text-slate-400 mb-2">
                        {lang === "sw"
                          ? "Muhtasari wa Garama"
                          : "Order Costing"}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-500">
                            {lang === "sw" ? "Malipo Kupitia:" : "Method:"}
                          </span>
                          <span className="text-slate-900">
                            {trackedOrder.paymentMethodName || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between font-black text-emerald-600 border-t border-slate-200 pt-2 text-base">
                          <span>
                            {lang === "sw" ? "Jumla Kuu:" : "Grand Total:"}
                          </span>
                          <span>
                            <PriceDisplay
                              amount={trackedOrder.total}
                              size="sm"
                              colorClass="text-emerald-600"
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {tab === "messages" && (
            <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex justify-center items-center sm:p-4 md:p-8 min-[720px]:bg-transparent min-[720px]:backdrop-blur-none min-[720px]:pointer-events-none p-0 min-[720px]:p-0 min-[720px]:left-auto min-[720px]:right-0 min-[720px]:w-[400px] md:min-[720px]:w-[440px] min-[720px]:h-full animate-in fade-in duration-200">
              <div className="w-full h-full sm:h-[90vh] min-[720px]:h-full max-w-4xl min-[720px]:max-w-none bg-slate-50 sm:rounded-3xl min-[720px]:rounded-none shadow-2xl flex flex-col overflow-hidden relative border border-slate-700/50 min-[720px]:border-l min-[720px]:border-y-0 min-[720px]:border-r-0 min-[720px]:border-slate-200 pointer-events-auto">
                {/* Unified Chat Header */}
                {isSelectionMode && profileChatMode === "live" ? (
                  <div className="bg-slate-900 text-white p-3 border-b border-rose-950 flex items-center justify-between shrink-0 flex-wrap gap-2 animate-fade-in">
                    <span className="text-xs bg-rose-600/25 border border-rose-500/35 px-2.5 py-1 rounded-lg font-mono text-rose-300 font-bold uppercase">
                      {lang === "sw"
                        ? `${selectedBubbleIds.size} Chagu`
                        : `${selectedBubbleIds.size} Selected`}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 font-bold rounded-lg text-[10px] text-slate-200 uppercase tracking-wider transition cursor-pointer"
                      >
                        {lang === "sw" ? "Zote" : "All"}
                      </button>
                      <button
                        type="button"
                        onClick={handleUnselectAll}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 font-bold rounded-lg text-[10px] text-slate-300 uppercase tracking-wider transition cursor-pointer"
                      >
                        {lang === "sw" ? "Ondoa" : "Clear"}
                      </button>
                      <button
                        type="button"
                        onClick={handleExecuteBulkDelete}
                        disabled={selectedBubbleIds.size === 0}
                        className="px-2.5 py-1 bg-red-650 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed font-black rounded-lg text-[10px] text-white uppercase tracking-wider transition flex items-center gap-1 cursor-pointer"
                        style={{ backgroundColor: "#ef4444" }}
                      >
                        <Trash size={10} />
                        <span>{lang === "sw" ? "Futa" : "Delete"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSelectionMode(false)}
                        className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 font-bold rounded-lg text-[10px] text-slate-300 uppercase tracking-wider transition cursor-pointer"
                      >
                        {lang === "sw" ? "Ghairi" : "Cancel"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTab("orders")}
                        className="ml-2 w-8 h-8 flex items-center justify-center bg-slate-800 text-slate-300 hover:bg-rose-500 hover:text-white rounded-full transition cursor-pointer"
                        title={lang === "sw" ? "Funga" : "Close"}
                      >
                        <X size={16} className="stroke-[3]" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 text-white p-3 md:p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0 border-b border-slate-800 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white text-base font-black shadow-md cursor-default shrink-0">
                        {profileChatMode === "ai" ? "🤖" : "💬"}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5 leading-none mb-1">
                          {profileChatMode === "ai"
                            ? "Orbi AI Assistant"
                            : "Orbi Chat Support"}
                        </h3>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                            {profileChatMode === "ai"
                              ? lang === "sw"
                                ? "On-line / AI Inafanya kazi"
                                : "AI Shopping Bot Online"
                              : lang === "sw"
                                ? "Mhudumu Yuko Hewani"
                                : "Support Team Online"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Mode selector tab pills */}
                      <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-[10px] font-black uppercase tracking-wider relative">
                        <button
                          type="button"
                          onClick={() => setProfileChatMode("ai")}
                          className={`px-3 py-1.5 rounded-lg transition duration-200 flex items-center gap-1 cursor-pointer ${
                            profileChatMode === "ai"
                              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md font-extrabold"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <span>🤖</span>
                          <span>
                            {lang === "sw" ? "Msaidizi wa AI" : "AI Assistant"}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setProfileChatMode("live")}
                          className={`px-3 py-1.5 rounded-lg transition duration-200 flex items-center gap-1 cursor-pointer ${
                            profileChatMode === "live"
                              ? "bg-slate-700 text-white shadow-md font-extrabold"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <span>👤</span>
                          <span>
                            {lang === "sw" ? "Wakala wa Live" : "Live Agent"}
                          </span>
                        </button>
                      </div>

                      {profileChatMode === "live" && chatBubbles.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsSelectionMode(true);
                            setSelectedBubbleIds(new Set());
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg text-[10px] text-slate-300 hover:text-white transition font-bold uppercase tracking-wider"
                        >
                          <Trash size={10} />
                          <span>{lang === "sw" ? "Futa" : "Select"}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setTab("orders")}
                        className="ml-2 w-8 h-8 flex items-center justify-center bg-slate-800 border border-slate-700 text-slate-400 hover:bg-rose-500 hover:text-white hover:border-rose-400 rounded-full transition cursor-pointer shadow-sm"
                        title={lang === "sw" ? "Funga" : "Close"}
                      >
                        <X size={16} className="stroke-[3]" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Chat Messages Log */}
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/70 space-y-4 flex flex-col [background-image:radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]"
                >
                  {profileChatMode === "ai" ? (
                    /* =======================================
                     AI ASSISTANT CHAT FEED
                     ======================================= */
                    aiChatHistory.length === 0 ? (
                      <div className="text-center py-8 my-auto animate-fade-in flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4 border border-orange-100 shadow-sm text-orange-500">
                          <Bot size={34} className="animate-bounce" />
                        </div>
                        <h3 className="font-black text-slate-800 text-sm mb-1.5">
                          {lang === "sw"
                            ? "Hujambo! Mimi ni Msaidizi wa Orbi Shop"
                            : "Hello! I am your AI Shopping Assistant"}
                        </h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6 leading-relaxed px-4 text-center font-medium">
                          {lang === "sw"
                            ? "Uliza swali lolote kuhusu bidhaa, bei, kuponi zilizopo au msaada wa usafirishaji kwa Kiswahili na Kiingereza."
                            : "Ask me anything about products, prices, active discounts, or courier estimates. I support Swahili and English."}
                        </p>

                        <div className="space-y-2 max-w-xs w-full px-4">
                          {[
                            {
                              textSw: "Nisaidie kuona bidhaa zilizopo dukani",
                              textEn:
                                "Help me find currently available products",
                            },
                            {
                              textSw:
                                "Nawezaje kulipia mzigo kwa kutumia M-Pesa?",
                              textEn:
                                "How do I make payment using Mobile Money?",
                            },
                            {
                              textSw:
                                "Nionyeshe njia za usafirishaji na gharama",
                              textEn:
                                "Show me carrier pickup stations and costs",
                            },
                          ].map((item, keyIdx) => {
                            const promptText =
                              lang === "sw" ? item.textSw : item.textEn;
                            return (
                              <button
                                key={keyIdx}
                                type="button"
                                onClick={() => sendAIChatMessage(promptText)}
                                className="w-full p-2.5 text-left text-xs bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-950 rounded-xl border border-slate-200/70 hover:border-orange-200 shadow-3xs font-semibold transition duration-200 block cursor-pointer"
                              >
                                ⭐ {promptText}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3.5 animate-fade-in">
                        {aiChatHistory.map((chat, idx) => {
                          const uniqueKey = `${chat.role}-${chat.date}-${idx}`;
                          const isUser = chat.role === "user";
                          return (
                            <div
                              key={uniqueKey}
                              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`p-3 rounded-2xl max-w-[85%] text-xs shadow-xs leading-relaxed ${
                                  isUser
                                    ? "bg-orange-500 text-white rounded-br-none font-bold"
                                    : "bg-white text-slate-800 border border-slate-150 rounded-bl-none animate-fade-in"
                                }`}
                              >
                                {chat.image && (
                                  <div className="mb-2 max-w-full overflow-hidden rounded-lg border border-slate-200/50">
                                    <img
                                      src={chat.image.data}
                                      alt="Uploaded graphic context animate-fade-in"
                                      className="object-cover max-h-40 w-full rounded"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                )}
                                <div className="whitespace-pre-line">
                                  {chat.text}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {isAILoading && (
                          <div className="flex justify-start animate-pulse">
                            <div className="p-3 bg-white border border-slate-150 rounded-2xl rounded-bl-none text-slate-400 text-xs flex items-center gap-1.5 shadow-3xs">
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce"
                                style={{ animationDelay: "0ms" }}
                              />
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-orange-450 animate-bounce"
                                style={{ animationDelay: "150ms" }}
                              />
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce"
                                style={{ animationDelay: "300ms" }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  ) : chatBubbles.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 my-auto animate-fade-in">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-sm">
                        <MessageSquare className="w-8 h-8 text-slate-400" />
                      </div>
                      <h4 className="font-extrabold text-slate-800 mb-1">
                        {lang === "sw"
                          ? "Habari Gani! Uliza swali lolote"
                          : "Hello there! Ask us anything"}
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed px-4 opacity-80">
                        {lang === "sw"
                          ? "Tumia fomu ya chini kuuliza swali, ripoti malipo au bidhaa kuharibika. Tutakujibu hapa hapa!"
                          : "Send a message below for inquiries, order changes or payments. We will assist you instantly!"}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-2">
                        <span className="bg-slate-200/80 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-300/50">
                          {lang === "sw"
                            ? "Mwanzo wa Mazungumzo"
                            : "Beginning of Chat"}
                        </span>
                      </div>

                      {chatBubbles.map((bubble, idx) => {
                        const isCustomer = bubble.sender === "customer";
                        const bubbleDate = new Date(
                          bubble.date,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        const bubbleDay = new Date(
                          bubble.date,
                        ).toLocaleDateString([], {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        });

                        const prevBubble =
                          idx > 0 ? chatBubbles[idx - 1] : null;
                        const showDayDivider =
                          !prevBubble ||
                          new Date(prevBubble.date).toDateString() !==
                            new Date(bubble.date).toDateString();
                        const isSelected = selectedBubbleIds.has(bubble.id);

                        return (
                          <div
                            key={bubble.id}
                            className={`w-full flex flex-col transition-all duration-150 ${
                              isSelectionMode && isCustomer
                                ? "cursor-pointer select-none"
                                : ""
                            }`}
                            onClick={() => {
                              if (isSelectionMode && isCustomer) {
                                toggleSelectBubble(bubble.id);
                              }
                            }}
                          >
                            {showDayDivider && (
                              <div className="text-center my-3 relative flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center">
                                  <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <span className="relative bg-teal-50 text-teal-800 border border-teal-100 font-bold text-[9px] uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                                  {bubbleDay}
                                </span>
                              </div>
                            )}

                            <div
                              className={`flex w-full items-center gap-2.5 ${isCustomer ? "justify-end" : "justify-start"} group/bubble`}
                            >
                              {isSelectionMode && !isCustomer && (
                                <div
                                  className={`w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center shrink-0 transition-all ${isSelected ? "bg-primary border-primary text-white scale-110 shadow-sm" : "bg-white hover:border-slate-400"}`}
                                >
                                  {isSelected && (
                                    <Check size={10} className="stroke-[3]" />
                                  )}
                                </div>
                              )}

                              {!isSelectionMode && isCustomer && (
                                <button
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const confirmMsg =
                                      lang === "sw"
                                        ? "Je, una uhakika unataka kufuta ujumbe wako?"
                                        : "Are you sure you want to delete this message?";
                                    if (
                                      await showConfirm(
                                        confirmMsg,
                                        lang === "sw"
                                          ? "Futa Ujumbe"
                                          : "Delete Message",
                                      )
                                    ) {
                                      await handleDeleteBubbles([bubble.id]);
                                    }
                                  }}
                                  className="opacity-0 group-hover/bubble:opacity-100 max-[767px]:visible max-[767px]:opacity-40 p-1 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-400 hover:text-red-500 rounded-lg shadow-sm transition shrink-0"
                                  title={lang === "sw" ? "Futa" : "Delete"}
                                >
                                  <Trash size={11} />
                                </button>
                              )}

                              <div
                                className={`flex flex-col max-w-[80%] ${isCustomer ? "items-end" : "items-start"}`}
                              >
                                {!isCustomer && (
                                  <span className="text-[10px] font-extrabold text-[#059669] mb-0.5 pl-1 flex items-center gap-1">
                                    <span>Orbi Shop Support Team</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  </span>
                                )}

                                <div
                                  className={`p-3.5 px-4 rounded-xl shadow-sm text-xs leading-relaxed transition-all hover:shadow duration-150 ${
                                    isCustomer
                                      ? "bg-slate-900 text-white rounded-tr-none font-medium"
                                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                                  } ${isSelected ? "ring-2 ring-primary ring-offset-1" : ""}`}
                                >
                                  {bubble.text && (
                                    <p className="whitespace-pre-wrap word-break-all break-words">
                                      {bubble.text}
                                    </p>
                                  )}
                                  {bubble.mediaUrl && (
                                    <div className={bubble.text ? "mt-2" : ""}>
                                      {isImage(bubble.mediaUrl) ? (
                                        <div
                                          className="max-w-sm rounded-lg overflow-hidden border border-slate-200/20 shadow-sm cursor-pointer hover:opacity-95 transition"
                                          onClick={(e) => {
                                            if (!isSelectionMode) {
                                              e.stopPropagation();
                                              window.open(
                                                bubble.mediaUrl,
                                                "_blank",
                                              );
                                            }
                                          }}
                                        >
                                          <img
                                            src={bubble.mediaUrl}
                                            className="max-h-60 w-auto object-contain rounded-lg"
                                            alt="Attachment"
                                            referrerPolicy="no-referrer"
                                          />
                                        </div>
                                      ) : isVideo(bubble.mediaUrl) ? (
                                        <div className="max-w-sm rounded-lg overflow-hidden border border-slate-200/20 shadow-sm">
                                          <video
                                            src={bubble.mediaUrl}
                                            controls
                                            className="max-h-60 w-full object-contain rounded-lg"
                                            playsInline
                                          />
                                        </div>
                                      ) : (
                                        <a
                                          href={bubble.mediaUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => {
                                            if (isSelectionMode)
                                              e.preventDefault();
                                            else e.stopPropagation();
                                          }}
                                          className={`flex items-center gap-2 p-2 px-3 rounded-xl border font-medium text-xs transition shadow-sm ${
                                            isCustomer
                                              ? "bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-100"
                                              : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
                                          }`}
                                        >
                                          <Paperclip
                                            size={14}
                                            className="shrink-0"
                                          />
                                          <span className="truncate max-w-[150px]">
                                            {bubble.mediaUrl
                                              .split("/")
                                              .pop()
                                              ?.split("_")
                                              .slice(1)
                                              .join("_") || "Kiambatisho"}
                                          </span>
                                          <Download
                                            size={14}
                                            className="shrink-0 ml-auto opacity-70"
                                          />
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div className="mt-1 flex items-center gap-1.5 font-mono text-[9px] text-slate-400 pl-1 pr-1 font-semibold font-semibold">
                                  <span>{bubbleDate}</span>
                                  {isCustomer && (
                                    <span className="flex items-center">
                                      {bubble.isRead ? (
                                        <span
                                          className="text-sky-500 font-extrabold flex items-center text-[10px]"
                                          title={
                                            lang === "sw"
                                              ? "Imesomwa na Mhudumu"
                                              : "Read by Support"
                                          }
                                        >
                                          ✓✓
                                        </span>
                                      ) : (
                                        <span
                                          className="text-slate-400 font-bold flex items-center text-[10px]"
                                          title={
                                            lang === "sw" ? "Imetunwa" : "Sent"
                                          }
                                        >
                                          ✓
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {!isSelectionMode && !isCustomer && (
                                <button
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const confirmMsg =
                                      lang === "sw"
                                        ? "Je, una uhakika unataka kufuta ujumbe huu wa jibu la mhudumu?"
                                        : "Are you sure you want to delete this support reply?";
                                    if (
                                      await showConfirm(
                                        confirmMsg,
                                        lang === "sw"
                                          ? "Futa Ujumbe"
                                          : "Delete Message",
                                      )
                                    ) {
                                      await handleDeleteBubbles([bubble.id]);
                                    }
                                  }}
                                  className="opacity-0 group-hover/bubble:opacity-100 max-[767px]:visible max-[767px]:opacity-40 p-1 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-400 hover:text-red-500 rounded-lg shadow-sm transition shrink-0"
                                  title={lang === "sw" ? "Futa" : "Delete"}
                                >
                                  <Trash size={11} />
                                </button>
                              )}

                              {isSelectionMode && isCustomer && (
                                <div
                                  className={`w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center shrink-0 transition-all ${isSelected ? "bg-primary border-primary text-white scale-110 shadow-sm" : "bg-white hover:border-slate-400"}`}
                                >
                                  {isSelected && (
                                    <Check size={10} className="stroke-[3]" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {chatBubbles[chatBubbles.length - 1]?.sender ===
                        "customer" && (
                        <div className="flex items-center gap-2 mt-4 text-[11px] text-amber-700 bg-amber-50/50 border border-amber-100/70 p-2.5 rounded-xl self-start">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </span>
                          <span className="font-semibold">
                            {lang === "sw"
                              ? "Tumepokea ujumbe wako. Mhudumu atajibu hivi punde..."
                              : "Support is reviewing your request..."}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input Bar */}
                {profileChatMode === "ai" ? (
                  <div className="p-3.5 bg-slate-100 border-t border-slate-200 shrink-0 flex flex-col gap-2 relative">
                    {aiSelectedImage && (
                      <div className="p-2 bg-orange-50/50 rounded-lg border border-orange-100 flex items-center justify-between mb-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
                        <div className="flex items-center gap-2">
                          <img
                            src={aiSelectedImage.data}
                            alt="Selected Preview"
                            className="w-10 h-10 object-cover rounded-lg border border-orange-200"
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-[10px] leading-tight">
                            <span className="font-extrabold text-slate-700 block truncate max-w-[180px]">
                              {aiSelectedImage.filename}
                            </span>
                            <span className="text-orange-600 font-bold block">
                              {lang === "sw"
                                ? "Tayari kutumwa"
                                : "Ready to upload"}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAiSelectedImage(null)}
                          className="p-1 hover:bg-orange-100 text-orange-600 rounded-full transition-colors font-bold text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {isTransferredToLive ? (
                      <div className="space-y-3 p-3.5 bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl border border-amber-200 animate-pulse-slow">
                        <div className="flex gap-2 items-start">
                          <span className="text-base">📢</span>
                          <div>
                            <h4 className="text-xs font-black text-slate-800">
                              {lang === "sw"
                                ? "Uhamishaji wa Live Agent"
                                : "Live Agent Support Activated"}
                            </h4>
                            <p className="text-[10px] text-slate-600 font-bold leading-relaxed mt-0.5">
                              {lang === "sw"
                                ? `Umezidi kikomo cha maswali 10 ya AI. Timu yetu imeshapokea mazungumzo yako na ipo tayari kukusaidia! Unaweza kumuuliza AI tena baada ya dakika ${aiLockTimeRemaining || "30:00"}`
                                : `You have exceeded 10 AI questions. Our staff is prepared and has received your transcripts! Reset in: ${aiLockTimeRemaining || "30:00"}`}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileChatMode("live");
                            showAlert(
                              lang === "sw"
                                ? "Tumekuhamisha! Andika ujumbe wako kwenye sehemu ya Live Agent na wakala atakujibu haraka."
                                : "Transferred successfully! Please type your support query on the Live Agent chat and we will help.",
                              "success",
                            );
                          }}
                          className="w-full py-2.5 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-650 hover:to-amber-650 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                        >
                          <span>💬</span>
                          <span>
                            {lang === "sw"
                              ? "Zungumza na Staff Agent Sasa"
                              : "Chat with Live Agent Now"}
                          </span>
                        </button>
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          sendAIChatMessage(aiInputMessage);
                        }}
                        className="flex gap-2 items-center"
                      >
                        <label
                          className="p-2.5 bg-slate-50 hover:bg-slate-200 hover:text-orange-600 rounded-xl transition duration-200 cursor-pointer flex items-center justify-center text-slate-500 shrink-0 border border-slate-200/50 hover:border-orange-300"
                          title={lang === "sw" ? "Pakia Picha" : "Upload Image"}
                        >
                          <ImageIcon size={18} />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAIImageChange}
                            className="hidden"
                          />
                        </label>
                        <input
                          type="text"
                          required={!aiSelectedImage}
                          value={aiInputMessage}
                          onChange={(e) => setAIInputMessage(e.target.value)}
                          placeholder={
                            aiSelectedImage
                              ? lang === "sw"
                                ? "Andika maelezo ya picha..."
                                : "Add details to image..."
                              : lang === "sw"
                                ? "Uliza Orbi AI kuhusu bidhaa au duka letu..."
                                : "Ask Orbi AI about our products or shop..."
                          }
                          className="flex-1 border border-slate-200/85 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all font-medium bg-slate-50/50"
                        />
                        <button
                          type="submit"
                          disabled={
                            isAILoading ||
                            (!aiInputMessage.trim() && !aiSelectedImage)
                          }
                          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-xs font-black shrink-0 transition-colors cursor-pointer"
                        >
                          {lang === "sw" ? "Tuma" : "Send"}
                        </button>
                      </form>
                    )}
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-semibold px-1 mt-0.5">
                      <span>
                        {lang === "sw"
                          ? "Msaidizi wa Duka la Kidijitali"
                          : "Digital Online AI Assistant"}
                      </span>
                      <span>
                        {lang === "sw"
                          ? "Maswali Max: 10"
                          : "Max turn count: 10"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={sendProfileMessage}
                    className="bg-slate-100 border-t border-slate-200 p-3.5 shrink-0 flex flex-col gap-2 relative"
                  >
                    {showTagSuggestions && filteredTagProducts.length > 0 && (
                      <div className="absolute bottom-full left-3.5 right-3.5 mb-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-54 overflow-y-auto flex flex-col divide-y divide-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-150">
                        <div className="p-2.5 bg-slate-50 text-[10px] font-extrabold text-slate-500 border-b border-slate-150 flex items-center justify-between uppercase tracking-wider sticky top-0">
                          <span>
                            {lang === "sw" ? "Taja Bidhaa" : "Tag Product"} (
                            {filteredTagProducts.length})
                          </span>
                          <span className="text-[9px] lowercase text-slate-400">
                            @...
                          </span>
                        </div>
                        {filteredTagProducts.map((prod) => (
                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => {
                              if (!profileTextareaRef.current) return;
                              const el = profileTextareaRef.current;
                              const selectStart =
                                el.selectionStart || profileMsgText.length;
                              const textBefore = profileMsgText.slice(
                                0,
                                tagIndex,
                              );
                              const textAfter =
                                profileMsgText.slice(selectStart);
                              const insertText = `🛍️ ${prod.name} (${formatCurrency(prod.price)}) `;

                              setProfileMsgText(
                                textBefore + insertText + textAfter,
                              );
                              setShowTagSuggestions(false);

                              setTimeout(() => {
                                el.focus();
                                const valLength = (textBefore + insertText)
                                  .length;
                                el.setSelectionRange(valLength, valLength);
                              }, 10);
                            }}
                            className="w-full text-left p-2.5 hover:bg-slate-50 transition-colors flex items-center gap-3 active:bg-slate-100 cursor-pointer"
                          >
                            {prod.images && prod.images.length > 0 ? (
                              <img
                                src={prod.images[0]}
                                className="w-8 h-8 rounded-lg object-cover bg-slate-100 shrink-0"
                                alt=""
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                <Package size={14} />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-slate-800 truncate">
                                {prod.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-semibold">
                                {prod.category ||
                                  (lang === "sw" ? "Mengineyo" : "Other")}
                              </div>
                            </div>
                            <div className="text-xs font-black text-primary shrink-0">
                              <PriceDisplay
                                amount={prod.price}
                                size="xs"
                                colorClass="text-primary font-black"
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Media preview block if attached */}
                    {(attachedMediaUrl || isUploadingMedia) && (
                      <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm relative animate-in slide-in-from-bottom-2">
                        {isUploadingMedia ? (
                          <div className="flex items-center gap-2 p-1.5 text-xs text-slate-500 font-bold">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <span>
                              {lang === "sw"
                                ? "Inapakia faili..."
                                : "Uploading attachment..."}
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                              {isImage(attachedMediaUrl) ? (
                                <img
                                  src={attachedMediaUrl}
                                  className="w-full h-full object-cover"
                                  alt="Preview"
                                  referrerPolicy="no-referrer"
                                />
                              ) : isVideo(attachedMediaUrl) ? (
                                <video
                                  src={attachedMediaUrl}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Paperclip
                                  size={20}
                                  className="text-slate-400"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-700 truncate">
                                {attachedFile?.name ||
                                  (lang === "sw"
                                    ? "Kiambatisho"
                                    : "Attachment")}
                              </p>
                              <p className="text-[10px] text-slate-400 font-semibold uppercase">
                                {isImage(attachedMediaUrl)
                                  ? "Image"
                                  : isVideo(attachedMediaUrl)
                                    ? "Video"
                                    : "File"}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setAttachedMediaUrl("");
                                setAttachedFile(null);
                                if (fileInputRef.current)
                                  fileInputRef.current.value = "";
                              }}
                              className="p-1 px-1.5 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    <div className="flex items-end gap-2 bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm focus-within:ring-4 focus-within:ring-accent/10 focus-within:border-accent transition-all">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,video/*,application/pdf"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingMedia || isSendingMsg}
                        className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg shrink-0 transition"
                        title={
                          lang === "sw"
                            ? "Mlipia/Picha ya Kiambatisho"
                            : "Attach photo/file"
                        }
                      >
                        <Paperclip size={18} />
                      </button>

                      <textarea
                        ref={profileTextareaRef}
                        required={!attachedMediaUrl}
                        value={profileMsgText}
                        onChange={(e) => setProfileMsgText(e.target.value)}
                        placeholder={
                          lang === "sw"
                            ? "Andika ujumbe wako hapa..."
                            : "Type your message here..."
                        }
                        rows={1}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendProfileMessage(e);
                          }
                        }}
                        className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 rounded-lg p-2 px-3 text-sm outline-none border-none resize-none max-h-48 min-h-[38px] leading-relaxed self-center focus:ring-0"
                      />
                      <button
                        type="submit"
                        disabled={
                          isSendingMsg ||
                          isUploadingMedia ||
                          (!profileMsgText.trim() && !attachedMediaUrl)
                        }
                        className="bg-primary hover:bg-slate-800 text-white w-10 h-10 rounded-xl transition flex items-center justify-center shrink-0 disabled:opacity-50 disabled:hover:bg-primary shadow-md self-center"
                        title={lang === "sw" ? "Tuma Ujumbe" : "Send Message"}
                      >
                        {isSendingMsg ? (
                          <span className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-transparent animate-spin"></span>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4 rotate-45 transform translate-x-[-1px] translate-y-[1px]"
                          >
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <span>💡</span>
                        <span>
                          {lang === "sw"
                            ? "Andika ujumbe na ubonyeze Enter"
                            : "Type a message and press Enter"}
                        </span>
                      </p>
                      <p className="text-[10px] text-[#059669] font-bold">
                        {lang === "sw"
                          ? "Msaada wa Orbi Shop"
                          : "Orbi Shop Customer Care"}
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {tab === "rewards" &&
            (() => {
              const userId = user ? user.id : "guest";
              const pPoints = getLoyaltyPoints(userId);

              // Tier calculation
              let currentTier = "Bronze";
              let nextTier = "Silver";
              let nextPointsThreshold = 300;
              let tierColor = "from-amber-700 to-amber-900";
              let ringColor = "text-amber-500 animate-pulse";
              let tierBadge =
                lang === "sw" ? "🥉 Mwanachama wa Shaba" : "🥉 Bronze Member";

              if (pPoints >= 6000) {
                currentTier = "Orbi Elite VIP";
                nextTier = lang === "sw" ? "Kiwango cha Juu" : "Elite VIP Max";
                nextPointsThreshold = 6000;
                tierColor = "from-amber-900 via-rose-950 to-orange-950";
                ringColor = "text-amber-500";
                tierBadge =
                  lang === "sw"
                    ? "👑 Orbi Super Elite VIP"
                    : "👑 Orbi Super Elite VIP";
              } else if (pPoints >= 3000) {
                currentTier = "Platinum";
                nextTier = "Orbi Elite VIP";
                nextPointsThreshold = 6000;
                tierColor = "from-slate-700 via-slate-900 to-emerald-950";
                ringColor = "text-teal-400";
                tierBadge =
                  lang === "sw"
                    ? "💎 Mwanachama wa Platinamu"
                    : "💎 Platinum Member";
              } else if (pPoints >= 1000) {
                currentTier = "Gold";
                nextTier = "Platinum";
                nextPointsThreshold = 3000;
                tierColor = "from-amber-500 via-yellow-750 to-amber-955";
                ringColor = "text-amber-400";
                tierBadge =
                  lang === "sw" ? "🥇 Mwanachama wa Dhahabu" : "🥇 Gold Member";
              } else if (pPoints >= 300) {
                currentTier = "Silver";
                nextTier = "Gold";
                nextPointsThreshold = 1000;
                tierColor = "from-slate-500 via-slate-700 to-slate-900";
                ringColor = "text-slate-300";
                tierBadge =
                  lang === "sw" ? "🥈 Mwanachama wa Fedha" : "🥈 Silver Member";
              }

              const percentProgress =
                nextPointsThreshold === pPoints
                  ? 100
                  : Math.min(
                      100,
                      Math.floor((pPoints / nextPointsThreshold) * 100),
                    );
              // SVG circular progress math helpers
              const strokeDashoffset = 251.2 - (251.2 * percentProgress) / 100;

              const v5kCost =
                invSettings?.v_5k_cost !== undefined
                  ? Number(invSettings.v_5k_cost)
                  : 100;
              const v15Cost =
                invSettings?.v_15_vip_cost !== undefined
                  ? Number(invSettings.v_15_vip_cost)
                  : 250;
              const vShipCost =
                invSettings?.v_free_ship_cost !== undefined
                  ? Number(invSettings.v_free_ship_cost)
                  : 50;

              const redeemableVouchers = [
                {
                  id: "v_5k",
                  nameSw: "Punguzo TSh 5,000",
                  nameEn: "TSh 5,000 Discount Coupon",
                  points: v5kCost,
                  percent: 5,
                  descSw: `Inahitaji alama ${v5kCost} kukomboa`,
                  descEn: `Requires ${v5kCost} points to unlock`,
                },
                {
                  id: "v_15_vip",
                  nameSw: "Punguzo la 15% VIP",
                  nameEn: "15% Special VIP Voucher",
                  points: v15Cost,
                  percent: 15,
                  descSw: `Inahitaji alama ${v15Cost} kukomboa`,
                  descEn: `Requires ${v15Cost} points to unlock`,
                },
                {
                  id: "v_free_ship",
                  nameSw: "Uwasilishaji Orbi PaySafe Bure",
                  nameEn: "Orbi PaySafe Free Delivery Coupon",
                  points: vShipCost,
                  percent: 10,
                  descSw: `Inahitaji alama ${vShipCost} kukomboa`,
                  descEn: `Requires ${vShipCost} points to unlock`,
                },
              ];

              return (
                <div
                  className="space-y-6 animate-in fade-in duration-200"
                  key={forcePointsUpdate}
                >
                  {/* Visual Progressive Ring & Preferred Card layout */}
                  <div
                    className={`bg-gradient-to-br ${tierColor} rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl border border-white/10 flex flex-col lg:flex-row gap-6 items-center justify-between`}
                  >
                    <div className="absolute top-0 right-0 p-8 scale-150 rotate-12 opacity-5 pointer-events-none select-none">
                      <Award size={180} />
                    </div>

                    {/* Left block: Tier badge & details */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10 w-full lg:w-auto">
                      {/* PROGRESSIVE RING SVG CONTROLLER */}
                      <div className="relative w-28 h-28 flex items-center justify-center bg-black/30 rounded-full p-2 border border-white/10 shadow-inner shrink-0 leading-none">
                        <svg
                          className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.2)]"
                          viewBox="0 0 112 112"
                        >
                          <circle
                            cx="56"
                            cy="56"
                            r="40"
                            className="text-white/10"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                          />
                          <circle
                            cx="56"
                            cy="56"
                            r="40"
                            className={ringColor}
                            strokeWidth="8"
                            strokeDasharray="251.2"
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center text-center">
                          <span className="text-xl font-black font-sans tracking-tight text-white leading-none">
                            {percentProgress}%
                          </span>
                          <span className="text-[8px] uppercase tracking-wider text-white/70 font-black mt-1">
                            {lang === "sw" ? "Maendeleo" : "Progress"}
                          </span>
                        </div>
                      </div>

                      <div className="text-center sm:text-left">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-white/10 leading-none inline-block">
                          {tierBadge}
                        </span>
                        <h3 className="text-2xl font-black mt-3 tracking-tight font-sans text-white">
                          {user.name}
                        </h3>
                        <p className="text-[10px] text-white/50 font-mono tracking-wider mt-1.5 uppercase font-semibold">
                          VIP STATUS: {currentTier} •{" "}
                          {nextPointsThreshold - pPoints > 0
                            ? lang === "sw"
                              ? `Alama ${nextPointsThreshold - pPoints} zimebaki kuelekea ${nextTier}`
                              : `${nextPointsThreshold - pPoints} points left to ${nextTier}`
                            : lang === "sw"
                              ? "Umekamilisha viwango vyote"
                              : "Max Membership unlocked"}
                        </p>
                      </div>
                    </div>

                    {/* Right block: points balances */}
                    <div className="flex items-center gap-5 bg-black/20 border border-white/10 p-5 rounded-2xl shadow-inner w-full lg:w-auto min-w-[280px] justify-between z-10 font-sans font-semibold">
                      <div>
                        <span className="text-[10px] text-white/60 uppercase font-black tracking-wider block">
                          {lang === "sw" ? "Alama Zilizopo" : "Points Balance"}
                        </span>
                        <span className="text-4xl font-black text-amber-400 font-sans tracking-tight block mt-1.5 leading-none">
                          {pPoints}
                        </span>
                      </div>
                      <div className="h-10 border-l border-white/10"></div>
                      <div className="text-right">
                        <span className="text-[10px] text-white/60 uppercase font-black tracking-wider block">
                          {lang === "sw"
                            ? "Thamani Punguzo"
                            : "Cash Discount Value"}
                        </span>
                        <span className="text-lg font-bold text-emerald-400 block mt-1.5 leading-none font-sans font-semibold">
                          {formatCurrency(
                            Math.round(pPoints / pointsRequiredPerTzsDiscount),
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Option 3: Daily Lucky Scratchcard Gamified Component */}
                  <div id="scratch-challenge-widget">
                    <ScratchCardChallenge
                      userId={userId}
                      lang={lang}
                      pPoints={pPoints}
                      orders={orders}
                      onRewardClaimed={(pointsWon) => {
                        const currentPts = getLoyaltyPoints(userId);
                        saveLoyaltyPoints(userId, currentPts + pointsWon);
                        localStorage.setItem(
                          "orbi_last_scratch_score_" + userId,
                          pointsWon.toString(),
                        );
                        setForcePointsUpdate?.((prev) => prev + 1);
                      }}
                    />
                  </div>

                  {/* VISUAL RECEIPT & INVOICE PARSER NODE */}
                  <div
                    id="receipt-ocr-uploader-container"
                    className="bg-gradient-to-br from-amber-50 via-slate-50 to-amber-50/20 p-5 rounded-3xl border border-amber-100 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-5 items-center"
                  >
                    <div className="md:col-span-5 space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/60 border border-amber-200 rounded-full text-[10px] font-bold text-amber-700 uppercase tracking-widest leading-none">
                        <Sparkles
                          size={11}
                          className="text-amber-600 animate-pulse"
                        />
                        <span>
                          {lang === "sw"
                            ? "Skana za Risiti za AI"
                            : "Smart AI OCR Scanning"}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-800">
                        {lang === "sw"
                          ? "Mkombozi wa Risiti & Ankara"
                          : "Visual Receipt & Invoice Parser"}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        {lang === "sw"
                          ? "Piga picha au pakia risiti ya malipo ya Kariakoo ama duka lingine. AI itasoma maelezo na kuweka alama za uaminifu moja kwa moja kama shukrani!"
                          : "Snap or upload any external store invoice or checkout receipt. Our OCR AI extracts total text dynamically to award instant loyalty credits."}
                      </p>
                    </div>

                    {/* File Selector scanner button */}
                    <div className="md:col-span-7 flex flex-col items-center justify-center w-full">
                      <div className="w-full bg-white rounded-2xl border-2 border-dashed border-amber-200 hover:border-amber-400 p-6 flex flex-col items-center justify-center transition-all bg-radial relative overflow-hidden group">
                        <input
                          type="file"
                          accept="image/*"
                          id="receipt-ocr-uploader"
                          onChange={handleReceiptUpload}
                          disabled={isParsingReceipt}
                          className="hidden"
                        />

                        {isParsingReceipt ? (
                          <div className="flex flex-col items-center justify-center p-4">
                            <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mb-3" />
                            <p className="text-xs font-black text-slate-700 animate-pulse uppercase tracking-wider">
                              {lang === "sw"
                                ? "AI inasoma risiti yako..."
                                : "AI parsing physical text..."}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-1">
                              {lang === "sw"
                                ? "Tafadhali subiri sekunde kidogo."
                                : "Running Gemini OCR Engine."}
                            </p>
                          </div>
                        ) : parsedReceiptData ? (
                          <div className="w-full text-left space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider items-center flex gap-1">
                                📝{" "}
                                <span>
                                  {lang === "sw"
                                    ? "Hakiki Ankara"
                                    : "Audit Parsed Receipt"}
                                </span>
                              </h4>
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                                Vendor:{" "}
                                {parsedReceiptData.vendor ||
                                  "External Merchant"}
                              </span>
                            </div>

                            <div className="max-h-36 overflow-y-auto border border-slate-100 rounded-xl p-2.5 bg-slate-50 divide-y divide-slate-100">
                              {parsedReceiptData.items &&
                                parsedReceiptData.items.map(
                                  (it: any, k: number) => (
                                    <div
                                      key={`${it.name}-${k}`}
                                      className="flex justify-between py-1.5 text-xs font-semibold text-slate-700"
                                    >
                                      <span>
                                        {it.name}{" "}
                                        <span className="text-slate-400">
                                          x{it.quantity || 1}
                                        </span>
                                      </span>
                                      <span>
                                        <PriceDisplay
                                          amount={it.price || 0}
                                          size="xs"
                                          colorClass="text-slate-700 font-semibold"
                                        />
                                      </span>
                                    </div>
                                  ),
                                )}
                            </div>

                            <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center justify-between">
                              <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">
                                  {lang === "sw"
                                    ? "Jumla Kuu"
                                    : "Receipt Grand Total"}
                                </p>
                                <p className="text-xs font-black text-slate-800 mt-0.5">
                                  <PriceDisplay
                                    amount={parsedReceiptData.total}
                                    size="sm"
                                    colorClass="text-slate-800"
                                  />
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">
                                  {lang === "sw"
                                    ? "Zawadi ya Alama"
                                    : "Loyalty Points Award"}
                                </p>
                                <p className="text-xs font-black text-amber-700 mt-0.5 flex items-center justify-end gap-1">
                                  <Zap
                                    size={14}
                                    className="fill-amber-400 text-amber-500"
                                  />
                                  <span>
                                    +
                                    {parsedReceiptData.estimatedLoyaltyPoints ||
                                      Math.floor(
                                        parsedReceiptData.total / 2000,
                                      ) ||
                                      50}
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2.5">
                              <button
                                type="button"
                                onClick={handleClaimReceiptPoints}
                                className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-md text-[11px] uppercase tracking-wider transition cursor-pointer shadow-md shadow-amber-200/50"
                              >
                                🎉{" "}
                                {lang === "sw"
                                  ? "Ingiza Alama Kwenye Akaunti"
                                  : "Claim Loyalty Points"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setParsedReceiptData(null)}
                                className="px-4 py-1.5 bg-slate-150 hover:bg-slate-200 text-slate-700 font-bold rounded-md text-[11px] transition cursor-pointer"
                              >
                                {lang === "sw" ? "Ghairi" : "Cancel"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor="receipt-ocr-uploader"
                            className="flex flex-col items-center justify-center cursor-pointer w-full p-4 h-full"
                          >
                            <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-100 transition duration-300 shadow-sm mb-3 animate-pulse">
                              <Camera size={22} className="text-amber-600" />
                            </div>
                            <p className="text-sm font-bold text-slate-800 text-center">
                              {lang === "sw"
                                ? "Piga picha au chagua faili risiti hapa"
                                : "Snap or upload receipt picture"}
                            </p>
                            <p className="text-[10.5px] text-slate-400 mt-1 font-semibold text-center uppercase tracking-wider">
                              PNG, JPG, PDF • Dynamic Gemini OCR Parser
                            </p>
                          </label>
                        )}

                        {parsingError && (
                          <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-xl text-[11px] text-red-600 font-bold text-center w-full animate-pulse">
                            ⚠️ {parsingError}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* GAMIFICATION UNLOCKABLE VIP REWARDS SHOWCASE */}
                  <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b pb-4">
                      <div>
                        <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                          <Gift
                            size={18}
                            className="text-amber-500 animate-bounce"
                          />
                          <span>
                            {lang === "sw"
                              ? "Kibeti cha Zawadi na Kuponi"
                              : "🎁 Unlockable VIP Rewards Showcase"}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5 font-sans">
                          {lang === "sw"
                            ? "Badilisha alama zako kuwa kuponi halisi za mabezi"
                            : "Redeem your accumulated points to instantly generate active coupon cards."}
                        </p>
                      </div>

                      {/* Selector Tabs */}
                      <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-auto shrink-0 border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setRewardsCategory("available")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition uppercase tracking-wide cursor-pointer ${
                            rewardsCategory === "available"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          {lang === "sw" ? "Zilizopo Sasa" : "Available"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setRewardsCategory("claimed")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition uppercase tracking-wide cursor-pointer flex items-center gap-1 ${
                            rewardsCategory === "claimed"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          <span>
                            {lang === "sw" ? "Kuponi Zangu" : "My Coupons"}
                          </span>
                          {coupons.filter(
                            (c) =>
                              c.targetCustomer === userId ||
                              c.target_customer === userId,
                          ).length > 0 && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-black h-4 px-1.5 rounded-full flex items-center justify-center">
                              {
                                coupons.filter(
                                  (c) =>
                                    c.targetCustomer === userId ||
                                    c.target_customer === userId,
                                ).length
                              }
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    {rewardsCategory === "available" ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-sans font-semibold">
                        {redeemableVouchers.map((v) => {
                          const sufficient = pPoints >= v.points;
                          const progressPct = Math.min(
                            100,
                            Math.floor((pPoints / v.points) * 100),
                          );

                          // Custom gradients based on unlockability
                          const cardBg = sufficient
                            ? "bg-gradient-to-br from-amber-50/40 via-white to-white border-amber-200 hover:-translate-y-1 hover:shadow-md cursor-pointer"
                            : "bg-slate-50/50 border-slate-150 opacity-80";

                          return (
                            <div
                              key={v.id}
                              className={`border rounded-2xl p-5 flex flex-col justify-between transition-all select-none relative overflow-hidden ${cardBg}`}
                            >
                              {/* SVG Ticket cutout notches left and right */}
                              <div className="absolute -left-2 top-[55%] w-4 h-4 rounded-full bg-slate-50 border-r border-slate-150 shrink-0 z-10" />
                              <div className="absolute -right-2 top-[55%] w-4 h-4 rounded-full bg-slate-50 border-l border-slate-150 shrink-0 z-10" />

                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span
                                    className={`text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded border leading-none ${
                                      sufficient
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                    }`}
                                  >
                                    {v.points}{" "}
                                    {lang === "sw" ? "Alama" : "Points"}
                                  </span>
                                  {sufficient ? (
                                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                                      🔓 {lang === "sw" ? "Tayari" : "Unlocked"}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
                                      🔒 {v.points - pPoints} pts left
                                    </span>
                                  )}
                                </div>

                                <div className="pt-2">
                                  <h4 className="text-base font-black text-slate-800 tracking-tight leading-snug">
                                    {lang === "sw" ? v.nameSw : v.nameEn}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 mt-1.5 font-medium leading-relaxed">
                                    {lang === "sw" ? v.descSw : v.descEn}
                                  </p>
                                </div>

                                {/* Progress bar if locked */}
                                {!sufficient && (
                                  <div className="space-y-1 pt-2">
                                    <div className="flex justify-between items-center text-[9px] font-black text-slate-400">
                                      <span>PROGRESS TO UNLOCK</span>
                                      <span>{progressPct}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                      <div
                                        className="bg-amber-400 h-1.5 rounded-full transition-all duration-300"
                                        style={{ width: `${progressPct}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Ticket division line */}
                              <div className="border-t border-dashed border-slate-150 my-4 shrink-0" />

                              <button
                                type="button"
                                onClick={() => handleRedeemVoucher(v)}
                                disabled={!sufficient}
                                className={`w-full py-2.5 font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer outline-none border-none flex items-center justify-center gap-1.5 ${
                                  sufficient
                                    ? "bg-amber-500 hover:bg-slate-850 text-white shadow-sm hover:shadow-md transition active:scale-95"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                }`}
                              >
                                {sufficient ? (
                                  <>
                                    <Sparkles
                                      size={12}
                                      className="text-amber-300"
                                    />
                                    <span>
                                      {lang === "sw"
                                        ? "Kombolea Sasa"
                                        : "Redeem Coupon"}
                                    </span>
                                  </>
                                ) : (
                                  <span>
                                    {lang === "sw"
                                      ? "Alama Hazitoshi"
                                      : "Insufficient Balance"}
                                  </span>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Claimed Coupons List with copy-to-clipboard functionality! */
                      <div className="space-y-3 font-sans">
                        {coupons.filter(
                          (c) =>
                            c.targetCustomer === userId ||
                            c.target_customer === userId,
                        ).length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {coupons
                              .filter(
                                (c) =>
                                  c.targetCustomer === userId ||
                                  c.target_customer === userId,
                              )
                              .map((c) => (
                                <div
                                  key={c.id}
                                  className="border border-amber-200 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-amber-50/10 to-transparent shadow-xs"
                                >
                                  {/* Ticket cutout notches */}
                                  <div className="absolute -left-2 top-[50%] w-4 h-4 rounded-full bg-white border-r border-amber-200 shrink-0 z-10" />
                                  <div className="absolute -right-2 top-[50%] w-4 h-4 rounded-full bg-white border-l border-amber-200 shrink-0 z-10" />

                                  <div className="flex justify-between items-start gap-3">
                                    <div>
                                      <span className="text-[9px] uppercase font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 leading-none inline-block">
                                        {lang === "sw"
                                          ? "Kuponi Amilifu"
                                          : "Active Coupon"}
                                      </span>
                                      <h4 className="text-sm font-black text-slate-800 mt-2">
                                        {c.discountPercentage}%{" "}
                                        {lang === "sw"
                                          ? "Kuponi ya Punguzo"
                                          : "Discount Code VIP"}
                                      </h4>
                                      <p className="text-[10px] text-slate-400 font-medium font-mono mt-1">
                                        {lang === "sw"
                                          ? "Mwisho wa matumizi: "
                                          : "Valid until: "}
                                        {new Date(
                                          c.expiresAt,
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="text-xl font-black text-amber-500">
                                        {c.discountPercentage}% OFF
                                      </span>
                                    </div>
                                  </div>

                                  <div className="border-t border-dashed border-amber-100 my-3.5" />

                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-100 border border-slate-250 p-2 rounded-lg text-xs font-mono font-black select-all text-slate-700 text-center tracking-wider">
                                      {c.code}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(c.code);
                                        showAlert(
                                          lang === "sw"
                                            ? "Msimbo wa kuponi umenakiliwa vizuri!"
                                            : "Coupon code copied to clipboard!",
                                          "success",
                                        );
                                      }}
                                      className="px-3 py-2 bg-amber-500 hover:bg-slate-850 text-white rounded-lg text-[11px] font-black uppercase transition cursor-pointer"
                                    >
                                      {lang === "sw" ? "Nakili" : "Copy"}
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="py-12 text-center text-xs text-slate-400 font-semibold italic border-2 border-dashed border-slate-200 rounded-2xl">
                            {lang === "sw"
                              ? "Bado hujakomboa kuponi yoyote. Komboa alama zako kupata vocha za punguzo!"
                              : "No vouchers claimed yet. Redeem points to instantly generate coupons!"}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Loyalty History List based on actual user activity */}
                  <div className="bg-white rounded-3xl border border-slate-150 shadow-sm p-6 font-sans">
                    <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-1.5 border-b pb-3">
                      <Award size={18} className="text-amber-500" />
                      <span>
                        {lang === "sw"
                          ? "Historia ya Alama na Miamala"
                          : "Loyalty Ledger & Audit Trail"}
                      </span>
                    </h3>

                    <div className="divide-y divide-slate-100">
                      <div className="py-3.5 flex justify-between items-center text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-slate-800">
                            {lang === "sw"
                              ? "Zawadi ya Karibu ya Orbi Shop"
                              : "Orbi Shop Welcome Bonus"}
                          </span>
                          <span className="text-slate-400 font-medium font-mono animate-pulse">
                            System Initialization Bonus
                          </span>
                        </div>
                        <span className="font-black text-emerald-600 font-mono text-sm leading-none shrink-0 border border-emerald-200 rounded px-1.5 py-1 bg-emerald-50">
                          +150 pts
                        </span>
                      </div>

                      {orders.filter(
                        (o) =>
                          o.customerId === userId || o.customer_id === userId,
                      ).length > 0 ? (
                        orders
                          .filter(
                            (o) =>
                              o.customerId === userId ||
                              o.customer_id === userId,
                          )
                          .map((o) => {
                            const pointsEarned = Math.floor(
                              (o.total * currentPointsRate) / 1000,
                            );
                            if (pointsEarned <= 0) return null;
                            return (
                              <div
                                key={o.id}
                                className="py-3.5 flex justify-between items-center text-xs"
                              >
                                <div className="flex flex-col gap-1">
                                  <span className="font-black text-slate-800">
                                    {lang === "sw"
                                      ? `Kununua Bidhaa - Oda #${formatOrderNumber(o)}`
                                      : `Product Purchase - Order #${formatOrderNumber(o)}`}
                                  </span>
                                  <span className="text-slate-400 font-medium font-mono">
                                    {new Date(o.date).toLocaleDateString()}
                                  </span>
                                </div>
                                <span className="font-black text-emerald-600 font-mono text-sm leading-none shrink-0 border border-emerald-200 rounded px-1.5 py-1 bg-emerald-50">
                                  +{pointsEarned} pts
                                </span>
                              </div>
                            );
                          })
                      ) : (
                        <div className="py-6 text-center text-xs text-slate-400 italic font-semibold">
                          {lang === "sw"
                            ? "Fanya manunuzi upate alama zaidi hapa."
                            : "Place secure orders or scan purchase receipts to record loyalty points."}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

          {tab === "locator" && (
            <div className="space-y-6 animate-in fade-in duration-200 font-sans">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-extrabold text-slate-800 text-lg mb-2 flex items-center gap-2">
                  <MapPin size={22} className="text-orange-500 animate-pulse" />
                  <span>
                    {lang === "sw"
                      ? "Ramani ya Vituo & Makadirio ya Usafirishaji"
                      : "Carrier Map & Shipping Estimates"}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  {lang === "sw"
                    ? "Tazama ramani yetu ya vituo rasmi vya mizigo kote nchini Tanzania. Chagua mkoa au kituo ukiweka oda yako ili kupata gharama na muda kamilifu."
                    : "Interact with our official parcel carrier network across Tanzania. Select a carrier point to view physical address, base delivery fees, and estimated transit times."}
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Interactive Map */}
                  <div className="lg:col-span-7 bg-slate-900 border border-slate-750 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner h-[280px] sm:h-[320px]">
                    <div className="absolute top-3 left-4 z-10">
                      <span className="text-[10px] text-orange-400 font-extrabold uppercase tracking-widest font-mono">
                        {lang === "sw"
                          ? "Ramani ya Usafirishaji TZ"
                          : "TZ Express Transit Map"}
                      </span>
                    </div>
                    <svg
                      viewBox="0 0 320 200"
                      className="w-full h-full max-h-[290px]"
                    >
                      {/* Stylized TZ map */}
                      <path
                        d="M 60,10 L 220,15 L 280,110 L 270,185 L 130,175 L 50,110 Z"
                        fill="#1a2235"
                        stroke="#2d3748"
                        strokeWidth="2"
                        strokeDasharray="4"
                      />
                      {/* Water bodies */}
                      <circle
                        cx="110"
                        cy="15"
                        r="14"
                        fill="#0274b7"
                        opacity="0.3"
                      />
                      <path
                        d="M 45,50 Q 25,110 35,150"
                        fill="none"
                        stroke="#0274b7"
                        strokeWidth="6"
                        opacity="0.2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 285,130 L 280,150 Q 275,170 270,185"
                        fill="none"
                        stroke="#0274b7"
                        strokeWidth="3"
                        opacity="0.3"
                        strokeLinecap="round"
                      />

                      {/* Hub Pin connections */}
                      <path
                        d="M 90,45 L 190,55 L 160,115 L 240,165 L 260,150"
                        fill="none"
                        stroke="#ea580c"
                        strokeWidth="1"
                        strokeDasharray="3"
                        opacity="0.2"
                      />

                      {/* Map Pins */}
                      {[
                        {
                          id: "dar-kariakoo",
                          label: "Kariakoo",
                          x: 260,
                          y: 150,
                        },
                        { id: "dar-mbezi", label: "Mbezi", x: 240, y: 165 },
                        { id: "posta-mpya", label: "Posta", x: 275, y: 140 },
                        { id: "arusha-clock", label: "Arusha", x: 190, y: 55 },
                        { id: "mwanza-capri", label: "Mwanza", x: 90, y: 45 },
                        { id: "dodoma-cath", label: "Dodoma", x: 160, y: 115 },
                      ].map((p) => {
                        return (
                          <g key={p.id} className="cursor-pointer group">
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="8"
                              className="fill-orange-500/0 stroke-orange-500/0 group-hover:fill-orange-500/20 group-hover:stroke-orange-500/30 group-hover:animate-ping transition-all"
                              strokeWidth="0.5"
                            />
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="4"
                              className="fill-orange-500 stroke-white cursor-pointer hover:scale-125 transition-transform"
                              strokeWidth="1"
                            />
                            <text
                              x={p.x}
                              y={p.y - 7}
                              textAnchor="middle"
                              className="text-[8px] font-extrabold fill-slate-350 pointer-events-none tracking-tight"
                            >
                              {p.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Right Column: Details cards */}
                  <div className="lg:col-span-5 space-y-3">
                    <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                      {lang === "sw"
                        ? "Vituo Vilivyothibitishwa"
                        : "Verified Courier Carrier Hubs"}
                    </span>
                    <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                      {[
                        {
                          id: "dar-kariakoo",
                          nameSw: "Dar es Salaam (Kariakoo)",
                          nameEn: "Dar es Salaam (Kariakoo)",
                          address:
                            "Kariakoo Hub - Dar es Salaam, Mtaa wa Swahili, Plot 42",
                          cost: 2000,
                          daysSw: "Masaa 12 - 24",
                          daysEn: "12 - 24 Hours",
                        },
                        {
                          id: "dar-mbezi",
                          nameSw: "Dar es Salaam (Mbezi Mwisho)",
                          nameEn: "Dar es Salaam (Mbezi Terminal)",
                          address:
                            "Mbezi Terminal Hub - Dar es Salaam, Morogoro Road",
                          cost: 4000,
                          daysSw: "Masaa 24 (Siku 1)",
                          daysEn: "24 Hours (1 Day)",
                        },
                        {
                          id: "posta-mpya",
                          nameSw: "Dar es Salaam (Posta Mpya)",
                          nameEn: "Dar es Salaam (Posta Plaza)",
                          address:
                            "Posta Mpya Hub - Dar es Salaam, Ghorofa ya Makumbusho",
                          cost: 3000,
                          daysSw: "Masaa 6 - 12",
                          daysEn: "6 - 12 Hours",
                        },
                        {
                          id: "arusha-clock",
                          nameSw: "Arusha Town (Clocktower)",
                          nameEn: "Arusha (Clocktower Hub)",
                          address:
                            "Clocktower Hub - Arusha Town, Boma Road Roundabout",
                          cost: 6000,
                          daysSw: "Siku 2",
                          daysEn: "2 Days",
                        },
                        {
                          id: "mwanza-capri",
                          nameSw: "Mwanza Town (Capri Point)",
                          nameEn: "Mwanza (Capri Point Hub)",
                          address:
                            "Capri Point Hub - Mwanza City, Lake Zone Area",
                          cost: 8000,
                          daysSw: "Siku 2 - 3",
                          daysEn: "2 - 3 Days",
                        },
                        {
                          id: "dodoma-cath",
                          nameSw: "Dodoma Capital (Cathedral)",
                          nameEn: "Dodoma (Capital Cathedral)",
                          address:
                            "Capital Cathedral Hub - Dodoma, Cathedral Hill, Uhuru Way",
                          cost: 5000,
                          daysSw: "Siku 1 - 2",
                          daysEn: "1 - 2 Days",
                        },
                      ].map((hub) => (
                        <div
                          key={hub.id}
                          className="p-3 rounded-xl border border-slate-150 bg-white hover:border-slate-350 transition flex flex-col justify-between shadow-xs leading-none"
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <h4 className="font-extrabold text-xs text-slate-800">
                              {lang === "sw" ? hub.nameSw : hub.nameEn}
                            </h4>
                            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full font-black">
                              <PriceDisplay
                                amount={hub.cost}
                                size="xs"
                                colorClass="text-emerald-600"
                              />
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-normal mb-2">
                            {hub.address}
                          </p>
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold border-t border-slate-100 pt-2 shrink-0">
                            <Clock size={10} className="text-orange-500" />
                            <span>
                              {lang === "sw"
                                ? `Muda wa Kufikisha: ${hub.daysSw}`
                                : `Duration: ${hub.daysEn}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeliveryConfirmModal && selectedConfirmOrder && (
        <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 relative shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 font-sans">
            <button
              onClick={() => {
                setShowDeliveryConfirmModal(false);
                setSelectedConfirmOrder(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer outline-none"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-2.5">
                <Truck className="animate-bounce" size={24} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {lang === "sw"
                  ? "Thibitisha Pokeo la Mzigo"
                  : "Confirm Delivery Receipt"}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                {lang === "sw"
                  ? "Tafadhali thibitisha ikiwa umepokea kifurushi chako ukiwa umeridhika. Kufanya hivi kutatoa idhini ya kuachilia malipo yaliyoshikiliwa kwenye Orbi Pay (Escrow) kwenda kwa muuzaji."
                  : "Please confirm that your shipment has arrived successfully and is correct. Confirming will release your held funds from Orbi Pay (Escrow) to the seller."}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-5 space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold border-b pb-2 text-slate-400">
                <span>{lang === "sw" ? "Namba ya Oda:" : "Order ID:"}</span>
                <span className="font-mono text-slate-700">
                  #{formatOrderNumber(selectedConfirmOrder)}
                </span>
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto font-sans">
                {selectedConfirmOrder.items.map((it, idx) => (
                  <div
                    key={`${it.name}-${idx}`}
                    className="flex justify-between text-xs text-slate-600"
                  >
                    <span className="truncate max-w-[200px] font-medium">
                      {it.name}
                    </span>
                    <span className="font-bold">x{it.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 flex justify-between items-center text-xs font-bold text-slate-800">
                <span>
                  {lang === "sw" ? "Jumla ya Malipo:" : "Total Paid:"}
                </span>
                <span>
                  <PriceDisplay
                    amount={selectedConfirmOrder.total}
                    size="sm"
                    colorClass="text-emerald-600"
                  />
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeliveryConfirmModal(false);
                  setSelectedConfirmOrder(null);
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase transition cursor-pointer"
              >
                {lang === "sw" ? "Ghairi" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const updatedOrder = {
                      ...selectedConfirmOrder,
                      status: "BUYER_CONFIRMED" as const,
                    };
                    await db.saveOrder(updatedOrder);

                    // Update local states immediately
                    setLocalOrders((prev) =>
                      prev.map((o) =>
                        o.id === selectedConfirmOrder.id
                          ? { ...o, status: "BUYER_CONFIRMED" as const }
                          : o,
                      ),
                    );
                    if (
                      trackedOrder &&
                      trackedOrder.id === selectedConfirmOrder.id
                    ) {
                      setTrackedOrder((prev: any) =>
                        prev
                          ? { ...prev, status: "customer_confirmed" as any }
                          : null,
                      );
                    }

                    // Add notification message for admin
                    try {
                      await db.saveMessage({
                        id: "MSG_SYS_" + Date.now(),
                        name: "SYSTEM ALERT",
                        phone: "SYSTEM",
                        message: `🔔 ODA IMEKAMILIKA! Mteja ${selectedConfirmOrder.customerDetails.name} (${selectedConfirmOrder.customerDetails.phone}) amethibitisha kuwa amepokea mzigo wake kwa oda #${formatOrderNumber(selectedConfirmOrder)}. Malipo sasa yanangojea kibali chako cha kuachilia (Approve Funds)!`,
                        customerId: "00000000-0000-0000-0000-000000000000",
                        adminReply: null,
                        isRead: false,
                        date: Date.now(),
                      });
                    } catch (msgErr) {
                      console.error(
                        "Skipped sending system notification:",
                        msgErr,
                      );
                    }

                    setShowDeliveryConfirmModal(false);
                    setSelectedConfirmOrder(null);
                    showAlert(
                      lang === "sw"
                        ? "Asante rasi! Mapokezi ya oda yako yamethibitishwa vyema. Muuzaji anaombwa kuidhinisha malipo sasa."
                        : "Thank you! Your delivery confirmation is recorded. The seller has been notified to approve funds release.",
                      "success",
                    );
                    if (onRefresh) onRefresh();
                  } catch (e: any) {
                    showAlert(
                      "Failed to confirm delivery: " + e.message,
                      "error",
                    );
                  }
                }}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase transition flex items-center justify-center gap-1.5 shadow cursor-pointer"
              >
                <Check size={14} className="stroke-[2.5]" />
                <span>{lang === "sw" ? "HAKIKISHA" : "CONFIRM"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

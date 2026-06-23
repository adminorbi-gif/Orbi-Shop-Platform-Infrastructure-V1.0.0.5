import React, { useState, useMemo } from "react";
import { db } from "../lib/db";
import { SchemaValidator } from "../utils/schemaValidation";
import { PhotoQualityGuide } from "../components/PhotoQualityGuide";
import { supabase, supabaseUrl, supabaseKey } from "../lib/supabase";
import { formatCurrency } from "../lib/storage";
import { PriceDisplay } from "../components/PriceDisplay";
import { Product, Order, SellerProfile, Niche } from "../types";

const uploadFileToSupabase = async (
  rawFile: File,
  folder: "products" | "promotions" | "messages",
  onProgress?: (progress: number) => void,
): Promise<string> => {
  let file = rawFile;
  // Convert basic images to webp to save space
  if (
    file.type.startsWith("image/") &&
    file.type !== "image/webp" &&
    file.type !== "image/gif" &&
    file.type !== "image/svg+xml"
  ) {
    try {
      file = await new Promise<File>((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(rawFile);
        img.onload = () => {
          URL.revokeObjectURL(url);
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 1200;
          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            } else {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(width);
          canvas.height = Math.floor(height);
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(rawFile);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              if (!blob) return resolve(rawFile);
              resolve(
                new File(
                  [blob],
                  rawFile.name.replace(/\.[^/.]+$/, "") + ".webp",
                  { type: "image/webp" },
                ),
              );
            },
            "image/webp",
            0.85,
          );
        };
        img.onerror = () => resolve(rawFile);
        img.src = url;
      });
    } catch (e) {
      file = rawFile;
    }
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

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
            console.error("Upload Error:", xhr.responseText);
            reject(new Error(`Kosa la kupakia faili: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Munganisho umefeli (Network error)"));
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
import {
  Package,
  ShoppingCart,
  Settings as SettingsIcon,
  LayoutDashboard,
  LogOut,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Eye,
  EyeOff,
  Image as ImageIcon,
  ChevronRight,
  HelpCircle,
  ExternalLink,
  FileText,
  BadgeAlert,
  Coins,
  Send,
  Building,
  Megaphone,
  Zap,
  Tag,
  Store,
  ShieldCheck,
  Bot,
  Camera,
} from "lucide-react";
import { SellerMarketing } from "../components/seller/SellerMarketing";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface SellerAppProps {
  seller: SellerProfile;
  products: Product[];
  orders: Order[];
  onLogout: () => void;
  lang: "sw" | "en";
  setLang: (lang: "sw" | "en") => void;
  onRefreshData: () => Promise<void>;
}

export default function SellerApp({
  seller,
  products,
  orders,
  onLogout,
  lang,
  setLang,
  onRefreshData,
}: SellerAppProps) {
  const [tab, setTab] = useState<
    | "dashboard"
    | "products"
    | "orders"
    | "ai_copilot"
    | "marketing"
    | "settings"
    | "booster"
  >("dashboard");
  const [isPayoutRequesting, setIsPayoutRequesting] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [submittingPayout, setSubmittingPayout] = useState(false);

  // Screen size detection to avoid rendering hidden 0x0 size layout charts on mobile
  const [isMdScreen, setIsMdScreen] = useState(false);
  React.useEffect(() => {
    const handleResize = () => {
      setIsMdScreen(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Premium Booster Checkout states
  const [selectedPlanId, setSelectedPlanId] = useState("sub-gold");
  const [boosterPhone, setBoosterPhone] = useState("");
  const [boosterRef, setBoosterRef] = useState("");
  const [isUpdatingBooster, setIsUpdatingBooster] = useState(false);

  // Dialog or Alerts
  const [alertMsg, setAlertMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const displayAlert = (text: string, type: "success" | "error") => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  const [submittingTraId, setSubmittingTraId] = useState<string | null>(null);

  const handlePostSellerToTra = async (orderId: string) => {
    try {
      setSubmittingTraId(orderId);
      const res = await db.submitTraReceipt(orderId);
      if (res.success) {
        displayAlert("Receipt submitted successfully to TRA!", "success");
        if (typeof onRefreshData === "function") {
          onRefreshData();
        } else {
          window.location.reload();
        }
      }
    } catch (err: any) {
      displayAlert("Posting failed: " + err.message, "error");
    } finally {
      setSubmittingTraId(null);
    }
  };

  // Product state manager
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [nichesList, setNichesList] = useState<Niche[]>([]);

  // Product form states
  const [prodName, setProdName] = useState("");
  const [prodSku, setProdSku] = useState("");
  const [prodWarranty, setProdWarranty] = useState("");
  const [prodNiche, setProdNiche] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodFamily, setProdFamily] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodOldPrice, setProdOldPrice] = useState("");
  const [prodStock, setProdStock] = useState("");
  const [prodPricingMode, setProdPricingMode] = useState<
    "retail" | "wholesale"
  >("retail");
  const [prodWholesaleTiers, setProdWholesaleTiers] = useState<
    { minQty: number; maxQty?: number; price: number }[]
  >([]);
  const [prodDescription, setProdDescription] = useState("");
  const [prodFeatures, setProdFeatures] = useState<
    { name: string; description: string }[]
  >([]);
  const [showFeatureImport, setShowFeatureImport] = useState(false);
  const [featureImportText, setFeatureImportText] = useState("");
  const [featureImportMode, setFeatureImportMode] = useState<
    "append" | "replace"
  >("append");

  const handleImportFeaturesAction = (text: string) => {
    if (!text.trim()) return;

    const lines = text.split(/\r?\n/);
    const parsed: { name: string; description: string }[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const colonIndex = trimmed.indexOf(":");
      const equalIndex = trimmed.indexOf("=");

      let splitIndex = -1;
      if (colonIndex !== -1 && equalIndex !== -1) {
        splitIndex = Math.min(colonIndex, equalIndex);
      } else if (colonIndex !== -1) {
        splitIndex = colonIndex;
      } else if (equalIndex !== -1) {
        splitIndex = equalIndex;
      }

      if (splitIndex !== -1) {
        const rawKey = trimmed.substring(0, splitIndex).trim();
        const rawVal = trimmed.substring(splitIndex + 1).trim();

        const cleanKey = rawKey.replace(/^[\s\-\*\•\d\.\)]+/, "").trim();
        if (cleanKey) {
          parsed.push({ name: cleanKey, description: rawVal });
        }
      } else {
        const cleanKey = trimmed.replace(/^[\s\-\*\•\d\.\)]+/, "").trim();
        if (cleanKey) {
          parsed.push({ name: cleanKey, description: "" });
        }
      }
    });

    if (parsed.length > 0) {
      if (featureImportMode === "replace") {
        setProdFeatures(parsed);
      } else {
        setProdFeatures([...prodFeatures, ...parsed]);
      }
      setFeatureImportText("");
      setShowFeatureImport(false);
    }
  };

  const handleFeatureFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("text/") && !file.name.endsWith(".txt")) {
      alert(
        lang === "sw"
          ? "Tafadhali chagua faili la maandishi (.txt)"
          : "Please select a text file (.txt)",
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setFeatureImportText(text);
      }
    };
    reader.readAsText(file);
  };
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodVisible, setProdVisible] = useState(true);
  const [prodTaxCode, setProdTaxCode] = useState(1);
  const [prodArrangeTier, setProdArrangeTier] = useState("all");
  const [prodVibe, setProdVibe] = useState("all");
  const [prodPresentationStyle, setProdPresentationStyle] = useState("all");
  const [savingProduct, setSavingProduct] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<
    { id: string; name: string; progress: number }[]
  >([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [showQualityGuide, setShowQualityGuide] = useState(false);

  const handleImageFiles = async (inputFiles: File[]) => {
    const slicedFiles = inputFiles.slice(0, 5 - prodImages.length);
    if (slicedFiles.length === 0) return;

    setIsUploading(true);

    // Dynamic Client-side Quality Checker to auto-cancel and reject low quality images for sellers
    const validationResults = await Promise.all(
      slicedFiles.map(async (file) => {
        if (file.type.startsWith("video/")) {
          if (file.size > 45 * 1024 * 1024) {
            return {
              file,
              valid: false,
              reason: `Ukubwa wa video umezidi kiwango cha juu cha 45MB (Imeongezeka hadi ${Math.round(file.size / (1024 * 1024))}MB).`,
            };
          }
          return { file, valid: true };
        }

        const check = await new Promise<{ valid: boolean; reason?: string }>(
          (resolve) => {
            // Reject files exceeding max size limits (45MB)
            if (file.size > 45 * 1024 * 1024) {
              resolve({
                valid: false,
                reason: `Ukubwa wa faili umezidi bando la 45MB (${Math.round(file.size / (1024 * 1024))}MB).`,
              });
              return;
            }

            // Reject files under 15 KB (typically extremely small thumbnails or icon files)
            if (file.size < 15360) {
              resolve({
                valid: false,
                reason: `Ukubwa wa faili ni mdogo mno (${Math.round(file.size / 1024)} KB). Tafadhali weka picha iliyohaririwa ya ubora wa juu.`,
              });
              return;
            }

            const img = new Image();
            const objectUrl = URL.createObjectURL(file);

            img.onload = () => {
              URL.revokeObjectURL(objectUrl);
              // Height or width less than 500 contains insufficient detail for product display
              if (img.width < 500 || img.height < 500) {
                resolve({
                  valid: false,
                  reason: `Azimio lililogundulika (${img.width}x${img.height}px) ni dogo sana. Inatakiwa iwe angalau 500x500px.`,
                });
                return;
              }

              // Canvas analysis for heavy blur and monochromatic low-contrast indicators
              try {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  canvas.width = Math.min(img.width, 200);
                  canvas.height = Math.min(img.height, 200);
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  const imgData = ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height,
                  );
                  const data = imgData.data;

                  let totalLuma = 0;
                  const len = data.length;
                  for (let i = 0; i < len; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    totalLuma += 0.299 * r + 0.587 * g + 0.114 * b;
                  }
                  const avgLuma = totalLuma / (len / 4);

                  let varianceSum = 0;
                  for (let i = 0; i < len; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
                    varianceSum += Math.pow(luma - avgLuma, 2);
                  }
                  const stdDev = Math.sqrt(varianceSum / (len / 4));

                  // A standard deviation value under 12 typically indicates extreme blurred image or single solid colors
                  if (stdDev < 12) {
                    resolve({
                      valid: false,
                      reason: `Picha inaonekana haina utofautishi mzuri au ina ukungu mwingi sana (Extreme blur or low contrast).`,
                    });
                    return;
                  }
                }
              } catch (e) {
                // Gracefully bypass if canvas context restrictions apply
              }

              resolve({ valid: true });
            };

            img.onerror = () => {
              URL.revokeObjectURL(objectUrl);
              resolve({
                valid: false,
                reason: "Faili hili si faili la picha halali au limeharibika.",
              });
            };

            img.src = objectUrl;
          },
        );

        return { file, ...check };
      }),
    );

    const validFiles = validationResults
      .filter((r) => r.valid)
      .map((r) => r.file);
    const invalidFiles = validationResults.filter((r) => !r.valid);

    if (invalidFiles.length > 0) {
      const reasonsList = invalidFiles
        .map((r) => `• ${r.file.name}: ${r.reason}`)
        .join("\n");
      displayAlert(
        `Picha zifuatazo zimekataliwa kiotomatiki kwa sababu ya ubora duni au faili kubwa mno (Auto-Cancelled due to quality parameters/limits):\n\n${reasonsList}`,
        "error",
      );
    }

    if (validFiles.length === 0) {
      setIsUploading(false);
      return;
    }

    // Auto-convert valid image files into space-saving compressed high-quality WebP images
    const processedFiles = await Promise.all(
      validFiles.map(async (file) => {
        if (file.type.startsWith("video/")) {
          return file;
        }
        try {
          const webImage = await new Promise<File>((resolve) => {
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);
            img.onload = () => {
              URL.revokeObjectURL(objectUrl);
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              if (!ctx) {
                resolve(file);
                return;
              }
              // Compress to 1600px edge bounds for optimized display and size
              let width = img.width;
              let height = img.height;
              const maxDim = 1600;
              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = Math.round((height * maxDim) / width);
                  width = maxDim;
                } else {
                  width = Math.round((width * maxDim) / height);
                  height = maxDim;
                }
              }
              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(img, 0, 0, width, height);

              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    const originalName = file.name;
                    const baseName =
                      originalName.substring(
                        0,
                        originalName.lastIndexOf("."),
                      ) || originalName;
                    const webFileName = `${baseName}.webp`;
                    const webpCompFile = new File([blob], webFileName, {
                      type: "image/webp",
                      lastModified: Date.now(),
                    });
                    resolve(webpCompFile);
                  } else {
                    resolve(file);
                  }
                },
                "image/webp",
                0.82,
              );
            };
            img.onerror = () => {
              URL.revokeObjectURL(objectUrl);
              resolve(file);
            };
            img.src = objectUrl;
          });
          return webImage;
        } catch (e) {
          return file;
        }
      }),
    );

    const files = processedFiles;

    // Create tracking objects for new uploads
    const newUploads = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      progress: 0,
    }));
    setUploadingFiles(newUploads);

    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const tracker = newUploads[i];
        const url = await uploadFileToSupabase(file, "products", (progress) => {
          setUploadingFiles((prev) =>
            prev.map((item) =>
              item.id === tracker.id
                ? { ...item, progress: Math.round(progress) }
                : item,
            ),
          );
        });
        urls.push(url);
      }
      setProdImages((prev) => {
        // If there is only the default placeholder, replace it. Otherwise append.
        const filtered = prev.filter(
          (p) => !p.includes("photo-1546868871-7041f2a55e12"),
        );
        return [...filtered, ...urls];
      });
    } catch (err: any) {
      displayAlert("Imeshindwa kupakia picha: " + err.message, "error");
    } finally {
      setUploadingFiles([]);
      setIsUploading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    handleImageFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  // Load Niches dynamically from PostgreSQL Drizzle/Supabase cache
  React.useEffect(() => {
    async function loadNiches() {
      try {
        const list = await db.getNiches();
        setNichesList(list || []);
      } catch (err) {
        console.error("Failed to load niches inside SellerApp", err);
      }
    }
    loadNiches();
  }, []);

  // Form helpers
  const openProductForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProdName(product.name || "");
      setProdSku(product.sku || "");
      setProdWarranty(product.warranty || "");
      setProdNiche(product.niche || "");
      setProdCategory(product.category || "");
      setProdFamily(product.family || "");
      setProdPrice(product.price ? product.price.toString() : "");
      setProdOldPrice(product.oldPrice ? product.oldPrice.toString() : "");
      setProdStock(product.stock ? product.stock.toString() : "0");
      setProdDescription(product.description || "");
      setProdFeatures(product.features || []);
      setProdImages(product.images || []);
      setProdVisible(product.visible !== false);
      setProdTaxCode(product.taxCode || 1);
      setProdArrangeTier(product.arrangeTier || "all");
      setProdVibe(product.vibe || "all");
      setProdPresentationStyle(product.presentationStyle || "all");
      if (product.wholesaleTiers && product.wholesaleTiers.length > 0) {
        setProdPricingMode("wholesale");
        setProdWholesaleTiers(product.wholesaleTiers);
      } else {
        setProdPricingMode("retail");
        setProdWholesaleTiers([]);
      }
    } else {
      setEditingProduct(null);
      setProdName("");
      const randNum = Math.floor(100000 + Math.random() * 900000);
      setProdSku(`ORB-${randNum}`);
      setProdWarranty("");
      setProdNiche(nichesList.length > 0 ? nichesList[0].name : "");
      setProdCategory("");
      setProdFamily("");
      setProdPrice("");
      setProdOldPrice("");
      setProdStock("10");
      setProdDescription("");
      setProdFeatures([]);
      setProdImages([
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
      ]);
      setProdVisible(true);
      setProdTaxCode(1);
      setProdArrangeTier("all");
      setProdVibe("all");
      setProdPresentationStyle("all");
      setProdPricingMode("retail");
      setProdWholesaleTiers([]);
    }
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    let priceNum = parseFloat(prodPrice) || 0;
    const stockNum = parseInt(prodStock) || 0;

    let finalWholesaleTiers =
      prodPricingMode === "wholesale"
        ? prodWholesaleTiers.filter((t) => t.minQty > 0 && t.price > 0)
        : [];

    if (
      prodPricingMode === "wholesale" &&
      finalWholesaleTiers.length > 0 &&
      !priceNum
    ) {
      const sorted = [...finalWholesaleTiers].sort(
        (a, b) => a.minQty - b.minQty,
      );
      priceNum = sorted[0].price;
    }

    const payload: Partial<Product> = {
      name: prodName.trim(),
      sku: prodSku.trim(),
      warranty: prodWarranty.trim(),
      niche: prodNiche,
      category: prodCategory.trim() || prodNiche,
      family: prodFamily.trim(),
      price: priceNum,
      oldPrice: prodOldPrice ? parseFloat(prodOldPrice) : undefined,
      stock: stockNum,
      description: prodDescription.trim(),
      features: prodFeatures.filter(
        (f) => f.name.trim() && f.description.trim(),
      ),
      images:
        prodImages.length > 0
          ? prodImages
          : [
              "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
            ],
      visible: prodVisible,
      taxCode: prodTaxCode,
      arrangeTier: prodArrangeTier,
      vibe: prodVibe,
      presentationStyle: prodPresentationStyle,
      sellerId: seller.id,
      wholesaleTiers: finalWholesaleTiers,
      tags: [],
    };

    if (editingProduct) {
      payload.id = editingProduct.id;
    }

    // Run custom Zod-like structural validation
    const validation = SchemaValidator.validateProduct(
      payload,
      lang === "sw" ? "sw" : "en",
    );
    if (!validation.success || !validation.data) {
      displayAlert(validation.error || "Product validation failed", "error");
      return;
    }

    setSavingProduct(true);
    try {
      await db.saveProduct(validation.data);
      displayAlert(
        lang === "sw"
          ? "Bidhaa imehifadhiwa kwa ufanisi kwenye duka!"
          : "Product saved successfully into your storefront catalog!",
        "success",
      );
      setProductModalOpen(false);
      onRefreshData();
    } catch (err: any) {
      displayAlert(err.message || "Failed to save product", "error");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const confirmMsg =
      lang === "sw"
        ? "Je, uko tayari kufuta kabisa bidhaa hii kutoka kwenye jukwaa?"
        : "Are you sure you want to permanently delete this product from the platform?";
    if (window.confirm(confirmMsg)) {
      try {
        await db.deleteProduct(productId);
        displayAlert(
          lang === "sw"
            ? "Bidhaa imefutwa kikamilifu!"
            : "Product deleted successfully from your storefront!",
          "success",
        );
        onRefreshData();
      } catch (err: any) {
        displayAlert(err.message || "Failed to delete product", "error");
      }
    }
  };

  // 1. Scoped Products belonging to this Seller
  const sellerProducts = useMemo(() => {
    return products.filter((p) => p.sellerId === seller.id);
  }, [products, seller.id]);

  // 2. Scoped Orders belonging to this Seller's products
  const sellerOrders = useMemo(() => {
    return orders.filter((o) =>
      o.items.some((item) => {
        const prod = products.find((p) => p.id === item.productId);
        return prod?.sellerId === seller.id;
      }),
    );
  }, [orders, products, seller.id]);

  const discountSuggestions = useMemo(() => {
    // Select active products FOR THIS SELLER with stock > 0 that have no discount (or oldPrice <= price)
    const eligible = sellerProducts.filter(
      (p) => !!p.id && p.stock > 0 && (!p.oldPrice || p.oldPrice <= p.price),
    );

    // Sort oldest first (to surface older items for sales/promotions)
    const sorted = [...eligible].sort(
      (a, b) => (a.createdAt || 0) - (b.createdAt || 0),
    );

    return sorted.slice(0, 3).map((p) => {
      // Find similar products from OTHER sellers via full products array
      const similarProducts = products.filter(
        (other) =>
          other.sellerId !== p.sellerId &&
          (other.category === p.category || other.niche === p.niche),
      );

      let discountPct = 0;
      let targetPrice = p.price;
      let reasonEn = "";
      let reasonSw = "";

      if (similarProducts.length > 0) {
        const lowestCompetitorPrice = Math.min(
          ...similarProducts.map((s) => s.price),
        );
        if (lowestCompetitorPrice < p.price) {
          const beatPrice = Math.floor(lowestCompetitorPrice * 0.95);
          let rawDiscount = Math.ceil(((p.price - beatPrice) / p.price) * 100);
          discountPct = Math.max(5, Math.min(50, rawDiscount));
          targetPrice = Math.round((p.price * (100 - discountPct)) / 100);
          reasonEn = `Competitors sell similar items as low as ${formatCurrency(lowestCompetitorPrice)}. A ${discountPct}% off matches/beats them to push this item up the Shopping Centre ranks!`;
          reasonSw = `Washindani wanauza chini hadi ${formatCurrency(lowestCompetitorPrice)}. Punguzo la ${discountPct}% litakupa ushindani na kuipandisha bidhaa!`;
        } else {
          discountPct = p.stock > 10 ? 10 : 5;
          targetPrice = Math.round((p.price * (100 - discountPct)) / 100);
          reasonEn = `You're competitive, but this item is unsold. Drop it by ${discountPct}% to feature on the Top Picks section!`;
          reasonSw = `Bei inashindana, lakini mzigo (${p.stock}) umebaki. ${discountPct}% litairudisha kwenye chati!`;
        }
      } else {
        discountPct = p.stock > 10 ? 15 : 10;
        targetPrice = Math.round((p.price * (100 - discountPct)) / 100);
        reasonEn = `High stock (${p.stock}), no discount. A ${discountPct}% off promotion will push this to front page!`;
        reasonSw = `Akiba (${p.stock}) haina punguzo. Promo ya ${discountPct}% itaisukuma mbele kwa wateja!`;
      }

      return {
        product: p,
        discountPct,
        suggestedPrice: targetPrice,
        reasonEn,
        reasonSw,
      };
    });
  }, [sellerProducts, products]);

  const applyQuickDiscount = async (
    prod: Partial<Product>,
    pct: number,
    targetPrice: number,
  ) => {
    try {
      displayAlert(
        lang === "sw"
          ? `Inaweka punguzo la ${pct}% kwa ${prod.name}...`
          : `Applying ${pct}% discount to ${prod.name}...`,
        "success",
      );

      const updatedProd: Partial<Product> = {
        ...prod,
        oldPrice: prod.price,
        price: targetPrice,
      };

      await db.saveProduct(updatedProd);
      onRefreshData();

      displayAlert(
        lang === "sw"
          ? `Punguzo limewekwa kwa mafanikio!`
          : `Discount successfully applied!`,
        "success",
      );
    } catch (e: any) {
      displayAlert(e.message || "Failed to save discount", "error");
    }
  };

  // 3. Financial Computations
  const computedStats = useMemo(() => {
    // Total confirmed earnings from seller's items
    const confirmedOrders = sellerOrders.filter(
      (o) =>
        o.status === "confirmed" ||
        o.status === "shipped" ||
        o.status === "delivered",
    );
    let totalSales = 0;
    let totalItemsSold = 0;

    confirmedOrders.forEach((o) => {
      o.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        if (prod?.sellerId === seller.id) {
          totalSales += item.price * item.quantity;
          totalItemsSold += item.quantity;
        }
      });
    });

    // Simple month grouping for the Area Chart
    const salesByDay: Record<string, number> = {};
    const swahiliMonths = [
      "Jan",
      "Feb",
      "Mac",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    const englishMonths = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const months = lang === "sw" ? swahiliMonths : englishMonths;

    // Prefill last 5 months
    const curMonth = new Date().getMonth();
    for (let i = 4; i >= 0; i--) {
      const mIdx = (curMonth - i + 12) % 12;
      salesByDay[months[mIdx]] = 0;
    }

    confirmedOrders.forEach((o) => {
      const date = new Date(o.date);
      const mLabel = months[date.getMonth()];
      if (salesByDay[mLabel] !== undefined) {
        o.items.forEach((item) => {
          const prod = products.find((p) => p.id === item.productId);
          if (prod?.sellerId === seller.id) {
            salesByDay[mLabel] += item.price * item.quantity;
          }
        });
      }
    });

    const chartData = Object.keys(salesByDay).map((key) => ({
      name: key,
      Mauzo: salesByDay[key],
    }));

    // Stock level indicators
    const outOfStockCount = sellerProducts.filter((p) => p.stock <= 0).length;
    const lowStockCount = sellerProducts.filter(
      (p) => p.stock > 0 && p.stock <= 5,
    ).length;

    // Retrieve requested payouts
    return {
      totalSales,
      totalItemsSold,
      chartData,
      outOfStockCount,
      lowStockCount,
    };
  }, [sellerOrders, sellerProducts, products, seller.id, lang]);

  // Request payout trigger
  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(payoutAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      displayAlert(
        lang === "sw"
          ? "Tafadhali weka kiasi halali cha kutoa."
          : "Please enter a valid payout amount.",
        "error",
      );
      return;
    }
    if (parsedAmount > computedStats.totalSales) {
      displayAlert(
        lang === "sw"
          ? "Kiasi kilichoombwa kinazidi mauzo yako ya jumla."
          : "Requested amount exceeds your aggregate total verified sales completed.",
        "error",
      );
      return;
    }

    setSubmittingPayout(true);
    try {
      await db.savePayout({
        sellerId: seller.id,
        amount: parsedAmount,
        status: "pending",
      });
      displayAlert(
        lang === "sw"
          ? "Ombi la malipo limewasilishwa kwa usahihi kwa Benki ya Orbi!"
          : "Payout request sent successfully to Orbi Bank Admin authorization!",
        "success",
      );
      setPayoutAmount("");
      setIsPayoutRequesting(false);
      onRefreshData();
    } catch (err: any) {
      displayAlert(err.message || "Failed to submit payout", "error");
    } finally {
      setSubmittingPayout(false);
    }
  };

  return (
    <div className="h-[100dvh] bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row overflow-hidden relative">
      {/* Container Wrapper */}
      <div className="flex-1 flex flex-col md:flex-row w-full h-full">
        {/* Left Side Navigation (B2B Emerald Branded) */}
        <aside className="w-full md:w-72 bg-slate-950 text-slate-200 flex-shrink-0 flex flex-col items-stretch border-r border-slate-800">
          {/* DESKTOP/TABLET SIDEBAR HEADER */}
          <div className="hidden md:flex p-6 md:p-8 border-b border-white/5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold overflow-hidden shadow-inner shrink-0">
                  {seller.avatar ? (
                    <img
                      src={seller.avatar}
                      alt={seller.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building size={20} />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-black truncate text-white uppercase tracking-wider">
                    {seller.name}
                  </h2>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">
                    Orbi Merchant
                  </p>
                </div>
              </div>

              {/* Language switcher flag */}
              <button
                onClick={() => setLang(lang === "sw" ? "en" : "sw")}
                className="hover:scale-105 active:scale-95 transition bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-slate-300"
              >
                {lang === "sw" ? "EN" : "SW"}
              </button>
            </div>

            {/* Plan Badge */}
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  {lang === "sw" ? "MPANGO WA DUKA" : "STORE PLAN"}
                </p>
                <p className="text-xs font-black text-amber-400 uppercase tracking-wide mt-0.5">
                  {seller.isPro &&
                  seller.proUntil &&
                  seller.proUntil > Date.now()
                    ? "VIP GOLD MERCHANTS"
                    : "BASIC FREE SELLER"}
                </p>
              </div>
              <button
                onClick={() => setTab("booster")}
                className="bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 text-[9px] font-black uppercase px-2 py-1 rounded-lg border border-amber-400/20 shadow-sm shrink-0 cursor-pointer transition active:scale-95 duration-100"
              >
                {seller.isPro && seller.proUntil && seller.proUntil > Date.now()
                  ? "GOLD"
                  : "UPGRADE"}
              </button>
            </div>
          </div>

          {/* MOBILE SLIM HEADER */}
          <div className="flex md:hidden px-4 py-2.5 border-b border-white/5 items-center justify-between bg-slate-950 w-full shadow-md text-white select-none">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold overflow-hidden shrink-0">
                {seller.avatar ? (
                  <img
                    src={seller.avatar}
                    alt={seller.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building size={14} />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-black truncate uppercase tracking-tight text-white leading-none">
                  {seller.name}
                </h2>
                <span className="text-[8px] text-amber-400 font-black uppercase tracking-widest mt-0.5 block leading-none">
                  {seller.isPro &&
                  seller.proUntil &&
                  seller.proUntil > Date.now()
                    ? "GOLD"
                    : "BASIC"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setLang(lang === "sw" ? "en" : "sw")}
                className="hover:scale-105 active:scale-95 transition bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-200"
              >
                {lang === "sw" ? "EN" : "SW"}
              </button>

              <button
                onClick={() => (window.location.href = "/")}
                className="bg-emerald-55 border border-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 p-1.5 rounded-lg flex items-center justify-center"
                title={lang === "sw" ? "Soko Kuu" : "Main Soko"}
              >
                <Store size={13} />
              </button>

              <button
                onClick={onLogout}
                className="text-rose-400 hover:text-rose-500 bg-red-500/10 p-1.5 rounded-lg border border-red-500/20 flex items-center justify-center"
                title={lang === "sw" ? "Ondoka" : "Log out"}
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>

          {/* DESKTOP/TABLET VERTICAL NAVIGATION */}
          <nav className="hidden md:flex p-4 flex-col gap-2 text-xs font-bold uppercase tracking-widest flex-1 overflow-y-auto">
            <button
              onClick={() => setTab("dashboard")}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-left transition duration-150 cursor-pointer ${tab === "dashboard" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 font-black" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}
            >
              <LayoutDashboard size={18} />
              <span>
                {lang === "sw" ? "Meneja Dashboard" : "Dashboard Overview"}
              </span>
            </button>

            <button
              onClick={() => setTab("products")}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-left transition duration-150 cursor-pointer ${tab === "products" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 font-black" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}
            >
              <div className="flex items-center gap-3.5">
                <Package size={18} />
                <span>
                  {lang === "sw" ? "Bidhaa Zangu" : "Product Catalog"}
                </span>
              </div>
              {sellerProducts.length > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-lg ${tab === "products" ? "bg-white text-emerald-700" : "bg-white/10 text-slate-300"}`}
                >
                  {sellerProducts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setTab("orders")}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-left transition duration-150 cursor-pointer ${tab === "orders" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 font-black" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}
            >
              <div className="flex items-center gap-3.5">
                <ShoppingCart size={18} />
                <span>
                  {lang === "sw" ? "Oda za Wateja" : "Fulfillment stream"}
                </span>
              </div>
              {sellerOrders.length > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-lg ${tab === "orders" ? "bg-white text-emerald-700" : "bg-white/10 text-slate-300"}`}
                >
                  {sellerOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setTab("ai_copilot")}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-left transition duration-150 cursor-pointer ${tab === "ai_copilot" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/10 font-black" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}
            >
              <Sparkles size={18} className="animate-pulse" />
              <span>
                {lang === "sw"
                  ? "Merchant AI Assistant"
                  : "Merchant AI Co-Pilot"}
              </span>
            </button>

            <button
              onClick={() => setTab("marketing")}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-left transition duration-150 cursor-pointer ${tab === "marketing" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 font-black" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}
            >
              <Megaphone size={18} />
              <span>{lang === "sw" ? "Promote & Ads" : "Sponsored Ads"}</span>
            </button>

            <button
              onClick={() => setTab("booster")}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-left transition duration-150 cursor-pointer ${tab === "booster" ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/10 font-black animate-in fade-in" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}
            >
              <Zap
                size={18}
                className={
                  tab === "booster"
                    ? "text-white"
                    : "text-amber-400 animate-pulse"
                }
              />
              <span>
                {lang === "sw" ? "Premium Booster" : "Booster & Upgrade"}
              </span>
            </button>

            <button
              onClick={() => setTab("settings")}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-left transition duration-150 cursor-pointer ${tab === "settings" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 font-black" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}
            >
              <SettingsIcon size={18} />
              <span>
                {lang === "sw" ? "Mipangilio ya Duka" : "Store Invoicing"}
              </span>
            </button>
          </nav>

          {/* MOBILE NAVIGATION STRIP */}
          <div className="flex md:hidden bg-slate-900 leading-none py-2 px-2.5 overflow-x-auto scrollbar-none border-b border-white/5 gap-1.5 w-full items-center select-none sticky top-[48px] z-20 backdrop-blur-md">
            {[
              { id: "dashboard", label: "Dash", icon: LayoutDashboard },
              {
                id: "products",
                label: lang === "sw" ? "Bidhaa" : "Products",
                icon: Package,
                badge: sellerProducts.length,
              },
              {
                id: "orders",
                label: lang === "sw" ? "Oda" : "Orders",
                icon: ShoppingCart,
                badge: sellerOrders.length,
              },
              {
                id: "ai_copilot",
                label: "AI Bot",
                icon: Sparkles,
                highlight: true,
              },
              {
                id: "marketing",
                label: lang === "sw" ? "Soko" : "Ads",
                icon: Megaphone,
              },
              { id: "booster", label: "Boost", icon: Zap, gold: true },
              {
                id: "settings",
                label: lang === "sw" ? "Mipangilio" : "Settings",
                icon: SettingsIcon,
              },
            ].map((tabItem) => (
              <button
                key={tabItem.id}
                onClick={() => setTab(tabItem.id as any)}
                className={`flex flex-col items-center justify-center min-w-[62px] max-w-[80px] px-2 py-2 rounded-xl transition-all duration-150 cursor-pointer shrink-0 ${
                  tab === tabItem.id
                    ? tabItem.highlight
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm font-black scale-[1.03]"
                      : tabItem.gold
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm font-black scale-[1.03]"
                        : "bg-emerald-600 text-white shadow-sm font-black scale-[1.03]"
                    : "bg-white/5 text-slate-400 border border-white/[0.04] hover:bg-white/10"
                }`}
              >
                <div className="relative leading-none">
                  <tabItem.icon
                    size={15}
                    className={
                      tab === tabItem.id
                        ? "text-white"
                        : tabItem.gold
                          ? "text-amber-400"
                          : "text-slate-400"
                    }
                  />
                  {tabItem.badge && tabItem.badge > 0 ? (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-black text-[8px] px-1 py-0.2 rounded-full leading-none">
                      {tabItem.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[9px] font-bold mt-1 text-center truncate w-full block leading-none">
                  {tabItem.label}
                </span>
              </button>
            ))}
          </div>

          {/* Footer controls (Desktop only) */}
          <div className="hidden md:flex p-6 border-t border-white/5 flex flex-col gap-3">
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full bg-white/5 border border-white/10 text-slate-300 py-3 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-white/10 active:scale-95 transition cursor-pointer text-center"
            >
              {lang === "sw" ? "Tembelea Soko Kuu" : "Main Shopping Soko"}
            </button>
            <button
              onClick={onLogout}
              className="w-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 py-3 rounded-2xl text-xs font-black uppercase tracking-wider active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={14} />
              <span>{lang === "sw" ? "Ondoka" : "Log out"}</span>
            </button>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 bg-white p-6 sm:p-8 md:p-10 overflow-y-auto h-full flex flex-col items-center">
          <div className="w-full max-w-7xl flex-1 flex flex-col">
            {/* Active Toast notifications */}
            {alertMsg && (
              <div
                className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 border ${alertMsg.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800"}`}
              >
                {alertMsg.type === "success" ? (
                  <Check className="shrink-0" size={18} />
                ) : (
                  <X className="shrink-0" size={18} />
                )}
                <p className="text-xs font-bold leading-tight">
                  {alertMsg.text}
                </p>
              </div>
            )}

            {/* VIEW: DASHBOARD Overview */}
            {tab === "dashboard" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-display font-black text-slate-900 leading-tight">
                      {lang === "sw"
                        ? `Habari, ${seller.name}! 👋`
                        : `Jeambo, ${seller.name}! 👋`}
                    </h1>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                      {lang === "sw"
                        ? "Karibu kwenye mfumo wako dhabiti wa wauzaji wa Orbi Merchant."
                        : "Welcome back to your premium and exclusive Orbi B2B business headquarters."}
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200/80 p-3 rounded-2xl flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                      {lang === "sw"
                        ? "DUKA LIPO MTANDAONI"
                        : "Merchant Terminal Active"}
                    </span>
                  </div>
                </div>

                {/* Bento Grid Analytics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Sale Income Card */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs relative overflow-hidden group @container min-w-0">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform"></div>
                    <div className="bg-emerald-100 text-emerald-700 w-10 h-10 rounded-2xl flex items-center justify-center mb-4 shrink-0">
                      <TrendingUp size={20} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
                      {lang === "sw" ? "Pato Zuri (Sales)" : "Gross Income"}
                    </p>
                    <div
                      className="mt-1 truncate w-full"
                      style={{ fontSize: "clamp(1rem, 12cqw, 1.25rem)" }}
                    >
                      <PriceDisplay
                        amount={computedStats.totalSales}
                        size="xl"
                        colorClass="text-slate-950"
                      />
                    </div>
                    <p className="text-[10px] text-emerald-600 font-medium mt-1.5 flex items-center gap-1 truncate w-full">
                      <ArrowUpRight size={12} className="shrink-0" />
                      <span className="truncate">
                        {lang === "sw"
                          ? "Mauzo yote yaliyohakikiwa"
                          : "Aggregate confirmed earnings"}
                      </span>
                    </p>
                  </div>

                  {/* Items sold Count Card */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs relative overflow-hidden group @container min-w-0">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform"></div>
                    <div className="bg-amber-100 text-amber-700 w-10 h-10 rounded-2xl flex items-center justify-center mb-4 shrink-0">
                      <Layers size={20} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
                      {lang === "sw" ? "Kiasi cha Bidhaa" : "Products Sold"}
                    </p>
                    <div
                      className="mt-1 font-black text-slate-950 truncate w-full"
                      style={{ fontSize: "clamp(1rem, 12cqw, 1.25rem)" }}
                    >
                      {computedStats.totalItemsSold} Items
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium mt-1.5 truncate">
                      {lang === "sw"
                        ? "Kutoka kwa oda zilizokubaliwa"
                        : "Sourced from orders processed"}
                    </p>
                  </div>

                  {/* Stock Level Warning Card */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs relative overflow-hidden group @container min-w-0">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform"></div>
                    <div className="bg-rose-100 text-rose-700 w-10 h-10 rounded-2xl flex items-center justify-center mb-4 shrink-0">
                      <BadgeAlert size={20} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
                      {lang === "sw" ? "Arifa ya Stock" : "Inventory Alert"}
                    </p>
                    <div
                      className="mt-1 truncate w-full"
                      style={{ fontSize: "clamp(1rem, 12cqw, 1.25rem)" }}
                    >
                      {computedStats.outOfStockCount > 0 ? (
                        <span className="font-black text-rose-600">
                          {computedStats.outOfStockCount} Out of stock
                        </span>
                      ) : computedStats.lowStockCount > 0 ? (
                        <span className="font-black text-amber-500">
                          {computedStats.lowStockCount} Low stock
                        </span>
                      ) : (
                        <span className="font-black text-emerald-600">
                          Catalog Healthy
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold mt-1.5 truncate">
                      {lang === "sw"
                        ? `${sellerProducts.length} bidhaa zimeorodheshwa`
                        : `${sellerProducts.length} live products currently listed`}
                    </p>
                  </div>

                  {/* Wallet / Request Payout Card (Innovative Instant Draw-down) */}
                  <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-5 rounded-3xl border border-emerald-700 shadow-sm relative overflow-hidden group @container min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 -translate-y-12"></div>
                      <div className="bg-white/10 text-white w-10 h-10 rounded-2xl flex items-center justify-center mb-4 shrink-0">
                        <Coins size={20} />
                      </div>
                      <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest truncate">
                        {lang === "sw" ? "SALDO YA KUTOA" : "PAYOUT BALANCE"}
                      </p>
                      <div
                        className="mt-1 truncate w-full"
                        style={{ fontSize: "clamp(1rem, 12cqw, 1.25rem)" }}
                      >
                        <PriceDisplay
                          amount={computedStats.totalSales}
                          size="xl"
                          colorClass="text-white"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => setIsPayoutRequesting(true)}
                      className="mt-3 shrink-0 cursor-pointer w-full bg-white text-emerald-800 text-[10px] font-black uppercase py-2 rounded-xl text-center hover:bg-emerald-50 active:scale-95 transition"
                    >
                      {lang === "sw" ? "Omba Malipo Sasa" : "Request Payout"}
                    </button>
                  </div>
                </div>

                {/* Instant Payout Dialog Drawer */}
                {isPayoutRequesting && (
                  <div className="p-6 bg-emerald-50 border border-emerald-200/80 rounded-3xl flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wider">
                        {lang === "sw"
                          ? "OMBA Payout Papo Hapo"
                          : "Direct Payout Terminal"}
                      </h3>
                      <p className="text-xs text-emerald-800/80 max-w-lg font-medium leading-relaxed">
                        {lang === "sw"
                          ? "Andika kiasi unachotaka kuhamisha kwenda kwenye akaunti yako ya malipo ya benki au mkoba wa simu uliohifadhiwa."
                          : "Enter the amount you wish to withdraw and draw down from your verified settled sales. Request will execute internally."}
                      </p>
                    </div>
                    <form
                      onSubmit={handleRequestPayout}
                      className="w-full sm:w-auto flex items-center gap-3"
                    >
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500">
                          TZS
                        </span>
                        <input
                          required
                          type="number"
                          placeholder="e.g. 50000"
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(e.target.value)}
                          className="w-full sm:w-44 bg-white border border-slate-200 p-3.5 pl-12 rounded-2xl outline-none focus:border-emerald-600 font-mono text-xs font-bold"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submittingPayout}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase px-5 py-3.5 rounded-2xl shadow-md transition whitespace-nowrap cursor-pointer disabled:opacity-50"
                      >
                        {submittingPayout
                          ? lang === "sw"
                            ? "Inatuma..."
                            : "Requesting..."
                          : lang === "sw"
                            ? "Tuma Ombi"
                            : "Submit"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPayoutRequesting(false)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-600 p-3.5 rounded-2xl cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </form>
                  </div>
                )}

                {/* Graphic charts - Desktop */}
                {isMdScreen && (
                  <div className="hidden md:block bg-white p-4 sm:p-6 md:p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                        {lang === "sw"
                          ? "Mtindo wa Mapato kwa Miezi"
                          : "Income Performance Stream"}
                      </h3>
                      <p className="text-slate-500 text-xs font-medium mt-1">
                        {lang === "sw"
                          ? "Onyesho la mauzo kamili yaliyoidhinishwa"
                          : "Aesthetic metric showing verified completed earnings trend"}
                      </p>
                    </div>
                    <div className="h-[300px] sm:h-[400px] w-full font-mono mt-2">
                      <ResponsiveContainer
                        width="100%"
                        height={350}
                        minHeight={50}
                        minWidth={50}
                      >
                        <AreaChart
                          data={computedStats.chartData}
                          margin={{ top: 5, right: 0, left: -25, bottom: -5 }}
                        >
                          <defs>
                            <linearGradient
                              id="colorSales"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#10b981"
                                stopOpacity={0.2}
                              />
                              <stop
                                offset="95%"
                                stopColor="#10b981"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="name"
                            stroke="#94a3b8"
                            fontSize={10}
                            tickMargin={8}
                          />
                          <YAxis
                            stroke="#94a3b8"
                            fontSize={10}
                            width={40}
                            tickFormatter={(val) =>
                              val >= 1000000
                                ? (val / 1000000).toFixed(1) + "M"
                                : val >= 1000
                                  ? (val / 1000).toFixed(0) + "k"
                                  : val
                            }
                          />
                          <Tooltip
                            formatter={(value) => [
                              `TZS ${Number(value).toLocaleString()}`,
                              lang === "sw" ? "Kipato" : "Income",
                            ]}
                          />
                          <Area
                            type="monotone"
                            dataKey="Mauzo"
                            stroke="#10b981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorSales)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Graphic charts - Mobile Button */}
                <div className="md:hidden">
                  <button
                    type="button"
                    onClick={() => setChartModalOpen(true)}
                    className="w-full bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between text-left"
                  >
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                        {lang === "sw"
                          ? "Mtindo wa Mapato"
                          : "Income Performance Stream"}
                      </h3>
                      <p className="text-slate-500 text-xs font-medium mt-1">
                        {lang === "sw"
                          ? "Bonyeza kuona chati ya mapato"
                          : "Tap to view earnings chart"}
                      </p>
                    </div>
                    <TrendingUp className="text-emerald-500" />
                  </button>
                </div>
              </div>
            )}

            {/* VIEW: CATALOG (My products) */}
            {tab === "products" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 leading-tight">
                      {lang === "sw" ? "Katalogi ya Bidhaa" : "Products Center"}
                    </h1>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                      {lang === "sw"
                        ? "Simamia bidhaa, ongeza na kurekebisha bei au stoki yako."
                        : "Add, manage, track inventory levels, and configure listing details."}
                    </p>
                  </div>

                  {/* Visual upgrade to indicate custom addition */}
                  <button
                    type="button"
                    onClick={() => openProductForm()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase px-4 py-3.5 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl flex items-center gap-2 shadow-md transition cursor-pointer"
                  >
                    <Plus size={16} />
                    <span className="hidden sm:inline">
                      {lang === "sw" ? "Ongeza Bidhaa" : "Upload Product"}
                    </span>
                    <span className="sm:hidden">
                      {lang === "sw" ? "Pakia" : "Upload"}
                    </span>
                  </button>
                </div>

                {discountSuggestions.length > 0 && (
                  <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-600/5 border border-amber-500/25 rounded-3xl p-5 shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-md">
                          <Sparkles
                            size={20}
                            className="animate-spin"
                            style={{ animationDuration: "4s" }}
                          />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-800 text-sm sm:text-base leading-none">
                            {lang === "sw"
                              ? "Msaidizi wa Mauzo: Pendekezo la Punguzo"
                              : "Sales Assistant: Promotion Recommendations"}
                          </h3>
                          <p className="text-[11px] sm:text-xs text-slate-500 mt-1 font-medium">
                            {lang === "sw"
                              ? "Tumegundua bidhaa zenye akiba isiyohama. Weka punguzo hili ili kuzipandisha haraka kwenye orodha ya shopping!"
                              : "Identified slow-moving inventory. Adopt these auto-calculated promotions to quickly get them pushed to the client Shopping Centre!"}
                          </p>
                        </div>
                      </div>
                      <span className="hidden sm:inline-flex text-[10px] uppercase tracking-widest font-black text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full">
                        Smart Suggestion
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      {discountSuggestions.map((suggestion) => (
                        <div
                          key={suggestion.product.id}
                          className="bg-white/90 backdrop-blur-sm border border-amber-100/80 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-sm hover:border-amber-300 hover:shadow transition-all group"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 border-b border-dashed border-slate-100 pb-2.5">
                              <span className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1 group-hover:text-amber-600 transition tracking-tight">
                                {suggestion.product.name}
                              </span>
                              <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded-lg text-slate-500 shrink-0 border border-slate-200/50">
                                Qty: {suggestion.product.stock}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-2.5 italic">
                              "
                              {lang === "sw"
                                ? suggestion.reasonSw
                                : suggestion.reasonEn}
                              "
                            </p>
                            <div className="flex items-center gap-2 mt-3.5">
                              <span className="text-xs line-through text-slate-400 font-medium font-mono">
                                {formatCurrency(suggestion.product.price)}
                              </span>
                              <span className="text-sm font-black text-emerald-600 font-mono">
                                {formatCurrency(suggestion.suggestedPrice)}
                              </span>
                              <span className="text-[10px] bg-emerald-100/50 text-emerald-700 font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                                -{suggestion.discountPct}%
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              applyQuickDiscount(
                                suggestion.product,
                                suggestion.discountPct,
                                suggestion.suggestedPrice,
                              )
                            }
                            className="w-full bg-slate-900 group-hover:bg-amber-600 text-white font-bold py-3 px-3 rounded-xl text-[11px] sm:text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                          >
                            <Tag
                              size={13}
                              className="text-amber-400 group-hover:text-amber-100"
                            />
                            <span>
                              {lang === "sw"
                                ? `Weka -${suggestion.discountPct}% Sasa `
                                : `Promote & push (-${suggestion.discountPct}%)`}
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products List (Responsive: Desktop Table / Mobile Cards) */}
                <div>
                  {/* Desktop Table View */}
                  <div className="hidden sm:block bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full min-w-[700px] text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200/60 uppercase text-[10px] font-black text-slate-400 tracking-widest pointer-events-none select-none">
                            <th className="px-6 py-4.5">
                              {lang === "sw"
                                ? "Picha & Bidhaa"
                                : "Item details"}
                            </th>
                            <th className="px-6 py-4.5">SKU / ID</th>
                            <th className="px-6 py-4.5">
                              {lang === "sw" ? "Jamii (Niche)" : "Category"}
                            </th>
                            <th className="px-6 py-4.5">
                              {lang === "sw" ? "Bei (TZS)" : "Price"}
                            </th>
                            <th className="px-6 py-4.5">Stoki</th>
                            <th className="px-6 py-4.5">Status</th>
                            <th className="px-6 py-4.5">
                              {lang === "sw" ? "Vitendo" : "Actions"}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                          {sellerProducts.length === 0 ? (
                            <tr>
                              <td
                                colSpan={7}
                                className="px-6 py-12 text-center text-slate-400 font-bold"
                              >
                                {lang === "sw"
                                  ? "Hujapakia bidhaa bado duka hili."
                                  : "You have not uploaded any products yet under this seller outlet."}
                              </td>
                            </tr>
                          ) : (
                            sellerProducts.map((p) => (
                              <tr
                                key={p.id}
                                className="hover:bg-slate-50/50 transition duration-100"
                              >
                                {/* Product Info */}
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/50 overflow-hidden flex items-center justify-center shrink-0">
                                      {p.images && p.images[0] ? (
                                        <img
                                          src={p.images[0]}
                                          alt={p.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <ImageIcon
                                          size={16}
                                          className="text-slate-400"
                                        />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-bold text-slate-900 truncate max-w-[180px]">
                                        {p.name}
                                      </div>
                                      <div className="text-[10px] text-slate-400 truncate max-w-[180px] mt-0.5">
                                        {p.description}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* SKU / ID */}
                                <td className="px-6 py-4 font-mono text-[10px] text-slate-500">
                                  {p.sku ||
                                    p.id.split("-")[0]?.toUpperCase() ||
                                    "N/A"}
                                </td>

                                {/* Category */}
                                <td className="px-6 py-4">
                                  <span className="bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded-lg text-[9px] uppercase">
                                    {p.niche} :: {p.category}
                                  </span>
                                </td>

                                {/* Price */}
                                <td className="px-6 py-4 font-bold text-slate-900">
                                  {formatCurrency(p.price)}
                                </td>

                                {/* Stock Indicator */}
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`w-2 h-2 rounded-full ${p.stock <= 0 ? "bg-red-500" : p.stock <= 5 ? "bg-amber-500" : "bg-emerald-500"}`}
                                    ></span>
                                    <span className="font-bold">
                                      {p.stock} Qty
                                    </span>
                                  </div>
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4">
                                  <span
                                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border select-none ${p.visible === false ? "bg-slate-100 border-slate-200 text-slate-400" : "bg-emerald-50/50 border-emerald-100 text-emerald-800"}`}
                                  >
                                    {p.visible === false
                                      ? lang === "sw"
                                        ? "Sio Wazi"
                                        : "Hidden / Draft"
                                      : lang === "sw"
                                        ? "Mubashara"
                                        : "Live / Active"}
                                  </span>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-1.5">
                                    {p.stock < 5 && (
                                      <button
                                        type="button"
                                        onClick={() => openProductForm(p)}
                                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide rounded-xl transition border border-amber-200/50 cursor-pointer flex items-center gap-1"
                                        title={
                                          lang === "sw"
                                            ? "Ongeza Stoki"
                                            : "Reorder"
                                        }
                                      >
                                        <Plus size={11} strokeWidth={3} />
                                        {lang === "sw" ? "Reorder" : "Reorder"}
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => openProductForm(p)}
                                      className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 rounded-xl transition border border-slate-200/40 hover:border-emerald-200/40 cursor-pointer"
                                      title={
                                        lang === "sw"
                                          ? "Hariri Bidhaa"
                                          : "Edit Item"
                                      }
                                    >
                                      <Edit2 size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteProduct(p.id)}
                                      className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-700 rounded-xl transition border border-slate-200/40 hover:border-rose-200/40 cursor-pointer"
                                      title={
                                        lang === "sw"
                                          ? "Futa Bidhaa"
                                          : "Delete Item"
                                      }
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Cards View */}
                  <div className="sm:hidden space-y-3">
                    {sellerProducts.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-slate-200/60 p-8 text-center text-slate-400 font-bold text-xs">
                        {lang === "sw"
                          ? "Hujapakia bidhaa bado duka hili."
                          : "You have not uploaded any products yet under this seller outlet."}
                      </div>
                    ) : (
                      sellerProducts.map((p) => (
                        <div
                          key={p.id}
                          className="bg-white rounded-2xl border border-slate-200/60 p-3 shadow-xs flex gap-3 relative overflow-hidden"
                        >
                          {/* Side color bar indicator for stock/status */}
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-1 ${p.visible === false ? "bg-slate-300" : p.stock <= 0 ? "bg-red-500" : p.stock <= 5 ? "bg-amber-400" : "bg-emerald-500"}`}
                          />

                          <div className="w-[84px] h-[84px] rounded-xl bg-slate-100 border border-slate-200/50 overflow-hidden shrink-0 ml-1 relative">
                            {p.images && p.images[0] ? (
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                <ImageIcon
                                  size={20}
                                  className="text-slate-300"
                                />
                              </div>
                            )}
                            {!p.visible && (
                              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                <EyeOff size={16} className="text-slate-600" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <div>
                              <div className="flex justify-between items-start gap-2 pr-1">
                                <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-1">
                                  {p.name}
                                </h3>
                                <span
                                  className={`px-1.5 py-0.5 rounded font-black text-[9px] shrink-0 ${p.stock <= 0 ? "bg-red-50 text-red-600" : p.stock <= 5 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}
                                >
                                  {p.stock}
                                </span>
                              </div>
                              <div className="text-[11px] mt-1 text-slate-500 flex items-center gap-1.5 font-black">
                                <span className="text-slate-900">
                                  {formatCurrency(p.price)}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase max-w-full truncate">
                                  {p.category || p.niche}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                              {p.stock < 5 && (
                                <button
                                  type="button"
                                  onClick={() => openProductForm(p)}
                                  className="h-7 px-2.5 flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] uppercase font-bold rounded-lg border border-amber-200/50 transition cursor-pointer"
                                >
                                  <Plus size={12} strokeWidth={3} />{" "}
                                  {lang === "sw" ? "Stoki" : "Add"}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => openProductForm(p)}
                                className="h-7 px-2.5 flex items-center justify-center bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 rounded-lg border border-slate-200/50 transition cursor-pointer ml-auto"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(p.id)}
                                className="h-7 px-2.5 flex items-center justify-center bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg border border-slate-200/50 transition cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: ORDERS (Fulfillment Stream) */}
            {tab === "orders" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 leading-tight">
                    {lang === "sw"
                      ? "Mizigo na Uwasilishaji"
                      : "Fulfillment Stream"}
                  </h1>
                  <p className="text-slate-500 text-xs font-medium mt-1">
                    {lang === "sw"
                      ? "Angalia oda zilizopokelewa kutoka kwa wateja, badili hali ili kukamilisha usafirishaji."
                      : "Track incoming orders, calculate payout percentages, check destination details."}
                  </p>
                </div>

                {/* Orders Queue */}
                <div className="space-y-4">
                  {sellerOrders.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-3xl border border-slate-200/60 shadow-xs text-slate-400 font-bold">
                      {lang === "sw"
                        ? "Hujapokea oda yoyote kutoka kwa wateja bado."
                        : "No client orders contain products belonging to your shop at this moment."}
                    </div>
                  ) : (
                    sellerOrders.map((o) => {
                      // Extract items relevant only to this seller
                      const sellerSpecificItems = o.items.filter((item) => {
                        const prod = products.find(
                          (p) => p.id === item.productId,
                        );
                        return prod?.sellerId === seller.id;
                      });
                      const sellerItemsTotal = sellerSpecificItems.reduce(
                        (acc, i) => acc + i.price * i.quantity,
                        0,
                      );

                      return (
                        <div
                          key={o.id}
                          className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-5.5 sm:p-6 space-y-4 hover:border-slate-300 transition duration-150"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                            <div>
                              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                                ORDER CODE
                              </span>
                              <div className="text-sm font-black text-slate-950 font-mono tracking-tight mt-0.5">
                                {o.id.split("-")[0]?.toUpperCase() || o.id}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] text-slate-500 font-bold">
                                {new Date(o.date).toLocaleDateString()}
                              </span>
                              <span
                                className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border ${
                                  o.status === "confirmed"
                                    ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                                    : o.status === "shipped"
                                      ? "bg-blue-50 border-blue-100 text-blue-800"
                                      : o.status === "delivered"
                                        ? "bg-emerald-50 border-emerald-100 text-emerald-850"
                                        : o.status === "cancelled"
                                          ? "bg-rose-50 border-rose-100 text-rose-800"
                                          : "bg-amber-50 border-amber-100 text-amber-800 animate-pulse"
                                }`}
                              >
                                {o.status}
                              </span>
                            </div>
                          </div>

                          {/* Customer & Item Rows */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Seller Specific Purchased Items */}
                            <div className="space-y-3">
                              <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                {lang === "sw"
                                  ? "BIDHAA YAKO KWENYE ODA"
                                  : "YOUR ITEMS"}
                              </h4>
                              <div className="space-y-2">
                                {sellerSpecificItems.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-xs font-bold text-slate-800"
                                  >
                                    <div className="min-w-0 pr-4">
                                      <div className="truncate text-slate-900">
                                        {item.name}
                                      </div>
                                      <div className="text-[10px] text-slate-400 mt-0.5">
                                        Qty {item.quantity} x{" "}
                                        {formatCurrency(item.price)}
                                      </div>
                                    </div>
                                    <div className="text-slate-950 shrink-0">
                                      {formatCurrency(
                                        item.price * item.quantity,
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="pt-2 border-t border-dashed border-slate-100 flex items-center justify-between text-xs font-black text-slate-900">
                                <span>
                                  {lang === "sw"
                                    ? "Jumla Pato Lako:"
                                    : "Your Payout Total:"}
                                </span>
                                <span className="text-emerald-600 font-mono">
                                  {formatCurrency(sellerItemsTotal)}
                                </span>
                              </div>
                            </div>

                            {/* Consignee Address */}
                            <div className="bg-slate-50 p-4 rounded-2xl flex flex-col justify-between text-xs space-y-2 font-medium">
                              <div>
                                <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5">
                                  {lang === "sw"
                                    ? "MPOKEAJI / KUREJEA"
                                    : "DELIVERY DESTINATION"}
                                </h4>
                                <div className="font-bold text-slate-900 mb-0.5">
                                  {o.customerDetails?.name || "Customer"}
                                </div>
                                <div className="text-slate-500">
                                  {o.customerDetails?.address ||
                                    "Posta / Terminal hub"}
                                </div>
                                <div className="text-slate-500 font-mono mt-1">
                                  {o.customerDetails?.phone}
                                </div>
                              </div>
                              <div className="text-[10px] text-slate-400 font-bold bg-white/60 p-2 rounded-lg border border-slate-200/50 mt-1 uppercase">
                                {lang === "sw"
                                  ? `WAKATI WA MALIPO: DIRECT ORBI PAYSAFE`
                                  : `ORBI PAYSAFE TRANSACTION REGISTERED`}
                              </div>
                            </div>
                          </div>

                          {/* TRA Invoice Verification segment */}
                          <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block text-left">
                                TRA EFDMS TAX INVOICE STATUS
                              </span>
                              <div className="mt-1 flex items-center gap-1.5 font-bold text-slate-900 justify-start">
                                {o.paymentReference?.includes(
                                  "TRA_VERIFIED",
                                ) ? (
                                  <>
                                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-emerald-700 uppercase tracking-tight text-[10px] font-black">
                                      {lang === "sw"
                                        ? "◆ RISITI YA TRA TAYARI ◆"
                                        : "◆ TRA SIGNED & VERIFIED ◆"}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                                    <span className="text-amber-700 uppercase tracking-tight text-[10px] font-black">
                                      {lang === "sw"
                                        ? "Bado haijatolewa risiti TRA"
                                        : "No receipt submitted to TRA"}
                                    </span>
                                  </>
                                )}
                              </div>
                              {o.paymentReference?.includes("TRA_VERIFIED") && (
                                <div className="text-[9px] text-slate-500 font-mono mt-1 text-left">
                                  {o.paymentReference
                                    .split("||")
                                    .find((p) => p.startsWith("RCTNUM:")) ||
                                    ""}{" "}
                                  |{" "}
                                  {o.paymentReference
                                    .split("||")
                                    .find((p) => p.startsWith("DATE:")) || ""}
                                </div>
                              )}
                            </div>
                            <div>
                              {!o.paymentReference?.includes("TRA_VERIFIED") ? (
                                <button
                                  type="button"
                                  disabled={submittingTraId === o.id}
                                  onClick={() => handlePostSellerToTra(o.id)}
                                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-xl text-[9px] uppercase transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
                                >
                                  {submittingTraId === o.id ? (
                                    <RefreshCw
                                      className="animate-spin"
                                      size={10}
                                    />
                                  ) : (
                                    <ExternalLink size={10} />
                                  )}
                                  {lang === "sw"
                                    ? "Sajili risiti TRA"
                                    : "Submit TRA Invoice"}
                                </button>
                              ) : (
                                <div className="text-[9px] bg-emerald-100/60 text-emerald-800 font-black border border-emerald-200 px-3 py-1.5 rounded-lg font-mono whitespace-nowrap">
                                  COMPLIANT
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* VIEW: MERCHANT AI CO-PILOT (Powered by real server-side Gemini endpoints) */}
            {tab === "ai_copilot" && (
              <AICopilotWidget
                lang={lang}
                seller={seller}
                sellerProducts={sellerProducts}
              />
            )}

            {/* VIEW: MARKETING & SPONSORED CAMPAIGNS */}
            {tab === "marketing" && (
              <SellerMarketing
                lang={lang}
                seller={seller}
                products={sellerProducts}
                displayAlert={displayAlert}
              />
            )}

            {/* VIEW: PREMIUM BOOSTER & SUGGESTION STRATEGY */}
            {tab === "booster" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Refinement: Beautiful premium light gradient matching application color profile */}
                <div className="bg-gradient-to-br from-emerald-50 via-white to-amber-50/40 text-slate-900 p-6 sm:p-8 rounded-[2rem] shadow-xs relative overflow-hidden border border-emerald-100/80">
                  <div className="absolute right-0 top-0 opacity-15 translate-x-12 -translate-y-6 select-none pointer-events-none">
                    <Sparkles size={180} className="text-emerald-500/30" />
                  </div>
                  <div className="space-y-3 relative z-10 font-sans">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-emerald-600 rounded-lg text-white">
                        <Sparkles size={14} className="fill-white" />
                      </span>
                      <span className="text-[10px] font-black tracking-widest text-emerald-700 uppercase">
                        {lang === "sw"
                          ? "VIP PREMIUM MARKETING & BOOSTER"
                          : "VIP PREMIUM MARKETING & BOOSTER"}
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 block">
                      {lang === "sw"
                        ? "Kituo cha Booster na Kupandisha Duka"
                        : "Premium Booster & Suggestion Strategy Hub"}
                    </h1>
                    <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed font-medium">
                      {lang === "sw"
                        ? "Pata wateja mara 8 zaidi kwa kusukuma bidhaa zako moja kwa moja kwenye sehemu ya Pendekezo la Soko Kuu ya Shopping Centre (Pro Picks). Bidhaa zako zitaonekana kwa wanunuzi wote."
                        : "Boost conversions and traffic by pushing items directly inside the client Shopping Centre 'Suggested' layout. Reach prospective shoppers instantly without effort."}
                    </p>
                  </div>
                </div>

                {/* TWO COLUMN BENTO LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* LEFT COLUMN: DIAGNOSIS & ACTIVE PRODUCTS STRATEGY (7/12 width) */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Unsold Stock Inspector Card */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-xs space-y-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                            <BadgeAlert size={16} />
                          </span>
                          <h2 className="text-sm font-black uppercase text-slate-800 tracking-wider">
                            {lang === "sw"
                              ? "Mchunguzi: Bidhaa Zilizokaa Sana Bila Mauzo"
                              : "Inventory Diagnostics: Unsold Slow-Moving Stocks"}
                          </h2>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {lang === "sw"
                            ? "Maudhui ya hivi karibuni yanaonyesha bidhaa ambazo hazijauzwa hata mara moja. Weka ofa au uandikishe booster kuzipandisha soko!"
                            : "Real-time shelf inventory analysis of your products with 0 total active sales in the system."}
                        </p>
                      </div>

                      {/* Calculation of unsold products */}
                      {(() => {
                        const unsoldProducts = sellerProducts.filter((p) => {
                          const sales = sellerOrders.reduce((sum, o) => {
                            if (o.status !== "cancelled") {
                              o.items.forEach((item) => {
                                if (item.productId === p.id) {
                                  sum += item.quantity || 1;
                                }
                              });
                            }
                            return sum;
                          }, 0);
                          return sales === 0 && p.stock > 0;
                        });

                        if (unsoldProducts.length === 0) {
                          return (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                              <Check
                                className="text-emerald-600 mx-auto mb-2"
                                size={24}
                              />
                              <p className="text-xs font-black text-emerald-800 block">
                                {lang === "sw"
                                  ? "Bidhaa Zote Ziko Kwenye Chati!"
                                  : "Awesome! No Unsold Dead Stock Found"}
                              </p>
                              <p className="text-[10px] text-emerald-600 mt-0.5">
                                {lang === "sw"
                                  ? "Kila bidhaa katika ghala lako ina mauzo yanayoendelea kikamilifu."
                                  : "Every item in your inventory is successfully generating client-facing sales."}
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-3">
                            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 rounded-2xl p-4 text-xs font-semibold flex items-start gap-2.5">
                              <span className="text-base select-none">💡</span>
                              <div>
                                <p className="font-extrabold text-amber-900">
                                  {lang === "sw"
                                    ? `Ushauri wa Mauzo: Una bidhaa ${unsoldProducts.length} zilizorundikana bila mauzo!`
                                    : `Sales Advisor: We found ${unsoldProducts.length} items sitting unsold on shelves!`}
                                </p>
                                <p className="text-[10px] text-amber-700 font-medium mt-1 leading-relaxed">
                                  {lang === "sw"
                                    ? "Kushuka kwa bei kwa angalau 15% pamoja na kuziweka kwenye 'Suggested List' kutavutia wateja wapya mara moja. Chagua hatua haraka hapa chini."
                                    : "Adopting a promotional markdown combined with setting an active product push strategy below will guarantee placement in main-page buyer suggestions!"}
                                </p>
                              </div>
                            </div>

                            <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto pr-1">
                              {unsoldProducts.map((p, idx) => {
                                // Calculate real age of product in days
                                const msDiff =
                                  Date.now() - (p.createdAt || Date.now());
                                const actualDays = Math.max(
                                  1,
                                  Math.floor(msDiff / (1000 * 3600 * 24)),
                                );
                                const suggestedPromoPrice = Math.round(
                                  p.price * 0.85,
                                );

                                return (
                                  <div
                                    key={p.id}
                                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                                        <img
                                          src={
                                            p.image ||
                                            "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
                                          }
                                          className="w-full h-full object-cover group-hover:scale-105 duration-150"
                                          alt=""
                                        />
                                      </div>
                                      <div className="min-w-0">
                                        <h4 className="text-xs font-black text-slate-800 truncate block leading-tight">
                                          {p.name}
                                        </h4>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">
                                          {p.category} •{" "}
                                          <span className="text-red-500 font-black">
                                            {actualDays}{" "}
                                            {lang === "sw"
                                              ? "Siku Rafuni"
                                              : "Days Unsold"}
                                          </span>
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                      <div className="text-right mr-1.5 shrink-0">
                                        <p className="text-xs font-black text-slate-900 font-mono">
                                          {formatCurrency(p.price)}
                                        </p>
                                        <p className="text-[9px] text-emerald-600 font-bold">
                                          {lang === "sw"
                                            ? "Dondosha hadi:"
                                            : "Promo target:"}{" "}
                                          {formatCurrency(suggestedPromoPrice)}
                                        </p>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          applyQuickDiscount(
                                            p,
                                            15,
                                            suggestedPromoPrice,
                                          )
                                        }
                                        className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-[9px] uppercase px-3 py-1.5 rounded-lg cursor-pointer transition"
                                      >
                                        {lang === "sw"
                                          ? "15% Promo"
                                          : "Set Promo"}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* ACTIVE BOOST STRATEGY SELECTION PANEL */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-xs space-y-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Layers size={16} />
                          </span>
                          <h2 className="text-sm font-black uppercase text-slate-800 tracking-wider">
                            {lang === "sw"
                              ? "Uteuzi wa Mikakati ya Kupandisha Bidhaa (Push Strategy)"
                              : "Suggestion Push Strategy Options"}
                          </h2>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {lang === "sw"
                            ? "Kama bado hujajiunga na VIP Pro Gold, tafadhali chagua mkakati wako utakaofanya kazi pindi unapo booster duka au kulipia tangazo!"
                            : "Standard accounts use one active suggestion push channel. Gold VIP accounts auto-generate high-reach placements on BOTH networks!"}
                        </p>
                      </div>

                      {/* Interactive Selection Cards */}
                      {(() => {
                        const activeStrategy = seller.isPro
                          ? "both"
                          : localStorage.getItem(
                              "orbi_push_strategy_" + seller.id,
                            ) || "old";

                        const handleSelectStrategy = (mode: "old" | "new") => {
                          if (seller.isPro) {
                            displayAlert(
                              lang === "sw"
                                ? "Akaunti yako ni VIP PRO GOLD! Unafaidika na kusukuma bidhaa zote mbili (Zilizokaa & Mpya) kwa wakati mmoja, hakuna haja ya kuchagua!"
                                : "You are a Gold VIP! Your store enjoys premium exposure across both old stock clearing and new arrival channels concurrently.",
                              "success",
                            );
                            return;
                          }
                          localStorage.setItem(
                            "orbi_push_strategy_" + seller.id,
                            mode,
                          );
                          onRefreshData();
                          displayAlert(
                            lang === "sw"
                              ? `Imeweka mkakati wa: ${mode === "old" ? "Kusukuma bidhaa za zamani" : "Kusukuma bidhaa mpya"}!`
                              : `Promotional strategy successfully updated to: ${mode === "old" ? "Push Long-Unsold Items" : "Push New Arrivals"}!`,
                            "success",
                          );
                        };

                        return (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              {/* Strategy 1: Old Stock Pushing */}
                              <button
                                type="button"
                                onClick={() => handleSelectStrategy("old")}
                                className={`p-5 rounded-2xl border text-left transition duration-200 flex flex-col justify-between font-sans outline-none relative cursor-pointer ${
                                  activeStrategy === "old"
                                    ? "border-emerald-600 bg-emerald-50/20 shadow-sm"
                                    : activeStrategy === "both"
                                      ? "border-slate-100 bg-slate-50 opacity-70 pointer-events-none"
                                      : "border-slate-150 hover:border-slate-300 bg-white"
                                }`}
                              >
                                {activeStrategy === "old" && (
                                  <span className="absolute top-2.5 right-2.5 p-1 bg-emerald-600 rounded-lg text-white">
                                    <Check size={10} />
                                  </span>
                                )}
                                <div className="space-y-1">
                                  <span
                                    className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${activeStrategy === "old" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}
                                  >
                                    {lang === "sw" ? "Mkakati wa 1" : "Mode 1"}
                                  </span>
                                  <h3 className="font-extrabold text-xs text-slate-800 mt-1.5 uppercase tracking-wider block">
                                    {lang === "sw"
                                      ? "Sukuma Bidhaa za Zamani"
                                      : "Push Old Unsold Stocks"}
                                  </h3>
                                  <p className="text-[10px] text-slate-500 mt-1 leading-normal font-medium">
                                    {lang === "sw"
                                      ? "Chagua hii kusafisha stoku zilizosimama. Bidhaa zilizo na mauzo 0 zitapewa kipaumbele cha juu kabisa kwenye soko."
                                      : "Focuses client recommendations on stale, zero-sale shelf stock. Clears stagnant inventory first."}
                                  </p>
                                </div>
                              </button>

                              {/* Strategy 2: New / Hot Pushing */}
                              <button
                                type="button"
                                onClick={() => handleSelectStrategy("new")}
                                className={`p-5 rounded-2xl border text-left transition duration-200 flex flex-col justify-between font-sans outline-none cursor-pointer ${
                                  activeStrategy === "new"
                                    ? "border-emerald-600 bg-emerald-50/20 shadow-sm"
                                    : activeStrategy === "both"
                                      ? "border-slate-100 bg-slate-50 opacity-70 pointer-events-none"
                                      : "border-slate-150 hover:border-slate-300 bg-white"
                                }`}
                              >
                                {activeStrategy === "new" && (
                                  <span className="absolute top-2.5 right-2.5 p-1 bg-emerald-600 rounded-lg text-white">
                                    <Check size={10} />
                                  </span>
                                )}
                                <div className="space-y-1">
                                  <span
                                    className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${activeStrategy === "new" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}
                                  >
                                    {lang === "sw" ? "Mkakati wa 2" : "Mode 2"}
                                  </span>
                                  <h3 className="font-extrabold text-xs text-slate-800 mt-1.5 uppercase tracking-wider block">
                                    {lang === "sw"
                                      ? "Sukuma Bidhaa Mpya"
                                      : "Push Fresh New Products"}
                                  </h3>
                                  <p className="text-[10px] text-slate-500 mt-1 leading-normal font-medium">
                                    {lang === "sw"
                                      ? "Chagua hii pindi unapoingiza mzigo mpya unayotaka kuitambulisha sokoni haraka na kuongeza umaarufu asili."
                                      : "Targets recently created products or top performers with active sales to launch new arrivals to suggestions."}
                                  </p>
                                </div>
                              </button>
                            </div>

                            {/* Dual Push Gold Mode Indicator (Activated only if Pro) */}
                            <div
                              className={`p-5 rounded-2xl border font-sans relative ${
                                seller.isPro
                                  ? "border-amber-400 bg-amber-500/10"
                                  : "border-dashed border-slate-200 bg-slate-50/50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="p-1 px-1.5 bg-amber-500 text-slate-950 font-black rounded text-[9px] uppercase tracking-wider">
                                    VIP DUAL
                                  </span>
                                  <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider">
                                    {lang === "sw"
                                      ? "Kusukuma Pamoja: Bidhaa za Zamani na Mpya"
                                      : "VIP Dual-Push Channel Setup"}
                                  </h4>
                                </div>
                                {seller.isPro && (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[9px] font-black tracking-widest uppercase animate-pulse">
                                    ACTIVE LIVE
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed font-semibold">
                                {lang === "sw"
                                  ? "Mkakati wa wasomi: Bidhaa zote mbili za zamani (zilizorundikana) na chapa mpya zinasukumwa kwa wateja kwa njia moja. Unaunganisha makundi yote mawili upate ukuaji wa haraka!"
                                  : "Premium dual algorithm pushes both older unsold inventory and brand-new launches concurrently behind a single subscription plan."}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: PAY TO UPGRADE & BOOST GATEWAY (5/12 width) */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Visual upgrade convincing card - themed to match application color profile */}
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-750 border border-emerald-500/20 rounded-[2rem] p-6 text-white shadow-md relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 opacity-10 select-none pointer-events-none translate-x-4 translate-y-4">
                        <Zap size={140} className="text-white fill-white" />
                      </div>
                      <div className="relative z-10 space-y-4 font-sans">
                        <h3 className="font-black text-sm uppercase tracking-wider text-amber-300 block">
                          {lang === "sw"
                            ? "SIRI YA KUUZA ZAIDI"
                            : "WHY ACTIVATE THE BOOSTER?"}
                        </h3>

                        <div className="space-y-3">
                          <div className="flex items-start gap-2.5">
                            <span className="text-amber-300 font-black text-xs select-none">
                              ✓
                            </span>
                            <p className="text-[11px] text-white/95 font-semibold leading-relaxed">
                              {lang === "sw"
                                ? "Unapata kupandishwa hadi VIP na kuonekana kila siku kwenye 'Suggested Product' list."
                                : "Automatic insertion inside the client's high-traffic 'Suggestions on Shopping Centre' feed."}
                            </p>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <span className="text-amber-300 font-black text-xs select-none">
                              ✓
                            </span>
                            <p className="text-[11px] text-white/95 font-semibold leading-relaxed">
                              {lang === "sw"
                                ? "Beji rasmi ya VIP Gold itadhibitisha duka lako na kuongeza uaminifu wa kisheria mara mbili zaidi kisaikolojia."
                                : "VIP Gold verification badge displayed prominently beside your products to double layout conversions."}
                            </p>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <span className="text-amber-300 font-black text-xs select-none">
                              ✓
                            </span>
                            <p className="text-[11px] text-white/95 font-semibold leading-relaxed">
                              {lang === "sw"
                                ? "Utafutaji na injini ya uchujaji (SEO Search) itakupa kipaumbele cha juu kwa ununuzi wa kitropiki!"
                                : "Organic search ranking override pushes your items above standard basic/free accounts."}
                            </p>
                          </div>
                        </div>

                        <div className="pt-3.5 border-t border-emerald-500/30 flex items-center justify-between text-[10px] text-emerald-100 font-bold">
                          <span>
                            {lang === "sw"
                              ? "Boresha duka hapa chini"
                              : "Process upgrade below in steps"}
                          </span>
                          <span>100% Real-time Activate</span>
                        </div>
                      </div>
                    </div>

                    {/* PAYMENT UPGRADE FORM */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-xs space-y-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-amber-50 text-amber-500 rounded-lg">
                            <Zap size={16} className="fill-amber-500" />
                          </span>
                          <h2 className="text-sm font-black uppercase text-slate-800 tracking-wider">
                            {lang === "sw"
                              ? "Lipia na Kituo cha Booster"
                              : "Checkout: Mobile Money Booster"}
                          </h2>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                          {lang === "sw"
                            ? "Jiunge na VIP GOLD kupitia M-PESA, TIGO PESA, HALOPESA kupokea maboresho papo hapo."
                            : "Extend plan or pay to unlock suggestion boosts using standard localized merchant lipa namba guides."}
                        </p>
                      </div>

                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!boosterPhone.trim() || !boosterRef.trim()) {
                            displayAlert(
                              lang === "sw"
                                ? "Jaza namba ya simu na kumbukumbu ya malipo"
                                : "Please fill in phone and reference number",
                              "error",
                            );
                            return;
                          }

                          setIsUpdatingBooster(true);
                          try {
                            const response = await fetch(
                              "/api/subscriptions/subscribe",
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  sellerId: seller.id,
                                  planId: selectedPlanId,
                                  paymentDetails: {
                                    phone: boosterPhone,
                                    reference: boosterRef,
                                  },
                                }),
                              },
                            );

                            const result = await response.json();
                            if (result.success) {
                              displayAlert(
                                lang === "sw"
                                  ? `Hongera! ${seller.name} sasa ni duka la VIP PRO GOLD hadi ${new Date(result.proUntil).toLocaleDateString()}! (TXID: ${result.transactionId})`
                                  : `Success! ${seller.name} is now upgraded to VIP PRO GOLD until ${new Date(result.proUntil).toLocaleDateString()}! (TXID: ${result.transactionId})`,
                                "success",
                              );
                              setBoosterPhone("");
                              setBoosterRef("");
                              onRefreshData();
                            } else {
                              displayAlert(
                                result.message || "Failed booster upgrade",
                                "error",
                              );
                            }
                          } catch (err: any) {
                            displayAlert(
                              err.message || "Network booster error",
                              "error",
                            );
                          } finally {
                            setIsUpdatingBooster(false);
                          }
                        }}
                        className="space-y-4"
                      >
                        {/* Step 1: Choose Subscription Plan / Upgrade pricing */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            {lang === "sw"
                              ? "1. Chagua kifurushi chako"
                              : "1. Choose Your Booster Tier"}
                          </label>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              {
                                id: "sub-gold",
                                name: "VIP GOLD PLAN",
                                price: 120000,
                                days: 365,
                                textSw:
                                  "Dhahabu: Dual-Push, Kipaumbele cha Juu",
                                textEn:
                                  "Gold Plan: Dual-Push, VIP badge, Top Rank",
                              },
                              {
                                id: "sub-silver",
                                name: "VIP SILVER BOOST",
                                price: 45000,
                                days: 90,
                                textSw:
                                  "Fedha: Mkakati wa kusukuma bidhaa kwa Siku 90",
                                textEn:
                                  "Silver Boost: Select dynamic push channel for 90 Days",
                              },
                              {
                                id: "sub-bronze",
                                name: "VIP BRONZE BOOST",
                                price: 15000,
                                days: 30,
                                textSw:
                                  "Shaba: Mkakati wa kusukuma bidhaa kwa Siku 30",
                                textEn:
                                  "Bronze Boost: Select dynamic push channel for 30 Days",
                              },
                            ].map((plan) => {
                              const isSelected = selectedPlanId === plan.id;
                              return (
                                <button
                                  type="button"
                                  key={plan.id}
                                  onClick={() => setSelectedPlanId(plan.id)}
                                  className={`p-3.5 rounded-xl border text-left flex justify-between items-center transition duration-150 outline-none cursor-pointer ${
                                    isSelected
                                      ? "border-emerald-500 bg-emerald-50/35 ring-1 ring-emerald-500/15"
                                      : "border-slate-150 hover:border-slate-200 bg-white"
                                  }`}
                                >
                                  <div>
                                    <h4 className="text-xs font-black text-slate-800 leading-tight uppercase block">
                                      {plan.name}
                                    </h4>
                                    <p className="text-[9.5px] text-slate-400 mt-0.5 leading-snug font-medium block">
                                      {lang === "sw"
                                        ? plan.textSw
                                        : plan.textEn}
                                    </p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-xs font-mono font-black text-slate-900 block">
                                      {formatCurrency(plan.price)}
                                    </p>
                                    <p className="text-[9px] text-indigo-600 font-bold block">
                                      {plan.days}{" "}
                                      {lang === "sw" ? "Siku" : "Days"}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Payment Instructions standard lipa namba */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 text-[10.5px] leading-relaxed text-slate-600 font-sans">
                          <h5 className="font-extrabold text-slate-800 uppercase text-[9px] tracking-wide block">
                            {lang === "sw"
                              ? "2. MAELEKEZO YA MALIPO (TIGO/MPESA)"
                              : "2. PAYMENT INSTRUCTIONS (TIGO/MPESA)"}
                          </h5>
                          <p className="block">
                            {lang === "sw" ? (
                              <>
                                Tuma kiasi kilichochaguliwa kwenda:
                                <br />
                                <span className="text-orange-600 font-black">
                                  LIPA NAMBA (TIGO/MPESA): 4488219
                                </span>
                                <br />
                                Jina la Mfanyabiashara:{" "}
                                <span className="font-black text-slate-800">
                                  ORBI SHOPPING SERVICE
                                </span>
                              </>
                            ) : (
                              <>
                                Please send the total selection price to our
                                merchant reference:
                                <br />
                                <span className="text-orange-600 font-black">
                                  LIPA NUMBER (TIGO/MPESA): 4488219
                                </span>
                                <br />
                                Merchant registered name:{" "}
                                <span className="font-black text-slate-800">
                                  ORBI SHOPPING SERVICE
                                </span>
                              </>
                            )}
                          </p>
                        </div>

                        {/* Phone and Reference number */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
                          <div className="space-y-1">
                            <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">
                              {lang === "sw"
                                ? "Namba Imeyo Lipa"
                                : "Payment Phone Number"}{" "}
                              *
                            </label>
                            <input
                              required
                              type="text"
                              placeholder="e.g. 0712345678"
                              className="w-full bg-slate-50 border border-slate-150 p-3 rounded-xl text-xs font-semibold font-mono leading-none"
                              value={boosterPhone}
                              onChange={(e) => setBoosterPhone(e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">
                              {lang === "sw"
                                ? "Kumbukumbuku ya M-PESA"
                                : "M-PESA / TIGO Reference"}{" "}
                              *
                            </label>
                            <input
                              required
                              type="text"
                              placeholder="e.g. RJ78HH902B"
                              className="w-full bg-slate-50 border border-slate-150 p-3 rounded-xl text-xs font-semibold font-mono leading-none uppercase"
                              value={boosterRef}
                              onChange={(e) => setBoosterRef(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Transaction Submission button */}
                        <button
                          type="submit"
                          disabled={isUpdatingBooster}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:bg-slate-300 text-white font-black text-[10px] uppercase py-3 rounded-xl cursor-pointer transition shadow flex items-center justify-center gap-1.5"
                        >
                          {isUpdatingBooster ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-1"></span>
                              {lang === "sw"
                                ? "Inapata Booster..."
                                : "Securing Booster..."}
                            </>
                          ) : (
                            <>
                              <Zap size={12} className="fill-white" />
                              {lang === "sw"
                                ? "Kamirisha Kulipia & Booster"
                                : "Complete Payment & Boost Suggested"}
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: SETTINGS (Store builder & Private Invoicing) */}
            {tab === "settings" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 leading-tight">
                    {lang === "sw"
                      ? "Mipangilio ya Invoice ya Duka"
                      : "Merchant Invoicing Console"}
                  </h1>
                  <p className="text-slate-500 text-xs font-medium mt-1">
                    {lang === "sw"
                      ? "Kamilisha mpangilio wa duka na kuweka taarifa za kibenki au nembo ya risiti kwa wateja."
                      : "Configure merchant invoice templates, branding descriptions, telephone registers, and legal terms."}
                  </p>
                </div>

                {/* Visual customizer card */}
                <div className="bg-white rounded-[2rem] border border-slate-200/60 p-6 sm:p-8 shadow-xs">
                  <StoreSettingsForm
                    seller={seller}
                    displayAlert={displayAlert}
                    onRefreshData={onRefreshData}
                    lang={lang}
                  />
                </div>
              </div>
            )}
          </div>
        </main>

        {/* MODAL: CHART (MOBILE) */}
        {chartModalOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[999999] flex flex-col justify-end p-0 md:hidden">
            <div className="bg-white w-full h-[80dvh] rounded-t-[2.5rem] shadow-2xl flex flex-col relative overflow-hidden animate-in slide-in-from-bottom duration-300">
              <div className="flex-shrink-0 p-6 flex justify-between items-center bg-white border-b border-slate-100 z-10 sticky top-0">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {lang === "sw" ? "Mtindo wa Mapato" : "Income Chart"}
                  </h3>
                  <p className="text-slate-500 text-xs font-medium mt-1">
                    {lang === "sw"
                      ? "Onyesho la mauzo kamili yaliyoidhinishwa"
                      : "Verified earnings trend"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setChartModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-2.5 rounded-full transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                <div className="flex-1 w-full min-h-[300px] font-mono mt-2">
                  <ResponsiveContainer
                    width="100%"
                    height={300}
                    minHeight={50}
                    minWidth={50}
                  >
                    <AreaChart
                      data={computedStats.chartData}
                      margin={{ top: 5, right: 0, left: -25, bottom: -5 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorSalesMobile"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#94a3b8"
                        fontSize={10}
                        tickMargin={8}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={10}
                        width={40}
                        tickFormatter={(val) =>
                          val >= 1000000
                            ? (val / 1000000).toFixed(1) + "M"
                            : val >= 1000
                              ? (val / 1000).toFixed(0) + "k"
                              : val
                        }
                      />
                      <Tooltip
                        formatter={(value) => [
                          `TZS ${Number(value).toLocaleString()}`,
                          lang === "sw" ? "Kipato" : "Income",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="Mauzo"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorSalesMobile)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PHOTO QUALITY BOOSTER GUIDE */}
        <PhotoQualityGuide
          isOpen={showQualityGuide}
          onClose={() => setShowQualityGuide(false)}
          lang={lang}
        />

        {/* MODAL: CREATE / EDIT PRODUCT */}
        {productModalOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[999999] flex items-center justify-center p-0 sm:p-4 overflow-hidden">
            <div className="bg-white w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90dvh] sm:rounded-[2.5rem] shadow-2xl border border-slate-200/80 flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-155">
              {/* Sticky Header */}
              <div className="shrink-0 border-b border-slate-100 px-6 py-5 sm:px-8 flex items-center justify-between bg-white relative">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    {editingProduct
                      ? lang === "sw"
                        ? "Hariri Bidhaa"
                        : "Edit Product Listing"
                      : lang === "sw"
                        ? "Weka Bidhaa Mpya"
                        : "Create Modern Product"}
                  </h2>
                  <p className="text-slate-500 text-xs font-semibold mt-1">
                    {lang === "sw"
                      ? "Jaza maelezo sahihi ya bidhaa kukuza mauzo yako."
                      : "Publish item specifications, customize prices, stock counts, and upload pictures."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="p-2.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={handleSaveProduct}
                className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6"
              >
                {/* Product Name & SKU */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      {lang === "sw" ? "Jina la Bidhaa" : "Product Title"}
                    </label>
                    <input
                      required
                      type="text"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      placeholder={
                        lang === "sw"
                          ? "M.g. iPhone 15 Pro Max"
                          : "e.g. iPhone 15 Pro Max"
                      }
                      className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 px-4 py-3 rounded-xl text-xs font-medium outline-none focus:border-emerald-600 focus:bg-white transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      SKU / Code{" "}
                      {lang === "sw" ? "(Kiotomatiki)" : "(Auto-Generated)"}
                    </label>
                    <div className="relative">
                      <input
                        required
                        type="text"
                        value={prodSku}
                        onChange={(e) => setProdSku(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 pl-4 pr-20 py-3 rounded-xl text-xs font-mono font-bold outline-none focus:border-emerald-600 focus:bg-white transition text-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const randNum = Math.floor(
                            100000 + Math.random() * 900000,
                          );
                          setProdSku(`ORB-${randNum}`);
                        }}
                        className="absolute right-2 top-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-[9px] uppercase tracking-wide transition cursor-pointer"
                      >
                        {lang === "sw" ? "Upya" : "Regen"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    {lang === "sw"
                      ? "Muda wa Dhamana (Warranty)"
                      : "Warranty Duration"}
                  </label>
                  <input
                    type="text"
                    value={prodWarranty}
                    onChange={(e) => setProdWarranty(e.target.value)}
                    placeholder={
                      lang === "sw"
                        ? "M.g. Miezi 12, Miaka 2 au Tupu.."
                        : "e.g. 12 Months, 2 Years or Empty.."
                    }
                    className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 px-4 py-3 rounded-xl text-xs font-medium outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                  <p className="text-[10px] text-slate-400 pl-1">
                    {lang === "sw"
                      ? "Dhamana inayoonyeshwa kwa wateja (Badge)"
                      : "Warranty badge displayed to customers"}
                  </p>
                </div>

                {/* Niche, Category & Family Segment */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/50 p-4 rounded-2xl border border-slate-200/60 shadow-inner">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      {lang === "sw" ? "Soko la Bidhaa (Niche)" : "Primary Niche"}
                    </label>
                    <select
                      value={prodNiche}
                      onChange={(e) => {
                        setProdNiche(e.target.value);
                        setProdCategory("");
                        setProdFamily("");
                      }}
                      className="w-full bg-white border border-slate-200/80 hover:border-slate-300 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:border-emerald-600 focus:bg-white transition text-slate-700"
                    >
                      {nichesList.map((n) => (
                        <option key={n.name} value={n.name}>
                          {n.name}
                        </option>
                      ))}
                      {nichesList.length === 0 && (
                        <option value="">
                          {lang === "sw"
                            ? "Tafadhali wasiliana na admin kuongeza Niche"
                            : "Contact admin to add Niches"}
                        </option>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      {lang === "sw" ? "Kundi la Bidhaa (Category)" : "Category"}
                    </label>
                    <select
                      value={prodCategory}
                      onChange={(e) => {
                        setProdCategory(e.target.value);
                        setProdFamily("");
                      }}
                      className="w-full bg-white border border-slate-200/80 hover:border-slate-300 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:border-emerald-600 focus:bg-white transition text-slate-700"
                    >
                      <option value="">{lang === "sw" ? "-- Chagua Kundi --" : "-- Select Category --"}</option>
                      {nichesList
                        .find((n) => n.name === prodNiche)
                        ?.categories?.map((cat) => (
                          <option key={cat.name} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      {lang === "sw" ? "Familia ya Bidhaa (Family)" : "Subcategory / Family"}
                    </label>
                    <select
                      value={prodFamily}
                      onChange={(e) => setProdFamily(e.target.value)}
                      className="w-full bg-white border border-slate-200/80 hover:border-slate-300 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:border-emerald-600 focus:bg-white transition text-slate-700"
                    >
                      <option value="">{lang === "sw" ? "-- Chagua Familia --" : "-- Select Family --"}</option>
                      {nichesList
                        .find((n) => n.name === prodNiche)
                        ?.categories?.find((c) => c.name === prodCategory)
                        ?.families?.map((fam) => (
                          <option key={fam} value={fam}>
                            {fam}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Arrangement Tier, Vibe, and Wrap */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      {lang === "sw"
                        ? "Kiwango cha Thamani (Tier)"
                        : "Arrangement Tier"}
                    </label>
                    <select
                      value={prodArrangeTier}
                      onChange={(e) => setProdArrangeTier(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:border-emerald-600 focus:bg-white transition text-slate-700"
                    >
                      <option value="all">
                        {lang === "sw" ? "Hakuna teuzi" : "None / Generic"}
                      </option>
                      <option value="standard">
                        {lang === "sw"
                          ? "Kawaida / Budget"
                          : "Standard Essentials"}
                      </option>
                      <option value="premium">
                        {lang === "sw"
                          ? "Kifahari / Premium"
                          : "Premium Artistry"}
                      </option>
                      <option value="luxury">
                        {lang === "sw" ? "Kifalme / Luxury" : "Royal Luxury"}
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      {lang === "sw"
                        ? "Mandhari ya Rangi (Vibe)"
                        : "Arrangement Vibe"}
                    </label>
                    <select
                      value={prodVibe}
                      onChange={(e) => setProdVibe(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:border-emerald-600 focus:bg-white transition text-slate-700"
                    >
                      <option value="all">
                        {lang === "sw" ? "Hakuna teuzi" : "None / Generic"}
                      </option>
                      <option value="romance">
                        {lang === "sw"
                          ? "🔴 Upendo (Red / Rose)"
                          : "🔴 Crimson Romance"}
                      </option>
                      <option value="serenity">
                        {lang === "sw"
                          ? "⚪ Utulivu (Pink / White)"
                          : "⚪ Pastel Serenity"}
                      </option>
                      <option value="sunshine">
                        {lang === "sw"
                          ? "🟡 Furaha (Yellow / Sun)"
                          : "🟡 Golden Sunshine"}
                      </option>
                      <option value="mystery">
                        {lang === "sw"
                          ? "🟣 Kipekee (Purple / Orchid)"
                          : "🟣 Enchanted Mystery"}
                      </option>
                      <option value="nature">
                        {lang === "sw"
                          ? "🟢 Asili (Green / Foliage)"
                          : "🟢 Lush Nature"}
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      {lang === "sw"
                        ? "Mtindo wa Ufungashaji"
                        : "Presentation Style"}
                    </label>
                    <select
                      value={prodPresentationStyle}
                      onChange={(e) => setProdPresentationStyle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:border-emerald-600 focus:bg-white transition text-slate-700"
                    >
                      <option value="all">
                        {lang === "sw" ? "Hakuna teuzi" : "None / Generic"}
                      </option>
                      <option value="box">
                        {lang === "sw" ? "📦 Boxi Maalum" : "📦 Premium Box"}
                      </option>
                      <option value="wrap">
                        {lang === "sw"
                          ? "🎀 Kanga/Karatasi"
                          : "🎀 Classic Wrap"}
                      </option>
                      <option value="glass">
                        {lang === "sw" ? "🏺 Chombo cha Kioo" : "🏺 Glass Vase"}
                      </option>
                      <option value="basket">
                        {lang === "sw" ? "🧺 Kikapu" : "🧺 Rustic Basket"}
                      </option>
                    </select>
                  </div>
                </div>

                {/* Pricing Mode Selection Box */}
                <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        {lang === "sw" ? "Aina ya Bei" : "Pricing Model / Type"}
                      </label>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {lang === "sw"
                          ? "Chagua uuzaji wa Reja-reja au wa Jumla (Wholesale)"
                          : "Select regular retail or wholesale with discount tiers"}
                      </p>
                    </div>
                    <select
                      value={prodPricingMode}
                      onChange={(e) => {
                        const mode = e.target.value as "retail" | "wholesale";
                        setProdPricingMode(mode);
                        if (
                          mode === "wholesale" &&
                          prodWholesaleTiers.length === 0
                        ) {
                          setProdWholesaleTiers([
                            { minQty: 1, price: parseFloat(prodPrice) || 0 },
                          ]);
                        }
                      }}
                      className="bg-white border border-slate-200/80 px-4 py-2 rounded-xl text-xs font-bold shrink-0 outline-none focus:border-emerald-600 transition text-slate-800"
                    >
                      <option value="retail">
                        {lang === "sw"
                          ? "Retail (Bei Kawaida)"
                          : "Retail (Single price)"}
                      </option>
                      <option value="wholesale">
                        {lang === "sw"
                          ? "Whole Sale (Bei za Jumla)"
                          : "Whole Sale (Tiered pricing)"}
                      </option>
                    </select>
                  </div>

                  {prodPricingMode === "wholesale" && (
                    <div className="space-y-3.5 pt-3 border-t border-slate-200/80">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                          {lang === "sw"
                            ? "Vigezo vya Bei za Jumla (Wholesale Prices per Quantity)"
                            : "Wholesale Pricing Tiers"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const lastQty =
                              prodWholesaleTiers.length > 0
                                ? prodWholesaleTiers[
                                    prodWholesaleTiers.length - 1
                                  ].minQty
                                : 1;
                            const lastPrice =
                              prodWholesaleTiers.length > 0
                                ? prodWholesaleTiers[
                                    prodWholesaleTiers.length - 1
                                  ].price
                                : parseFloat(prodPrice) || 0;
                            setProdWholesaleTiers([
                              ...prodWholesaleTiers,
                              {
                                minQty: lastQty + 5,
                                price: Math.max(0, Math.round(lastPrice * 0.9)),
                              },
                            ]);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider transition cursor-pointer"
                        >
                          {lang === "sw"
                            ? "+ Ongeza Vigezo"
                            : "+ Add Quantity Tier"}
                        </button>
                      </div>

                      <div className="space-y-2">
                        {prodWholesaleTiers.map((tier, idx) => (
                          <div
                            key={`wholesale-tier-${idx}`}
                            className="flex items-center gap-3 bg-white p-3 border border-slate-200/60 rounded-xl animate-in fade-in duration-100"
                          >
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                                  {lang === "sw"
                                    ? "Kuanzia Idadi (Min Qty)"
                                    : "Min Quantity"}
                                </label>
                                <input
                                  required
                                  type="number"
                                  min="1"
                                  value={tier.minQty}
                                  onChange={(e) => {
                                    const updated = [...prodWholesaleTiers];
                                    updated[idx].minQty =
                                      parseInt(e.target.value) || 1;
                                    setProdWholesaleTiers(updated);
                                  }}
                                  className="w-full bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-lg text-xs font-bold outline-none text-slate-700"
                                  placeholder="e.g. 5"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                                  {lang === "sw"
                                    ? "Bei ya kila kimoja (Price per Qty)"
                                    : "Price per Unit (TZS)"}
                                </label>
                                <input
                                  required
                                  type="number"
                                  min="0"
                                  value={tier.price}
                                  onChange={(e) => {
                                    const updated = [...prodWholesaleTiers];
                                    updated[idx].price =
                                      parseFloat(e.target.value) || 0;
                                    setProdWholesaleTiers(updated);
                                  }}
                                  className="w-full bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-lg text-xs font-bold outline-none text-emerald-600"
                                  placeholder="e.g. 120000"
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setProdWholesaleTiers(
                                  prodWholesaleTiers.filter(
                                    (_, i) => i !== idx,
                                  ),
                                );
                              }}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition shrink-0 cursor-pointer"
                              title={
                                lang === "sw" ? "Futa vigezo" : "Delete tier"
                              }
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}

                        {prodWholesaleTiers.length === 0 && (
                          <p className="text-[10px] text-slate-400 text-center py-2 italic font-semibold">
                            {lang === "sw"
                              ? "Bofya kitufe cha juu kuongeza vigezo vya mauzo ya jumla k.m. 'Nunua kuanzia 5 kila kimoja TZS 120,000'"
                              : "Click add button to start configuring your wholesale price metrics."}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Price, OldPrice & Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      {lang === "sw"
                        ? "Bei Halisi (TZS)"
                        : "Selling Price (TZS)"}
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      placeholder="e.g. 150000"
                      className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:border-emerald-600 focus:bg-white transition text-emerald-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      {lang === "sw"
                        ? "Bei ya Zamani (TZS)"
                        : "Compare Old Price (TZS)"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={prodOldPrice}
                      onChange={(e) => setProdOldPrice(e.target.value)}
                      placeholder="e.g. 180000"
                      className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 px-4 py-3 rounded-xl text-xs font-medium outline-none focus:border-emerald-600 focus:bg-white transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      {lang === "sw" ? "Stoki / Akiba" : "Stock Quantity"}
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                      placeholder="e.g. 20"
                      className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:border-emerald-600 focus:bg-white transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                      <ShieldCheck size={11} className="text-emerald-500" />
                      {lang === "sw" ? "Kodi ya TRA" : "TRA Tax Code"}
                    </label>
                    <select
                      value={prodTaxCode}
                      onChange={(e) => setProdTaxCode(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:border-emerald-600 focus:bg-white transition"
                    >
                      <option value={1}>
                        {lang === "sw"
                          ? "A - VAT Kawaida (18%)"
                          : "A - Standard VAT (18%)"}
                      </option>
                      <option value={2}>
                        {lang === "sw"
                          ? "B - Maalum (Special Rate)"
                          : "B - Special Rate"}
                      </option>
                      <option value={3}>
                        {lang === "sw"
                          ? "C - Kodi Sifuri / Zero (0%)"
                          : "C - Zero-rated (0%)"}
                      </option>
                      <option value={4}>
                        {lang === "sw"
                          ? "D - Ahueni (Tax Relief)"
                          : "D - Tax Relief"}
                      </option>
                      <option value={5}>
                        {lang === "sw"
                          ? "E - Isiyo na Kodi (Exempted)"
                          : "E - Exempted"}
                      </option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      {lang === "sw"
                        ? "Maelezo ya Bidhaa"
                        : "Product Narrative Description"}
                    </label>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!prodName) {
                          alert(
                            lang === "sw"
                              ? "Tafadhali weka jina kwanza."
                              : "Please fill Name first.",
                          );
                          return;
                        }
                        setIsGeneratingDesc(true);
                        try {
                          const res = await fetch(
                            "/api/ai/generate-description",
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                name: prodName,
                                niche: prodNiche,
                                category: prodCategory,
                                features: prodFeatures,
                              }),
                            },
                          );
                          const data = await res.json();
                          if (data.description) {
                            setProdDescription(data.description);
                          } else {
                            alert(data.error || "Failed");
                          }
                        } catch (e: any) {
                          alert("Error generating description: " + e.message);
                        } finally {
                          setIsGeneratingDesc(false);
                        }
                      }}
                      disabled={isGeneratingDesc}
                      className="inline-flex items-center gap-1.5 text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-2 py-1 rounded-lg border border-slate-200 transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <Bot
                        size={11}
                        className={
                          isGeneratingDesc
                            ? "animate-pulse fill-emerald-500 text-emerald-500"
                            : "fill-slate-800"
                        }
                      />
                      {isGeneratingDesc
                        ? lang === "sw"
                          ? "Inatunga..."
                          : "Generating..."
                        : lang === "sw"
                          ? "Tunga na AI Msaidizi"
                          : "Generate via AI"}
                    </button>
                  </div>
                  <textarea
                    required
                    rows={4}
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    placeholder={
                      lang === "sw"
                        ? "Andika hapa maelezo ya kina ya bidhaa hii..."
                        : "Explain detailed technical specs, warranty conditions, sizes or colors available..."
                    }
                    className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 p-4 rounded-xl text-xs font-medium outline-none focus:border-emerald-600 focus:bg-white resize-none transition whitespace-pre-wrap"
                  />
                </div>

                {/* Features List */}
                <div className="space-y-2 border border-slate-200/60 bg-slate-50 p-4 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      {lang === "sw"
                        ? "Sifa Maalum (Vipimo, Rangi, N.k)"
                        : "Product Features"}
                    </label>
                    <div className="flex items-center gap-1.5 font-bold">
                      <button
                        type="button"
                        onClick={() => setShowFeatureImport(!showFeatureImport)}
                        className={`flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-lg border shadow-sm transition cursor-pointer ${
                          showFeatureImport
                            ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                            : "bg-white border-slate-200 text-slate-705 hover:bg-slate-50"
                        }`}
                      >
                        <FileText
                          size={11}
                          className={
                            showFeatureImport
                              ? "text-emerald-400"
                              : "text-slate-500"
                          }
                        />
                        {lang === "sw" ? "Kuingiza kwa Mkupuo" : "Bulk Import"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setProdFeatures([
                            ...prodFeatures,
                            { name: "", description: "" },
                          ])
                        }
                        className="flex items-center gap-1 text-[9px] font-bold bg-white border border-slate-200 shadow-sm px-2 py-1 rounded-lg hover:bg-slate-50 text-emerald-600 transition cursor-pointer"
                      >
                        <Plus size={11} />{" "}
                        {lang === "sw" ? "Ongeza Sifa" : "Add Feature"}
                      </button>
                    </div>
                  </div>

                  {showFeatureImport && (
                    <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-3 shadow-xs animate-in slide-in-from-top-1 duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                          <FileText size={12} className="text-emerald-600" />
                          {lang === "sw"
                            ? "Import Sifa Maalum"
                            : "Import Specifications Options"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const sampleText =
                                lang === "sw"
                                  ? "Total Capacity: Litra 265 (takribani friji 198L–201L na freezer 63L–67L).\nDimensions: Takribani 1700 x 550 x 600 mm (Urefu x Upana x Kwenda Ndani).\nCooling System: Teknolojia ya No Frost inayozuia barafu kujitengeneza.\nNoise Level: Hutumia sauti ya db 38 hivi inayomfanya asipige kelele."
                                  : "Total Capacity: 265 Liters (approx. 198L–201L for the fridge and 63L–67L for the freezer).\nDimensions: Approximately 1700 x 550 x 600 mm (H x W x D).\nCooling System: No Frost technology, which prevents ice buildup and eliminates the need for manual defrosting.\nNoise Level: Operates at a typical noise level of 38 dB, ensuring a quiet kitchen environment.";
                              setFeatureImportText(sampleText);
                            }}
                            className="text-[9px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 px-2 py-0.5 rounded-md cursor-pointer"
                          >
                            {lang === "sw" ? "Pakia Mfano" : "Load Sample"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowFeatureImport(false)}
                            className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>

                      <p className="text-[10px] leading-relaxed text-slate-400">
                        {lang === "sw"
                          ? "Andika sifa zako au pakia faili la maandishi (.txt). Mfumo utazigawanya zenyewe kwa kutambua alama za : au = kwa kila mstari."
                          : "Enter specifications or pick a text file. The system will auto-split lines using : or =."}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-1 flex flex-col items-center justify-center border border-dashed border-slate-200 hover:border-emerald-400 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 transition relative cursor-pointer group">
                          <input
                            type="file"
                            accept=".txt,text/plain"
                            value=""
                            onChange={handleFeatureFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          />
                          <div className="text-center space-y-1">
                            <div className="flex justify-center">
                              <span className="p-1.5 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition text-emerald-600">
                                <FileText size={16} />
                              </span>
                            </div>
                            <span className="block text-[10px] font-bold text-slate-700">
                              {lang === "sw"
                                ? "Chagua Faili (.txt)"
                                : "Choose Text File"}
                            </span>
                            <span className="block text-[8px] text-slate-400 font-medium font-mono uppercase">
                              Plain text
                            </span>
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <textarea
                            value={featureImportText}
                            onChange={(e) =>
                              setFeatureImportText(e.target.value)
                            }
                            rows={4}
                            placeholder={
                              lang === "sw"
                                ? "Mfano:\nDimensions: 1700x550x600 mm\nVoltage: 220V AC\nGuarantor = Miaka 2..."
                                : "Write or paste specifications here...\nE.g.\nTotal Capacity: 265 Liters\nNoise Level = 38 dB..."
                            }
                            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 p-2 text-[11px] font-mono leading-relaxed rounded-xl outline-none focus:border-emerald-500 focus:bg-white resize-none"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                          <label htmlFor="feature-import-append" className="inline-flex items-center gap-1.5 cursor-pointer">
                            <input
                              id="feature-import-append"
                              type="radio"
                              name="featureImportMode"
                              checked={featureImportMode === "append"}
                              onChange={() => setFeatureImportMode("append")}
                              className="accent-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 border-slate-300 cursor-pointer"
                            />
                            <span className="text-[10px] font-semibold text-slate-500">
                              {lang === "sw"
                                ? "Ongeza kwenye zilizopo (Append)"
                                : "Append to list"}
                            </span>
                          </label>
                          <label htmlFor="feature-import-replace" className="inline-flex items-center gap-1.5 cursor-pointer">
                            <input
                              id="feature-import-replace"
                              type="radio"
                              name="featureImportMode"
                              checked={featureImportMode === "replace"}
                              onChange={() => setFeatureImportMode("replace")}
                              className="accent-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 border-slate-300 cursor-pointer"
                            />
                            <span className="text-[10px] font-semibold text-slate-500">
                              {lang === "sw"
                                ? "Badilisha zilizopo zote (Replace)"
                                : "Replace existing"}
                            </span>
                          </label>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setFeatureImportText("");
                            }}
                            disabled={!featureImportText}
                            className="px-2.5 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 disabled:opacity-40 cursor-pointer"
                          >
                            {lang === "sw" ? "Futa Maandishi" : "Clear"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleImportFeaturesAction(featureImportText)
                            }
                            disabled={!featureImportText.trim()}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg shadow-sm hover:shadow-md transition active:scale-95 flex items-center gap-1 cursor-pointer"
                          >
                            <Check size={11} />
                            {lang === "sw"
                              ? "Kamilisha Import"
                              : "Import Specifications"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {prodFeatures.length === 0 && (
                    <p className="text-[10px] text-slate-400 font-medium italic">
                      {lang === "sw"
                        ? "Hakuna sifa zilizowekwa. Mf. Voltage: 220V."
                        : "No features added yet. E.g. Voltage: 220V"}
                    </p>
                  )}

                  <div className="space-y-2">
                    {prodFeatures.map((f, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            placeholder={
                              lang === "sw"
                                ? "Jina la Sifa (Mf. Voltage)"
                                : "Feature Name (E.g. Voltage)"
                            }
                            value={f.name}
                            onChange={(e) => {
                              const updated = [...prodFeatures];
                              updated[i].name = e.target.value;
                              setProdFeatures(updated);
                            }}
                            className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs font-bold focus:border-emerald-500 outline-none"
                          />
                        </div>
                        <div className="flex-[2] space-y-1">
                          <input
                            type="text"
                            placeholder={
                              lang === "sw"
                                ? "Maelezo (Mf. 220V AC)"
                                : "Description (E.g. 220V AC)"
                            }
                            value={f.description}
                            onChange={(e) => {
                              const updated = [...prodFeatures];
                              updated[i].description = e.target.value;
                              setProdFeatures(updated);
                            }}
                            className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs font-medium focus:border-emerald-500 outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setProdFeatures(
                              prodFeatures.filter((_, idx) => idx !== i),
                            )
                          }
                          className="p-2 text-slate-400 hover:text-rose-500 bg-white border border-slate-200 rounded-lg hover:bg-rose-50 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Images Config */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        {lang === "sw"
                          ? "Pakia Picha za Bidhaa / Picha za Duka"
                          : "Upload Product Images / Catalog Photos"}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowQualityGuide(true)}
                        className="inline-flex items-center gap-1.5 text-[9px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-lg border border-emerald-150 transition shadow-xs cursor-pointer active:scale-95 shrink-0"
                      >
                        <Sparkles
                          size={11}
                          className="text-amber-500 fill-amber-500"
                        />
                        {lang === "sw"
                          ? "Mwongozo wa Ubora"
                          : "Photo Quality Guide"}
                      </button>
                    </div>

                    {/* Drag and Drop File Input Area */}
                    <div
                      className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                        isDragActive
                          ? "border-emerald-600 bg-emerald-50/40"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-50/90"
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragActive(true);
                      }}
                      onDragLeave={() => setIsDragActive(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragActive(false);
                        if (e.dataTransfer.files) {
                          handleImageFiles(Array.from(e.dataTransfer.files));
                        }
                      }}
                    >
                      <div className="absolute inset-0">
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={handleImageUpload}
                          disabled={prodImages.length >= 5 || isUploading}
                          className="w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                          title={
                            lang === "sw" ? "Pakia picha" : "Upload images"
                          }
                        />
                      </div>
                      <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                        <ImageIcon
                          className={`w-8 h-8 transition-colors ${
                            isDragActive ? "text-emerald-600" : "text-slate-400"
                          }`}
                        />
                        <div className="px-4">
                          <p className="text-xs font-bold text-slate-700">
                            {lang === "sw"
                              ? "Kokota picha/video hapa au bofya kuteua"
                              : "Drag product files here or click to choose"}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {lang === "sw"
                              ? "Unaweza kuweka hadi picha 5"
                              : "You can upload up to 5 files"}
                          </p>
                          <div className="mt-2.5 max-w-md mx-auto p-2 bg-emerald-50/85 border border-emerald-100/60 rounded-lg text-[10px] text-emerald-900 leading-relaxed font-semibold text-left">
                            ⚠️{" "}
                            <strong>
                              {lang === "sw"
                                ? "Angalizo la Ubora:"
                                : "Quality Notice:"}
                            </strong>{" "}
                            {lang === "sw"
                              ? "Tafadhali weka picha zenye kiwango cha juu cha ubora zilizohaririwa (high quality edited) zenye mandhari meupe au safi ya uwazi (white or transparent), zisizo na ukungu au blur effects. Mfumo utafuta na kusitisha picha zenye ubora duni kiotomatiki."
                              : "Please upload high quality, edited product photos with clean white or transparent backgrounds and no blur effects. Low quality files will be auto-cancelled by our system automatically."}
                            <br />
                            <br />
                            🔒{" "}
                            <strong>
                              {lang === "sw"
                                ? "Kikomo cha Faili:"
                                : "File Limits:"}
                            </strong>{" "}
                            {lang === "sw"
                              ? "Ukubwa usizidi 45MB. Picha zako zitabadilishwa na kubanwa kiotomatiki kuwa muundo wa kisasa wa kadi ya picha ya wavuti (WebP Web Image/Bitmap) ili kulinda nafasi ya hifadhi."
                              : "Maximum size is 45MB. Uploaded photos are auto-optimized and converted to WebP bitmap format to save store catalog hosting storage."}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Loader */}
                    {isUploading && uploadingFiles.length > 0 && (
                      <div className="space-y-1.5 p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl">
                        <p className="text-[10px] font-black uppercase text-indigo-950 flex items-center justify-between">
                          <span>
                            {lang === "sw"
                              ? "Inapakia..."
                              : "Uploading Files..."}
                          </span>
                          <span className="animate-pulse">
                            {lang === "sw" ? "Tafadhali subiri" : "Please wait"}
                          </span>
                        </p>
                        {uploadingFiles.map((f) => (
                          <div
                            key={f.id}
                            className="text-[10px] flex items-center justify-between gap-3 font-mono"
                          >
                            <span className="truncate text-slate-600 max-w-[150px]">
                              {f.name}
                            </span>
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 transition-all duration-300"
                                style={{ width: `${f.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-indigo-950 font-bold">
                              {f.progress}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      {lang === "sw"
                        ? "Au Weka Viungo vya Picha (Image URLs)"
                        : "Or Direct Image Links (URLs)"}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="ip-new-image-url"
                        placeholder="https://images.unsplash.com/... or raw image URL"
                        className="flex-1 bg-slate-50 border border-slate-200/80 hover:border-slate-300 px-4 py-3 rounded-xl text-xs font-medium outline-none focus:border-emerald-600 focus:bg-white transition"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const val = (
                              e.currentTarget as HTMLInputElement
                            ).value.trim();
                            if (val) {
                              setProdImages((prev) => {
                                const filtered = prev.filter(
                                  (p) =>
                                    !p.includes(
                                      "photo-1546868871-7041f2a55e12",
                                    ),
                                );
                                return [...filtered, val];
                              });
                              (e.currentTarget as HTMLInputElement).value = "";
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById(
                            "ip-new-image-url",
                          ) as HTMLInputElement;
                          if (el && el.value.trim()) {
                            setProdImages((prev) => {
                              const filtered = prev.filter(
                                (p) =>
                                  !p.includes("photo-1546868871-7041f2a55e12"),
                              );
                              return [...filtered, el.value.trim()];
                            });
                            el.value = "";
                          }
                        }}
                        className="bg-slate-900 text-white font-black text-[10px] uppercase px-4 py-3 rounded-xl cursor-pointer hover:bg-slate-800 transition active:scale-[0.98]"
                      >
                        {lang === "sw" ? "Weka" : "Add"}
                      </button>
                    </div>
                  </div>

                  {prodImages.filter(
                    (p) => !p.includes("photo-1546868871-7041f2a55e12"),
                  ).length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                      {prodImages
                        .filter(
                          (p) => !p.includes("photo-1546868871-7041f2a55e12"),
                        )
                        .map((img, idx) => (
                          <div
                            key={idx}
                            className="group relative aspect-square rounded-xl bg-slate-100 border border-slate-200 overflow-hidden"
                          >
                            <img
                              src={img}
                              alt="Product upload preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setProdImages(
                                  prodImages.filter((_, i) => i !== idx),
                                );
                              }}
                              className="absolute inset-0 bg-rose-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150 rounded-xl"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}

                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                    {lang === "sw"
                      ? "* Picha ya kwanza ndiyo itakayotumika kama jalada kuu la bidhaa."
                      : "* The first image listed behaves as the primary display cover photo."}
                  </p>
                </div>

                {/* Visible Toggle */}
                <div className="flex items-center justify-between bg-slate-50 p-4.5 rounded-xl border border-slate-200/40">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="block text-xs font-black text-slate-800">
                        {lang === "sw"
                          ? "Chapisha Bidhaa Mubashara"
                          : "Publish Listing Live"}
                      </span>
                      {parseInt(prodStock || "0") < 5 && (
                        <span className="bg-rose-100 text-rose-700 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md">
                          {lang === "sw" ? "Stock Chini" : "Low Stock"}
                        </span>
                      )}
                    </div>
                    <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                      {lang === "sw"
                        ? "Bidhaa hii itaonekana mara moja kwa wanunuzi wote."
                        : "Visible instantly to all customers shopping on Orbishop."}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProdVisible(!prodVisible)}
                    className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${prodVisible ? "bg-emerald-600" : "bg-slate-300"}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${prodVisible ? "translate-x-6" : "translate-x-0"}`}
                    ></div>
                  </button>
                </div>

                {/* Direct Action buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="px-4 py-3 sm:px-5 sm:py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center min-w-[3rem]"
                  >
                    <span className="hidden sm:inline">
                      {lang === "sw" ? "Ghairi" : "Cancel"}
                    </span>
                    <span className="sm:hidden">
                      <X size={16} />
                    </span>
                  </button>
                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs uppercase px-5 py-3 sm:px-7 sm:py-3 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    {savingProduct ? (
                      <RefreshCw className="animate-spin" size={13} />
                    ) : (
                      <Check size={16} className="sm:hidden" />
                    )}
                    <span className="hidden sm:inline">
                      {savingProduct
                        ? lang === "sw"
                          ? "Inahifadhi..."
                          : "Saving listing..."
                        : lang === "sw"
                          ? "Hifadhi Mabadiliko"
                          : "Save and Publish"}
                    </span>
                    <span className="sm:hidden">
                      {savingProduct
                        ? lang === "sw"
                          ? "Inahifadhi"
                          : "Saving"
                        : lang === "sw"
                          ? "Hifadhi"
                          : "Save"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* SUBCOMPONENT: AI Merchant Co-pilot */
function AICopilotWidget({
  lang,
  seller,
  sellerProducts,
}: {
  lang: "sw" | "en";
  seller: SellerProfile;
  sellerProducts: Product[];
}) {
  const [customerMessage, setCustomerMessage] = useState("");
  const [customInstruction, setCustomInstruction] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFetchAiSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerMessage.trim()) return;

    setLoading(true);
    setSuggestion("");
    try {
      const dbProdsCtx = sellerProducts
        .map(
          (p) =>
            `Name: ${p.name}, category: ${p.category}, price: TSh ${p.price}`,
        )
        .join("\n");
      const resp = await fetch("/api/ai/copilot-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerMessage,
          customInstruction: `Draft a response specifically representing the store seller: ${seller.name}. Ensure it speaks directly about our products: ${dbProdsCtx || "No products initialized yet"}. ${customInstruction}`,
        }),
      });

      const data = await resp.json();
      if (data.success) {
        setSuggestion(data.suggestion);
      } else {
        setSuggestion(
          "Inashindwa kukamilisha ushauri hivi sasa. (Failed to gather helper from Gemini service proxy API)",
        );
      }
    } catch (err: any) {
      setSuggestion(
        "Hitilafu ya mtandao wakati wa mawasiliano na AI. (Network communication issue)",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 lg:max-w-4xl animate-in fade-in duration-200">
      <div className="bg-linear-to-r from-orange-500/10 to-amber-500/10 border border-orange-200/60 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center gap-5">
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md">
          <Sparkles size={24} className="animate-pulse" />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
            {lang === "sw"
              ? "Orbi Merchant AI Co-Pilot"
              : "Orbi Merchant AI Co-Pilot"}
          </h3>
          <p className="text-slate-600 text-xs font-medium mt-1 leading-relaxed">
            {lang === "sw"
              ? "Uza zaidi, andika matangazo, na ujibu wateja haraka kwa msaada wa akili mnemba ya Google Gemini. AI hii inajua katalogi yako kikamilifu!"
              : "Increase sales, generate gorgeous product listings, optimize marketing lines, and respond to buyer inquiries instantly using official server-side Google Gemini models!"}
          </p>
        </div>
      </div>

      {/* Main core chat form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <form
          onSubmit={handleFetchAiSuggestion}
          className="bg-white p-6 sm:p-7 rounded-[2rem] border border-slate-200/60 shadow-xs flex flex-col justify-between space-y-4"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                {lang === "sw"
                  ? "Andika Swali la Mteja au Lengo ya Tangazo"
                  : "Customer inquiry/Prompt theme"}
              </label>
              <textarea
                required
                rows={3}
                placeholder={
                  lang === "sw"
                    ? "Mteja anauliza kama tuna ofa... au nisaidie kuandika maelezo ya kuvutia kwa bidhaa zangu..."
                    : "e.g. Help me draft a professional Swahili description for my newly listed phone..."
                }
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 p-4 rounded-2xl text-xs font-medium outline-none focus:border-amber-500 focus:bg-white resize-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                {lang === "sw"
                  ? "Maelekezo ya ziada ya Mtindo (Sauti / Lugha)"
                  : "Additional tone instructions (Optional)"}
              </label>
              <input
                type="text"
                placeholder={
                  lang === "sw"
                    ? "Andika kwa lugha ya kirafiki sana / andika kwa Kiingereza na Swahili zote..."
                    : "e.g. Write in a luxury, elegant mood with emoji accents, purely in Swahili"
                }
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 px-4 py-3.5 rounded-2xl text-xs font-medium outline-none focus:border-amber-500 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 border border-slate-900 text-white font-black text-xs uppercase py-3.5 rounded-2xl shadow-md cursor-pointer hover:bg-slate-800 transition active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw
                  className="animate-spin text-white shrink-0"
                  size={14}
                />
                <span>
                  {lang === "sw"
                    ? "Akili ya AI Inatafakari..."
                    : "AI Engine brainstorming..."}
                </span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>
                  {lang === "sw"
                    ? "Tengeneza Maelezo kwa AI"
                    : "Generate AI response"}
                </span>
              </>
            )}
          </button>
        </form>

        {/* Suggestion block */}
        <div className="bg-slate-900 text-slate-100 p-6 sm:p-7 rounded-[2rem] border border-slate-800 shadow-xl flex flex-col">
          <div className="pb-3 border-b border-white/5 flex items-center justify-between text-[10px] font-black tracking-widest uppercase text-amber-400">
            <span>
              {lang === "sw"
                ? "MAPENDEKEZO YA CO-PILOT"
                : "CO-PILOT OPTIMIZATION"}
            </span>
            <Sparkles size={14} className="text-amber-400" />
          </div>

          <div className="flex-1 mt-4 overflow-y-auto text-xs leading-relaxed font-semibold max-h-[250px] md:max-h-none scrollbar-none">
            {loading ? (
              <div className="space-y-3.5 animate-pulse">
                <div className="h-4 bg-white/10 rounded-sm w-3/4"></div>
                <div className="h-4 bg-white/10 rounded-sm w-5/6"></div>
                <div className="h-4 bg-white/10 rounded-sm w-2/3"></div>
                <div className="h-4 bg-white/10 rounded-sm w-4/5"></div>
              </div>
            ) : suggestion ? (
              <div className="whitespace-pre-line text-slate-300 text-[11px] leading-relaxed select-text tracking-wide bg-white/5 p-4 rounded-2xl border border-white/5">
                {suggestion}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12 space-y-2">
                <p>
                  {lang === "sw"
                    ? "Andika swali lako kushoto kisha bonyeza kupata maoni bora."
                    : "Type your query on the left pane and generate drafts backed directly by our product inventories."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* SUBCOMPONENT: Store Settings Invoice customizer Form */
function StoreSettingsForm({
  seller,
  displayAlert,
  onRefreshData,
  lang,
}: {
  seller: SellerProfile;
  displayAlert: any;
  onRefreshData: any;
  lang: "sw" | "en";
}) {
  const [bName, setBName] = useState(seller.name || "");
  const [bDesc, setBDesc] = useState(seller.description || "");
  const [avatar, setAvatar] = useState(seller.avatar || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [invCompany, setInvCompany] = useState(seller.invoiceCompanyName || "");
  const [invAddress, setInvAddress] = useState(seller.invoiceAddress || "");
  const [invPhone, setInvPhone] = useState(seller.invoicePhone || "");
  const [invEmail, setInvEmail] = useState(seller.invoiceEmail || "");
  const [invTerms, setInvTerms] = useState(seller.invoiceTerms || "");
  const [tin, setTin] = useState(seller.tin || "");
  const [saving, setSaving] = useState(false);
  const [autoTaxSales, setAutoTaxSales] = useState(false);
  const [subTab, setSubTab] = useState<"profile" | "invoice" | "tax">(
    "profile",
  );

  React.useEffect(() => {
    async function loadTra() {
      try {
        const config = await db.getTraConfig();
        if (config) {
          setAutoTaxSales(!!config.autoTaxSales);
        }
      } catch (err) {
        console.warn(
          "Failed to load TRA configuration on seller setting:",
          err,
        );
      }
    }
    loadTra();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadFileToSupabase(
        e.target.files[0],
        "messages",
        () => {},
      );
      setAvatar(url);
      displayAlert(
        lang === "sw"
          ? "Picha ya wasifu imepakiwa!"
          : "Profile avatar uploaded successfully!",
        "success",
      );
    } catch (err: any) {
      displayAlert(
        lang === "sw"
          ? "Imeshindwa kupakia picha: " + err.message
          : "Failed to upload avatar: " + err.message,
        "error",
      );
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Direct PostgreSQL or fallback upsert via supabase interface
      await db.updateSellerProfile(seller.id, {
        name: bName,
        description: bDesc,
        invoice_company_name: invCompany,
        invoice_address: invAddress,
        invoice_phone: invPhone,
        invoice_email: invEmail,
        invoice_terms: invTerms,
        tin: tin,
        avatar: avatar,
      });

      // Update Auto TAX settings for TRA too
      await db.saveTraConfig({ autoTaxSales, tin: tin });

      displayAlert(
        lang === "sw"
          ? "Mipangilio ya duka imehifadhiwa kikamilifu!"
          : "Store and Invoicing configurations saved successfully on cloud!",
        "success",
      );
      onRefreshData();
    } catch (err: any) {
      displayAlert(err.message || "Failed to update seller settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const subTabs = [
    {
      id: "profile",
      label: lang === "sw" ? "Wasifu & Brand" : "Profile & Brand",
      icon: Store,
    },
    {
      id: "invoice",
      label: lang === "sw" ? "Taarifa za Invoice" : "Invoice Template",
      icon: FileText,
    },
    {
      id: "tax",
      label: lang === "sw" ? "Kodi na TRA" : "Tax & TRA",
      icon: ShieldCheck,
    },
  ];

  return (
    <form onSubmit={handleUpdateStore} className="space-y-6">
      {/* Category Pill Navigation */}
      <div className="flex border-b border-slate-100 pb-3 gap-2 overflow-x-auto scrollbar-none">
        {subTabs.map((tabItem) => {
          const Icon = tabItem.icon;
          const active = subTab === tabItem.id;
          return (
            <button
              key={tabItem.id}
              type="button"
              onClick={() => setSubTab(tabItem.id as any)}
              className={`p-3 px-4 rounded-2xl transition flex items-center gap-2.5 text-xs font-bold shrink-0 cursor-pointer ${
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600"
              }`}
            >
              <Icon
                size={14}
                className={active ? "text-emerald-400" : "text-slate-500"}
              />
              <span>{tabItem.label}</span>
            </button>
          );
        })}
      </div>

      {/* Category Contents display */}
      <div className="min-h-[200px] text-left">
        {subTab === "profile" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest pb-1.5 border-b border-slate-100">
                {lang === "sw"
                  ? "TAARIFA ZA MIKOBA NA BRAND"
                  : "STORE BRANDING PROFILE"}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {lang === "sw"
                  ? "Weka taarifa za jina na chapa ya biashara yako inayowasilishwa kwa wateja."
                  : "Update your store brand name and service pitch details displayed on catalogs."}
              </p>
            </div>

            {/* Seller Avatar / Brand Logo Upload */}
            <div className="flex flex-col sm:flex-row gap-5 items-center p-4 bg-slate-50 border border-slate-200/60 rounded-2xl">
              <div className="relative w-16 h-16 rounded-full bg-white border border-slate-200/80 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Profile avatar"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-slate-300 flex items-center justify-center">
                    <Store size={22} />
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] font-black text-white uppercase tracking-widest">
                    ...
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  {lang === "sw"
                    ? "Picha ya Wasifu (Store Avatar / Logo)"
                    : "Store Profile Avatar / Logo"}
                </label>
                <div className="flex gap-2 items-center justify-center sm:justify-start">
                  <label className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold text-[10px] px-3.5 py-2 rounded-xl cursor-pointer transition select-none flex items-center gap-1.5 shadow-sm">
                    <Camera size={12} className="text-emerald-400" />
                    <span>
                      {uploadingAvatar
                        ? lang === "sw"
                          ? "Inapakia..."
                          : "Uploading..."
                        : lang === "sw"
                          ? "Badilisha Picha"
                          : "Upload Picture"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                  </label>
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar("")}
                      className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-bold text-[10px] px-3.5 py-2 rounded-xl transition cursor-pointer"
                    >
                      {lang === "sw" ? "Ondoa" : "Remove"}
                    </button>
                  )}
                </div>
                <p className="text-[9px] text-slate-400 leading-snug">
                  {lang === "sw"
                    ? "Inapendekezwa kutumia picha ya chapa yako au nembo duara, itaonekana kwenye wasifu wa ukurasa wa bidhaa na duka la mteja."
                    : "Recommended as a circular brand insignia or profile picture. Renders on products and unified storefront views."}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                {lang === "sw"
                  ? "Jina la Duka / Outlet"
                  : "Storefront Outlet Name"}
              </label>
              <input
                required
                type="text"
                value={bName}
                onChange={(e) => setBName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 p-3.5 rounded-2xl text-xs font-semibold outline-none focus:border-slate-900 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                {lang === "sw"
                  ? "Maelezo ya Biashara"
                  : "Business Pitch & Details"}
              </label>
              <textarea
                rows={4}
                value={bDesc}
                onChange={(e) => setBDesc(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 p-3.5 rounded-2xl text-xs font-medium outline-none focus:border-slate-900 focus:bg-white resize-none transition"
                placeholder="e.g. Trusted vendor providing high quality electronics under full payment protection..."
              />
            </div>
          </div>
        )}

        {subTab === "invoice" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest pb-1.5 border-b border-slate-100">
                {lang === "sw"
                  ? "NEMBO YA RISITI (INVOICE TEMPLATE)"
                  : "RECEIPT & INVOICE TEMPLATE"}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {lang === "sw"
                  ? "Weka maelezo yanayoandikwa kwenye invoice na risiti za malipo ya wateja wako."
                  : "Configure parameters printed on physical/digital receipts issued to consumers."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.55">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  {lang === "sw"
                    ? "Jina la Kampuni Kisheria"
                    : "Legal Company Title"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Orbi Electronics Ltd"
                  value={invCompany}
                  onChange={(e) => setInvCompany(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 p-3.5 rounded-2xl text-xs font-semibold outline-none focus:border-slate-900 focus:bg-white transition"
                />
              </div>
              <div className="space-y-1.55">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  {lang === "sw"
                    ? "Namba ya Simu Kwenye Invoice"
                    : "Invoicing phone Contact"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. +255 764 ..."
                  value={invPhone}
                  onChange={(e) => setInvPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 p-3.5 rounded-2xl text-xs font-semibold outline-none focus:border-slate-900 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.55">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Email Register
                </label>
                <input
                  type="email"
                  placeholder="e.g. finance@store.com"
                  value={invEmail}
                  onChange={(e) => setInvEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 p-3.5 rounded-2xl text-xs font-semibold outline-none focus:border-slate-900 focus:bg-white transition"
                />
              </div>
              <div className="space-y-1.55">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  {lang === "sw" ? "Anwani ya Ofisi" : "Office Address"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Samora Tower, Dar es Salaam"
                  value={invAddress}
                  onChange={(e) => setInvAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 p-3.5 rounded-2xl text-xs font-semibold outline-none focus:border-slate-900 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1.55">
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                {lang === "sw"
                  ? "Sheria na Vigezo vya Mauzo (Invoice terms)"
                  : "Terms of service details"}
              </label>
              <input
                type="text"
                placeholder="e.g. Warranty is valid for 6 months only under manufacturer defects. Goods non-refundable."
                value={invTerms}
                onChange={(e) => setInvTerms(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 p-3.5 rounded-2xl text-xs font-semibold outline-none focus:border-slate-900 focus:bg-white transition"
              />
            </div>
          </div>
        )}

        {subTab === "tax" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest pb-1.5 border-b border-slate-100">
                {lang === "sw"
                  ? "NEMBO YA TRA NA MAREJESHO YA KODI"
                  : "GOVERNMENT TAXATION MODULES"}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {lang === "sw"
                  ? "Sanidi namba ya kodi ya duka kwanza ili kuwezesha mwasilisho wa risiti za kielektroniki za kodi TRA."
                  : "Provide your corporate Taxpayer Identification Number and automated telemetry configurations."}
              </p>
            </div>

            <div className="space-y-1.55">
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                {lang === "sw"
                  ? "Namba ya TIN ya Duka / Seller TIN"
                  : "Seller TIN Number"}
              </label>
              <input
                type="text"
                placeholder="e.g. 144893102"
                value={tin}
                onChange={(e) => setTin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 p-3.5 rounded-2xl text-xs font-mono font-bold outline-none focus:border-slate-900 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.55 pt-2">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/60 rounded-2xl">
                <div className="text-left pr-4">
                  <label className="block text-[10px] font-black uppercase text-slate-800 tracking-widest">
                    {lang === "sw"
                      ? "Auto TAX Sales Submission"
                      : "Auto TAX Sales Submission"}
                  </label>
                  <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">
                    {lang === "sw"
                      ? "Sajili risiti TRA moja kwa moja baada ya oda kuwasilishwa (Confirm Delivery)"
                      : "Automatically submit invoice receipt to TRA EFDMS upon final delivery confirmation"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoTaxSales(!autoTaxSales)}
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer flex items-center shrink-0 ${autoTaxSales ? "bg-emerald-600 justify-end" : "bg-slate-300 justify-start"}`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase px-7 py-3.5 rounded-2xl shadow-md transition whitespace-nowrap cursor-pointer disabled:opacity-50"
        >
          {saving
            ? lang === "sw"
              ? "Inahifadhi..."
              : "Saving details..."
            : lang === "sw"
              ? "Hifadhi Mipangilio Yote"
              : "Apply invoice configuration"}
        </button>
      </div>
    </form>
  );
}

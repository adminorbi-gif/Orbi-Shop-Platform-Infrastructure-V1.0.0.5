import { useState, useCallback, useEffect } from "react";
import { db } from "../lib/db";

export function useClientData(visitorId: string) {
  const [products, setProducts] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [promotionalBanners, setPromotionalBanners] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<Record<string, any[]>>({});
  const [coupons, setCoupons] = useState<any[]>([]);
  const [systemNiches, setSystemNiches] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [marketplaceAds, setMarketplaceAds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shuffleWeights, setShuffleWeights] = useState<Record<string, number>>({});

  const loadData = useCallback(async (isBackground: boolean = false) => {
    try {
      if (!isBackground) setIsLoading(true);

      const [
        productsRes,
        promosRes,
        bannersRes,
        ordersRes,
        reviewsRes,
        couponsRes,
        nichesRes,
        sellersRes,
        adsRes
      ] = await Promise.allSettled([
        db.getProducts(),
        db.getPromotions(),
        db.getPromotionalBanners(),
        db.getOrders(),
        db.getReviews(),
        db.getCoupons(),
        db.getNiches(),
        db.getSellers(),
        db.getAds()
      ]);

      const allProducts = productsRes.status === 'fulfilled' ? productsRes.value : [];
      const visibleProducts = allProducts.filter((p: any) => p.visible !== false);
      setProducts(visibleProducts);

      const allPromos = promosRes.status === 'fulfilled' ? promosRes.value : [];
      const visiblePromos = allPromos.filter((p: any) => p.visible);
      setPromos(visiblePromos);

      const activeBanners = (bannersRes.status === 'fulfilled' ? bannersRes.value : []).filter((b: any) => b.visible);
      setPromotionalBanners(activeBanners);

      setOrders(ordersRes.status === 'fulfilled' ? ordersRes.value : []);

      const revsData = reviewsRes.status === 'fulfilled' ? reviewsRes.value : [];
      const mappedRevs: Record<string, any[]> = {};
      revsData.forEach((r: any) => {
        if (r.productId) {
          if (!mappedRevs[r.productId]) mappedRevs[r.productId] = [];
          mappedRevs[r.productId].push(r);
        }
      });
      setAllReviews(mappedRevs);

      if (!isBackground) {
        const weights: Record<string, number> = {};
        visibleProducts.forEach((p: any) => {
          const combined = `${visitorId}_${p.id}`;
          let hash = 0;
          for (let i = 0; i < combined.length; i++) {
            hash = (hash << 5) - hash + combined.charCodeAt(i);
            hash |= 0;
          }
          weights[p.id] = Math.abs(hash % 1000000) / 1000000;
        });
        setShuffleWeights(weights);
      }

      setCoupons(couponsRes.status === 'fulfilled' ? couponsRes.value : []);
      setSystemNiches(nichesRes.status === 'fulfilled' ? nichesRes.value : []);
      setSellers(sellersRes.status === 'fulfilled' ? sellersRes.value : []);
      setMarketplaceAds(adsRes.status === 'fulfilled' ? adsRes.value : []);

    } catch (error: any) {
      console.warn("[loadData] Failed to retrieve storefront resources:", error.message);
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  }, [visitorId]);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  return {
    products,
    promos,
    promotionalBanners,
    orders,
    allReviews,
    coupons,
    systemNiches,
    sellers,
    marketplaceAds,
    isLoading,
    shuffleWeights,
    loadData
  };
}

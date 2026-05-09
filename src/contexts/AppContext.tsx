"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { UserRole, CartItem, Product } from '@/data/types';
import { DEFAULT_LOCATION, type GeoCoord } from '@/lib/geo';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  cart: CartItem[];
  addToCart: (product: Product, dealerId: string, dealerName: string, dealerPrice: number, quantity?: number) => void;
  removeFromCart: (productId: string, dealerId: string) => void;
  updateCartQuantity: (productId: string, dealerId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  // Geo
  userLocation: GeoCoord;
  setUserLocation: (loc: GeoCoord) => void;
  geoDetected: boolean;
  setGeoDetected: (v: boolean) => void;
  /** Triggers fresh GPS resolution and updates userLocation + geoDetected in context */
  requestGeo: () => void;
  geoLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('customer');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('Tất cả');
  const [userLocation, setUserLocation] = useState<GeoCoord>(DEFAULT_LOCATION);
  const [geoDetected, setGeoDetected] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const addToCart = (product: Product, dealerId: string, dealerName: string, dealerPrice: number, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.dealerId === dealerId);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.dealerId === dealerId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, dealerId, dealerName, dealerPrice, quantity }];
    });
  };

  const removeFromCart = (productId: string, dealerId: string) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.dealerId === dealerId)));
  };

  const updateCartQuantity = (productId: string, dealerId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId, dealerId);
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.dealerId === dealerId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.dealerPrice * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  /** Triggers fresh GPS resolution — updates userLocation + geoDetected in context */
  const requestGeo = () => {
    if (!('geolocation' in navigator)) return;
    if (geoLoading) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoDetected(true);
        setGeoLoading(false);
      },
      () => {
        setGeoDetected(false);
        setGeoLoading(false);
        toast.info("Không lấy được vị trí", {
          description: "Đang dùng vị trí mặc định. Bạn có thể chọn Tỉnh/TP thủ công.",
          duration: 5000,
        });
      },
      { timeout: 5000, maximumAge: 0 }
    );
  };

  return (
    <AppContext.Provider
      value={{
        role, setRole,
        cart, addToCart, removeFromCart, updateCartQuantity, clearCart,
        cartTotal, cartCount,
        selectedRegion, setSelectedRegion,
        userLocation, setUserLocation, geoDetected, setGeoDetected, requestGeo, geoLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

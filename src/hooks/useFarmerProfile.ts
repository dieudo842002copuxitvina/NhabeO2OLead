"use client";

/**
 * useFarmerProfile.ts
 * "Smart Memory" hook — lưu & đọc profile nông dân từ localStorage.
 * Mọi form trên hệ thống dùng hook này để:
 *   - Pre-fill tự động khi người dùng quay lại
 *   - Sync dữ liệu ngay khi nhập, không cần Submit
 */

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'nba_farmer_profile_v1';

export interface FarmerProfile {
  /** Loại cây trồng chính (key từ calculatorV2 CROPS) */
  cropKey: string;
  cropName: string;
  /** Diện tích (ha) */
  areHa: number | null;
  /** Tỉnh */
  provinceCode: string;
  provinceName: string;
  /** Huyện */
  districtCode: string;
  districtName: string;
  /** Xã */
  wardCode: string;
  wardName: string;
  /** Lat/Lng từ geolocation */
  lat: number | null;
  lng: number | null;
  /** Số điện thoại (đã format) */
  phone: string;
  /** Tên nông dân */
  name: string;
  /** Cập nhật lần cuối */
  updatedAt: string;
}

const DEFAULT_PROFILE: FarmerProfile = {
  cropKey: '',
  cropName: '',
  areHa: null,
  provinceCode: '',
  provinceName: '',
  districtCode: '',
  districtName: '',
  wardCode: '',
  wardName: '',
  lat: null,
  lng: null,
  phone: '',
  name: '',
  updatedAt: '',
};

function readFromStorage(): FarmerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) } as FarmerProfile;
  } catch {
    return DEFAULT_PROFILE;
  }
}

function writeToStorage(profile: FarmerProfile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // localStorage unavailable (private mode)
  }
}

export function useFarmerProfile() {
  const [profile, setProfile] = useState<FarmerProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load once on mount (avoid SSR hydration mismatch)
  useEffect(() => {
    setProfile(readFromStorage());
    setIsLoaded(true);
  }, []);

  /**
   * Merge partial updates & persist immediately.
   * Call this onChange in any form field.
   */
  const updateProfile = useCallback((patch: Partial<FarmerProfile>) => {
    setProfile((prev) => {
      const next: FarmerProfile = {
        ...prev,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      writeToStorage(next);
      return next;
    });
  }, []);

  /** Clear all saved data (e.g., logout) */
  const clearProfile = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(DEFAULT_PROFILE);
  }, []);

  /** Check if any meaningful data exists */
  const hasProfile = Boolean(
    profile.cropKey || profile.provinceCode || profile.phone
  );

  return { profile, updateProfile, clearProfile, hasProfile, isLoaded };
}

"use client";

import React, { useState, useEffect } from 'react';
import { Device, CreateDevicePayload, UpdateDevicePayload } from '@/lib/api/types';
import { getDevices, createDevice, updateDevice } from '@/lib/api/devices';
import { AddCircle, Pen, Smartphone } from '@solar-icons/react';
import DeviceFormModal from './DeviceFormModal';
import { Skeleton } from '@/components/ui/skeleton';

interface DeviceListProps {
  lang: 'en' | 'ar';
}

export default function DeviceList({ lang }: DeviceListProps) {
  const isAr = lang === 'ar';
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getDevices();
      setDevices(res || []);
    } catch (err: any) {
      console.error('Failed to fetch devices', err);
      setError(err);
      setDevices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: CreateDevicePayload) => {
    try {
      const newDevice = await createDevice(data);
      setDevices([...devices, newDevice]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create device', error);
    }
  };

  const handleUpdate = async (data: UpdateDevicePayload) => {
    if (!editingDevice) return;
    try {
      const updatedDevice = await updateDevice(editingDevice.id, data);
      setDevices(devices.map(d => (d.id === updatedDevice.id ? updatedDevice : d)));
      setIsModalOpen(false);
      setEditingDevice(null);
    } catch (error) {
      console.error('Failed to update device', error);
    }
  };

  const openEditModal = (device: Device) => {
    setEditingDevice(device);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[11px] font-semibold text-foreground uppercase tracking-widest leading-none mb-2">
            {isAr ? 'أجهزتي المسجلة' : 'Registered Devices'}
          </h2>
          <p className="text-xs text-foreground/40 font-medium">
            {isAr ? 'قائمة بجميع الأجهزة النشطة في حسابك' : 'Review and manage your connected hardware.'}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingDevice(null);
            setIsModalOpen(true);
          }}
          className="hover-translate flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-md font-semibold text-sm transition-all duration-300"
        >
          <AddCircle size={20} />
          {isAr ? 'إضافة جهاز جديد' : 'Register New Device'}
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-border rounded-lg p-6 space-y-5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-foreground/5 rounded-md" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-foreground/5 rounded" />
                    <div className="h-3 w-16 bg-foreground/5 rounded" />
                  </div>
                </div>
                <div className="w-8 h-8 bg-foreground/5 rounded-md" />
              </div>
              
              <div className="space-y-3 pt-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex justify-between items-center">
                    <div className="h-3 w-16 bg-foreground/5 rounded" />
                    <div className="h-3 w-20 bg-foreground/5 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-foreground/[0.01] border border-border border-dashed rounded-lg p-16 text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-secondary-red/5 rounded-lg flex items-center justify-center text-secondary-red border border-secondary-red/10">
            <Smartphone size={32} className="opacity-60" />
          </div>
          <div className="space-y-2">
            <p className="text-foreground font-semibold text-lg tracking-tight">
              {isAr ? 'عذراً، تعذر جلب الأجهزة' : 'Vault Access Denied'}
            </p>
            <p className="text-xs text-foreground/40 font-medium max-w-[240px] leading-relaxed mx-auto">
              {isAr ? 'حدث خطأ أثناء محاولة الاتصال بالخادم. يرجى التأكد من اتصالك بالإنترنت.' : 'We encountered a synchronization error while retrieving your hardware manifest.'}
            </p>
          </div>
          <button 
            onClick={() => fetchDevices()}
            className="hover-translate px-8 py-3 bg-brand-500 text-white text-xs font-black uppercase tracking-widest rounded-md"
          >
            {isAr ? 'إعادة المحاولة' : 'Try Again'}
          </button>
        </div>
      ) : devices.length === 0 ? (
        <div className="bg-foreground/[0.01] border border-border border-dashed rounded-lg p-16 text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-brand-500/5 rounded-lg flex items-center justify-center text-brand-500 border border-brand-500/10">
            <Smartphone size={32} className="opacity-60" />
          </div>
          <div className="space-y-2">
            <p className="text-foreground font-semibold text-lg tracking-tight">
              {isAr ? 'لا توجد أجهزة مضافة بعد.' : 'No devices added yet.'}
            </p>
            <p className="text-xs text-foreground/40 font-medium max-w-[240px] leading-relaxed mx-auto">
              {isAr ? 'أضف جهازك الأول لطلب الصيانة بسهولة وسرعة من خلال لوحة التحكم.' : 'Add your first device to easily request professional repairs through your dashboard.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {devices.map((device) => (
            <div key={device.id} className="group hover-translate bg-white border border-border rounded-lg p-6 relative transition-all duration-500 hover:border-brand-500/30">
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-md bg-brand-500/5 text-brand-500 flex items-center justify-center border border-brand-500/10 transition-all duration-500 group-hover:bg-brand-500 group-hover:text-white">
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground tracking-tight leading-none mb-2 text-base transition-colors group-hover:text-brand-500">{device.name}</h3>
                    <span className="wf-uppercase-label !text-[9px] px-2 py-0.5 bg-foreground/[0.03] text-foreground/40 rounded-sm border border-border/10 tracking-widest font-bold">
                      {device.platform}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => openEditModal(device)}
                  className="p-2 text-foreground/20 hover:text-brand-500 hover:bg-brand-500/5 rounded-md transition-all active:scale-90"
                >
                  <Pen size={18} />
                </button>
              </div>
              
              <div className="space-y-3.5 pt-4 text-[13px] font-medium border-t border-border/5">
                <div className="flex justify-between items-center">
                  <span className="text-foreground/30 uppercase tracking-widest text-[9px] font-bold">{isAr ? 'الشركة المصنعة' : 'Manufacturer'}</span>
                  <span className="text-foreground tracking-tight font-semibold">{device.manufacturer}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground/30 uppercase tracking-widest text-[9px] font-bold">{isAr ? 'الموديل' : 'Model'}</span>
                  <span className="text-foreground tracking-tight font-semibold truncate max-w-[120px]">{device.deviceModel}</span>
                </div>
                {device.osVersion && (
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/30 uppercase tracking-widest text-[9px] font-bold">{isAr ? 'إصدار النظام' : 'OS Version'}</span>
                    <span className="text-foreground tracking-tight font-semibold">{device.osVersion}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <DeviceFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDevice(null);
        }}
        onSubmit={editingDevice ? handleUpdate : handleCreate}
        initialData={editingDevice || undefined}
        lang={lang}
      />
    </div>
  );
}

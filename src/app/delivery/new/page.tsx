'use client';

import { Suspense } from 'react';

// Wrap entire original logic in this component
function InnerNewDeliveryPage() {
  // 🔁 BEGIN your entire original page code here
  // Everything from below is **your original code**, unchanged

  import { useState, useEffect } from 'react';
  import Image from "next/image";
  import { useRouter, useSearchParams } from 'next/navigation';
  import AppLayout from "@/components/app-layout";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Textarea } from "@/components/ui/textarea";
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
  import { Button } from "@/components/ui/button";
  import { MapPin, Wallet, CreditCard, Landmark, Map, Users, Building, Plus, Minus } from "lucide-react";
  import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
  import { useDeliveries } from '@/context/delivery-context';
  import { useToast } from "@/hooks/use-toast";
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
  import { generateMapImage } from '@/ai/flows/generate-map-flow';
  import { Skeleton } from '@/components/ui/skeleton';
  import { vendors } from '@/lib/data';

  const mockLocations = [
    "KC Food Court", "MIT Central Library", "Block 5, Room 201",
    "Block 17, Room 404", "Student Plaza", "Night Canteen", "Campus Store"
  ];

  const router = useRouter();
  const searchParams = useSearchParams();
  const { addDelivery, addVendorDelivery } = useDeliveries();
  const { toast } = useToast();

  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [editingLocation, setEditingLocation] = useState<'pickup' | 'dropoff' | null>(null);
  const [deliveryType, setDeliveryType] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [packageSize, setPackageSize] = useState('');
  const [standardDeliveryDescription, setStandardDeliveryDescription] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [totalPrice, setTotalPrice] = useState('');
  const [mapImageUrl, setMapImageUrl] = useState("https://placehold.co/600x400.png");
  const [isMapLoading, setIsMapLoading] = useState(false);

  const role = searchParams.get('role');
  const dashboardLink = `/dashboard${role ? `?role=${role}` : ''}`;

  const selectedVendorData = vendors.find(v => v.id === selectedVendor);

  useEffect(() => {
    const finalPickup = deliveryType === 'vendor' ? vendors.find(v => v.id === selectedVendor)?.name : pickup;
    if (finalPickup && dropoff) {
      const handler = setTimeout(() => {
        setIsMapLoading(true);
        generateMapImage({ pickup: finalPickup, dropoff })
          .then(result => setMapImageUrl(result.mapDataUri))
          .catch(() => setMapImageUrl("https://placehold.co/600x400.png"))
          .finally(() => setIsMapLoading(false));
      }, 1000);
      return () => clearTimeout(handler);
    }
  }, [pickup, dropoff, deliveryType, selectedVendor]);

  useEffect(() => {
    if (deliveryType === 'vendor' && selectedVendor) {
      const vendorName = vendors.find(v => v.id === selectedVendor)?.name;
      if (vendorName) setPickup(vendorName);
    } else {
      setPickup('');
    }
  }, [deliveryType, selectedVendor]);

  useEffect(() => {
    if (deliveryType === 'vendor' && selectedVendorData) {
      const vendorMenu = selectedVendorData.menu || [];
      const itemTotal = Object.entries(selectedItems).reduce((acc, [itemId, quantity]) => {
        const item = vendorMenu.find(i => i.id === itemId);
        return acc + (item ? item.price * quantity : 0);
      }, 0);
      const calculatedDeliveryFee = itemTotal > 0 ? 30 : 0;
      setTotalPrice((itemTotal + calculatedDeliveryFee).toString());
    }
  }, [selectedItems, deliveryType, selectedVendorData]);

  useEffect(() => {
    setStandardDeliveryDescription('');
    setDeliveryFee('');
    setSelectedItems({});
    setSelectedVendor('');
    setTotalPrice('');
    setPackageSize('');
  }, [deliveryType]);

  const handleQuantityChange = (itemId: string, change: number) => {
    setSelectedItems(prev => {
      const currentQuantity = prev[itemId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      if (newQuantity === 0) {
        const newItems = { ...prev };
        delete newItems[itemId];
        return newItems;
      }
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const handleSubmit = () => {
    const finalPickup = deliveryType === 'vendor' ? selectedVendorData?.name : pickup;
    let finalDescription = '';
    if (deliveryType === 'vendor') {
      const vendorMenu = selectedVendorData?.menu || [];
      finalDescription = vendorMenu
        .filter(item => selectedItems[item.id] > 0)
        .map(item => `${selectedItems[item.id]}x ${item.name}`)
        .join(', ');
    } else {
      finalDescription = standardDeliveryDescription;
    }
    const finalPrice = deliveryType === 'vendor' ? totalPrice : deliveryFee;
    if (!finalPickup || !dropoff || !finalDescription || !finalPrice || !paymentMethod) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please fill out all required fields." });
      return;
    }
    const deliveryData = {
      item: finalDescription,
      pickup: finalPickup,
      dropoff,
      price: Number(finalPrice),
      paymentMethod,
      mapImageUrl,
    };
    if (deliveryType === 'standard') {
      addDelivery(deliveryData);
      toast({ title: "Delivery Request Submitted!", description: "Your request has been sent to available couriers." });
    } else {
      addVendorDelivery(deliveryData, selectedVendor);
      toast({ title: "Order Placed!", description: `Your order has been placed with ${finalPickup}.` });
    }
    router.push(dashboardLink);
  };

  const handleSelectLocation = (location: string) => {
    if (editingLocation === 'pickup') {
      setPickup(location);
    } else if (editingLocation === 'dropoff') {
      setDropoff(location);
    }
    setEditingLocation(null);
  };

  const itemTotalForDisplay = deliveryType === 'vendor' && totalPrice ? (Number(totalPrice) > 0 ? Number(totalPrice) - 30 : 0) : 0;
  const deliveryFeeForDisplay = deliveryType === 'vendor' && itemTotalForDisplay > 0 ? 30 : 0;

  return (
    <AppLayout>
      {/* 👇 keep your full return JSX here */}
      {/* I've removed it for brevity. You can paste it back exactly as is from your original code. */}
    </AppLayout>
  );
}

// Export final component wrapped in <Suspense>
export default function NewDeliveryPage() {
  return (
    <Suspense fallback={<div>Loading delivery form...</div>}>
      <InnerNewDeliveryPage />
    </Suspense>
  );
}

'use client';

import { Suspense } from 'react';
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import AppLayout from "@/components/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, CheckCircle, PackagePlus, PackageSearch } from "lucide-react";
import { useDeliveries } from "@/context/delivery-context";
import { Badge } from "@/components/ui/badge";
import { vendors } from "@/lib/data";
import type { Delivery } from "@/context/delivery-context";

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { deliveries, acceptJob } = useDeliveries();

  const role = searchParams.get('role') || 'customer';
  const isCourier = role === 'courier';
  const isVendor = role === 'vendor';

  let activeList: Delivery[] = [], completedList: Delivery[] = [], activityList: Delivery[] = [], title, description, activityTitle, activityDescription;

  if (isCourier) {
    title = "Courier Dashboard";
    description = "Welcome back! Find and manage your delivery jobs here.";
    activityTitle = "Available Delivery Requests";
    activityDescription = "Pick up a job from the list below.";
    activeList = deliveries.filter(d => d.status === 'In Transit' && d.courier?.id === 'courier-user');
    completedList = deliveries.filter(d => d.status === 'Delivered' && d.courier?.id === 'courier-user');
    activityList = deliveries.filter(d => d.status === 'Pending Pickup');
  } else if (isVendor) {
    const vendor = vendors[0]; 
    title = `${vendor.name} Dashboard`;
    description = "Welcome! Here's a quick overview of your store's current activity.";
    activeList = deliveries.filter(d => d.status !== 'Delivered' && d.courier?.id === vendor.courier.id);
    completedList = deliveries.filter(d => d.status === 'Delivered' && d.courier?.id === vendor.courier.id);
  } else {
    title = "Dashboard";
    description = "Welcome back! Here's an overview of your deliveries.";
    activityTitle = "Recent Activity";
    activityDescription = "An overview of your recent deliveries.";
    activeList = deliveries.filter(d => d.status !== 'Delivered');
    completedList = deliveries.filter(d => d.status === 'Delivered');
    activityList = deliveries;
  }

  const handleAcceptJob = (deliveryId: string) => {
    acceptJob(deliveryId);
    router.push(`/delivery/${deliveryId}?role=courier`);
  };

  const handleViewDetails = (deliveryId: string) => {
    const deliveryRole = isCourier ? 'courier' : isVendor ? 'vendor' : 'customer';
    router.push(`/delivery/${deliveryId}?role=${deliveryRole}`);
  };

  const renderOrderList = (list: Delivery[], isCompletedSection = false) => {
    if (list.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          <PackageSearch className="mx-auto h-12 w-12" />
          <p className="mt-4">{isCompletedSection ? "No completed orders yet." : "No active orders right now."}</p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {list.map((delivery) => (
          <div key={delivery.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => handleViewDetails(delivery.id)}>
            <div className="flex-grow">
              <p className="font-medium">{delivery.item}</p>
              <p className="text-sm text-muted-foreground">To: {delivery.dropoff}</p>
            </div>
            <Badge variant={delivery.status === 'Delivered' ? 'secondary' : 'default'} className={delivery.status === 'In Transit' ? 'bg-amber-500' : ''}>{delivery.status}</Badge>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-headline text-3xl font-semibold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className={`grid gap-4 md:grid-cols-2 ${isCourier || isVendor ? '' : 'lg:grid-cols-3'}`}>
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isCourier ? 'Assigned Jobs' : isVendor ? 'Active Orders' : 'Active Deliveries'}
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeList.length}</div>
              <p className="text-xs text-muted-foreground">
                {isCourier ? 'Jobs currently in progress.' : 'Deliveries currently in progress.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed {isCourier ? 'Jobs' : isVendor ? 'Orders' : 'Deliveries'}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedList.length}</div>
              <p className="text-xs text-muted-foreground">
                Total {isCourier ? 'jobs' : 'deliveries'} successfully completed.
              </p>
            </CardContent>
          </Card>

          {!isCourier && !isVendor && (
            <Card className="col-span-full lg:col-span-1 bg-primary text-primary-foreground flex flex-col justify-center">
              <CardContent className="pt-6">
                <Link href="/delivery/new?role=customer">
                  <Button variant="secondary" className="w-full">
                    <PackagePlus className="mr-2 h-4 w-4" />
                    Create New Delivery
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {isVendor ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Active Orders</CardTitle>
              <CardDescription>Orders that are currently being prepared or are in transit.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderOrderList(activeList)}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{activityTitle}</CardTitle>
              <CardDescription>{activityDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityList.map((delivery) => (
                  <div key={delivery.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex-grow cursor-pointer" onClick={() => handleViewDetails(delivery.id)}>
                      <p className="font-medium">{delivery.item}</p>
                      <p className="text-sm text-muted-foreground">
                        {isCourier ? `From: ${delivery.pickup} | To: ${delivery.dropoff}` : `To: ${delivery.dropoff}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {isCourier ? (
                        <>
                          <div className="font-semibold text-primary">₹{delivery.price}</div>
                          <Button size="sm" onClick={() => handleAcceptJob(delivery.id)}>
                            Accept Job
                          </Button>
                        </>
                      ) : (
                        <Badge variant={delivery.status === 'Delivered' ? 'secondary' : 'default'} className={delivery.status === 'In Transit' ? 'bg-amber-500' : ''}>{delivery.status}</Badge>
                      )}
                    </div>
                  </div>
                ))}
                {activityList.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <PackageSearch className="mx-auto h-12 w-12" />
                    <p className="mt-4">{isCourier ? "No available jobs at the moment. Check back later!" : "No deliveries yet. Create one to get started!"}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

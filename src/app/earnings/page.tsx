export const dynamic = 'force-dynamic';

'use client';

import { useSearchParams } from "next/navigation";
import AppLayout from "@/components/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeliveries } from "@/context/delivery-context";
import { vendors } from "@/lib/data";
import { DollarSign, Package, Building } from "lucide-react";
import { format } from "date-fns";

export default function EarningsPage() {
  const { deliveries } = useDeliveries();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'courier';
  const isVendor = role === 'vendor';

  let completedDeliveries, totalEarnings, pageTitle, pageDescription, revenueTitle, revenueDescription, jobsTitle, jobsDescription;

  if (isVendor) {
    const vendor = vendors[0]; // Assuming first vendor is logged in
    pageTitle = `${vendor.name} Revenue`;
    pageDescription = "An overview of your store's completed orders and total revenue.";
    revenueTitle = "Total Revenue";
    revenueDescription = "Total revenue from all completed orders.";
    jobsTitle = "Orders Completed";
    jobsDescription = "Total number of orders successfully fulfilled.";
    completedDeliveries = deliveries.filter(d => d.status === "Delivered" && d.courier?.id === vendor.courier.id);
  } else { // Courier
    pageTitle = "My Earnings";
    pageDescription = "An overview of your completed jobs and total earnings.";
    revenueTitle = "Total Revenue";
    revenueDescription = "Total earnings from all completed jobs.";
    jobsTitle = "Jobs Completed";
    jobsDescription = "Total number of deliveries successfully completed.";
    completedDeliveries = deliveries.filter(d => d.status === "Delivered" && d.courier?.id === 'courier-user');
  }

  totalEarnings = completedDeliveries.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-headline text-3xl font-semibold">{pageTitle}</h1>
          <p className="text-muted-foreground">{pageDescription}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{revenueTitle}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{revenueDescription}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{jobsTitle}</CardTitle>
              {isVendor ? <Building className="h-4 w-4 text-muted-foreground" /> : <Package className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedDeliveries.length}</div>
              <p className="text-xs text-muted-foreground">{jobsDescription}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isVendor ? "Completed Order History" : "Completed Jobs History"}</CardTitle>
            <CardDescription>
              {isVendor ? "A detailed list of all the orders your store has fulfilled." : "A detailed list of all the deliveries you've successfully completed."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item Description</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead className="text-right">{isVendor ? "Revenue" : "Earning"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedDeliveries.length > 0 ? (
                  completedDeliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>
                        {format(new Date(delivery.date), "dd MMM, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {delivery.item}
                      </TableCell>
                      <TableCell>{delivery.pickup}</TableCell>
                      <TableCell>{delivery.dropoff}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{delivery.price.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {isVendor ? "No completed orders yet." : "You haven't completed any jobs yet."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

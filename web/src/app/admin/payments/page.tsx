"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Download } from "lucide-react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { paymentAPI, handleApiError } from "@/lib/api"
import { Payment } from "@/types/payment"

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const { toast } = useToast()
  console.log(payments);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await paymentAPI.getAllPayments()
        setPayments(response.data.data)
      } catch (error) {
        const errorDetails = handleApiError(error)
        toast({
          title: "Error fetching payments",
          description: errorDetails.message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [toast])

  const handleExport = async () => {
    try {
      toast({
        title: "Export Started",
        description: "Payment data is being exported to CSV",
      })

      // In a real implementation, this would use an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1500))

      toast({
        title: "Export Complete",
        description: "Payment data has been exported successfully",
      })
    } catch (error) {
      const errorDetails = handleApiError(error)
      toast({
        title: "Export Failed",
        description: errorDetails.message,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading payments...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
          <p className="text-muted-foreground">View and manage payment transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>View all payment transactions in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search transactions..." className="w-full pl-8" />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell className="font-medium">{payment._id}</TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === "completed"
                          ? "default"
                          : payment.status === "pending"
                            ? "outline"
                            : "destructive"
                      }
                    >
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>{payment.vehicle.plateNumber}, {payment.vehicle.type}</TableCell>
                  <TableCell>{new Date(payment.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedPayment(payment)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedPayment && (
        <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>Transaction ID: {selectedPayment._id}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Amount</p>
                  <p className="text-sm text-muted-foreground">{selectedPayment.amount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Method</p>
                  <p className="text-sm text-muted-foreground">{selectedPayment.method}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Status</p>
                  <Badge
                    variant={
                      selectedPayment.status === "completed"
                        ? "default"
                        : selectedPayment.status === "pending"
                          ? "outline"
                          : "destructive"
                    }
                  >
                    {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Vehicle</p>
                <p className="text-sm text-muted-foreground">{selectedPayment.vehicleId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Date & Time</p>
                <p className="text-sm text-muted-foreground">{new Date(selectedPayment.createdAt).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Receipt</p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

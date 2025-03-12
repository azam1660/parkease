"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { BarChart3, Download, FileText, Printer } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { reportAPI } from "@/lib/api";

export default function ReportsPage() {
  const { toast } = useToast();
  type Report = {
    _id: number;
    title: string;
    date: string;
    schedule?: string;
    frequency?: string;
    time?: string;
    format?: string;
    email?: boolean;
  };

  const [reports, setReports] = useState<Report[]>([]);
  const [scheduledReports, setScheduledReports] = useState<Report[]>([]);
  const [editingReport, setEditingReport] = useState<Report | null>(null);

  useEffect(() => {
    fetchReports();
    fetchScheduledReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await reportAPI.getAllReports();
      setReports(response.data.data);
    } catch (error) {
      console.error("Error fetching reports", error);
    }
  };

  const fetchScheduledReports = async () => {
    try {
      const response = await reportAPI.getAllReports();
      setScheduledReports(response.data.data);
    } catch (error) {
      console.error("Error fetching scheduled reports", error);
    }
  };

  const handleUpdateScheduledReport = async (id: number, data: Partial<Report>) => {
    try {
      await reportAPI.updateScheduledReport(id, data);
      toast({ title: "Schedule Updated", description: "The report schedule has been updated" });
      setEditingReport(null);
      fetchScheduledReports();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update scheduled report", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">Generate and view detailed parking reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              toast({ title: "Printing Report", description: "The report is being sent to the printer" });
              setTimeout(() => window.print(), 500);
            }}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            onClick={() => {
              toast({ title: "Export Started", description: "Report data is being exported" });
              setTimeout(() => toast({ title: "Export Complete", description: "Report has been exported successfully" }), 1500);
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Report</CardTitle>
              <CardDescription>June 15, 2023</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] bg-muted/20 rounded-md flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Previously generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{report.title}</p>
                      <p className="text-xs text-muted-foreground">Generated {report.date}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scheduled Reports</CardTitle>
            <CardDescription>Automatically generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledReports.map((report) => (
                <div key={report._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{report.title}</p>
                      <p className="text-xs text-muted-foreground">{report.schedule}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setEditingReport(report)}>
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {editingReport && (
        <Dialog open={!!editingReport} onOpenChange={(open) => !open && setEditingReport(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Scheduled Report</DialogTitle>
              <DialogDescription>Modify the schedule and settings for this report.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="report-name">Report Name</Label>
                <Input id="report-name" defaultValue={editingReport.title} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-frequency">Frequency</Label>
                <Select defaultValue={editingReport.frequency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-time">Time</Label>
                <Input id="report-time" type="time" defaultValue={editingReport.time} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-format">Format</Label>
                <Select defaultValue={editingReport.format}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="report-email" defaultChecked={editingReport.email} />
                <Label htmlFor="report-email">Send via email</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingReport(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleUpdateScheduledReport(editingReport._id, editingReport)}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

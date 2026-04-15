'use client';

import { useState, useEffect, useMemo } from 'react';
import { Settings, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MultiSelectCalendar } from '@/components/expert/multi-select-calendar';
import { ActivityForm } from '@/components/expert/activity-form';
import { ActivitiesTable } from '@/components/expert/activities-table';
import { ReportGenerator } from '@/components/expert/report-generator';
import { MonthlyReportExport } from '@/components/expert/monthly-report-export';
import { getMonthName } from '@/lib/supabase-store';
import { useExperts, useActivitiesByMonth, useActivityMutations, useApiKey } from '@/hooks/use-supabase-data';
import type { Activity, Expert } from '@/lib/types';
import { UserMenu } from '@/components/user-menu';
import { createClient } from '@/lib/supabase/client';

export default function ExpertDashboard() {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [selectedExpertId, setSelectedExpertId] = useState<string | null>(null);
  const [localApiKey, setLocalApiKey] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Supabase hooks
  const { experts, isLoading: expertsLoading } = useExperts();
  const { activities: allMonthActivities, isLoading: activitiesLoading, mutate: refreshActivities } = useActivitiesByMonth(currentMonth, currentYear);
  const { create: createActivity, createBatch, update: updateActivity, remove: removeActivity } = useActivityMutations();
  const { apiKey, setApiKey, isLoading: apiKeyLoading } = useApiKey();

  // Get logged in user email
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
      }
    });
  }, []);

  // Set expert based on logged in user's email
  useEffect(() => {
    if (experts.length > 0 && userEmail && !selectedExpertId) {
      // Find expert by email
      const matchingExpert = experts.find(e => e.email?.toLowerCase() === userEmail.toLowerCase());
      if (matchingExpert) {
        setSelectedExpertId(matchingExpert.id);
      } else {
        // Fallback to first expert if no match found
        setSelectedExpertId(experts[0].id);
      }
    }
  }, [experts, userEmail, selectedExpertId]);

  // Load API key when it changes
  useEffect(() => {
    if (apiKey) {
      setLocalApiKey(apiKey);
    }
  }, [apiKey]);

  // Get selected expert
  const selectedExpert = useMemo(() => {
    return experts.find((e) => e.id === selectedExpertId) || experts[0] || { id: '', name: 'Expert', role: '' };
  }, [experts, selectedExpertId]);

  // Filter activities by expert
  const activities = useMemo(() => {
    if (!selectedExpertId) return [];
    return allMonthActivities.filter((a) => a.expertId === selectedExpertId);
  }, [allMonthActivities, selectedExpertId]);

  const handleMonthChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
    setSelectedDates([]);
  };

  const handleSaveActivities = async (newActivities: Activity[]) => {
    setIsSaving(true);
    try {
      if (editingActivity) {
        // Update existing activity
        for (const activity of newActivities) {
          await updateActivity(activity.id, activity);
        }
      } else {
        // Add new activities
        await createBatch(newActivities.map(a => ({
          ...a,
          expertId: selectedExpertId!,
        })));
      }
      await refreshActivities();
      setShowForm(false);
      setEditingActivity(null);
      setSelectedDates([]);
    } catch (error) {
      console.error('Error saving activities:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setSelectedDates([activity.date]);
    setShowForm(true);
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await removeActivity(activityId);
      await refreshActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await setApiKey(localApiKey);
      setSettingsOpen(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleAddActivity = () => {
    if (selectedDates.length === 0) return;
    setEditingActivity(null);
    setShowForm(true);
  };

  const isLoading = expertsLoading || activitiesLoading || apiKeyLoading;

  if (isLoading && experts.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Se încarcă datele...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">Pontaj Experți</h1>
                <p className="text-sm text-muted-foreground">
                  {getMonthName(currentMonth)} {currentYear} - Cod Proiect: 302141
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Select
                value={selectedExpertId || ''}
                onValueChange={(id) => setSelectedExpertId(id)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selectează expert" />
                </SelectTrigger>
                <SelectContent>
                  {experts.map((expert) => (
                    <SelectItem key={expert.id} value={expert.id}>
                      {expert.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Setări</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">Claude API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={localApiKey}
                        onChange={(e) => setLocalApiKey(e.target.value)}
                        placeholder="sk-ant-..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Necesar pentru funcțiile AI (generare rapoarte, verificare titluri)
                      </p>
                    </div>
                    <Button onClick={handleSaveSettings} className="w-full">
                      Salvează
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="pontaj" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pontaj">Pontaj & Activități</TabsTrigger>
            <TabsTrigger value="raport">Generare Raport</TabsTrigger>
          </TabsList>

          <TabsContent value="pontaj" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Calendar Section */}
              <div className="lg:col-span-1">
<MultiSelectCalendar
                    selectedDates={selectedDates}
                    onSelectDates={setSelectedDates}
                    activities={activities}
                    onMonthChange={handleMonthChange}
                    expertNorma={selectedExpert.norma || 8}
                    />

                {selectedDates.length > 0 && !showForm && (
                  <div className="mt-4">
                    <Button onClick={handleAddActivity} className="w-full">
                      Adaugă activitate pentru {selectedDates.length}{' '}
                      {selectedDates.length === 1 ? 'zi' : 'zile'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Form / Table Section */}
              <div className="lg:col-span-2">
                {showForm ? (
                  <ActivityForm
                    selectedDates={selectedDates}
                    expertId={selectedExpertId || ''}
                    expertName={selectedExpert.name}
                    expert={selectedExpert as import('@/lib/types').Expert}
                    allExperts={experts}
                    apiKey={localApiKey || null}
                    onSave={handleSaveActivities}
                    onCancel={() => {
                      setShowForm(false);
                      setEditingActivity(null);
                      setSelectedDates([]);
                    }}
                    initialActivity={editingActivity || undefined}
                    isSaving={isSaving}
                  />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Activități - {selectedExpert.name} - {getMonthName(currentMonth)}{' '}
                        {currentYear}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activitiesLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <ActivitiesTable
                          activities={activities}
                          onEdit={handleEditActivity}
                          onDelete={handleDeleteActivity}
                        />
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="raport">
            <div className="space-y-4">
              <div className="flex justify-end">
                <MonthlyReportExport
                  expert={selectedExpert as Expert}
                  activities={activities}
                  month={currentMonth}
                  year={currentYear}
                />
              </div>
              <ReportGenerator
                activities={activities}
                month={currentMonth}
                year={currentYear}
                expertName={selectedExpert.name}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

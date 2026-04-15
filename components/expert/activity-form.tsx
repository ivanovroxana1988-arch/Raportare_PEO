'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { generateId, formatDateRo } from '@/lib/supabase-store';
import type { Activity, Deliverable, GrupTintaEntry, ActivityType } from '@/lib/types';
import { ACTIVITY_TYPES } from '@/lib/types';

interface ActivityFormProps {
  selectedDates: string[];
  expertId: string;
  expertName: string;
  onSave: (activities: Activity[]) => void;
  onCancel: () => void;
  initialActivity?: Activity;
  isSaving?: boolean;
}

export function ActivityForm({
  selectedDates,
  expertId,
  expertName,
  onSave,
  onCancel,
  initialActivity,
  isSaving = false,
}: ActivityFormProps) {
  const [hours, setHours] = useState(initialActivity?.hours?.toString() || '8');
  const [activityType, setActivityType] = useState<ActivityType>(
    (initialActivity?.activityType as ActivityType) || 'A4.1'
  );
  const [title, setTitle] = useState(initialActivity?.title || '');
  const [description, setDescription] = useState(initialActivity?.description || '');
  const [location, setLocation] = useState(initialActivity?.location || 'Birou');
  const [deliverables, setDeliverables] = useState<Deliverable[]>(
    initialActivity?.deliverables || []
  );
  const [grupTinta, setGrupTinta] = useState<GrupTintaEntry[]>(initialActivity?.grupTinta || []);
  const [isVerifyingTitle, setIsVerifyingTitle] = useState(false);
  const [titleVerificationResult, setTitleVerificationResult] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newDeliverables: Deliverable[] = [];

    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = () => {
        const deliverable: Deliverable = {
          id: generateId(),
          activityId: initialActivity?.id || '',
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
          fileData: reader.result as string,
        };
        newDeliverables.push(deliverable);
        if (newDeliverables.length === files.length) {
          setDeliverables([...deliverables, ...newDeliverables]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeDeliverable = (id: string) => {
    setDeliverables(deliverables.filter((d) => d.id !== id));
  };

  const addGrupTintaEntry = () => {
    setGrupTinta([
      ...grupTinta,
      {
        id: generateId(),
        name: '',
        cnp: '',
        date: selectedDates[0] || new Date().toISOString().split('T')[0],
      },
    ]);
  };

  const updateGrupTintaEntry = (id: string, field: keyof GrupTintaEntry, value: string) => {
    setGrupTinta(grupTinta.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  };

  const removeGrupTintaEntry = (id: string) => {
    setGrupTinta(grupTinta.filter((g) => g.id !== id));
  };

  const verifyTitleWithAI = async () => {
    if (!title.trim()) return;

    setIsVerifyingTitle(true);
    setTitleVerificationResult(null);

    try {
      const response = await fetch('/api/ai/verify-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          activityType,
          description,
        }),
      });

      const data = await response.json();
      setTitleVerificationResult(data.result || data.error);
    } catch (error) {
      setTitleVerificationResult('Eroare la verificarea titlului');
    } finally {
      setIsVerifyingTitle(false);
    }
  };

  const handleSave = () => {
    const activities: Activity[] = selectedDates.map((date) => ({
      id: initialActivity?.id || generateId(),
      date,
      expertId,
      expertName,
      hours: parseFloat(hours) || 8,
      activityType,
      title,
      description,
      deliverables,
      location,
      grupTinta,
      createdAt: initialActivity?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    onSave(activities);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {initialActivity ? 'Editare Activitate' : 'Adăugare Activitate'}
        </CardTitle>
        {selectedDates.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {selectedDates.length === 1
              ? `Data: ${formatDateRo(selectedDates[0])}`
              : `${selectedDates.length} zile selectate`}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="hours">Ore lucrate</FieldLabel>
            <Input
              id="hours"
              type="number"
              min="0.5"
              max="12"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="activityType">Tip Activitate</FieldLabel>
            <Select value={activityType} onValueChange={(v) => setActivityType(v as ActivityType)}>
              <SelectTrigger id="activityType">
                <SelectValue placeholder="Selectează tipul" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="location">Locație</FieldLabel>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger id="location">
                <SelectValue placeholder="Selectează locația" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Birou">Birou</SelectItem>
                <SelectItem value="Teren">Teren</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Școală">Școală</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="title">Titlu Activitate</FieldLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={verifyTitleWithAI}
                disabled={isVerifyingTitle || !title.trim()}
              >
                {isVerifyingTitle ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Verificare...
                  </>
                ) : (
                  'Verifică cu AI'
                )}
              </Button>
            </div>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titlul activității..."
            />
            {titleVerificationResult && (
              <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded">
                {titleVerificationResult}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="description">Descriere</FieldLabel>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrierea detaliată a activității..."
              rows={4}
            />
          </Field>
        </FieldGroup>

        {/* Deliverables Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Livrabile</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-1" />
              Încarcă fișiere
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
            />
          </div>

          {deliverables.length > 0 && (
            <div className="space-y-2">
              {deliverables.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-2 bg-muted rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[200px]">{d.fileName}</span>
                    <span className="text-xs text-muted-foreground">
                      ({formatFileSize(d.fileSize)})
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDeliverable(d.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Grup Tinta Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Grup Țintă</Label>
            <Button type="button" variant="outline" size="sm" onClick={addGrupTintaEntry}>
              Adaugă persoană
            </Button>
          </div>

          {grupTinta.length > 0 && (
            <div className="space-y-3">
              {grupTinta.map((entry) => (
                <div key={entry.id} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <Input
                    placeholder="Nume"
                    value={entry.name}
                    onChange={(e) => updateGrupTintaEntry(entry.id, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="CNP"
                    value={entry.cnp}
                    onChange={(e) => updateGrupTintaEntry(entry.id, 'cnp', e.target.value)}
                    className="w-36"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeGrupTintaEntry(entry.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Anulează
          </Button>
          <Button type="button" onClick={handleSave} disabled={!title.trim() || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Se salvează...
              </>
            ) : initialActivity ? 'Salvează modificările' : 'Adaugă activitate'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

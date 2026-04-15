'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle2,
  FileText,
  Users,
  Settings,
  ArrowRight,
  Bot,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useActivities, useExperts, useApiKey } from '@/hooks/use-supabase-data';
import { UserMenu } from '@/components/user-menu';

export default function HomePage() {
  const [localApiKey, setLocalApiKey] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Supabase hooks
  const { activities, isLoading: activitiesLoading } = useActivities();
  const { experts, isLoading: expertsLoading } = useExperts();
  const { apiKey, setApiKey, isLoading: apiKeyLoading } = useApiKey();

  useEffect(() => {
    if (apiKey) {
      setLocalApiKey(apiKey);
    }
  }, [apiKey]);

  const handleSaveSettings = async () => {
    try {
      await setApiKey(localApiKey);
      setSettingsOpen(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const totalActivities = activities.length;
  const totalExperts = experts.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">PEO 302141</h1>
                <p className="text-sm text-muted-foreground">Sistem Raportare (Supabase)</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Setări Globale</DialogTitle>
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
                      Cheia API este necesară pentru toate funcțiile AI (generare rapoarte,
                      verificare documente, asistent Ramona)
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

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">
            Sistem de Raportare și Verificare
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Gestionați pontajele, rapoartele de activitate și verificați conformitatea
            documentelor pentru proiectul PEO 302141
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/expert">
              <Button size="lg" className="w-full sm:w-auto">
                <Calendar className="h-5 w-5 mr-2" />
                Dashboard Expert
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/pm">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Dashboard PM
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Funcționalități</h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Expert Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Pontaj Calendar
                </CardTitle>
                <CardDescription>
                  Selectați multiple zile și înregistrați activitățile rapid
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>- Selecție multiplă de zile</li>
                  <li>- Urmărire ore pe activitate</li>
                  <li>- Încărcare livrabile</li>
                  <li>- Gestiune Grup Țintă</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Generare Rapoarte
                </CardTitle>
                <CardDescription>
                  Rapoarte de activitate generate automat cu AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>- Generare cu Claude AI</li>
                  <li>- Export în format Word</li>
                  <li>- Format conform PEO</li>
                  <li>- Editare manuală</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Verificare Pontaj
                </CardTitle>
                <CardDescription>
                  Încărcare și verificare pontaj Excel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>- Import Excel automat</li>
                  <li>- Verificare ore</li>
                  <li>- Marcare conformitate</li>
                  <li>- Raportare probleme</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Comparare Documente
                </CardTitle>
                <CardDescription>
                  Comparare automată pontaj vs raport activitate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>- Analiză cu AI</li>
                  <li>- Detectare discrepanțe</li>
                  <li>- Verificare titluri livrabile</li>
                  <li>- Raport neconformități</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Analiză Cross-Expert
                </CardTitle>
                <CardDescription>
                  Detectare suprapuneri între experți
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>- Comparare rapoarte</li>
                  <li>- Detectare similarități</li>
                  <li>- Alertă suprapuneri</li>
                  <li>- Prevenire fraudă</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Asistent AI Ramona
                </CardTitle>
                <CardDescription>
                  Asistent inteligent pentru verificare
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>- Chat în limba română</li>
                  <li>- Răspunsuri la întrebări</li>
                  <li>- Sfaturi conformitate</li>
                  <li>- Asistență proceduri</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                {activitiesLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                ) : (
                  <p className="text-4xl font-bold text-primary">{totalActivities}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">Activități înregistrate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                {expertsLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                ) : (
                  <p className="text-4xl font-bold text-primary">{totalExperts}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">Experți configurați</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-4xl font-bold text-primary">302141</p>
                <p className="text-sm text-muted-foreground mt-1">Cod Proiect</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 px-4 bg-card">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Proiect PEO Raportare - Sistem de gestionare activități și verificare documente</p>
          <p className="mt-1 text-xs">Date stocate în Supabase</p>
        </div>
      </footer>
    </div>
  );
}

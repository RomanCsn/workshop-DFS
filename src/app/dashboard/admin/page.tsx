"use client";

import Dashboard from "@/layouts/dashboard";
import { authClient } from "@/lib/auth-client";
import { SectionCards } from "@/components/ui/section-cards";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar01 } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

// Fonction pour formater la date
function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Fonction pour formater le statut des leçons
function getStatusBadge(status: string) {
  const statusConfig = {
    PENDING: { label: 'En attente', variant: 'secondary' as const },
    IN_PROGRESS: { label: 'En cours', variant: 'default' as const },
    FINISHED: { label: 'Terminé', variant: 'outline' as const }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}

// Fonction pour formater le statut des billings
function getBillingSituationBadge(situation: string) {
  const situationConfig = {
    UNPAYED: { label: 'Non payé', variant: 'destructive' as const },
    PAYED: { label: 'Payé', variant: 'default' as const }
  };
  
  const config = situationConfig[situation as keyof typeof situationConfig] || situationConfig.UNPAYED;
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}

export default function Page() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLessons, setTotalLessons] = useState(0);
  
  // États pour les billings
  const [billings, setBillings] = useState<any[]>([]);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingPage, setBillingPage] = useState(1);
  const [totalBillings, setTotalBillings] = useState(0);
  
  const LESSONS_PER_PAGE = 4;
  const BILLINGS_PER_PAGE = 5;

  useEffect(() => {
    async function fetchData() {
      try {
        // Récupérer la session utilisateur côté client
        const session = await authClient.getSession();
        const user = session.data?.user;
        
        // Récupérer les leçons via l'API
        console.log('Récupération des leçons via API...');
        const response = await fetch(`/api/lessons?take=${LESSONS_PER_PAGE}&skip=${(currentPage - 1) * LESSONS_PER_PAGE}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const lessonsData = await response.json();
        console.log('Leçons récupérées:', lessonsData);
        
        setCurrentUser(user || null);
        setLessons(lessonsData.data || []);
        setFilteredLessons(lessonsData.data || []); // Initialiser avec toutes les leçons
        
        // Pour la pagination, nous devons récupérer le total des leçons
        const totalResponse = await fetch('/api/lessons?take=1000&skip=0');
        const totalData = await totalResponse.json();
        setTotalLessons(totalData.data?.length || 0);

        // Récupérer les billings via l'API
        console.log('Récupération des billings via API...');
        const billingResponse = await fetch(`/api/billing?take=${BILLINGS_PER_PAGE}&skip=${(billingPage - 1) * BILLINGS_PER_PAGE}&includeServices=true`);
        
        if (billingResponse.ok) {
          const billingData = await billingResponse.json();
          console.log('Billings récupérés:', billingData);
          setBillings(billingData.data || []);

          // Récupérer le total des billings
          const totalBillingResponse = await fetch('/api/billing?take=1000&skip=0');
          if (totalBillingResponse.ok) {
            const totalBillingData = await totalBillingResponse.json();
            setTotalBillings(totalBillingData.data?.length || 0);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setLessons([]);
        setFilteredLessons([]);
        setBillings([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [currentPage, billingPage]); // Recharger quand la page change

  // Fonction pour filtrer les leçons par date (côté serveur)
  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    setFilterLoading(true);
    setCurrentPage(1); // Remettre à la première page lors du filtrage
    
    try {
      // Créer la plage de dates (début et fin du jour sélectionné)
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      // Appeler l'API avec le filtrage par date (récupérer toutes les leçons de cette date)
      const response = await fetch(`/api/lessons?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&take=1000&skip=0`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const lessonsData = await response.json();
      console.log('Leçons filtrées par date:', lessonsData);
      
      const allFilteredLessons = lessonsData.data || [];
      setTotalLessons(allFilteredLessons.length);
      
      // Paginer les résultats côté client pour le filtrage par date
      const paginatedLessons = allFilteredLessons.slice(0, LESSONS_PER_PAGE);
      setFilteredLessons(paginatedLessons);
    } catch (error) {
      console.error('Erreur lors du filtrage des leçons:', error);
      setFilteredLessons([]);
      setTotalLessons(0);
    } finally {
      setFilterLoading(false);
    }
  };

  // Fonction pour réinitialiser le filtre (afficher toutes les leçons)
  const resetFilter = async () => {
    setSelectedDate(null);
    setFilterLoading(true);
    setCurrentPage(1);
    
    try {
      // Récupérer les leçons paginées
      const response = await fetch(`/api/lessons?take=${LESSONS_PER_PAGE}&skip=0`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const lessonsData = await response.json();
      setFilteredLessons(lessonsData.data || []);
      
      // Récupérer le total
      const totalResponse = await fetch('/api/lessons?take=1000&skip=0');
      const totalData = await totalResponse.json();
      setTotalLessons(totalData.data?.length || 0);
    } catch (error) {
      console.error('Erreur lors du rechargement des leçons:', error);
      setFilteredLessons([]);
      setTotalLessons(0);
    } finally {
      setFilterLoading(false);
    }
  };

  // Fonctions de pagination pour les leçons
  const totalPages = Math.ceil(totalLessons / LESSONS_PER_PAGE);
  
  // Fonctions de pagination pour les billings
  const totalBillingPages = Math.ceil(totalBillings / BILLINGS_PER_PAGE);
  
  const handleBillingPageChange = async (page: number) => {
    if (page === billingPage || page < 1 || page > totalBillingPages) return;
    
    setBillingPage(page);
    setBillingLoading(true);
    
    try {
      const response = await fetch(`/api/billing?take=${BILLINGS_PER_PAGE}&skip=${(page - 1) * BILLINGS_PER_PAGE}&includeServices=true`);
      if (response.ok) {
        const billingData = await response.json();
        setBillings(billingData.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du changement de page des billings:', error);
      setBillings([]);
    } finally {
      setBillingLoading(false);
    }
  };

  // Fonction pour générer les numéros de pages à afficher (pagination intelligente) pour les billings
  const getBillingVisiblePages = () => {
    const delta = 2; // Nombre de pages à afficher de chaque côté de la page courante
    const range = [];
    const rangeWithDots = [];

    // Toujours inclure la première page
    range.push(1);

    // Ajouter les pages autour de la page courante
    for (let i = Math.max(2, billingPage - delta); i <= Math.min(totalBillingPages - 1, billingPage + delta); i++) {
      range.push(i);
    }

    // Toujours inclure la dernière page si elle existe et est différente de la première
    if (totalBillingPages > 1) {
      range.push(totalBillingPages);
    }

    // Enlever les doublons et trier
    const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

    // Ajouter les ellipses si nécessaire
    let prev = 0;
    for (const page of uniqueRange) {
      if (page - prev > 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(page);
      prev = page;
    }

    return rangeWithDots;
  };
  
  const handlePageChange = async (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages) return;
    
    setCurrentPage(page);
    setFilterLoading(true);
    
    try {
      if (selectedDate) {
        // Si on a une date sélectionnée, on doit re-filtrer avec la nouvelle page
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        
        const response = await fetch(`/api/lessons?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&take=1000&skip=0`);
        const lessonsData = await response.json();
        const allFilteredLessons = lessonsData.data || [];
        
        // Paginer côté client
        const startIndex = (page - 1) * LESSONS_PER_PAGE;
        const endIndex = startIndex + LESSONS_PER_PAGE;
        setFilteredLessons(allFilteredLessons.slice(startIndex, endIndex));
      } else {
        // Pas de filtre, pagination normale côté serveur
        const response = await fetch(`/api/lessons?take=${LESSONS_PER_PAGE}&skip=${(page - 1) * LESSONS_PER_PAGE}`);
        const lessonsData = await response.json();
        setFilteredLessons(lessonsData.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du changement de page:', error);
      setFilteredLessons([]);
    } finally {
      setFilterLoading(false);
    }
  };

  // Fonction pour générer les numéros de pages à afficher (pagination intelligente)
  const getVisiblePages = () => {
    const delta = 2; // Nombre de pages à afficher de chaque côté de la page courante
    const range = [];
    const rangeWithDots = [];

    // Toujours inclure la première page
    range.push(1);

    // Ajouter les pages autour de la page courante
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    // Toujours inclure la dernière page si elle existe et est différente de la première
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Enlever les doublons et trier
    const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

    // Ajouter les ellipses si nécessaire
    let prev = 0;
    for (const page of uniqueRange) {
      if (page - prev > 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(page);
      prev = page;
    }

    return rangeWithDots;
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  // Adapter le type de l'utilisateur pour le Dashboard
  const user = currentUser ? {
    ...currentUser,
    role: currentUser.role as any
  } : null;

  return (
    <Dashboard user={user}>
      <div className="w-full space-y-6 flex-1">
        <div className="w-full">
          <SectionCards />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <div className="w-full">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">
                  Leçons
                  {filterLoading && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      (Chargement...)
                    </span>
                  )}
                </h2>
                {selectedDate && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Filtré par : {formatDate(selectedDate)}
                    </span>
                    <button
                      onClick={resetFilter}
                      disabled={filterLoading}
                      className="text-xs text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
                    >
                      Voir toutes
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className={`transition-opacity duration-200 ${filterLoading ? 'opacity-50' : 'opacity-100'}`}>
              <Table>
                <TableCaption>
                  {selectedDate 
                    ? `Leçons du ${formatDate(selectedDate)} (${totalLessons} leçons - Page ${currentPage}/${totalPages})`
                    : `Liste des dernières leçons (${totalLessons} leçons - Page ${currentPage}/${totalPages})`
                  }
                </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Moniteur</TableHead>
                  <TableHead>Cheval</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="max-w-[200px]">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLessons.length > 0 ? (
                  filteredLessons.map((lesson: any) => (
                    <TableRow key={lesson.id}>
                      <TableCell className="font-medium">
                        {formatDate(lesson.date)}
                      </TableCell>
                      <TableCell>
                        {lesson.customer ? 
                          `${lesson.customer.firstName} ${lesson.customer.lastName}` : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        {lesson.monitor ? 
                          `${lesson.monitor.firstName} ${lesson.monitor.lastName}` : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        {lesson.horse?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(lesson.status)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={lesson.desc}>
                        {lesson.desc}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      {selectedDate 
                        ? `Aucune leçon trouvée pour le ${formatDate(selectedDate)}`
                        : 'Aucune leçon trouvée'
                      }
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Affichage de {Math.min((currentPage - 1) * LESSONS_PER_PAGE + 1, totalLessons)} à{' '}
                  {Math.min(currentPage * LESSONS_PER_PAGE, totalLessons)} sur {totalLessons} leçons
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || filterLoading}
                  >
                    Précédent
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {getVisiblePages().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                          ...
                        </span>
                      ) : (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page as number)}
                          disabled={filterLoading}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      )
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || filterLoading}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="w-full">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Calendrier</h2>
              <p className="text-sm text-muted-foreground">
                Cliquez sur une date pour filtrer les leçons
              </p>
            </div>
            <Calendar01 
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
            />
          </div>
        </div>
        
        {/* Table des billings */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">
                Facturations
                {billingLoading && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    (Chargement...)
                  </span>
                )}
              </h2>
            </div>
          </div>
          <div className={`transition-opacity duration-200 ${billingLoading ? 'opacity-50' : 'opacity-100'}`}>
            <Table>
              <TableCaption>
                Liste des facturations ({totalBillings} facturations - Page {billingPage}/{totalBillingPages})
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Montant total</TableHead>
                  <TableHead>Client</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billings.length > 0 ? (
                  billings.map((billing: any) => {
                    const totalAmount = billing.services?.reduce((sum: number, service: any) => sum + service.amount, 0) || 0;
                    return (
                      <TableRow key={billing.id}>
                        <TableCell className="font-medium">
                          {formatDate(billing.date)}
                        </TableCell>
                        <TableCell>
                          {getBillingSituationBadge(billing.situation)}
                        </TableCell>
                        <TableCell>
                          {billing.services?.length || 0} service(s)
                        </TableCell>
                        <TableCell>
                          {totalAmount.toFixed(2)} €
                        </TableCell>
                        <TableCell>
                          {billing.services && billing.services.length > 0 && billing.services[0].user ? 
                            `${billing.services[0].user.firstName} ${billing.services[0].user.lastName}` : 
                            'N/A'
                          }
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Aucune facturation trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination des billings */}
          {totalBillingPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Affichage de {Math.min((billingPage - 1) * BILLINGS_PER_PAGE + 1, totalBillings)} à{' '}
                {Math.min(billingPage * BILLINGS_PER_PAGE, totalBillings)} sur {totalBillings} facturations
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBillingPageChange(billingPage - 1)}
                  disabled={billingPage === 1 || billingLoading}
                >
                  Précédent
                </Button>
                
                <div className="flex items-center gap-1">
                  {getBillingVisiblePages().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-billing-${index}`} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={`billing-${page}`}
                        variant={page === billingPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleBillingPageChange(page as number)}
                        disabled={billingLoading}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBillingPageChange(billingPage + 1)}
                  disabled={billingPage === totalBillingPages || billingLoading}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Dashboard>
  );
}

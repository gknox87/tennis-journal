
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { useSport } from "@/context/SportContext";
import { useInjuryReports } from "@/hooks/useInjuryReports";
import { BodyMap } from "@/components/injury/BodyMap";
import { InjuryReportDialog } from "@/components/injury/InjuryReportDialog";
import { ActiveInjuryCard } from "@/components/injury/ActiveInjuryCard";
import { InjuryTimeline } from "@/components/injury/InjuryTimeline";
import { InjuryInsights } from "@/components/injury/InjuryInsights";
import { BodyRegion } from "@/types/injury";
import { Plus, AlertTriangle } from "lucide-react";

const InjuryTracker = () => {
  const { sport } = useSport();
  const {
    reports,
    isLoading,
    createReport,
    deleteReport,
    activeInjuries,
    frequentRegions,
  } = useInjuryReports();

  const [selectedRegion, setSelectedRegion] = useState<BodyRegion | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleRegionSelect = (region: BodyRegion) => {
    setSelectedRegion(region);
  };

  const handleReportInjury = () => {
    setShowDialog(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Header userProfile={null} />
      <div className="container mx-auto px-4 py-6 pb-24 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-orange-500" /> Injury Tracker
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Track and monitor injuries for {sport.shortName}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              onClick={handleReportInjury}
              size="lg"
              className="shadow-lg"
            >
              <Plus className="mr-2 h-5 w-5" /> Report Injury
            </Button>
          </div>
        </div>

        {reports.length === 0 && !selectedRegion ? (
          /* Empty state */
          <Card className="p-8 sm:p-12 text-center bg-gradient-to-r from-orange-50 to-red-50">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-orange-400 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Injuries Reported</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Tap on the body map to select an area and report your first injury.
            </p>
            <BodyMap
              onRegionSelect={(region) => {
                setSelectedRegion(region);
                setShowDialog(true);
              }}
              injuries={[]}
              selectedRegion={selectedRegion}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Body map */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <h2 className="text-sm font-semibold mb-3 text-center">Body Map</h2>
                <BodyMap
                  onRegionSelect={handleRegionSelect}
                  injuries={activeInjuries}
                  selectedRegion={selectedRegion}
                />
                {selectedRegion && (
                  <Button
                    onClick={handleReportInjury}
                    className="w-full mt-3"
                    size="sm"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Report Injury Here
                  </Button>
                )}
              </Card>
            </div>

            {/* Right column: Active injuries + tabs */}
            <div className="lg:col-span-2 space-y-4">
              {/* Active injuries */}
              {activeInjuries.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    Active Injuries ({activeInjuries.length})
                  </h2>
                  <div className="space-y-2">
                    {activeInjuries.slice(0, 5).map((injury) => (
                      <ActiveInjuryCard
                        key={injury.id}
                        injury={injury}
                        onDelete={deleteReport}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Tabs: History & Insights */}
              <Tabs defaultValue="insights" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="insights" className="flex-1">
                    Insights
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">
                    History
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="insights" className="mt-4">
                  <InjuryInsights
                    reports={reports}
                    frequentRegions={frequentRegions}
                  />
                </TabsContent>
                <TabsContent value="history" className="mt-4">
                  <InjuryTimeline reports={reports} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {/* Report dialog */}
        {selectedRegion && (
          <InjuryReportDialog
            open={showDialog}
            onOpenChange={setShowDialog}
            onSubmit={createReport}
            selectedRegion={selectedRegion}
          />
        )}
      </div>
    </div>
  );
};

export default InjuryTracker;

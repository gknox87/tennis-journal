
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Save } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ComparisonPanelProps {
  similarity: number;
  metrics: any;
  onSaveToJournal: () => void;
}

export const ComparisonPanel: React.FC<ComparisonPanelProps> = ({
  similarity,
  metrics,
  onSaveToJournal
}) => {
  return (
    <Collapsible defaultOpen className="mb-6">
      <Card className="bg-gradient-to-b from-white/60 via-white/40 to-white/10 backdrop-blur">
        <CollapsibleTrigger className="w-full">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Analysis Results
              <div className="text-sm font-normal text-gray-500">
                {similarity}% similarity to pro template
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-6">
              {/* Overall Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Performance</span>
                  <span className="text-sm text-gray-500">{similarity}%</span>
                </div>
                <Progress value={similarity} className="h-2" />
              </div>
              
              {/* Mini Chart */}
              <div>
                <h4 className="text-sm font-medium mb-2">Elbow Angle Comparison</h4>
                <div className="h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-gray-500">Chart visualization</span>
                </div>
              </div>
              
              {/* Action Button */}
              <Button 
                onClick={onSaveToJournal}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Save to Journal
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

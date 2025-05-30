
import { Match } from "@/types/match";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Trophy, Target, FileText, Clock } from "lucide-react";

interface MatchDetailViewProps {
  match: Match;
}

export const MatchDetailView = ({ match }: MatchDetailViewProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getResultColor = (isWin: boolean) => {
    return isWin 
      ? "from-green-500 to-emerald-600" 
      : "from-red-500 to-rose-600";
  };

  const getResultBg = (isWin: boolean) => {
    return isWin 
      ? "from-green-50 to-emerald-50" 
      : "from-red-50 to-rose-50";
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className={`overflow-hidden bg-gradient-to-br ${getResultBg(match.is_win)} border-2 ${match.is_win ? 'border-green-200' : 'border-red-200'} shadow-2xl`}>
        <div className={`h-2 bg-gradient-to-r ${getResultColor(match.is_win)}`} />
        <CardHeader className="pb-4 pt-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl bg-gradient-to-r ${getResultColor(match.is_win)} shadow-lg`}>
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                  vs {match.opponent_name}
                </CardTitle>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-5 w-5" />
                  <span className="text-lg font-medium">{formatDate(match.date)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center lg:items-end gap-3">
              <Badge 
                variant={match.is_win ? "default" : "destructive"}
                className={`text-lg font-bold px-6 py-2 ${
                  match.is_win 
                    ? "bg-green-500 hover:bg-green-600 text-white" 
                    : "bg-red-500 hover:bg-red-600 text-white"
                } shadow-lg`}
              >
                {match.is_win ? "VICTORY" : "DEFEAT"}
              </Badge>
              <div className="text-right">
                <p className="text-sm text-gray-500 font-medium">Final Score</p>
                <p className="text-3xl font-bold text-gray-800">{match.score}</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Match Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Match Info */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-2 border-white/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              Match Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-700">Date</span>
              </div>
              <span className="font-bold text-gray-800">{formatDate(match.date)}</span>
            </div>
            
            {match.court_type && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-700">Court Surface</span>
                </div>
                <span className="font-bold text-gray-800">{match.court_type}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-700">Result</span>
              </div>
              <Badge 
                variant={match.is_win ? "default" : "destructive"}
                className={`font-bold ${
                  match.is_win 
                    ? "bg-green-500 hover:bg-green-600 text-white" 
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {match.is_win ? "Win" : "Loss"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-2 border-white/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-100">
                <Trophy className="h-5 w-5 text-orange-600" />
              </div>
              Score Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 rounded-xl bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100">
              <div className="text-center">
                <p className="text-sm text-gray-600 font-medium mb-2">Final Score</p>
                <p className="text-4xl font-bold text-gray-800">{match.score}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes Section */}
      {match.notes && (
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-2 border-white/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-100">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              Match Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                {match.notes}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

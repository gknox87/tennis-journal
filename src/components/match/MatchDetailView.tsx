
import { Match } from "@/types/match";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Trophy, Target, FileText, Clock } from "lucide-react";
import { DEFAULT_SPORT_ID, SPORTS, type SupportedSportId } from "@/constants/sports";

interface MatchDetailViewProps {
  match: Match;
}

export const MatchDetailView = ({ match }: MatchDetailViewProps) => {
  const sport = (() => {
    const id = match.sport_id as SupportedSportId | undefined;
    if (id && SPORTS[id]) {
      return SPORTS[id];
    }
    return SPORTS[DEFAULT_SPORT_ID];
  })();

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
    <div className="space-y-4 sm:space-y-6">
      {/* Hero Section */}
      <Card className={`overflow-hidden bg-gradient-to-br ${getResultBg(match.is_win)} border-2 ${match.is_win ? 'border-green-200' : 'border-red-200'} shadow-xl`}>
        <div className={`h-1 sm:h-2 bg-gradient-to-r ${getResultColor(match.is_win)}`} />
        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 pt-6 sm:pt-8">
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Top row with icon and opponent name */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r ${getResultColor(match.is_win)} shadow-lg flex-shrink-0`}>
                <span className="text-2xl sm:text-3xl" aria-hidden>{sport.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-1 sm:mb-2 leading-tight">
                  {sport.terminology.matchLabel}: vs {match.opponent_name}
                </CardTitle>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="text-sm sm:text-lg font-medium truncate">{formatDate(match.date)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-xs font-medium text-gray-600">
                <span className="text-lg" aria-hidden>{sport.icon}</span>
                {sport.name}
              </span>
              {match.sport_name && (
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{match.sport_name}</span>
              )}
            </div>
            
            {/* Bottom row with result and score */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <Badge 
                variant={match.is_win ? "default" : "destructive"}
                className={`text-base sm:text-lg font-bold px-4 sm:px-6 py-2 w-fit ${
                  match.is_win 
                    ? "bg-green-500 hover:bg-green-600 text-white" 
                    : "bg-red-500 hover:bg-red-600 text-white"
                } shadow-lg`}
              >
                {match.is_win ? "VICTORY" : "DEFEAT"}
              </Badge>
              <div className="sm:text-right">
                <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1">Final Score</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">{match.score}</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Match Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Match Info */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/50">
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-blue-100 flex-shrink-0">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <span className="text-base sm:text-xl">{sport.terminology.matchLabel} Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <span className="font-medium text-gray-700 text-sm sm:text-base">Date</span>
              </div>
              <span className="font-bold text-gray-800 text-sm sm:text-base text-right ml-2">{formatDate(match.date)}</span>
            </div>
            
            {match.court_type && (
              <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                <span className="font-medium text-gray-700 text-sm sm:text-base">Venue Detail</span>
                </div>
                <span className="font-bold text-gray-800 text-sm sm:text-base text-right ml-2">{match.court_type}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                <span className="font-medium text-gray-700 text-sm sm:text-base">Result</span>
              </div>
              <Badge 
                variant={match.is_win ? "default" : "destructive"}
                className={`font-bold text-xs sm:text-sm ${
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
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/50">
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-orange-100 flex-shrink-0">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              </div>
              <span className="text-base sm:text-xl">{sport.terminology.matchLabel} Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="p-4 sm:p-6 rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-600 font-medium mb-2">Final Score</p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-800 break-all">{match.score}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes Section */}
      {match.notes && (
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/50">
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-indigo-100 flex-shrink-0">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
              </div>
              <span className="text-base sm:text-xl">Match Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="p-4 sm:p-6 rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap font-medium text-sm sm:text-base">
                {match.notes}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

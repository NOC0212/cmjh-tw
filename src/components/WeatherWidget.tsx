import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const API_KEY = "CWA-6AEC6F91-948A-464F-9DC1-AC1B8361153D";

const DISTRICTS = [
  { value: "中西區", label: "中西區" },
  { value: "東區", label: "東區" },
  { value: "南區", label: "南區" },
  { value: "北區", label: "北區" },
  { value: "安平區", label: "安平區" },
  { value: "安南區", label: "安南區" },
  { value: "永康區", label: "永康區" },
  { value: "歸仁區", label: "歸仁區" },
  { value: "新化區", label: "新化區" },
  { value: "左鎮區", label: "左鎮區" },
  { value: "玉井區", label: "玉井區" },
  { value: "楠西區", label: "楠西區" },
  { value: "南化區", label: "南化區" },
  { value: "仁德區", label: "仁德區" },
  { value: "關廟區", label: "關廟區" },
  { value: "龍崎區", label: "龍崎區" },
  { value: "官田區", label: "官田區" },
  { value: "麻豆區", label: "麻豆區" },
  { value: "佳里區", label: "佳里區" },
  { value: "西港區", label: "西港區" },
  { value: "七股區", label: "七股區" },
  { value: "將軍區", label: "將軍區" },
  { value: "學甲區", label: "學甲區" },
  { value: "北門區", label: "北門區" },
  { value: "新營區", label: "新營區" },
  { value: "後壁區", label: "後壁區" },
  { value: "白河區", label: "白河區" },
  { value: "東山區", label: "東山區" },
  { value: "六甲區", label: "六甲區" },
  { value: "下營區", label: "下營區" },
  { value: "柳營區", label: "柳營區" },
  { value: "鹽水區", label: "鹽水區" },
  { value: "善化區", label: "善化區" },
  { value: "大內區", label: "大內區" },
  { value: "山上區", label: "山上區" },
  { value: "新市區", label: "新市區" },
  { value: "安定區", label: "安定區" },
];

interface WeatherElement {
  elementName: string;
  time: Array<{
    startTime: string;
    endTime: string;
    elementValue: Array<{
      value: string;
      measures: string;
    }>;
  }>;
}

interface WeatherData {
  locationName: string;
  weatherElement: WeatherElement[];
}

export const WeatherWidget = () => {
  const [selectedDistrict, setSelectedDistrict] = useState("東區");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);

  const fetchWeather = async (district: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-079?Authorization=${API_KEY}&locationName=${encodeURIComponent(district)}`
      );
      const data = await response.json();
      
      if (data.success === "true" && data.records?.locations?.[0]?.location?.[0]) {
        setWeatherData(data.records.locations[0].location[0]);
      }
    } catch (error) {
      console.error("Failed to fetch weather:", error);
    } finally {
      setLoading(false);
    }
  };

  const autoDetectLocation = () => {
    setIsAutoDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          let detectedDistrict = "東區";
          
          // 台南市各區大致經緯度範圍判斷
          if (latitude >= 23.0 && latitude <= 23.05 && longitude >= 120.2 && longitude <= 120.25) {
            detectedDistrict = "中西區";
          } else if (latitude >= 22.98 && latitude <= 23.03 && longitude >= 120.2 && longitude <= 120.25) {
            detectedDistrict = "東區";
          } else if (latitude >= 22.95 && latitude <= 23.0 && longitude >= 120.18 && longitude <= 120.22) {
            detectedDistrict = "南區";
          } else if (latitude >= 23.01 && latitude <= 23.06 && longitude >= 120.18 && longitude <= 120.23) {
            detectedDistrict = "北區";
          } else if (latitude >= 22.99 && latitude <= 23.02 && longitude >= 120.15 && longitude <= 120.19) {
            detectedDistrict = "安平區";
          } else if (latitude >= 23.03 && latitude <= 23.08 && longitude >= 120.15 && longitude <= 120.22) {
            detectedDistrict = "安南區";
          } else if (latitude >= 23.02 && latitude <= 23.06 && longitude >= 120.23 && longitude <= 120.28) {
            detectedDistrict = "永康區";
          }
          
          setSelectedDistrict(detectedDistrict);
          setIsAutoDetecting(false);
        },
        () => {
          setIsAutoDetecting(false);
        }
      );
    }
  };

  useEffect(() => {
    fetchWeather(selectedDistrict);
  }, [selectedDistrict]);

  const getWeatherIcon = (wx: string) => {
    if (wx.includes("雨")) return <CloudRain className="h-8 w-8" />;
    if (wx.includes("雪")) return <CloudSnow className="h-8 w-8" />;
    if (wx.includes("雲") || wx.includes("陰")) return <Cloud className="h-8 w-8" />;
    return <Sun className="h-8 w-8" />;
  };

  const getElementValue = (elementName: string, timeIndex: number = 0) => {
    const element = weatherData?.weatherElement.find(e => e.elementName === elementName);
    return element?.time[timeIndex]?.elementValue?.[0]?.value || "N/A";
  };

  const getCurrentWeather = () => {
    if (!weatherData) return null;
    
    return {
      weather: getElementValue("Wx"),
      temp: getElementValue("T"),
      feelTemp: getElementValue("AT"),
      pop: getElementValue("PoP12h"),
      rh: getElementValue("RH"),
      ws: getElementValue("WS"),
      wd: getElementValue("WD"),
      ci: getElementValue("CI"),
      uvi: getElementValue("UVI"),
    };
  };

  const getDailyForecast = () => {
    if (!weatherData) return [];
    
    const wxElement = weatherData.weatherElement.find(e => e.elementName === "Wx");
    if (!wxElement) return [];
    
    // 每天取早上6點的資料作為代表
    const dailyData: any[] = [];
    const seenDates = new Set<string>();
    
    wxElement.time.forEach((timeSlot, index) => {
      const date = new Date(timeSlot.startTime);
      const dateKey = date.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
      
      if (!seenDates.has(dateKey) && dailyData.length < 3) {
        seenDates.add(dateKey);
        dailyData.push({
          date: dateKey,
          dayOfWeek: date.toLocaleDateString('zh-TW', { weekday: 'short' }),
          weather: getElementValue("Wx", index),
          maxTemp: getElementValue("MaxT", index),
          minTemp: getElementValue("MinT", index),
          pop: getElementValue("PoP12h", index),
          rh: getElementValue("RH", index),
        });
      }
    });
    
    return dailyData;
  };

  const current = getCurrentWeather();
  const forecast = getDailyForecast();

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            天氣資訊
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={autoDetectLocation}
            disabled={isAutoDetecting}
            className="gap-2"
          >
            <MapPin className="h-4 w-4" />
            自動定位
          </Button>
        </div>
        <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="選擇行政區" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {DISTRICTS.map((district) => (
              <SelectItem key={district.value} value={district.value}>
                臺南市{district.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        ) : current ? (
          <>
            {/* 當前天氣 */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">天氣現象</p>
                  <p className="text-xl font-semibold mb-3">{current.weather}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">溫度</p>
                      <p className="font-semibold">{current.temp}°C</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">體感溫度</p>
                      <p className="font-semibold">{current.feelTemp}°C</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">相對濕度</p>
                      <p className="font-semibold">{current.rh}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">降雨機率</p>
                      <p className="font-semibold">{current.pop}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">風速</p>
                      <p className="font-semibold">{current.ws} m/s</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">風向</p>
                      <p className="font-semibold">{current.wd}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">舒適度</p>
                      <p className="font-semibold">{current.ci}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">紫外線指數</p>
                      <p className="font-semibold">{current.uvi}</p>
                    </div>
                  </div>
                </div>
                <div className="text-primary ml-4">
                  {getWeatherIcon(current.weather)}
                </div>
              </div>
            </div>

            {/* 未來3天預報 */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground">未來3天預報</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {forecast.map((day, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs text-muted-foreground">{day.dayOfWeek}</p>
                        <p className="text-sm font-semibold">{day.date}</p>
                      </div>
                      <div className="text-primary">
                        {getWeatherIcon(day.weather)}
                      </div>
                    </div>
                    <p className="text-xs mb-2 truncate">{day.weather}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold">{day.minTemp}° ~ {day.maxTemp}°</span>
                      <span className="text-muted-foreground">
                        <Droplets className="h-3 w-3 inline" /> {day.pop}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground">無法取得天氣資訊</p>
        )}
      </CardContent>
    </Card>
  );
};

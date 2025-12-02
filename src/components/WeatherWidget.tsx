import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Thermometer } from 'lucide-react';

interface Weather {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated weather data (in production, use a real weather API)
    const fetchWeather = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setWeather({
          temp: 72,
          condition: 'Partly Cloudy',
          humidity: 65,
          windSpeed: 12,
        });
      } catch (error) {
        console.error('Weather fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const getWeatherIcon = (condition: string) => {
    if (condition.includes('Rain')) return <CloudRain className="w-8 h-8 text-accent" />;
    if (condition.includes('Cloud')) return <Cloud className="w-8 h-8 text-muted-foreground" />;
    return <Sun className="w-8 h-8 text-yellow-500" />;
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-4 animate-pulse">
        <div className="h-20 bg-muted/20 rounded-xl"></div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getWeatherIcon(weather.condition)}
          <div>
            <h3 className="text-3xl font-bold text-foreground">{weather.temp}°F</h3>
            <p className="text-sm text-muted-foreground">{weather.condition}</p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Thermometer className="w-4 h-4" />
            <span>{weather.humidity}% humidity</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Wind className="w-4 h-4" />
            <span>{weather.windSpeed} mph</span>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          Perfect weather for outdoor tasks today! ☀️
        </p>
      </div>
    </div>
  );
}

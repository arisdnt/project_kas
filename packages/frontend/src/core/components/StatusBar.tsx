import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/core/store/authStore';
import { useSocketStatus } from '@/core/hooks/useSocket';
import { config } from '@/core/config';
import {
  Wifi, WifiOff, Database, Radio, Clock, Calendar, User, Shield, Battery,
  Cpu, HardDrive
} from 'lucide-react';

type HealthStatus = {
  status: string;
  db?: { connected: boolean };
  socket?: { path: string; clients: number };
};

const API_BASE_URL = `${config.api.url}:${config.api.port}`;

export function StatusBar() {
  const { user } = useAuthStore();
  const { connected: wsConnected } = useSocketStatus();

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [apiReachable, setApiReachable] = useState<boolean | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const [batteryInfo, setBatteryInfo] = useState<{ level?: number; charging?: boolean }>({});

  // Online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Date/time tick
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Poll backend health
  useEffect(() => {
    let mounted = true;
    const fetchHealth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health/status`, { cache: 'no-store' });
        const ok = res.ok;
        const data: HealthStatus = ok ? await res.json() : { status: 'DOWN' };
        if (!mounted) return;
        setApiReachable(ok);
        setDbConnected(Boolean(data?.db?.connected));
      } catch (e) {
        if (!mounted) return;
        setApiReachable(false);
        setDbConnected(null);
      }
    };
    fetchHealth();
    const id = setInterval(fetchHealth, 10000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // Battery info if supported
  useEffect(() => {
    const nav: any = navigator as any;
    if (nav.getBattery) {
      nav.getBattery().then((bat: any) => {
        const update = () => setBatteryInfo({ level: bat.level, charging: bat.charging });
        update();
        bat.addEventListener('levelchange', update);
        bat.addEventListener('chargingchange', update);
      });
    }
  }, []);

  const timeStr = useMemo(
    () => now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    [now]
  );
  const dateStr = useMemo(
    () => now.toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }),
    [now]
  );

  const deviceMemory = (navigator as any).deviceMemory as number | undefined;
  const hardwareConcurrency = navigator.hardwareConcurrency;
  const platform = navigator.platform;

  return (
    <div className="w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-t border-gray-200 text-xs fixed bottom-0 left-0 right-0 z-40 shadow-sm">
      <div className="w-full px-1 sm:px-2 lg:px-3 py-1">
        <div
          className="grid grid-cols-12 gap-1 sm:gap-2"
        >
          {/* Internet */}
          <div className="col-span-6 sm:col-span-4 md:col-span-3 lg:col-span-2 xl:col-span-1 flex items-center gap-1 min-w-0">
            {isOnline ? (
              <Wifi className="h-3 w-3 text-green-600" />
            ) : (
              <WifiOff className="h-3 w-3 text-red-600" />
            )}
            <span className="truncate">
              <span className="text-emerald-600">Internet:</span>{' '}
              <span className={isOnline ? 'text-green-700' : 'text-red-700'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </span>
          </div>

          {/* API */}
          <div className="col-span-6 sm:col-span-4 md:col-span-3 lg:col-span-2 xl:col-span-1 flex items-center gap-1 min-w-0">
            <HardDrive className={`h-3 w-3 ${apiReachable ? 'text-green-600' : 'text-red-600'}`} />
            <span className="truncate">
              <span className="text-blue-600">API:</span>{' '}
              <span className={apiReachable ? 'text-green-700' : 'text-red-700'}>
                {apiReachable == null ? '—' : apiReachable ? 'OK' : 'DOWN'}
              </span>
            </span>
          </div>

          {/* DB */}
          <div className="col-span-6 sm:col-span-4 md:col-span-3 lg:col-span-2 xl:col-span-1 flex items-center gap-1 min-w-0">
            <Database className={`h-3 w-3 ${dbConnected ? 'text-green-600' : 'text-red-600'}`} />
            <span className="truncate">
              <span className="text-purple-600">DB:</span>{' '}
              <span className={dbConnected ? 'text-green-700' : 'text-red-700'}>
                {dbConnected == null ? '—' : dbConnected ? 'Connected' : 'Disconnected'}
              </span>
            </span>
          </div>

          {/* WebSocket */}
          <div className="col-span-6 sm:col-span-4 md:col-span-3 lg:col-span-2 xl:col-span-1 flex items-center gap-1 min-w-0">
            <Radio className={`h-3 w-3 ${wsConnected ? 'text-green-600' : 'text-red-600'}`} />
            <span className="truncate">
              <span className="text-orange-600">WS:</span>{' '}
              <span className={wsConnected ? 'text-green-700' : 'text-red-700'}>
                {wsConnected ? 'Connected' : 'Disconnected'}
              </span>
            </span>
          </div>

          {/* Date */}
          <div className="col-span-6 sm:col-span-4 md:col-span-3 lg:col-span-2 xl:col-span-1 flex items-center gap-1 min-w-0">
            <Calendar className="h-3 w-3 text-indigo-500" />
            <span className="truncate">
              <span className="text-indigo-600">Tanggal:</span> {dateStr}
            </span>
          </div>

          {/* Time */}
          <div className="col-span-6 sm:col-span-4 md:col-span-3 lg:col-span-2 xl:col-span-1 flex items-center gap-1 min-w-0">
            <Clock className="h-3 w-3 text-blue-500" />
            <span className="truncate">
              <span className="text-blue-600">Jam:</span> {timeStr} WIB
            </span>
          </div>

          {/* User */}
          <div className="col-span-6 sm:col-span-4 md:col-span-3 lg:col-span-2 xl:col-span-1 flex items-center gap-1 min-w-0">
            <User className="h-3 w-3 text-purple-500" />
            <span className="truncate">
              <span className="text-purple-600">User:</span> {user?.fullName || user?.username || '—'}
            </span>
          </div>

          {/* Role */}
          <div className="col-span-6 sm:col-span-4 md:col-span-3 lg:col-span-2 xl:col-span-1 flex items-center gap-1 min-w-0">
            <Shield className="h-3 w-3 text-teal-500" />
            <span className="truncate">
              <span className="text-teal-600">Role:</span> {user?.role || '—'}
            </span>
          </div>

          {/* Battery */}
          <div className="col-span-6 sm:col-span-4 md:col-span-3 lg:col-span-2 xl:col-span-1 flex items-center gap-1 min-w-0">
            <Battery className="h-3 w-3 text-green-500" />
            <span className="truncate">
              <span className="text-green-600">Battery:</span>{' '}
              {batteryInfo.level != null ? `${Math.round((batteryInfo.level as number) * 100)}%` : '—'}
              {batteryInfo.charging ? ' (chg)' : ''}
            </span>
          </div>

          {/* CPU Cores */}
          <div className="col-span-6 sm:col-span-4 md:col-span-3 lg:col-span-2 xl:col-span-1 flex items-center gap-1 min-w-0">
            <Cpu className="h-3 w-3 text-orange-500" />
            <span className="truncate">
              <span className="text-orange-600">CPU:</span> {hardwareConcurrency ?? '—'} core
            </span>
          </div>

          {/* Memory */}
          <div className="col-span-6 sm:col-span-4 md:col-span-3 lg:col-span-2 xl:col-span-1 flex items-center gap-1 min-w-0">
            <HardDrive className="h-4 w-4 text-cyan-500" />
            <span className="truncate">
              <span className="text-cyan-600">Memory:</span> {deviceMemory ? `${deviceMemory} GB` : '—'}
            </span>
          </div>

          {/* Platform */}
          <div className="col-span-6 sm:col-span-4 md:col-span-3 lg:col-span-2 xl:col-span-1 flex items-center gap-1 min-w-0">
            <HardDrive className="h-4 w-4 text-pink-500" />
            <span className="truncate">
              <span className="text-pink-600">Platform:</span> {platform}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

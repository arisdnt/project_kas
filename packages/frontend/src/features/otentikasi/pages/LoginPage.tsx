import { useState } from 'react';
import { useAuthStore } from '../../../core/store/authStore';
import { config } from '@/core/config';
import { Store, MapPin, Shield, Users, TrendingUp } from 'lucide-react';

import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';

interface LoginForm {
  username: string;
  password: string;
  tenantId: string;
}

export function LoginPage() {
  const [form, setForm] = useState<LoginForm>({
    username: '',
    password: '',
    tenantId: config.tenantId || 'default-tenant'
  });
  const [error, setError] = useState<string>('');
  const { login, isLoading } = useAuthStore();

  const handleQuickLogin = async (username: string, password: string) => {
    if (isLoading) return;
    setError('');
    setForm(prev => ({
      ...prev,
      username,
      password
    }));

    try {
      await login(username, password, form.tenantId);
    } catch (err: any) {
      setError(err.message || 'Login gagal');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.username || !form.password) {
      setError('Username dan password harus diisi');
      return;
    }

    try {
      await login(form.username, form.password, form.tenantId);
    } catch (err: any) {
      setError(err.message || 'Login gagal');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Kolom Kiri - Identitas Toko */}
      <div className="hidden lg:flex lg:w-3/4 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url(/bglogin-fixed.jpg)'}}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-blue-900/50" />
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          <div className="max-w-md">
            {/* Satu Card untuk semua konten identitas toko */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-8">
              {/* Logo dan Nama Toko */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Store className="w-6 h-6 text-blue-900" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{config.infoToko.nama}</h1>
                  <p className="text-blue-100 text-sm">Point of Sale System</p>
                </div>
              </div>

              {/* Informasi Toko */}
              <div className="flex items-start space-x-3 mb-6">
                <MapPin className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Alamat Toko</p>
                  <p className="text-blue-100 text-sm">{config.infoToko.alamat}</p>
                </div>
              </div>

              {/* Welcome Lines */}
              {config.ui?.login?.welcomeLines?.length && (
                <div className="space-y-2 mb-6">
                  {config.ui.login.welcomeLines.map((line, idx) => (
                    <p key={idx} className="text-blue-100 text-sm leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Keamanan Terjamin</p>
                    <p className="text-blue-200 text-xs">Data terenkripsi dan aman</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Multi-User</p>
                    <p className="text-blue-200 text-xs">Akses untuk berbagai peran</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Real-time Analytics</p>
                    <p className="text-blue-200 text-xs">Laporan penjualan langsung</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
      </div>

      {/* Kolom Kanan - Form Login */}
       <div className="flex-1 lg:w-1/4 flex items-center justify-center px-6 py-12 relative bg-white">
        <div className="w-full max-w-md relative z-10">
          <div className="space-y-6">
             <div className="space-y-2 text-center">
               <h1 className="text-3xl font-bold text-gray-900">
                 {config.ui?.login?.heading ?? 'Masuk ke Sistem POS'}
               </h1>
               <p className="text-sm text-gray-600">
                 {config.ui?.login?.subheading ?? 'Silakan masukkan kredensial Anda'}
               </p>
             </div>
             
             <form onSubmit={handleSubmit} className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="username">Username</Label>
                 <Input
                   id="username"
                   name="username"
                   type="text"
                   placeholder="Masukkan username"
                   value={form.username}
                   onChange={handleChange}
                   disabled={isLoading}
                   required
                   className="h-11"
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="password">Password</Label>
                 <Input
                   id="password"
                   name="password"
                   type="password"
                   placeholder="Masukkan password"
                   value={form.password}
                   onChange={handleChange}
                   disabled={isLoading}
                   required
                   className="h-11"
                 />
               </div>

               {error && (
                 <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                   <p className="text-sm text-red-700">{error}</p>
                 </div>
               )}

               <Button
                 type="submit"
                 disabled={isLoading}
                 className="w-full h-11 text-base font-medium"
               >
               {isLoading ? 'Memproses...' : 'Masuk'}
              </Button>

              <div className="space-y-2">
                <p className="text-center text-xs text-gray-500">Fast Login (Mode Pengembangan)</p>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    className="w-full h-10 text-sm"
                    onClick={() => handleQuickLogin('god', 'god123')}
                  >
                    Login sebagai God
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    className="w-full h-10 text-sm"
                    onClick={() => handleQuickLogin('kindrut', '123123123')}
                  >
                    Login sebagai Admin (Level 2)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    className="w-full h-10 text-sm"
                    onClick={() => handleQuickLogin('admintoko', '123123123')}
                  >
                    Login sebagai Admin Toko
                  </Button>
                </div>
              </div>
             </form>

             {config.ui?.login?.footerText && (
               <p className="text-center text-xs text-gray-500 mt-6">
                 {config.ui.login.footerText}
               </p>
             )}
           </div>

          {/* Mobile Store Info */}
          <div className="lg:hidden mt-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Store className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {config.infoToko.nama}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{config.infoToko.alamat}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

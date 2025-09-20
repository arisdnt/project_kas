import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { useToast } from '@/core/hooks/use-toast';
import { useAuthStore } from '@/core/store/authStore';
import { usePerpesananStore } from '@/features/perpesanan/store/perpesananStore';
import { ConversationList } from '@/features/perpesanan/components/ConversationList';
import { ConversationHeader } from '@/features/perpesanan/components/ConversationHeader';
import { ChatWindow } from '@/features/perpesanan/components/ChatWindow';
import { MessageComposer } from '@/features/perpesanan/components/MessageComposer';
import { NewMessageDialog } from '@/features/perpesanan/components/NewMessageDialog';
import { usePerpesananRealtime } from '@/features/perpesanan/hooks/usePerpesananRealtime';
import { PerpesananPrioritas } from '@/features/perpesanan/types/perpesanan';

export function PerpesananPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPartnerId = searchParams.get('partner') ?? undefined;
  const { toast } = useToast();
  const [newMessageOpen, setNewMessageOpen] = useState(false);

  const userId = useAuthStore((state) => state.user?.id);

  const conversations = usePerpesananStore((state) => state.conversations);
  const conversationsLoading = usePerpesananStore((state) => state.conversationsLoading);
  const conversationSearch = usePerpesananStore((state) => state.conversationSearch);
  const setConversationSearch = usePerpesananStore((state) => state.setConversationSearch);
  const fetchInitialData = usePerpesananStore((state) => state.fetchInitialData);
  const refreshConversations = usePerpesananStore((state) => state.refreshConversations);
  const refreshStats = usePerpesananStore((state) => state.refreshStats);
  const refreshUnread = usePerpesananStore((state) => state.refreshUnread);
  const conversationsInitialized = usePerpesananStore((state) => state.conversationsInitialized);
  const activePartnerId = usePerpesananStore((state) => state.activePartnerId);
  const setActivePartner = usePerpesananStore((state) => state.setActivePartner);
  const loadConversation = usePerpesananStore((state) => state.loadConversation);
  const messagesByPartner = usePerpesananStore((state) => state.messagesByPartner);
  const messagesLoadingMap = usePerpesananStore((state) => state.messagesLoading);
  const sendMessage = usePerpesananStore((state) => state.sendMessage);
  const markConversationAsRead = usePerpesananStore((state) => state.markConversationAsRead);
  const unreadByPartner = usePerpesananStore((state) => state.unreadByPartner);
  const stats = usePerpesananStore((state) => state.stats);
  const statsLoading = usePerpesananStore((state) => state.statsLoading);

  usePerpesananRealtime();

  useEffect(() => {
    if (!conversationsInitialized) {
      fetchInitialData().catch((error: any) => {
        toast({ title: 'Gagal memuat perpesanan', description: error?.message || 'Periksa koneksi dan coba ulangi.', variant: 'destructive' });
      });
    }
  }, [conversationsInitialized, fetchInitialData, toast]);

  useEffect(() => {
    if (initialPartnerId && initialPartnerId !== activePartnerId) {
      setActivePartner(initialPartnerId).catch(() => {});
    }
  }, [initialPartnerId, activePartnerId, setActivePartner]);

  const activeConversation = useMemo(() => {
    if (!activePartnerId) {
      return undefined;
    }
    return conversations.find((item) => item.partner.id === activePartnerId);
  }, [conversations, activePartnerId]);

  const messages = activePartnerId ? (messagesByPartner[activePartnerId] ?? []) : [];
  const messagesLoading = activePartnerId ? (messagesLoadingMap[activePartnerId] ?? false) : false;
  const currentUserId = userId != null ? String(userId) : undefined;
  const unreadCountActive = activePartnerId ? unreadByPartner[activePartnerId] ?? 0 : 0;

  const handleSelectConversation = async (partnerId: string) => {
    setSearchParams({ partner: partnerId });
    try {
      await setActivePartner(partnerId);
    } catch (error: any) {
      toast({ title: 'Gagal membuka percakapan', description: error?.message || 'Terjadi kesalahan saat membuka percakapan.', variant: 'destructive' });
    }
  };

  const handleSendMessage = async (payload: { pesan: string; prioritas: PerpesananPrioritas }) => {
    if (!activePartnerId) {
      toast({ title: 'Pilih penerima', description: 'Silakan pilih percakapan sebelum mengirim pesan.', variant: 'destructive' });
      return;
    }
    try {
      await sendMessage(activePartnerId, payload);
      toast({ title: 'Pesan terkirim' });
      await markConversationAsRead(activePartnerId);
      await Promise.all([refreshConversations(), refreshUnread(), refreshStats()]);
    } catch (error: any) {
      toast({ title: 'Gagal mengirim pesan', description: error?.message || 'Terjadi kesalahan saat mengirim pesan.', variant: 'destructive' });
      throw error;
    }
  };

  const handleMarkAsRead = async () => {
    if (!activePartnerId) {
      return;
    }
    await markConversationAsRead(activePartnerId);
    await refreshUnread();
  };

  const handleRefreshConversation = async () => {
    if (activePartnerId) {
      await loadConversation(activePartnerId, { force: true });
      await markConversationAsRead(activePartnerId);
    }
    await Promise.all([refreshConversations(), refreshStats(), refreshUnread()]);
  };

  const handleSendNewMessage = async (partnerId: string, payload: { pesan: string; prioritas: PerpesananPrioritas }) => {
    try {
      await setActivePartner(partnerId);
      setSearchParams({ partner: partnerId });
      await sendMessage(partnerId, payload);
      toast({ title: 'Pesan terkirim' });
      await Promise.all([markConversationAsRead(partnerId), refreshConversations(), refreshStats(), refreshUnread()]);
    } catch (error: any) {
      toast({ title: 'Gagal mengirim pesan', description: error?.message || 'Terjadi kesalahan saat mengirim pesan.', variant: 'destructive' });
      throw error;
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500">Total Pesan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-gray-900">{statsLoading ? '...' : stats?.total_pesan ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Semua pesan dalam tenant Anda.</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-blue-600">Belum Dibaca</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-blue-700">{statsLoading ? '...' : stats?.pesan_belum_dibaca ?? 0}</p>
            <p className="text-xs text-blue-700/80 mt-1">Segera tindak lanjuti pesan masuk.</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500">Pesan Minggu Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-gray-900">{statsLoading ? '...' : stats?.pesan_minggu_ini ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Total pesan yang tercatat minggu ini.</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500">Prioritas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(['rendah', 'normal', 'tinggi', 'urgent'] as const).map((level) => (
                <div key={level} className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-3 py-2">
                  <span className="font-medium capitalize text-gray-600">{level}</span>
                  <span className="text-gray-800 font-semibold">
                    {statsLoading ? '...' : stats?.pesan_per_prioritas?.[level] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex min-h-0 flex-1 gap-4 lg:flex-row flex-col">
        <div className="h-[380px] shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white lg:h-full lg:w-[320px]">
          <ConversationList
            conversations={conversations}
            loading={conversationsLoading}
            activePartnerId={activePartnerId}
            search={conversationSearch}
            onSearchChange={setConversationSearch}
            onSelect={handleSelectConversation}
            onCompose={() => setNewMessageOpen(true)}
          />
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
          <ConversationHeader
            partnerName={activeConversation?.partner.nama}
            partnerUsername={activeConversation?.partner.username}
            unreadCount={unreadCountActive}
            onMarkAsRead={handleMarkAsRead}
            onRefresh={handleRefreshConversation}
            loading={messagesLoading}
          />
          <ChatWindow
            messages={messages}
            currentUserId={currentUserId}
            partnerName={activeConversation?.partner.nama || activeConversation?.partner.username}
            loading={messagesLoading}
          />
          <MessageComposer
            onSend={handleSendMessage}
            disabled={!activePartnerId}
            isPartnerSelected={Boolean(activePartnerId)}
          />
        </div>
      </div>

      <NewMessageDialog
        open={newMessageOpen}
        onOpenChange={setNewMessageOpen}
        onSend={handleSendNewMessage}
      />
    </div>
  );
}

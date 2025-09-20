export type PerpesananStatus = 'dikirim' | 'terkirim' | 'dibaca' | 'dibalas' | 'dihapus';

export type PerpesananPrioritas = 'rendah' | 'normal' | 'tinggi' | 'urgent';

export type PerpesananMessageType = 'personal' | 'grup' | 'sistem';

export interface PerpesananUser {
  id: string;
  nama: string;
  username: string;
  avatar_url?: string | null;
}

export interface PerpesananMessage {
  id: string;
  tenant_id: string;
  toko_id?: string | null;
  pengirim_id: string;
  penerima_id: string;
  subjek?: string | null;
  pesan: string;
  status: PerpesananStatus;
  prioritas: PerpesananPrioritas;
  tipe_pesan?: PerpesananMessageType;
  parent_id?: string | null;
  lampiran_url?: string | null;
  dibaca_pada?: string | null;
  dibalas_pada?: string | null;
  dibuat_pada: string;
  diperbarui_pada: string;
  pengirim?: PerpesananUser;
  penerima?: PerpesananUser;
}

export interface PerpesananStats {
  total_pesan: number;
  pesan_belum_dibaca: number;
  pesan_hari_ini: number;
  pesan_minggu_ini: number;
  pesan_bulan_ini: number;
  pesan_per_prioritas: {
    rendah: number;
    normal: number;
    tinggi: number;
    urgent: number;
  };
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiPaginatedEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ConversationSummary {
  partner: PerpesananUser;
  lastMessage: PerpesananMessage;
  unreadCount: number;
  isUnread: boolean;
}

export interface ConversationHistory {
  messages: PerpesananMessage[];
  total: number;
}

export interface SendMessagePayload {
  penerima_id: string;
  pesan: string;
  prioritas?: PerpesananPrioritas;
}

export interface ReplyMessagePayload {
  pesan: string;
}

export interface MarkAsReadPayload {
  pesan_ids: string[];
}

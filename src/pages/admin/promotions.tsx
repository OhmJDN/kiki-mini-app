import { useState, useEffect } from 'react';
import { salonService } from '@/services/salon-service';
import type { Promotion, Service } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Tag, 
  Check, 
  X
} from 'lucide-react';

export function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountText, setDiscountText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [month, setMonth] = useState('ตุลาคม 2569 (October 2026)');
  const [validUntil, setValidUntil] = useState('2026-10-31');
  const [badge, setBadge] = useState('🔥 Monthly Highlight');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [termsText, setTermsText] = useState('จำกัด 30 สิทธิ์ต่อสาขา\nต้องจองล่วงหน้าผ่าน LINE Mini App');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [promos, srvs] = await Promise.all([
        salonService.getPromotions(),
        salonService.getServices(),
      ]);
      setPromotions(promos);
      setServices(srvs);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setDiscountText('ลด 20%');
    setImageUrl('https://kikibeautyspace.com/wp-content/uploads/2025/01/2.jpg');
    setMonth('ตุลาคม 2569 (October 2026)');
    setValidUntil('2026-10-31');
    setBadge('🔥 Monthly Highlight');
    setSelectedServiceIds([]);
    setTermsText('จำกัด 30 สิทธิ์ต่อสาขา\nต้องจองล่วงหน้าผ่าน LINE Mini App');
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (promo: Promotion) => {
    setEditingId(promo.id);
    setTitle(promo.title);
    setDescription(promo.description);
    setDiscountText(promo.discount_text);
    setImageUrl(promo.image_url);
    setMonth(promo.month);
    setValidUntil(promo.valid_until);
    setBadge(promo.badge || '');
    setSelectedServiceIds(promo.service_ids || []);
    setTermsText((promo.terms || []).join('\n'));
    setIsActive(promo.is_active);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !discountText.trim()) return;

    setIsSubmitting(true);
    try {
      const terms = termsText
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean);

      if (editingId) {
        await salonService.updatePromotion(editingId, {
          title,
          description,
          discount_text: discountText,
          image_url: imageUrl,
          month,
          valid_until: validUntil,
          badge,
          service_ids: selectedServiceIds,
          terms,
          is_active: isActive,
        });
      } else {
        await salonService.createPromotion({
          title,
          description,
          discount_text: discountText,
          image_url: imageUrl,
          month,
          valid_until: validUntil,
          badge,
          service_ids: selectedServiceIds,
          terms,
          is_active: isActive,
        });
      }

      setShowModal(false);
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('คุณต้องการลบโปรโมชั่นนี้ใช่หรือไม่?')) return;
    await salonService.deletePromotion(id);
    await loadData();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1b1c1c]">จัดการโปรโมชั่น (Promotion Management)</h1>
          <p className="text-sm text-[#636260] mt-1">
            สร้าง จัดการ และเปิด-ปิดโปรโมชั่นประจำเดือนสำหรับแสดงบนหน้าแท็บโปรโมชั่นใน LINE Mini App
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-[#7a5646] hover:bg-[#634335] text-white rounded-full text-xs font-semibold px-5 h-10 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          สร้างโปรโมชั่นใหม่
        </Button>
      </div>

      {/* Promotions List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-card animate-pulse border border-[#d4c3bc]/60" />
          ))}
        </div>
      ) : promotions.length === 0 ? (
        <Card className="p-12 text-center bg-card border-dashed border-[#d4c3bc] rounded-3xl">
          <Tag className="w-12 h-12 text-[#7a5646]/40 mx-auto mb-2" />
          <h3 className="font-serif font-bold text-lg text-[#1b1c1c]">ยังไม่มีรายการโปรโมชั่น</h3>
          <p className="text-xs text-[#636260] mt-1 mb-4">กดปุ่มสร้างโปรโมชั่นเพื่อเริ่มเพิ่มข้อเสนอพิเศษประจำเดือน</p>
          <Button onClick={openCreateModal} className="bg-[#7a5646] text-white rounded-full text-xs">
            เพิ่มโปรโมชั่นแรก
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {promotions.map((promo) => (
            <Card
              key={promo.id}
              className={`rounded-3xl border bg-card overflow-hidden hover:shadow-md transition-all flex flex-col justify-between ${
                promo.is_active ? 'border-[#d4c3bc]/70' : 'border-dashed border-gray-300 opacity-60'
              }`}
            >
              <div>
                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <img src={promo.image_url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 flex gap-1">
                    {promo.badge && (
                      <Badge className="bg-[#7a5646] text-white text-[10px] py-0 px-2 border-0">
                        {promo.badge}
                      </Badge>
                    )}
                    <Badge className={promo.is_active ? 'bg-emerald-600 text-white text-[10px]' : 'bg-gray-500 text-white text-[10px]'}>
                      {promo.is_active ? 'เปิดใช้งาน' : 'ปิดการแสดงผล'}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-300">
                    {promo.discount_text}
                  </div>
                </div>

                {/* Body */}
                <CardContent className="p-5 space-y-2">
                  <h3 className="font-serif font-bold text-base text-[#1b1c1c] leading-snug">
                    {promo.title}
                  </h3>
                  <p className="text-xs text-[#636260] line-clamp-2">
                    {promo.description}
                  </p>
                  <p className="text-[11px] text-[#7a5646] font-medium pt-1">
                    📅 ประจำรอบ: {promo.month} (ถึง {promo.valid_until})
                  </p>
                </CardContent>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-[#f5f0ea]/50 border-t border-[#d4c3bc]/40 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(promo)}
                  className="border-[#d4c3bc] text-xs rounded-xl h-8 text-[#7a5646] hover:bg-white"
                >
                  <Edit className="w-3.5 h-3.5 mr-1" /> แก้ไข
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(promo.id)}
                  className="text-rose-600 hover:bg-rose-50 text-xs rounded-xl h-8"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> ลบ
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#fcf9f8] w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#d4c3bc] my-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#d4c3bc]/50 mb-4">
              <h3 className="font-serif text-xl font-bold text-[#1b1c1c]">
                {editingId ? 'แก้ไขโปรโมชั่น' : 'สร้างโปรโมชั่นใหม่'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-full text-[#636260] hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1b1c1c] mb-1">ชื่อโปรโมชั่น (Title) *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น KIKI Exclusive October Glow: Balayage & Head Spa"
                  className="bg-card border-[#d4c3bc] rounded-xl text-xs h-10"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1b1c1c] mb-1">คำอธิบายรายละเอียดโปรโมชั่น</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-card border border-[#d4c3bc] rounded-xl text-xs p-3 focus:outline-none focus:ring-1 focus:ring-[#7a5646]"
                  placeholder="รายละเอียด ส่วนลด ของแถม หรือบริการพิเศษ..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1b1c1c] mb-1">ข้อความส่วนลด / ราคา *</label>
                  <Input
                    value={discountText}
                    onChange={(e) => setDiscountText(e.target.value)}
                    placeholder="เช่น ลด 25% หรือ พิเศษ ฿1,290"
                    className="bg-card border-[#d4c3bc] rounded-xl text-xs h-10"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1b1c1c] mb-1">ป้ายกำกับ (Badge)</label>
                  <Input
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="เช่น 🔥 Hot Deal หรือ ✨ Best Seller"
                    className="bg-card border-[#d4c3bc] rounded-xl text-xs h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1b1c1c] mb-1">ประจำเดือน / รอบโปรโมชั่น</label>
                  <Input
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    placeholder="เช่น ตุลาคม 2569 (October 2026)"
                    className="bg-card border-[#d4c3bc] rounded-xl text-xs h-10"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1b1c1c] mb-1">วันหมดอายุ (Valid Until)</label>
                  <Input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="bg-card border-[#d4c3bc] rounded-xl text-xs h-10"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1b1c1c] mb-1">URL รูปภาพโปรโมชั่น</label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-card border-[#d4c3bc] rounded-xl text-xs h-10"
                />
              </div>

              {/* Service Mapping */}
              <div>
                <label className="block font-semibold text-[#1b1c1c] mb-1.5">บริการที่ร่วมรายการ (คลิกเพื่อเลือก)</label>
                <div className="max-h-36 overflow-y-auto p-2 bg-card border border-[#d4c3bc] rounded-xl space-y-1">
                  {services.map((s) => {
                    const isSelected = selectedServiceIds.includes(s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedServiceIds(selectedServiceIds.filter((id) => id !== s.id));
                          } else {
                            setSelectedServiceIds([...selectedServiceIds, s.id]);
                          }
                        }}
                        className={`p-2 rounded-lg text-xs cursor-pointer flex items-center justify-between ${
                          isSelected ? 'bg-[#7a5646] text-white' : 'hover:bg-[#f5f0ea] text-[#1b1c1c]'
                        }`}
                      >
                        <span className="truncate">{s.name}</span>
                        {isSelected && <Check className="w-4 h-4 ml-2 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1b1c1c] mb-1">เงื่อนไขและข้อกำหนด (1 บรรทัดต่อ 1 ข้อ)</label>
                <textarea
                  value={termsText}
                  onChange={(e) => setTermsText(e.target.value)}
                  rows={2}
                  className="w-full bg-card border border-[#d4c3bc] rounded-xl text-xs p-2.5 focus:outline-none focus:ring-1 focus:ring-[#7a5646]"
                  placeholder="เงื่อนไขการใช้สิทธิ์..."
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="promo-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#7a5646] rounded accent-[#7a5646]"
                />
                <label htmlFor="promo-active" className="font-semibold text-xs text-[#1b1c1c] cursor-pointer">
                  เปิดใช้งานและแสดงโปรโมชั่นนี้ทันที
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="w-1/3 border-[#d4c3bc] text-xs h-11 rounded-xl"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 bg-[#7a5646] hover:bg-[#634335] text-white text-xs h-11 rounded-xl font-semibold"
                >
                  {isSubmitting ? 'กำลังบันทึก...' : (editingId ? 'บันทึกการแก้ไข' : 'สร้างโปรโมชั่น')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

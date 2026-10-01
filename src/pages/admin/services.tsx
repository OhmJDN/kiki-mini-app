import { useState, useEffect } from 'react';
import { salonService } from '@/services/salon-service';
import type { Service, ServiceCategory } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X
} from 'lucide-react';

const CATEGORIES: { key: ServiceCategory; label: string }[] = [
  { key: 'hair', label: 'ทำผม (Hair)' },
  { key: 'nails', label: 'ทำเล็บ (Nails)' },
  { key: 'spa', label: 'สปา (Spa)' },
  { key: 'makeup', label: 'แต่งหน้า (Makeup)' },
  { key: 'skincare', label: 'บำรุงผิวหน้า (Skincare)' },
];

export function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ServiceCategory>('hair');
  const [formPrice, setFormPrice] = useState<number>(1000);
  const [formDuration, setFormDuration] = useState<number>(60);
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formDepositRequired, setFormDepositRequired] = useState(false);
  const [formDepositAmount, setFormDepositAmount] = useState<number>(300);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const data = await salonService.getServices();
      setServices(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormName('');
    setFormCategory('hair');
    setFormPrice(1000);
    setFormDuration(60);
    setFormDescription('');
    setFormImageUrl('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80');
    setFormIsActive(true);
    setFormDepositRequired(false);
    setFormDepositAmount(300);
    setModalOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setFormName(service.name);
    setFormCategory(service.category);
    setFormPrice(service.price);
    setFormDuration(service.duration_minutes);
    setFormDescription(service.description);
    setFormImageUrl(service.image_url || '');
    setFormIsActive(service.is_active);
    setFormDepositRequired(service.deposit_required || false);
    setFormDepositAmount(service.deposit_amount || 300);
    setModalOpen(true);
  };

  const handleToggleActive = async (service: Service) => {
    try {
      await salonService.updateService(service.id, { is_active: !service.is_active });
      await loadServices();
    } catch (e) {
      console.error('Toggle active failed:', e);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!window.confirm('คุณแน่ใจว่าต้องการลบบริการนี้?')) return;
    try {
      await salonService.deleteService(serviceId);
      await loadServices();
    } catch (e) {
      console.error('Delete service failed:', e);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setIsSaving(true);
    try {
      if (editingService) {
        await salonService.updateService(editingService.id, {
          name: formName,
          category: formCategory,
          price: Number(formPrice),
          duration_minutes: Number(formDuration),
          description: formDescription,
          image_url: formImageUrl || null,
          deposit_required: formDepositRequired,
          deposit_amount: formDepositRequired ? Number(formDepositAmount) : 0,
          is_active: formIsActive,
        });
      } else {
        await salonService.createService({
          name: formName,
          category: formCategory,
          price: Number(formPrice),
          duration_minutes: Number(formDuration),
          description: formDescription,
          image_url: formImageUrl || null,
          deposit_required: formDepositRequired,
          deposit_amount: formDepositRequired ? Number(formDepositAmount) : 0,
          is_active: formIsActive,
        });
      }
      setModalOpen(false);
      await loadServices();
    } catch (err) {
      console.error('Save service failed:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูลบริการ');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredServices = services.filter((s) => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1b1c1c]">จัดการบริการ (Services)</h1>
          <p className="text-sm text-[#636260] mt-1">
            เพิ่ม แก้ไข และกำหนดราคาบริการทั้งหมดในร้าน KIKI Beauty Space
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="bg-[#7a5646] hover:bg-[#634335] text-white rounded-full text-xs px-4 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          เพิ่มบริการใหม่
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#7a5646] text-white'
                : 'bg-card text-[#636260] hover:bg-[#e8ded8] border border-[#d4c3bc]/50'
            }`}
          >
            ทั้งหมด ({services.length})
          </button>
          {CATEGORIES.map((c) => {
            const count = services.filter((s) => s.category === c.key).length;
            const isActive = selectedCategory === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#7a5646] text-white'
                    : 'bg-card text-[#636260] hover:bg-[#e8ded8] border border-[#d4c3bc]/50'
                }`}
              >
                {c.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาบริการ..."
            className="pl-9 bg-card border-[#d4c3bc]/60 rounded-full text-xs h-9"
          />
        </div>
      </div>

      {/* Services List / Table */}
      <Card className="bg-card border-[#d4c3bc]/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f5f0ea] border-b border-[#d4c3bc]/50 text-[#636260]">
              <tr>
                <th className="py-3 px-4 font-semibold">บริการ</th>
                <th className="py-3 px-4 font-semibold">หมวดหมู่</th>
                <th className="py-3 px-4 font-semibold">ราคา (บาท)</th>
                <th className="py-3 px-4 font-semibold">ระยะเวลา</th>
                <th className="py-3 px-4 font-semibold">สถานะเปิดให้บริการ</th>
                <th className="py-3 px-4 font-semibold text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4c3bc]/30">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    กำลังโหลดบริการ...
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    ไม่พบบริการ
                  </td>
                </tr>
              ) : (
                filteredServices.map((s) => (
                  <tr key={s.id} className="hover:bg-[#f5f0ea]/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.image_url || ''}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover bg-muted"
                        />
                        <div className="max-w-xs">
                          <div className="font-semibold text-sm text-[#1b1c1c]">{s.name}</div>
                          <div className="text-[11px] text-[#636260] line-clamp-1">{s.description}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px] uppercase text-[#7a5646] border-[#7a5646]/30">
                        {s.category}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 font-serif font-bold text-sm text-[#7a5646]">
                      <div>฿{s.price.toLocaleString()}</div>
                      {s.deposit_required ? (
                        <div className="text-[10px] text-amber-700 font-sans font-medium flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          มัดจำ ฿{s.deposit_amount?.toLocaleString() || '300'}
                        </div>
                      ) : (
                        <div className="text-[10px] text-[#636260]/70 font-sans font-normal">
                          ไม่ต้องมัดจำ
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-[#636260]">
                      {s.duration_minutes} นาที
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(s)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                          s.is_active
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-muted text-muted-foreground border border-border'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${s.is_active ? 'bg-emerald-600' : 'bg-muted-foreground'}`} />
                        {s.is_active ? 'เปิดรับจอง' : 'ปิดชั่วคราว'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(s)}
                          className="text-[#7a5646] hover:bg-[#7a5646]/10 h-8 px-2.5 rounded-lg"
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          แก้ไข
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(s.id)}
                          className="text-rose-600 hover:bg-rose-50 h-8 px-2.5 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Service Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fcf9f8] w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-[#d4c3bc] space-y-4">
            <div className="flex items-center justify-between border-b border-[#d4c3bc]/50 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#1b1c1c]">
                {editingService ? 'แก้ไขข้อมูลบริการ' : 'เพิ่มบริการใหม่'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#636260] mb-1">ชื่อบริการ *</label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="เช่น ทำสีผมพรีเมียม & ทรีทเมนต์"
                  required
                  className="bg-card border-[#d4c3bc]/60 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#636260] mb-1">หมวดหมู่</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ServiceCategory)}
                    className="w-full bg-card border border-[#d4c3bc]/60 rounded-xl p-2.5 text-xs text-[#1b1c1c] outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#636260] mb-1">สถานะ</label>
                  <select
                    value={formIsActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormIsActive(e.target.value === 'active')}
                    className="w-full bg-card border border-[#d4c3bc]/60 rounded-xl p-2.5 text-xs text-[#1b1c1c] outline-none"
                  >
                    <option value="active">เปิดรับจอง</option>
                    <option value="inactive">ปิดชั่วคราว</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#636260] mb-1">ราคา (บาท) *</label>
                  <Input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    min={0}
                    required
                    className="bg-card border-[#d4c3bc]/60 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#636260] mb-1">ระยะเวลา (นาที) *</label>
                  <Input
                    type="number"
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    min={15}
                    step={15}
                    required
                    className="bg-card border-[#d4c3bc]/60 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#636260] mb-1">คำอธิบายบริการ</label>
                <Input
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="รายละเอียดสั้นๆ เกี่ยวกับการบริการ"
                  className="bg-card border-[#d4c3bc]/60 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#636260] mb-1">รูปภาพ (Image URL)</label>
                <Input
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-card border-[#d4c3bc]/60 rounded-xl"
                />
              </div>

              {/* Deposit Setting */}
              <div className="p-3.5 bg-[#f5f0ea]/70 rounded-2xl border border-[#d4c3bc]/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-[#1b1c1c]">เรียกเก็บเงินมัดจำ (Deposit Required)</div>
                    <div className="text-[11px] text-[#636260]">ลูกค้าต้องแนบสลิปโอนเงินมัดจำล่วงหน้าเมื่อจองบริการนี้</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formDepositRequired}
                      onChange={(e) => setFormDepositRequired(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7a5646]"></div>
                  </label>
                </div>

                {formDepositRequired && (
                  <div className="pt-2 border-t border-[#d4c3bc]/40">
                    <label className="block font-semibold text-[#636260] mb-1">จำนวนเงินมัดจำ (บาท) *</label>
                    <Input
                      type="number"
                      value={formDepositAmount}
                      onChange={(e) => setFormDepositAmount(Number(e.target.value))}
                      min={50}
                      step={50}
                      required={formDepositRequired}
                      className="bg-card border-[#d4c3bc]/60 rounded-xl"
                      placeholder="เช่น 300 หรือ 500"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-[#7a5646] hover:bg-[#634335] text-white py-5 rounded-xl font-medium"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกบริการ'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

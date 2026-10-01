import { useState, useEffect } from 'react';
import { salonService } from '@/services/salon-service';
import type { Branch } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Phone, 
  Clock, 
  X
} from 'lucide-react';

export function AdminBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formOpeningHours, setFormOpeningHours] = useState('10:00 - 20:00 น.');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    setIsLoading(true);
    try {
      const data = await salonService.getBranches();
      setBranches(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setFormName('');
    setFormAddress('');
    setFormPhone('02-123-4567');
    setFormOpeningHours('10:00 - 20:00 น.');
    setFormImageUrl('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600');
    setFormIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormName(branch.name);
    setFormAddress(branch.address);
    setFormPhone(branch.phone);
    setFormOpeningHours(branch.opening_hours);
    setFormImageUrl(branch.image_url);
    setFormIsActive(branch.is_active);
    setModalOpen(true);
  };

  const handleToggleActive = async (branch: Branch) => {
    try {
      await salonService.updateBranch(branch.id, { is_active: !branch.is_active });
      await loadBranches();
    } catch (e) {
      console.error('Toggle active failed:', e);
    }
  };

  const handleDelete = async (branchId: string) => {
    if (!window.confirm('คุณแน่ใจว่าต้องการลบสาขานี้?')) return;
    try {
      await salonService.deleteBranch(branchId);
      await loadBranches();
    } catch (e) {
      console.error('Delete branch failed:', e);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setIsSaving(true);
    try {
      if (editingBranch) {
        await salonService.updateBranch(editingBranch.id, {
          name: formName,
          address: formAddress,
          phone: formPhone,
          opening_hours: formOpeningHours,
          image_url: formImageUrl,
          is_active: formIsActive,
        });
      } else {
        await salonService.createBranch({
          name: formName,
          address: formAddress,
          phone: formPhone,
          opening_hours: formOpeningHours,
          image_url: formImageUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600',
          is_active: formIsActive,
        });
      }
      setModalOpen(false);
      await loadBranches();
    } catch (err) {
      console.error('Save branch failed:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกสาขา');
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = branches.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1b1c1c]">จัดการสาขา (Branches)</h1>
          <p className="text-sm text-[#636260] mt-1">
            เพิ่ม ลบ และแก้ไขข้อมูลสาขา เวลาเปิด-ปิด และข้อมูลติดต่อ KIKI Beauty Space
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="bg-[#7a5646] hover:bg-[#634335] text-white rounded-full text-xs px-4 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          เพิ่มสาขาใหม่
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาชื่อสาขา, ที่อยู่..."
          className="pl-9 bg-card border-[#d4c3bc]/60 rounded-full text-xs h-9"
        />
      </div>

      {/* Branches Table */}
      <Card className="bg-card border-[#d4c3bc]/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f5f0ea] border-b border-[#d4c3bc]/50 text-[#636260]">
              <tr>
                <th className="py-3 px-4 font-semibold">สาขา</th>
                <th className="py-3 px-4 font-semibold">ที่อยู่ & เบอร์ติดต่อ</th>
                <th className="py-3 px-4 font-semibold">เวลาทำการ</th>
                <th className="py-3 px-4 font-semibold">สถานะเปิดบริการ</th>
                <th className="py-3 px-4 font-semibold text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4c3bc]/30">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    กำลังโหลดสาขา...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    ไม่พบข้อมูลสาขา
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-[#f5f0ea]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={b.image_url}
                          alt=""
                          className="w-14 h-14 rounded-2xl object-cover bg-muted flex-shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-sm text-[#1b1c1c]">{b.name}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">รหัส: {b.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs text-[#636260]">
                      <div className="line-clamp-2">{b.address}</div>
                      <div className="flex items-center gap-1 mt-1 text-[#1b1c1c] font-medium">
                        <Phone className="w-3 h-3 text-[#7a5646]" />
                        <span>{b.phone}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-[#1b1c1c] font-medium">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#7a5646]" />
                        <span>{b.opening_hours}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(b)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                          b.is_active
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-muted text-muted-foreground border border-border'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${b.is_active ? 'bg-emerald-600' : 'bg-muted-foreground'}`} />
                        {b.is_active ? 'เปิดให้บริการ' : 'ปิดชั่วคราว'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(b)}
                          className="text-[#7a5646] hover:bg-[#7a5646]/10 h-8 px-2.5 rounded-lg text-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" />
                          แก้ไข
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(b.id)}
                          className="text-rose-600 hover:bg-rose-50 h-8 px-2.5 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Branch Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fcf9f8] w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-[#d4c3bc] space-y-4">
            <div className="flex items-center justify-between border-b border-[#d4c3bc]/50 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#1b1c1c]">
                {editingBranch ? 'แก้ไขข้อมูลสาขา' : 'เพิ่มสาขาใหม่'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#636260] mb-1">ชื่อสาขา *</label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="เช่น Downtown Flagship Studio (สุขุมวิท 39)"
                  required
                  className="bg-card border-[#d4c3bc]/60 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#636260] mb-1">ที่อยู่สาขา *</label>
                <Input
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="เลขที่ ถนน แขวง เขต จังหวัด รหัสไปรษณีย์"
                  required
                  className="bg-card border-[#d4c3bc]/60 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#636260] mb-1">เบอร์โทรศัพท์ *</label>
                  <Input
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="02-XXX-XXXX"
                    required
                    className="bg-card border-[#d4c3bc]/60 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#636260] mb-1">เวลาทำการ</label>
                  <Input
                    value={formOpeningHours}
                    onChange={(e) => setFormOpeningHours(e.target.value)}
                    placeholder="10:00 - 20:00 น."
                    required
                    className="bg-card border-[#d4c3bc]/60 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#636260] mb-1">รูปภาพสาขา (Image URL)</label>
                <Input
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-card border-[#d4c3bc]/60 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#636260] mb-1">สถานะ</label>
                <select
                  value={formIsActive ? 'active' : 'inactive'}
                  onChange={(e) => setFormIsActive(e.target.value === 'active')}
                  className="w-full bg-card border border-[#d4c3bc]/60 rounded-xl p-2.5 text-xs text-[#1b1c1c] outline-none"
                >
                  <option value="active">เปิดให้บริการ</option>
                  <option value="inactive">ปิดชั่วคราว</option>
                </select>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-[#7a5646] hover:bg-[#634335] text-white py-5 rounded-xl font-medium"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกสาขา'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

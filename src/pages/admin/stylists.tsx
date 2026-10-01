import { useState, useEffect } from 'react';
import { salonService } from '@/services/salon-service';
import type { Stylist, Branch, ServiceCategory } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Star, 
  Calendar, 
  X,
  MapPin
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { day: 1, label: 'จ.' },
  { day: 2, label: 'อ.' },
  { day: 3, label: 'พ.' },
  { day: 4, label: 'พฤ.' },
  { day: 5, label: 'ศ.' },
  { day: 6, label: 'ส.' },
  { day: 0, label: 'อา.' },
];

export function AdminStylistsPage() {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStylist, setEditingStylist] = useState<Stylist | null>(null);

  // Schedule Modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleStylist, setScheduleStylist] = useState<Stylist | null>(null);
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [newOffDate, setNewOffDate] = useState('');
  const [offDates, setOffDates] = useState<string[]>([]);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('Senior Hair Stylist');
  const [formBranchId, setFormBranchId] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState('');
  const [formRating, setFormRating] = useState(4.9);
  const [formSpecialties, setFormSpecialties] = useState<ServiceCategory[]>(['hair']);
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [stData, brData] = await Promise.all([
        salonService.getStylists(),
        salonService.getBranches(),
      ]);
      setStylists(stData);
      setBranches(brData);
      if (brData.length > 0 && !formBranchId) {
        setFormBranchId(brData[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingStylist(null);
    setFormName('');
    setFormTitle('Senior Hair Stylist');
    setFormBranchId(branches[0]?.id || '');
    setFormAvatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300');
    setFormRating(4.9);
    setFormSpecialties(['hair']);
    setFormIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (st: Stylist) => {
    setEditingStylist(st);
    setFormName(st.name);
    setFormTitle(st.title);
    setFormBranchId(st.branch_id);
    setFormAvatarUrl(st.avatar_url);
    setFormRating(st.rating);
    setFormSpecialties(st.specialties);
    setFormIsActive(st.is_active);
    setModalOpen(true);
  };

  const handleOpenSchedule = (st: Stylist) => {
    setScheduleStylist(st);
    setWorkingDays(st.working_days || [1, 2, 3, 4, 5]);
    setOffDates(st.off_dates || []);
    setScheduleModalOpen(true);
  };

  const handleToggleDay = (day: number) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleAddOffDate = () => {
    if (newOffDate && !offDates.includes(newOffDate)) {
      setOffDates([...offDates, newOffDate].sort());
      setNewOffDate('');
    }
  };

  const handleRemoveOffDate = (date: string) => {
    setOffDates(offDates.filter((d) => d !== date));
  };

  const handleSaveSchedule = async () => {
    if (!scheduleStylist) return;
    try {
      await salonService.updateStylist(scheduleStylist.id, {
        working_days: workingDays,
        off_dates: offDates,
      });
      setScheduleModalOpen(false);
      await loadData();
    } catch (e) {
      console.error('Save schedule failed:', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('คุณแน่ใจว่าต้องการลบช่างคนนี้?')) return;
    try {
      await salonService.deleteStylist(id);
      await loadData();
    } catch (e) {
      console.error('Delete stylist failed:', e);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setIsSaving(true);
    try {
      if (editingStylist) {
        await salonService.updateStylist(editingStylist.id, {
          name: formName,
          title: formTitle,
          branch_id: formBranchId,
          avatar_url: formAvatarUrl,
          rating: Number(formRating),
          specialties: formSpecialties,
          is_active: formIsActive,
        });
      } else {
        await salonService.createStylist({
          name: formName,
          title: formTitle,
          branch_id: formBranchId,
          avatar_url: formAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
          rating: Number(formRating),
          review_count: 0,
          specialties: formSpecialties,
          working_days: [1, 2, 3, 4, 5, 6],
          off_dates: [],
          is_active: formIsActive,
        });
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Save stylist failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = stylists.filter((s) => {
    if (selectedBranchFilter !== 'all' && s.branch_id !== selectedBranchFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.title.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1b1c1c]">จัดการช่าง & ตารางเวลา (Stylists & Schedule)</h1>
          <p className="text-sm text-[#636260] mt-1">
            เพิ่มช่าง กำหนดสาขา และจัดการวันเข้างาน/วันหยุด เพื่อป้องกันคิวจองชนกัน
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="bg-[#7a5646] hover:bg-[#634335] text-white rounded-full text-xs px-4 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          เพิ่มช่างคนใหม่
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Branch Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedBranchFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedBranchFilter === 'all'
                ? 'bg-[#7a5646] text-white'
                : 'bg-card text-[#636260] hover:bg-[#e8ded8] border border-[#d4c3bc]/50'
            }`}
          >
            ทุกสาขา ({stylists.length})
          </button>
          {branches.map((b) => {
            const count = stylists.filter((s) => s.branch_id === b.id).length;
            const isActive = selectedBranchFilter === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setSelectedBranchFilter(b.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#7a5646] text-white'
                    : 'bg-card text-[#636260] hover:bg-[#e8ded8] border border-[#d4c3bc]/50'
                }`}
              >
                {b.name.split(' (')[0]} ({count})
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
            placeholder="ค้นหาชื่อช่าง, ตำแหน่ง..."
            className="pl-9 bg-card border-[#d4c3bc]/60 rounded-full text-xs h-9"
          />
        </div>
      </div>

      {/* Stylists Table */}
      <Card className="bg-card border-[#d4c3bc]/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f5f0ea] border-b border-[#d4c3bc]/50 text-[#636260]">
              <tr>
                <th className="py-3 px-4 font-semibold">ช่าง</th>
                <th className="py-3 px-4 font-semibold">ประจำสาขา</th>
                <th className="py-3 px-4 font-semibold">วันทำงานประจำสัปดาห์</th>
                <th className="py-3 px-4 font-semibold">คะแนนรีวิว</th>
                <th className="py-3 px-4 font-semibold text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4c3bc]/30">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    กำลังโหลดรายชื่อช่าง...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    ไม่พบข้อมูลช่าง
                  </td>
                </tr>
              ) : (
                filtered.map((st) => {
                  const branch = branches.find((b) => b.id === st.branch_id);
                  return (
                    <tr key={st.id} className="hover:bg-[#f5f0ea]/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={st.avatar_url}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover border border-[#d4c3bc]"
                          />
                          <div>
                            <div className="font-semibold text-sm text-[#1b1c1c]">{st.name}</div>
                            <div className="text-[11px] text-[#7a5646] font-medium">{st.title}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#1b1c1c] font-medium">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#7a5646]" />
                          <span>{branch?.name || 'สาขาหลัก'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          {DAYS_OF_WEEK.map((d) => {
                            const isWorking = (st.working_days || []).includes(d.day);
                            return (
                              <span
                                key={d.day}
                                className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                                  isWorking ? 'bg-[#7a5646] text-white' : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {d.label}
                              </span>
                            );
                          })}
                        </div>
                        {st.off_dates && st.off_dates.length > 0 && (
                          <div className="text-[10px] text-amber-700 mt-1">
                            วันหยุดพิเศษ: {st.off_dates.length} วัน
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-amber-600 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{st.rating}</span>
                          <span className="text-muted-foreground font-normal text-[11px]">({st.review_count})</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenSchedule(st)}
                            className="text-xs text-[#7a5646] border-[#7a5646]/30 hover:bg-[#7a5646]/10 h-8 px-2.5 rounded-lg"
                          >
                            <Calendar className="w-3.5 h-3.5 mr-1" />
                            ตารางงาน
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(st)}
                            className="text-[#7a5646] hover:bg-[#7a5646]/10 h-8 px-2.5 rounded-lg text-xs"
                          >
                            <Edit3 className="w-3.5 h-3.5 mr-1" />
                            แก้ไข
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(st.id)}
                            className="text-rose-600 hover:bg-rose-50 h-8 px-2.5 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Stylist Schedule Modal */}
      {scheduleModalOpen && scheduleStylist && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fcf9f8] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#d4c3bc] space-y-4">
            <div className="flex items-center justify-between border-b border-[#d4c3bc]/50 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#1b1c1c]">
                ตารางงาน: {scheduleStylist.name}
              </h3>
              <button onClick={() => setScheduleModalOpen(false)} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1b1c1c] mb-2">วันเข้างานประจำสัปดาห์ (คลิกเพื่อเปิด/ปิด):</label>
                <div className="grid grid-cols-7 gap-1.5">
                  {DAYS_OF_WEEK.map((d) => {
                    const isWorking = workingDays.includes(d.day);
                    return (
                      <button
                        key={d.day}
                        type="button"
                        onClick={() => handleToggleDay(d.day)}
                        className={`py-3 rounded-xl font-bold transition-all border ${
                          isWorking
                            ? 'bg-[#7a5646] text-white border-[#7a5646]'
                            : 'bg-card text-muted-foreground border-[#d4c3bc]'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1b1c1c] mb-1.5">กำหนดวันหยุดพิเศษเฉพาะวัน (Off-Dates):</label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={newOffDate}
                    onChange={(e) => setNewOffDate(e.target.value)}
                    className="bg-card border-[#d4c3bc] rounded-xl text-xs h-9"
                  />
                  <Button
                    type="button"
                    onClick={handleAddOffDate}
                    className="bg-[#7a5646] hover:bg-[#634335] text-white rounded-xl text-xs px-3 h-9"
                  >
                    เพิ่ม
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {offDates.map((date) => (
                    <span
                      key={date}
                      className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full text-[10px]"
                    >
                      {date}
                      <button onClick={() => handleRemoveOffDate(date)} className="hover:text-rose-700">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {offDates.length === 0 && (
                    <span className="text-muted-foreground text-[11px]">ยังไม่มีวันหยุดพิเศษ</span>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleSaveSchedule}
                  className="w-full bg-[#7a5646] hover:bg-[#634335] text-white py-5 rounded-xl font-medium"
                >
                  บันทึกตารางงาน
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Stylist Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fcf9f8] w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-[#d4c3bc] space-y-4">
            <div className="flex items-center justify-between border-b border-[#d4c3bc]/50 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#1b1c1c]">
                {editingStylist ? 'แก้ไขข้อมูลช่าง' : 'เพิ่มช่างคนใหม่'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#636260] mb-1">ชื่อช่าง *</label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="เช่น ช่างเจนนี่ (Elena)"
                  required
                  className="bg-card border-[#d4c3bc]/60 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#636260] mb-1">ตำแหน่ง *</label>
                  <Input
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="เช่น Master Colorist"
                    required
                    className="bg-card border-[#d4c3bc]/60 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#636260] mb-1">ประจำสาขา</label>
                  <select
                    value={formBranchId}
                    onChange={(e) => setFormBranchId(e.target.value)}
                    className="w-full bg-card border border-[#d4c3bc]/60 rounded-xl p-2.5 text-xs text-[#1b1c1c] outline-none"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#636260] mb-1">รูปโปรไฟล์ (Avatar URL)</label>
                <Input
                  value={formAvatarUrl}
                  onChange={(e) => setFormAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-card border-[#d4c3bc]/60 rounded-xl"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-[#7a5646] hover:bg-[#634335] text-white py-5 rounded-xl font-medium"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกช่าง'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

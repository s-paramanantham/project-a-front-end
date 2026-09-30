import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  GraduationCap,
  Award,
  BookOpen,
  Camera,
  Briefcase,
  MapPin,
  Check,
  Settings,
  ArrowRight
} from 'lucide-react';
import type { User } from '../../../../types/authTypes';
import { Button } from '../../base/Button/Button';
import { authService } from '../../../../services/AuthService/authService';
import { ImageCropperModal } from './ImageCropperModal';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  enrolledCount?: number;
  onUserUpdated?: (updated: User) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  enrolledCount = 0,
  onUserUpdated
}) => {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Crop modal state
  const [cropTarget, setCropTarget] = useState<'avatar' | 'cover' | null>(null);
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageForCrop(reader.result as string);
      setCropTarget(target);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropSave = async (croppedDataUrl: string) => {
    try {
      if (cropTarget === 'avatar') {
        const updated = await authService.updateUserProfileAPI({ avatarUrl: croppedDataUrl });
        if (onUserUpdated) onUserUpdated(updated);
        setToastMessage('Profile avatar updated & saved to server!');
      } else if (cropTarget === 'cover') {
        const updated = await authService.updateUserProfileAPI({ coverUrl: croppedDataUrl });
        if (onUserUpdated) onUserUpdated(updated);
        setToastMessage('Cover picture updated & saved to server!');
      }
    } catch {
      if (cropTarget === 'avatar') {
        const updated = authService.updateUserProfile({ avatarUrl: croppedDataUrl });
        if (onUserUpdated) onUserUpdated(updated);
      } else if (cropTarget === 'cover') {
        const updated = authService.updateUserProfile({ coverUrl: croppedDataUrl });
        if (onUserUpdated) onUserUpdated(updated);
      }
      setToastMessage('Image updated in local session!');
    }
    setCropTarget(null);
    setRawImageForCrop(null);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleNavigateToSettings = () => {
    onClose();
    navigate('/profile/settings');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs" onClick={onClose} />

        {/* Modal Dialog */}
        <div className="relative bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-2xl max-h-[92vh] overflow-hidden z-10 flex flex-col animate-in fade-in zoom-in-95 duration-200">
          {/* Cover Picture Area */}
          <div className="relative h-36 sm:h-44 w-full bg-neutral-900 border-b border-neutral-800 overflow-hidden shrink-0">
            {user?.coverUrl ? (
              <img src={user.coverUrl} alt="Profile Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full opacity-20 flex items-center justify-center text-white">
                <BookOpen size={64} />
              </div>
            )}

            {/* Change Cover Button */}
            <label className="absolute top-3 left-3 bg-neutral-900/60 hover:bg-neutral-900/80 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg backdrop-blur-md cursor-pointer flex items-center gap-1.5 transition-all">
              <Camera size={13} />
              <span>Change Cover</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, 'cover')}
              />
            </label>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-neutral-900/40 hover:bg-neutral-900/70 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Modal Header Body: Avatar & Direct Profile Settings Navigation Button */}
          <div className="px-6 pt-0 pb-3 border-b border-neutral-100 shrink-0 relative bg-white">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-4 gap-3">
              {/* Avatar with Camera badge */}
              <div className="relative self-start">
                <div className="w-20 h-20 rounded-xl bg-white p-1 shadow-lg border border-neutral-200 overflow-hidden">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user?.name || 'User'}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-orange-100 text-[#EA580C] font-extrabold text-3xl flex items-center justify-center">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>

                <label
                  title="Upload & Crop Avatar"
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#EA580C] text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer border-2 border-white"
                >
                  <Camera size={14} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'avatar')}
                  />
                </label>
              </div>

              {/* Profile Settings Direct Button */}
              <button
                onClick={handleNavigateToSettings}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-orange-50 hover:bg-orange-100 text-[#EA580C] border border-orange-200 transition-all cursor-pointer shadow-xs self-start sm:self-auto"
                title="Open Profile Settings Screen"
              >
                <Settings size={14} />
                <span>Profile Settings</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Name & Basic Info */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-heading font-extrabold text-neutral-900">
                  {user?.name || 'Learner Profile'}
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">{user?.email || 'user@example.com'}</p>
              </div>

              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-[#EA580C] border border-orange-200">
                {user?.role === 'tutor' ? <Award size={13} /> : <GraduationCap size={13} />}
                <span className="capitalize">{user?.role || 'Student'}</span>
              </span>
            </div>
          </div>

          {/* Toast Alert */}
          {toastMessage && (
            <div className="mx-6 mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
              <Check size={14} className="text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Modal Content: Overview Only */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div className="space-y-5">
              {/* Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-center">
                  <div className="flex items-center justify-center gap-1 text-[#EA580C] mb-1">
                    <BookOpen size={16} />
                    <span className="text-lg font-bold text-neutral-900">{enrolledCount}</span>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-medium">Courses Enrolled</span>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-center">
                  <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
                    <Award size={16} />
                    <span className="text-lg font-bold text-neutral-900">Active</span>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-medium">Curriculum Status</span>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-center col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
                    <Check size={16} />
                    <span className="text-lg font-bold text-neutral-900">Standard</span>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-medium">Account Tier</span>
                </div>
              </div>

              {/* Education Snapshot */}
              <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <GraduationCap size={15} className="text-[#EA580C]" />
                    <span>Education Qualifications</span>
                  </span>
                  <button
                    onClick={handleNavigateToSettings}
                    className="text-[11px] font-semibold text-[#EA580C] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                {user?.education?.degree ? (
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-neutral-800">{user.education.degree}</p>
                    <p className="text-neutral-500">
                      {user.education.institution}
                      {user.education.fieldOfStudy ? ` • ${user.education.fieldOfStudy}` : ''}
                      {user.education.graduationYear ? ` (Class of ${user.education.graduationYear})` : ''}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 italic">No education details added yet.</p>
                )}
              </div>

              {/* Work Experience Snapshot */}
              <div className="p-4 bg-white border border-neutral-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <Briefcase size={15} className="text-[#EA580C]" />
                    <span>Work & Career</span>
                  </span>
                  <button
                    onClick={handleNavigateToSettings}
                    className="text-[11px] font-semibold text-[#EA580C] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                {user?.work?.jobTitle ? (
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-neutral-800">{user.work.jobTitle}</p>
                    <p className="text-neutral-500">
                      {user.work.company ? `${user.work.company}` : ''}
                      {user.work.industry ? ` • ${user.work.industry}` : ''}
                      {user.work.yearsOfExperience ? ` • ${user.work.yearsOfExperience}` : ''}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 italic">No work details added yet.</p>
                )}
              </div>

              {/* Address Snapshot */}
              <div className="p-4 bg-white border border-neutral-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <MapPin size={15} className="text-[#EA580C]" />
                    <span>Address & Location</span>
                  </span>
                  <button
                    onClick={handleNavigateToSettings}
                    className="text-[11px] font-semibold text-[#EA580C] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                {user?.address?.city || user?.address?.country ? (
                  <div className="text-xs text-neutral-600">
                    <p>{user.address.street}</p>
                    <p>
                      {[user.address.city, user.address.state, user.address.postalCode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    <p className="font-semibold text-neutral-800">{user.address.country}</p>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 italic">No address details added yet.</p>
                )}
              </div>

              {/* Navigation CTA to Full Screen */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={handleNavigateToSettings}
                  leftIcon={<Settings size={14} />}
                  rightIcon={<ArrowRight size={14} />}
                >
                  Open Full Profile Settings Screen
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={Boolean(cropTarget && rawImageForCrop)}
        imageSrc={rawImageForCrop}
        aspectRatio={cropTarget === 'cover' ? 16 / 6 : 1}
        isCircular={cropTarget === 'avatar'}
        title={cropTarget === 'cover' ? 'Crop & Adjust Cover Picture' : 'Crop & Adjust Profile Avatar'}
        onCropSave={handleCropSave}
        onClose={() => {
          setCropTarget(null);
          setRawImageForCrop(null);
        }}
      />
    </>
  );
};

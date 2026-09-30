import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  GraduationCap,
  Briefcase,
  MapPin,
  Camera,
  Save,
  ArrowLeft,
  Check,
  AlertCircle,
  Mail,
  Layers
} from 'lucide-react';
import { AppLayout } from '../../reusables/feature/Navigation/AppLayout';
import { Card } from '../../reusables/base/Card/Card';
import { Button } from '../../reusables/base/Button/Button';
import { Input } from '../../reusables/base/Input/Input';
import { ImageCropperModal } from '../../reusables/feature/Navigation/ImageCropperModal';
import { authService } from '../../../services/AuthService/authService';
import type { User, EducationDetails, WorkDetails, AddressDetails } from '../../../types/authTypes';

export const ProfileSettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());

  // Form states
  const [name, setName] = useState(currentUser?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || '');
  const [countryCode, setCountryCode] = useState(currentUser?.countryCode || '+1');

  // Education state
  const [education, setEducation] = useState<EducationDetails>({
    degree: currentUser?.education?.degree || '',
    institution: currentUser?.education?.institution || '',
    fieldOfStudy: currentUser?.education?.fieldOfStudy || '',
    graduationYear: currentUser?.education?.graduationYear || ''
  });

  // Work state
  const [work, setWork] = useState<WorkDetails>({
    jobTitle: currentUser?.work?.jobTitle || '',
    company: currentUser?.work?.company || '',
    industry: currentUser?.work?.industry || '',
    yearsOfExperience: currentUser?.work?.yearsOfExperience || ''
  });

  // Address state
  const [address, setAddress] = useState<AddressDetails>({
    street: currentUser?.address?.street || '',
    city: currentUser?.address?.city || '',
    state: currentUser?.address?.state || '',
    country: currentUser?.address?.country || '',
    postalCode: currentUser?.address?.postalCode || ''
  });

  // Images state
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(currentUser?.avatarUrl);
  const [coverUrl, setCoverUrl] = useState<string | undefined>(currentUser?.coverUrl);

  // Cropper state
  const [cropTarget, setCropTarget] = useState<'avatar' | 'cover' | null>(null);
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);

  // Status feedback
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setName(user.name || '');
      setPhoneNumber(user.phoneNumber || '');
      setCountryCode(user.countryCode || '+1');
      setAvatarUrl(user.avatarUrl);
      setCoverUrl(user.coverUrl);
      if (user.education) setEducation(user.education);
      if (user.work) setWork(user.work);
      if (user.address) setAddress(user.address);
    }
  }, []);

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
    if (cropTarget === 'avatar') {
      setAvatarUrl(croppedDataUrl);
      try {
        const updated = await authService.updateUserProfileAPI({ avatarUrl: croppedDataUrl });
        setCurrentUser(updated);
        setToastMessage({ text: 'Profile avatar updated and saved!', type: 'success' });
      } catch {
        setToastMessage({ text: 'Avatar cropped locally. Click Save to persist.', type: 'success' });
      }
    } else if (cropTarget === 'cover') {
      setCoverUrl(croppedDataUrl);
      try {
        const updated = await authService.updateUserProfileAPI({ coverUrl: croppedDataUrl });
        setCurrentUser(updated);
        setToastMessage({ text: 'Cover banner updated and saved!', type: 'success' });
      } catch {
        setToastMessage({ text: 'Cover cropped locally. Click Save to persist.', type: 'success' });
      }
    }
    setCropTarget(null);
    setRawImageForCrop(null);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setToastMessage(null);

    try {
      const payload: Partial<User> = {
        name,
        phoneNumber,
        countryCode,
        avatarUrl,
        coverUrl,
        education,
        work,
        address
      };

      // Call backend profile API and update local session
      const updatedUser = await authService.updateUserProfileAPI(payload);
      setCurrentUser(updatedUser);

      setToastMessage({
        text: 'Profile details saved to server successfully!',
        type: 'success'
      });
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      // Even if offline, save locally
      authService.updateUserProfile({
        name,
        phoneNumber,
        countryCode,
        avatarUrl,
        coverUrl,
        education,
        work,
        address
      });
      setToastMessage({
        text: 'Profile saved to local session. Server could not be reached.',
        type: 'success'
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-heading font-extrabold text-neutral-900 tracking-tight">
                Profile Settings
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Customize your public identity, education qualifications, work experience, and address.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              isLoading={isSaving}
              leftIcon={<Save size={15} />}
            >
              Save Changes
            </Button>
          </div>
        </div>

        {/* Status Toast */}
        {toastMessage && (
          <div
            className={`p-4 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-xs animate-in fade-in duration-200 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <Check size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Visual Header / Cover & Avatar Card */}
          <Card className="p-0 overflow-hidden border border-neutral-200">
            {/* Cover Banner */}
            <div className="relative h-44 sm:h-56 w-full bg-gradient-to-r from-orange-400 via-[#EA580C] to-amber-500 overflow-hidden group">
              {coverUrl ? (
                <img src={coverUrl} alt="Cover Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40">
                  <Layers size={64} strokeWidth={1.5} />
                </div>
              )}

              {/* Cover Upload Button Overlay */}
              <label
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-md"
                title="Change Cover Banner with Crop"
              >
                <Camera size={14} />
                <span>Change Banner</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'cover')}
                />
              </label>
            </div>

            {/* Profile Avatar Bar */}
            <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                {/* Circular Avatar */}
                <div className="relative w-28 h-28 rounded-full border-4 border-white shadow-lg bg-orange-100 overflow-hidden group shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-3xl text-[#EA580C]">
                      {name ? name.charAt(0).toUpperCase() : <UserIcon size={40} />}
                    </div>
                  )}

                  {/* Avatar Upload Button Overlay */}
                  <label
                    title="Change Profile Photo with Circular Crop"
                    className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera size={20} />
                    <span className="text-[10px] font-bold mt-1">Crop & Edit</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'avatar')}
                    />
                  </label>
                </div>

                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-heading font-extrabold text-neutral-900">
                      {name || 'Learner Profile'}
                    </h2>
                    <span className="capitalize text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#EA580C] border border-orange-200">
                      {currentUser?.role || 'Student'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1.5">
                    <Mail size={12} />
                    <span>{currentUser?.email || 'N/A'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto mb-2">
                <label
                  className="px-3.5 py-1.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera size={14} className="text-[#EA580C]" />
                  <span>Update Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'avatar')}
                  />
                </label>
              </div>
            </div>
          </Card>

          {/* Section 1: Basic Information */}
          <Card>
            <div className="flex items-center gap-2 pb-4 border-b border-neutral-100 mb-5">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#EA580C] flex items-center justify-center">
                <UserIcon size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Basic Information</h3>
                <p className="text-xs text-neutral-500">Your public learner display name and contact phone</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="e.g. Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Email Address"
                value={currentUser?.email || ''}
                disabled
                hint="Email is bound to your account identity"
              />

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-neutral-700">Phone Number</label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-24 px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20"
                  >
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+91">+91 (IN)</option>
                    <option value="+61">+61 (AU)</option>
                    <option value="+49">+49 (DE)</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="e.g. 5550192834"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Section 2: Education Details */}
          <Card>
            <div className="flex items-center gap-2 pb-4 border-b border-neutral-100 mb-5">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#EA580C] flex items-center justify-center">
                <GraduationCap size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Education Details</h3>
                <p className="text-xs text-neutral-500">Degree, university, field of study, and graduation year</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Degree / Credential"
                placeholder="e.g. Bachelor of Science"
                value={education.degree || ''}
                onChange={(e) => setEducation({ ...education, degree: e.target.value })}
              />

              <Input
                label="College / University / School"
                placeholder="e.g. University of California, Berkeley"
                value={education.institution || ''}
                onChange={(e) => setEducation({ ...education, institution: e.target.value })}
              />

              <Input
                label="Field of Study / Major"
                placeholder="e.g. Computer Science & Engineering"
                value={education.fieldOfStudy || ''}
                onChange={(e) => setEducation({ ...education, fieldOfStudy: e.target.value })}
              />

              <Input
                label="Graduation Year"
                placeholder="e.g. 2024"
                value={education.graduationYear || ''}
                onChange={(e) => setEducation({ ...education, graduationYear: e.target.value })}
              />
            </div>
          </Card>

          {/* Section 3: Work Details */}
          <Card>
            <div className="flex items-center gap-2 pb-4 border-b border-neutral-100 mb-5">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#EA580C] flex items-center justify-center">
                <Briefcase size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Work & Experience</h3>
                <p className="text-xs text-neutral-500">Current occupation, organization, industry, and total experience</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Current Job Title / Role"
                placeholder="e.g. Full Stack Developer"
                value={work.jobTitle || ''}
                onChange={(e) => setWork({ ...work, jobTitle: e.target.value })}
              />

              <Input
                label="Company / Employer"
                placeholder="e.g. Tech Solutions Inc."
                value={work.company || ''}
                onChange={(e) => setWork({ ...work, company: e.target.value })}
              />

              <Input
                label="Industry"
                placeholder="e.g. Software & Cloud Computing"
                value={work.industry || ''}
                onChange={(e) => setWork({ ...work, industry: e.target.value })}
              />

              <Input
                label="Years of Experience"
                placeholder="e.g. 3 Years"
                value={work.yearsOfExperience || ''}
                onChange={(e) => setWork({ ...work, yearsOfExperience: e.target.value })}
              />
            </div>
          </Card>

          {/* Section 4: Address Details */}
          <Card>
            <div className="flex items-center gap-2 pb-4 border-b border-neutral-100 mb-5">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#EA580C] flex items-center justify-center">
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Address & Location</h3>
                <p className="text-xs text-neutral-500">Your residential or mailing address</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Street Address"
                  placeholder="e.g. 123 Tech Boulevard, Apt 4B"
                  value={address.street || ''}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                />
              </div>

              <Input
                label="City"
                placeholder="e.g. San Francisco"
                value={address.city || ''}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              />

              <Input
                label="State / Province"
                placeholder="e.g. California"
                value={address.state || ''}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
              />

              <Input
                label="Country"
                placeholder="e.g. United States"
                value={address.country || ''}
                onChange={(e) => setAddress({ ...address, country: e.target.value })}
              />

              <Input
                label="Postal / Zip Code"
                placeholder="e.g. 94107"
                value={address.postalCode || ''}
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
              />
            </div>
          </Card>

          {/* Bottom Sticky Action Bar */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-neutral-200 shadow-sm sticky bottom-4 z-20">
            <span className="text-xs text-neutral-500 hidden sm:inline">
              Changes will be synchronized to your learning profile.
            </span>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => navigate('/dashboard')}
              >
                Discard
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isSaving}
                leftIcon={<Save size={15} />}
              >
                Save Profile Changes
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={Boolean(cropTarget && rawImageForCrop)}
        imageSrc={rawImageForCrop}
        aspectRatio={cropTarget === 'cover' ? 16 / 6 : 1}
        isCircular={cropTarget === 'avatar'}
        title={cropTarget === 'cover' ? 'Crop & Adjust Cover Banner' : 'Crop & Adjust Profile Avatar'}
        onCropSave={handleCropSave}
        onClose={() => {
          setCropTarget(null);
          setRawImageForCrop(null);
        }}
      />
    </AppLayout>
  );
};

export default ProfileSettingsScreen;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/AuthService/authService';
import type { User, EducationDetails, WorkDetails, AddressDetails } from '../../../types/authTypes';

export function useProfileSettingsVM() {
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

      const updated = await authService.updateUserProfileAPI(payload);
      setCurrentUser(updated);
      setToastMessage({ text: 'Profile settings updated successfully!', type: 'success' });
    } catch (err: any) {
      setToastMessage({
        text: err?.response?.data?.message || err?.message || 'Failed to update profile settings.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return {
    currentUser,
    name,
    setName,
    phoneNumber,
    setPhoneNumber,
    countryCode,
    setCountryCode,
    education,
    setEducation,
    work,
    setWork,
    address,
    setAddress,
    avatarUrl,
    coverUrl,
    cropTarget,
    setCropTarget,
    rawImageForCrop,
    setRawImageForCrop,
    isSaving,
    toastMessage,
    setToastMessage,
    handleFileChange,
    handleCropSave,
    handleSubmit,
    navigate
  };
}

'use client';

import { useState } from 'react';
import FaceCamera from './FaceCamera';
import { registerPerson } from '@/lib/database';
import type { Person } from '@/lib/types';

interface PersonFormProps {
  category: 'resident' | 'daily-labor' | 'service-worker' | 'vendor' | 'guest';
  societyId: string;
  onSuccess?: () => void;
}

const vendorCompanies = [
  'Amazon',
  'Flipkart',
  'Swiggy',
  'Zomato',
  'Dunzo',
  'Blue Dart',
  'DHL',
  'Myntra',
  'Jio Mart',
  'Other',
];

const vendorPurposes = [
  'Driver',
  'Electrician',
  'Painter',
  'Plumber',
  'Carpenter',
  'Mason',
  'Gardener',
  'Security',
  'Delivery',
  'Service',
  'Maintenance',
  'Installation',
  'Repair',
  'Support',
  'Cleaning',
  'Grocery',
  'Courier',
  'Other',
];

export default function PersonForm({ category, societyId, onSuccess }: PersonFormProps) {
  const [step, setStep] = useState<'form' | 'camera'>('form');
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    wing: string;
    floor: string;
    roomNumber: string;
    associatedFlat: string;
    purpose: string;
    company: string;
    relation: string;
    householdRole: 'owner' | 'tenant' | 'family' | 'helper';
    registrationType: 'resident' | 'vendor';
  }>({
    name: '',
    phone: '',
    wing: '',
    floor: '',
    roomNumber: '',
    associatedFlat: '',
    purpose: '',
    company: '',
    relation: '',
    householdRole: category === 'vendor' ? 'helper' : 'owner',
    registrationType: category === 'vendor' ? 'vendor' : 'resident',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [faceData, setFaceData] = useState<{ descriptor: Float32Array; image: string } | null>(null);

  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      ...(name === 'name' || name === 'phone' || name === 'wing' || name === 'floor' || name === 'roomNumber' || name === 'associatedFlat' || name === 'purpose' || name === 'company' || name === 'relation' || name === 'householdRole'
        ? { [name]: value }
        : {}),
    }));
  };

  const handleFaceCaptured = (descriptor: Float32Array, photoBase64: string) => {
    setFaceData({ descriptor, image: photoBase64 });
    setStep('form');
    setMessage('Face captured! Now submit the form.');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!faceData) {
      setMessage('Please capture a face first');
      return;
    }

    setLoading(true);
    setMessage('Registering...');

    try {
      const roomFlat = formData.associatedFlat || `${formData.wing || 'A'}-${formData.floor || '1'}-${formData.roomNumber || '101'}`;

      const personData: Omit<Person, 'id' | 'registeredAt'> = {
        name: formData.name,
        phone: formData.phone,
        category,
        associatedFlat: roomFlat,
        wing: formData.wing || undefined,
        floor: formData.floor || undefined,
        roomNumber: formData.roomNumber || undefined,
        purpose: formData.purpose || undefined,
        company: formData.company || undefined,
        relation: formData.relation || undefined,
        registrationType: formData.registrationType,
        householdRole: formData.householdRole,
        faceDescriptor: faceData.descriptor,
        faceImage: faceData.image,
        registeredBy: 'admin',
      };

      const personId = await registerPerson(societyId, personData);
      setMessage(`Successfully registered! ID: ${personId}`);

      setFormData({
        name: '',
        phone: '',
        wing: '',
        floor: '',
        roomNumber: '',
        associatedFlat: '',
        purpose: '',
        company: '',
        relation: '',
        householdRole: category === 'vendor' ? 'helper' : 'owner',
        registrationType: category === 'vendor' ? 'vendor' : 'resident',
      });
      setFaceData(null);
      setStep('form');
      onSuccess?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Registration</p>
          <h2 className="mt-2 text-2xl font-bold capitalize text-slate-900">
            {category === 'vendor' ? 'Vendor' : 'Resident'} onboarding
          </h2>
        </div>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
          {category === 'vendor' ? 'Vendor' : 'Resident'}
        </span>
      </div>

      {step === 'form' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 transition focus:border-blue-500"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
              placeholder="10-digit phone number"
            />
          </div>

          {category === 'resident' && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Wing</label>
                  <input
                    type="text"
                    name="wing"
                    value={formData.wing}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
                    placeholder="e.g., A"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Floor</label>
                  <input
                    type="text"
                    name="floor"
                    value={formData.floor}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
                    placeholder="e.g., 5"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Room Number</label>
                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
                    placeholder="e.g., 501"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Complete Flat Address (Optional)</label>
                <input
                  type="text"
                  name="associatedFlat"
                  value={formData.associatedFlat}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
                  placeholder="e.g., A-5-501"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Relation to Resident</label>
                <input
                  type="text"
                  name="relation"
                  value={formData.relation}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
                  placeholder="e.g., Wife, Son, Maid, Driver, Daily worker"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Household role</label>
                <select
                  name="householdRole"
                  value={formData.householdRole}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
                >
                  <option value="owner">Owner</option>
                  <option value="tenant">Tenant</option>
                  <option value="family">Family member</option>
                  <option value="helper">House helper</option>
                </select>
              </div>
            </>
          )}

          {(category === 'daily-labor' || category === 'service-worker') && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Service Type</label>
              <input
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
                placeholder="e.g., Maid, Plumber, Electrician"
              />
            </div>
          )}

          {category === 'vendor' && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Company Name</label>
                <select
                  name="company"
                  value={formData.company}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
                >
                  <option value="">Select company</option>
                  {vendorCompanies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Purpose</label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
                >
                  <option value="">Select purpose</option>
                  {vendorPurposes.map((purpose) => (
                    <option key={purpose} value={purpose}>
                      {purpose}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            {category === 'vendor'
              ? 'Vendor QR code: separate code used for vendor registration and tracking.'
              : 'Resident QR code: separate code used for resident and family registration.'}
          </div>

          <button
            type="button"
            onClick={() => setStep('camera')}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
          >
            {faceData ? 'Re-capture Face' : 'Capture Face'}
          </button>

          {faceData && (
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? 'Registering...' : 'Submit Registration'}
            </button>
          )}

          {message && (
            <p
              className={`text-sm ${
                message.includes('Successfully') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message}
            </p>
          )}
        </form>
      ) : (
        <div>
          <FaceCamera
            onFaceCaptured={handleFaceCaptured}
            onBack={() => setStep('form')}
            onError={(error) => setMessage(error)}
          />
        </div>
      )}
    </div>
  );
}

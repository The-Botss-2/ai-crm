'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import Loading from "./Loading";
import Integration from "./Integration";

const OrganizationSettingsPage = ({ user_id }: any) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'settings' | 'integrations'>('settings');

  const [organization, setOrganization] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    country: '',
    address: '',
    contactPhone: '',
    Number_of_Employees: '',
    website: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrganization() {
      try {
        setLoading(true);
        const res = await axios.get('/api/organization');
        if (res?.data[0]) {
          setOrganization(res?.data[0]);
          setFormData({
            name: res.data[0]?.name,
            description: res.data[0]?.description,
            country: res.data[0]?.country,
            address: res.data[0]?.address,
            contactPhone: res.data[0]?.contactPhone,
            Number_of_Employees: res.data[0]?.Number_of_Employees,
            website: res.data[0]?.website
          });
        } else {
          toast.error('Failed to load organization data');
        }
      } catch (err: any) {
        setError('Failed to fetch organization data');
        toast.error('Failed to load organization data');
      } finally {
        setLoading(false);
      }
    }

    fetchOrganization();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Saving changes...");
    setLoading(true);

    try {
      const res = await axios.patch(`/api/organization?id=${organization?._id}`, formData);
      toast.success('Organization updated successfully', { id: toastId });
      setOrganization(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to update organization', { id: toastId });
      setError('Failed to update organization');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className=" mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900  sm:text-4xl">
            Organization Settings
          </h1>
          <p className="mt-3 text-xl text-gray-500 ">
            Manage your organization's profile and settings
          </p>
        </div>

        <div className="bg-white  shadow-xl rounded-2xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 ">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'settings' 
                  ? 'border-blue-500 text-blue-600  ' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 '}`}
              >
                Settings
              </button>
              <button
                onClick={() => setActiveTab('integrations')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'integrations' 
                  ? 'border-blue-500 text-blue-600 ' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 '}`}
              >
                Integrations
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'settings' ? (
            <div>
              <div className="p-6 border-b border-gray-200 ">
                <h2 className="text-2xl font-semibold text-gray-800 ">
                  General Information
                </h2>
                <p className="mt-1 text-gray-500 ">
                  Basic details about your organization
                </p>
              </div>

              <form onSubmit={handleSubmit} className="divide-y divide-gray-200 ">
                <div className="p-6 space-y-8">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Organization Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 rounded-lg border border-gray-300  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                        placeholder="Acme Inc."
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 ">
                        Address 
                      </label>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        value={formData.address}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="123 Main St, City, State ZIP"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 ">
                        Description 
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 rounded-lg border border-gray-300  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Brief description of your organization"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 ">
                        Contact Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contactPhone"
                        name="contactPhone"
                        type="tel"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 rounded-lg border border-gray-300    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="Number_of_Employees" className="block text-sm font-medium text-gray-700 ">
                        Number of Employees <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="Number_of_Employees"
                        name="Number_of_Employees"
                        value={formData.Number_of_Employees}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 rounded-lg border border-gray-300    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      >
                        <option value="" disabled>Select number of employees</option>
                        <option value="1-10">1-10</option>
                        <option value="11-50">11-50</option>
                        <option value="51-200">51-200</option>
                        <option value="201-500">201-500</option>
                        <option value="501-1000">501-1000</option>
                        <option value="1000+">1000+</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700 ">
                        Website Url
                      </label>
                      <input
                        id="website"
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 rounded-lg border border-gray-300    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="https://www.organization.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50  text-right">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-6">
            <Integration userId={user_id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationSettingsPage;
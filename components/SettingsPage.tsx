'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { axiosInstance } from '@/lib/fetcher';
import Loading from './Loading';

export default function SettingsPage({ user_id }: { user_id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ id: string }>();

  const [profile, setProfile] = useState<{ name: string; email: string; avatar?: string }>({
    name: '',
    email: '',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [team, setTeam] = useState<{
    _id?: string;
    name: string;
    createdAt?: string;
    membersCount?: number;
  }>({ name: '' });
  const [loading, setLoading] = useState(false);
  const [ isLoadingGet,setLoadingGet] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      const teamIdFromUrl = params.id;
      if (!teamIdFromUrl) {
        toast.error('Team ID is missing in URL');
        return;
      }

      try {
        setLoadingGet(true);
        const teamRes = await axiosInstance.get('/api/team', { params: { id: teamIdFromUrl } });
        const teamData = teamRes.data.team;
        setTeam({
          _id: teamData._id,
          name: teamData.name,
          createdAt: teamData.createdAt,
          membersCount: teamData.members.length,
        });

        const profileRes = await axiosInstance.get('/api/settings/profile');
        const userData = profileRes.data.user;
        setProfile({
          name: userData.name,
          email: userData.email,
          avatar: userData.image || '',
        });
        setLoadingGet(false);
      } catch (error: any) {
        setLoadingGet(false);
        toast.error(error?.message || 'Failed to load settings');
      }
    };
    fetchData();
  }, [searchParams, params.id, user_id]);

  const handleUpdateProfile = async () => {
    if (!profile.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.patch('/api/settings/profile', {
        userId: user_id,
        name: profile.name,
      });
      toast.success('Profile updated');
      setIsEditingProfile(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeam = async () => {
    if (!team._id) return;
    if (!team.name.trim()) {
      toast.error('Team name cannot be empty');
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.patch('/api/settings', {
        teamId: team._id,
        name: team.name,
      });
      toast.success('Team updated');
      setIsEditingTeam(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update team');
    } finally {
      setLoading(false);
    }
  };

  return (
    isLoadingGet ? (<Loading />):(
    <div className="max-w-7xl mx-auto p-8 min-h-screen">

      <div className="flex flex-col md:flex-row md:space-x-14 gap-12">
        {/* Profile */}
        <section className="flex-1 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-semibold mb-8 border-b border-blue-500 pb-2 text-blue-700">
            Your Profile
          </h2>

          <div className="flex flex-col items-center mb-10">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt="User avatar"
                className="w-32 h-32 rounded-full object-cover shadow-md border-4 border-blue-100"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-6xl font-black shadow-inner">
                {profile.name.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="profileName" className="block mb-2 font-medium text-gray-700">
                Name
              </label>
              <input
                id="profileName"
                type="text"
                value={profile.name}
                disabled={!isEditingProfile || loading}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                className={`w-full rounded-lg border ${
                  isEditingProfile
                    ? 'border-blue-500 focus:ring-2 focus:ring-blue-400 focus:border-blue-600'
                    : 'border-gray-300 bg-gray-100 cursor-not-allowed'
                } px-4 py-3 text-lg text-gray-900 transition`}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="profileEmail" className="block mb-2 font-medium text-gray-700">
                Email
              </label>
              <input
                id="profileEmail"
                type="email"
                value={profile.email}
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-lg text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center space-x-5">
              {isEditingProfile ? (
                <>
                  <button
                    disabled={loading}
                    onClick={handleUpdateProfile}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 py-3 font-semibold transition disabled:opacity-60"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => setIsEditingProfile(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg px-8 py-3 font-semibold transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="bg-blue-200 hover:bg-blue-300 text-blue-800 rounded-lg px-8 py-3 font-semibold transition"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="flex-1 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-semibold mb-8 border-b border-green-500 pb-2 text-green-700">
            Team Settings
          </h2>

          <div className="space-y-6">
            {/* Team ID */}
            <div>
              <label htmlFor="teamId" className="block mb-2 font-medium text-gray-700">
                Team ID
              </label>
              <input
                id="teamId"
                type="text"
                value={team._id || ''}
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-lg text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Team Name */}
            <div>
              <label htmlFor="teamName" className="block mb-2 font-medium text-gray-700">
                Team Name
              </label>
              <input
                id="teamName"
                type="text"
                value={team.name}
                disabled={!isEditingTeam || loading}
                onChange={(e) => setTeam((t) => ({ ...t, name: e.target.value }))}
                className={`w-full rounded-lg border px-4 py-3 text-lg transition ${
                  isEditingTeam
                    ? 'border-green-500 focus:ring-2 focus:ring-green-400 focus:border-green-600'
                    : 'border-gray-300 bg-gray-100 cursor-not-allowed'
                } text-gray-900`}
              />
            </div>

            {/* Created At */}
            <div>
              <label htmlFor="teamCreatedAt" className="block mb-2 font-medium text-gray-700">
                Created At
              </label>
              <input
                id="teamCreatedAt"
                type="text"
                value={
                  team.createdAt
                    ? new Date(team.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : ''
                }
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-lg text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Members Count */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Members Count</label>
              <input
                type="text"
                value={team.membersCount?.toString() || '0'}
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-lg text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center space-x-5 mt-6">
              {isEditingTeam ? (
                <>
                  <button
                    disabled={loading}
                    onClick={handleUpdateTeam}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-8 py-3 font-semibold transition disabled:opacity-60"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => setIsEditingTeam(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg px-8 py-3 font-semibold transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditingTeam(true)}
                  className="bg-green-200 hover:bg-green-300 text-green-700 rounded-lg px-8 py-3 font-semibold transition"
                >
                  Edit Team
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div> )
  );
}

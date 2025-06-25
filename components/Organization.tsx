'use client'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import toast from 'react-hot-toast'

interface Props {
    user_id: string
}

const Organization = ({ user_id }: Props) => {
    const router = useRouter()
    const [organizationData, setOrganizationData] = useState({
        name: '',
        description: '',
        address: '',
        contactPhone: '',
        country: '',
        website: '',
        Number_of_Employees: '',
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setOrganizationData((prevData) => ({
            ...prevData,
            [name]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        // Show loading toast
        const loadingToast = toast.loading('Creating organization...')

        try {
            const response = await fetch('/api/organization', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...organizationData,
                    userId: user_id, // Include userId in the request body
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess('Organization created successfully!')
                toast.success('Organization created successfully!')
                setOrganizationData({
                    name: '',
                    description: '',
                    address: '',
                    contactPhone: '',
                    country: '',
                    website: '',
                    Number_of_Employees: '',
                })
                router.push(`/teams`)
            } else {
                setError(data.error || 'Something went wrong.')
                toast.error(data.error || 'Something went wrong.')
            }
        } catch (err) {
            setError('Error connecting to the server.')
            toast.error('Error connecting to the server.')
        } finally {
            setLoading(false)
            // Dismiss loading toast
            toast.dismiss(loadingToast)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Left Side - Image */}
            <div className="flex-1 bg-cover bg-center hidden md:block" style={{ backgroundImage: 'url(https://www.cisworld.lk/storage/categories/organization-management.jpg)' }}>
                {/* You can replace the above URL with your image URL */}
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 bg-white p-8 rounded-2xl shadow-xl md:ml-6 max-w-xl mx-auto my-8 md:my-12">
                <h1 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Create an Organization</h1>

                {/* Success Message */}
                {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

                {/* Error Message */}
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Organization Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Organization Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={organizationData.name}
                            onChange={handleChange}
                            required
                            className="w-full mt-2 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Organization Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={organizationData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full mt-2 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label htmlFor="address" className="block text-sm font-semibold text-gray-700">Address</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={organizationData.address}
                            onChange={handleChange}
                            className="w-full mt-2 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Contact Email */}


                    {/* Contact Phone */}
                    <div>
                        <label htmlFor="contactPhone" className="block text-sm font-semibold text-gray-700">Phone Number</label>
                        <input
                            type="tel"
                            id="contactPhone"
                            name="contactPhone"
                            value={organizationData.contactPhone}
                            onChange={handleChange}
                            required
                            className="w-full mt-2 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="website" className="block text-sm font-semibold text-gray-700">Website Url</label>
                        <input
                            type="text"
                            id="website"
                            name="website"
                            value={organizationData.website}
                            onChange={handleChange}
                            className="w-full mt-2 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="country" className="block text-sm font-semibold text-gray-700">Country</label>
                        <input
                            type="text"
                            id="country"
                            name="country"
                            value={organizationData.country}
                            onChange={handleChange}
                            className="w-full mt-2 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="Number_of_Employees" className="block text-sm font-semibold text-gray-700">Number of Employees</label>
                        <select
                            id="Number_of_Employees"
                            name="Number_of_Employees"
                            value={organizationData.Number_of_Employees}
                            onChange={handleChange}
                            required
                            className="w-full mt-2 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" disabled>Select Number of Employees</option>
                            <option value="1-10">1-10</option>
                            <option value="11-50">11-50</option>
                            <option value="51-200">51-200</option>
                            <option value="201-500">201-500</option>
                            <option value="501-1000">501-1000</option>
                            <option value="1000+">1000+</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {loading ? 'Creating...' : 'Create Organization'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Organization

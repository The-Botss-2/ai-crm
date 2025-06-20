import { fetcher } from '@/lib/fetcher';
import React, { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { DateRange } from 'react-date-range';
import { addDays } from 'date-fns';
import 'react-date-range/dist/styles.css'; // for styles
import 'react-date-range/dist/theme/default.css'; // for default theme

const Overview = ({ lead_id, userid, team_id, email }: any) => {
    const { data: task = [], isLoading: taskLoading, error: taskError } = useSWR<any[]>(
        `/api/Lead_tasks?id=${lead_id}`,
        fetcher
    );
    const { data: meetings = [], isLoading: meetingsLoading, error: meetingError } = useSWR<any[]>(
        `/api/meetingDetail?id=${lead_id}`,
        fetcher
    );
    const { data: Conversation, isLoading: ConversationLoading, error: ConversationError, mutate: mutateConversation } = useSWR<any>(
        `https://callingagent.thebotss.com/api/conversations/by-lead?lead_id=${lead_id}`,
        fetcher
    );
    const { data: FormResponse, error: FormResponseError, isLoading: FormResponseLoading } = useSWR<any>(
        `/api/form-responses-email?email=${email}`,
        fetcher
    );
    const emailsKey = `https://crm-emails.thebotss.com/emails/conversation/${userid}/${email}`;
    const { data: emails, error: emailError, isLoading: emailLoading } = useSWR<any>(emailsKey, fetcher);

    const [selectionRange, setSelectionRange] = useState<any>({
        startDate: null,  // Initially null = no filter
        endDate: null,
        key: 'selection',
    });

    const filterDataByDate = (data: any[]) => {
        if (!data) return [];

        // If no date range is selected, return all data
        if (!selectionRange.startDate || !selectionRange.endDate) {
            return data;
        }

        return data.filter((item) => {
            let itemDate: Date | null = null;
            const possibleDates = [
                item?.createdAt,
                item?.created_at,
                item?.submittedAt,
                item?.date,
            ];

            for (let dateField of possibleDates) {
                if (dateField) {
                    const parsedDate = new Date(dateField);
                    if (!isNaN(parsedDate.getTime())) {
                        itemDate = parsedDate;
                        break;
                    }
                }
            }

            if (!itemDate) {
                return false;
            }

            const startDate = new Date(selectionRange.startDate);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(selectionRange.endDate);
            endDate.setHours(23, 59, 59, 999);

            return itemDate >= startDate && itemDate <= endDate;
        });
    };
    // Remove all the individual filtered state and replace with useMemo
    const filteredTasks = useMemo(() => filterDataByDate(task), [selectionRange, task]);
    const filteredMeetings = useMemo(() => filterDataByDate(meetings), [selectionRange, meetings]);
    const filteredConversations = useMemo(
        () => filterDataByDate(Conversation?.conversations),
        [selectionRange, Conversation?.conversations]
    );
    const filteredFormResponses = useMemo(
        () => filterDataByDate(FormResponse),
        [selectionRange, FormResponse]
    );
    const filteredEmails = useMemo(() => filterDataByDate(emails), [selectionRange, emails]);

    const [isDateRangeVisible, setIsDateRangeVisible] = useState(false);  // Toggle date range visibility



    // Then remove the entire problematic useEffect
    // Helper function to filter based on date range

    const handleDateChange = (ranges: any) => {
        // If user clicks the same date range again, clear the filter
        if (
            selectionRange.startDate &&
            selectionRange.endDate &&
            ranges.selection.startDate.getTime() === selectionRange.startDate.getTime() &&
            ranges.selection.endDate.getTime() === selectionRange.endDate.getTime()
        ) {
            setSelectionRange({
                startDate: null,
                endDate: null,
                key: 'selection',
            });
        } else {
            setSelectionRange(ranges.selection);
        }
    };

    // Toggle dropdown visibility
    const [openDetails, setOpenDetails] = useState<{ [key: string]: boolean }>({});

    const toggleDetails = (id: string) => {
        setOpenDetails((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const renderLoadingOrNotFound = (loading: boolean, data: any[], label: string) => {
        if (loading) {
            return (
                <div className="flex justify-center items-center my-4">
                    <p>Loading {label}...</p>
                </div>
            );
        }
        if (data?.length === 0) {
            return (
                <div className="flex justify-center items-center my-4">
                    <p>No {label} found</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="container">
            {/* Date Range Picker Button */}
            <div className="mb-6">
                <button
                    onClick={() => setIsDateRangeVisible(!isDateRangeVisible)} // Toggle visibility
                    className="text-blue-500 font-semibold"
                >
                    Filter by Date
                </button>
            </div>

            {/* Date Range Picker */}
            {isDateRangeVisible && (
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Filter by Date Range</h3>
                        {selectionRange?.startDate && (
                            <button
                                onClick={() => setSelectionRange({ startDate: null, endDate: null, key: 'selection' })}
                                className="text-sm text-red-500 hover:underline"
                            >
                                Clear Filter
                            </button>
                        )}
                    </div>
                    <DateRange
                        ranges={[selectionRange]}
                        onChange={handleDateChange}
                        moveRangeOnFirstSelection={false}
                        months={2}
                        direction="horizontal"
                    />
                </div>
            )}

            {/* Display Tasks */}
            {renderLoadingOrNotFound(taskLoading, filteredTasks, 'Tasks')}
            {filteredTasks?.length > 0 && (
                <div className="mb-8" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <h2 className="text-2xl font-bold mb-4">Linked Tasks</h2>
                    <div className="space-y-4">
                        {filteredTasks.map((task: any) => (
                            <div key={task?._id} className="border border-gray-300 p-4 rounded-lg shadow-sm">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold">{task?.title}</h4>
                                    <button
                                        onClick={() => toggleDetails(task?._id)}
                                        className="text-blue-500 hover:underline text-sm"
                                    >
                                        {openDetails[task?._id] ? 'Hide Details' : 'View Details'}
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500">Status: {task?.status}</p>
                                <p className="text-sm text-gray-500">Due Date: {new Date(task?.dueDate).toLocaleDateString()}</p>
                                <p className="text-sm text-gray-500">Priority: {task?.priority}</p>
                                <p className="text-sm text-gray-500">Assigned To: {task?.assignedTo?.name}</p>

                                {openDetails[task?._id] && (
                                    <div className="mt-4 text-sm text-gray-600">
                                        <p>Description: {task?.description}</p>
                                        <p>Created At: {new Date(task?.createdAt).toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Display Emails */}
            {renderLoadingOrNotFound(emailLoading, filteredEmails, 'Emails')}
            {filteredEmails && filteredEmails?.length > 0 && (
                <div className="mb-8" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <h2 className="text-2xl font-bold mb-4">Emails</h2>
                    <div className="space-y-4">
                        {filteredEmails.map((email: any) => (
                            <div key={email?.id} className="border border-gray-300 p-4 rounded-lg shadow-sm">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold">{email?.subject}</h4>
                                    <button
                                        onClick={() => toggleDetails(email?.id)}
                                        className="text-blue-500 hover:underline text-sm"
                                    >
                                        {openDetails[email?.id] ? 'Hide Details' : 'View Details'}
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500">Sender: {email?.sender?.name}</p>
                                <p className="text-sm text-gray-500">Date: {new Date(email?.date).toLocaleString()}</p>

                                {openDetails[email?.id] && (
                                    <div className="mt-4 text-sm text-gray-600">
                                        <p>Body: {email.body}</p>
                                        <a
                                            href={`mailto:${email?.sender?.email}`}
                                            className="text-blue-500 hover:underline"
                                        >
                                            Send Reply
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Display Meetings */}
            {renderLoadingOrNotFound(meetingsLoading, filteredMeetings, 'Meetings')}
            {filteredMeetings?.length > 0 && (
                <div className="mb-8" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <h2 className="text-2xl font-bold mb-4">Linked Meetings</h2>
                    <div className="space-y-4">
                        {filteredMeetings.map((meeting: any) => (
                            <div key={meeting?._id} className="border border-gray-300 p-4 rounded-lg shadow-sm">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold">{meeting?.title}</h4>
                                    <button
                                        onClick={() => toggleDetails(meeting?._id)}
                                        className="text-blue-500 hover:underline text-sm"
                                    >
                                        {openDetails[meeting?._id] ? 'Hide Details' : 'View Details'}
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500">Time: {new Date(meeting?.startTime).toLocaleString()}</p>
                                <p className="text-sm text-gray-500">Platform: {meeting?.platform}</p>
                                <a
                                    href={meeting?.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                >
                                    Join Meeting
                                </a>

                                {openDetails[meeting?._id] && (
                                    <div className="mt-4 text-sm text-gray-600">
                                        <p>Created At: {new Date(meeting?.createdAt).toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Display Conversations */}
            {renderLoadingOrNotFound(ConversationLoading, filteredConversations, 'Conversations')}
            {filteredConversations?.length > 0 && (
                <div className="mb-8" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <h2 className="text-2xl font-bold mb-4">Linked Conversations</h2>
                    <div className="space-y-4">
                        {filteredConversations.map((conversation: any) => (
                            <div key={conversation?._id} className="border border-gray-300 p-4 rounded-lg shadow-sm">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold">Conversation {conversation?.conversation_id}</h4>
                                    <button
                                        onClick={() => toggleDetails(conversation?._id)}
                                        className="text-blue-500 hover:underline text-sm"
                                    >
                                        {openDetails[conversation?._id] ? 'Hide Details' : 'View Details'}
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500">Summary: {conversation?.summary}</p>
                                <p className="text-sm text-gray-500">Duration: {conversation?.duration_seconds}s</p>
                                <p className="text-sm text-gray-500">Created At: {new Date(conversation?.created_at).toLocaleString()}</p>

                                {openDetails[conversation._id] && (
                                    <div className="mt-4 text-sm text-gray-600">
                                        <p>Full Summary: {conversation?.summary}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Display Form Responses */}
            {renderLoadingOrNotFound(FormResponseLoading, filteredFormResponses, 'Form Responses')}
            {filteredFormResponses?.length > 0 && (
                <div className="mb-8" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <h2 className="text-2xl font-bold mb-4">Form Responses</h2>
                    <div className="space-y-4">
                        {filteredFormResponses.map((response: any) => (
                            <div key={response._id} className="border border-gray-300 p-4 rounded-lg shadow-sm">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold">Response from {response.username}</h4>
                                    <button
                                        onClick={() => toggleDetails(response?._id)}
                                        className="text-blue-500 hover:underline text-sm"
                                    >
                                        {openDetails[response?._id] ? 'Hide Details' : 'View Details'}
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500">Category: {response?.category}</p>
                                <p className="text-sm text-gray-500">Submitted At: {new Date(response?.submittedAt).toLocaleString()}</p>

                                {openDetails[response._id] && (
                                    <div className="mt-4 text-sm text-gray-600">
                                        <p>Email: {response.email}</p>
                                        <div className="space-y-2">
                                            {response.responses.map((resp: any, index: number) => (
                                                <div key={index}>
                                                    <strong>{resp?.label}:</strong> {resp?.value}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Overview;



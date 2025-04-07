import React, { useState, useEffect, FormEvent } from 'react';
import { ITask, TaskPriority , UpdateTaskData } from '../../services/task.service'; // Adjust path if needed
import Button from '../common/Button'; // Adjust path if needed

// Define the props the modal will accept
interface EditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: ITask; // The task being edited
    onUpdate: (taskId: string, updatedData: UpdateTaskData) => Promise<void>; // Function to call on save
}

// Helper function to format date for input type="date"
const formatDateForInput = (dateString?: string | Date): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return ''; // Check if date is valid
        // Format as YYYY-MM-DD
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        console.error("Error formatting date:", e);
        return '';
    }
};


const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, task, onUpdate }) => {
    // State for form fields within the modal
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<'pending' | 'inProgress' | 'completed'>('pending');
    const [dueDate, setDueDate] = useState(''); // Store as YYYY-MM-DD string
    const [priority, setPriority] = useState<TaskPriority>('medium');
    const [isSaving, setIsSaving] = useState(false);

    // Effect to populate form state when the modal opens or the task prop changes
    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setStatus(task.status);
            setDueDate(formatDateForInput(task.dueDate)); // Format date correctly
            setPriority(task.priority);
        }
        // Reset saving state when modal opens
        setIsSaving(false);
    }, [task, isOpen]); // Rerun when task changes or modal opens

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const updatedData: UpdateTaskData = {
            title: title,
            description: description,
            status: status,
            priority: priority,
            dueDate: dueDate ? dueDate : null,
        };

        try {
            await onUpdate(task._id, updatedData);
        } catch (error) {
             console.error("Update failed from modal perspective", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Don't render anything if the modal isn't open
    if (!isOpen) {
        return null;
    }

    return (
        // Modal Overlay
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            {/* Modal Content */}
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-50">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-5 border-b">
                    <h3 className="text-xl font-semibold text-gray-900">Edit Task</h3>
                    <button
                        onClick={onClose}
                        type="button"
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                        aria-label="Close modal"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                    </button>
                </div>

                {/* Modal Body - Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                        <label htmlFor="edit-title" className="block mb-1 text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
                        <input type="text" id="edit-title" required value={title} disabled={isSaving}
                            onChange={(e) => setTitle(e.target.value)}
                            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        />
                    </div>
                    {/* Description */}
                     <div>
                        <label htmlFor="edit-description" className="block mb-1 text-sm font-medium text-gray-700">Description</label>
                        <textarea id="edit-description" rows={3} value={description} disabled={isSaving}
                            onChange={(e) => setDescription(e.target.value)}
                            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        ></textarea>
                    </div>
                     {/* Status */}
                    <div>
                         <label htmlFor="edit-status" className="block mb-1 text-sm font-medium text-gray-700">Status</label>
                         <select id="edit-status" value={status} disabled={isSaving}
                            onChange={(e) => setStatus(e.target.value as ITask['status'])}
                             className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                         >
                            <option value="pending">Pending</option>
                            <option value="inProgress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                     {/* Due Date */}
                    <div>
                        <label htmlFor="edit-dueDate" className="block mb-1 text-sm font-medium text-gray-700">Due Date</label>
                        <input type="date" id="edit-dueDate" value={dueDate} disabled={isSaving}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        />
                    </div>
                     {/* Priority */}
                    <div>
                        <label htmlFor="edit-priority" className="block mb-1 text-sm font-medium text-gray-700">Priority</label>
                        <select id="edit-priority" value={priority} disabled={isSaving}
                            onChange={(e) => setPriority(e.target.value as TaskPriority)}
                            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    {/* Modal Footer - Actions */}
                    <div className="flex items-center pt-4 border-t border-gray-200 rounded-b space-x-2">
                        <Button type="submit" variant="primary" isLoading={isSaving} disabled={isSaving}>
                            Save changes
                        </Button>
                        <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTaskModal;
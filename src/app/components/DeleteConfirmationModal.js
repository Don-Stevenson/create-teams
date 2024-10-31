import React from 'react'

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  playerName,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="p-6 rounded-lg bg-white w-[260px] sm:w-[350px]">
        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
        <p>Are you sure you want to delete {playerName}?</p>
        <div className="flex sm:justify-end justify-between mt-4">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-loonsRed hover:bg-red-900 text-loonsBeige border-2 border-red-900 font-bold py-2 px-4 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationModal

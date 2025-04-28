// app/feedback/page.tsx

'use client'; // Mark this component as a Client Component

import { useState } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navigation';

const FeedbackForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!name || !email || !message) {
      setError('All fields are required.');
      return;
    }

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit feedback');
      }

      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Feedback Form</h2>
      {success && <p className="text-green-600 mb-4">Thank you for your feedback!</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-800"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-800"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-800"
            rows={4}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#22c55e] text-white font-semibold py-2 rounded-md hover:bg-[#1ea550] transition-colors"
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

const FeedbackPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#faf3e7]">
      <Navbar />
      <main className="flex-grow py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <FeedbackForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FeedbackPage;    
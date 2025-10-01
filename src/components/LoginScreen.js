import React from 'react';
import { FileText, Users } from 'lucide-react';

function LoginScreen({ onLogin }) {
  const handleLogin = (type) => {
    onLogin({ type, name: type === 'admin' ? 'Admin User' : 'Employee User' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Unicorn Valves</h1>
          <p className="text-gray-600 mt-2">Estimate Management System</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleLogin('admin')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <Users size={20} />
            Login as Admin
          </button>
          <button
            onClick={() => handleLogin('employee')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <FileText size={20} />
            Login as Employee
          </button>
        </div>

        <p className="text-sm text-gray-500 text-center mt-6">
          Demo Mode - Firebase authentication will be integrated
        </p>
      </div>
    </div>
  );
}

export default LoginScreen;
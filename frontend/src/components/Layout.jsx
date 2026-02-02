import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Sidebar />
            <main className="md:ml-64 pt-20 px-6 pb-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;

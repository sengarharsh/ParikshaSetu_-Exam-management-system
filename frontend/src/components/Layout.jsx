import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 font-sans text-slate-900">
            <Navbar />
            <Sidebar />
            <main className="flex-1 overflow-y-auto overflow-x-hidden md:ml-72 pt-28 px-8 pb-12 transition-all duration-300">
                {children}
            </main>
        </div>
    );
};

export default Layout;

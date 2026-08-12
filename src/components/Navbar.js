import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, Menu, X } from 'lucide-react';

function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const links = [
    { path: '/',        label: 'Home' },
    { path: '/detect',  label: 'Detect Disease' },
    { path: '/pest', label: 'Pest ID' },
    { path: '/chat',    label: 'Ask AI' },
    { path: '/calendar', label: 'Crop Calendar' },
    { path: '/fertilizer', label: 'Fertilizer Calc' },
    { path: '/map', label: 'Disease Map' },
    { path: '/weather', label: 'Weather' },
    { path: '/analytics', label: 'Insights' },
    { path: '/about',   label: 'About' },
  ];

  return (
    <nav className="bg-green-700 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <Leaf size={24} />
          CropGuard AI
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex gap-6">
          {links.map(l => (
            <Link
              key={l.path}
              to={l.path}
              className={`hover:text-green-200 transition ${
                location.pathname === l.path ? 'text-green-200 font-semibold' : ''
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-green-800 px-4 pb-4 flex flex-col gap-3">
          {links.map(l => (
            <Link
              key={l.path}
              to={l.path}
              onClick={() => setOpen(false)}
              className="hover:text-green-200 transition"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

export default Navbar;

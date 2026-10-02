/**
 * Footer — site-wide footer with links, social, and copyright.
 */

import { Link } from 'react-router-dom'
import { Briefcase, Twitter, Linkedin, Github, Mail } from 'lucide-react'

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container-page py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <Briefcase size={16} className="text-white" strokeWidth={2.5} />
              </div>
              JobBoard
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Connecting talented professionals with great companies. Find your dream job or hire top talent today.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: Twitter,  href: '#', label: 'Twitter' },
                { Icon: Linkedin, href: '#', label: 'LinkedIn' },
                { Icon: Github,   href: '#', label: 'GitHub' },
                { Icon: Mail,     href: '#', label: 'Email' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="h-9 w-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* For Job Seekers */}
          <div>
            <h4 className="text-white font-semibold mb-4">For Job Seekers</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Browse Jobs', to: '/jobs' },
                { label: 'Create Account', to: '/register' },
                { label: 'Login', to: '/login' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-white font-semibold mb-4">For Employers</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Post a Job', to: '/employer/post-job' },
                { label: 'Manage Jobs', to: '/employer/jobs' },
                { label: 'View Applicants', to: '/employer/applicants' },
                { label: 'Employer Dashboard', to: '/employer/dashboard' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'API Documentation', href: 'http://localhost:8000/swagger/' },
                { label: 'Privacy Policy', to: '/' },
                { label: 'Terms of Service', to: '/' },
                { label: 'Contact Us', to: '/' },
              ].map(({ label, to, href }) => (
                <li key={label}>
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-slate-400 hover:text-white transition-colors">
                      {label}
                    </a>
                  ) : (
                    <Link to={to} className="text-sm text-slate-400 hover:text-white transition-colors">
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            © {year} JobBoard. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            Built with React + Django REST Framework
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

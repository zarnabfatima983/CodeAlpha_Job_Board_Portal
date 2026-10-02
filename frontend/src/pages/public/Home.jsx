/**
 * Home page — hero, search, featured jobs, categories, stats, CTA sections.
 * Fetches real data from /api/jobs/open/ and /api/jobs/categories/.
 */

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Search, MapPin, ArrowRight, Briefcase, Users, Building2,
  TrendingUp, CheckCircle, Star, Zap, Globe, Shield,
} from 'lucide-react'
import { getOpenJobs } from '../../api/jobsApi'
import { getCategories } from '../../api/jobsApi'
import JobCard from '../../components/shared/JobCard'
import { SkeletonList } from '../../components/ui/SkeletonCard'
import { useAuth } from '../../context/AuthContext'

// ── Category icon map ─────────────────────────────────────────────────────────
const CATEGORY_ICONS = {
  default: Briefcase,
}

// ── Stats data (static + real counts merged) ─────────────────────────────────
const STATIC_STATS = [
  { label: 'Active Jobs',      icon: Briefcase, color: 'text-primary-600', bg: 'bg-primary-50' },
  { label: 'Companies Hiring', icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Job Seekers',      icon: Users,     color: 'text-violet-600',  bg: 'bg-violet-50'  },
  { label: 'Success Rate',     icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50'  },
]

const HOW_IT_WORKS_SEEKER = [
  { step: '01', title: 'Create Your Profile',  desc: 'Sign up and build a compelling profile with your skills, experience and resume.' },
  { step: '02', title: 'Browse & Search Jobs', desc: 'Explore thousands of jobs filtered by role, location, salary and job type.' },
  { step: '03', title: 'Apply with One Click', desc: 'Submit your application directly through the platform with your uploaded resume.' },
  { step: '04', title: 'Track Your Progress',  desc: 'Monitor application statuses from your personal dashboard in real time.' },
]

const HOW_IT_WORKS_RECRUITER = [
  { step: '01', title: 'Create Employer Account', desc: 'Register and set up your company profile with logo and description.' },
  { step: '02', title: 'Post Your Job',            desc: 'Fill out a detailed job posting with requirements, salary and deadline.' },
  { step: '03', title: 'Review Applications',      desc: 'Browse candidate applications, view resumes and shortlist talent.' },
  { step: '04', title: 'Hire the Best',            desc: 'Update application statuses and notify candidates directly.' },
]

const Home = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isEmployer } = useAuth()

  const [keyword, setKeyword]       = useState('')
  const [location, setLocation]     = useState('')
  const [featuredJobs, setFeaturedJobs] = useState([])
  const [categories, setCategories]     = useState([])
  const [jobsLoading, setJobsLoading]   = useState(true)
  const [totalJobs, setTotalJobs]       = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, catRes] = await Promise.all([
          getOpenJobs({ page: 1, page_size: 6, ordering: '-created_at' }),
          getCategories(),
        ])
        const jobsData = jobsRes.data
        setFeaturedJobs(jobsData.results ?? jobsData)
        setTotalJobs(jobsData.count ?? (jobsData.results ?? jobsData).length)
        setCategories((catRes.data.results ?? catRes.data).slice(0, 8))
      } catch {
        // non-critical — home still renders without live data
      } finally {
        setJobsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (keyword.trim()) params.set('search', keyword.trim())
    if (location.trim()) params.set('location', location.trim())
    navigate(`/jobs?${params.toString()}`)
  }

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary-600/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary-500/20 blur-3xl" />
        </div>

        <div className="container-page relative py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <Zap size={12} className="text-yellow-400" />
              {totalJobs > 0 ? `${totalJobs.toLocaleString()} open positions available` : 'New jobs added daily'}
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Find Your{' '}
              <span className="relative inline-block">
                <span className="text-yellow-400">Dream Job</span>
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10 Q150 2 298 10" stroke="#facc15" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5"/>
                </svg>
              </span>
              {' '}Today
            </h1>

            <p className="text-lg text-primary-100 mb-10 leading-relaxed max-w-xl mx-auto">
              Connect with top companies and discover opportunities that match your skills, experience, and career goals.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-3 flex-1 px-4 py-2">
                <Search size={18} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Job title, keyword, or company..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="flex-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                />
              </div>
              <div className="hidden sm:block w-px bg-slate-200 my-1" />
              <div className="flex items-center gap-3 flex-1 px-4 py-2">
                <MapPin size={18} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="City, state, or remote..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                />
              </div>
              <button
                type="submit"
                className="btn-primary btn btn-lg rounded-xl flex-shrink-0 px-8"
              >
                <Search size={16} />
                Search
              </button>
            </form>

            <p className="text-primary-200 text-sm mt-4">
              Popular: <span className="font-medium">React Developer</span>, <span className="font-medium">Python Engineer</span>, <span className="font-medium">Product Manager</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100">
        <div className="container-page py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: totalJobs > 0 ? `${totalJobs.toLocaleString()}+` : '500+', label: 'Active Jobs',      icon: Briefcase, color: 'text-primary-600', bg: 'bg-primary-50' },
              { value: '200+',  label: 'Companies Hiring', icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { value: '10K+',  label: 'Job Seekers',      icon: Users,     color: 'text-violet-600',  bg: 'bg-violet-50'  },
              { value: '94%',   label: 'Placement Rate',   icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50'  },
            ].map(({ value, label, icon: Icon, color, bg }) => (
              <div key={label} className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={22} className={color} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{value}</p>
                  <p className="text-sm text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED JOBS ─────────────────────────────────────────────────── */}
      <section className="section bg-slate-50">
        <div className="container-page">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-primary-600 text-sm font-semibold mb-1 uppercase tracking-wide">Latest Opportunities</p>
              <h2 className="text-3xl font-bold text-slate-900">Featured Jobs</h2>
            </div>
            <Link to="/jobs" className="hidden sm:flex items-center gap-1.5 text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors">
              View all jobs <ArrowRight size={16} />
            </Link>
          </div>

          {jobsLoading ? (
            <SkeletonList count={6} />
          ) : featuredJobs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {featuredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              <div className="text-center mt-8">
                <Link to="/jobs" className="btn-primary btn btn-lg">
                  Explore All Jobs <ArrowRight size={16} />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Briefcase size={40} className="text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-slate-500">No jobs available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="section bg-white">
          <div className="container-page">
            <div className="text-center mb-10">
              <p className="text-primary-600 text-sm font-semibold mb-1 uppercase tracking-wide">Browse by Industry</p>
              <h2 className="text-3xl font-bold text-slate-900">Popular Categories</h2>
              <p className="text-slate-500 mt-2 max-w-lg mx-auto">
                Explore opportunities across the fastest-growing industries.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/jobs?category=${cat.id}`}
                  className="group card-hover p-5 flex flex-col items-center text-center gap-3"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                    <Briefcase size={22} className="text-primary-600" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm group-hover:text-primary-600 transition-colors">
                      {cat.category_name}
                    </p>
                    {cat.jobs_count > 0 && (
                      <p className="text-xs text-slate-400 mt-0.5">{cat.jobs_count} open jobs</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="section bg-slate-50">
        <div className="container-page">
          <div className="text-center mb-12">
            <p className="text-primary-600 text-sm font-semibold mb-1 uppercase tracking-wide">Simple Process</p>
            <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-14">
            {/* For Job Seekers */}
            <div>
              <div className="flex items-center gap-3 mb-7">
                <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center">
                  <Users size={18} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">For Job Seekers</h3>
              </div>
              <div className="space-y-5">
                {HOW_IT_WORKS_SEEKER.map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-4">
                    <div className="h-9 w-9 rounded-lg bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {step}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 mb-0.5">{title}</p>
                      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              {!isAuthenticated && (
                <Link to="/register" className="btn-primary btn btn-lg mt-7 inline-flex">
                  Get Started Free <ArrowRight size={16} />
                </Link>
              )}
            </div>

            {/* For Recruiters */}
            <div>
              <div className="flex items-center gap-3 mb-7">
                <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                  <Building2 size={18} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">For Recruiters</h3>
              </div>
              <div className="space-y-5">
                {HOW_IT_WORKS_RECRUITER.map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-4">
                    <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {step}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 mb-0.5">{title}</p>
                      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              {(!isAuthenticated || !isEmployer) && (
                <Link to="/register" className="inline-flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 btn btn-lg mt-7 focus:ring-emerald-500">
                  Post a Job <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ────────────────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="container-page">
          <div className="text-center mb-12">
            <p className="text-primary-600 text-sm font-semibold mb-1 uppercase tracking-wide">Why JobBoard</p>
            <h2 className="text-3xl font-bold text-slate-900">Built for Modern Hiring</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap,       title: 'Fast & Easy Applications', desc: 'Apply to jobs in seconds with your saved resume and profile.', color: 'text-yellow-500', bg: 'bg-yellow-50' },
              { icon: Shield,    title: 'Verified Employers',       desc: 'All companies are reviewed to ensure legitimate job postings.', color: 'text-blue-500',   bg: 'bg-blue-50'   },
              { icon: Globe,     title: 'Remote-First Options',     desc: 'Find remote, hybrid, and on-site roles from anywhere in the world.', color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { icon: Star,      title: 'Top Companies',            desc: 'Opportunities from startups to Fortune 500 companies.', color: 'text-orange-500', bg: 'bg-orange-50' },
              { icon: TrendingUp,title: 'Career Growth',            desc: 'Discover roles aligned with your career trajectory and goals.', color: 'text-violet-500', bg: 'bg-violet-50' },
              { icon: CheckCircle,title:'Real-Time Status Updates', desc: 'Know exactly where your application stands at every stage.', color: 'text-primary-500', bg: 'bg-primary-50' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="card p-6 hover:shadow-md transition-shadow">
                <div className={`h-12 w-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon size={22} className={color} strokeWidth={1.8} />
                </div>
                <h4 className="font-semibold text-slate-900 mb-1.5">{title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      {!isAuthenticated && (
        <section className="bg-gradient-to-r from-primary-700 to-primary-900 py-20">
          <div className="container-page text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Take the Next Step?
            </h2>
            <p className="text-primary-200 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of professionals who have found their ideal role through JobBoard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn btn-lg bg-white text-primary-700 hover:bg-primary-50 focus:ring-white font-semibold rounded-xl"
              >
                Create Free Account <ArrowRight size={16} />
              </Link>
              <Link
                to="/jobs"
                className="btn btn-lg border-2 border-white/40 text-white hover:bg-white/10 focus:ring-white rounded-xl"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home

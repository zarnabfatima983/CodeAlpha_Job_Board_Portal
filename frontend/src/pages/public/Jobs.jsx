/**
 * Jobs listing page — full search, filter, sort, pagination.
 *
 * API: GET /api/jobs/list/
 * Params: search, location, category, employment_type, remote_option,
 *         salary_min_gte, salary_max_lte, ordering, page, page_size
 *
 * URL params are synced with the browser URL so filters are shareable/bookmarkable.
 */

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search, MapPin, SlidersHorizontal, X, ChevronDown,
  Briefcase, Filter, RefreshCw,
} from 'lucide-react'
import { getJobs, getCategories } from '../../api/jobsApi'
import JobCard from '../../components/shared/JobCard'
import Pagination from '../../components/shared/Pagination'
import { SkeletonList } from '../../components/ui/SkeletonCard'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'

const PAGE_SIZE = 12

const EMPLOYMENT_TYPES = [
  { value: '',           label: 'All Types' },
  { value: 'full_time',  label: 'Full Time' },
  { value: 'part_time',  label: 'Part Time' },
  { value: 'contract',   label: 'Contract' },
  { value: 'freelance',  label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
]

const SORT_OPTIONS = [
  { value: '-created_at',          label: 'Newest First' },
  { value: 'created_at',           label: 'Oldest First' },
  { value: '-salary_max',          label: 'Highest Salary' },
  { value: 'salary_min',           label: 'Lowest Salary' },
  { value: 'application_deadline', label: 'Deadline Soon' },
]

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // Read initial values from URL
  const [search,   setSearch]   = useState(searchParams.get('search')   || '')
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [empType,  setEmpType]  = useState(searchParams.get('employment_type') || '')
  const [remote,   setRemote]   = useState(searchParams.get('remote_option') || '')
  const [salMin,   setSalMin]   = useState(searchParams.get('salary_min_gte') || '')
  const [salMax,   setSalMax]   = useState(searchParams.get('salary_max_lte') || '')
  const [ordering, setOrdering] = useState(searchParams.get('ordering') || '-created_at')
  const [page,     setPage]     = useState(Number(searchParams.get('page')) || 1)

  const [jobs,       setJobs]       = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [filtersOpen,setFiltersOpen]= useState(false)

  // Load categories once
  useEffect(() => {
    getCategories()
      .then((r) => setCategories(r.data.results ?? r.data))
      .catch(() => {})
  }, [])

  // Build query params object from state
  const buildParams = useCallback(() => {
    const p = { page, page_size: PAGE_SIZE, ordering }
    if (search.trim())   p.search   = search.trim()
    if (location.trim()) p.location = location.trim()
    if (category)        p.category = category
    if (empType)         p.employment_type = empType
    if (remote)          p.remote_option   = remote
    if (salMin)          p.salary_min_gte  = salMin
    if (salMax)          p.salary_max_lte  = salMax
    return p
  }, [page, ordering, search, location, category, empType, remote, salMin, salMax])

  // Fetch jobs whenever filters change
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = buildParams()
        const res = await getJobs(params)
        const data = res.data
        setJobs(data.results ?? data)
        setTotalCount(data.count ?? (data.results ?? data).length)

        // Sync URL
        const urlParams = {}
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== '' && k !== 'page_size') urlParams[k] = String(v)
        })
        setSearchParams(urlParams, { replace: true })
      } catch (err) {
        setError('Failed to load jobs. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [buildParams])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
  }

  const clearFilters = () => {
    setSearch(''); setLocation(''); setCategory(''); setEmpType('')
    setRemote(''); setSalMin(''); setSalMax(''); setOrdering('-created_at')
    setPage(1)
  }

  const activeFilterCount = [category, empType, remote, salMin, salMax]
    .filter(Boolean).length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-page py-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Browse Jobs</h1>
          <p className="text-slate-500 text-sm">
            {loading ? 'Searching…' : `${totalCount.toLocaleString()} job${totalCount !== 1 ? 's' : ''} found`}
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-5 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Job title, keyword, or company…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9"
              />
            </div>
            <div className="relative flex-1 sm:max-w-xs">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Location…"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input pl-9"
              />
            </div>
            <button type="submit" className="btn-primary btn">
              <Search size={15} /> Search
            </button>
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              className={`btn btn-sm px-3 py-2.5 flex items-center gap-2 border transition-colors ${
                filtersOpen || activeFilterCount > 0
                  ? 'bg-primary-50 border-primary-300 text-primary-700'
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="h-5 w-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-medium">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </form>

          {/* Expandable filters */}
          {filtersOpen && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {/* Category */}
                <div>
                  <label className="label text-xs">Category</label>
                  <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setPage(1) }}
                    className="input text-sm"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.category_name}</option>
                    ))}
                  </select>
                </div>

                {/* Employment type */}
                <div>
                  <label className="label text-xs">Job Type</label>
                  <select
                    value={empType}
                    onChange={(e) => { setEmpType(e.target.value); setPage(1) }}
                    className="input text-sm"
                  >
                    {EMPLOYMENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Remote */}
                <div>
                  <label className="label text-xs">Work Mode</label>
                  <select
                    value={remote}
                    onChange={(e) => { setRemote(e.target.value); setPage(1) }}
                    className="input text-sm"
                  >
                    <option value="">All Modes</option>
                    <option value="true">Remote Only</option>
                    <option value="false">On-site Only</option>
                  </select>
                </div>

                {/* Salary min */}
                <div>
                  <label className="label text-xs">Min Salary ($)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 50000"
                    value={salMin}
                    onChange={(e) => { setSalMin(e.target.value); setPage(1) }}
                    className="input text-sm"
                  />
                </div>

                {/* Salary max */}
                <div>
                  <label className="label text-xs">Max Salary ($)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 120000"
                    value={salMax}
                    onChange={(e) => { setSalMax(e.target.value); setPage(1) }}
                    className="input text-sm"
                  />
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-3 flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  <X size={14} /> Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="container-page py-8">
        {/* Sort + count row */}
        <div className="flex items-center justify-between mb-5 gap-3">
          <p className="text-sm text-slate-500 hidden sm:block">
            {loading ? '' : `Showing ${jobs.length} of ${totalCount} results`}
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm text-slate-500 whitespace-nowrap">Sort by:</label>
            <select
              value={ordering}
              onChange={(e) => { setOrdering(e.target.value); setPage(1) }}
              className="input text-sm py-1.5 w-auto min-w-[160px]"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filter pills */}
        {(activeFilterCount > 0 || search || location) && !loading && (
          <div className="flex flex-wrap gap-2 mb-5">
            {search && (
              <span className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-700 text-xs font-medium px-3 py-1.5 rounded-full">
                <Search size={11} /> {search}
                <button onClick={() => { setSearch(''); setPage(1) }}><X size={11} /></button>
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-700 text-xs font-medium px-3 py-1.5 rounded-full">
                <MapPin size={11} /> {location}
                <button onClick={() => { setLocation(''); setPage(1) }}><X size={11} /></button>
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full">
                {categories.find((c) => String(c.id) === category)?.category_name || 'Category'}
                <button onClick={() => { setCategory(''); setPage(1) }}><X size={11} /></button>
              </span>
            )}
            {empType && (
              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full">
                {EMPLOYMENT_TYPES.find((t) => t.value === empType)?.label}
                <button onClick={() => { setEmpType(''); setPage(1) }}><X size={11} /></button>
              </span>
            )}
            {remote && (
              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full">
                {remote === 'true' ? 'Remote Only' : 'On-site Only'}
                <button onClick={() => { setRemote(''); setPage(1) }}><X size={11} /></button>
              </span>
            )}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <SkeletonList count={PAGE_SIZE} />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => setPage((p) => p)}
          />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs found"
            description="Try adjusting your search terms or clearing your filters to see more results."
            action={{ label: 'Clear Filters', onClick: clearFilters }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              count={totalCount}
              onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default Jobs

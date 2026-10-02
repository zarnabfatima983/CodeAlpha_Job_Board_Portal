/**
 * JobCard — compact job listing card used in grids/lists.
 * Links to /jobs/<id> for full details.
 */

import { Link } from 'react-router-dom'
import { MapPin, Clock, DollarSign, Wifi, Building2 } from 'lucide-react'
import Badge from '../ui/Badge'
import { formatSalary, getEmploymentLabel, timeAgo, mediaUrl } from '../../utils/helpers'

const EMPLOYMENT_COLOR = {
  full_time:  'blue',
  part_time:  'green',
  contract:   'orange',
  freelance:  'purple',
  internship: 'indigo',
}

const JobCard = ({ job }) => {
  const logoSrc = mediaUrl(job.employer?.company_logo)
  const companyName = job.employer?.company_name || 'Company'
  const employmentColor = EMPLOYMENT_COLOR[job.employment_type] || 'gray'

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="card-hover p-5 flex flex-col gap-4 group block"
      aria-label={`${job.title} at ${companyName}`}
    >
      {/* Top: logo + company */}
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {logoSrc ? (
            <img src={logoSrc} alt={companyName} className="h-full w-full object-cover" />
          ) : (
            <Building2 size={22} className="text-slate-400" strokeWidth={1.5} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 text-sm leading-tight group-hover:text-primary-600 transition-colors line-clamp-1">
            {job.title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{companyName}</p>
        </div>
        {job.remote_option && (
          <span className="flex-shrink-0 flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
            <Wifi size={11} /> Remote
          </span>
        )}
      </div>

      {/* Description snippet */}
      {job.description && (
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {job.description}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {job.employment_type && (
          <Badge color={employmentColor}>
            {getEmploymentLabel(job.employment_type)}
          </Badge>
        )}
        {job.category?.category_name && (
          <Badge color="gray">{job.category.category_name}</Badge>
        )}
      </div>

      {/* Footer: location + salary + date */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          {job.location && (
            <span className="flex items-center gap-1 text-xs text-slate-500 truncate">
              <MapPin size={12} className="flex-shrink-0 text-slate-400" />
              {job.location}
            </span>
          )}
          {(job.salary_min || job.salary_max) && (
            <span className="flex items-center gap-1 text-xs text-slate-600 font-medium truncate">
              <DollarSign size={12} className="flex-shrink-0 text-slate-400" />
              {formatSalary(job.salary_min, job.salary_max)}
            </span>
          )}
        </div>
        <span className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
          <Clock size={11} />
          {timeAgo(job.created_at)}
        </span>
      </div>
    </Link>
  )
}

export default JobCard

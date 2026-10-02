/**
 * Candidate — Resume management page.
 * APIs:
 *   GET    /api/resumes/              → list own resumes
 *   POST   /api/resumes/upload/       → upload PDF (multipart, max 5MB)
 *   PUT    /api/resumes/<id>/         → rename resume
 *   DELETE /api/resumes/<id>/         → delete
 *   GET    /api/resumes/<id>/download/ → download PDF
 */

import { useState, useEffect, useRef } from 'react'
import {
  FileText, Upload, Trash2, Download, Edit2,
  Save, X, AlertCircle, Plus, File,
} from 'lucide-react'
import { getResumes, uploadResume, updateResume, deleteResume, downloadResume } from '../../api/resumesApi'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { formatDate, extractErrorMessage } from '../../utils/helpers'
import toast from 'react-hot-toast'

const MAX_SIZE_MB = 5

const Resumes = () => {
  const [resumes,    setResumes]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [uploading,  setUploading]  = useState(false)
  const [deleteId,   setDeleteId]   = useState(null)
  const [deleting,   setDeleting]   = useState(false)
  const [editId,     setEditId]     = useState(null)
  const [editTitle,  setEditTitle]  = useState('')
  const [saving,     setSaving]     = useState(false)
  const [dragOver,   setDragOver]   = useState(false)
  const fileRef = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getResumes()
      setResumes(res.data?.results ?? res.data ?? [])
    } catch {
      toast.error('Failed to load resumes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleFile = async (file) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.'); return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File must be under ${MAX_SIZE_MB}MB.`); return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('resume_file', file)
      fd.append('title', file.name.replace('.pdf', '') || 'My Resume')
      await uploadResume(fd)
      toast.success('Resume uploaded!')
      await load()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (e) => handleFile(e.target.files[0])
  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteResume(deleteId)
      setResumes((prev) => prev.filter((r) => r.id !== deleteId))
      toast.success('Resume deleted.')
    } catch {
      toast.error('Failed to delete resume.')
    } finally {
      setDeleting(false); setDeleteId(null)
    }
  }

  const handleRename = async (id) => {
    if (!editTitle.trim()) return
    setSaving(true)
    try {
      await updateResume(id, { title: editTitle.trim() })
      setResumes((prev) => prev.map((r) => r.id === id ? { ...r, title: editTitle.trim() } : r))
      toast.success('Resume renamed.')
      setEditId(null)
    } catch {
      toast.error('Failed to rename.')
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = async (id, title) => {
    try {
      const res = await downloadResume(id)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url; a.download = `${title}.pdf`
      document.body.appendChild(a); a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Failed to download resume.')
    }
  }

  if (loading) return <div className="flex items-center justify-center py-24"><LoadingSpinner size="lg" text="Loading resumes…" /></div>

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resumes</h1>
          <p className="text-slate-500 text-sm mt-0.5">{resumes.length} resume{resumes.length !== 1 ? 's' : ''} uploaded</p>
        </div>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
          dragOver ? 'border-primary-400 bg-primary-50' : 'border-slate-300 bg-slate-50 hover:border-primary-300 hover:bg-primary-50/30'
        }`}
        onClick={() => !uploading && fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleInputChange} />
        {uploading ? (
          <LoadingSpinner size="md" text="Uploading resume…" />
        ) : (
          <>
            <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mx-auto mb-3">
              <Upload size={24} className="text-primary-600" strokeWidth={1.8} />
            </div>
            <p className="font-semibold text-slate-700 mb-1">
              {dragOver ? 'Drop your PDF here' : 'Upload Resume'}
            </p>
            <p className="text-sm text-slate-400">Drag & drop a PDF, or click to browse</p>
            <p className="text-xs text-slate-400 mt-1">PDF only · Max {MAX_SIZE_MB}MB</p>
            <div className="inline-flex items-center gap-2 btn-primary btn btn-sm mt-4" onClick={(e) => { e.stopPropagation(); fileRef.current?.click() }}>
              <Plus size={14} /> Choose File
            </div>
          </>
        )}
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
        <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
        Select your resume when applying for a job to include it with your application.
      </div>

      {/* Resume list */}
      {resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resumes uploaded"
          description="Upload your resume so employers can review it when you apply for jobs."
        />
      ) : (
        <div className="space-y-3">
          {resumes.map((resume) => (
            <div key={resume.id} className="card p-4 flex items-center gap-4">
              {/* Icon */}
              <div className="h-11 w-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                <File size={20} className="text-red-500" strokeWidth={1.5} />
              </div>

              {/* Info / rename */}
              <div className="flex-1 min-w-0">
                {editId === resume.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="input text-sm py-1.5 flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(resume.id)
                        if (e.key === 'Escape') setEditId(null)
                      }}
                    />
                    <button onClick={() => handleRename(resume.id)} disabled={saving} className="btn-primary btn btn-sm px-2 py-1.5">
                      {saving ? '…' : <Save size={13} />}
                    </button>
                    <button onClick={() => setEditId(null)} className="btn-ghost btn btn-sm px-2 py-1.5">
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="font-medium text-slate-800 text-sm truncate">{resume.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {resume.file_size && <span>{resume.file_size} · </span>}
                      Uploaded {formatDate(resume.uploaded_at)}
                    </p>
                  </>
                )}
              </div>

              {/* Actions */}
              {editId !== resume.id && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleDownload(resume.id, resume.title)}
                    className="p-2 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    title="Download"
                  >
                    <Download size={15} />
                  </button>
                  <button
                    onClick={() => { setEditId(resume.id); setEditTitle(resume.title) }}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Rename"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteId(resume.id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Resume?"
        message="This will permanently delete the resume file. This cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}

export default Resumes

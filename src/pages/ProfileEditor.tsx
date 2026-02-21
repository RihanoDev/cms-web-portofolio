import React from 'react'
import { ContentStore, type Profile } from '../services/content'

// Card component for consistent UI
const Card = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
    <div className="border-b border-slate-700 px-6 py-4">
      <h3 className="font-semibold text-white m-0">{title}</h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
)

// Form input component
const FormInput = ({ 
  label, 
  id, 
  value, 
  onChange, 
  type = 'text', 
  multiline = false,
  placeholder = '' 
}: { 
  label: string, 
  id: string, 
  value: string, 
  onChange: (value: string) => void,
  type?: string,
  multiline?: boolean,
  placeholder?: string
}) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
    {multiline ? (
      <textarea 
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none min-h-[120px] resize-y"
      />
    ) : (
      <input 
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
      />
    )}
  </div>
)

export default function ProfileEditor(){
  const [name, setName] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [bio, setBio] = React.useState('')
  const [preview, setPreview] = React.useState<string>('')
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const p = ContentStore.getProfile()
    setName(p.name)
    setTitle(p.title) 
    setBio(p.bio)
    setPreview(p.avatarDataUrl || '')
  }, [])

  // Convert file to data URL
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Convert to data URL to store in localStorage
      const dataUrl = await fileToDataUrl(file)
      setPreview(dataUrl)
    } catch (err) {
      console.error("Error processing image:", err)
      alert("Failed to process image. Please try again.")
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const save = async () => {
    setSaving(true)
    try {
      const profile: Profile = { name, title, bio, avatarDataUrl: preview }
      ContentStore.saveProfile(profile)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000) // Hide success message after 3 seconds
    } catch (err) {
      console.error("Error saving profile:", err)
      alert("Failed to save profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {saved && (
        <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
          </svg>
          Profile saved successfully!
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Column 1: Profile Picture */}
        <div>
          <Card title="Profile Picture">
            <div className="flex flex-col items-center">
              <div className="relative group mb-4">
                {preview ? (
                  <img 
                    src={preview} 
                    alt="Profile" 
                    className="w-48 h-48 object-cover rounded-full border-4 border-blue-500 shadow-lg"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-full bg-slate-700 border-4 border-slate-600 flex items-center justify-center">
                    <svg className="w-20 h-20 text-slate-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                )}
                <div 
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-all cursor-pointer"
                  onClick={triggerFileInput}
                >
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
              </div>
              <input 
                ref={fileInputRef}
                id="avatar" 
                type="file" 
                accept="image/*" 
                onChange={onFile} 
                className="hidden"
              />
              <button 
                onClick={triggerFileInput}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Upload New Photo
              </button>
            </div>
          </Card>
        </div>
        
        {/* Column 2-3: Profile Information */}
        <div className="lg:col-span-2">
          <Card title="Personal Information">
            <FormInput 
              label="Full Name" 
              id="name"
              value={name} 
              onChange={setName} 
              placeholder="Enter your full name"
            />
            
            <FormInput 
              label="Professional Title" 
              id="title"
              value={title} 
              onChange={setTitle} 
              placeholder="e.g. Senior Software Engineer"
            />
            
            <FormInput 
              label="Bio" 
              id="bio"
              value={bio} 
              onChange={setBio} 
              multiline={true}
              placeholder="Write a short bio about yourself..."
            />
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={save}
                disabled={saving}
                className={`
                  px-6 py-3 rounded-lg font-medium flex items-center gap-2
                  ${saving 
                    ? 'bg-slate-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'}
                  transition-colors shadow-lg
                `}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

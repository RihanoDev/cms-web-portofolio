import React from 'react'
import { ContentStore, type Profile } from '../services/content'
import { uploadMedia } from '../services/media'

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

export default function ProfileEditor() {
  const [activeLang, setActiveLang] = React.useState<'en' | 'id'>('en')

  const [name, setName] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [title_id, setTitle_id] = React.useState('')
  const [bio, setBio] = React.useState('')
  const [bio_id, setBio_id] = React.useState('')
  const [preview, setPreview] = React.useState<string>('')

  // Additional About fields
  const [aboutSubtitle, setAboutSubtitle] = React.useState('')
  const [aboutSubtitle_id, setAboutSubtitle_id] = React.useState('')
  const [aboutDescription1, setAboutDescription1] = React.useState('')
  const [aboutDescription1_id, setAboutDescription1_id] = React.useState('')
  const [aboutDescription2, setAboutDescription2] = React.useState('')
  const [aboutDescription2_id, setAboutDescription2_id] = React.useState('')
  const [aboutDescription3, setAboutDescription3] = React.useState('')
  const [aboutDescription3_id, setAboutDescription3_id] = React.useState('')
  const [coreExpertise, setCoreExpertise] = React.useState<{ name: string, percentage: number }[]>([])
  const [skillCategories, setSkillCategories] = React.useState<{ category: string, technologies: string[] }[]>([])
  const [location, setLocation] = React.useState('')
  const [location_id, setLocation_id] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [email_id, setEmail_id] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [phone_id, setPhone_id] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [availableTags, setAvailableTags] = React.useState<string[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, tags] = await Promise.all([
          ContentStore.getProfile(),
          ContentStore.getTags()
        ])
        setName(p.name)
        setTitle(p.title)
        setTitle_id(p.title_id || '')
        setBio(p.bio)
        setBio_id(p.bio_id || '')
        setPreview(p.avatarDataUrl || '')
        setAboutSubtitle(p.aboutSubtitle || '')
        setAboutSubtitle_id(p.aboutSubtitle_id || '')
        setAboutDescription1(p.aboutDescription1 || '')
        setAboutDescription1_id(p.aboutDescription1_id || '')
        setAboutDescription2(p.aboutDescription2 || '')
        setAboutDescription2_id(p.aboutDescription2_id || '')
        setAboutDescription3(p.aboutDescription3 || '')
        setAboutDescription3_id(p.aboutDescription3_id || '')
        setCoreExpertise(p.coreExpertise || [])
        setSkillCategories(p.skillCategories || [])
        setLocation(p.location || '')
        setLocation_id(p.location_id || '')
        setEmail(p.email || '')
        setEmail_id(p.email_id || '')
        setPhone(p.phone || '')
        setPhone_id(p.phone_id || '')
        setAvailableTags(tags.map(t => t.name))
      } catch (err) {

      }
    }
    fetchData()
  }, [])

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setSaving(true)
    try {
      const result = await uploadMedia(file, "profiles")
      setPreview(result.fileUrl)
    } catch (err) {

      alert("Failed to upload image. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const save = async () => {
    setSaving(true)
    try {
      const profile: Profile = {
        name, title, title_id, bio, bio_id, avatarDataUrl: preview,
        aboutSubtitle, aboutSubtitle_id, aboutDescription1, aboutDescription1_id,
        aboutDescription2, aboutDescription2_id, aboutDescription3, aboutDescription3_id,
        coreExpertise, skillCategories,
        location, location_id,
        email, email_id,
        phone, phone_id
      }
      await ContentStore.saveProfile(profile)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {

      alert("Failed to save profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  // --- Button class based on save state ---
  const btnClass = saved
    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
    : saving
      ? 'bg-slate-600 cursor-not-allowed text-slate-400'
      : 'bg-blue-600 hover:bg-blue-500 active:scale-95 text-white shadow-lg shadow-blue-900/40 hover:shadow-blue-700/50'

  return (
    <div className="max-w-5xl mx-auto">

      {/* ── Animated success toast (slides in from top-right) ── */}
      <div
        className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl backdrop-blur-sm
          transition-all duration-500 ease-out
          ${saved
            ? 'opacity-100 translate-y-0 bg-emerald-900/90 border-emerald-500/60 text-emerald-300'
            : 'opacity-0 -translate-y-4 pointer-events-none bg-emerald-900/90 border-emerald-500/60 text-emerald-300'
          }`}
      >
        {/* Checkmark circle */}
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <p className="font-semibold text-sm">Profile berhasil disimpan!</p>
          <p className="text-xs text-emerald-400/70">Semua perubahan telah tersimpan.</p>
        </div>

        {/* Auto-progress bar that shrinks over 3 s */}
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-emerald-500/50 rounded-b-xl"
          style={{
            width: saved ? '0%' : '100%',
            transition: saved ? 'width 3s linear' : 'none',
          }}
        />
      </div>

      {/* ── Main grid ── */}
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
                    <svg className="w-20 h-20 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
                  onClick={triggerFileInput}
                >
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-lg flex items-center gap-2 transition-all duration-200 shadow shadow-blue-900/40"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upload New Photo
              </button>
            </div>
          </Card>
        </div>

        {/* Column 2-3: Profile Information */}
        <div className="lg:col-span-2">
          {/* Language Toggle for Translatable Fields */}
          <div className="flex bg-slate-800 rounded-lg p-1 mb-6 border border-slate-700 w-fit shrink-0">
            <button
              onClick={() => setActiveLang('en')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeLang === 'en' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            >
              English
            </button>
            <button
              onClick={() => setActiveLang('id')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeLang === 'id' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            >
              Indonesia
            </button>
          </div>

          <Card title="Personal Information">
            <FormInput
              label="Full Name"
              id="name"
              value={name}
              onChange={setName}
              placeholder="Enter your full name"
            />

            <FormInput
              label={`Professional Title (${activeLang.toUpperCase()})`}
              id="title"
              value={activeLang === 'en' ? title : title_id}
              onChange={activeLang === 'en' ? setTitle : setTitle_id}
              placeholder="e.g. Senior Software Engineer"
            />

            <FormInput
              label={`Bio (${activeLang.toUpperCase()})`}
              id="bio"
              value={activeLang === 'en' ? bio : bio_id}
              onChange={activeLang === 'en' ? setBio : setBio_id}
              multiline={true}
              placeholder="Write a short bio about yourself..."
            />
          </Card>

          <div className="mt-6">
            <Card title="About Section & Contact Info">
              <FormInput
                label={`About Subtitle (${activeLang.toUpperCase()})`}
                id="aboutSubtitle"
                value={activeLang === 'en' ? aboutSubtitle : aboutSubtitle_id}
                onChange={activeLang === 'en' ? setAboutSubtitle : setAboutSubtitle_id}
                placeholder="Backend engineer yang fokus pada hasil..."
              />

              <FormInput
                label={`About Description (Paragraf 1) (${activeLang.toUpperCase()})`}
                id="aboutDescription1"
                value={activeLang === 'en' ? aboutDescription1 : aboutDescription1_id}
                onChange={activeLang === 'en' ? setAboutDescription1 : setAboutDescription1_id}
                multiline={true}
                placeholder="Saya membangun backend yang cepat..."
              />
              <FormInput
                label={`About Description (Paragraf 2) (${activeLang.toUpperCase()})`}
                id="aboutDescription2"
                value={activeLang === 'en' ? aboutDescription2 : aboutDescription2_id}
                onChange={activeLang === 'en' ? setAboutDescription2 : setAboutDescription2_id}
                multiline={true}
                placeholder="Beberapa hasil: memangkas p95..."
              />
              <FormInput
                label={`About Description (Paragraf 3) (${activeLang.toUpperCase()})`}
                id="aboutDescription3"
                value={activeLang === 'en' ? aboutDescription3 : aboutDescription3_id}
                onChange={activeLang === 'en' ? setAboutDescription3 : setAboutDescription3_id}
                multiline={true}
                placeholder="Prinsip saya: kirim bernilai bisnis..."
              />

              <div className="mt-4 mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-300">Core Expertise</label>
                <button
                  onClick={() => setCoreExpertise([...coreExpertise, { name: '', percentage: 50 }])}
                  className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Add Skill
                </button>
              </div>

              <div className="space-y-4 mb-8">
                {coreExpertise.map((skill, index) => (
                  <div key={index} className="flex gap-4 items-end bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-400 mb-1">Skill Name</label>
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => {
                          const newSkills = [...coreExpertise];
                          newSkills[index].name = e.target.value;
                          setCoreExpertise(newSkills);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="e.g. Backend Development"
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-xs text-slate-400 mb-1">Percentage ({skill.percentage}%)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={skill.percentage}
                        onChange={(e) => {
                          const newSkills = [...coreExpertise];
                          newSkills[index].percentage = parseInt(e.target.value);
                          setCoreExpertise(newSkills);
                        }}
                        className="w-full accent-blue-500 border-none outline-none mt-2 h-2"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const newSkills = [...coreExpertise];
                        newSkills.splice(index, 1);
                        setCoreExpertise(newSkills);
                      }}
                      className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/30"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-8 mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-300">Key Skills & Expertise (Mapped by Tags)</label>
                <button
                  onClick={() => setSkillCategories([...skillCategories, { category: '', technologies: [] }])}
                  className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Add Category
                </button>
              </div>

              <div className="space-y-6 mb-8">
                {skillCategories.map((c, index) => (
                  <div key={index} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 relative">
                    <button
                      onClick={() => {
                        const newCats = [...skillCategories];
                        newCats.splice(index, 1);
                        setSkillCategories(newCats);
                      }}
                      className="absolute top-4 right-4 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/30"
                      title="Remove Category"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                    <div className="mb-4 pr-12">
                      <label className="block text-xs text-slate-400 mb-1">Category Name</label>
                      <input
                        type="text"
                        value={c.category}
                        onChange={(e) => {
                          const newCats = [...skillCategories];
                          newCats[index].category = e.target.value;
                          setSkillCategories(newCats);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                        placeholder="e.g. Backend, Database, DevOps"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Tags (Comma-separated or selected)</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {c.technologies.map((tech, tIdx) => (
                          <span key={tIdx} className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded text-sm">
                            {tech}
                            <button
                              className="text-white hover:text-red-400 ml-1"
                              onClick={() => {
                                const newCats = [...skillCategories];
                                newCats[index].technologies = newCats[index].technologies.filter((_, i) => i !== tIdx);
                                setSkillCategories(newCats);
                              }}
                            >&times;</button>
                          </span>
                        ))}
                      </div>
                      <select
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                        onChange={(e) => {
                          if (e.target.value) {
                            const newCats = [...skillCategories];
                            if (!newCats[index].technologies.includes(e.target.value)) {
                              newCats[index].technologies.push(e.target.value);
                            }
                            setSkillCategories(newCats);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>Add from existing tags...</option>
                        {availableTags.map(tag => (
                          <option key={tag} value={tag}>{tag}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="...or type new tag & press enter"
                        className="w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 transition-colors text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = e.currentTarget.value.trim();
                            if (val) {
                              const newCats = [...skillCategories];
                              if (!newCats[index].technologies.includes(val)) {
                                newCats[index].technologies.push(val);
                                setSkillCategories(newCats);
                              }
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  label="Location"
                  id="location"
                  value={activeLang === 'en' ? location : location_id}
                  onChange={activeLang === 'en' ? setLocation : setLocation_id}
                  placeholder={activeLang === 'en' ? "Jakarta, Indonesia" : "Jakarta, Indonesia"}
                />
                <FormInput
                  label="Email"
                  id="email"
                  value={activeLang === 'en' ? email : email_id}
                  onChange={activeLang === 'en' ? setEmail : setEmail_id}
                  placeholder="example@mail.com"
                />
                <FormInput
                  label="Phone"
                  id="phone"
                  value={activeLang === 'en' ? phone : phone_id}
                  onChange={activeLang === 'en' ? setPhone : setPhone_id}
                  placeholder="+62 812..."
                />
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={save}
                  disabled={saving}
                  className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2.5 transition-all duration-200 transform ${btnClass}`}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Menyimpan...
                    </>
                  ) : saved ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      Tersimpan!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
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
    </div>
  )
}

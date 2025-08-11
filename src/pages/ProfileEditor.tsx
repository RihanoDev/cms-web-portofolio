import React from 'react'
import { ContentStore, type Profile } from '../services/content'

export default function ProfileEditor(){
  const [name, setName] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [bio, setBio] = React.useState('')
  const [preview, setPreview] = React.useState<string>('')

  React.useEffect(()=>{
    const p = ContentStore.getProfile()
    setName(p.name); setTitle(p.title); setBio(p.bio); setPreview(p.avatarDataUrl || '')
  },[])

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setPreview(f ? URL.createObjectURL(f) : '')
  }

  const save = async () => {
    const profile: Profile = { name, title, bio, avatarDataUrl: preview }
    ContentStore.saveProfile(profile)
    alert('Saved locally.')
  }

  return (
    <div className="space-y-4">
      <h2 className="m-0 text-lg font-semibold">Profile</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm text-slate-300">Name</label>
          <input id="name" className="w-full bg-slate-800 rounded-lg px-3 py-2" value={name} onChange={e=>setName(e.target.value)} />
          <label htmlFor="title" className="block text-sm text-slate-300 mt-3">Title</label>
          <input id="title" className="w-full bg-slate-800 rounded-lg px-3 py-2" value={title} onChange={e=>setTitle(e.target.value)} />
          <label htmlFor="bio" className="block text-sm text-slate-300 mt-3">Bio</label>
          <textarea id="bio" className="w-full bg-slate-800 rounded-lg px-3 py-2 min-h-[120px]" value={bio} onChange={e=>setBio(e.target.value)} />
        </div>
        <div>
          <label htmlFor="avatar" className="block text-sm text-slate-300">Hero Picture</label>
          {preview ? (
            <img src={preview} alt="preview" className="w-48 h-48 object-cover rounded-xl border border-slate-700" />
          ) : (
            <div className="w-48 h-48 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">No image</div>
          )}
          <input id="avatar" type="file" accept="image/*" onChange={onFile} className="block mt-2" />
          <button onClick={save} className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-400 rounded-lg">Save</button>
        </div>
      </div>
    </div>
  )
}

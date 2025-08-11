import React from 'react'
import { ContentStore, type Project } from '../services/content'

type Item = { id?: number; title: string; description?: string; link?: string }

function Row({ item, onChange, onRemove }: { item: Item; onChange: (v: Item)=>void; onRemove: ()=>void }){
  return (
    <div className="grid grid-cols-12 gap-3 items-start">
      <input className="col-span-3 bg-slate-800 rounded-lg px-3 py-2" placeholder="Title" value={item.title} onChange={e=>onChange({...item, title: e.target.value})} />
      <input className="col-span-6 bg-slate-800 rounded-lg px-3 py-2" placeholder="Description" value={item.description||''} onChange={e=>onChange({...item, description: e.target.value})} />
      <input className="col-span-2 bg-slate-800 rounded-lg px-3 py-2" placeholder="Link" value={item.link||''} onChange={e=>onChange({...item, link: e.target.value})} />
      <button className="col-span-1 px-3 py-2 bg-red-500 hover:bg-red-400 rounded-lg" onClick={onRemove}>Del</button>
    </div>
  )
}

export default function ProjectsEditor(){
  const [items, setItems] = React.useState<Item[]>([])
  React.useEffect(()=>{ setItems(ContentStore.getProjects()) }, [])
  const add = ()=> setItems(prev => [...prev, { id: Date.now(), title: '' }])
  const save = async ()=> { ContentStore.saveProjects(items as Project[]); alert('Saved locally.') }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-lg font-semibold">Projects</h2>
        <div className="space-x-2">
          <button onClick={add} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg">Add</button>
          <button onClick={save} className="px-3 py-2 bg-blue-500 hover:bg-blue-400 rounded-lg">Save</button>
        </div>
      </div>
      <div className="space-y-3">
        {items.length === 0 && <div className="text-slate-400">No items yet.</div>}
        {items.map((it) => (
          <div key={it.id} className="bg-slate-800 p-3 rounded-xl">
            <Row item={it} onChange={(v)=> setItems(prev => prev.map((p)=> p.id===it.id? v : p))} onRemove={()=> setItems(prev => prev.filter((p)=> p.id!==it.id))} />
          </div>
        ))}
      </div>
    </div>
  )
}

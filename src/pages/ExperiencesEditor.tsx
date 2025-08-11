import React from 'react'
import { ContentStore, type Experience } from '../services/content'

type Exp = { id?: number; company: string; role: string; period: string; description?: string }

function Row({ item, onChange, onRemove }: { readonly item: Exp; readonly onChange: (v: Exp)=>void; readonly onRemove: ()=>void }){
  return (
    <div className="grid grid-cols-12 gap-3 items-start">
      <input className="col-span-3 bg-slate-800 rounded-lg px-3 py-2" placeholder="Company" value={item.company} onChange={e=>onChange({...item, company: e.target.value})} />
      <input className="col-span-3 bg-slate-800 rounded-lg px-3 py-2" placeholder="Role" value={item.role} onChange={e=>onChange({...item, role: e.target.value})} />
      <input className="col-span-3 bg-slate-800 rounded-lg px-3 py-2" placeholder="Period" value={item.period} onChange={e=>onChange({...item, period: e.target.value})} />
      <input className="col-span-2 bg-slate-800 rounded-lg px-3 py-2" placeholder="Description" value={item.description||''} onChange={e=>onChange({...item, description: e.target.value})} />
      <button className="col-span-1 px-3 py-2 bg-red-500 hover:bg-red-400 rounded-lg" onClick={onRemove}>Del</button>
    </div>
  )
}

export default function ExperiencesEditor(){
  const [items, setItems] = React.useState<Exp[]>([])
  React.useEffect(()=>{ setItems(ContentStore.getExperiences() as unknown as Exp[]) }, [])
  const add = ()=> setItems(prev => [...prev, { id: Date.now(), company: '', role: '', period: '' }])
  const save = async ()=> { ContentStore.saveExperiences(items as unknown as Experience[]); alert('Saved locally.') }
  const update = (id: number|undefined, v: Exp)=> setItems(prev => prev.map(p=> p.id===id? v : p))
  const remove = (id: number|undefined)=> setItems(prev => prev.filter(p => p.id!==id))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-lg font-semibold">Experiences</h2>
        <div className="space-x-2">
          <button onClick={add} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg">Add</button>
          <button onClick={save} className="px-3 py-2 bg-blue-500 hover:bg-blue-400 rounded-lg">Save</button>
        </div>
      </div>
      <div className="space-y-3">
        {items.length === 0 && <div className="text-slate-400">No items yet.</div>}
    {items.map((it) => (
          <div key={it.id} className="bg-slate-800 p-3 rounded-xl">
      <Row item={it} onChange={(v)=> update(it.id, v)} onRemove={()=> remove(it.id)} />
          </div>
        ))}
      </div>
    </div>
  )
}

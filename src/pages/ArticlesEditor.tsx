import React from 'react'
import { ContentStore, type Article as A } from '../services/content'

type Article = { id?: number; title: string; url: string }

export default function ArticlesEditor(){
  const [items, setItems] = React.useState<Article[]>([])
  React.useEffect(()=>{ setItems(ContentStore.getArticles() as unknown as Article[]) }, [])
  const add = ()=> setItems(prev => [...prev, { id: Date.now(), title: '', url: '' }])
  const save = async ()=> { ContentStore.saveArticles(items as unknown as A[]); alert('Saved locally.') }
  const setTitle = (id: number|undefined, v: string)=> setItems(prev => prev.map(p => p.id===id? { ...p, title: v } : p))
  const setUrl = (id: number|undefined, v: string)=> setItems(prev => prev.map(p => p.id===id? { ...p, url: v } : p))
  const remove = (id: number|undefined)=> setItems(prev => prev.filter(p => p.id!==id))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-lg font-semibold">Articles</h2>
        <div className="space-x-2">
          <button onClick={add} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg">Add</button>
          <button onClick={save} className="px-3 py-2 bg-blue-500 hover:bg-blue-400 rounded-lg">Save</button>
        </div>
      </div>
      <div className="space-y-3">
        {items.length === 0 && <div className="text-slate-400">No items yet.</div>}
        {items.map((it) => (
          <div key={it.id} className="bg-slate-800 p-3 rounded-xl grid grid-cols-12 gap-3 items-start">
            <input className="col-span-5 bg-slate-800 rounded-lg px-3 py-2" placeholder="Title" value={it.title} onChange={e=>setTitle(it.id, e.target.value)} />
            <input className="col-span-6 bg-slate-800 rounded-lg px-3 py-2" placeholder="URL" value={it.url} onChange={e=>setUrl(it.id, e.target.value)} />
            <button className="col-span-1 px-3 py-2 bg-red-500 hover:bg-red-400 rounded-lg" onClick={()=> remove(it.id)}>Del</button>
          </div>
        ))}
      </div>
    </div>
  )
}

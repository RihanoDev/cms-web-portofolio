import React from 'react'
import { api, authHeader } from '../services/api'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale)

type Stats = { total: number; today: number; week: number; month: number; unique: number }

export default function Overview(){
  const [overall, setOverall] = React.useState<Stats | null>(null)
  const [home, setHome] = React.useState<Stats | null>(null)
  const [series, setSeries] = React.useState<{ bucket: string; count: number }[]>([])

  React.useEffect(()=>{
    const load = async () => {
      try{
        const [ovr, hm, ts] = await Promise.all([
          api.get('/api/v1/analytics/views', { headers: authHeader() }),
          api.get('/api/v1/analytics/views?page=/', { headers: authHeader() }),
          api.get('/api/v1/analytics/series?interval=day', { headers: authHeader() }),
        ])
        setOverall(ovr.data?.data || ovr.data)
        setHome(hm.data?.data || hm.data)
        setSeries((ts.data?.data || ts.data || []).slice(-30))
      }catch(e){ console.error(e) }
    }
    load()
  },[])

  const Card: React.FC<{title: string; stats: Stats | null}> = ({title, stats}) => (
    <div className="bg-slate-800 p-4 rounded-xl">
      <h2 className="mt-0 mb-2 font-semibold">{title}</h2>
      {stats ? (
        <div className="text-slate-300"> Total: {stats.total} | Today: {stats.today} | Week: {stats.week} | Month: {stats.month} | Unique: {stats.unique} </div>
      ) : <div className="text-slate-400">Loading...</div>}
    </div>
  )

  const chartData = {
    labels: series.map(s => new Date(s.bucket).toLocaleDateString()),
    datasets: [
      {
        label: 'Daily Views',
        data: series.map(s => s.count),
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96,165,250,0.2)'
      }
    ]
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Overall Views" stats={overall} />
        <Card title="Home Page Views" stats={home} />
      </div>
      <div className="bg-slate-800 p-4 rounded-xl">
        <h2 className="mt-0 mb-2 font-semibold">Last 30 Days</h2>
        <div className="h-64"><Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
      </div>
    </div>
  )
}

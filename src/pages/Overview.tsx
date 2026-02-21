import React from 'react'
import { api } from '../services/api'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Tooltip, 
  Legend, 
  TimeScale,
  Filler
)

type Stats = { total: number; today: number; week: number; month: number; unique: number }

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  change, 
  icon 
}: { 
  title: string; 
  value: number | string; 
  subtitle?: string;
  change?: { value: number; positive: boolean };
  icon: React.ReactNode;
}) => {
  const changeColor = change?.positive ? 'text-green-400' : 'text-red-400'
  
  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700/50">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
          <div className="text-2xl font-bold text-white">{value}</div>
          {subtitle && <p className="text-slate-400 text-xs mt-1">{subtitle}</p>}
          
          {change && (
            <div className={`flex items-center mt-2 text-sm ${changeColor}`}>
              {change.positive ? (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"></path>
                </svg>
              )}
              <span>{Math.abs(change.value)}%</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-blue-500/10 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  )
}

// Loader component for a nice loading animation
const Loader = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
)

export default function Overview(){
  const [overall, setOverall] = React.useState<Stats | null>(null)
  const [home, setHome] = React.useState<Stats | null>(null)
  const [series, setSeries] = React.useState<{ bucket: string; count: number }[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      try{
        setLoading(true)
        const [ovr, hm, ts] = await Promise.all([
          api.get('/api/v1/analytics/views'),
          api.get('/api/v1/analytics/views?page=/'),
          api.get('/api/v1/analytics/series?interval=day'),
        ])
        setOverall(ovr.data?.data || ovr.data)
        setHome(hm.data?.data || hm.data)
        setSeries((ts.data?.data || ts.data || []).slice(-30))
      } catch(e) { 
        console.error(e) 
      } finally {
        setLoading(false)
      }
    }
    load()
  },[])

  // Calculate week-over-week change (dummy data for example)
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, positive: true }
    const change = ((current - previous) / previous) * 100
    return { value: Math.round(change), positive: change >= 0 }
  }

  const chartData = {
    labels: series.map(s => new Date(s.bucket).toLocaleDateString()),
    datasets: [
      {
        label: 'Daily Views',
        data: series.map(s => s.count),
        borderColor: 'rgba(59, 130, 246, 1)', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        tension: 0.4,
        fill: true
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#94a3b8', // slate-400
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)', // slate-400 with opacity
          drawBorder: false,
        },
        ticks: {
          color: '#94a3b8', // slate-400
          precision: 0,
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.8)', // slate-900 with opacity
        titleColor: '#f8fafc', // slate-50
        bodyColor: '#e2e8f0', // slate-200
        padding: 12,
        borderColor: 'rgba(100, 116, 139, 0.2)', // slate-500 with opacity
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `Views: ${context.parsed.y}`
          }
        }
      }
    },
  }

  // Content section component
  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      {children}
    </div>
  )

  if (loading) return <Loader />

  return (
    <div>
      <Section title="Analytics Overview">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Page Views" 
            value={overall?.total || 0}
            subtitle="All time views" 
            icon={
              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
              </svg>
            }
            change={calculateChange(overall?.today || 0, (overall?.today || 0) - 2)} // Example calculation
          />
          
          <StatCard 
            title="Today's Views" 
            value={overall?.today || 0}
            subtitle="Views in last 24h" 
            icon={
              <svg className="w-6 h-6 text-emerald-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
              </svg>
            }
          />
          
          <StatCard 
            title="Weekly Views" 
            value={overall?.week || 0}
            subtitle="Last 7 days" 
            icon={
              <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
              </svg>
            }
            change={calculateChange(overall?.week || 0, (overall?.week || 0) - 5)} // Example calculation
          />
          
          <StatCard 
            title="Unique Visitors" 
            value={overall?.unique || 0}
            subtitle="Distinct IPs" 
            icon={
              <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
              </svg>
            }
          />
        </div>
      </Section>
      
      <Section title="Traffic Insights">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700/50 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-medium">Views Trend</h3>
                <div className="bg-slate-700/50 text-slate-300 text-xs py-1 px-2 rounded">Last 30 Days</div>
              </div>
              <div className="h-80">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700/50 h-full">
              <h3 className="text-white font-medium mb-4">Top Pages</h3>
              
              {/* Sample top pages data - replace with real data */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <div>
                    <div className="font-medium text-slate-100">Home</div>
                    <div className="text-xs text-slate-400">/{home?.total ? '' : ''}</div>
                  </div>
                  <div className="text-slate-200 font-semibold">{home?.total || 0}</div>
                </div>
                
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <div>
                    <div className="font-medium text-slate-100">About</div>
                    <div className="text-xs text-slate-400">/about</div>
                  </div>
                  <div className="text-slate-200 font-semibold">{Math.floor((home?.total || 0) * 0.7)}</div>
                </div>
                
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <div>
                    <div className="font-medium text-slate-100">Projects</div>
                    <div className="text-xs text-slate-400">/projects</div>
                  </div>
                  <div className="text-slate-200 font-semibold">{Math.floor((home?.total || 0) * 0.5)}</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-100">Contact</div>
                    <div className="text-xs text-slate-400">/contact</div>
                  </div>
                  <div className="text-slate-200 font-semibold">{Math.floor((home?.total || 0) * 0.3)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}

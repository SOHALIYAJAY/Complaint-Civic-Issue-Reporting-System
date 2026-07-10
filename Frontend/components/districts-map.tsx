'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle, Clock, Zap, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface District {
  id: string
  name: string
  description: string
  area: number
  population: number
  stats: {
    totalComplaints: number
    resolved: number
    pending: number
    inProgress: number
    slaCompliance: number
  }
  districtHQ: string
  gramPanchayat: number
  villages: number
}

const districts: Record<string, District> = {
  amreli: {
    id: 'amreli',
    name: 'Amreli',
    description: 'Amreli district is located in the Saurashtra region of Gujarat. It is surrounded by Rajkot and Botad District in North, Junagadh and Gir Somnath District in West and Bhavnagar Dist in East. The district focuses on civic infrastructure and citizen services with active digital governance initiatives.',
    area: 7197,
    population: 1241796,
    stats: {
      totalComplaints: 4250,
      resolved: 3890,
      pending: 185,
      inProgress: 175,
      slaCompliance: 92,
    },
    districtHQ: 'Amreli',
    gramPanchayat: 598,
    villages: 819,
  },
  surat: {
    id: 'surat',
    name: 'Surat',
    description: 'Surat is a major city in western Gujarat. It is one of the most dynamic cities with one of the fastest growth rates due to immigration. Surat leads in civic complaint resolution and smart governance initiatives across the state.',
    area: 4467,
    population: 6081322,
    stats: {
      totalComplaints: 12850,
      resolved: 11923,
      pending: 512,
      inProgress: 415,
      slaCompliance: 95,
    },
    districtHQ: 'Surat',
    gramPanchayat: 547,
    villages: 802,
  },
  vadodara: {
    id: 'vadodara',
    name: 'Vadodara',
    description: 'Vadodara is a city in central Gujarat known for its cultural heritage and educational institutions. The city maintains high standards in public services and citizen engagement through CivicTrack initiatives.',
    area: 3041,
    population: 4165061,
    stats: {
      totalComplaints: 8920,
      resolved: 8150,
      pending: 420,
      inProgress: 350,
      slaCompliance: 91,
    },
    districtHQ: 'Vadodara',
    gramPanchayat: 281,
    villages: 698,
  },
  ahmedabad: {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    description: 'Ahmedabad is the largest city in Gujarat and a major economic center. The city leads the state in digital governance and has the highest complaint resolution rate across all districts.',
    area: 2707,
    population: 7214000,
    stats: {
      totalComplaints: 18500,
      resolved: 17950,
      pending: 310,
      inProgress: 240,
      slaCompliance: 97,
    },
    districtHQ: 'Ahmedabad',
    gramPanchayat: 154,
    villages: 521,
  },
  rajkot: {
    id: 'rajkot',
    name: 'Rajkot',
    description: 'Rajkot is an industrial city in Saurashtra region. Known for its clockwise circular road plan and industrial development, the city maintains efficient civic services with high SLA compliance rates.',
    area: 11189,
    population: 3811696,
    stats: {
      totalComplaints: 6780,
      resolved: 6234,
      pending: 312,
      inProgress: 234,
      slaCompliance: 92,
    },
    districtHQ: 'Rajkot',
    gramPanchayat: 684,
    villages: 1512,
  },
  bhavnagar: {
    id: 'bhavnagar',
    name: 'Bhavnagar',
    description: 'Bhavnagar is a port city on the Arabian Sea in Gujarat. Known as the "Jewel of Saurashtra", the city focuses on maritime commerce and coastal development with modern civic infrastructure.',
    area: 10165,
    population: 1808380,
    stats: {
      totalComplaints: 5420,
      resolved: 4950,
      pending: 280,
      inProgress: 190,
      slaCompliance: 89,
    },
    districtHQ: 'Bhavnagar',
    gramPanchayat: 512,
    villages: 1205,
  },
}

export default function DistrictsMap() {
  const [selectedDistrict, setSelectedDistrict] = useState<District>(districts.surat)

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-primary mb-4">Gujarat at a Glance</h2>
          <p className="text-lg text-muted-foreground">
            Smart District Dashboard – Interactive Civic Complaint Analytics
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Interactive Gujarat Map */}
          <div className="flex justify-center lg:justify-start order-2 lg:order-1">
            <div className="w-full max-w-md h-auto">
              <svg 
                viewBox="0 0 800 900" 
                className="w-full h-auto drop-shadow-2xl rounded-lg"
                xmlns="http://www.w3.org/2000/svg"
                style={{ background: 'rgba(255,255,255,0.95)' }}
              >
                {/* Amreli District */}
                <path
                  d="M 150 520 L 180 490 L 200 510 L 190 540 L 160 550 Z"
                  fill={selectedDistrict.id === 'amreli' ? '#f97316' : '#1e3a8a'}
                  stroke="white"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-all duration-300 hover:opacity-100"
                  style={{ 
                    opacity: selectedDistrict.id === 'amreli' ? 1 : 0.7,
                    filter: selectedDistrict.id === 'amreli' ? 'drop-shadow(0 0 8px #f97316)' : 'none'
                  }}
                  onClick={() => setSelectedDistrict(districts.amreli)}
                  onMouseEnter={() => setSelectedDistrict(districts.amreli)}
                />

                {/* Rajkot District */}
                <path
                  d="M 100 400 L 200 380 L 230 450 L 180 480 L 110 450 Z"
                  fill={selectedDistrict.id === 'rajkot' ? '#f97316' : '#1e3a8a'}
                  stroke="white"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-all duration-300"
                  style={{ 
                    opacity: selectedDistrict.id === 'rajkot' ? 1 : 0.7,
                    filter: selectedDistrict.id === 'rajkot' ? 'drop-shadow(0 0 8px #f97316)' : 'none'
                  }}
                  onClick={() => setSelectedDistrict(districts.rajkot)}
                  onMouseEnter={() => setSelectedDistrict(districts.rajkot)}
                />

                {/* Bhavnagar District */}
                <path
                  d="M 120 520 L 160 550 L 180 620 L 130 640 L 100 590 Z"
                  fill={selectedDistrict.id === 'bhavnagar' ? '#f97316' : '#1e3a8a'}
                  stroke="white"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-all duration-300"
                  style={{ 
                    opacity: selectedDistrict.id === 'bhavnagar' ? 1 : 0.7,
                    filter: selectedDistrict.id === 'bhavnagar' ? 'drop-shadow(0 0 8px #f97316)' : 'none'
                  }}
                  onClick={() => setSelectedDistrict(districts.bhavnagar)}
                  onMouseEnter={() => setSelectedDistrict(districts.bhavnagar)}
                />

                {/* Ahmedabad District */}
                <path
                  d="M 280 300 L 380 280 L 420 360 L 350 400 L 280 380 Z"
                  fill={selectedDistrict.id === 'ahmedabad' ? '#f97316' : '#1e3a8a'}
                  stroke="white"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-all duration-300"
                  style={{ 
                    opacity: selectedDistrict.id === 'ahmedabad' ? 1 : 0.7,
                    filter: selectedDistrict.id === 'ahmedabad' ? 'drop-shadow(0 0 8px #f97316)' : 'none'
                  }}
                  onClick={() => setSelectedDistrict(districts.ahmedabad)}
                  onMouseEnter={() => setSelectedDistrict(districts.ahmedabad)}
                />

                {/* Vadodara District */}
                <path
                  d="M 420 360 L 520 330 L 560 420 L 480 480 L 380 450 Z"
                  fill={selectedDistrict.id === 'vadodara' ? '#f97316' : '#1e3a8a'}
                  stroke="white"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-all duration-300"
                  style={{ 
                    opacity: selectedDistrict.id === 'vadodara' ? 1 : 0.7,
                    filter: selectedDistrict.id === 'vadodara' ? 'drop-shadow(0 0 8px #f97316)' : 'none'
                  }}
                  onClick={() => setSelectedDistrict(districts.vadodara)}
                  onMouseEnter={() => setSelectedDistrict(districts.vadodara)}
                />

                {/* Surat District */}
                <path
                  d="M 420 480 L 520 450 L 580 560 L 480 620 L 380 580 Z"
                  fill={selectedDistrict.id === 'surat' ? '#f97316' : '#1e3a8a'}
                  stroke="white"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-all duration-300"
                  style={{ 
                    opacity: selectedDistrict.id === 'surat' ? 1 : 0.7,
                    filter: selectedDistrict.id === 'surat' ? 'drop-shadow(0 0 8px #f97316)' : 'none'
                  }}
                  onClick={() => setSelectedDistrict(districts.surat)}
                  onMouseEnter={() => setSelectedDistrict(districts.surat)}
                />

                {/* Title */}
                <text x="400" y="60" textAnchor="middle" className="font-bold" fontSize="24" fill="#0f172a">
                  GUJARAT
                </text>
                <text x="400" y="90" textAnchor="middle" className="font-semibold" fontSize="12" fill="#64748b">
                  Interactive District Map
                </text>

                {/* District Labels */}
                <text x="160" y="530" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">AMR</text>
                <text x="150" y="420" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">RAJ</text>
                <text x="145" y="580" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">BHV</text>
                <text x="350" y="340" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">AHM</text>
                <text x="490" y="400" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">VAD</text>
                <text x="500" y="550" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">SUR</text>
              </svg>
            </div>
          </div>

          {/* Right Side - District Details Card */}
          <div className="glass-effect rounded-xl p-6 sm:p-8 border border-border order-1 lg:order-2 sticky top-20">
            <h3 className="text-3xl sm:text-4xl font-bold text-primary mb-2">{selectedDistrict.name}</h3>
            <p className="text-foreground/70 text-sm mb-6 leading-relaxed">{selectedDistrict.description}</p>

            {/* Key Info */}
            <div className="grid grid-cols-2 gap-3 mb-6 pb-6 border-b border-border">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">AREA</p>
                <p className="text-lg font-bold text-primary">{selectedDistrict.area.toLocaleString()} Sq Km</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">POPULATION</p>
                <p className="text-lg font-bold text-primary">{(selectedDistrict.population / 1000000).toFixed(1)}M</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">DISTRICT HQ</p>
                <p className="text-lg font-bold text-primary">{selectedDistrict.districtHQ}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">VILLAGES</p>
                <p className="text-lg font-bold text-primary">{selectedDistrict.villages.toLocaleString()}</p>
              </div>
            </div>

            {/* Complaint Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-muted-foreground">Total Complaints</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{selectedDistrict.stats.totalComplaints.toLocaleString()}</div>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold text-muted-foreground">Resolved</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{selectedDistrict.stats.resolved.toLocaleString()}</div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-semibold text-muted-foreground">Pending</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">{selectedDistrict.stats.pending}</div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-muted-foreground">In Progress</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">{selectedDistrict.stats.inProgress}</div>
              </div>
            </div>

            {/* SLA Compliance */}
            <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-white mb-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">SLA Compliance</p>
                  <p className="text-4xl font-bold">{selectedDistrict.stats.slaCompliance}%</p>
                </div>
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="8"
                      strokeDasharray={`${(selectedDistrict.stats.slaCompliance / 100) * 283} 283`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold">{selectedDistrict.stats.slaCompliance}%</span>
                </div>
              </div>
            </div>

            <Button className="w-full bg-accent text-accent-foreground hover:bg-yellow-500 font-semibold gap-2 transition-all duration-300">
              View Detailed Report <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-6 glass-effect rounded-lg text-center border border-border">
          <p className="text-muted-foreground text-sm">
            Click or hover over any district on the interactive map to view detailed civic complaint analytics and governance metrics
          </p>
        </div>
      </div>
    </section>
  )
}

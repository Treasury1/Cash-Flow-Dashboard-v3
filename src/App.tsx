/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, ChangeEvent, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  LayoutDashboard, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Home,
  History,
  LineChart as LineChartIcon,
  ArrowUpRight, 
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart3,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Bell,
  User,
  Menu,
  X,
  ArrowRightLeft,
  FileUp,
  CheckCircle2,
  Upload,
  Edit2,
  Save,
  Check,
  Wallet
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { fetchExchangeRate } from './services/exchangeRateService';

// Mock Data
const bankData = [
  { name: 'Bank Central', inflow: 450000000, outflow: 320000000 },
  { name: 'Global Bank', inflow: 380000000, outflow: 410000000 },
  { name: 'Trust Bank', inflow: 520000000, outflow: 280000000 },
  { name: 'Digital Bank', inflow: 290000000, outflow: 150000000 },
  { name: 'Legacy Bank', inflow: 180000000, outflow: 220000000 },
];

const monthlyTrend = [
  { month: 'Jan', inflow: 120, outflow: 100 },
  { month: 'Feb', inflow: 150, outflow: 130 },
  { month: 'Mar', inflow: 180, outflow: 160 },
  { month: 'Apr', inflow: 140, outflow: 150 },
  { month: 'May', inflow: 200, outflow: 180 },
  { month: 'Jun', inflow: 250, outflow: 210 },
];

const gapData = [
  { name: 'Giro', value: 10, label: '', amount: '-80,415,428', color: '#8b5cf6' },
  { name: 'Deposito', value: 6, label: '', amount: '-46,538,100', color: '#ec4899' },
];

const recentActivityData = [
  { id: 1, date: '2026-04-10', category: 'Project Payment', amount: 15000000, type: 'Inflow', month: 'April' },
  { id: 2, date: '2026-04-08', category: 'Operational Cost', amount: 5000000, type: 'Outflow', month: 'April' },
  { id: 3, date: '2026-03-25', category: 'Consultancy Fee', amount: 12000000, type: 'Inflow', month: 'Maret' },
  { id: 4, date: '2026-03-15', category: 'Office Rent', amount: 8000000, type: 'Outflow', month: 'Maret' },
  { id: 5, date: '2026-02-20', category: 'Equipment Purchase', amount: 25000000, type: 'Outflow', month: 'Februari' },
  { id: 6, date: '2026-02-10', category: 'Service Revenue', amount: 30000000, type: 'Inflow', month: 'Februari' },
  { id: 7, date: '2026-01-15', category: 'Tax Payment', amount: 4000000, type: 'Outflow', month: 'Januari' },
  { id: 8, date: '2026-01-05', category: 'Investment Return', amount: 18000000, type: 'Inflow', month: 'Januari' },
];

const CFComparisonChart = ({ projectionData, actualData }: { projectionData: any, actualData: any }) => {
  const months = ['Jan-26', 'Feb-26', 'Mar-26', 'Apr-26'];
  
  // Extract "KAS DAN SETARA KAS AKHIR TAHUN" values
  const getSummaryValues = (data: any, label: string) => {
    const item = data.summary.find((s: any) => s.label === label);
    return item ? item.values : [];
  };

  const projValues = getSummaryValues(projectionData, 'KAS DAN SETARA KAS AKHIR TAHUN');
  const actValues = getSummaryValues(actualData, 'KAS DAN SETARA KAS AKHIR TAHUN');

  const chartData = months.map((month, i) => ({
    name: month,
    projection: projValues[i] || 0,
    actual: actValues[i] || null
  }));

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Cash Flow Comparison</h2>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Projection vs Actual</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#1e3a8a] rounded-full"></div>
            <span className="text-[10px] font-bold text-gray-500 uppercase">Projection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#2563eb] rounded-full"></div>
            <span className="text-[10px] font-bold text-gray-500 uppercase">Actual</span>
          </div>
        </div>
      </div>
      
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number) => [value.toLocaleString('id-ID'), 'Amount']}
            />
            <Bar dataKey="projection" fill="#1e3a8a" radius={[4, 4, 0, 0]} barSize={40} name="Projection" />
            <Bar dataKey="actual" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} name="Actual" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const CFActual = ({ data, setData }: { data: any, setData: (d: any) => void }) => {
  const months = ['Jan-26', 'Feb-26', 'Mar-26'];
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    operating: true,
    investing: true,
    financing: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const excelData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      
      console.log('Uploaded CF Actual Data:', excelData);
      
      // Mock update: Increment some values to show reactivity
      const newData = JSON.parse(JSON.stringify(data));
      newData.operating.items[0].values = newData.operating.items[0].values.map((v: number) => v + 10);
      newData.summary[2].values = newData.summary[2].values.map((v: number) => v + 10);
      setData(newData);
      
      alert('Actual data updated successfully from Excel!');
    };
    reader.readAsBinaryString(file);
  };

  const formatVal = (val: number) => {
    if (val === 0) return '-';
    const absVal = Math.abs(val).toLocaleString('id-ID');
    return val < 0 ? `(${absVal})` : absVal;
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
        <div>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">CF Actual</h2>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Historical Cash Flow Data for 2026</p>
        </div>
        <div className="flex gap-3 items-center">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            className="hidden" 
            accept=".xlsx, .xls"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm"
          >
            <Upload size={14} className="text-green-600" />
            Upload Actual
          </button>
          <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold border border-green-100 uppercase tracking-tighter">Actual Data</div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0f172a] text-white">
              <th className="p-4 text-xs font-bold uppercase tracking-wider border-r border-slate-700 w-1/3">Category</th>
              {months.map(m => (
                <th key={m} className="p-4 text-center text-xs font-bold uppercase tracking-wider min-w-[120px]">
                  <div className="opacity-60 text-[9px] mb-0.5">Actual</div>
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-xs">
            {/* Operating */}
            <tr 
              className="bg-gray-100/80 cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => toggleSection('operating')}
            >
              <td colSpan={4} className="p-3 font-black text-gray-800 border-y border-gray-200 uppercase tracking-tight flex items-center gap-2">
                {expandedSections.operating ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                {data.operating.title}
              </td>
            </tr>
            {expandedSections.operating && data.operating.items.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors border-b border-gray-50 animate-in fade-in slide-in-from-top-1 duration-200">
                <td className="p-2.5 pl-8 text-gray-600 font-medium">{item.label}</td>
                {item.values.map((v, idx) => (
                  <td key={idx} className="p-2.5 text-right font-mono text-gray-700">{formatVal(v)}</td>
                ))}
              </tr>
            ))}
            <tr className="bg-green-50/30 font-black border-y border-gray-200">
              <td className="p-3 text-gray-800">{data.operating.totalLabel}</td>
              {data.operating.totals.map((v, idx) => (
                <td key={idx} className="p-3 text-right font-mono text-green-800">{formatVal(v)}</td>
              ))}
            </tr>

            {/* Investing */}
            <tr 
              className="bg-gray-100/80 cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => toggleSection('investing')}
            >
              <td colSpan={4} className="p-3 font-black text-gray-800 border-y border-gray-200 uppercase tracking-tight flex items-center gap-2">
                {expandedSections.investing ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                {data.investing.title}
              </td>
            </tr>
            {expandedSections.investing && data.investing.items.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors border-b border-gray-50 animate-in fade-in slide-in-from-top-1 duration-200">
                <td className="p-2.5 pl-8 text-gray-600 font-medium">{item.label}</td>
                {item.values.map((v, idx) => (
                  <td key={idx} className="p-2.5 text-right font-mono text-gray-700">{formatVal(v)}</td>
                ))}
              </tr>
            ))}
            <tr className="bg-green-50/30 font-black border-y border-gray-200">
              <td className="p-3 text-gray-800">{data.investing.totalLabel}</td>
              {data.investing.totals.map((v, idx) => (
                <td key={idx} className="p-3 text-right font-mono text-green-800">{formatVal(v)}</td>
              ))}
            </tr>

            {/* Financing */}
            <tr 
              className="bg-gray-100/80 cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => toggleSection('financing')}
            >
              <td colSpan={4} className="p-3 font-black text-gray-800 border-y border-gray-200 uppercase tracking-tight flex items-center gap-2">
                {expandedSections.financing ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                {data.financing.title}
              </td>
            </tr>
            {expandedSections.financing && data.financing.items.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors border-b border-gray-50 animate-in fade-in slide-in-from-top-1 duration-200">
                <td className="p-2.5 pl-8 text-gray-600 font-medium">{item.label}</td>
                {item.values.map((v, idx) => (
                  <td key={idx} className="p-2.5 text-right font-mono text-gray-700">{formatVal(v)}</td>
                ))}
              </tr>
            ))}
            <tr className="bg-green-50/30 font-black border-y border-gray-200">
              <td className="p-3 text-gray-800">{data.financing.totalLabel}</td>
              {data.financing.totals.map((v, idx) => (
                <td key={idx} className="p-3 text-right font-mono text-green-800">{formatVal(v)}</td>
              ))}
            </tr>

            {/* Summary */}
            {data.summary.map((item, i) => (
              <tr key={i} className={`border-b border-gray-200 ${item.isFinal ? 'bg-[#0f172a] text-white' : 'bg-gray-100 font-black'}`}>
                <td className="p-3.5 uppercase text-[10px] tracking-wider font-black">{item.label}</td>
                {item.values.map((v, idx) => (
                  <td key={idx} className={`p-3.5 text-right font-mono text-sm ${item.isFinal ? 'text-white' : 'text-gray-900'}`}>{formatVal(v)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CFProjection = ({ data, setData }: { data: any, setData: (d: any) => void }) => {
  const months = ['Jan-26', 'Feb-26', 'Mar-26', 'Apr-26'];
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    operating: true,
    investing: true,
    financing: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const excelData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      
      console.log('Uploaded CF Projection Data:', excelData);
      
      // Mock update: Increment some values to show reactivity
      const newData = JSON.parse(JSON.stringify(data));
      newData.operating.items[0].values = newData.operating.items[0].values.map((v: number) => v + 50);
      newData.summary[2].values = newData.summary[2].values.map((v: number) => v + 50);
      setData(newData);
      
      alert('Projection data updated successfully from Excel!');
    };
    reader.readAsBinaryString(file);
  };

  const formatVal = (val: number) => {
    if (val === 0) return '-';
    const absVal = Math.abs(val).toLocaleString('id-ID');
    return val < 0 ? `(${absVal})` : absVal;
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
        <div>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">CF Projection</h2>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Cash Flow Forecast for Q1-Q2 2026</p>
        </div>
        <div className="flex gap-3 items-center">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            className="hidden" 
            accept=".xlsx, .xls"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm"
          >
            <Upload size={14} className="text-blue-600" />
            Upload Projection
          </button>
          <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold border border-blue-100 uppercase tracking-tighter">Forecast Data</div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1e3a8a] text-white">
              <th className="p-4 text-xs font-bold uppercase tracking-wider border-r border-blue-800/50 w-1/3">Category</th>
              {months.map(m => (
                <th key={m} className="p-4 text-center text-xs font-bold uppercase tracking-wider min-w-[120px]">
                  <div className="opacity-60 text-[9px] mb-0.5">Forecast</div>
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-xs">
            {/* Operating */}
            <tr 
              className="bg-gray-100/80 cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => toggleSection('operating')}
            >
              <td colSpan={5} className="p-3 font-black text-gray-800 border-y border-gray-200 uppercase tracking-tight flex items-center gap-2">
                {expandedSections.operating ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                {data.operating.title}
              </td>
            </tr>
            {expandedSections.operating && data.operating.items.map((item: any, i: number) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors border-b border-gray-50 animate-in fade-in slide-in-from-top-1 duration-200">
                <td className="p-2.5 pl-8 text-gray-600 font-medium">{item.label}</td>
                {item.values.map((v: number, idx: number) => (
                  <td key={idx} className="p-2.5 text-right font-mono text-gray-700">{formatVal(v)}</td>
                ))}
              </tr>
            ))}
            <tr className="bg-blue-50/50 font-black border-y border-gray-200">
              <td className="p-3 text-gray-800">{data.operating.totalLabel}</td>
              {data.operating.totals.map((v: number, idx: number) => (
                <td key={idx} className="p-3 text-right font-mono text-blue-800">{formatVal(v)}</td>
              ))}
            </tr>

            {/* Investing */}
            <tr 
              className="bg-gray-100/80 cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => toggleSection('investing')}
            >
              <td colSpan={5} className="p-3 font-black text-gray-800 border-y border-gray-200 uppercase tracking-tight flex items-center gap-2">
                {expandedSections.investing ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                {data.investing.title}
              </td>
            </tr>
            {expandedSections.investing && data.investing.items.map((item: any, i: number) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors border-b border-gray-50 animate-in fade-in slide-in-from-top-1 duration-200">
                <td className="p-2.5 pl-8 text-gray-600 font-medium">{item.label}</td>
                {item.values.map((v: number, idx: number) => (
                  <td key={idx} className="p-2.5 text-right font-mono text-gray-700">{formatVal(v)}</td>
                ))}
              </tr>
            ))}
            <tr className="bg-blue-50/50 font-black border-y border-gray-200">
              <td className="p-3 text-gray-800">{data.investing.totalLabel}</td>
              {data.investing.totals.map((v: number, idx: number) => (
                <td key={idx} className="p-3 text-right font-mono text-blue-800">{formatVal(v)}</td>
              ))}
            </tr>

            {/* Financing */}
            <tr 
              className="bg-gray-100/80 cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => toggleSection('financing')}
            >
              <td colSpan={5} className="p-3 font-black text-gray-800 border-y border-gray-200 uppercase tracking-tight flex items-center gap-2">
                {expandedSections.financing ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                {data.financing.title}
              </td>
            </tr>
            {expandedSections.financing && data.financing.items.map((item: any, i: number) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors border-b border-gray-50 animate-in fade-in slide-in-from-top-1 duration-200">
                <td className="p-2.5 pl-8 text-gray-600 font-medium">{item.label}</td>
                {item.values.map((v: number, idx: number) => (
                  <td key={idx} className="p-2.5 text-right font-mono text-gray-700">{formatVal(v)}</td>
                ))}
              </tr>
            ))}
            <tr className="bg-blue-50/50 font-black border-y border-gray-200">
              <td className="p-3 text-gray-800">{data.financing.totalLabel}</td>
              {data.financing.totals.map((v: number, idx: number) => (
                <td key={idx} className="p-3 text-right font-mono text-blue-800">{formatVal(v)}</td>
              ))}
            </tr>

            {/* Summary */}
            {data.summary.map((item: any, i: number) => (
              <tr key={i} className={`border-b border-gray-200 ${item.isFinal ? 'bg-[#1e3a8a] text-white' : 'bg-gray-100 font-black'}`}>
                <td className="p-3.5 uppercase text-[10px] tracking-wider font-black">{item.label}</td>
                {item.values.map((v: number, idx: number) => (
                  <td key={idx} className={`p-3.5 text-right font-mono text-sm ${item.isFinal ? 'text-white' : 'text-gray-900'}`}>{formatVal(v)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Recent Activity States
  const [activities, setActivities] = useState<any[]>(() => {
    const saved = localStorage.getItem('finance_activities');
    const data = saved ? JSON.parse(saved) : [];
    // Clear April activities as requested
    return data.filter((a: any) => a.month !== 'April');
  });
  const [typeFilter, setTypeFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('April'); // Default to April as per previous context
  const [usdRatesByMonth, setUsdRatesByMonth] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('finance_usd_rates');
    return saved ? JSON.parse(saved) : {
      'Januari': 16786,
      'Februari': 16758,
      'Maret': 16993,
      'April': 17141,
      'All': 17141
    };
  });
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState(17141);
  const [isFetchingRate, setIsFetchingRate] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CF Data States
  const [projectionData, setProjectionData] = useState(() => {
    const saved = localStorage.getItem('finance_cf_projection');
    return saved ? JSON.parse(saved) : {
      operating: {
        title: 'ARUS KAS DARI AKTIVITAS OPERASI',
        items: [
          { label: 'Penerimaan dari penjualan', values: [360, 675, 1121, 1740] },
          { label: 'Pembayaran kas kepada pemasok', values: [-143, -282, -402, -533] },
          { label: 'Pembayaran kepada karyawan', values: [-118, -229, -347, -409] },
          { label: 'Pembayaran beban usaha', values: [-51, -90, -158, -188] },
          { label: 'Penerimaan lain-lain', values: [4, 3, 6, 8] },
          { label: 'Pembayaran bunga pinjaman', values: [-2, -4, -5, -10] },
          { label: 'Penerimaan bunga', values: [7, 19, 24, 31] },
          { label: 'Pembayaran pajak penghasilan', values: [-43, -45, -53, -52] },
          { label: 'Penerimaan restitusi pajak', values: [0, 0, 0, 0] },
        ],
        totalLabel: 'Kas bersih yang diperoleh dari aktivitas operasi',
        totals: [14, 48, 187, 586]
      },
      investing: {
        title: 'ARUS KAS DARI AKTIVITAS INVESTASI',
        items: [
          { label: 'Penambahan jaminan usaha', values: [0, 11, 11, 12] },
          { label: 'Pembayaran jaminan usaha', values: [-10, 0, -10, -31] },
          { label: 'Pembelian/pengurangan aset tetap', values: [-20, -44, -105, -116] },
          { label: 'Aset takberwujud', values: [0, 0, 0, 0] },
          { label: 'Pembayaran Akuisisi Entias Anak', values: [0, 0, 0, 0] },
        ],
        totalLabel: 'Kas bersih yang digunakan untuk aktivitas investasi',
        totals: [-30, -34, -104, -136]
      },
      financing: {
        title: 'ARUS KAS DARI AKTIVITAS PENDANAAN',
        items: [
          { label: 'Pencairan Pinjaman Sindikasi', values: [0, 0, 0, 0] },
          { label: 'Pembayaran Pinjaman Sindikasi', values: [0, 0, 0, 0] },
          { label: 'Pembayaran Pinjaman Bank', values: [-6, -6, -6, -12] },
          { label: 'Penerimaan Pinjaman Bank', values: [0, 0, 0, 0] },
          { label: 'Penerimaan Pinjaman Pihak Berelasi', values: [0, 0, 0, 0] },
          { label: 'Pembayaran Pinjaman Pihak Berelasi', values: [0, 0, 0, 0] },
          { label: 'Pembayaran Dividen', values: [0, 0, 0, 0] },
          { label: 'Pembayaran Utang Pembiayaan', values: [0, 0, 0, 0] },
          { label: 'Pembayaran Liabilitas Sewa', values: [0, 0, 0, 0] },
        ],
        totalLabel: 'Kas bersih (digunakan untuk) diperoleh dari aktivitas pendanaan',
        totals: [-6, -6, -6, -12]
      },
      summary: [
        { label: 'KENAIKAN (PENURUNAN) BERSIH KAS DAN SETARA KAS', values: [-22, 8, 76, 438], isBold: true },
        { label: 'KAS DAN SETARA KAS AWAL TAHUN', values: [1833, 1833, 1833, 1833], isBold: true },
        { label: 'KAS DAN SETARA KAS AKHIR TAHUN', values: [1811, 1842, 1910, 2271], isBold: true, isFinal: true },
      ]
    };
  });

  const [actualData, setActualData] = useState(() => {
    const saved = localStorage.getItem('finance_cf_actual');
    return saved ? JSON.parse(saved) : {
      operating: {
        title: 'ARUS KAS DARI AKTIVITAS OPERASI',
        items: [
          { label: 'Penerimaan dari penjualan', values: [360, 654, 1021] },
          { label: 'Pembayaran kas kepada pemasok', values: [-143, -255, -397] },
          { label: 'Pembayaran kepada karyawan', values: [-118, -226, -313] },
          { label: 'Pembayaran beban usaha', values: [-51, -103, -149] },
          { label: 'Penerimaan lain-lain', values: [4, 7, 9] },
          { label: 'Pembayaran bunga pinjaman', values: [-2, -2, -2] },
          { label: 'Penerimaan bunga', values: [7, 13, 20] },
          { label: 'Pembayaran pajak penghasilan', values: [-43, -49, -50] },
          { label: 'Penerimaan restitusi pajak', values: [0, 0, 0] },
        ],
        totalLabel: 'Kas bersih yang diperoleh dari aktivitas operasi',
        totals: [14, 38, 138]
      },
      investing: {
        title: 'ARUS KAS DARI AKTIVITAS INVESTASI',
        items: [
          { label: 'Penambahan jaminan usaha', values: [0, 11, 12] },
          { label: 'Pembayaran jaminan usaha', values: [-10, -10, -31] },
          { label: 'Pembelian/pengurangan aset tetap', values: [-20, -61, -103] },
          { label: 'Aset takberwujud', values: [0, -2, -2] },
          { label: 'Pembayaran Akuisisi Entias Anak', values: [0, 0, 0] },
        ],
        totalLabel: 'Kas bersih yang digunakan untuk aktivitas investasi',
        totals: [-30, -62, -125]
      },
      financing: {
        title: 'ARUS KAS DARI AKTIVITAS PENDANAAN',
        items: [
          { label: 'Pencairan Pinjaman Sindikasi', values: [0, 0, 0] },
          { label: 'Pembayaran Pinjaman Sindikasi', values: [0, 0, 0] },
          { label: 'Pembayaran Pinjaman Bank', values: [-6, -6, -6] },
          { label: 'Penerimaan Pinjaman Bank', values: [0, 0, 0] },
          { label: 'Penerimaan Pinjaman Pihak Berelasi', values: [0, 0, 0] },
          { label: 'Pembayaran Pinjaman Pihak Berelasi', values: [0, 0, 0] },
          { label: 'Pembayaran Dividen', values: [0, 0, 0] },
          { label: 'Pembayaran Utang Pembiayaan', values: [0, 0, 0] },
          { label: 'Pembayaran Liabilitas Sewa', values: [0, 0, -9] },
        ],
        totalLabel: 'Kas bersih (digunakan untuk) diperoleh dari aktivitas pendanaan',
        totals: [-6, -6, -15]
      },
      summary: [
        { label: 'KENAIKAN (PENURUNAN) BERSIH KAS DAN SETARA KAS', values: [-22, -30, -1], isBold: true },
        { label: 'KAS DAN SETARA KAS AWAL TAHUN', values: [1833, 1833, 1833], isBold: true },
        { label: 'KAS DAN SETARA KAS AKHIR TAHUN', values: [1811, 1804, 1833], isBold: true, isFinal: true },
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem('finance_cf_projection', JSON.stringify(projectionData));
  }, [projectionData]);

  useEffect(() => {
    localStorage.setItem('finance_cf_actual', JSON.stringify(actualData));
  }, [actualData]);

  const [incomingPayments, setIncomingPayments] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('finance_incoming_payments');
    return saved ? JSON.parse(saved) : {
      'All': 402632575,
      'April': 402632575,
      'Mei': 0
    };
  });
  const incomingFileInputRef = useRef<HTMLInputElement>(null);

  // Bank Account Status State
  const [bankStatusByMonth, setBankStatusByMonth] = useState<Record<string, { current: number, closed: number }>>(() => {
    const saved = localStorage.getItem('finance_bank_status');
    return saved ? JSON.parse(saved) : {
      'All': { current: 56, closed: 42 },
      'Januari': { current: 56, closed: 42 },
      'Februari': { current: 56, closed: 42 },
      'Maret': { current: 56, closed: 42 },
      'April': { current: 56, closed: 42 },
      'Mei': { current: 56, closed: 42 }
    };
  });
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [tempBankStatus, setTempBankStatus] = useState({ current: 56, closed: 42 });

  const bankStatus = bankStatusByMonth[monthFilter] || { current: 0, closed: 0 };

  // GAP Analysis State
  const [gapsByMonth, setGapsByMonth] = useState<Record<string, any[]>>(() => {
    const saved = localStorage.getItem('finance_gaps');
    return saved ? JSON.parse(saved) : {
      'All': [
        { id: 'giro', name: 'Giro', amount: 80415428, color: '#8b5cf6', isEditing: false, currency: 'IDR' },
        { id: 'deposito_idr', name: 'Deposito IDR', amount: 46538100, color: '#ec4899', isEditing: false, currency: 'IDR' },
        { id: 'deposito_usd', name: 'Deposito USD', amount: 0, color: '#f59e0b', isEditing: false, currency: 'USD' },
      ],
      'Januari': [
        { id: 'giro', name: 'Giro', amount: 80415428, color: '#8b5cf6', isEditing: false, currency: 'IDR' },
        { id: 'deposito_idr', name: 'Deposito IDR', amount: 46538100, color: '#ec4899', isEditing: false, currency: 'IDR' },
        { id: 'deposito_usd', name: 'Deposito USD', amount: 0, color: '#f59e0b', isEditing: false, currency: 'USD' },
      ],
      'April': [
        { id: 'giro', name: 'Giro', amount: 80415428, color: '#8b5cf6', isEditing: false, currency: 'IDR' },
        { id: 'deposito_idr', name: 'Deposito IDR', amount: 46538100, color: '#ec4899', isEditing: false, currency: 'IDR' },
        { id: 'deposito_usd', name: 'Deposito USD', amount: 0, color: '#f59e0b', isEditing: false, currency: 'USD' },
      ]
    };
  });

  const gaps = gapsByMonth[monthFilter] || [
    { id: 'giro', name: 'Giro', amount: 0, color: '#8b5cf6', isEditing: false, currency: 'IDR' },
    { id: 'deposito_idr', name: 'Deposito IDR', amount: 0, color: '#ec4899', isEditing: false, currency: 'IDR' },
    { id: 'deposito_usd', name: 'Deposito USD', amount: 0, color: '#f59e0b', isEditing: false, currency: 'USD' },
  ];

  // Branch Table State
  const [branchDataByMonth, setBranchDataByMonth] = useState<Record<string, any[]>>(() => {
    const saved = localStorage.getItem('finance_branch_data');
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const defaultData = {
      dept: 'Kantor Pusat',
      bri: 0, bni: 0, mandiri: 0, btn: 0, cimb: 0, bca: 0, bri_agro: 0, bsi: 0, bjb: 0
    };
    
    if (saved) return JSON.parse(saved);
    
    const initial: Record<string, any[]> = { 'All': [defaultData] };
    months.forEach(m => { initial[m] = [defaultData]; });
    return initial;
  });

  const branchData = useMemo(() => {
    return (branchDataByMonth[monthFilter] || [
      { dept: 'Kantor Pusat', bri: 0, bni: 0, mandiri: 0, btn: 0, cimb: 0, bca: 0, bri_agro: 0, bsi: 0, bjb: 0 },
    ]).filter(item => item.dept !== 'xyz');
  }, [branchDataByMonth, monthFilter]);

  const [tableBankFilter, setTableBankFilter] = useState('All');
  const [tableDateFilter, setTableDateFilter] = useState('');

  // Account Balances State (Keyed by month)
  const [accountBalancesByMonth, setAccountBalancesByMonth] = useState<Record<string, any[]>>(() => {
    const saved = localStorage.getItem('finance_account_balances');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Explicitly clear months as requested
      parsed['April'] = [];
      parsed['Januari'] = [];
      return parsed;
    }
    return {
      'April': [],
      'Januari': []
    };
  });

  useEffect(() => {
    localStorage.setItem('finance_account_balances', JSON.stringify(accountBalancesByMonth));
  }, [accountBalancesByMonth]);

  const [cashBalanceUploadSuccess, setCashBalanceUploadSuccess] = useState(false);

  const isTableFiltered = tableBankFilter !== 'All' || tableDateFilter !== '';

  const cashBalanceDisplayData = useMemo(() => {
    const currentMonthBalances = accountBalancesByMonth[monthFilter] || [];
    
    // IF NOT FILTERED: SHOW SUMMARY MODE
    if (!isTableFiltered) {
      if (currentMonthBalances.length === 0) return [];
      
      // Find latest date in this month's data
      const sortedDates = [...new Set(currentMonthBalances.map(a => a.date))].sort().reverse();
      const latestDate = sortedDates[0];

      const groups: Record<string, any> = {};
      currentMonthBalances.forEach(acc => {
        if (!groups[acc.bank]) {
          groups[acc.bank] = {
            bank: acc.bank,
            accounts: new Set(),
            latestBalance: 0,
            latestDate: latestDate,
            isSummary: true
          };
        }
        groups[acc.bank].accounts.add(acc.accountNo);
        if (acc.date === latestDate) {
          groups[acc.bank].latestBalance += (acc.endingBalance || 0);
        }
      });
      return Object.values(groups);
    }

    // IF FILTERED: SHOW DETAIL LIST MODE
    return currentMonthBalances.filter(acc => {
      const matchBank = tableBankFilter === 'All' || acc.bank === tableBankFilter;
      const matchDate = !tableDateFilter || acc.date === tableDateFilter;
      return matchBank && matchDate;
    });
  }, [accountBalancesByMonth, monthFilter, tableBankFilter, tableDateFilter, isTableFiltered]);

  const branchFileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveBankStatus = () => {
    setBankStatusByMonth(prev => ({
      ...prev,
      [monthFilter]: tempBankStatus
    }));
    setIsEditingBank(false);
  };

  const toggleGapEdit = (id: string) => {
    setGapsByMonth(prev => {
      const currentGaps = prev[monthFilter] || gaps;
      return {
        ...prev,
        [monthFilter]: currentGaps.map(gap => gap.id === id ? { ...gap, isEditing: !gap.isEditing } : gap)
      };
    });
  };

  const updateGapAmount = (id: string, amount: number) => {
    setGapsByMonth(prev => {
      const currentGaps = prev[monthFilter] || gaps;
      return {
        ...prev,
        [monthFilter]: currentGaps.map(gap => gap.id === id ? { ...gap, amount } : gap)
      };
    });
  };

  const handleBranchUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
          
          if (jsonData.length > 0) {
            // Helper to handle various date formats from Excel
            const parseExcelDate = (val: any) => {
              if (!val) {
                const now = new Date();
                return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
              }
              
              if (val instanceof Date) {
                // Add 12 hours to push date into the intended day regardless of timezone shifts (e.g., UTC midnight becoming 17:00 previous day)
                const d = new Date(val.getTime() + (12 * 60 * 60 * 1000));
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
              }
              
              if (typeof val === 'number') {
                // Excel serial number
                const date = new Date(Math.round((val - 25569) * 864e5));
                const d = new Date(date.getTime() + (12 * 60 * 60 * 1000));
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
              }

              if (typeof val === 'string') {
                // Try to parse common formats
                const parts = val.split(/[-/]/);
                if (parts.length === 3) {
                  // Check if it's DD/MM/YYYY
                  if (parts[2].length === 4) {
                    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                  }
                  // Check if it's YYYY/MM/DD
                  if (parts[0].length === 4) {
                    return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                  }
                }
              }
              return val.toString();
            };

            // Check if the data is in the new "Account Balance" format
            // We'll be more aggressive in finding columns
            const findKey = (row: any, candidates: string[]) => {
              const keys = Object.keys(row);
              return keys.find(k => candidates.some(c => k.toLowerCase().includes(c.toLowerCase())));
            };

            const accountKey = findKey(jsonData[0], ['account', 'rekening', 'no. rek']);
            const bankColKey = findKey(jsonData[0], ['bank']);
            const balanceKey = findKey(jsonData[0], ['balance', 'saldo akhir', 'ending']);
            
            if (accountKey && balanceKey) {
              const uploadTimestamp = Date.now();
              const newBalances: any[] = jsonData.map((row, index) => {
                const rawVal = row[balanceKey];
                let endingBalance = 0;
                
                if (typeof rawVal === 'number') {
                  endingBalance = rawVal;
                } else if (rawVal) {
                  const cleanedStr = rawVal.toString()
                    .replace(/Rp|IDR|\s/gi, '')
                    .replace(/\./g, '')
                    .replace(/,/g, '.');
                  endingBalance = parseFloat(cleanedStr) || 0;
                }
                
                return {
                  id: `balance-${uploadTimestamp}-${index}`,
                  bank: (row[bankColKey || ''] || '').toString().trim() || 'Unknown',
                  accountNo: (row[accountKey] || '').toString().trim(),
                  endingBalance: endingBalance,
                  date: parseExcelDate(row['Date'] || row['Tanggal'] || row['Date Filter'] || row['Tanggal Filter'])
                };
              }).filter(b => b.accountNo !== '');

              setAccountBalancesByMonth(prev => ({
                ...prev,
                [monthFilter]: newBalances
              }));
              
              setCashBalanceUploadSuccess(true);
              setTimeout(() => setCashBalanceUploadSuccess(false), 3000);
              
              // Reset file input
              if (branchFileInputRef.current) branchFileInputRef.current.value = '';
              return;
            }

            const monthMap: Record<string, string> = {
              'Jan-26': 'Januari',
              'Feb-26': 'Februari',
              'Mar-26': 'Maret',
              'Apr-26': 'April',
              'May-26': 'Mei',
              'Jun-26': 'Juni',
              'Jul-26': 'Juli',
              'Aug-26': 'Agustus',
              'Sep-26': 'September',
              'Oct-26': 'Oktober',
              'Nov-26': 'November',
              'Dec-26': 'Desember'
            };

            const bankKeyMap: Record<string, string> = {
              'BRI': 'bri',
              'BNI': 'bni',
              'MANDIRI': 'mandiri',
              'BTN': 'btn',
              'CIMB': 'cimb',
              'BCA': 'bca',
              'BRI AGRO': 'bri_agro',
              'BRIAGRO': 'bri_agro', // Handle cases without space
              'BSI': 'bsi',
              'BJB': 'bjb'
            };

            const newBranchDataByMonth: Record<string, any[]> = {};

            jsonData.forEach(row => {
              const cabang = (row['Cabang'] || '').toString().trim();
              const bankRaw = (row['Bank'] || '').toString().toUpperCase().replace(/\s+/g, ' ').trim();
              const bankKey = bankKeyMap[bankRaw] || bankKeyMap[bankRaw.replace(/\s/g, '')];

              // Skip rows that don't have a valid branch or bank
              if (!cabang || !bankKey) return;

              Object.entries(monthMap).forEach(([excelMonth, dashboardMonth]) => {
                if (row[excelMonth] !== undefined) {
                  if (!newBranchDataByMonth[dashboardMonth]) {
                    newBranchDataByMonth[dashboardMonth] = [];
                  }

                  let branchEntry = newBranchDataByMonth[dashboardMonth].find(e => e.dept === cabang);
                  if (!branchEntry) {
                    branchEntry = { 
                      dept: cabang, 
                      bri: 0, bni: 0, mandiri: 0, btn: 0, cimb: 0, bca: 0, bri_agro: 0, bsi: 0, bjb: 0 
                    };
                    newBranchDataByMonth[dashboardMonth].push(branchEntry);
                  }
                  
                  let val = row[excelMonth];
                  if (typeof val === 'string') {
                    // Remove dots (thousands) and replace comma with dot (decimal) if present
                    val = parseFloat(val.replace(/\./g, '').replace(/,/g, '.'));
                  }
                  branchEntry[bankKey] = val || 0;
                }
              });
            });

            if (Object.keys(newBranchDataByMonth).length > 0) {
              setBranchDataByMonth(prev => {
                const updated = { ...prev, ...newBranchDataByMonth };
                localStorage.setItem('finance_branch_data', JSON.stringify(updated));
                return updated;
              });
              setUploadSuccess(true);
              setTimeout(() => setUploadSuccess(false), 3000);
            }
          }
        } catch (error) {
          console.error('Error parsing branch excel:', error);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const formatCurrency = (value: number, currency: string = 'IDR') => {
    return new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(Math.ceil(value));
  };

  const dynamicMonthlyTrend = useMemo(() => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return months.map(month => {
      const monthActivities = activities.filter(a => a.month === month);
      const inflow = monthActivities
        .filter(a => a.type === 'Inflow')
        .reduce((sum, a) => sum + a.amount, 0);
      const outflow = monthActivities
        .filter(a => a.type === 'Outflow')
        .reduce((sum, a) => sum + a.amount, 0);
      return { month: month.substring(0, 3), inflow, outflow, fullMonth: month };
    });
  }, [activities]);

  const dashboardActivities = useMemo(() => {
    return activities.filter(item => item.month === monthFilter);
  }, [activities, monthFilter]);

  const dynamicBankData = useMemo(() => {
    const banks = ['BRI', 'BNI', 'Mandiri', 'Others'];
    return banks.map(bank => {
      const bankActivities = dashboardActivities.filter(a => {
        if (bank === 'Others') {
          return a.bank && !['BRI', 'BNI', 'Mandiri'].includes(a.bank.toUpperCase());
        }
        return a.bank?.toUpperCase() === bank.toUpperCase();
      });
      
      const inflow = bankActivities
        .filter(a => a.type === 'Inflow')
        .reduce((sum, a) => sum + a.amount, 0);
      const outflow = bankActivities
        .filter(a => a.type === 'Outflow')
        .reduce((sum, a) => sum + a.amount, 0);
        
      return { name: bank, inflow, outflow };
    });
  }, [dashboardActivities]);

  const filteredActivity = useMemo(() => {
    return activities.filter(item => {
      const typeMatch = typeFilter === 'All' || item.type === typeFilter;
      const monthMatch = monthFilter === 'All Month' || item.month === monthFilter;
      return typeMatch && monthMatch;
    });
  }, [activities, typeFilter, monthFilter]);

  const totalInflow = useMemo(() => {
    return dashboardActivities
      .filter(item => item.type === 'Inflow')
      .reduce((sum, item) => sum + item.amount, 0);
  }, [dashboardActivities]);

  const inflowDetails = useMemo(() => {
    const salesTicketing = dashboardActivities
      .filter(a => a.type === 'Inflow' && (a.category?.toLowerCase().includes('sales') || a.category?.toLowerCase().includes('ticketing')))
      .reduce((sum, a) => sum + a.amount, 0);
    const others = totalInflow - salesTicketing;
    return [
      { label: 'Sales Ticketing', amount: salesTicketing, color: 'bg-blue-500' },
      { label: 'Others', amount: others, color: 'bg-cyan-500' },
    ];
  }, [dashboardActivities, totalInflow]);

  const totalOutflow = useMemo(() => {
    return dashboardActivities
      .filter(item => item.type === 'Outflow')
      .reduce((sum, item) => sum + item.amount, 0);
  }, [dashboardActivities]);

  const outflowDetails = useMemo(() => {
    const categories = [
      { key: 'PAYMENT AP NON PR PO', label: 'Payment AP Non PR PO' },
      { key: 'PETTYFUND REIMBURSE', label: 'Pettyfund Reimburse' },
      { key: 'PEMBAYARAN LAIN-LAIN', label: 'Pembayaran Lain-lain' },
      { key: 'PETTYFUND KASBON', label: 'Pettyfund Kasbon' },
      { key: 'PUK', label: 'PUK' },
      { key: 'OPEX', label: 'OPEX' },
      { key: 'CAPEX', label: 'CAPEX' },
    ];

    const details = categories.map((cat, i) => {
      const amount = dashboardActivities
        .filter(a => a.type === 'Outflow' && a.category?.toUpperCase() === cat.key)
        .reduce((sum, a) => sum + a.amount, 0);
      
      const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500'];
      return { label: cat.label, amount, color: colors[i % colors.length] };
    });

    const totalCategorized = details.reduce((sum, d) => sum + d.amount, 0);
    const othersAmount = Math.max(0, totalOutflow - totalCategorized);

    if (othersAmount > 0) {
      details.push({ label: 'Others', amount: othersAmount, color: 'bg-gray-500' });
    }

    return details;
  }, [dashboardActivities, totalOutflow]);

  const monthsList = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const cumulativeMonthlyBalances = useMemo(() => {
    const cashBalances: Record<string, number> = {};
    const totalBalances: Record<string, number> = {};
    const monthsOrder = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    // 1. Calculate January Cash Base from Branch Data
    const janData = (branchDataByMonth['Januari'] || []).filter(item => item.dept !== 'xyz');
    const janCashBalance = janData.reduce((acc, row) => {
      return acc + (row.bri || 0) + (row.bni || 0) + (row.mandiri || 0) + (row.btn || 0) + (row.cimb || 0) + (row.bca || 0) + (row.bri_agro || 0) + (row.bsi || 0) + (row.bjb || 0);
    }, 0);

    const getMonthDepositos = (month: string) => {
      const currentGaps = gapsByMonth[month] || [];
      const depIdr = currentGaps.find(g => g.id === 'deposito_idr')?.amount || 0;
      const depUsd = currentGaps.find(g => g.id === 'deposito_usd')?.amount || 0;
      const rate = usdRatesByMonth[month] || usdRatesByMonth['All'] || 17141;
      return depIdr + (depUsd * rate);
    };

    const getUploadedBalanceForMonth = (month: string) => {
      const monthData = accountBalancesByMonth[month] || [];
      if (monthData.length === 0) return 0;
      const latestDate = [...new Set(monthData.map(a => a.date))].sort().reverse()[0];
      return monthData
        .filter(a => a.date === latestDate)
        .reduce((sum, acc) => sum + (acc.endingBalance || 0), 0);
    };

    // 2. Set January Cash Balance
    const janUploadedSum = getUploadedBalanceForMonth('Januari');
    cashBalances['Januari'] = janUploadedSum > 0 ? janUploadedSum : janCashBalance;

    // 3. Calculate subsequent months cash cumulatively
    for (let i = 1; i < monthsOrder.length; i++) {
      const currentMonth = monthsOrder[i];
      const prevMonth = monthsOrder[i - 1];
      
      const uploadedBalancesSum = getUploadedBalanceForMonth(currentMonth);

      if (uploadedBalancesSum > 0) {
        cashBalances[currentMonth] = uploadedBalancesSum;
      } else {
        const monthActivities = activities.filter(a => a.month === currentMonth);
        const inflow = monthActivities
          .filter(a => a.type === 'Inflow')
          .reduce((sum, a) => sum + a.amount, 0);
        const outflow = monthActivities
          .filter(a => a.type === 'Outflow')
          .reduce((sum, a) => sum + a.amount, 0);
        
        cashBalances[currentMonth] = cashBalances[prevMonth] + (inflow - outflow);
      }
    }

    // 4. Calculate Total Balance (Cash + Depositos) for each month
    monthsOrder.forEach(month => {
      totalBalances[month] = cashBalances[month] + getMonthDepositos(month);
    });
    
    return totalBalances;
  }, [activities, branchDataByMonth, gapsByMonth, usdRatesByMonth, accountBalancesByMonth]);

  const monthlyBalance = cumulativeMonthlyBalances[monthFilter] || 0;
  const currentUsdRate = usdRatesByMonth[monthFilter] || usdRatesByMonth['All'] || 17141;

  const currentIncomingPayment = useMemo(() => {
    const val = incomingPayments[monthFilter] || 0;
    return val.toLocaleString('id-ID');
  }, [incomingPayments, monthFilter]);

  const [targetsByMonth, setTargetsByMonth] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('finance_targets');
    return saved ? JSON.parse(saved) : {
      'All': 305000000,
      'April': 305000000
    };
  });
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(305000000);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('finance_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('finance_incoming_payments', JSON.stringify(incomingPayments));
  }, [incomingPayments]);

  useEffect(() => {
    localStorage.setItem('finance_bank_status', JSON.stringify(bankStatusByMonth));
  }, [bankStatusByMonth]);

  useEffect(() => {
    localStorage.setItem('finance_gaps', JSON.stringify(gapsByMonth));
  }, [gapsByMonth]);

  useEffect(() => {
    localStorage.setItem('finance_branch_data', JSON.stringify(branchDataByMonth));
  }, [branchDataByMonth]);

  useEffect(() => {
    localStorage.setItem('finance_targets', JSON.stringify(targetsByMonth));
  }, [targetsByMonth]);

  useEffect(() => {
    localStorage.setItem('finance_usd_rates', JSON.stringify(usdRatesByMonth));
  }, [usdRatesByMonth]);

  // Exchange Rate Effect
  useEffect(() => {
    const updateRate = async () => {
      // Only fetch if we don't have a rate for this month or it's the default
      if (usdRatesByMonth[monthFilter] && usdRatesByMonth[monthFilter] !== 17141 && monthFilter !== 'April') return;

      setIsFetchingRate(true);
      const monthIndex = monthsList.indexOf(monthFilter);
      if (monthIndex !== -1) {
        // Get last day of the month
        const lastDay = new Date(parseInt(selectedYear), monthIndex + 1, 0);
        const dateStr = lastDay.toISOString().split('T')[0];
        const rate = await fetchExchangeRate(dateStr);
        if (rate) {
          setUsdRatesByMonth(prev => ({ ...prev, [monthFilter]: rate }));
        } else {
          // If fetch fails, keep existing or use a sensible default if none exists
          console.warn(`Could not fetch rate for ${monthFilter}, keeping current value.`);
        }
      }
      setIsFetchingRate(false);
    };
    updateRate();
  }, [monthFilter, selectedYear]);

  const totalActuals = monthlyBalance;
  const dummyTarget = targetsByMonth[monthFilter] || 0;
  const gapValue = totalActuals - dummyTarget;
  const gapPercentage = dummyTarget !== 0 ? (gapValue / dummyTarget) * 100 : 0;

  const handleSaveTarget = () => {
    setTargetsByMonth(prev => ({
      ...prev,
      [monthFilter]: tempTarget
    }));
    setIsEditingTarget(false);
  };

  const formatMiliar = (val: number, decimals: number = 2) => {
    return (val / 1000000000).toLocaleString('id-ID', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  const stats = [
    { label: 'Cash Inflow', value: formatMiliar(totalInflow), sub: `Billion IDR (${monthFilter})`, icon: <TrendingUp className="text-blue-500" size={20} /> },
    { label: 'Cash Outflow', value: formatMiliar(totalOutflow), sub: `Billion IDR (${monthFilter})`, icon: <TrendingDown className="text-red-500" size={20} /> },
    { label: 'Monthly Balance', value: formatMiliar(monthlyBalance), sub: `Billion IDR (${monthFilter})`, icon: <Wallet className="text-green-500" size={20} /> },
    { label: 'Incoming Payment', value: formatMiliar(incomingPayments[monthFilter] || 0), sub: `Billion (${monthFilter})`, icon: <BarChart3 className="text-gray-400" size={20} />, isIncoming: true },
  ];

  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleIncomingUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
          
          // Logic to sum a specific column for Incoming Payment if exists
          // For now, we'll just show a success message or update with a dummy sum from the file
          if (jsonData.length > 0) {
            let total = 0;
            jsonData.forEach(row => {
              const val = parseFloat(row['Amount'] || row['Total'] || row['Value'] || 0);
              if (!isNaN(val)) total += val;
            });
            if (total > 0) {
              setIncomingPayments(prev => ({
                ...prev,
                [monthFilter]: total
              }));
            }
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 3000);
          }
        } catch (error) {
          console.error('Error parsing incoming payment excel:', error);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const outflowCategories = [
            'PAYMENT AP NON PR PO',
            'PETTYFUND REIMBURSE',
            'PEMBAYARAN LAIN-LAIN',
            'PETTYFUND KASBON',
            'PUK',
            'OPEX',
            'CAPEX'
          ];

          const inflowCategories = [
            'INFLOW',
            'CASH IN',
            'PENERIMAAN',
            'REVENUE',
            'SALES TICKETING',
            'SALES',
            'TICKETING'
          ];

          const newActivities: any[] = [];
          let idCounter = Date.now();

          jsonData.forEach((row: any) => {
            const month = row['Month'] || row['MONTH'] || 'Unknown';
            const bank = row['Bank'] || row['BANK'] || 'Others';
            let dateStr = 'Unknown';
            
            if (row['Date'] || row['DATE']) {
              const rawDate = row['Date'] || row['DATE'];
              if (rawDate instanceof Date) {
                // Add 12 hours offset to prevent day shifting during local time conversion
                const d = new Date(rawDate.getTime() + (12 * 60 * 60 * 1000));
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                dateStr = `${year}-${month}-${day}`;
              } else {
                dateStr = rawDate.toString();
              }
            }
            
            // 1. Handle Column-based format (Categories as columns)
            const rowKeys = Object.keys(row);
            const processedKeys = new Set<string>();
            let rowActivitiesFound = 0;
            
            // Check Outflows
            outflowCategories.forEach(cat => {
              // Use exact match or very specific match to avoid overlapping (e.g., "SALES" matching "SALES TICKETING")
              const matchingKey = rowKeys.find(k => {
                const upperK = k.toUpperCase();
                return upperK === cat || upperK === `SUM OF ${cat}` || upperK === `TOTAL ${cat}`;
              });

              if (matchingKey && !processedKeys.has(matchingKey)) {
                const amount = parseFloat(row[matchingKey]);
                if (!isNaN(amount) && amount !== 0) {
                  newActivities.push({
                    id: idCounter++,
                    date: dateStr,
                    category: cat,
                    amount: Math.abs(amount),
                    type: 'Outflow',
                    month: month.toString(),
                    bank: bank.toString()
                  });
                  processedKeys.add(matchingKey);
                  rowActivitiesFound++;
                }
              }
            });

            // Check Inflows
            inflowCategories.forEach(cat => {
              const matchingKey = rowKeys.find(k => {
                const upperK = k.toUpperCase();
                return upperK === cat || upperK === `SUM OF ${cat}` || upperK === `TOTAL ${cat}`;
              });

              if (matchingKey && !processedKeys.has(matchingKey)) {
                const amount = parseFloat(row[matchingKey]);
                if (!isNaN(amount) && amount !== 0) {
                  newActivities.push({
                    id: idCounter++,
                    date: dateStr,
                    category: cat === 'INFLOW' ? 'Others' : cat,
                    amount: Math.abs(amount),
                    type: 'Inflow',
                    month: month.toString(),
                    bank: bank.toString()
                  });
                  processedKeys.add(matchingKey);
                  rowActivitiesFound++;
                }
              }
            });

            // 2. Handle Row-based format (Type, Amount, Category columns)
            // Only if no column-based activities were found for this row
            if (rowActivitiesFound === 0) {
              const typeVal = (row['Type'] || row['TYPE'] || '').toString().toUpperCase();
              const amountVal = parseFloat(row['Amount'] || row['AMOUNT'] || row['Total'] || row['TOTAL'] || row['Value'] || row['VALUE']);
              const categoryVal = row['Category'] || row['CATEGORY'] || row['Keterangan'] || row['KETERANGAN'];

              if (typeVal && !isNaN(amountVal) && amountVal !== 0) {
                const isOutflow = typeVal.includes('OUT') || typeVal.includes('KELUAR') || outflowCategories.some(c => typeVal === c);
                const isInflow = typeVal.includes('IN') || typeVal.includes('MASUK') || inflowCategories.some(c => typeVal === c);

                if (isInflow || isOutflow) {
                  newActivities.push({
                    id: idCounter++,
                    date: dateStr,
                    category: categoryVal || (isInflow ? 'Inflow' : 'Outflow'),
                    amount: Math.abs(amountVal),
                    type: isInflow ? 'Inflow' : 'Outflow',
                    month: month.toString(),
                    bank: bank.toString()
                  });
                }
              }
            }
          });

          if (newActivities.length > 0) {
            setActivities(prev => [...newActivities, ...prev]);
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 3000);
          }
        } catch (error) {
          console.error('Error parsing excel:', error);
          alert('Failed to parse Excel file. Please check the format.');
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans text-[#333] overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white border-r border-gray-200 flex flex-col overflow-hidden whitespace-nowrap"
          >
            <div className="p-6 flex items-center gap-3 border-bottom border-gray-100">
              <div className="w-10 h-10 bg-[#1e3a8a] rounded-lg flex items-center justify-center text-white shrink-0">
                <DollarSign size={24} />
              </div>
              <span className="font-bold text-xl tracking-tight text-[#1e3a8a]">FINANCE</span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'dashboard' 
                    ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-100' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Home size={20} className="shrink-0" />
                <span className="font-medium">Home</span>
                {activeTab === 'dashboard' && <motion.div layoutId="active" className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
              </button>

              <button 
                onClick={() => setActiveTab('projection')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'projection' 
                    ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-100' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <LineChartIcon size={20} className="shrink-0" />
                <span className="font-medium">Projection</span>
                {activeTab === 'projection' && <motion.div layoutId="active" className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
              </button>

              <button 
                onClick={() => setActiveTab('transactions')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'transactions' 
                    ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-100' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <History size={20} className="shrink-0" />
                <span className="font-medium">Recent Transaction</span>
                {activeTab === 'transactions' && <motion.div layoutId="active" className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
              </button>
            </nav>

            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Year</span>
                <div className="flex gap-2">
                  <Filter size={14} className="text-gray-400 cursor-pointer" />
                  <ChevronDown size={14} className="text-gray-400 cursor-pointer" />
                </div>
              </div>
              <div className="space-y-2">
                {['2026'].map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${
                      selectedYear === year 
                        ? 'bg-red-50 text-red-600 font-bold border border-red-100' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Header */}
        <header className="bg-[#1e3a8a] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl font-bold tracking-tight uppercase">FINANCE STATUS DASHBOARD</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <Search size={20} />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1e3a8a]"></span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {activeTab === 'dashboard' ? (
            <>
              {/* Month Selection Top Bar */}
          <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-1 overflow-x-auto no-scrollbar">
            {months.map((month) => (
              <button
                key={month}
                onClick={() => setMonthFilter(month)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                  monthFilter === month
                    ? 'bg-[#1e3a8a] text-white shadow-lg shadow-blue-100'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                }`}
              >
                {month.toUpperCase()}
              </button>
            ))}
            
            <div className="ml-auto flex items-center gap-3 px-6 border-l border-gray-100">
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-bold text-gray-400 uppercase leading-none mb-0.5">Kurs Tengah BI</span>
                {isEditingRate ? (
                  <div className="flex items-center gap-1 animate-in zoom-in-95 duration-200">
                    <input 
                      type="number"
                      value={tempRate}
                      onChange={(e) => setTempRate(parseInt(e.target.value) || 0)}
                      className="w-20 px-1 py-0.5 text-xs font-black border rounded bg-blue-50 text-blue-700 outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setUsdRatesByMonth(prev => ({ ...prev, [monthFilter]: tempRate }));
                          setIsEditingRate(false);
                        }
                        if (e.key === 'Escape') setIsEditingRate(false);
                      }}
                    />
                    <button 
                      onClick={() => {
                        setUsdRatesByMonth(prev => ({ ...prev, [monthFilter]: tempRate }));
                        setIsEditingRate(false);
                      }}
                      className="p-0.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Check size={10} />
                    </button>
                  </div>
                ) : (
                  <span 
                    className="text-xs font-black text-blue-600 leading-tight cursor-pointer hover:underline decoration-dotted underline-offset-2"
                    onClick={() => {
                      setTempRate(currentUsdRate);
                      setIsEditingRate(true);
                    }}
                    title="Klik untuk edit manual"
                  >
                    {isFetchingRate ? (
                      <span className="animate-pulse">FETCHING...</span>
                    ) : (
                      `Rp ${currentUsdRate.toLocaleString('id-ID')}`
                    )}
                  </span>
                )}
              </div>
              <div 
                className={`p-1.5 rounded-lg bg-blue-50 text-blue-600 cursor-pointer hover:bg-blue-100 transition-colors ${isFetchingRate ? 'animate-spin' : ''}`}
                onClick={() => {
                  const updateRate = async () => {
                    setIsFetchingRate(true);
                    const monthIndex = monthsList.indexOf(monthFilter);
                    if (monthIndex !== -1) {
                      const lastDay = new Date(parseInt(selectedYear), monthIndex + 1, 0);
                      const dateStr = lastDay.toISOString().split('T')[0];
                      const rate = await fetchExchangeRate(dateStr);
                      if (rate) {
                        setUsdRatesByMonth(prev => ({ ...prev, [monthFilter]: rate }));
                        setTempRate(rate);
                      } else {
                        alert('Could not fetch exchange rate. Please check your internet connection or try again later.');
                      }
                    }
                    setIsFetchingRate(false);
                  };
                  updateRate();
                }}
              >
                <RefreshCw size={12} />
              </div>
            </div>
          </div>

          {/* Top Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</span>
                  {stat.icon}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-gray-800">{stat.value}</span>
                  <span className="text-[10px] font-bold text-gray-400">{stat.sub}</span>
                </div>
                
                {(stat as any).isIncoming && (
                  <div className="absolute top-2 right-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => incomingFileInputRef.current?.click()}
                      className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-md text-gray-500 transition-colors border border-gray-200"
                      title="Upload Incoming Payment Data"
                    >
                      <Upload size={12} />
                    </button>
                    <input 
                      type="file" 
                      ref={incomingFileInputRef} 
                      onChange={handleIncomingUpload} 
                      className="hidden" 
                      accept=".xlsx, .xls"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Cash Details & Bank Status */}
            <div className="lg:col-span-4 space-y-6">
              {/* Cash Inflows Details */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-black text-gray-800 tracking-tight uppercase">Cash Inflows Details <span className="text-[10px] text-gray-400 capitalize">(Billion)</span></h2>
                  <TrendingUp className="text-green-500" size={16} />
                </div>
                <div className="space-y-3">
                  {inflowDetails.map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-gray-500">{item.label}</span>
                        <span className="text-gray-800">{formatMiliar(item.amount)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color}`} 
                          style={{ width: `${totalInflow > 0 ? (item.amount / totalInflow) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cash Outflow Details */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-black text-gray-800 tracking-tight uppercase">Cash Outflow Details <span className="text-[10px] text-gray-400 capitalize">(Billion)</span></h2>
                  <TrendingDown className="text-red-500" size={16} />
                </div>
                <div className="space-y-3">
                  {outflowDetails.map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-gray-500">{item.label}</span>
                        <span className="text-gray-800">{formatMiliar(item.amount)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color}`} 
                          style={{ width: `${totalOutflow > 0 ? (item.amount / totalOutflow) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GAP Indicators moved here to swap with Bank Account Status */}
              <div className="flex flex-col gap-3">
                {(gapsByMonth[monthFilter] || gaps).map((gap) => {
                  const amountInIdr = gap.currency === 'USD' ? gap.amount * currentUsdRate : gap.amount;
                  const percentage = monthlyBalance !== 0 
                    ? Math.min(100, Math.max(0, Math.abs((amountInIdr / monthlyBalance) * 100))) 
                    : 0;
                  
                  return (
                    <div key={gap.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 relative group h-[114px] overflow-hidden">
                      <button 
                        onClick={() => toggleGapEdit(gap.id)}
                        className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        {gap.isEditing ? <Save size={12} className="text-blue-600" /> : <Edit2 size={12} />}
                      </button>

                      <div className="relative w-14 h-14 shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                          <circle
                            cx="40"
                            cy="40"
                            r="34"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-gray-100"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="34"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={213.6}
                            strokeDashoffset={213.6 - (213.6 * percentage) / 100}
                            strokeLinecap="round"
                            style={{ color: gap.color }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-black" style={{ color: gap.color }}>{Math.round(percentage)}%</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5 tracking-tight">{gap.name}</p>
                        
                        {gap.isEditing ? (
                          <div className="mt-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
                            <input 
                              type="number"
                              value={gap.amount}
                              onChange={(e) => updateGapAmount(gap.id, parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-0.5 text-xs font-bold border rounded bg-gray-50 focus:ring-1 focus:ring-blue-500 outline-none"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <p className="text-sm font-black text-gray-800 leading-none">
                              {gap.currency === 'USD' ? (
                                formatCurrency(gap.amount, 'USD')
                              ) : (
                                <>
                                  {formatMiliar(gap.amount)} <span className="text-[10px] text-gray-400 font-bold">Billion</span>
                                </>
                              )}
                            </p>
                            {gap.currency === 'USD' && (
                              <div className="mt-1 flex flex-col items-start animate-in fade-in slide-in-from-top-1 duration-300">
                                <p className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                  ≈ {formatMiliar(gap.amount * currentUsdRate)} Billion
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Main Bar Chart & Trends */}
            <div className="lg:col-span-8 space-y-6">
              {/* Cash Balance Table (Reformatted) */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative group">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-black text-gray-800 tracking-tight">Cash Balance <span className="text-xs lowercase font-medium text-gray-400 font-bold">(Billion IDR)</span></h2>
                    <p className="text-xs text-gray-400 font-medium">Bank account balances with Bank and Date filtering</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Bank Filter */}
                    <div className="relative">
                      <select 
                        value={tableBankFilter}
                        onChange={(e) => setTableBankFilter(e.target.value)}
                        className="pl-8 pr-4 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 outline-none focus:ring-1 focus:ring-blue-500 appearance-none min-w-[120px]"
                      >
                        <option value="All">All Banks</option>
                        {['BRI', 'BNI', 'MANDIRI', 'BTN', 'CIMB', 'BCA', 'BSI', 'BJB'].map(bank => (
                          <option key={bank} value={bank}>{bank}</option>
                        ))}
                      </select>
                      <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    </div>

                    {/* Date Filter */}
                    <div className="relative">
                      <input 
                        type="date"
                        value={tableDateFilter}
                        onChange={(e) => setTableDateFilter(e.target.value)}
                        className="pl-8 pr-4 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 outline-none focus:ring-1 focus:ring-blue-500 min-w-[140px]"
                      />
                      <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    </div>

                    <button 
                      onClick={() => branchFileInputRef.current?.click()}
                      className={`p-1.5 rounded-md transition-all border flex items-center gap-1 ${
                        cashBalanceUploadSuccess 
                          ? 'bg-green-50 text-green-600 border-green-200' 
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-blue-600 border-gray-100'
                      }`}
                      title="Upload Data"
                    >
                      {cashBalanceUploadSuccess ? <CheckCircle2 size={14} /> : <Upload size={14} />}
                      {cashBalanceUploadSuccess && <span className="text-[10px] font-bold">Updated</span>}
                    </button>
                    <input 
                      type="file" 
                      ref={branchFileInputRef} 
                      onChange={handleBranchUpload} 
                      className="hidden" 
                      accept=".xlsx, .xls"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar border border-gray-100 rounded-xl h-[390px] overflow-y-auto">
                  <table className="w-full text-left border-separate border-spacing-0">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gray-50/95 backdrop-blur-sm shadow-sm">
                        <th className="p-4 border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-wider bg-inherit">Bank</th>
                        <th className="p-4 border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-wider bg-inherit">Account No.</th>
                        <th className="p-4 border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-wider text-right bg-inherit">Ending Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cashBalanceDisplayData.length > 0 ? cashBalanceDisplayData.map((item: any, idx: number) => (
                        <tr key={item.id || `summary-${idx}`} className="hover:bg-gray-50/30 transition-colors group">
                          <td className="p-4 border-b border-gray-50 text-sm font-bold text-[#1e3a8a]">
                            <div className="flex items-center gap-2">
                              {item.isSummary ? (
                                <div className="w-8 h-8 rounded-lg bg-[#1e3a8a]/10 text-[#1e3a8a] flex items-center justify-center text-[10px] font-black uppercase">
                                  {item.bank.substring(0, 3)}
                                </div>
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              )}
                              {item.bank}
                            </div>
                          </td>
                          <td className="p-4 border-b border-gray-50 text-xs font-medium text-gray-500 font-mono italic">
                            {item.isSummary ? (
                              <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600 not-italic font-bold">
                                {item.accounts.size} Total Accounts
                              </span>
                            ) : (
                              item.accountNo
                            )}
                          </td>
                          <td className="p-4 border-b border-gray-50 text-sm font-black text-gray-800 text-right font-mono">
                            {item.isSummary ? (
                              <div className="flex flex-col items-end">
                                <div>
                                  {formatMiliar(item.latestBalance, 2)} <span className="text-[10px] font-bold text-gray-400 ml-1">Billion</span>
                                </div>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter bg-gray-50 px-1.5 rounded-sm mt-0.5">
                                  As of {item.latestDate}
                                </span>
                              </div>
                            ) : (
                              <>
                                {formatMiliar(item.endingBalance, 2)} <span className="text-[10px] font-bold text-gray-400 ml-1">Billion</span>
                              </>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={3} className="p-12 text-center">
                            <div className="flex flex-col items-center gap-2 text-gray-400">
                              <Search size={24} className="opacity-20" />
                              <p className="text-xs font-bold uppercase tracking-widest">No matching accounts found</p>
                              <button 
                                onClick={() => {setTableBankFilter('All'); setTableDateFilter('');}}
                                className="text-[10px] text-blue-500 hover:underline mt-2 font-bold"
                              >
                                Clear all filters
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Monthly Trend Chart */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-black text-gray-800 tracking-tight">Monthly Cash Flow Trend</h2>
                    <p className="text-xs text-gray-400 font-medium">Visualizing Inflow vs Outflow across the year</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#1e3a8a]"></div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Cash Inflow</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Cash Outflow</span>
                    </div>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dynamicMonthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorInflowTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorOutflowTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                        tickFormatter={(value) => formatMiliar(value)}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [formatMiliar(value), 'Miliar']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="inflow" 
                        stroke="#1e3a8a" 
                        fillOpacity={1} 
                        fill="url(#colorInflowTrend)" 
                        strokeWidth={3} 
                        name="Cash Inflow"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="outflow" 
                        stroke="#ef4444" 
                        fillOpacity={1} 
                        fill="url(#colorOutflowTrend)" 
                        strokeWidth={3} 
                        name="Cash Outflow"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

        </>
        ) : activeTab === 'projection' ? (
          <div className="space-y-8">
            <CFProjection data={projectionData} setData={setProjectionData} />
            <CFComparisonChart projectionData={projectionData} actualData={actualData} />
            <CFActual data={actualData} setData={setActualData} />
          </div>
        ) : (
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                    <ArrowRightLeft className="text-[#1e3a8a]" size={24} />
                    Recent Activity
                  </h2>
                  <p className="text-sm text-gray-400 font-medium">Detailed transaction history for the selected period</p>
                </div>
                
                {/* Excel Upload Button */}
                <div className="relative">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".xlsx, .xls" 
                    className="hidden" 
                  />
                  <button 
                    onClick={handleUploadClick}
                    disabled={isUploading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      uploadSuccess 
                        ? 'bg-green-500 text-white' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100'
                    }`}
                  >
                    {isUploading ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : uploadSuccess ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <FileUp size={14} />
                    )}
                    {isUploading ? 'Uploading...' : uploadSuccess ? 'Success!' : 'Upload Excel'}
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {/* Type Filter */}
                <div className="relative group">
                  <select 
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="appearance-none bg-gray-50 border border-gray-100 text-gray-700 text-xs font-bold rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                  >
                    <option value="All">All Types</option>
                    <option value="Inflow">Inflow</option>
                    <option value="Outflow">Outflow</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>

                {/* Month Filter */}
                <div className="relative group">
                    <select 
                      value={monthFilter}
                      onChange={(e) => setMonthFilter(e.target.value)}
                      className="appearance-none bg-gray-50 border border-gray-100 text-gray-700 text-xs font-bold rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                    >
                      <option value="All Month">All Month</option>
                      {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bank</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <AnimatePresence mode="popLayout">
                    {filteredActivity.length > 0 ? (
                      filteredActivity.map((activity) => (
                        <motion.tr 
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          key={activity.id} 
                          className="hover:bg-gray-50 transition-colors group"
                        >
                          <td className="py-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                activity.type === 'Inflow' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                              }`}>
                                {activity.type === 'Inflow' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                              </div>
                              <span className="text-xs font-bold text-gray-800">{activity.date}</span>
                            </div>
                          </td>
                          <td className="py-5 text-xs font-bold text-blue-600 uppercase">{activity.bank || '-'}</td>
                          <td className="py-5 text-xs font-medium text-gray-600">{activity.category}</td>
                          <td className="py-5 text-xs font-black text-gray-800">{formatCurrency(activity.amount)}</td>
                          <td className="py-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              activity.type === 'Inflow' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {activity.type}
                            </span>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <td colSpan={4} className="py-12 text-center text-gray-400 text-sm font-medium">
                          No activities found for the selected filters.
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
      </main>
    </div>
  );
}

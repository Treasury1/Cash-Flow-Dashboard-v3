/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useRef, ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
import { 
  LayoutDashboard, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart3,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  Bell,
  User,
  Menu,
  X,
  ArrowRightLeft,
  FileUp,
  CheckCircle2,
  Upload,
  Edit2,
  Save
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
  { id: 3, date: '2026-03-25', category: 'Consultancy Fee', amount: 12000000, type: 'Inflow', month: 'March' },
  { id: 4, date: '2026-03-15', category: 'Office Rent', amount: 8000000, type: 'Outflow', month: 'March' },
  { id: 5, date: '2026-02-20', category: 'Equipment Purchase', amount: 25000000, type: 'Outflow', month: 'February' },
  { id: 6, date: '2026-02-10', category: 'Service Revenue', amount: 30000000, type: 'Inflow', month: 'February' },
  { id: 7, date: '2026-01-15', category: 'Tax Payment', amount: 4000000, type: 'Outflow', month: 'January' },
  { id: 8, date: '2026-01-05', category: 'Investment Return', amount: 18000000, type: 'Inflow', month: 'January' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Recent Activity States
  const [activities, setActivities] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('April'); // Default to April as per previous context
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [incomingPayments, setIncomingPayments] = useState<Record<string, number>>({
    'All': 402632575,
    'April': 402632575
  });
  const incomingFileInputRef = useRef<HTMLInputElement>(null);

  // Bank Account Status State
  const [bankStatusByMonth, setBankStatusByMonth] = useState<Record<string, { current: number, closed: number }>>({
    'All': { current: 56, closed: 42 },
    'April': { current: 56, closed: 42 }
  });
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [tempBankStatus, setTempBankStatus] = useState({ current: 56, closed: 42 });

  const bankStatus = bankStatusByMonth[monthFilter] || { current: 0, closed: 0 };

  // GAP Analysis State
  const [gapsByMonth, setGapsByMonth] = useState<Record<string, any[]>>({
    'All': [
      { id: 'giro', name: 'Giro', amount: 80415428, color: '#8b5cf6', isEditing: false, currency: 'IDR' },
      { id: 'deposito_idr', name: 'Deposito IDR', amount: 46538100, color: '#ec4899', isEditing: false, currency: 'IDR' },
      { id: 'deposito_usd', name: 'Deposito USD', amount: 0, color: '#f59e0b', isEditing: false, currency: 'USD' },
    ],
    'April': [
      { id: 'giro', name: 'Giro', amount: 80415428, color: '#8b5cf6', isEditing: false, currency: 'IDR' },
      { id: 'deposito_idr', name: 'Deposito IDR', amount: 46538100, color: '#ec4899', isEditing: false, currency: 'IDR' },
      { id: 'deposito_usd', name: 'Deposito USD', amount: 0, color: '#f59e0b', isEditing: false, currency: 'USD' },
    ]
  });

  const gaps = gapsByMonth[monthFilter] || [
    { id: 'giro', name: 'Giro', amount: 0, color: '#8b5cf6', isEditing: false, currency: 'IDR' },
    { id: 'deposito_idr', name: 'Deposito IDR', amount: 0, color: '#ec4899', isEditing: false, currency: 'IDR' },
    { id: 'deposito_usd', name: 'Deposito USD', amount: 0, color: '#f59e0b', isEditing: false, currency: 'USD' },
  ];

  // Branch Table State
  const [branchDataByMonth, setBranchDataByMonth] = useState<Record<string, any[]>>({
    'All': [
      { dept: 'Kantor Pusat', bri: 0, bni: 0, mandiri: 0, others: 0 },
      { dept: 'xyz', bri: 0, bni: 0, mandiri: 0, others: 0 },
    ],
    'April': [
      { dept: 'Kantor Pusat', bri: 0, bni: 0, mandiri: 0, others: 0 },
      { dept: 'xyz', bri: 0, bni: 0, mandiri: 0, others: 0 },
    ]
  });

  const branchData = branchDataByMonth[monthFilter] || [
    { dept: 'Kantor Pusat', bri: 0, bni: 0, mandiri: 0, others: 0 },
    { dept: 'xyz', bri: 0, bni: 0, mandiri: 0, others: 0 },
  ];
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
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
          
          if (jsonData.length > 0) {
            const newBranchData = jsonData.map(row => ({
              dept: row['Cabang'] || row['Branch'] || 'Unknown',
              bri: parseFloat(row['BRI'] || 0),
              bni: parseFloat(row['BNI'] || 0),
              mandiri: parseFloat(row['Mandiri'] || 0),
              others: parseFloat(row['Others'] || 0),
            }));
            setBranchDataByMonth(prev => ({
              ...prev,
              [monthFilter]: newBranchData
            }));
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 3000);
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
      maximumFractionDigits: currency === 'IDR' ? 0 : 2,
    }).format(value);
  };

  const dynamicMonthlyTrend = useMemo(() => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
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
    return activities.filter(item => monthFilter === 'All' || item.month === monthFilter);
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
      const monthMatch = monthFilter === 'All' || item.month === monthFilter;
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

  const monthsList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const cumulativeMonthlyBalances = useMemo(() => {
    let cumulative = 0;
    const balances: Record<string, number> = { 'All': 0 };
    
    monthsList.forEach(month => {
      const monthActivities = activities.filter(a => a.month === month);
      const inflow = monthActivities
        .filter(a => a.type === 'Inflow')
        .reduce((sum, a) => sum + a.amount, 0);
      const outflow = monthActivities
        .filter(a => a.type === 'Outflow')
        .reduce((sum, a) => sum + a.amount, 0);
      
      cumulative += (inflow - outflow);
      balances[month] = cumulative;
    });
    
    balances['All'] = cumulative;
    return balances;
  }, [activities]);

  const monthlyBalance = cumulativeMonthlyBalances[monthFilter];

  const currentIncomingPayment = useMemo(() => {
    const val = incomingPayments[monthFilter] || 0;
    return val.toLocaleString('id-ID');
  }, [incomingPayments, monthFilter]);

  const totalActuals = totalInflow;
  const dummyTarget = totalActuals > 0 ? totalActuals * 1.08 : 305000000; // 8% gap as per original UI
  const gapValue = totalActuals - dummyTarget;
  const gapPercentage = dummyTarget !== 0 ? (gapValue / dummyTarget) * 100 : 0;

  const stats = [
    { label: 'Cash Inflow', value: totalInflow.toLocaleString('id-ID'), sub: 'Rp', icon: <TrendingUp className="text-blue-500" size={20} /> },
    { label: 'Cash Outflow', value: totalOutflow.toLocaleString('id-ID'), sub: 'Rp', icon: <TrendingDown className="text-red-500" size={20} /> },
    { label: 'Monthly Balance', value: monthlyBalance.toLocaleString('id-ID'), sub: 'Rp', icon: <DollarSign className="text-green-500" size={20} /> },
    { label: 'Incoming Payment', value: currentIncomingPayment, sub: 'Active', icon: <BarChart3 className="text-gray-400" size={20} />, isIncoming: true },
  ];

  const months = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
                const d = new Date(rawDate.getTime() + (12 * 60 * 60 * 1000));
                const year = d.getUTCFullYear();
                const month = String(d.getUTCMonth() + 1).padStart(2, '0');
                const day = String(d.getUTCDate()).padStart(2, '0');
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
                <LayoutDashboard size={20} className="shrink-0" />
                <span className="font-medium">Dashboard</span>
                {activeTab === 'dashboard' && <motion.div layoutId="active" className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
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
                {month === 'All' ? 'ALL MONTHS' : month.toUpperCase()}
              </button>
            ))}
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
                  <h2 className="text-sm font-black text-gray-800 tracking-tight uppercase">Cash Inflows Details</h2>
                  <TrendingUp className="text-green-500" size={16} />
                </div>
                <div className="space-y-3">
                  {inflowDetails.map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-gray-500">{item.label}</span>
                        <span className="text-gray-800">{formatCurrency(item.amount)}</span>
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
                  <h2 className="text-sm font-black text-gray-800 tracking-tight uppercase">Cash Outflow Details</h2>
                  <TrendingDown className="text-red-500" size={16} />
                </div>
                <div className="space-y-3">
                  {outflowDetails.map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-gray-500">{item.label}</span>
                        <span className="text-gray-800">{formatCurrency(item.amount)}</span>
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

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative group">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-gray-800 tracking-tight">Bank Account Status</h2>
                    <button 
                      onClick={() => {
                        setTempBankStatus(bankStatus);
                        setIsEditingBank(!isEditingBank);
                      }}
                      className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                  
                  {isEditingBank ? (
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100 shadow-inner animate-in fade-in zoom-in duration-200">
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-gray-400 uppercase block">Current</label>
                        <input 
                          type="number" 
                          value={tempBankStatus.current}
                          onChange={(e) => setTempBankStatus({...tempBankStatus, current: parseInt(e.target.value) || 0})}
                          className="w-16 px-2 py-1 text-xs font-bold border rounded bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-gray-400 uppercase block">Closed</label>
                        <input 
                          type="number" 
                          value={tempBankStatus.closed}
                          onChange={(e) => setTempBankStatus({...tempBankStatus, closed: parseInt(e.target.value) || 0})}
                          className="w-16 px-2 py-1 text-xs font-bold border rounded bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <button 
                        onClick={handleSaveBankStatus}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        <Save size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Current</p>
                        <div className="flex items-center gap-1 text-blue-600">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                          <span className="text-sm font-black">{bankStatus.current}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Closed</p>
                        <div className="flex items-center gap-1 text-blue-900">
                          <span className="w-1.5 h-1.5 bg-blue-900 rounded-full"></span>
                          <span className="text-sm font-black">{bankStatus.closed}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-48 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Current', value: bankStatus.current },
                          { name: 'Closed', value: bankStatus.closed },
                        ]}
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#2563eb" />
                        <Cell fill="#1e3a8a" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-black text-gray-800">{bankStatus.current + bankStatus.closed}</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase">Total</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Main Bar Chart & Trends */}
            <div className="lg:col-span-8 space-y-6">
              {/* Net Cash Flow by Bank Chart */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-black text-gray-800 tracking-tight">Net Cash flow by Bank</h2>
                    <p className="text-xs text-gray-400 font-medium">Comparison of Inflow vs Outflow across major banking partners</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-[#1e3a8a] rounded-sm"></span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Inflow</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-[#2563eb] rounded-sm"></span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Outflow</span>
                    </div>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dynamicBankData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                        tickFormatter={(value) => `${value / 1000000}M`}
                      />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Bar dataKey="inflow" fill="#1e3a8a" radius={[4, 4, 0, 0]} barSize={40} />
                      <Bar dataKey="outflow" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Targets For {monthFilter === 'All' ? 'Year' : monthFilter}</p>
                    <p className="text-xl font-black text-gray-800">{(dummyTarget / 1000000).toFixed(0)} M</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Actuals For {monthFilter === 'All' ? 'Year' : monthFilter}</p>
                    <p className="text-xl font-black text-gray-800">{(totalActuals / 1000000).toFixed(0)} M</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">GAP</p>
                    <div className={`flex items-center justify-center gap-1 ${gapValue >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      <span className="text-xl font-black">{(gapValue / 1000000).toFixed(0)} M</span>
                      <span className="text-[10px] font-bold">{gapValue >= 0 ? '▲' : '▼'} {Math.abs(gapPercentage).toFixed(0)}%</span>
                    </div>
                  </div>
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
                        tickFormatter={(value) => `${value / 1000000}M`}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => formatCurrency(value)}
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

          {/* Bottom Row: GAP Analysis & Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* GAP Indicators */}
            <div className="lg:col-span-6 grid grid-cols-3 gap-4">
              {gaps.map((gap) => {
                const percentage = monthlyBalance !== 0 
                  ? Math.min(100, Math.max(0, Math.abs((gap.amount / monthlyBalance) * 100))) 
                  : 0;
                
                return (
                  <div key={gap.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center relative group">
                    <button 
                      onClick={() => toggleGapEdit(gap.id)}
                      className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {gap.isEditing ? <Save size={14} className="text-blue-600" /> : <Edit2 size={14} />}
                    </button>

                    <div className="relative w-20 h-20 mb-4">
                      <svg className="w-full h-full transform -rotate-90">
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
                        <span className="text-lg font-black" style={{ color: gap.color }}>{Math.round(percentage)}%</span>
                      </div>
                    </div>
                    
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{gap.name}</p>
                    
                    {gap.isEditing ? (
                      <div className="mt-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <input 
                          type="number"
                          value={gap.amount}
                          onChange={(e) => updateGapAmount(gap.id, parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-xs font-bold border rounded bg-gray-50 focus:ring-1 focus:ring-blue-500 outline-none text-center"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-black text-gray-800">{formatCurrency(gap.amount, (gap as any).currency)}</p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Data Table */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative group">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Branch Details</h3>
                  {/* Month Filter for Table */}
                  <div className="relative group">
                    <select 
                      value={monthFilter}
                      onChange={(e) => setMonthFilter(e.target.value)}
                      className="appearance-none bg-gray-50 border border-gray-100 text-gray-700 text-[10px] font-bold rounded-lg px-3 py-1 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-100 transition-all cursor-pointer"
                    >
                      {months.map(m => <option key={m} value={m}>{m === 'All' ? 'All Months' : m}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={10} />
                  </div>
                </div>
                <button 
                  onClick={() => branchFileInputRef.current?.click()}
                  className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-md text-gray-400 hover:text-blue-600 transition-colors border border-gray-100"
                  title="Upload Branch Data"
                >
                  <Upload size={12} />
                </button>
                <input 
                  type="file" 
                  ref={branchFileInputRef} 
                  onChange={handleBranchUpload} 
                  className="hidden" 
                  accept=".xlsx, .xls"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cabang</th>
                      <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">BRI</th>
                      <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">BNI</th>
                      <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mandiri</th>
                      <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Others</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {branchData.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 text-xs font-black text-gray-800">{row.dept}</td>
                        <td className="py-4 text-xs font-medium text-gray-500">{row.bri === 0 ? '-' : formatCurrency(row.bri)}</td>
                        <td className="py-4 text-xs font-medium text-gray-500">{row.bni === 0 ? '-' : formatCurrency(row.bni)}</td>
                        <td className="py-4 text-xs font-medium text-gray-500">{row.mandiri === 0 ? '-' : formatCurrency(row.mandiri)}</td>
                        <td className="py-4 text-xs font-medium text-gray-500">{row.others === 0 ? '-' : formatCurrency(row.others)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
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
                    {months.map(m => <option key={m} value={m}>{m === 'All' ? 'All Months' : m}</option>)}
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
        </div>
      </main>
    </div>
  );
}

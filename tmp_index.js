import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  PieChart, 
  TrendingUp, 
  Settings, 
  Plus, 
  Filter, 
  Upload, 
  Download, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  X,
  LogOut,
  User,
  History,
  Trash2,
  Edit2,
  ExternalLink
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart as RePieChart, Pie, Cell, Legend 
} from 'recharts';

// --- 常量与工具函数 ---
const CURRENCY = 'CNY';
const formatAmount = (val) => {
  const num = parseFloat(val);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// --- 模拟数据 ---
const INITIAL_ACCOUNTS = [
  { id: '1', name: '招商银行储蓄卡', type: 'bank', currency: 'CNY', balance: 50000.00 },
  { id: '2', name: '支付宝', type: 'alipay', currency: 'CNY', balance: 12500.50 },
  { id: '3', name: '中信证券', type: 'stock', currency: 'CNY', balance: 120000.00 },
];

const INITIAL_TRANSACTIONS = [
  { id: 't1', date: '2023-10-24', accountId: '2', type: 'expense', amount: 55.00, category: '餐饮', merchant: '瑞幸咖啡', description: '早咖啡', source: 'manual' },
  { id: 't2', date: '2023-10-23', accountId: '1', type: 'income', amount: 20000.00, category: '工资', merchant: '公司', description: '10月工资', source: 'manual' },
  { id: 't3', date: '2023-10-22', accountId: '3', type: 'investment', amount: 5000.00, category: '股票购买', merchant: '证券', description: '买入贵州茅台', source: 'mcp_import' },
];

const INITIAL_HOLDINGS = [
  { id: 'h1', accountId: '3', assetType: 'stock', symbol: '600519', name: '贵州茅台', quantity: 100, costBasis: 175000.00, price: 1820.50 },
  { id: 'h2', accountId: '3', assetType: 'fund', symbol: '000651', name: '格力电器', quantity: 500, costBasis: 18000.00, price: 34.20 },
];

const INVESTMENT_SETTINGS = {
  monthly_income: 30000,
  monthly_expense: 8000,
  cash_reserve_target: 50000,
  buffer_reserve_target: 100000,
  base_investment_amount: 5000,
  frequency: 'monthly',
  allocation: [
    { key: 'equity', ratio: 0.6 },
    { key: 'bond', ratio: 0.3 },
    { key: 'gold', ratio: 0.1 },
  ]
};

// --- 组件部分 ---

const Card = ({ title, children, extra }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
    {(title || extra) && (
      <div className="px-6 py-4 border-bottom border-slate-100 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        {extra}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const StatCard = ({ label, value, trend, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      {trend && (
        <p className={`text-xs mt-2 flex items-center ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% <span className="text-slate-400 ml-1">较上月</span>
        </p>
      )}
    </div>
    <div className={`p-3 rounded-lg ${colorClass}`}>
      <Icon size={20} className="text-white" />
    </div>
  </div>
);

// --- 页面: Dashboard ---
const Dashboard = ({ setActivePage }) => {
  const chartData = [
    { name: '10-18', expense: 400, income: 0 },
    { name: '10-19', expense: 300, income: 0 },
    { name: '10-20', expense: 200, income: 2400 },
    { name: '10-21', expense: 1200, income: 0 },
    { name: '10-22', expense: 500, income: 0 },
    { name: '10-23', expense: 100, income: 20000 },
    { name: '10-24', expense: 55, income: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="总资产" value={`¥ ${formatAmount(182500)}`} trend={2.5} icon={Wallet} colorClass="bg-blue-600" />
        <StatCard label="本月支出" value={`¥ ${formatAmount(2755)}`} trend={-12.3} icon={ArrowLeftRight} colorClass="bg-rose-500" />
        <StatCard label="本月收入" value={`¥ ${formatAmount(20000)}`} trend={0} icon={TrendingUp} colorClass="bg-emerald-500" />
        <StatCard label="持仓收益率" value={`15.2%`} trend={5.2} icon={PieChart} colorClass="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="收支趋势">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={{r: 4}} />
                  <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={{r: 4}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="最新交易" extra={<button onClick={() => setActivePage('transactions')} className="text-sm text-blue-600 hover:underline">查看全部</button>}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 px-2">日期</th>
                    <th className="pb-3 px-2">分类</th>
                    <th className="pb-3 px-2">账户</th>
                    <th className="pb-3 px-2 text-right">金额</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {INITIAL_TRANSACTIONS.slice(0, 3).map(t => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-3 px-2 text-sm text-slate-600">{t.date}</td>
                      <td className="py-3 px-2 text-sm font-medium text-slate-800">{t.category}</td>
                      <td className="py-3 px-2 text-sm text-slate-500">{INITIAL_ACCOUNTS.find(a => a.id === t.accountId)?.name}</td>
                      <td className={`py-3 px-2 text-sm font-bold text-right ${t.type === 'expense' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {t.type === 'expense' ? '-' : '+'}{formatAmount(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="定投系统状态">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600">当前阶段</span>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">阶段 2: 缓冲池建设</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">缓冲池目标: ¥100,000</span>
                  <span className="text-slate-800 font-semibold">62%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">待执行指令</h4>
                <div className="flex items-start gap-3">
                  <div className="mt-1"><AlertCircle size={16} className="text-amber-500" /></div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">定投补充：¥5,000</p>
                    <p className="text-xs text-slate-500 mt-1">请从 [招商银行] 转出至 [中信证券] 买入基准配比。</p>
                    <button className="mt-2 text-xs bg-white border border-slate-300 px-3 py-1 rounded hover:bg-slate-50">标记已执行</button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="资产分布">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={[
                      { name: '现金', value: 62500 },
                      { name: '股票', value: 120000 },
                    ]}
                    cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value"
                  >
                    {COLORS.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// --- 页面: 账户列表 ---
const AccountsPage = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">账户管理</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus size={18} /> 创建账户
        </button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-4 px-4">账户名称</th>
                <th className="pb-4 px-4">类型</th>
                <th className="pb-4 px-4">币种</th>
                <th className="pb-4 px-4 text-right">余额</th>
                <th className="pb-4 px-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {INITIAL_ACCOUNTS.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 text-sm font-medium text-slate-800">{a.name}</td>
                  <td className="py-4 px-4 text-sm text-slate-500">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs capitalize">{a.type}</span>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-500 font-mono">{a.currency}</td>
                  <td className="py-4 px-4 text-sm font-bold text-slate-900 text-right">{formatAmount(a.balance)}</td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="p-1 hover:text-blue-600 text-slate-400 transition-colors"><Edit2 size={16} /></button>
                      <button className="p-1 hover:text-rose-600 text-slate-400 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// --- 页面: 交易流水 ---
const TransactionsPage = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [filter, setFilter] = useState({ dateRange: 'this_month', account: 'all' });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">交易流水</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsImporting(true)}
            className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-200 transition-colors"
          >
            <Upload size={18} /> 导入账单
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <Plus size={18} /> 手动记账
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select className="bg-transparent text-sm border-none focus:ring-0 cursor-pointer text-slate-600">
            <option>本月</option>
            <option>上个月</option>
            <option>本年</option>
            <option>自定义范围...</option>
          </select>
        </div>
        <div className="h-4 w-px bg-slate-200 hidden md:block"></div>
        <select className="bg-transparent text-sm border-none focus:ring-0 cursor-pointer text-slate-600">
          <option>所有账户</option>
          {INITIAL_ACCOUNTS.map(a => <option key={a.id}>{a.name}</option>)}
        </select>
        <div className="h-4 w-px bg-slate-200 hidden md:block"></div>
        <select className="bg-transparent text-sm border-none focus:ring-0 cursor-pointer text-slate-600">
          <option>所有类型</option>
          <option>支出</option>
          <option>收入</option>
          <option>投资</option>
          <option>转账</option>
        </select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-4 px-4">日期</th>
                <th className="pb-4 px-4">账户</th>
                <th className="pb-4 px-4">分类 / 备注</th>
                <th className="pb-4 px-4">商户</th>
                <th className="pb-4 px-4 text-right">金额</th>
                <th className="pb-4 px-4 text-center">来源</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {INITIAL_TRANSACTIONS.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 group">
                  <td className="py-4 px-4 text-sm text-slate-500">{t.date}</td>
                  <td className="py-4 px-4 text-sm text-slate-600">{INITIAL_ACCOUNTS.find(a => a.id === t.accountId)?.name}</td>
                  <td className="py-4 px-4">
                    <p className="text-sm font-medium text-slate-800">{t.category}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600">{t.merchant}</td>
                  <td className={`py-4 px-4 text-sm font-bold text-right ${t.type === 'expense' ? 'text-rose-600' : t.type === 'income' ? 'text-emerald-600' : 'text-blue-600'}`}>
                    {t.type === 'expense' ? '-' : '+'}{formatAmount(t.amount)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold ${t.source === 'manual' ? 'border-slate-200 text-slate-400' : 'border-blue-100 text-blue-500'}`}>
                      {t.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex justify-between items-center text-sm text-slate-500 px-2">
          <span>显示第 1-3 条，共 3 条</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-200 rounded disabled:opacity-50" disabled>上一页</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
            <button className="px-3 py-1 border border-slate-200 rounded disabled:opacity-50" disabled>下一页</button>
          </div>
        </div>
      </Card>

      {/* 导入预览模拟弹窗 */}
      {isImporting && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">导入账单预览</h3>
                <p className="text-xs text-slate-500 mt-1">已成功解析文件: <code className="bg-slate-200 px-1 rounded">alipay_202310.csv</code> (共 42 行)</p>
              </div>
              <button onClick={() => setIsImporting(false)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-4 flex gap-4">
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium">识别成功: 38 行</div>
                <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium">重复怀疑: 2 行</div>
                <div className="bg-rose-50 text-rose-700 px-4 py-2 rounded-lg text-sm font-medium">映射失败: 2 行</div>
              </div>
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-500 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">行号</th>
                    <th className="p-2 text-left">日期</th>
                    <th className="p-2 text-left">分类 (原始 {'->'} 映射)</th>
                    <th className="p-2 text-right">金额</th>
                    <th className="p-2 text-left">状态/备注</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-white">
                    <td className="p-2">1</td>
                    <td className="p-2">2023-10-24</td>
                    <td className="p-2">饮食 {'->'} <span className="text-blue-600 font-bold">餐饮</span></td>
                    <td className="p-2 text-right">55.00</td>
                    <td className="p-2 text-emerald-600 font-medium">准备就绪</td>
                  </tr>
                  <tr className="bg-amber-50">
                    <td className="p-2">2</td>
                    <td className="p-2">2023-10-23</td>
                    <td className="p-2">转账 {'->'} <span className="text-blue-600 font-bold">转账</span></td>
                    <td className="p-2 text-right">1000.00</td>
                    <td className="p-2 text-amber-600 font-medium flex items-center gap-1"><AlertCircle size={12} /> 疑似与 ID:t2 重复</td>
                  </tr>
                  <tr className="bg-rose-50">
                    <td className="p-2">3</td>
                    <td className="p-2">2023-10-23</td>
                    <td className="p-2">其他 {'->'} <span className="text-rose-600">无法自动映射</span></td>
                    <td className="p-2 text-right">2.50</td>
                    <td className="p-2 text-rose-600 font-medium">请手动指定分类</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsImporting(false)} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-white transition-all font-medium">取消</button>
              <button onClick={() => setIsImporting(false)} className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all font-medium">确认导入 38 条</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 页面: 持仓资产 ---
const HoldingsPage = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">持仓明细</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus size={18} /> 新增持仓
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 uppercase font-bold mb-1">总持仓成本</p>
          <p className="text-xl font-bold text-slate-800">¥ {formatAmount(193000)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 uppercase font-bold mb-1">当前总市值</p>
          <p className="text-xl font-bold text-slate-800">¥ {formatAmount(199150)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 uppercase font-bold mb-1">累计浮盈</p>
          <p className="text-xl font-bold text-emerald-600">+¥ {formatAmount(6150)} (3.18%)</p>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-4 px-4">资产/代码</th>
                <th className="pb-4 px-4">数量</th>
                <th className="pb-4 px-4 text-right">成本总额</th>
                <th className="pb-4 px-4 text-right">当前价格</th>
                <th className="pb-4 px-4 text-right">当前市值</th>
                <th className="pb-4 px-4 text-right">收益率</th>
                <th className="pb-4 px-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {INITIAL_HOLDINGS.map(h => {
                const marketValue = h.quantity * h.price;
                const profit = marketValue - h.costBasis;
                const profitRate = (profit / h.costBasis) * 100;
                return (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="py-4 px-4">
                      <p className="text-sm font-bold text-slate-800">{h.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{h.symbol} · {h.assetType}</p>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600 font-medium">{h.quantity}</td>
                    <td className="py-4 px-4 text-sm text-right text-slate-600">{formatAmount(h.costBasis)}</td>
                    <td className="py-4 px-4 text-sm text-right text-slate-600 font-mono">{h.price.toFixed(2)}</td>
                    <td className="py-4 px-4 text-sm text-right font-bold text-slate-900">{formatAmount(marketValue)}</td>
                    <td className={`py-4 px-4 text-sm text-right font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {profit >= 0 ? '+' : ''}{profitRate.toFixed(2)}%
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button className="text-slate-400 hover:text-blue-600"><ExternalLink size={16} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// --- 页面: 定投系统 ---
const InvestmentPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">定投纪律系统</h2>
        <button className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-200 transition-colors">
          <Settings size={18} /> 配置规则
        </button>
      </div>

      {/* 阶段指示器 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {[
          { id: 1, title: '阶段 1: 活钱储蓄', desc: '覆盖 6 个月支出 (¥50k)', status: 'complete' },
          { id: 2, title: '阶段 2: 缓冲建设', desc: '大额开销备用金 (¥100k)', status: 'active' },
          { id: 3, title: '阶段 3: 指数定投', desc: '长期资产配置', status: 'pending' },
        ].map((s, idx) => (
          <div key={s.id} className={`p-6 border-r border-slate-200 last:border-0 relative ${s.status === 'active' ? 'bg-blue-50' : 'bg-white'}`}>
            {s.status === 'complete' && <CheckCircle2 className="absolute top-4 right-4 text-emerald-500" size={20} />}
            <div className={`text-xs font-bold uppercase mb-2 ${s.status === 'active' ? 'text-blue-600' : 'text-slate-400'}`}>
              Level 0{s.id}
            </div>
            <h4 className={`text-lg font-bold mb-1 ${s.status === 'pending' ? 'text-slate-400' : 'text-slate-800'}`}>{s.title}</h4>
            <p className="text-sm text-slate-500">{s.desc}</p>
            {s.status === 'active' && (
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-full w-[62%]"></div>
                </div>
                <span className="text-xs font-bold text-blue-700">62%</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card title="纪律参数汇总">
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">月度预计收入</span>
                <span className="text-sm font-bold text-slate-800">¥ 30,000.00</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">月度生存支出</span>
                <span className="text-sm font-bold text-slate-800">¥ 8,000.00</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50 text-emerald-600">
                <span className="text-sm">月度定投额 (基准)</span>
                <span className="text-sm font-bold">¥ 5,000.00</span>
              </div>
              <div className="mt-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">资产配比目标</h4>
                <div className="space-y-3">
                  {[
                    { label: '权益类 (股票/基金)', ratio: '60%', color: 'bg-blue-500' },
                    { label: '固定收益 (债券)', ratio: '30%', color: 'bg-emerald-500' },
                    { label: '硬资产 (黄金)', ratio: '10%', color: 'bg-amber-500' },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600">{item.label}</span>
                        <span className="font-bold text-slate-800">{item.ratio}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`${item.color} h-full`} style={{ width: item.ratio }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card title="行动指令清单" extra={<span className="text-xs text-slate-400 italic">基于当前阶段自动生成</span>}>
            <div className="space-y-4">
              {[
                { id: 1, date: '2023-10-24', stage: 'Stage 2', instruction: '缓冲桶注资：由于本月工资已发放，请手动转账 ¥5,000 至缓冲账户。', executed: false },
                { id: 2, date: '2023-10-15', stage: 'Stage 2', instruction: '月度支出核对：检查本月支出是否超出 ¥8,000 阈值。', executed: true },
                { id: 3, date: '2023-10-01', stage: 'Stage 2', instruction: '基准定投执行：由于阶段 2 未达标，本月仅执行基准定投 ¥5,000，暂不触发 Boost。', executed: true },
              ].map(item => (
                <div key={item.id} className={`p-4 rounded-xl border flex gap-4 transition-all ${item.executed ? 'bg-slate-50 border-slate-100' : 'bg-white border-blue-100 shadow-sm shadow-blue-50'}`}>
                  <div className="mt-1">
                    {item.executed ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 size={16} />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-blue-200 flex items-center justify-center text-blue-400">
                        <History size={14} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">{item.date} · {item.stage}</span>
                      {item.executed ? (
                        <span className="text-[10px] text-emerald-600 font-bold uppercase">已执行</span>
                      ) : (
                        <span className="text-[10px] text-blue-600 font-bold uppercase underline cursor-pointer">立即处理</span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 font-medium ${item.executed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {item.instruction}
                    </p>
                    {!item.executed && (
                      <div className="mt-3 flex gap-2">
                        <button className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors">标记已执行</button>
                        <button className="text-slate-500 text-xs px-3 py-1.5 hover:underline">查看相关账户</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 border border-dashed border-slate-300 rounded-xl text-slate-400 text-sm hover:border-slate-400 hover:text-slate-500 transition-all">
              查看历史指令集
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
};

// --- 页面: 报表分析 ---
const ReportsPage = () => {
  const pieData = [
    { name: '餐饮', value: 2400 },
    { name: '住房', value: 4500 },
    { name: '交通', value: 1200 },
    { name: '娱乐', value: 800 },
    { name: '购物', value: 1800 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">报表分析</h2>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50">
            <Download size={18} /> 导出 PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="月度收支趋势 (近 6 个月)">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { month: '5月', income: 28000, expense: 9000 },
                { month: '6月', income: 32000, expense: 8500 },
                { month: '7月', income: 30000, expense: 12000 },
                { month: '8月', income: 30000, expense: 7800 },
                { month: '9月', income: 30000, expense: 9200 },
                { month: '10月', income: 20000, expense: 2755 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" name="收入" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="支出" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="支出分类占比">
          <div className="h-72 flex items-center">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex justify-between items-center px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-sm text-slate-600">{d.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">¥ {d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="总资产变化曲线 (年度)" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { date: '01', val: 120000 },
                { date: '02', val: 125000 },
                { date: '03', val: 118000 },
                { date: '04', val: 132000 },
                { date: '05', val: 145000 },
                { date: '06', val: 152000 },
                { date: '07', val: 168000 },
                { date: '08', val: 175000 },
                { date: '09', val: 172000 },
                { date: '10', val: 182500 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} hide />
                <Tooltip />
                <Line type="stepAfter" dataKey="val" name="资产总额" stroke="#3b82f6" strokeWidth={3} dot={{r: 6}} fillOpacity={1} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- 主布局 ---
export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // 模拟首屏加载
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [activePage]);

  const navItems = [
    { id: 'dashboard', label: '首页概览', icon: LayoutDashboard },
    { id: 'accounts', label: '账户管理', icon: Wallet },
    { id: 'transactions', label: '交易流水', icon: ArrowLeftRight },
    { id: 'holdings', label: '资产持仓', icon: TrendingUp },
    { id: 'investment', label: '定投纪律', icon: CheckCircle2 },
    { id: 'reports', label: '报表中心', icon: PieChart },
  ];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>)}
          </div>
          <div className="w-full h-96 bg-slate-200 rounded-xl"></div>
        </div>
      );
    }

    switch(activePage) {
      case 'dashboard': return <Dashboard setActivePage={setActivePage} />;
      case 'accounts': return <AccountsPage />;
      case 'transactions': return <TransactionsPage />;
      case 'holdings': return <HoldingsPage />;
      case 'investment': return <InvestmentPage />;
      case 'reports': return <ReportsPage />;
      default: return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* 侧边栏 */}
      <aside className={`bg-white border-r border-slate-200 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col z-20`}>
        <div className="p-6 flex items-center gap-3 overflow-hidden">
          <div className="bg-blue-600 p-2 rounded-lg shrink-0">
            <TrendingUp size={20} className="text-white" />
          </div>
          {isSidebarOpen && <span className="font-black text-xl tracking-tight text-blue-900 whitespace-nowrap">FINANCE V1</span>}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activePage === item.id ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <item.icon size={20} className="shrink-0" />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:text-rose-600 transition-colors">
            <LogOut size={20} className="shrink-0" />
            {isSidebarOpen && <span className="font-medium text-sm">退出登录</span>}
          </button>
        </div>
      </aside>

      {/* 主区域 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 顶栏 */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
              {isSidebarOpen ? <Menu size={20} /> : <ChevronRight size={20} />}
            </button>
            <h1 className="text-lg font-bold text-slate-800 capitalize">{navItems.find(i => i.id === activePage)?.label}</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-400 uppercase">当前时段</span>
              <span className="text-sm font-bold text-slate-800">2023年10月</span>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
            <div className="flex items-center gap-3 p-1.5 pl-3 border border-slate-200 rounded-full hover:bg-slate-50 cursor-pointer">
              <span className="text-sm font-bold text-slate-700">Claude User</span>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <User size={18} />
              </div>
            </div>
          </div>
        </header>

        {/* 内容滚动区 */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
'use client'
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ShoppingCart, DollarSign, Package, Users, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [animatedValues, setAnimatedValues] = useState([0, 0, 0, 0]);
  const [hoveredCard, setHoveredCard] = useState(null);

  const stats = [
    { 
      title: 'Total Orders', 
      value: 22, 
      change: '+12%', 
      trend: 'up',
      icon: ShoppingCart,
      color: 'from-purple-500 to-purple-600',
      bgGlow: 'bg-purple-500/10',
      textColor: 'text-purple-600'
    },
    { 
      title: 'Total Revenue', 
      value: 22840, 
      prefix: '₹',
      change: '+8%', 
      trend: 'up',
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      bgGlow: 'bg-emerald-500/10',
      textColor: 'text-emerald-600'
    },
    { 
      title: 'Products', 
      value: 22, 
      change: '+3', 
      trend: 'up',
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      bgGlow: 'bg-blue-500/10',
      textColor: 'text-blue-600'
    },
    { 
      title: 'Customers', 
      value: 22, 
      change: '+5', 
      trend: 'up',
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      bgGlow: 'bg-orange-500/10',
      textColor: 'text-orange-600'
    },
  ];

  const recentOrders = [
    { id: '#1042', customer: 'Sandhya', product: 'Chocolate Cake', status: 'Delivered', amount: '₹805', time: '2m ago', statusColor: 'emerald', icon: CheckCircle },
    { id: '#1041', customer: 'Anand', product: 'Sourdough Loaf', status: 'Processing', amount: '₹120', time: '15m ago', statusColor: 'blue', icon: Clock },
    { id: '#1040', customer: 'Arjun', product: 'Cinnamon Rolls', status: 'Delivered', amount: '₹280', time: '1h ago', statusColor: 'emerald', icon: CheckCircle },
    
  ];

  // Animate counter values
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    stats.forEach((stat, index) => {
      let currentStep = 0;
      const increment = stat.value / steps;

      const timer = setInterval(() => {
        currentStep++;
        setAnimatedValues(prev => {
          const newValues = [...prev];
          newValues[index] = Math.min(Math.floor(increment * currentStep), stat.value);
          return newValues;
        });

        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, stepDuration);
    });
  }, []);

  const getStatusColor = (color) => {
    const colors = {
      emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      {/* Header */}
      <div className="mb-8 animate-slideDown">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
              Dashboard Overview
            </h1>
            <p className="text-slate-600">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
              <button className="relative px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              className="group relative animate-slideUp"
              style={{ animationDelay: `${i * 100}ms` }}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Glow effect */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.color} rounded-3xl blur opacity-20 group-hover:opacity-40 transition-all duration-500`}></div>
              
              {/* Card */}
              <div className="relative bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-2xl ${stat.bgGlow} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>

                {/* Content */}
                <p className="text-slate-500 text-sm font-medium mb-2">{stat.title}</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-4xl font-bold bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    {stat.prefix}{animatedValues[i].toLocaleString()}
                  </h3>
                  <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${stat.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="text-sm font-semibold">{stat.change}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: hoveredCard === i ? '100%' : '70%' }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="animate-slideUp" style={{ animationDelay: '400ms' }}>
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 rounded-3xl blur opacity-10"></div>
          <div className="relative bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-1">
                  Recent Orders
                </h2>
                <p className="text-slate-500 text-sm">Track your latest customer orders</p>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 rounded-xl font-medium text-slate-700 transition-all duration-300 hover:shadow-lg">
                View All
              </button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-blue-50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Order ID</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Customer</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Product</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Amount</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((order, i) => {
                    const StatusIcon = order.icon;
                    return (
                      <tr 
                        key={i} 
                        className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300 group animate-fadeIn"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <td className="py-4 px-6">
                          <span className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                            {order.id}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold shadow-lg">
                              {order.customer.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-700">{order.customer}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-600">{order.product}</td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-slate-800">{order.amount}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm border ${getStatusColor(order.statusColor)} transition-all duration-300 group-hover:shadow-md`}>
                            <StatusIcon className="w-4 h-4" />
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-slate-500 text-sm flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {order.time}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-slideDown {
          animation: slideDown 0.6s ease-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
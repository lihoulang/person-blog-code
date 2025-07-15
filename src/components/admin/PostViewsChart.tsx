'use client';

import { useEffect, useState } from 'react';

export default function PostViewsChart() {
  // 模拟数据
  const [chartData, setChartData] = useState<{ date: string; count: number }[]>([]);
  
  // 生成过去30天的模拟数据
  useEffect(() => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // 生成随机阅读量，但保持一定的趋势
      const baseCount = 10 + Math.floor(Math.random() * 20);
      const trendFactor = Math.min(1.5, 1 + (30 - i) / 100); // 随时间略微增长
      const count = Math.floor(baseCount * trendFactor);
      
      data.push({
        date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        count
      });
    }
    
    setChartData(data);
  }, []);
  
  // 找出最大值，用于计算百分比高度
  const maxCount = Math.max(...chartData.map(item => item.count), 1);
  
  return (
    <div className="h-64">
      {chartData.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-400">
          加载中...
        </div>
      ) : (
        <div className="flex items-end h-full space-x-1">
          {chartData.map((item, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center flex-1"
              title={`${item.date}: ${item.count} 次阅读`}
            >
              <div 
                className="w-full bg-blue-500 rounded-t"
                style={{ 
                  height: `${(item.count / maxCount) * 100}%`,
                  minHeight: '1px'
                }}
              />
              {index % 5 === 0 && (
                <span className="text-xs text-gray-500 mt-1 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                  {item.date}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 text-center text-sm text-gray-500">
        过去30天阅读趋势
      </div>
    </div>
  );
} 
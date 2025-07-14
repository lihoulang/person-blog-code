import fs from 'fs';
import path from 'path';
import { 
  ChangelogChange,
  ChangelogEntry,
  ChangelogMonth,
  ChangelogYear 
} from '@/types/changelog';

// 获取更新日志内容
export async function getChangelogEntries(): Promise<ChangelogYear[]> {
  try {
    // 日志文件路径
    const changelogFilePath = path.join(process.cwd(), 'data/changelog.json');
    
    // 检查文件是否存在
    if (!fs.existsSync(changelogFilePath)) {
      // 如果文件不存在，创建初始数据
      return createInitialChangelog();
    }
    
    // 读取文件内容
    const fileContents = fs.readFileSync(changelogFilePath, 'utf8');
    const changelogData = JSON.parse(fileContents) as ChangelogYear[];
    
    return changelogData;
  } catch (error) {
    console.error('获取更新日志失败:', error);
    // 发生错误时返回初始数据
    return createInitialChangelog();
  }
}

// 添加新的更新日志条目
export async function addChangelogEntry(entry: {
  title: string;
  description: string;
  changes?: ChangelogChange[];
  author?: string;
}): Promise<boolean> {
  try {
    // 确保data目录存在
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    
    // 日志文件路径
    const changelogFilePath = path.join(dataDir, 'changelog.json');
    
    // 获取当前日志数据
    let changelog: ChangelogYear[];
    
    if (fs.existsSync(changelogFilePath)) {
      const fileContents = fs.readFileSync(changelogFilePath, 'utf8');
      changelog = JSON.parse(fileContents);
    } else {
      changelog = [];
    }
    
    // 获取当前日期
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthNames = [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    
    // 创建新条目
    const newEntry: ChangelogEntry = {
      date: now.toISOString().split('T')[0], // YYYY-MM-DD 格式
      ...entry
    };
    
    // 查找或创建当年的条目
    let yearEntry = changelog.find(y => y.year === currentYear);
    if (!yearEntry) {
      yearEntry = {
        year: currentYear,
        months: []
      };
      changelog.push(yearEntry);
    }
    
    // 查找或创建当月的条目
    let monthEntry = yearEntry.months.find(m => m.month === currentMonth);
    if (!monthEntry) {
      monthEntry = {
        month: currentMonth,
        monthName: monthNames[currentMonth],
        entries: []
      };
      yearEntry.months.push(monthEntry);
      
      // 按月份排序
      yearEntry.months.sort((a, b) => b.month - a.month);
    }
    
    // 添加新条目到当月列表
    monthEntry.entries.unshift(newEntry);
    
    // 按年份排序（降序）
    changelog.sort((a, b) => b.year - a.year);
    
    // 写入文件
    fs.writeFileSync(
      changelogFilePath,
      JSON.stringify(changelog, null, 2)
    );
    
    return true;
  } catch (error) {
    console.error('添加更新日志失败:', error);
    return false;
  }
}

// 创建初始更新日志数据
function createInitialChangelog(): ChangelogYear[] {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];
  
  // 创建初始数据
  const initialChangelog: ChangelogYear[] = [
    {
      year: year,
      months: [
        {
          month: month,
          monthName: monthNames[month],
          entries: [
            {
              date: currentDate.toISOString().split('T')[0],
              title: '网站上线',
              description: '个人博客网站正式上线运行',
              changes: [
                {
                  type: 'added',
                  text: '基本博客功能'
                },
                {
                  type: 'added',
                  text: '用户认证系统'
                },
                {
                  type: 'added',
                  text: '更新日志页面'
                }
              ],
              author: 'Admin'
            }
          ]
        }
      ]
    }
  ];
  
  // 保存初始数据
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    
    fs.writeFileSync(
      path.join(dataDir, 'changelog.json'),
      JSON.stringify(initialChangelog, null, 2)
    );
  } catch (error) {
    console.error('创建初始更新日志失败:', error);
  }
  
  return initialChangelog;
} 
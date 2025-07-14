// 更新日志的变更类型
export interface ChangelogChange {
  type: 'added' | 'improved' | 'fixed' | 'removed';
  text: string;
}

// 更新日志条目
export interface ChangelogEntry {
  date: string;
  title: string;
  description: string;
  changes?: ChangelogChange[];
  author?: string;
}

// 月份条目
export interface ChangelogMonth {
  month: number;
  monthName: string;
  entries: ChangelogEntry[];
}

// 年份条目
export interface ChangelogYear {
  year: number;
  months: ChangelogMonth[];
} 
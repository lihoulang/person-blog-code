# 个人博客系统 - API文档

本文档详细介绍了个人博客系统的RESTful API。这些API允许您在网站上创建、读取、更新和删除博客文章。

## 基础URL

所有API的基础URL为：`/api`

## 文章管理API

### 获取所有文章

获取所有博客文章的列表。

- **URL**: `/api/mdx`
- **方法**: `GET`
- **请求参数**: 无
- **成功响应**: 
  ```json
  [
    {
      "slug": "hello-world",
      "title": "欢迎来到我的博客",
      "date": "2023-01-01",
      "description": "这是我的第一篇博客文章",
      "tags": ["介绍", "博客"]
    },
    // 更多文章...
  ]
  ```
- **错误响应**:
  ```json
  {
    "error": "获取文章列表失败"
  }
  ```

### 创建新文章

创建一篇新的博客文章。

- **URL**: `/api/mdx`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "title": "文章标题",
    "description": "文章描述",
    "content": "# 文章内容\n\n这是文章的正文部分...",
    "tags": ["标签1", "标签2"]
  }
  ```
- **成功响应**: 
  ```json
  {
    "slug": "wen-zhang-biao-ti",
    "title": "文章标题",
    "date": "2023-05-15",
    "description": "文章描述",
    "tags": ["标签1", "标签2"],
    "message": "文章创建成功"
  }
  ```
- **错误响应**:
  ```json
  {
    "error": "创建文章失败"
  }
  ```

### 获取单篇文章

获取单篇博客文章的详细内容。

- **URL**: `/api/mdx/:slug`
- **方法**: `GET`
- **URL参数**: 
  - `slug`: 文章的唯一标识符
- **成功响应**: 
  ```json
  {
    "slug": "hello-world",
    "title": "欢迎来到我的博客",
    "date": "2023-01-01",
    "description": "这是我的第一篇博客文章",
    "content": "# 欢迎来到我的博客\n\n这是我的第一篇博客文章...",
    "tags": ["介绍", "博客"]
  }
  ```
- **错误响应**:
  ```json
  {
    "error": "文章不存在"
  }
  ```

### 更新文章

更新现有的博客文章。

- **URL**: `/api/mdx/:slug`
- **方法**: `PUT`
- **URL参数**: 
  - `slug`: 文章的唯一标识符
- **请求体**:
  ```json
  {
    "title": "更新的标题",
    "description": "更新的描述",
    "content": "更新的内容",
    "tags": ["更新的标签"]
  }
  ```
- **成功响应**: 
  ```json
  {
    "slug": "hello-world",
    "title": "更新的标题",
    "description": "更新的描述",
    "content": "更新的内容",
    "tags": ["更新的标签"],
    "message": "文章更新成功"
  }
  ```
- **错误响应**:
  ```json
  {
    "error": "文章不存在"
  }
  ```

### 删除文章

删除博客文章。

- **URL**: `/api/mdx/:slug`
- **方法**: `DELETE`
- **URL参数**: 
  - `slug`: 文章的唯一标识符
- **成功响应**: 
  ```json
  {
    "message": "文章删除成功",
    "slug": "hello-world"
  }
  ```
- **错误响应**:
  ```json
  {
    "error": "文章不存在"
  }
  ```

## 使用示例

### 创建文章示例

使用fetch API创建新文章：

```javascript
async function createPost() {
  const response = await fetch('/api/mdx', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: '使用Next.js构建个人博客',
      description: '学习如何使用Next.js和MDX构建个人博客系统',
      content: '# 使用Next.js构建个人博客\n\n在这篇文章中，我们将学习如何使用Next.js和MDX构建一个现代化的个人博客系统...',
      tags: ['Next.js', 'React', 'MDX', '教程']
    }),
  });
  
  const data = await response.json();
  console.log(data);
}
```

### 获取所有文章示例

```javascript
async function getAllPosts() {
  const response = await fetch('/api/mdx');
  const posts = await response.json();
  console.log(posts);
}
```

## 错误码

- `400`: 请求参数不正确或缺失
- `404`: 请求的资源不存在
- `409`: 资源冲突（如尝试创建已存在的文章）
- `500`: 服务器内部错误 